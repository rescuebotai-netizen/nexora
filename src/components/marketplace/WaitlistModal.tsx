import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Users, 
  Bell, 
  CheckCircle2, 
  Mail, 
  User as UserIcon, 
  Phone, 
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Event, AuthUser, WaitlistEntry } from '../../types';
import { store } from '../../lib/store';
import { formatCurrency, formatEventDate } from '../../lib/currencies';

interface WaitlistModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: AuthUser | null;
  theme?: 'light' | 'dark';
  onSuccess?: (entry: WaitlistEntry) => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({
  event,
  isOpen,
  onClose,
  currentUser,
  theme = 'dark',
  onSuccess
}) => {
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedTierId, setSelectedTierId] = useState<string>('any');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ entry: WaitlistEntry; message: string; isNew: boolean } | null>(null);
  const [existingPosition, setExistingPosition] = useState<number | null>(null);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.email) setEmail(currentUser.email);
      if (currentUser.name) setName(currentUser.name);
    }
  }, [currentUser, isOpen]);

  useEffect(() => {
    if (isOpen && email) {
      const waitlist = store.getWaitlistForEvent(event.id);
      const userEntry = waitlist.find(w => w.email.trim().toLowerCase() === email.trim().toLowerCase());
      if (userEntry) {
        setExistingPosition(userEntry.position);
      } else {
        setExistingPosition(null);
      }
    }
  }, [isOpen, email, event.id]);

  if (!isOpen) return null;

  const currentWaitlist = store.getWaitlistForEvent(event.id);
  const waitlistCount = currentWaitlist.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const selectedTier = event.tickets.find(t => t.id === selectedTierId);
      const res = store.joinWaitlist({
        eventId: event.id,
        eventTitle: event.title,
        email: email.trim(),
        name: name.trim() || undefined,
        tierId: selectedTierId !== 'any' ? selectedTierId : undefined,
        tierName: selectedTier ? selectedTier.name : 'Any Tier',
        phone: phone.trim() || undefined
      });

      setIsSubmitting(false);
      setResult(res);

      if (res.isNew) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      }

      if (onSuccess) {
        onSuccess(res.entry);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all ${
          isDark 
            ? 'bg-[#0E0E12] border-white/15 text-white' 
            : 'bg-white border-black/15 text-black'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`p-6 border-b flex items-start justify-between gap-4 ${
          isDark ? 'border-white/10 bg-white/2' : 'border-black/10 bg-black/2'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider uppercase opacity-70">
                Official Queue Alert
              </span>
            </div>
            <h3 className="text-xl font-black tracking-tight leading-snug">
              Join Waitlist
            </h3>
            <p className="text-xs opacity-75 max-w-sm line-clamp-1">
              {event.title}
            </p>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'hover:bg-white/10 text-white/70' : 'hover:bg-black/10 text-black/70'
            }`}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {result ? (
            /* Success State */
            <div className="text-center py-4 space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/5">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-lg font-black tracking-tight">
                  {result.isNew ? "You're on the Waitlist!" : "Waitlist Status Confirmed"}
                </h4>
                <p className={`text-xs max-w-sm mx-auto leading-relaxed ${
                  isDark ? 'text-white/70' : 'text-black/70'
                }`}>
                  {result.message}
                </p>
              </div>

              {/* Digital Queue Pass */}
              <div className={`p-4 rounded-xl border text-left space-y-3 font-mono text-xs ${
                isDark ? 'bg-black/60 border-white/10' : 'bg-neutral-50 border-black/10'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-inherit">
                  <span className="opacity-60">Queue Priority Position:</span>
                  <span className="font-bold text-amber-400 text-sm">#{result.entry.position}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-60">Registered Email:</span>
                  <span className="font-bold truncate max-w-[200px]">{result.entry.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-60">Preferred Tier:</span>
                  <span className="font-bold">{result.entry.tierName || 'Any Tier'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-60">Status:</span>
                  <span className="text-emerald-400 font-bold capitalize">{result.entry.status}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs opacity-60">
                <Clock className="w-3.5 h-3.5" />
                <span>You will have a 2-hour exclusive window once tickets unlock.</span>
              </div>

              <button
                onClick={onClose}
                className={`w-full py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg ${
                  isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                }`}
              >
                Done
              </button>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Event Context Pill Strip */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-mono ${
                isDark ? 'bg-black/50 border-white/10' : 'bg-neutral-50 border-black/10'
              }`}>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong className="text-amber-400">{waitlistCount}</strong> currently waiting
                  </span>
                </div>
                <span className="opacity-60">{formatEventDate(event.startDate)}</span>
              </div>

              {existingPosition && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>You are already in queue at position #{existingPosition}.</span>
                </div>
              )}

              {/* Input Fields */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all ${
                        isDark 
                          ? 'bg-black/40 border-white/15 focus:border-amber-400 text-white' 
                          : 'bg-white border-black/15 focus:border-amber-600 text-black'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Sipho Zulu"
                        className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all ${
                          isDark 
                            ? 'bg-black/40 border-white/15 focus:border-amber-400 text-white' 
                            : 'bg-white border-black/15 focus:border-amber-600 text-black'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                      Mobile SMS Alert
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+27 82 000 0000"
                        className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all ${
                          isDark 
                            ? 'bg-black/40 border-white/15 focus:border-amber-400 text-white' 
                            : 'bg-white border-black/15 focus:border-amber-600 text-black'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Preferred Ticket Tier Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                    Preferred Ticket Tier
                  </label>
                  <select
                    value={selectedTierId}
                    onChange={e => setSelectedTierId(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition-all cursor-pointer font-mono ${
                      isDark 
                        ? 'bg-black/40 border-white/15 focus:border-amber-400 text-white' 
                        : 'bg-white border-black/15 focus:border-amber-600 text-black'
                    }`}
                  >
                    <option value="any">Any Available Tier (Fastest allocation)</option>
                    {event.tickets.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({formatCurrency(t.priceMinor, event.currency)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guarantees */}
              <div className="space-y-2 pt-1 text-[11px] opacity-75">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Zero-spam guarantee. Alerts only triggered on verified ticket releases.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Instant email & SMS dispatch via Twilio / SendGrid infrastructure.</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className={`w-full py-4 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark
                    ? 'bg-amber-400 hover:bg-amber-300 text-black font-extrabold shadow-amber-400/10'
                    : 'bg-black hover:bg-neutral-800 text-white'
                }`}
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                    Registering Queue Position...
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Join Waitlist for {event.title.split(' ')[0]}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
