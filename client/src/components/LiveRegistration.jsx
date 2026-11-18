import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Lock, CheckCircle2, AlertCircle, Clock, Zap, Shield, 
  RotateCcw, Sparkles, User, Fingerprint, Flame
} from 'lucide-react';

export default function LiveRegistration({ 
  eventState, 
  serverTime, 
  onRegister, 
  userTicket, 
  setUserTicket, 
  onCancelTicket,
  onBoostWaitlist 
}) {
  const [selectedUser, setSelectedUser] = useState({
    id: 'user-asha',
    name: 'Asha Sharma',
    email: 'asha@innovathon.dev'
  });
  
  const [customName, setCustomName] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simulateDoubleClick, setSimulateDoubleClick] = useState(false);
  const [lastActionStatus, setLastActionStatus] = useState(null);

  // Demo user personas matching Slide 9: "Example: 3 users, 1 seat left - Asha, Ravi, Meera"
  const demoPersonas = [
    { id: 'user-asha', name: 'Asha Sharma', email: 'asha@innovathon.dev', desc: '1st clicker (Claims last seat)' },
    { id: 'user-ravi', name: 'Ravi Kumar', email: 'ravi@innovathon.dev', desc: '2nd clicker (Waitlist #1)' },
    { id: 'user-meera', name: 'Meera Patel', email: 'meera@innovathon.dev', desc: '3rd clicker (Waitlist #2)' },
    { id: 'user-shivam', name: 'Shivam Gupta', email: 'shivam@fairseat.dev', desc: 'Hackathon Creator' }
  ];

  const totalSeats = eventState?.totalSeats || 50;
  const availableSeats = eventState?.availableSeats ?? 50;
  const confirmedCount = eventState?.confirmedCount || 0;
  const waitlistCount = eventState?.waitlistCount || 0;
  const percentFilled = Math.min(100, Math.round((confirmedCount / totalSeats) * 100));

  const handleClaimClick = async () => {
    if (isSubmitting) return;

    // Instant Lock & Idempotency Key Generation (Slide 6 & 10)
    setIsSubmitting(true);
    const userId = isCustom ? `user-custom-${customName.toLowerCase().replace(/\s+/g, '-')}` : selectedUser.id;
    const name = isCustom ? customName : selectedUser.name;
    const email = isCustom ? `${userId}@college.edu` : selectedUser.email;
    const idempotencyKey = `idem-${userId}-${Date.now().toString().slice(0, 9)}`;

    setLastActionStatus({ type: 'info', message: '🔒 Button locked. Idempotency Key generated. Atomic gate evaluating in memory...' });

    try {
      if (simulateDoubleClick) {
        // Send two simultaneous requests with the SAME idempotency key to test Slide 12!
        setLastActionStatus({ type: 'warning', message: '⚡ Firing duplicate simultaneous requests to demonstrate Idempotency Key defense!' });
        const [res1, res2] = await Promise.all([
          onRegister({ userId, name, email, idempotencyKey }),
          onRegister({ userId, name, email, idempotencyKey })
        ]);
        
        handleResult(res1);
      } else {
        const res = await onRegister({ userId, name, email, idempotencyKey });
        handleResult(res);
      }
    } catch (err) {
      setLastActionStatus({ type: 'error', message: err.message || 'Registration failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResult = (res) => {
    if (res.status === 'confirmed') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setLastActionStatus({
        type: 'success',
        message: `🎉 Confirmed Seat #${res.seatNumber} in ${eventState?.metrics?.lastClaimLatencyMs || 0.1}ms! Zero overbooking.`
      });
    } else if (res.status === 'waitlisted') {
      setLastActionStatus({
        type: 'amber',
        message: `📋 Seats filled. Placed on Priority Waitlist at position #${res.rank}.`
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Event Hero Card */}
      <div className="relative rounded-3xl glass-panel-accent border border-slate-700/80 p-6 sm:p-10 mb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Registration Open</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
              Prasunex Innovathon 2026
            </span>
          </div>

          <div className="text-right flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Server Clock:</span>
            <span className="font-mono text-white font-bold">
              {serverTime ? new Date(serverTime).toLocaleTimeString() : '--:--:--'}
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Grand Finale Demo Registration
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
          Powered by <strong className="text-sky-400 font-semibold">FairSeat Atomic Engine</strong>. 
          Handles flash-crowd spikes of 50,000 users clicking at the exact same millisecond with zero overbooking.
        </p>

        {/* Live Seat Progress Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-xs text-slate-400 font-medium">Available Inventory</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-white">
                  {availableSeats}
                </span>
                <span className="text-sm font-semibold text-slate-400">
                  / {totalSeats} seats left
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-medium">Waitlist Queue</span>
              <p className="text-2xl font-bold font-mono text-amber-400">
                {waitlistCount} waiting
              </p>
            </div>
          </div>

          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                percentFilled > 90 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-sky-500 to-emerald-400'
              }`}
              style={{ width: `${percentFilled}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Interactive Claim Box */}
      <div className="rounded-3xl glass-panel border border-slate-800 p-6 sm:p-8 mb-8 shadow-xl">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Choose Candidate Identity (Slide 9 Demo)</h2>
            <p className="text-xs text-slate-400">
              Test the presentation scenario: Asha claims the last seat, Ravi & Meera instantly land on waitlist.
            </p>
          </div>
        </div>

        {/* Persona Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {demoPersonas.map((persona) => {
            const isSelected = !isCustom && selectedUser.id === persona.id;
            return (
              <div
                key={persona.id}
                onClick={() => {
                  setSelectedUser(persona);
                  setIsCustom(false);
                }}
                className={`p-3.5 rounded-2xl cursor-pointer border transition-all ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-500/50 text-white shadow-md shadow-sky-500/10'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-200">{persona.name}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-sky-400" />}
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{persona.email}</p>
                <p className="text-[11px] text-sky-400/80 mt-1">{persona.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Custom Persona Option */}
        <div className="mb-6 flex items-center space-x-3">
          <input
            type="checkbox"
            id="customUserCheck"
            checked={isCustom}
            onChange={(e) => setIsCustom(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0"
          />
          <label htmlFor="customUserCheck" className="text-xs text-slate-300 cursor-pointer">
            Or type a custom attendee name:
          </label>
          {isCustom && (
            <input
              type="text"
              placeholder="e.g. Sarah Connor"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          )}
        </div>

        {/* Double-Click Simulation Toggle (Slide 12 Defense) */}
        <div className="mb-6 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Fingerprint className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-xs font-semibold text-white">Simulate Double-Click / Retrying Network (Slide 12)</p>
              <p className="text-[11px] text-slate-400">Sends two concurrent identical requests with same Idempotency Key</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSimulateDoubleClick(!simulateDoubleClick)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              simulateDoubleClick ? 'bg-amber-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                simulateDoubleClick ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* The Primary CTA Button */}
        <div className="space-y-3">
          <button
            onClick={handleClaimClick}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center space-x-3 shadow-xl transition-all ${
              isSubmitting
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : availableSeats > 0
                ? 'bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-500 hover:from-sky-400 hover:to-indigo-500 text-white shadow-sky-500/25 active:scale-[0.99]'
                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-500/20 active:scale-[0.99]'
            }`}
          >
            {isSubmitting ? (
              <>
                <Lock className="w-5 h-5 animate-spin" />
                <span>🔒 Securing Seat with Idempotency Key...</span>
              </>
            ) : availableSeats > 0 ? (
              <>
                <Zap className="w-5 h-5 text-amber-300" />
                <span>⚡ Claim Seat Now (1-Click Atomic)</span>
              </>
            ) : (
              <>
                <Clock className="w-5 h-5 text-white" />
                <span>Join Priority Waitlist (Instant Rank)</span>
              </>
            )}
          </button>

          {/* Feedback Banner */}
          {lastActionStatus && (
            <div className={`p-4 rounded-2xl border text-xs sm:text-sm animate-fade-in flex items-center justify-between ${
              lastActionStatus.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : lastActionStatus.type === 'amber'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : lastActionStatus.type === 'warning'
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              <div className="flex items-center space-x-2">
                {lastActionStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {lastActionStatus.type === 'amber' && <Clock className="w-4 h-4 text-amber-400" />}
                {lastActionStatus.type === 'warning' && <Shield className="w-4 h-4 text-indigo-400" />}
                <span>{lastActionStatus.message}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feature Highlights from Pitch */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center space-x-2 text-sky-400 mb-2">
            <Zap className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Decide Fast</h4>
          </div>
          <p className="text-xs text-slate-300">
            Microsecond in-memory atomic gate hands out seats one by one. Database is protected from the crash.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center space-x-2 text-indigo-400 mb-2">
            <Shield className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Write Safely</h4>
          </div>
          <p className="text-xs text-slate-300">
            Async workers feed the database steadily. Strict UNIQUE rules guarantee exactly one seat per person.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center space-x-2 text-emerald-400 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Tell The Truth</h4>
          </div>
          <p className="text-xs text-slate-300">
            Every candidate gets a verified ticket state: Confirmed or honest Waitlist rank. No endless spinners.
          </p>
        </div>
      </div>
    </div>
  );
}
