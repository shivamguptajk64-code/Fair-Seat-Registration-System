import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import LiveRegistration from './components/LiveRegistration';
import StressLab from './components/StressLab';
import AdminDashboard from './components/AdminDashboard';
import PitchWalkthrough from './components/PitchWalkthrough';
import TicketModal from './components/TicketModal';

const API_BASE = 'http://localhost:4000/api';
const WS_URL = 'ws://localhost:4000';

export default function App() {
  const [activeTab, setActiveTab] = useState('register');
  const [isConnected, setIsConnected] = useState(false);
  const [serverTime, setServerTime] = useState(Date.now());
  const [timeOffset, setTimeOffset] = useState(0);
  const [eventState, setEventState] = useState(null);
  const [userTicket, setUserTicket] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const wsRef = useRef(null);

  // Synchronize server time (Slide 10)
  const syncServerTime = async () => {
    try {
      const start = Date.now();
      const res = await fetch(`${API_BASE}/time`);
      const end = Date.now();
      if (res.ok) {
        const data = await res.json();
        const latency = (end - start) / 2;
        const offset = (data.serverTime + latency) - Date.now();
        setTimeOffset(offset);
      }
    } catch (e) {
      console.warn('Could not sync server time:', e);
    }
  };

  // Clock tick based on synchronized server time
  useEffect(() => {
    syncServerTime();
    const clockInterval = setInterval(() => {
      setServerTime(Date.now() + timeOffset);
    }, 1000);
    return () => clearInterval(clockInterval);
  }, [timeOffset]);

  // Initial event details fetch
  const fetchEventData = async () => {
    try {
      const res = await fetch(`${API_BASE}/events/innovathon-2026`);
      if (res.ok) {
        const data = await res.json();
        setEventState({
          totalSeats: data.total_seats,
          availableSeats: data.available_seats,
          confirmedCount: data.confirmed_count,
          waitlistCount: data.waitlist_count,
          metrics: data.metrics
        });
      }
    } catch (e) {
      console.warn('Initial fetch error:', e);
    }
  };

  // Establish WebSocket Connection
  useEffect(() => {
    fetchEventData();

    function connectWs() {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'INITIAL_STATE' || msg.type === 'SEAT_UPDATE' || msg.type === 'EVENT_RESET' || msg.type === 'WAITLIST_REORDER') {
            if (msg.state) setEventState(msg.state);
          } else if (msg.type === 'TICKET_PROCESSED') {
            if (msg.state) setEventState(msg.state);
          } else if (msg.type === 'CANCELLATION_AND_PROMOTION') {
            if (msg.state) setEventState(msg.state);
          }
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connectWs, 2000);
      };

      ws.onerror = () => {
        setIsConnected(false);
      };
    }

    connectWs();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Action: Register user
  const handleRegister = async ({ userId, name, email, idempotencyKey }) => {
    const res = await fetch(`${API_BASE}/events/innovathon-2026/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, name, email, idempotencyKey })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    setUserTicket(data);
    return data;
  };

  // Action: Cancel ticket (triggers auto-promotion)
  const handleCancelTicket = async (userId) => {
    const res = await fetch(`${API_BASE}/tickets/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: 'innovathon-2026', userId })
    });
    const data = await res.json();
    if (userTicket && userTicket.userId === userId) {
      setUserTicket(null);
    }
    return data;
  };

  // Action: Boost waitlist with friend referral
  const handleBoostWaitlist = async (userId, friendEmail) => {
    const res = await fetch(`${API_BASE}/referrals/boost`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: 'innovathon-2026', userId, referredEmail: friendEmail })
    });
    const data = await res.json();
    if (data.success && userTicket && userTicket.userId === userId) {
      setUserTicket(prev => ({ ...prev, rank: data.newRank }));
    }
    return data;
  };

  // Action: Run Concurrency Simulation
  const handleRunSimulation = async (params) => {
    setIsSimulating(true);
    try {
      const res = await fetch(`${API_BASE}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: 'innovathon-2026', ...params })
      });
      const data = await res.json();
      return data;
    } finally {
      setIsSimulating(false);
    }
  };

  // Action: Reset Demo
  const handleReset = async () => {
    const res = await fetch(`${API_BASE}/admin/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: 'innovathon-2026', totalSeats: 50 })
    });
    const data = await res.json();
    setUserTicket(null);
    return data;
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isConnected={isConnected}
        serverTime={serverTime}
        onReset={handleReset}
      />

      {/* Main Tab Views */}
      <main className="flex-1 pb-16">
        {activeTab === 'register' && (
          <LiveRegistration
            eventState={eventState}
            serverTime={serverTime}
            onRegister={handleRegister}
            userTicket={userTicket}
            setUserTicket={setUserTicket}
            onCancelTicket={handleCancelTicket}
            onBoostWaitlist={handleBoostWaitlist}
          />
        )}

        {activeTab === 'stress' && (
          <StressLab
            onRunSimulation={handleRunSimulation}
            isSimulating={isSimulating}
            eventState={eventState}
            onReset={handleReset}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            eventState={eventState}
            onCancelTicket={handleCancelTicket}
            onReset={handleReset}
            onBoostWaitlist={handleBoostWaitlist}
          />
        )}

        {activeTab === 'pitch' && (
          <PitchWalkthrough />
        )}
      </main>

      {/* Ticket Modal popup when user registers */}
      {userTicket && (
        <TicketModal
          ticket={userTicket}
          onClose={() => setUserTicket(null)}
          onCancelTicket={handleCancelTicket}
          onBoostWaitlist={handleBoostWaitlist}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <strong className="text-slate-300">FairSeat</strong> — High-Concurrency Fair Registration Engine
          </div>
          <div className="text-slate-400">
            Prasunex Innovathon 2026 • Shivam Gupta
          </div>
          <div className="text-sky-400 font-mono">
            "Never oversell. Never duplicate. Always tell the truth."
          </div>
        </div>
      </footer>
    </div>
  );
}
