/**
 * High-Concurrency Spike Simulator
 * Simulates thousands of concurrent registration attempts hitting at the exact same millisecond.
 * Demonstrates Slides 1, 2, 8, 9, 12, 13 to judges with live telemetry.
 */
class SpikeSimulator {
  constructor(atomicGate, writeQueue) {
    this.gate = atomicGate;
    this.queue = writeQueue;
    this.isRunning = false;
  }

  async runSimulation({ eventId = 'innovathon-2026', totalUsers = 1000, duplicateRate = 0.15 }) {
    if (this.isRunning) {
      throw new Error('A simulation is already in progress.');
    }

    this.isRunning = true;
    const startTime = Date.now();
    const results = {
      totalRequests: totalUsers,
      confirmed: 0,
      waitlisted: 0,
      duplicatesBlocked: 0,
      oversold: 0,
      durationMs: 0,
      reqPerSec: 0,
      breakdown: []
    };

    try {
      // Generate synthetic requests with names & idempotency keys
      const requests = [];
      const userPool = [];

      for (let i = 1; i <= totalUsers; i++) {
        const isDuplicate = Math.random() < duplicateRate && userPool.length > 0;
        let userId, idempotencyKey, name;

        if (isDuplicate) {
          // Re-use an existing user and idempotency key to test slide 12 duplicate protection!
          const chosen = userPool[Math.floor(Math.random() * userPool.length)];
          userId = chosen.userId;
          idempotencyKey = chosen.idempotencyKey;
          name = chosen.name;
        } else {
          userId = `sim-user-${i}`;
          idempotencyKey = `idem-key-sim-${i}`;
          name = `Contestant #${i}`;
          userPool.push({ userId, idempotencyKey, name });
        }

        requests.push({ userId, idempotencyKey, name });
      }

      // Execute all concurrent requests in a burst using Promise.all
      const promises = requests.map(req => {
        return this.gate.claimSeat(eventId, req.userId, req.idempotencyKey, { name: req.name })
          .then(res => {
            if (res.isIdempotentReplay) {
              results.duplicatesBlocked++;
            } else if (res.status === 'confirmed') {
              results.confirmed++;
              // Enqueue write to background queue
              this.queue.enqueue('CONFIRM_SEAT', {
                ticketId: res.ticketId,
                eventId,
                userId: req.userId,
                seatNumber: res.seatNumber,
                idempotencyKey: req.idempotencyKey,
                confirmedAt: res.confirmedAt
              });
            } else if (res.status === 'waitlisted') {
              results.waitlisted++;
              this.queue.enqueue('ADD_WAITLIST', {
                ticketId: res.ticketId,
                eventId,
                userId: req.userId,
                rank: res.rank,
                createdAt: res.createdAt
              });
            }
            return res;
          });
      });

      const responses = await Promise.all(promises);

      const endTime = Date.now();
      results.durationMs = Math.max(1, endTime - startTime);
      results.reqPerSec = Math.round((totalUsers / (results.durationMs / 1000)));

      // Inspect final state
      const state = this.gate.getState(eventId);
      results.oversold = state.metrics.oversoldSeats; // Strictly 0
      results.finalState = state;
      results.sampleResponses = responses.slice(0, 10); // First 10 samples

      return results;
    } finally {
      this.isRunning = false;
    }
  }
}

module.exports = SpikeSimulator;
