import React from 'react';
import { CheckCircle2, Clock, Share2, Calendar, X, AlertTriangle, Users, Copy, Check } from 'lucide-react';

export default function TicketModal({ ticket, onClose, onCancelTicket, onBoostWaitlist }) {
  const [copied, setCopied] = React.useState(false);
  const [friendEmail, setFriendEmail] = React.useState('');
  const [isBoosting, setIsBoosting] = React.useState(false);

  if (!ticket) return null;

  const isConfirmed = ticket.status === 'confirmed';
  const isWaitlisted = ticket.status === 'waitlisted';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://fairseat.dev/invite?ref=${ticket.userId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateInvite = async (e) => {
    e.preventDefault();
    if (!friendEmail) return;
    setIsBoosting(true);
    await onBoostWaitlist(ticket.userId, friendEmail);
    setFriendEmail('');
    setIsBoosting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel-accent border border-slate-700/80 p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isConfirmed ? (
          <div>
            {/* Header Badge */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Confirmed Seat
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Registration Successful</h3>
              </div>
            </div>

            {/* Ticket Card */}
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

              <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-4">
                <div>
                  <p className="text-xs text-slate-400">Event</p>
                  <p className="text-sm font-semibold text-white">Prasunex Innovathon 2026</p>
                  <p className="text-xs text-sky-400">Grand Finale & Demo Stage</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Seat Number</p>
                  <p className="text-3xl font-extrabold font-mono text-emerald-400">
                    #{String(ticket.seatNumber).padStart(2, '0')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400">Candidate Name</p>
                  <p className="font-medium text-slate-200 mt-0.5">{ticket.userName || 'Verified Candidate'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Ticket ID</p>
                  <p className="font-mono text-slate-200 mt-0.5">{ticket.ticketId}</p>
                </div>
                <div>
                  <p className="text-slate-400">Allocation Mode</p>
                  <p className="font-medium text-sky-400 mt-0.5">Microsecond Atomic Gate</p>
                </div>
                <div>
                  <p className="text-slate-400">Time</p>
                  <p className="text-slate-300 mt-0.5">
                    {ticket.confirmedAt ? new Date(ticket.confirmedAt).toLocaleTimeString() : 'Just now'}
                  </p>
                </div>
              </div>

              {/* Barcode Mock */}
              <div className="mt-5 pt-4 border-t border-dashed border-slate-800 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex space-x-1">
                    {[12, 24, 8, 30, 16, 28, 10, 22, 14, 26, 18, 32, 10, 20].map((h, i) => (
                      <div key={i} className="w-1 bg-slate-500 rounded-sm" style={{ height: `${h}px` }} />
                    ))}
                  </div>
                  <p className="font-mono text-[9px] text-slate-500 tracking-widest">{ticket.ticketId}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-mono">100% Guaranteed</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-200 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Copied Link' : 'Share Ticket'}</span>
              </button>

              <button
                onClick={() => onCancelTicket(ticket.userId)}
                className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-sm font-medium transition"
                title="Cancel seat to test automatic waitlist promotion!"
              >
                Cancel Ticket (Test Auto-Promote)
              </button>
            </div>
          </div>
        ) : isWaitlisted ? (
          <div>
            {/* Waitlist Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Priority Waitlist
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Honest Real-Time Queue</h3>
              </div>
            </div>

            {/* Waitlist Status Box */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 mb-5 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Your Current Position</p>
              <div className="my-2">
                <span className="text-5xl font-black font-mono text-amber-400">#{ticket.rank}</span>
                <span className="text-sm text-slate-400 ml-2">in queue</span>
              </div>
              <p className="text-xs text-slate-300">
                All 50 seats filled before your click. No endless spinners or fake success.
                If any confirmed candidate cancels, you advance automatically!
              </p>
            </div>

            {/* Slide 14: Viral Growth Loop / Referral Boost */}
            <div className="rounded-xl bg-gradient-to-br from-indigo-950/60 to-sky-950/60 border border-sky-500/30 p-4 mb-5">
              <div className="flex items-center space-x-2 text-sky-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Slide 14 Growth Loop</span>
              </div>
              <h4 className="text-sm font-bold text-white">Jump 3 Positions Per Friend Invited!</h4>
              <p className="text-xs text-slate-300 mt-1">
                Every waitlist turns missed seats into growth. Invite peers to boost your rank immediately.
              </p>

              <form onSubmit={handleSimulateInvite} className="mt-3 flex space-x-2">
                <input
                  type="email"
                  placeholder="peer.student@college.edu"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  className="flex-1 bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  disabled={!friendEmail || isBoosting}
                  className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-xs font-semibold text-white transition whitespace-nowrap"
                >
                  {isBoosting ? 'Jumping...' : 'Invite & Jump'}
                </button>
              </form>
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Copied Referral Link!' : 'Copy Personal Referral Link'}</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">Seat Request Closed</h3>
            <p className="text-xs text-slate-400 mt-1">{ticket.message || 'Unable to allocate seat.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
