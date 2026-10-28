import React, { useState } from 'react';
import { Calendar, MapPin, Heart, Share2, Check, Clock, Bell, Sparkles } from 'lucide-react';
import { Event, AuthUser } from '../../types';
import { formatCurrency, formatEventDate } from '../../lib/currencies';
import { store } from '../../lib/store';
import { WaitlistModal } from './WaitlistModal';

interface EventCardProps {
  event: Event;
  currentCurrency: string;
  onSelect: (event: Event) => void;
  currentUser?: AuthUser | null;
  theme?: 'light' | 'dark';
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onSelect,
  currentUser,
  theme = 'dark',
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [hasJoinedWaitlist, setHasJoinedWaitlist] = useState(() => {
    return currentUser?.email ? store.isOnWaitlist(event.id, currentUser.email) : false;
  });

  const isDark = theme === 'dark';

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(window.location.origin + '?event=' + event.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleOpenWaitlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWaitlistOpen(true);
  };

  // Check inventory alert & capacity
  const totalRemaining = event.tickets.reduce((acc, t) => acc + t.remaining, 0);
  const isSoldOut = totalRemaining === 0;
  const isLowStock = totalRemaining > 0 && totalRemaining < 50;

  return (
    <>
      <div
        onClick={() => onSelect(event)}
        className={`group rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-xs ${
          isDark
            ? 'bg-[#0A0A0C] border-white/15 text-white hover:border-white/50 hover:bg-[#111114]'
            : 'bg-white border-black/15 text-black hover:border-black/50 hover:shadow-md'
        }`}
      >
        <div>
          {/* Cover Image Container */}
          <div className={`relative aspect-[16/10] w-full overflow-hidden ${isDark ? 'bg-[#121214]' : 'bg-neutral-100'}`}>
            <img
              src={event.coverImage}
              alt={event.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Scrim overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

            {/* Floating Actions */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
              <button
                onClick={handleShare}
                className={`p-1.5 rounded-full backdrop-blur-md transition-colors cursor-pointer shadow-sm ${
                  isDark ? 'bg-black/70 hover:bg-black text-white' : 'bg-white/80 hover:bg-white text-black'
                }`}
                title="Share event link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleFavorite}
                className={`p-1.5 rounded-full backdrop-blur-md transition-colors cursor-pointer shadow-sm ${
                  isDark ? 'bg-black/70 hover:bg-black' : 'bg-white/80 hover:bg-white'
                }`}
                title="Save to favorites"
              >
                <Heart
                  className={`w-3.5 h-3.5 transition-colors ${
                    isFavorite ? 'fill-[#E11D48] text-[#E11D48]' : (isDark ? 'text-white/80' : 'text-black/80')
                  }`}
                />
              </button>
            </div>

            {/* Format badge if online or hybrid */}
            {event.format !== 'in_person' && (
              <div className={`absolute top-2.5 left-2.5 backdrop-blur-md text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                isDark ? 'bg-black/80 text-white border border-white/20' : 'bg-white/90 text-black border border-black/20'
              }`}>
                {event.format === 'hybrid' ? 'Hybrid' : 'Online'}
              </div>
            )}

            {/* Low inventory or sold out indicator */}
            {isSoldOut ? (
              <div className="absolute bottom-2.5 left-2.5 bg-red-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <span>Sold Out · At Capacity</span>
              </div>
            ) : isLowStock ? (
              <div className={`absolute bottom-2.5 left-2.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                isDark ? 'bg-white text-black' : 'bg-black text-white'
              }`}>
                Limited Tickets
              </div>
            ) : null}
          </div>

          {/* Card Body */}
          <div className="p-4 space-y-2">
            
            {/* Metadata */}
            <div className={`flex items-center gap-1.5 text-xs font-mono ${
              isDark ? 'text-white/60' : 'text-black/60'
            }`}>
              <span className="font-semibold">{event.category}</span>
              <span>·</span>
              <span className="truncate">{event.venue.city}</span>
            </div>

            {/* Event Title */}
            <h3 className={`text-base font-bold leading-snug line-clamp-2 transition-colors ${
              isDark ? 'text-white group-hover:text-white/80' : 'text-black group-hover:text-black/80'
            }`}>
              {event.title}
            </h3>

            {/* Date & Time */}
            <div className={`flex items-center gap-1.5 text-xs pt-0.5 ${
              isDark ? 'text-white/80' : 'text-black/80'
            }`}>
              <Calendar className="w-3.5 h-3.5 shrink-0 opacity-70" />
              <span className="font-medium">{formatEventDate(event.startDate)}</span>
            </div>

            {/* Venue */}
            <div className={`flex items-center gap-1.5 text-xs ${
              isDark ? 'text-white/60' : 'text-black/60'
            }`}>
              <MapPin className="w-3.5 h-3.5 shrink-0 opacity-70" />
              <span className="truncate">{event.venue.name}</span>
            </div>

          </div>
        </div>

        {/* Card Footer: Price & Organizer OR Join Waitlist */}
        <div className={`px-4 py-3 border-t flex items-center justify-between text-xs ${
          isDark 
            ? 'bg-black/60 border-white/10' 
            : 'bg-neutral-50 border-black/10'
        }`}>
          {isSoldOut ? (
            /* SOLD OUT / CAPACITY REACHED: Prominent 'Join Waitlist' CTA */
            <div className="w-full flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Capacity Reached
                </span>
                <span className={`text-[10px] opacity-60 font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                  Auto-alert on releases
                </span>
              </div>

              {hasJoinedWaitlist ? (
                <button
                  type="button"
                  onClick={handleOpenWaitlist}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 cursor-pointer hover:bg-emerald-500/30 transition-all"
                  title="View your waitlist position"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>On Waitlist</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenWaitlist}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono bg-amber-400 hover:bg-amber-300 text-black shadow-xs hover:shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Join Waitlist</span>
                </button>
              )}
            </div>
          ) : (
            /* REGULAR ACTIVE EVENT */
            <>
              <div className={`truncate max-w-[150px] font-mono text-[11px] ${
                isDark ? 'text-white/50' : 'text-black/50'
              }`}>
                By {event.organizer.name}
              </div>
              <div className="text-right">
                <span className={`text-[9px] block uppercase tracking-wider font-mono ${
                  isDark ? 'text-white/50' : 'text-black/50'
                }`}>
                  From
                </span>
                <span className={`text-sm font-bold font-mono-tabular ${
                  isDark ? 'text-white' : 'text-black'
                }`}>
                  {formatCurrency(event.minPriceMinor, event.currency)}
                </span>
              </div>
            </>
          )}
        </div>

      </div>

      {/* Embedded Waitlist Modal */}
      {isWaitlistOpen && (
        <WaitlistModal
          event={event}
          isOpen={isWaitlistOpen}
          onClose={() => setIsWaitlistOpen(false)}
          currentUser={currentUser}
          theme={theme}
          onSuccess={() => setHasJoinedWaitlist(true)}
        />
      )}
    </>
  );
};
