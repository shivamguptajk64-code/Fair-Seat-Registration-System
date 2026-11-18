import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Zap, Shield, CheckCircle2, 
  AlertTriangle, Users, Database, Layers, Lock, Cpu, Sparkles 
} from 'lucide-react';

export default function PitchWalkthrough() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 15;

  const slides = [
    {
      num: 1,
      title: 'FairSeat',
      subtitle: 'A registration system that gives every seat to exactly one person, even when 50,000 people click at the same second.',
      author: 'Shivam Gupta | Hackathon Pitch',
      badge: 'Prasunex Innovathon 2026',
      content: (
        <div className="text-center py-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold uppercase tracking-widest">
            Prototype Development & Demonstration
          </div>
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            FairSeat
          </h2>
          <p className="text-xl sm:text-2xl text-slate-300 max-w-2xl mx-auto font-light">
            A registration system that gives every seat to exactly one person, even when 50,000 people click at the same second.
          </p>
          <div className="pt-6 border-t border-slate-800 flex justify-center items-center space-x-8 text-xs text-slate-400">
            <div>Pitch by <strong className="text-white">Shivam Gupta</strong></div>
            <div>•</div>
            <div className="text-sky-400 font-mono font-semibold">Decide fast. Write safely. Tell the truth.</div>
          </div>
        </div>
      )
    },
    {
      num: 2,
      title: 'One minute decides your reputation',
      subtitle: 'Why this matters: sudden rush at a fixed opening time.',
      content: (
        <div className="py-6 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <Users className="w-10 h-10 text-sky-400 mx-auto mb-3" />
              <p className="text-4xl font-extrabold text-white font-mono">50,000</p>
              <p className="text-xs text-slate-400 mt-1">users click Register at 10:00 AM</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <Layers className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
              <p className="text-4xl font-extrabold text-white font-mono">500</p>
              <p className="text-xs text-slate-400 mt-1">seats available in total</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <Zap className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <p className="text-4xl font-extrabold text-white font-mono">60 sec</p>
              <p className="text-xs text-slate-400 mt-1">before trust is won or lost</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-sky-950/20 border border-sky-500/20 text-slate-300 text-sm">
            <strong className="text-white">Why this matters:</strong> Hackathons, exams, workshops and concerts open registration at a fixed time, so everyone arrives together. The system must survive that sudden rush and still give each seat to exactly one person. If it crashes, oversells or confuses users, people leave and tell everyone.
          </div>
        </div>
      )
    },
    {
      num: 3,
      title: 'Four ways registration breaks today',
      subtitle: 'The common failure modes in conventional ticketing systems.',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-rose-500/30">
            <div className="flex items-center space-x-2 text-rose-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-bold text-sm">1. Overbooking</h4>
            </div>
            <p className="text-xs text-slate-300">
              Two students click at the same instant when 1 seat is left. Both see "Success", and one is turned away at the venue door.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30">
            <div className="flex items-center space-x-2 text-amber-400 mb-2">
              <Layers className="w-5 h-5" />
              <h4 className="font-bold text-sm">2. Duplicates</h4>
            </div>
            <p className="text-xs text-slate-300">
              On a slow network, a user double-clicks or retries. The naive system saves two entries and sends two emails for one person.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/30">
            <div className="flex items-center space-x-2 text-indigo-400 mb-2">
              <Database className="w-5 h-5" />
              <h4 className="font-bold text-sm">3. Crashes</h4>
            </div>
            <p className="text-xs text-slate-300">
              Thousands of concurrent requests hit the database at once. Connection pool exhausts, pages time out, and users see HTTP 504 errors.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/30">
            <div className="flex items-center space-x-2 text-purple-400 mb-2">
              <Cpu className="w-5 h-5" />
              <h4 className="font-bold text-sm">4. Bots</h4>
            </div>
            <p className="text-xs text-slate-300">
              Automated scripts click in milliseconds, snatching seats before genuine human candidates can even load the stylesheet.
            </p>
          </div>
        </div>
      )
    },
    {
      num: 4,
      title: 'Our Solution: FairSeat',
      subtitle: 'Decide fast. Write safely. Tell the truth.',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-sky-500/30 text-center">
            <Zap className="w-12 h-12 text-sky-400 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-white mb-2">Decide Fast</h4>
            <p className="text-xs text-slate-300">
              A very fast in-memory store (Redis/Atomic Gate) hands out seats one at a time in microseconds. 99% of requests get their answer here and never touch the database.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-indigo-500/30 text-center">
            <Shield className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-white mb-2">Write Safely</h4>
            <p className="text-xs text-slate-300">
              A background queue feeds the persistence work to the database at a calm, steady pace. Database constraints guarantee each confirmed seat is stored exactly once.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-white mb-2">Tell The Truth</h4>
            <p className="text-xs text-slate-300">
              Every user receives an instant ticket with its honest real state: Confirmed, Waitlisted with rank, or Closed. No fake success, no endless spinner.
            </p>
          </div>
        </div>
      )
    },
    {
      num: 8,
      title: 'The Bug That Oversells Events vs FairSeat',
      subtitle: 'The Whiteboard vs Single Ticket Window Analogy',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4">
          <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30">
            <h4 className="text-base font-bold text-rose-400 mb-2">Typical Whiteboard Approach</h4>
            <p className="text-xs text-slate-300 mb-4">
              Like 600 people reading the same whiteboard saying "1 seat left", and then all 600 writing their names down simultaneously.
            </p>
            <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
              <li>All 600 get confirmed</li>
              <li>Result: The event is oversold by 550 seats!</li>
              <li>Students get rejected at the door.</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
            <h4 className="text-base font-bold text-emerald-400 mb-2">FairSeat Single Ticket Window</h4>
            <p className="text-xs text-slate-300 mb-4">
              Like a single physical ticket booth: exactly one person is served at a time. Only one person can take the last seat.
            </p>
            <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
              <li>Atomic claim: 1st claim wins</li>
              <li>Remaining 599 join the waitlist with exact rank</li>
              <li>Result: Exactly 500 seats, always.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      num: 9,
      title: 'Example: 3 Users, 1 Seat Left',
      subtitle: 'Asha, Ravi, and Meera click in the exact same second.',
      content: (
        <div className="py-6 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">1</span>
              <div>
                <p className="text-sm font-bold text-white">Asha (Claim arrives 1st)</p>
                <p className="text-xs text-slate-400">Gets the last available seat. Seat counter drops from 1 to 0.</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              CONFIRMED
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center">2</span>
              <div>
                <p className="text-sm font-bold text-white">Ravi (Claim arrives 2nd)</p>
                <p className="text-xs text-slate-400">No seats left. Told immediately and queued first on priority waitlist.</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
              WAITLISTED #1
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center">3</span>
              <div>
                <p className="text-sm font-bold text-white">Meera (Claim arrives 3rd)</p>
                <p className="text-xs text-slate-400">Same honest answer. Automatically promoted if Asha or Ravi cancels.</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
              WAITLISTED #2
            </span>
          </div>
        </div>
      )
    },
    {
      num: 14,
      title: 'Every Waitlist is a Growth Loop',
      subtitle: 'Slide 14: Turning missed seats into viral expansion.',
      content: (
        <div className="py-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-2xl font-bold font-mono text-rose-400">1</span>
              <p className="text-xs font-bold text-white mt-1">Miss Out</p>
              <p className="text-[11px] text-slate-400 mt-1">Seats filled; user lands on waitlist instead of an error.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-2xl font-bold font-mono text-amber-400">2</span>
              <p className="text-xs font-bold text-white mt-1">See Position</p>
              <p className="text-[11px] text-slate-400 mt-1">They see real place (e.g. #12) with arrival timestamp.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-2xl font-bold font-mono text-sky-400">3</span>
              <p className="text-xs font-bold text-white mt-1">Invite Friends</p>
              <p className="text-[11px] text-slate-400 mt-1">Inviting peers moves them up 3 positions in real time.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-2xl font-bold font-mono text-emerald-400">4</span>
              <p className="text-xs font-bold text-white mt-1">New Signups</p>
              <p className="text-[11px] text-slate-400 mt-1">Each friend joins, grows community and fills next round.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-300">
            <strong>Outcome:</strong> Organizers get zero overselling & live admin stats; Students get a fair, explainable status; Platform gains viral referrals.
          </div>
        </div>
      )
    },
    {
      num: 15,
      title: 'Tech Stack & Roadmap',
      subtitle: 'Phase 1: Correctness | Phase 2: Scale | Phase 3: Fairness & Growth',
      content: (
        <div className="py-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-slate-400 font-medium">Frontend</p>
              <p className="text-white font-bold text-sm mt-0.5">React + Vite + Tailwind</p>
              <p className="text-slate-500 mt-1">Fast UI, live tickets, server countdown</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-slate-400 font-medium">Backend API</p>
              <p className="text-white font-bold text-sm mt-0.5">Node.js + Express</p>
              <p className="text-slate-500 mt-1">REST APIs, JWT identity, rate limiting</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-slate-400 font-medium">Atomic Gate</p>
              <p className="text-white font-bold text-sm mt-0.5">Redis / In-Memory Gate</p>
              <p className="text-slate-500 mt-1">Atomic Lua claim, 0 race conditions</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-slate-400 font-medium">Queue & Worker</p>
              <p className="text-white font-bold text-sm mt-0.5">Async Write Queue</p>
              <p className="text-slate-500 mt-1">Steady DB writes, retry backoff</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-slate-400 font-medium">Database</p>
              <p className="text-white font-bold text-sm mt-0.5">PostgreSQL / SQLite WAL</p>
              <p className="text-slate-500 mt-1">Strict UNIQUE constraints</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-slate-400 font-medium">Real-Time Sync</p>
              <p className="text-white font-bold text-sm mt-0.5">WebSockets (ws)</p>
              <p className="text-slate-500 mt-1">Instant updates across all screens</p>
            </div>
          </div>
          <div className="text-center pt-4">
            <span className="text-xs text-sky-400 font-mono font-bold tracking-widest uppercase">
              "Never oversell. Never duplicate. Always tell the truth."
            </span>
          </div>
        </div>
      )
    }
  ];

  const currentSlideData = slides.find(s => s.num === currentSlide) || slides[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Slide Navigation Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Slide</span>
          <span className="font-mono text-sm font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg">
            {currentSlide} / {totalSlides}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentSlide(prev => Math.max(1, prev - 1))}
            disabled={currentSlide === 1}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide(prev => Math.min(totalSlides, prev + 1))}
            disabled={currentSlide === totalSlides}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Slide Card */}
      <div className="rounded-3xl glass-panel-accent border border-slate-700/80 p-6 sm:p-10 min-h-[460px] flex flex-col justify-between shadow-2xl">
        <div>
          <div className="mb-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {currentSlideData.title}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {currentSlideData.subtitle}
            </p>
          </div>

          <div className="mt-4">
            {currentSlideData.content}
          </div>
        </div>

        {/* Slide Footer */}
        <div className="pt-6 mt-6 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>Prasunex Innovathon 2026 Presentation</span>
          <span>Pitch by Shivam Gupta</span>
        </div>
      </div>
    </div>
  );
}
