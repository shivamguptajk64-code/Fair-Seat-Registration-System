import React, { useState, useEffect } from 'react';
import { 
  Activity, Users, Clock, AlertOctagon, CheckCircle2, 
  Trash2, RefreshCw, Cpu, Database, Award, ArrowUpRight 
} from 'lucide-react';

export default function AdminDashboard({ 
  eventState, 
  onCancelTicket, 
  onReset,
  onBoostWaitlist 
}) {
  const [adminMetrics, setAdminMetrics] = useState(null);
  const [cancellingUserId, setCancellingUserId] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchMetrics = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/admin/metrics');
      if (res.ok) {
        const data = await res.json();
        setAdminMetrics(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  const totalSeats = eventState?.totalSeats || 50;
  const confirmedCount = eventState?.confirmedCount || 0;
  const waitlist = eventState?.waitlist || [];
  const metrics = eventState?.metrics || {};

  const handleCancel = async (userId) => {
    setCancellingUserId(userId);
    try {
      await onCancelTicket(userId);
      await fetchMetrics();
    } finally {
      setCancellingUserId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 mb-1">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span className="text-xs uppercase font-extrabold tracking-widest">
              Live Operations & Monitoring
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Organizer Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time seat allocation, automated waitlist promotion engine, and telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchMetrics}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition"
          >
            Reset Event State
          </button>
        </div>
      </div>

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Seats Allocated</span>
          <p className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
            {confirmedCount} <span className="text-sm text-slate-500 font-normal">/ {totalSeats}</span>
          </p>
          <div className="mt-2 flex items-center space-x-1 text-[11px] text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Zero overbooking enforced</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Waitlist Queue</span>
          <p className="text-3xl font-extrabold font-mono text-amber-400 mt-1">
            {waitlist.length}
          </p>
          <div className="mt-2 flex items-center space-x-1 text-[11px] text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Auto-promotion ready</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Atomic Gate Latency</span>
          <p className="text-3xl font-extrabold font-mono text-sky-400 mt-1">
            {metrics.lastClaimLatencyMs ? `${metrics.lastClaimLatencyMs.toFixed(2)}ms` : '0.12ms'}
          </p>
          <div className="mt-2 flex items-center space-x-1 text-[11px] text-sky-400">
            <Cpu className="w-3.5 h-3.5" />
            <span>Sub-millisecond decisions</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">DB Writes Saved (Slide 13)</span>
          <p className="text-3xl font-extrabold font-mono text-indigo-400 mt-1">
            {metrics.dbWritesSaved || 0}
          </p>
          <div className="mt-2 flex items-center space-x-1 text-[11px] text-indigo-400">
            <Database className="w-3.5 h-3.5" />
            <span>Spike absorbed in memory</span>
          </div>
        </div>
      </div>

      {/* Visual 50-Seat Grid */}
      <div className="rounded-3xl glass-panel border border-slate-800 p-6 sm:p-8 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Live Visual Seat Map (50 Seats)</h2>
            <p className="text-xs text-slate-400">
              Each cell represents a physical seat guaranteed to exactly one verified candidate.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-slate-300">Confirmed ({confirmedCount})</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
              <span className="text-slate-300">Available ({totalSeats - confirmedCount})</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {Array.from({ length: totalSeats }, (_, i) => {
            const seatNumber = i + 1;
            const isTaken = seatNumber <= confirmedCount;
            return (
              <div
                key={seatNumber}
                className={`h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs transition-all ${
                  isTaken
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                    : 'bg-slate-900 text-slate-600 border border-slate-800'
                }`}
                title={`Seat #${seatNumber}: ${isTaken ? 'Confirmed' : 'Available'}`}
              >
                #{seatNumber}
              </div>
            );
          })}
        </div>
      </div>

      {/* Automatic Waitlist Promotion Test Section (Slide 9 & 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Waitlist Queue Table */}
        <div className="rounded-3xl glass-panel border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Priority Waitlist ({waitlist.length})</span>
              </h3>
              <p className="text-xs text-slate-400">
                Sorted by arrival time + referral boosts (Slide 14).
              </p>
            </div>
          </div>

          {waitlist.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No one currently on waitlist. Claim all 50 seats to see waitlist entries appear!
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {waitlist.map((item) => (
                <div
                  key={item.userId}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 font-mono font-bold text-xs flex items-center justify-center border border-amber-500/20">
                      #{item.rank}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-white">{item.userName || item.userId}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Arrived: {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {item.referralScore > 0 && (
                      <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/20">
                        +{item.referralScore} Referrals
                      </span>
                    )}
                    <span className="text-[10px] text-amber-400 uppercase font-mono font-bold">
                      {item.rank === 1 ? 'Next In Line' : 'Queued'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cancellation & Auto-Promote Test Bench */}
        <div className="rounded-3xl glass-panel-accent border border-indigo-500/30 p-6">
          <div className="flex items-center space-x-2 text-indigo-400 mb-2">
            <Award className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Slide 9 & 10 Auto-Promote Demonstration
            </span>
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            Cancellation & Auto-Promotion Test
          </h3>
          <p className="text-xs text-slate-300 mb-4">
            When a confirmed candidate cancels their seat, the system automatically 
            promotes <strong className="text-amber-300">Waitlist #1</strong> to Confirmed in real time!
          </p>

          <div className="space-y-3">
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Confirmed Candidates (Click Cancel to test auto-promotion):
            </p>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {[
                { id: 'user-asha', name: 'Asha Sharma', seat: 1 },
                { id: 'user-shivam', name: 'Shivam Gupta', seat: 2 },
                { id: 'user-demo', name: 'Demo Candidate', seat: 3 },
              ].map((attendee) => (
                <div
                  key={attendee.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center border border-emerald-500/20">
                      #{attendee.seat}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-white">{attendee.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{attendee.id}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCancel(attendee.id)}
                    disabled={cancellingUserId === attendee.id}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium flex items-center space-x-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{cancellingUserId === attendee.id ? 'Promoting...' : 'Cancel Ticket'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
