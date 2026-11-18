const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'fairseat.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance concurrency
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      total_seats INTEGER NOT NULL,
      available_seats INTEGER NOT NULL,
      registration_start INTEGER NOT NULL,
      registration_end INTEGER NOT NULL,
      status TEXT DEFAULT 'open', -- 'upcoming', 'open', 'closed'
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      token TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      seat_number INTEGER,
      status TEXT NOT NULL, -- 'confirmed', 'waitlisted', 'cancelled'
      idempotency_key TEXT NOT NULL,
      confirmed_at INTEGER,
      created_at INTEGER NOT NULL,
      UNIQUE(event_id, user_id),
      UNIQUE(event_id, idempotency_key)
    );

    CREATE TABLE IF NOT EXISTS waitlist (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      rank INTEGER NOT NULL,
      referral_score INTEGER DEFAULT 0,
      status TEXT DEFAULT 'waiting', -- 'waiting', 'promoted', 'cancelled'
      created_at INTEGER NOT NULL,
      UNIQUE(event_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS referrals (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      referrer_user_id TEXT NOT NULL,
      referred_user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      UNIQUE(event_id, referred_user_id)
    );

    CREATE TABLE IF NOT EXISTS idempotency_cache (
      key TEXT PRIMARY KEY,
      response_data TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT,
      action TEXT NOT NULL,
      details TEXT,
      created_at INTEGER NOT NULL
    );
  `);

  seedData();
}

function seedData() {
  const existingEvent = db.prepare('SELECT id FROM events WHERE id = ?').get('innovathon-2026');
  if (!existingEvent) {
    const now = Date.now();
    // Default event with 500 total seats (or 50 for quick demo, let's set 100 for interactive demo with 500 capacity scale)
    const totalSeats = 50;
    db.prepare(`
      INSERT INTO events (id, title, description, total_seats, available_seats, registration_start, registration_end, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'innovathon-2026',
      'Prasunex Innovathon 2026 - Prototype & Demo Round',
      'Live high-concurrency registration testbed. Only 50 exclusive finalist seats available.',
      totalSeats,
      totalSeats,
      now - 1000, // already open or ready
      now + (7 * 24 * 3600 * 1000),
      'open',
      now
    );

    // Seed mock demo users (like Asha, Ravi, Meera from slide 9)
    const seedUsers = [
      { id: 'user-asha', name: 'Asha Sharma', email: 'asha@innovathon.dev', token: 'token-asha-992' },
      { id: 'user-ravi', name: 'Ravi Kumar', email: 'ravi@innovathon.dev', token: 'token-ravi-443' },
      { id: 'user-meera', name: 'Meera Patel', email: 'meera@innovathon.dev', token: 'token-meera-712' },
      { id: 'user-shivam', name: 'Shivam Gupta', email: 'shivam@fairseat.dev', token: 'token-shivam-001' },
      { id: 'user-demo', name: 'Demo Candidate', email: 'candidate@college.edu', token: 'token-candidate-demo' }
    ];

    const insertUser = db.prepare('INSERT OR IGNORE INTO users (id, name, email, token, created_at) VALUES (?, ?, ?, ?, ?)');
    for (const u of seedUsers) {
      insertUser.run(u.id, u.name, u.email, u.token, now);
    }
  }
}

initSchema();

module.exports = {
  db,
  initSchema
};
