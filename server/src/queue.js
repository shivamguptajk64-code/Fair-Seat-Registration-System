/**
 * Asynchronous Safe Write Queue (BullMQ / In-Memory Worker Pattern)
 * Slide 4, 5, 7, 12: Buffers database writes at a steady rate.
 * Prevents database crashes during sudden 50,000 req/sec spikes.
 */
class WriteQueue {
  constructor(db, broadcastCallback) {
    this.db = db;
    this.broadcastCallback = broadcastCallback || (() => {});
    this.queue = [];
    this.isProcessing = false;
    this.stats = {
      enqueuedTotal: 0,
      processedTotal: 0,
      retriesTotal: 0,
      errorsTotal: 0,
      currentQueueDepth: 0
    };

    // Precompiled DB Statements for lightning batch execution
    this.insertTicketStmt = this.db.prepare(`
      INSERT OR REPLACE INTO tickets (id, event_id, user_id, seat_number, status, idempotency_key, confirmed_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    this.insertWaitlistStmt = this.db.prepare(`
      INSERT OR REPLACE INTO waitlist (id, event_id, user_id, rank, referral_score, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    this.updateEventSeatsStmt = this.db.prepare(`
      UPDATE events SET available_seats = ? WHERE id = ?
    `);

    // Start background worker drain cycle (runs every 50ms)
    this.drainTimer = setInterval(() => this.processQueue(), 50);
  }

  enqueue(jobType, payload, retries = 3) {
    this.queue.push({
      id: `${jobType}-${Date.now()}-${Math.random()}`,
      jobType,
      payload,
      retriesLeft: retries,
      timestamp: Date.now()
    });

    this.stats.enqueuedTotal++;
    this.stats.currentQueueDepth = this.queue.length;
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    // Process in batches of up to 25 writes to avoid locking SQLite/Postgres
    const batchSize = Math.min(this.queue.length, 25);
    const batch = this.queue.splice(0, batchSize);
    this.stats.currentQueueDepth = this.queue.length;

    const runBatchTx = this.db.transaction((jobs) => {
      for (const job of jobs) {
        try {
          if (job.jobType === 'CONFIRM_SEAT') {
            const { ticketId, eventId, userId, seatNumber, idempotencyKey, confirmedAt } = job.payload;
            this.insertTicketStmt.run(
              ticketId,
              eventId,
              userId,
              seatNumber,
              'confirmed',
              idempotencyKey || `auto-${userId}`,
              confirmedAt || Date.now(),
              Date.now()
            );
          } else if (job.jobType === 'ADD_WAITLIST') {
            const { ticketId, eventId, userId, rank, referralScore, createdAt } = job.payload;
            this.insertWaitlistStmt.run(
              ticketId,
              eventId,
              userId,
              rank,
              referralScore || 0,
              'waiting',
              createdAt || Date.now()
            );
          } else if (job.jobType === 'CANCEL_TICKET') {
            const { eventId, userId } = job.payload;
            this.db.prepare(`UPDATE tickets SET status = 'cancelled' WHERE event_id = ? AND user_id = ?`).run(eventId, userId);
          } else if (job.jobType === 'PROMOTE_WAITLIST') {
            const { ticketId, eventId, userId, seatNumber, confirmedAt } = job.payload;
            // Mark waitlist as promoted
            this.db.prepare(`UPDATE waitlist SET status = 'promoted' WHERE event_id = ? AND user_id = ?`).run(eventId, userId);
            // Insert confirmed ticket
            this.insertTicketStmt.run(
              ticketId,
              eventId,
              userId,
              seatNumber,
              'confirmed',
              `promoted-${userId}-${seatNumber}`,
              confirmedAt || Date.now(),
              Date.now()
            );
          }
          this.stats.processedTotal++;
        } catch (err) {
          // Slide 12: Worker failure handling & retry mechanism
          console.error(`[FairSeat Queue] Job execution error:`, err.message);
          if (job.retriesLeft > 0) {
            this.stats.retriesTotal++;
            job.retriesLeft--;
            this.queue.push(job);
          } else {
            this.stats.errorsTotal++;
          }
        }
      }
    });

    try {
      runBatchTx(batch);
    } catch (txErr) {
      console.error('[FairSeat Queue] Transaction error:', txErr);
    } finally {
      this.isProcessing = false;
      this.stats.currentQueueDepth = this.queue.length;
      // Notify WebSocket clients of updated database state
      this.broadcastCallback();
    }
  }

  getStats() {
    return {
      ...this.stats,
      currentQueueDepth: this.queue.length
    };
  }
}

module.exports = WriteQueue;
