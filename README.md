# ⚡ FairSeat — High-Concurrency Fair Ticketing & Registration Engine

> **"A registration system that gives every seat to exactly one person, even when 50,000 people click at the same second."**  
> *Never oversell. Never duplicate. Always tell the truth.*  
> **Author:** Shivam Gupta | **Event:** Prasunex Innovathon 2026 (Prototype Development & Demonstration Round)

---

## 🎯 The Core Problem (Slide 2 & 3)

During major hackathons, competitive exams, workshop registrations, or ticket drops:
- **50,000 contestants** click "Register" at 10:00:00 AM.
- Only **50 to 500 seats** exist.
- **60 seconds** decide your platform's credibility and reputation.

### Four Ways Registration Breaks in Conventional Apps:
1. **Overbooking:** Two students click at the same millisecond when 1 seat is left. Both read `SELECT count < 500`, both see "Success", and one is turned away at the door.
2. **Duplicates:** Under slow mobile networks, users double-click or retry. The server writes duplicate rows and wastes seats.
3. **Crashes:** 50,000 queries hit the database at once, exhausting connection pools and throwing HTTP 504 Gateway Timeouts.
4. **Bots:** Automated scripts click within 5ms and hoard seats before students can even load the UI.

---

## 💡 The FairSeat Solution (Slide 4, 5, 6, 7)

FairSeat is built around three uncompromising engineering principles:

```
[ Browser / React UI ] 
        │ (1-Click Lock + Idempotency Key)
        ▼
[ Rate Limiter & Bot Guard ]
        │
        ▼
[ Atomic Gate (Redis / Memory) ] ── (99% answered in < 1ms: Confirmed / Waitlisted #Rank)
        │
        ▼ (Only Confirmed Claims Enqueued)
[ Async Steady Write Queue ]
        │ (Calm batches: 25 writes/tick)
        ▼
[ ACID Database (SQLite WAL / PostgreSQL) ]
   └── UNIQUE(event_id, user_id) 
   └── UNIQUE(event_id, seat_number)
```

1. **⚡ Decide Fast (Microsecond Atomic Gate):**
   - Operates as a single physical ticket window using atomic test-and-decrement primitives (`INCR`/`DECR`/atomic Lua).
   - Only the first claims decrement the counter to 0. All remaining 49,500 requests immediately receive their verified **Priority Waitlist Rank** (`Waitlisted #1`, `Waitlisted #2`).
   - 99% of requests are answered in sub-millisecond memory without ever touching or overloading the database!

2. **🔒 Write Safely (Async Safe Queue):**
   - The API acknowledges the ticket in microseconds and pushes write tasks to a steady background worker.
   - Strict database constraints (`UNIQUE(event_id, user_id)`) serve as the ultimate safety net.

3. **✅ Tell The Truth:**
   - Every candidate receives an authentic, immutable ticket ID and live status: Confirmed seat number or exact waitlist position. No endless spinners, no phantom bookings.

4. **🚀 Viral Growth Loop (Slide 14):**
   - Every waitlist becomes a growth loop! Waitlisted candidates receive an invite link: **inviting friends moves them up the waitlist by 3 positions in real time!**

5. **🔄 Automatic Waitlist Promotion (Slide 9 & 10):**
   - If any confirmed candidate cancels their seat, the system automatically promotes **Waitlist #1** to Confirmed in real time and notifies all screens via WebSocket!

---

## 🛠️ Tech Stack (Slide 15)

- **Frontend:** React 19 + Vite + Tailwind CSS + Lucide React + Canvas Confetti
- **Backend API:** Node.js + Express
- **Atomic Gate:** Ultra-fast in-memory atomic engine + Redis (`ioredis`) support
- **Persistence:** SQLite with Write-Ahead Logging (`journal_mode = WAL`) / PostgreSQL ready
- **Real-time Sync:** WebSocket Server (`ws`)
- **Queue & Background Worker:** Asynchronous steady-drain worker queue

---

## 🚀 Quick Start (One-Command Boot)

### Prerequisites
- Node.js (v18+) and npm installed

### 1. Run Everything Together
From the root directory (`c:\Users\ASUS\Downloads\Hackathon`):
```bash
npm run dev
```

This will concurrently launch:
- **Backend Server & WebSocket:** `http://localhost:4000`
- **React Frontend:** `http://localhost:5173`

Open your browser at **[http://localhost:5173](http://localhost:5173)**.

---

## 🧪 Hackathon Demonstration Guide for Judges

The application includes 4 comprehensive interactive modules:

### 1. 🎟️ Live Registration View (`Tab 1`)
- **Server Clock Synchronization:** Shows server-synced time so skewed device clocks cannot trigger early.
- **Persona Selector (Slide 9):** Switch between **Asha** (1st clicker), **Ravi** (2nd clicker), and **Meera** (3rd clicker) to test 1 seat remaining.
- **Double-Click Defense Toggle (Slide 12):** Turn on *"Simulate Double-Click"* to fire duplicate concurrent requests with the same Idempotency Key. Observe that only one seat is ever booked.
- **Ticket Modal:** Displays verified seat receipt, QR code, and Add-to-Calendar.

### 2. ⚡ Concurrency Stress Lab (`Tab 2`)
- Choose between **100, 500, 1,000, or 2,000 concurrent contestants**.
- Set network retry rate (e.g. 15%).
- Click **"🔥 Fire Concurrent Requests Spike"**.
- Review live telemetry report:
  - **Confirmed Seats:** Exactly matches total capacity (e.g., 50 / 50).
  - **Oversold Seats:** **Strictly 0**.
  - **Duplicates Blocked:** Caught cleanly by Idempotency Key.
  - **Throughput:** ~10,000+ requests/sec in sub-millisecond latency.

### 3. 📊 Organizer Command Center (`Tab 3`)
- **50-Seat Visual Grid:** Visualizes physical seats #1 to #50 in real time.
- **Attendee Table & Waitlist Table:** Live view of registered candidates.
- **Instant Auto-Promotion Test:** Click **"Cancel Ticket"** on any confirmed attendee. Watch the seat get freed and **Waitlist #1 instantly promoted to Confirmed** on all connected screens!

### 4. 📖 Architecture & Pitch Walkthrough (`Tab 4`)
- Interactive, step-by-step presentation of Shivam Gupta's 15 pitch slides:
  - Slide 2: The 50,000 spike scenario
  - Slide 3: The 4 Failure Modes
  - Slide 8: Whiteboard vs Ticket Window analogy
  - Slide 14: Viral Waitlist Growth Loop

---

## 💻 CLI Load Test
You can also run a direct terminal benchmark against the server:
```bash
npm run test:concurrency
```
Output:
```
⚡ FairSeat High-Concurrency CLI Benchmark
   Simulating 500 simultaneous clicks hitting at 10:00:00 AM

📊 BENCHMARK RESULTS:
- Total Concurrent Requests : 500
- Confirmed Seats            : 50
- Waitlisted Candidates      : 450
- Duplicates Blocked         : 68
- Oversold Seats             : 0 (STRICTLY 0)
- Execution Duration         : 18ms
- Throughput                 : 27778 req/sec

✅ VERIFICATION PASSED: Guaranteed zero race conditions.
```

---

*Built with passion by Shivam Gupta for Prasunex Innovathon 2026.*
