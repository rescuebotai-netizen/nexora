import React, { useState } from 'react';
import { 
  ArrowLeft,
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Share2, 
  Heart, 
  Download, 
  ChevronRight, 
  ChevronDown,
  Check, 
  Plus, 
  Minus,
  Coins,
  Copy,
  ExternalLink,
  Users,
  Bell,
  Sparkles
} from 'lucide-react';
import { Event, AuthUser } from '../../types';
import { formatCurrency, formatEventDate, formatEventTime } from '../../lib/currencies';
import { store } from '../../lib/store';
import { WaitlistModal } from './WaitlistModal';


interface EventDetailsPageProps {
  event: Event;
  onBack: () => void;
  onStartCheckout: (event: Event, selectedItems: Array<{ tierId: string; quantity: number }>) => void;
  currentCurrency?: string;
  currentUser?: AuthUser | null;
  theme?: 'light' | 'dark';
}

export const EventDetailsPage: React.FC<EventDetailsPageProps> = ({
  event,
  onBack,
  onStartCheckout,
  currentCurrency = 'ZAR',
  currentUser,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  // Selected quantities per tier
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    event.tickets.forEach(t => {
      initial[t.id] = 0;
    });
    if (event.tickets.length > 0 && event.tickets[0].remaining > 0) {
      initial[event.tickets[0].id] = 1;
    }
    return initial;
  });

  const [activeTab, setActiveTab] = useState<'about' | 'agenda' | 'lineup' | 'policies'>('about');
  const [linkCopied, setLinkCopied] = useState(false);
  const [copiedRefCode, setCopiedRefCode] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCalendarMenu, setShowCalendarMenu] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [isOnWaitlist, setIsOnWaitlist] = useState(() => 
    currentUser?.email ? store.isOnWaitlist(event.id, currentUser.email) : false
  );

  // Referral System Code & Link Generation
  const userIdentifier = currentUser ? currentUser.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() : 'NEX';
  const referralCode = `REF-${userIdentifier}${event.id.slice(-3).toUpperCase()}`;
  const referralLink = `${window.location.origin}?event=${event.id}&ref=${referralCode}`;

  const updateQuantity = (tierId: string, delta: number, maxAllowed: number) => {
    setQuantities(prev => {
      const current = prev[tierId] || 0;
      const next = Math.max(0, Math.min(maxAllowed, current + delta));
      return { ...prev, [tierId]: next };
    });
  };

  const totalSelectedTickets = Object.values(quantities).reduce((a, b) => a + b, 0);

  const subtotalMinor = event.tickets.reduce((acc, tier) => {
    const qty = quantities[tier.id] || 0;
    return acc + (qty * tier.priceMinor);
  }, 0);

  const handleBookNow = () => {
    const items = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([tierId, quantity]) => ({ tierId, quantity }));

    if (items.length === 0) return;
    onStartCheckout(event, items);
  };

  const handleShareEvent = () => {
    const eventUrl = `${window.location.origin}?event=${event.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(eventUrl).then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2500);
      }).catch(() => {
        // Fallback prompt
        window.prompt('Copy event URL:', eventUrl);
      });
    } else {
      window.prompt('Copy event URL:', eventUrl);
    }
  };

  const handleCopyReferralCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralCode).then(() => {
        setCopiedRefCode(true);
        setTimeout(() => setCopiedRefCode(false), 2200);
      });
    }
  };

  // Calendar URLs
  const getGoogleCalendarUrl = () => {
    const startIso = new Date(event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endIso = new Date(event.endDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.shortSummary || event.description || '');
    const location = encodeURIComponent(`${event.venue.name}, ${event.venue.address}, ${event.venue.city}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  };

  const getOutlookCalendarUrl = () => {
    const start = encodeURIComponent(new Date(event.startDate).toISOString());
    const end = encodeURIComponent(new Date(event.endDate).toISOString());
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.shortSummary || event.description || '');
    const location = encodeURIComponent(`${event.venue.name}, ${event.venue.address}, ${event.venue.city}`);
    return `https://outlook.live.com/calendar/0/action/compose?subject=${title}&startdt=${start}&enddt=${end}&body=${details}&location=${location}`;
  };

  const totalCapacity = event.tickets.reduce((a, b) => a + b.capacity, 0);
  const totalRemaining = event.tickets.reduce((a, b) => a + b.remaining, 0);
  const percentClaimed = Math.round(((totalCapacity - totalRemaining) / (totalCapacity || 1)) * 100);

  return (
    <div className={`min-h-screen transition-colors ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      
      {/* Top Breadcrumb & Action Strip */}
      <div className={`sticky top-18 z-30 w-full transition-colors ${
        isDark ? 'bg-black/95 text-white' : 'bg-white/95 text-black'
      }`}>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          
          <button
            onClick={onBack}
            className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-opacity cursor-pointer ${
              isDark ? 'text-white hover:opacity-75' : 'text-black hover:opacity-75'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Discover</span>
          </button>

          <div className="flex items-center gap-2.5">
            {/* Link Copied Notification Banner */}
            {linkCopied && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold animate-fade-in ${
                isDark ? 'bg-white text-black' : 'bg-black text-white'
              }`}>
                <Check className="w-3.5 h-3.5" />
                <span>Link Copied</span>
              </span>
            )}

            {/* Share Button (Direct Clipboard Copy with notification) */}
            <button
              onClick={handleShareEvent}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
                linkCopied
                  ? (isDark ? 'bg-white text-black' : 'bg-black text-white')
                  : (isDark ? 'bg-[#121214] hover:bg-[#1f1f24] text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-black')
              }`}
              title="Share Event URL"
            >
              <Share2 className="w-4 h-4" />
              <span>{linkCopied ? 'Link Copied' : 'Share'}</span>
            </button>

            {/* Save to Calendar Button */}
            <div className="relative">
              <button
                onClick={() => setShowCalendarMenu(!showCalendarMenu)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  isDark ? 'bg-[#121214] hover:bg-[#1f1f24] text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-black'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Add to Calendar</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {showCalendarMenu && (
                <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-2xl py-2 z-40 ${
                  isDark ? 'bg-black text-white' : 'bg-white text-black'
                }`}>
                  <a
                    href={getGoogleCalendarUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowCalendarMenu(false)}
                    className={`block px-4 py-2 text-xs transition-colors cursor-pointer ${
                      isDark ? 'hover:bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-black'
                    }`}
                  >
                    Google Calendar
                  </a>
                  <a
                    href={getOutlookCalendarUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowCalendarMenu(false)}
                    className={`block px-4 py-2 text-xs transition-colors cursor-pointer ${
                      isDark ? 'hover:bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-black'
                    }`}
                  >
                    Outlook / Office 365
                  </a>
                </div>
              )}
            </div>

            {/* Favorite Bookmark */}
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isFavorite 
                  ? 'bg-red-500/20 text-red-500' 
                  : (isDark ? 'bg-[#121214] hover:bg-[#1f1f24] text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-black')
              }`}
              title="Bookmark Event"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

        </div>
      </div>

      {/* Main Expansive Webpage Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* Hero Banner Showcase */}
        <div className="relative aspect-[21/9] min-h-[340px] max-h-[520px] w-full rounded-3xl overflow-hidden shadow-2xl">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          {/* Overlaid Event Metadata */}
          <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 text-white space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md">
                {event.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-white/10 backdrop-blur-md">
                {event.format}
              </span>
              <span className="text-xs font-mono text-white/80">
                {event.venue.city}, {event.venue.country}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-white/90 font-mono">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white/70" />
                <span>{formatEventDate(event.startDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white/70" />
                <span>{formatEventTime(event.startDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-white/70" />
                <span>{event.venue.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Main Details & Booking Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column (7 cols): Editorial, Tabs, Lineup, Venue */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Tab Navigation */}
            <div className={`flex items-center gap-2 p-1 rounded-xl ${
              isDark ? 'bg-[#0E0E12]' : 'bg-neutral-100'
            }`}>
              {(['about', 'agenda', 'lineup', 'policies'] as const).map(tabKey => (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                    activeTab === tabKey
                      ? (isDark ? 'bg-white text-black shadow-xs' : 'bg-black text-white shadow-xs')
                      : (isDark ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black')
                  }`}
                >
                  {tabKey}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: ABOUT */}
            {activeTab === 'about' && (
              <div className="space-y-6 leading-relaxed">
                <div className={`p-6 sm:p-8 rounded-2xl ${
                  isDark ? 'bg-[#0E0E12]' : 'bg-neutral-50'
                }`}>
                  <h3 className="text-lg font-bold mb-3 tracking-tight">Experience Overview</h3>
                  <p className="text-sm sm:text-base leading-relaxed opacity-85">
                    {event.description}
                  </p>
                </div>

                {/* Venue Details Card */}
                <div className={`p-6 sm:p-8 rounded-2xl space-y-4 ${
                  isDark ? 'bg-[#0E0E12]' : 'bg-neutral-50'
                }`}>
                  <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Venue Location & Arrival</span>
                  </h3>
                  <div className="text-xs sm:text-sm opacity-80 space-y-1 font-mono">
                    <p className="font-bold text-sm font-sans opacity-100">{event.venue.name}</p>
                    <p>{event.venue.address}</p>
                    <p className="text-[11px] pt-1 opacity-60">Venue Location: {event.venue.city}, {event.venue.country}</p>
                  </div>
                </div>

                {/* Organizer Verification Card */}
                <div className={`p-6 sm:p-8 rounded-2xl flex items-center justify-between gap-4 ${
                  isDark ? 'bg-[#0E0E12]' : 'bg-neutral-50'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base ${
                      isDark ? 'bg-white text-black' : 'bg-black text-white'
                    }`}>
                      {event.organizer.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm">{event.organizer.name}</span>
                        {event.organizer.verified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <p className="text-xs opacity-60 font-mono">
                        {event.organizer.rating} / 5.0 Verified Curator · Fast Door Processing
                      </p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold ${
                    isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
                  }`}>
                    Accredited Host
                  </span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: AGENDA */}
            {activeTab === 'agenda' && (
              <div className={`p-6 sm:p-8 rounded-2xl space-y-4 ${
                isDark ? 'bg-[#0E0E12]' : 'bg-neutral-50'
              }`}>
                <h3 className="text-lg font-bold tracking-tight">Official Schedule</h3>
                {event.agenda && event.agenda.length > 0 ? (
                  <div className="space-y-4">
                    {event.agenda.map((item, idx) => (
                      <div key={idx} className={`p-4 rounded-xl flex items-start gap-4 ${
                        isDark ? 'bg-black/60' : 'bg-white'
                      }`}>
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-white/10 shrink-0">
                          {item.time}
                        </span>
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold">{item.title}</p>
                          <p className="text-xs opacity-60 font-mono">
                            {item.speaker} · {item.stage}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs opacity-60 font-mono">Full schedule bulletin will be published closer to event door open time.</p>
                )}
              </div>
            )}

            {/* TAB CONTENT: LINEUP */}
            {activeTab === 'lineup' && (
              <div className={`p-6 sm:p-8 rounded-2xl space-y-4 ${
                isDark ? 'bg-[#0E0E12]' : 'bg-neutral-50'
              }`}>
                <h3 className="text-lg font-bold tracking-tight">Experience Highlights & Focus</h3>
                {event.tags && event.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag: string, idx: number) => (
                      <span key={idx} className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold ${
                        isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black'
                      }`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs opacity-60 font-mono">Curated performers and headlining talent announced via official newsletters.</p>
                )}
              </div>
            )}

            {/* TAB CONTENT: POLICIES */}
            {activeTab === 'policies' && (
              <div className={`p-6 sm:p-8 rounded-2xl space-y-4 ${
                isDark ? 'bg-[#0E0E12]' : 'bg-neutral-50'
              }`}>
                <h3 className="text-lg font-bold tracking-tight">Entry Rules & Refund Terms</h3>
                <div className="space-y-4 text-xs sm:text-sm opacity-85 leading-relaxed">
                  <div>
                    <h4 className="font-bold mb-1">Age Policy:</h4>
                    <p>{event.ageRestriction || 'All ages welcome. Minor attendees must be accompanied by an adult pass holder.'}</p>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Refund & Transfer:</h4>
                    <p>{event.refundPolicy || 'Refunds permitted up to 7 days before event start date. Pass transfers free of charge in your Ticket Wallet.'}</p>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Gate Validation:</h4>
                    <p>Tickets are issued with tamper-evident digital tokens. Duplicate check-ins and screenshots will be rejected by gate optical scanners.</p>
                  </div>
                  {event.faqs && event.faqs.length > 0 && (
                    <div className="pt-4 border-t border-white/10 space-y-3">
                      <h4 className="font-bold">Frequently Asked Questions</h4>
                      {event.faqs.map(faq => (
                        <div key={faq.id} className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-1">
                          <strong className="block text-xs font-bold">{faq.question}</strong>
                          <p className="text-xs opacity-75">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Right Column (5 cols): Ticket Selection & Checkout Console */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className={`p-6 sm:p-8 rounded-3xl space-y-6 sticky top-28 ${
              isDark ? 'bg-[#0E0E12]' : 'bg-neutral-50'
            }`}>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold tracking-tight">Admission Passes</h3>
                  <p className="text-xs opacity-60 font-mono">Select tier quantities</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold opacity-60 block">Remaining</span>
                  <span className="text-xs font-mono font-bold">
                    {totalRemaining} / {totalCapacity}
                  </span>
                </div>
              </div>

              {/* Tier Selection Rows */}
              <div className="space-y-3">
                {event.tickets.map(tier => {
                  const qty = quantities[tier.id] || 0;
                  const isSoldOut = tier.remaining === 0;

                  return (
                    <div
                      key={tier.id}
                      className={`p-4 rounded-2xl transition-all ${
                        qty > 0 
                          ? (isDark ? 'bg-black text-white' : 'bg-white text-black')
                          : (isDark ? 'bg-black/50 text-white/80' : 'bg-white/70 text-black/80')
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-sm">{tier.name}</h4>
                          <p className="text-xs opacity-60 leading-snug">{tier.description}</p>
                          <span className="text-xs font-bold font-mono block pt-1">
                            {formatCurrency(tier.priceMinor, event.currency)}
                          </span>
                        </div>

                        {/* Quantity Counter */}
                        {isSoldOut ? (
                          <span className="text-xs font-bold text-red-500 font-mono">Sold Out</span>
                        ) : (
                          <div className={`flex items-center gap-2 p-1 rounded-xl ${
                            isDark ? 'bg-[#141418]' : 'bg-neutral-100'
                          }`}>
                            <button
                              onClick={() => updateQuantity(tier.id, -1, tier.maxPerOrder)}
                              disabled={qty === 0}
                              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs disabled:opacity-30 cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-5 text-center font-mono font-bold text-xs">{qty}</span>
                            <button
                              onClick={() => updateQuantity(tier.id, 1, Math.min(tier.maxPerOrder, tier.remaining))}
                              disabled={qty >= Math.min(tier.maxPerOrder, tier.remaining)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs disabled:opacity-30 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Subtotal Summary */}
              <div className={`pt-4 border-t space-y-2 text-xs font-mono ${
                isDark ? 'border-white/10' : 'border-black/10'
              }`}>
                <div className="flex justify-between">
                  <span className="opacity-60">Total Tickets:</span>
                  <span className="font-bold">{totalSelectedTickets}</span>
                </div>
                <div className="flex justify-between text-sm font-sans font-bold">
                  <span>Subtotal:</span>
                  <span className="font-mono text-base">{formatCurrency(subtotalMinor, event.currency)}</span>
                </div>
              </div>

              {/* Checkout Action Button OR Waitlist Button if capacity reached */}
              {totalRemaining === 0 ? (
                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Capacity Reached · All Tiers Sold Out</span>
                    </div>
                    <p className="text-xs opacity-80 leading-relaxed font-mono">
                      This experience has reached maximum venue capacity. Join the waitlist to receive an automated notification if held tickets or refunds are released.
                    </p>
                  </div>

                  {isOnWaitlist ? (
                    <button
                      type="button"
                      onClick={() => setIsWaitlistOpen(true)}
                      className="w-full py-4 text-xs font-bold font-mono tracking-wider uppercase rounded-xl transition-all cursor-pointer bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-2 hover:bg-emerald-500/30"
                    >
                      <Check className="w-4 h-4" />
                      <span>You are on the Waitlist (View Queue)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsWaitlistOpen(true)}
                      className={`w-full py-4 text-xs font-bold tracking-wider uppercase rounded-xl transition-all cursor-pointer shadow-xl flex items-center justify-center gap-2 ${
                        isDark
                          ? 'bg-amber-400 hover:bg-amber-300 text-black font-extrabold shadow-amber-400/20'
                          : 'bg-black hover:bg-neutral-800 text-white'
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                      <span>Join Official Waitlist</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleBookNow}
                  disabled={totalSelectedTickets === 0}
                  className={`w-full py-4 text-xs font-bold tracking-wider uppercase rounded-xl transition-all cursor-pointer shadow-xl disabled:opacity-40 disabled:cursor-not-allowed ${
                    isDark
                      ? 'bg-white hover:bg-neutral-200 text-black'
                      : 'bg-black hover:bg-neutral-800 text-white'
                  }`}
                >
                  Proceed to Checkout ({totalSelectedTickets})
                </button>
              )}

              {/* Referral Promotion Card */}
              <div className={`p-4 rounded-2xl text-xs space-y-2 ${
                isDark ? 'bg-black/60' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold">Share with Friends</span>
                  <span className="text-[10px] font-mono opacity-60">Earn 5% Credit</span>
                </div>
                <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
                  <span className="truncate opacity-80">{referralCode}</span>
                  <button
                    onClick={handleCopyReferralCode}
                    className="font-bold underline cursor-pointer shrink-0"
                  >
                    {copiedRefCode ? 'Copied' : 'Copy Code'}
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Waitlist Modal */}
      {isWaitlistOpen && (
        <WaitlistModal
          event={event}
          isOpen={isWaitlistOpen}
          onClose={() => setIsWaitlistOpen(false)}
          currentUser={currentUser}
          theme={theme}
          onSuccess={() => setIsOnWaitlist(true)}
        />
      )}

    </div>
  );
};
