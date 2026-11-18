import React, { useState } from 'react';
import { 
  Zap, Flame, ShieldAlert, CheckCircle2, AlertTriangle, 
  Layers, Database, ArrowRight, Gauge, Activity, RefreshCw 
} from 'lucide-react';

export default function StressLab({ onRunSimulation, isSimulating, eventState, onReset }) {
  const [requestCount, setRequestCount] = useState(500);
  const [duplicateRate, setDuplicateRate] = useState(15);
  const [simulationResult, setSimulationResult] = useState(null);

  const presets = [100, 250, 500, 1000, 2000];

  const handleRun = async () => {
    try {
      const res = await onRunSimulation({
        totalUsers: requestCount,
        duplicateRate: duplicateRate / 100
      });
      setSimulationResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-sky-400 mb-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <span className="text-xs uppercase font-extrabold tracking-widest">
            Prasunex Innovathon Live Benchmark
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Concurrency Stress Lab & Race-Condition Tester
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl">
          Demonstrates <strong className="text-white font-semibold">Slide 1 & 8</strong>: 
          Simulate a flash-crowd spike where hundreds or thousands of contestants click 
          <em className="text-sky-300"> "Register"</em> at the exact same microsecond. 
          Verify zero overbooking and 99% database write reduction.
        </p>
      </div>

      {/* Control Panel Card */}
      <div className="rounded-3xl glass-panel-accent border border-slate-700/80 p-6 sm:p-8 mb-8 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <Gauge className="w-5 h-5 text-sky-400" />
          <span>Configure Spike Parameters</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {/* Preset Buttons */}
          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 mb-2 block">
              Simultaneous Clickers (Target: 50 Total Event Seats)
            </label>
            <div className="flex flex-wrap gap-2">
              {presets.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setRequestCount(count)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                    requestCount === count
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {count} users
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Slide 2 scenario: 50,000 contestants spike in 60 seconds.
            </p>
          </div>

          {/* Duplicate Click Rate Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase text-slate-400">
                Network Retry & Double-Click Rate (Slide 12)
              </label>
              <span className="text-xs font-mono font-bold text-amber-400">{duplicateRate}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={duplicateRate}
              onChange={(e) => setDuplicateRate(Number(e.target.value))}
              className="w-full accent-sky-500 bg-slate-900 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-2">
              Simulates users on laggy cellular connections mashing the submit button.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRun}
            disabled={isSimulating}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center space-x-3 shadow-xl transition-all ${
              isSimulating
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 via-rose-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white shadow-rose-500/20 active:scale-[0.99]'
            }`}
          >
            {isSimulating ? (
              <>
                <Flame className="w-5 h-5 animate-pulse text-amber-400" />
                <span>Firing {requestCount} Concurrent Microsecond Requests...</span>
              </>
            ) : (
              <>
                <Flame className="w-5 h-5 text-amber-300" />
                <span>🔥 Fire {requestCount} Concurrent Requests Spike</span>
              </>
            )}
          </button>

          <button
            onClick={onReset}
            className="py-4 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm flex items-center space-x-2 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset State</span>
          </button>
        </div>
      </div>

      {/* Live Simulation Results Section */}
      {simulationResult && (
        <div className="mb-10 animate-fade-in">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Live Telemetry Verification Report</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {/* Confirmed Count */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Confirmed Seats</span>
              <p className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
                {simulationResult.confirmed}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Max capacity strictly honored</p>
            </div>

            {/* Oversold Count */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 bg-emerald-500/5">
              <span className="text-xs text-emerald-400 font-medium">Oversold Seats</span>
              <p className="text-3xl font-black font-mono text-emerald-300 mt-1">
                {simulationResult.oversold}
              </p>
              <p className="text-[11px] text-emerald-400/80 mt-1">100% Zero-Overbooking Proof</p>
            </div>

            {/* Waitlisted Count */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Waitlisted Users</span>
              <p className="text-3xl font-extrabold font-mono text-amber-400 mt-1">
                {simulationResult.waitlisted}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">FIFO arrival order guaranteed</p>
            </div>

            {/* Duplicates Blocked */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Duplicates Blocked</span>
              <p className="text-3xl font-extrabold font-mono text-indigo-400 mt-1">
                {simulationResult.duplicatesBlocked}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Idempotency Key match</p>
            </div>
          </div>

          {/* Performance & DB Protection Card (Slide 13) */}
          <div className="p-6 rounded-3xl glass-panel border border-sky-500/20 bg-sky-500/5 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Slide 13: Built For The Spike
                </span>
                <h4 className="text-lg font-bold text-white mt-0.5">
                  99% Answered in Memory Without Touching Database
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Total requests executed: <strong className="text-white">{simulationResult.totalRequests}</strong> in{' '}
                  <span className="font-mono text-sky-300 font-bold">{simulationResult.durationMs}ms</span>{' '}
                  ({simulationResult.reqPerSec.toLocaleString()} req/sec throughput).
                  Only confirmed seats require background database persistence.
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-center px-4 py-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Throughput</span>
                  <p className="text-lg font-mono font-bold text-sky-400">{simulationResult.reqPerSec}/s</p>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Execution</span>
                  <p className="text-lg font-mono font-bold text-emerald-400">{simulationResult.durationMs}ms</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison: Whiteboard vs Ticket Window (Slide 8) */}
      <div className="rounded-3xl glass-panel border border-slate-800 p-6 sm:p-8">
        <h3 className="text-lg font-bold text-white mb-2">
          Architecture Contrast: Whiteboard vs FairSeat (Slide 8)
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Why traditional database queries always oversell events during spikes:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Typical Naive Approach */}
          <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30">
            <div className="flex items-center space-x-2 text-rose-400 mb-3">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="text-sm font-bold uppercase tracking-wider">Naive Whiteboard Approach</h4>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              1. 600 users click at 10:00 AM.<br />
              2. Every request reads DB: <code className="text-rose-300">SELECT remaining_seats (returns 1)</code>.<br />
              3. All 600 think a seat is open and execute <code className="text-rose-300">INSERT ticket</code>.<br />
              4. <strong>Result:</strong> 600 students receive success confirmation. 550 turned away at venue door!
            </p>
            <div className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
              ❌ Overbooking, duplicate records, database crash.
            </div>
          </div>

          {/* FairSeat Approach */}
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
            <div className="flex items-center space-x-2 text-emerald-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
              <h4 className="text-sm font-bold uppercase tracking-wider">FairSeat Single Ticket Window</h4>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              1. 600 users click at 10:00 AM.<br />
              2. Fast Atomic Gate operates as single ticket window (Lua/Atomic DECR).<br />
              3. Only the first claim decrements counter to 0 and gets confirmed.<br />
              4. The other 599 immediately receive their exact Waitlist rank (#1, #2...).<br />
              5. <strong>Result:</strong> Exactly 50 seats confirmed. Zero overselling.
            </p>
            <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
              ✅ Guaranteed zero oversold, honest waitlist, calm database.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
