import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Mail, 
  Phone, 
  Sparkles, 
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
  Timer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WaitlistEntry, Event } from '../../types';
import { store } from '../../lib/store';

interface WaitlistReclamationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
  theme?: 'light' | 'dark';
  onSimulateAttendeeClaim?: (claimToken: string) => void;
}

export const WaitlistReclamationDrawer: React.FC<WaitlistReclamationDrawerProps> = ({
  isOpen,
  onClose,
  events,
  theme = 'dark',
  onSimulateAttendeeClaim
}) => {
  const isDark = theme === 'dark';

  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(() => store.getWaitlist());
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [ticketReleaseCount, setTicketReleaseCount] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reclaimFeedback, setReclaimFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentEvent = events.find(e => e.id === selectedEventId) || events[0];
  const eventWaitlist = waitlist.filter(w => w.eventId === (currentEvent?.id || ''));

  const waitingCount = eventWaitlist.filter(w => w.status === 'waiting').length;
  const notifiedCount = eventWaitlist.filter(w => w.status === 'notified').length;
  const claimedCount = eventWaitlist.filter(w => w.status === 'claimed').length;

  const handleRunReclamation = async () => {
    if (!currentEvent) return;
    setIsProcessing(true);
    setReclaimFeedback(null);

    try {
      // 1. Call server-side background engine endpoint
      await fetch('/api/waitlist/reclaim-cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: currentEvent.id,
          availableTickets: ticketReleaseCount,
          triggerReason: 'organizer_allocation_release'
        })
      });
    } catch {
      // Graceful fallback to client engine
    }

    setTimeout(() => {
      // 2. Execute authoritative state transition in store
      const res = store.triggerWaitlistReclamation(currentEvent.id, ticketReleaseCount);
      setWaitlist(store.getWaitlist());
      setIsProcessing(false);
      setReclaimFeedback(res.message);

      if (res.reclaimed.length > 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className={`w-full max-w-4xl rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-all ${
          isDark 
            ? 'bg-[#0B0B0E] border-white/15 text-white' 
            : 'bg-white border-black/15 text-black'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between gap-4 ${
          isDark ? 'border-white/10 bg-white/2' : 'border-black/10 bg-black/2'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider uppercase opacity-75">
                Automated Allocation Engine
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <span>Waitlist Queue & Ticket Reclamation Hub</span>
            </h2>
            <p className="text-xs opacity-70">
              Auto-detect cancellations, fire time-limited 2-hour priority claim windows, and dispatch Twilio / SendGrid notices.
            </p>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDark ? 'hover:bg-white/10 text-white/70' : 'hover:bg-black/10 text-black/70'
            }`}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Target Event Selector & KPI Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            <div className={`lg:col-span-1 p-4 rounded-xl border space-y-3 ${
              isDark ? 'bg-black/40 border-white/10' : 'bg-neutral-50 border-black/10'
            }`}>
              <label className="block text-xs font-bold uppercase tracking-wider font-mono opacity-80">
                Select Event Queue
              </label>
              <select
                value={selectedEventId}
                onChange={e => {
                  setSelectedEventId(e.target.value);
                  setReclaimFeedback(null);
                }}
                className={`w-full p-2.5 text-xs font-mono font-semibold rounded-lg border outline-none cursor-pointer ${
                  isDark ? 'bg-black border-white/20 text-white' : 'bg-white border-black/20 text-black'
                }`}
              >
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.venue.city})
                  </option>
                ))}
              </select>

              <div className="pt-2 border-t border-inherit space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="opacity-60">Venue Capacity:</span>
                  <span className="font-bold">{currentEvent?.capacityCap || 2600}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Current Status:</span>
                  <span className="font-bold text-amber-400">Sold Out / Waitlist Active</span>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="lg:col-span-2 grid grid-cols-3 gap-3">
              <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                isDark ? 'bg-black/40 border-white/10' : 'bg-neutral-50 border-black/10'
              }`}>
                <span className="text-[11px] font-mono opacity-60 uppercase">In Waiting Queue</span>
                <span className="text-2xl font-black text-amber-400">{waitingCount}</span>
                <span className="text-[10px] opacity-50 font-mono">Next in line</span>
              </div>

              <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                isDark ? 'bg-black/40 border-white/10' : 'bg-neutral-50 border-black/10'
              }`}>
                <span className="text-[11px] font-mono opacity-60 uppercase">Notified / Window Active</span>
                <span className="text-2xl font-black text-blue-400">{notifiedCount}</span>
                <span className="text-[10px] opacity-50 font-mono">2-hour checkout lock</span>
              </div>

              <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                isDark ? 'bg-black/40 border-white/10' : 'bg-neutral-50 border-black/10'
              }`}>
                <span className="text-[11px] font-mono opacity-60 uppercase">Claimed & Converted</span>
                <span className="text-2xl font-black text-emerald-400">{claimedCount}</span>
                <span className="text-[10px] opacity-50 font-mono">Tickets issued</span>
              </div>
            </div>

          </div>

          {/* Action Trigger Box */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Execute Automated Ticket Reclamation</span>
                </h4>
                <p className="text-xs opacity-75 leading-relaxed max-w-xl">
                  Reclaims returned inventory or released production holds. The system automatically pulls the next waiting candidate, locks the ticket for 120 minutes, and dispatches SMS/email.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="opacity-70">Slots:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={ticketReleaseCount}
                    onChange={e => setTicketReleaseCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className={`w-14 p-1.5 text-center font-bold rounded-lg border outline-none ${
                      isDark ? 'bg-black border-white/20' : 'bg-white border-black/20'
                    }`}
                  />
                </div>

                <button
                  onClick={handleRunReclamation}
                  disabled={isProcessing || waitingCount === 0}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                    isDark
                      ? 'bg-amber-400 hover:bg-amber-300 text-black font-extrabold shadow-amber-400/20'
                      : 'bg-black hover:bg-neutral-800 text-white'
                  }`}
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Notify Next {ticketReleaseCount}</span>
                </button>
              </div>
            </div>

            {reclaimFeedback && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{reclaimFeedback}</span>
              </div>
            )}
          </div>

          {/* Waitlist Queue Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Users className="w-4 h-4 opacity-60" />
                <span>Registered Queue Attendees ({eventWaitlist.length})</span>
              </h4>
              <span className="text-[11px] font-mono opacity-50">Priority Monotonic Ordering</span>
            </div>

            {eventWaitlist.length === 0 ? (
              <div className={`p-8 text-center rounded-xl border text-xs opacity-60 font-mono ${
                isDark ? 'border-white/10' : 'border-black/10'
              }`}>
                No waitlist registrations found for this event.
              </div>
            ) : (
              <div className={`rounded-xl border overflow-hidden ${
                isDark ? 'border-white/10 bg-black/30' : 'border-black/10 bg-white'
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className={`font-mono uppercase text-[10px] tracking-wider border-b ${
                      isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-black/5 border-black/10 text-black/60'
                    }`}>
                      <tr>
                        <th className="p-3">Pos</th>
                        <th className="p-3">Attendee</th>
                        <th className="p-3">Preferred Tier</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Claim Window</th>
                        <th className="p-3">Dispatch Channels</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-inherit font-mono">
                      {eventWaitlist.map(entry => {
                        const isNotified = entry.status === 'notified';
                        const isClaimed = entry.status === 'claimed';
                        const isWaiting = entry.status === 'waiting';

                        return (
                          <tr 
                            key={entry.id} 
                            className={`transition-colors ${
                              isNotified ? (isDark ? 'bg-blue-500/5' : 'bg-blue-50/50') : ''
                            }`}
                          >
                            <td className="p-3 font-bold text-amber-400">#{entry.position}</td>
                            <td className="p-3 font-sans">
                              <div className="font-bold">{entry.name || 'Anonymous Guest'}</div>
                              <div className="text-[10px] font-mono opacity-60">{entry.email}</div>
                              {entry.phone && (
                                <div className="text-[10px] font-mono opacity-50">{entry.phone}</div>
                              )}
                            </td>
                            <td className="p-3">{entry.tierName || 'Any Tier'}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                isClaimed
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : isNotified
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse'
                                  : 'bg-white/10 text-white/70'
                              }`}>
                                {entry.status}
                              </span>
                            </td>
                            <td className="p-3">
                              {entry.claimExpiresAt ? (
                                <div className="space-y-0.5">
                                  <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                                    <Timer className="w-3 h-3" />
                                    <span>2h Window Active</span>
                                  </div>
                                  <div className="text-[9px] opacity-60">
                                    Expires: {new Date(entry.claimExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              ) : (
                                <span className="opacity-40">—</span>
                              )}
                            </td>
                            <td className="p-3">
                              {entry.notificationDispatchLog ? (
                                <div className="space-y-0.5 text-[10px]">
                                  <span className="text-emerald-400 block font-bold">
                                    ✓ SendGrid Email Dispatched
                                  </span>
                                  {entry.phone && (
                                    <span className="text-emerald-400 block">
                                      ✓ Twilio SMS Sent
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="opacity-40">Pending Trigger</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              {entry.claimToken && (
                                <button
                                  onClick={() => {
                                    if (onSimulateAttendeeClaim) {
                                      onSimulateAttendeeClaim(entry.claimToken!);
                                    } else {
                                      window.location.href = `/?claimToken=${entry.claimToken}`;
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded text-[10px] font-bold bg-amber-400 text-black hover:bg-amber-300 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                                  title="Open attendee priority claim window"
                                >
                                  Claim as Attendee
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between text-xs font-mono ${
          isDark ? 'border-white/10 bg-black/60' : 'border-black/10 bg-neutral-50'
        }`}>
          <div className="flex items-center gap-2 opacity-60">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographic claim tokens expire automatically after 120 minutes.</span>
          </div>

          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
            }`}
          >
            Close Drawer
          </button>
        </div>

      </div>
    </div>
  );
};
