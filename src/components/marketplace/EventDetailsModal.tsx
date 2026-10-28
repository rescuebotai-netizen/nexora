import React, { useState } from 'react';
import { 
  X, 
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
  Gift,
  Coins,
  Copy,
  ExternalLink,
  MessageCircle,
  Twitter
} from 'lucide-react';
import { Event, AuthUser } from '../../types';
import { formatCurrency, formatEventDate, formatEventTime } from '../../lib/currencies';

interface EventDetailsModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onStartCheckout: (event: Event, selectedItems: Array<{ tierId: string; quantity: number }>) => void;
  currentCurrency: string;
  currentUser?: AuthUser | null;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
  onStartCheckout,
  currentCurrency,
  currentUser,
}) => {
  if (!isOpen) return null;

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
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRefCode, setCopiedRefCode] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCalendarMenu, setShowCalendarMenu] = useState(false);

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

  const handleCopyReferralLink = () => {
    navigator.clipboard?.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard?.writeText(referralCode);
    setCopiedRefCode(true);
    setTimeout(() => setCopiedRefCode(false), 2200);
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

  // Generate downloadable ICS file for Apple Calendar & iCal
  const handleDownloadCalendar = () => {
    const startIso = new Date(event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endIso = new Date(event.endDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//NEXORA//Events//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${event.id}@nexora.events`,
      `DTSTAMP:${startIso}`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.shortSummary || event.description}`,
      `LOCATION:${event.venue.name}, ${event.venue.address}, ${event.venue.city}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.slug}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowCalendarMenu(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#111827]/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-[#E5E7EB] overflow-hidden my-auto max-h-[95vh] flex flex-col text-[#111827]">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#F8F7F4]">
          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <span className="font-semibold text-[#111827]">{event.category}</span>
            <span>·</span>
            <span>{event.venue.city}, {event.venue.country}</span>
          </div>

          <div className="flex items-center gap-2">
            {copiedLink && (
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-600 text-white animate-fade-in shadow-xs">
                Link Copied
              </span>
            )}
            <button
              onClick={() => {
                const eventUrl = `${window.location.origin}?event=${event.id}`;
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(eventUrl).then(() => {
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2500);
                  });
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#111827] transition-colors cursor-pointer"
              title="Share event link"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
            </button>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 text-[#4B5563] hover:text-[#111827] hover:bg-[#E5E7EB] rounded-lg transition-colors cursor-pointer"
              title="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#E11D48] text-[#E11D48]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#4B5563] hover:text-[#111827] hover:bg-[#E5E7EB] rounded-lg transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Header Media Banner */}
          <div className="relative aspect-[21/9] w-full bg-[#111827] overflow-hidden">
            <img
              src={event.coverImage}
              alt={event.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#F6A623]">
                {event.format === 'in_person' ? 'Live In-Person Experience' : event.format.toUpperCase()}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {event.title}
              </h2>
            </div>
          </div>

          {/* 2-Column Split Body */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Details, Tabs, Schedule, Organizer & Referral System */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Event Time & Venue Meta Box + Multi-Calendar Integration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F8F7F4] border border-[#E5E7EB]">
                
                {/* Date, Time & Add to Calendar Menu */}
                <div className="flex items-start gap-3 relative">
                  <div className="p-2.5 bg-white rounded-xl border border-[#E5E7EB] text-[#F6A623] shrink-0 shadow-xs">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Date & Time</h4>
                    <p className="text-sm font-bold text-[#111827]">{formatEventDate(event.startDate)}</p>
                    <p className="text-xs text-[#6B7280]">{formatEventTime(event.startDate)} ({event.timezone})</p>
                    
                    {/* Interactive 'Add to Calendar' Dropdown Button */}
                    <div className="relative mt-2">
                      <button
                        onClick={() => setShowCalendarMenu(!showCalendarMenu)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-white hover:bg-gray-50 text-[#111827] border border-gray-200 rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#F6A623]" />
                        <span>Add to Calendar</span>
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                      </button>

                      {showCalendarMenu && (
                        <div className="absolute top-full left-0 mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-30 animate-fade-in text-xs font-medium text-gray-700">
                          <a
                            href={getGoogleCalendarUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setShowCalendarMenu(false)}
                            className="flex items-center justify-between px-3.5 py-2 hover:bg-gray-50 text-gray-900 transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                              <span>Google Calendar</span>
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                          </a>

                          <button
                            type="button"
                            onClick={handleDownloadCalendar}
                            className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-gray-50 text-left text-gray-900 transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-gray-900" />
                              <span>Apple Calendar / iCal</span>
                            </span>
                            <Download className="w-3.5 h-3.5 text-gray-400" />
                          </button>

                          <a
                            href={getOutlookCalendarUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setShowCalendarMenu(false)}
                            className="flex items-center justify-between px-3.5 py-2 hover:bg-gray-50 text-gray-900 transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-cyan-600" />
                              <span>Outlook Calendar</span>
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Venue Location */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-white rounded-xl border border-[#E5E7EB] text-[#F6A623] shrink-0 shadow-xs">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Location</h4>
                    <p className="text-sm font-bold text-[#111827]">{event.venue.name}</p>
                    <p className="text-xs text-[#6B7280]">{event.venue.address}, {event.venue.city}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue.name} ${event.venue.address} ${event.venue.city}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#F6A623] hover:underline font-semibold"
                    >
                      View on Google Maps
                      <ChevronRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>

              </div>

              {/* ========================================================= */}
              {/* REFERRAL SYSTEM: INVITE FRIENDS & EARN REWARDS MODULE    */}
              {/* ========================================================= */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-[#F8F7F4] to-white border border-[#D7B779]/40 space-y-4 shadow-xs">
                
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#101522] text-[#D7B779] flex items-center justify-center shadow-xs">
                      <Gift className="w-5 h-5 text-[#D7B779]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-[#101522] flex items-center gap-1.5">
                        <span>Share & Earn: Nexora Referral Rewards</span>
                        <span className="text-[10px] font-mono font-bold bg-[#D7B779]/20 text-[#856404] px-1.5 py-0.2 rounded border border-[#D7B779]/30">
                          Active
                        </span>
                      </h4>
                      <p className="text-xs text-gray-600">
                        Give friends <strong>10% off</strong> their tickets. You earn <strong>150 Loyalty Points</strong> (R75 / $5 credit) when they purchase!
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-xs font-bold text-[#856404] bg-white px-2.5 py-1 rounded-lg border border-[#D7B779]/30 shadow-xs">
                      <Coins className="w-3.5 h-3.5 text-[#D7B779]" />
                      <span>150 Pts / Friend</span>
                    </div>
                  </div>
                </div>

                {/* Unique Link & Code Copy Strip */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Unique referral URL */}
                    <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-2xs">
                      <input 
                        type="text" 
                        readOnly 
                        value={referralLink} 
                        className="w-full text-xs text-gray-700 bg-transparent font-mono focus:outline-none truncate" 
                      />
                    </div>
                    <button
                      onClick={handleCopyReferralLink}
                      className="px-3.5 py-2 bg-[#101522] hover:bg-[#1a2236] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>

                  {/* Share action buttons (WhatsApp, X, Code) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      {/* WhatsApp Share */}
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hey! I'm going to ${event.title}. Use my link to get 10% off your tickets: ${referralLink}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-lg transition-colors cursor-pointer text-[11px] shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Share on WhatsApp</span>
                      </a>

                      {/* Twitter / X Share */}
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join me at ${event.title}! Get 10% off tickets with my referral code ${referralCode}: ${referralLink} #NexoraEvents`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-gray-800 text-white font-bold rounded-lg transition-colors cursor-pointer text-[11px] shadow-xs"
                      >
                        <Twitter className="w-3.5 h-3.5" />
                        <span>Share on X</span>
                      </a>
                    </div>

                    {/* Direct Code Snippet */}
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-600 bg-white/80 px-2.5 py-1 rounded-lg border border-gray-200">
                      <span>Code:</span>
                      <strong className="font-mono text-[#101522]">{referralCode}</strong>
                      <button 
                        onClick={handleCopyReferralCode}
                        className="text-[#D7B779] hover:text-[#856404] font-bold ml-1 cursor-pointer"
                        title="Copy code"
                      >
                        {copiedRefCode ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Loyalty Tier Progress Bar */}
                <div className="pt-2 border-t border-[#D7B779]/20 flex items-center justify-between text-[11px] text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D7B779]" />
                    <span>Loyalty Status: <strong>Nexora Gold Member</strong></span>
                  </div>
                  <span className="font-mono">450 Pts Available (R225 Credit)</span>
                </div>

              </div>

              {/* Verified Organizer Profile Strip */}
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold text-sm">
                    {event.organizer.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-[#111827]">{event.organizer.name}</span>
                      {event.organizer.verified && (
                        <span title="Verified Organizer" className="inline-flex">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#6B7280]">
                      {event.organizer.rating} / 5.0 Verified Curator
                    </span>
                  </div>
                </div>
                <div className="text-xs font-semibold text-[#4B5563] bg-[#F8F7F4] px-2.5 py-1 rounded-lg border border-gray-200">
                  Official Host
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="border-b border-[#E5E7EB] flex items-center gap-6 text-sm">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`pb-2.5 font-medium transition-colors cursor-pointer ${
                    activeTab === 'about'
                      ? 'border-b-2 border-[#F6A623] text-[#111827] font-bold'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  About Event
                </button>
                {event.agenda && event.agenda.length > 0 && (
                  <button
                    onClick={() => setActiveTab('agenda')}
                    className={`pb-2.5 font-medium transition-colors cursor-pointer ${
                      activeTab === 'agenda'
                        ? 'border-b-2 border-[#F6A623] text-[#111827] font-bold'
                        : 'text-[#6B7280] hover:text-[#111827]'
                    }`}
                  >
                    Schedule & Agenda
                  </button>
                )}
                {event.performers && event.performers.length > 0 && (
                  <button
                    onClick={() => setActiveTab('lineup')}
                    className={`pb-2.5 font-medium transition-colors cursor-pointer ${
                      activeTab === 'lineup'
                        ? 'border-b-2 border-[#F6A623] text-[#111827] font-bold'
                        : 'text-[#6B7280] hover:text-[#111827]'
                    }`}
                  >
                    Speakers & Lineup
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('policies')}
                  className={`pb-2.5 font-medium transition-colors cursor-pointer ${
                    activeTab === 'policies'
                      ? 'border-b-2 border-[#F6A623] text-[#111827] font-bold'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  Policies
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === 'about' && (
                <div className="space-y-4 text-sm text-[#374151] leading-relaxed">
                  <p className="whitespace-pre-line">{event.description}</p>
                  
                  {/* Event Tags */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    {event.tags.map(t => (
                      <span key={t} className="text-xs text-[#6B7280] bg-[#F8F7F4] px-2.5 py-1 rounded border border-[#E5E7EB]">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'agenda' && event.agenda && (
                <div className="space-y-3">
                  {event.agenda.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-3.5 bg-[#F8F7F4] rounded-xl border border-[#E5E7EB]">
                      <div className="font-mono font-bold text-xs text-[#F6A623] w-14 shrink-0 pt-0.5">
                        {item.time}
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-sm font-semibold text-[#111827]">{item.title}</div>
                        {item.speaker && (
                          <div className="text-xs text-[#6B7280]">Speaker: {item.speaker}</div>
                        )}
                        {item.description && (
                          <div className="text-xs text-[#4B5563]">{item.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'lineup' && event.performers && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {event.performers.map((perf, idx) => (
                    <div key={idx} className="p-3 bg-[#F8F7F4] rounded-xl border border-[#E5E7EB] flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold text-xs">
                        {perf.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#111827]">{perf.name}</div>
                        <div className="text-xs text-[#6B7280]">{perf.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'policies' && (
                <div className="space-y-4 text-xs text-[#4B5563] bg-[#F8F7F4] p-4 rounded-xl border border-[#E5E7EB]">
                  <div>
                    <h5 className="font-bold text-[#111827] mb-1">Refund Policy</h5>
                    <p>{event.refundPolicy}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-[#111827] mb-1">Age & Admission Requirements</h5>
                    <p>{event.ageRestriction || 'Open to all age categories.'}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-[#111827] mb-1">Verification & QR Entry</h5>
                    <p>Every attendee must present their official NEXORA digital or printed QR pass at the entrance gate. Re-entry requires digital scan out.</p>
                  </div>
                  {event.faqs && event.faqs.length > 0 && (
                    <div className="pt-3 border-t border-[#E5E7EB] space-y-2">
                      <h5 className="font-bold text-[#111827]">Frequently Asked Questions</h5>
                      {event.faqs.map(faq => (
                        <div key={faq.id} className="p-2.5 rounded-lg bg-white border border-[#E5E7EB]">
                          <strong className="block text-[#111827] mb-0.5">{faq.question}</strong>
                          <p className="text-[#6B7280]">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Right Column: Ticket Purchase Module */}
            <div className="lg:col-span-5">
              <div className="sticky top-4 bg-[#111827] text-white rounded-2xl border border-[#1F2937] p-5 shadow-xl space-y-5">
                
                <div className="border-b border-[#374151] pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Select Tickets</h3>
                    <p className="text-xs text-[#9CA3AF]">Instant reservation held during checkout</p>
                  </div>
                  <span className="text-xs font-mono bg-[#1F2937] text-[#F6A623] px-2 py-0.5 rounded border border-[#374151]">
                    {event.currency}
                  </span>
                </div>

                {/* Ticket Tiers List */}
                <div className="space-y-3">
                  {event.tickets.map((tier) => {
                    const isSoldOut = tier.remaining <= 0;
                    const qty = quantities[tier.id] || 0;

                    return (
                      <div
                        key={tier.id}
                        className={`p-3.5 rounded-xl border transition-colors ${
                          qty > 0
                            ? 'bg-[#1F2937] border-[#F6A623]'
                            : 'bg-[#1F2937]/60 border-[#374151]'
                        } ${isSoldOut ? 'opacity-60 pointer-events-none' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-bold text-white flex items-center gap-1.5">
                              <span>{tier.name}</span>
                              {isSoldOut && (
                                <span className="text-[10px] text-red-400 bg-red-950/80 px-1.5 py-0.2 rounded font-mono">
                                  Sold Out
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#9CA3AF] mt-0.5 line-clamp-2">
                              {tier.description}
                            </p>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <span className="text-sm font-bold text-white font-mono-tabular">
                              {formatCurrency(tier.priceMinor, tier.currency)}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        {!isSoldOut && (
                          <div className="mt-3 pt-2 border-t border-[#374151]/50 flex items-center justify-between">
                            <span className="text-[11px] text-[#9CA3AF]">
                              {tier.remaining < 20 ? `${tier.remaining} left` : 'Available'}
                            </span>
                            
                            <div className="flex items-center gap-2 bg-[#111827] rounded-lg p-1 border border-[#374151]">
                              <button
                                onClick={() => updateQuantity(tier.id, -1, tier.maxPerOrder)}
                                disabled={qty === 0}
                                className="w-6 h-6 flex items-center justify-center rounded text-white hover:bg-[#1F2937] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-6 text-center text-xs font-bold font-mono">
                                {qty}
                              </span>
                              <button
                                onClick={() => updateQuantity(tier.id, 1, Math.min(tier.remaining, tier.maxPerOrder))}
                                disabled={qty >= Math.min(tier.remaining, tier.maxPerOrder)}
                                className="w-6 h-6 flex items-center justify-center rounded text-white hover:bg-[#1F2937] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Subtotal Calculation */}
                <div className="pt-2 border-t border-[#374151] space-y-1.5">
                  <div className="flex justify-between text-xs text-[#9CA3AF]">
                    <span>Selected Tickets</span>
                    <span className="font-mono">{totalSelectedTickets}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white">
                    <span>Subtotal</span>
                    <span className="font-mono-tabular text-[#F6A623]">
                      {formatCurrency(subtotalMinor, event.currency)}
                    </span>
                  </div>
                </div>

                {/* Primary CTA */}
                <button
                  onClick={handleBookNow}
                  disabled={totalSelectedTickets === 0}
                  className="w-full py-3 bg-[#F6A623] hover:bg-[#E59516] disabled:bg-[#374151] disabled:text-[#6B7280] disabled:cursor-not-allowed text-[#111827] font-bold text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Proceed to Checkout</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-center text-[#9CA3AF]">
                  Official tickets issued with cryptographically signed QR code.
                </p>

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
