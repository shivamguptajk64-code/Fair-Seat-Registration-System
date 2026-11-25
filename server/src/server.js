const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const { db } = require('./db');
const AtomicSeatGate = require('./atomicGate');
const WriteQueue = require('./queue');
const SpikeSimulator = require('./simulator');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// Broadcast helper for real-time WebSocket pushes
function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(message);
    }
  });
}

// Initialize Core Architecture Components
const atomicGate = new AtomicSeatGate(db);
const writeQueue = new WriteQueue(db, () => {
  broadcast({ type: 'SEAT_UPDATE', state: atomicGate.getState('innovathon-2026') });
});
const simulator = new SpikeSimulator(atomicGate, writeQueue);

// Simple In-Memory Rate Limiter & Bot Detection (Slide 10: Smart Bot Defense)
const rateLimitMap = new Map(); // ip/userId -> { count, resetTime }

function botGuardMiddleware(req, res, next) {
  const identifier = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.body.userId || 'guest';
  const now = Date.now();
  const userRate = rateLimitMap.get(identifier) || { count: 0, resetTime: now + 5000 };

  if (now > userRate.resetTime) {
    userRate.count = 1;
    userRate.resetTime = now + 5000;
  } else {
    userRate.count++;
  }
  rateLimitMap.set(identifier, userRate);

  // If more than 20 clicks in 5 seconds from same client, flag as suspicious script
  if (userRate.count > 20 && !req.body.isSimulated) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Suspicious high-frequency traffic detected.',
      captchaRequired: true
    });
  }
  next();
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Synced Server Time (Slide 10: Server time countdown)
app.get('/api/time', (req, res) => {
  res.json({
    serverTime: Date.now(),
    iso: new Date().toISOString()
  });
});

// 2. Event Details & Live Seat Stats
app.get('/api/events/:id', (req, res) => {
  const eventId = req.params.id;
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const gateState = atomicGate.getState(eventId);
  res.json({
    ...event,
    available_seats: gateState.availableSeats,
    confirmed_count: gateState.confirmedCount,
    waitlist_count: gateState.waitlistCount,
    metrics: gateState.metrics
  });
});

// 3. ATOMIC REGISTRATION ENDPOINT (Slide 4, 5, 6, 7, 8)
app.post('/api/events/:id/register', botGuardMiddleware, async (req, res) => {
  const eventId = req.params.id;
  const { userId, name, email, idempotencyKey, captchaAnswer } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter' });
  }

  // Save/upsert user record
  if (name && email) {
    db.prepare('INSERT OR IGNORE INTO users (id, name, email, token, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(userId, name, email, `tok-${userId}`, Date.now());
  }

  try {
    // 1 Microsecond Atomic Seat Claim!
    const claimResult = await atomicGate.claimSeat(eventId, userId, idempotencyKey, { name, email });

    // 2 If fresh claim (not idempotency replay), enqueue steady background write
    if (!claimResult.isIdempotentReplay) {
      if (claimResult.status === 'confirmed') {
        writeQueue.enqueue('CONFIRM_SEAT', {
          ticketId: claimResult.ticketId,
          eventId,
          userId,
          seatNumber: claimResult.seatNumber,
          idempotencyKey,
          confirmedAt: claimResult.confirmedAt
        });
      } else if (claimResult.status === 'waitlisted') {
        writeQueue.enqueue('ADD_WAITLIST', {
          ticketId: claimResult.ticketId,
          eventId,
          userId,
          rank: claimResult.rank,
          referralScore: claimResult.referralScore,
          createdAt: claimResult.createdAt
        });
      }
    }

    // 3 Notify all connected browser screens live
    broadcast({
      type: 'TICKET_PROCESSED',
      event: claimResult,
      state: atomicGate.getState(eventId)
    });

    res.json(claimResult);
  } catch (err) {
    console.error('Registration claim error:', err);
    res.status(500).json({ error: 'Server error during atomic seat allocation' });
  }
});

// 4. Ticket Status Check
app.get('/api/tickets/:id', (req, res) => {
  const ticket = db.prepare(`
    SELECT t.*, u.name as user_name, u.email as user_email, e.title as event_title 
    FROM tickets t
    JOIN users u ON t.user_id = u.id
    JOIN events e ON t.event_id = e.id
    WHERE t.id = ?
  `).get(req.params.id);

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  res.json(ticket);
});

// 5. CANCELLATION & AUTO-WAITLIST PROMOTION (Slide 9 & 10)
app.post('/api/tickets/cancel', async (req, res) => {
  const { eventId, userId } = req.body;
  if (!eventId || !userId) {
    return res.status(400).json({ error: 'Missing eventId or userId' });
  }

  const cancelResult = await atomicGate.cancelAndPromote(eventId, userId);
  if (!cancelResult.success) {
    return res.status(400).json(cancelResult);
  }

  // Enqueue DB persistence
  writeQueue.enqueue('CANCEL_TICKET', { eventId, userId });
  if (cancelResult.promotedUser) {
    writeQueue.enqueue('PROMOTE_WAITLIST', {
      ticketId: cancelResult.promotedUser.ticketId,
      eventId,
      userId: cancelResult.promotedUser.userId,
      seatNumber: cancelResult.promotedUser.seatNumber,
      confirmedAt: cancelResult.promotedUser.promotedAt
    });
  }

  broadcast({
    type: 'CANCELLATION_AND_PROMOTION',
    data: cancelResult,
    state: atomicGate.getState(eventId)
  });

  res.json({
    success: true,
    message: cancelResult.promotedUser
      ? `Ticket cancelled. Seat #${cancelResult.freedSeatNumber} automatically promoted Waitlist #1!`
      : `Ticket cancelled. Seat #${cancelResult.freedSeatNumber} returned to inventory.`
  });
});

// 6. REFERRAL BOOST (Slide 14: "Inviting friends moves them up the list")
app.post('/api/referrals/boost', (req, res) => {
  const { eventId, userId, referredEmail } = req.body;
  if (!eventId || !userId) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const boostResult = atomicGate.boostWaitlistWithReferral(eventId, userId);
  if (!boostResult.success) {
    return res.status(400).json(boostResult);
  }

  broadcast({
    type: 'WAITLIST_REORDER',
    eventId,
    boost: boostResult,
    state: atomicGate.getState(eventId)
  });

  res.json({
    success: true,
    message: `Friend invited! You jumped from #${boostResult.oldRank} to #${boostResult.newRank} on the waitlist!`,
    ...boostResult
  });
});

// 7. CONCURRENCY SPIKE SIMULATION (Slide 1, 8, 12, 13)
app.post('/api/simulate', async (req, res) => {
  const { eventId = 'innovathon-2026', totalUsers = 500, duplicateRate = 0.1 } = req.body;
  try {
    const results = await simulator.runSimulation({ eventId, totalUsers: Number(totalUsers), duplicateRate: Number(duplicateRate) });
    broadcast({ type: 'SIMULATION_COMPLETE', results });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Admin Telemetry & Metrics
app.get('/api/admin/metrics', (req, res) => {
  const eventId = req.query.eventId || 'innovathon-2026';
  const gateState = atomicGate.getState(eventId);
  const queueStats = writeQueue.getStats();

  const totalRegisteredDb = db.prepare('SELECT COUNT(*) as count FROM tickets WHERE event_id = ? AND status = ?').get(eventId, 'confirmed');
  const totalWaitlistDb = db.prepare('SELECT COUNT(*) as count FROM waitlist WHERE event_id = ? AND status = ?').get(eventId, 'waiting');

  res.json({
    gate: gateState,
    queue: queueStats,
    db: {
      confirmedTickets: totalRegisteredDb.count,
      waitingCount: totalWaitlistDb.count
    }
  });
});

// 9. Reset Demo Event for Fresh Judging Walkthrough
app.post('/api/admin/reset', (req, res) => {
  const { eventId = 'innovathon-2026', totalSeats = 50 } = req.body;
  atomicGate.resetEvent(eventId, totalSeats);

  // Reset database rows for this event
  db.prepare('DELETE FROM tickets WHERE event_id = ?').run(eventId);
  db.prepare('DELETE FROM waitlist WHERE event_id = ?').run(eventId);
  db.prepare('UPDATE events SET total_seats = ?, available_seats = ? WHERE id = ?').run(totalSeats, totalSeats, eventId);

  broadcast({
    type: 'EVENT_RESET',
    state: atomicGate.getState(eventId)
  });

  res.json({ success: true, message: 'Event reset to initial state with 0 claims.' });
});

// WebSocket Connection Handler
wss.on('connection', (ws) => {
  // Send current state on connection
  ws.send(JSON.stringify({
    type: 'INITIAL_STATE',
    state: atomicGate.getState('innovathon-2026'),
    serverTime: Date.now()
  }));
});

// Serve client production build if available (Unified Deployment for Render/Railway)
const path = require('path');
const fs = require('fs');
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`[FairSeat Server] Running on http://localhost:${PORT}`);
  console.log(`[FairSeat WebSocket] Listening for real-time ticket stream.`);
});
