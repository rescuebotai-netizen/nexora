import React, { useState } from 'react';
import { 
  Heart, 
  Share2, 
  Check, 
  Camera, 
  Sparkles, 
  Star, 
  ExternalLink,
  MessageCircle,
  ShieldCheck
} from 'lucide-react';
import { CommunityHighlight, Event } from '../../types';
import { store } from '../../lib/store';

interface CommunityPulseProps {
  events: Event[];
  onSelectEvent?: (event: Event) => void;
  theme?: 'light' | 'dark';
}

export const CommunityPulse: React.FC<CommunityPulseProps> = ({
  events,
  onSelectEvent,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  const [highlights, setHighlights] = useState<CommunityHighlight[]>(() => 
    store.getCommunityHighlights()
  );
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = store.likeCommunityHighlight(id);
    if (updated) {
      setHighlights(prev => prev.map(h => (h.id === id ? updated : h)));
    }
  };

  const handleShareHighlight = (id: string, quote: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`"${quote}" — shared from Nexora Community Pulse`);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleEventClick = (eventId: string) => {
    const matched = events.find(e => e.id === eventId);
    if (matched && onSelectEvent) {
      onSelectEvent(matched);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filteredHighlights = highlights.filter(h => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'instagram' || selectedFilter === 'x' || selectedFilter === 'tiktok') {
      return h.platform === selectedFilter;
    }
    return h.eventId === selectedFilter;
  });

  return (
    <section className={`w-full py-16 border-t transition-colors reveal-on-scroll ${
      isDark ? 'bg-[#060608] border-white/10 text-white' : 'bg-neutral-50 border-black/10 text-black'
    }`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-inherit">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase opacity-70">
              <Camera className="w-4 h-4 text-amber-400" />
              <span>Attendee Verified Gallery</span>
              <span>·</span>
              <span className="text-amber-400">Live Dispatches</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Community Pulse
            </h2>

            <p className={`text-sm sm:text-base leading-relaxed ${
              isDark ? 'text-white/70' : 'text-black/70'
            }`}>
              Real moments captured by ticket holders, festival goers, and tech delegates across Africa's premier events. Cryptographically verified check-ins and genuine post-event highlights.
            </p>
          </div>

          {/* Filter Segmented Controls */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-inherit self-start md:self-end">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedFilter === 'all'
                  ? (isDark ? 'bg-white text-black font-bold shadow-xs' : 'bg-black text-white font-bold shadow-xs')
                  : (isDark ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black')
              }`}
            >
              All Drops
            </button>
            <button
              onClick={() => setSelectedFilter('instagram')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedFilter === 'instagram'
                  ? (isDark ? 'bg-white text-black font-bold shadow-xs' : 'bg-black text-white font-bold shadow-xs')
                  : (isDark ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black')
              }`}
            >
              Instagram
            </button>
            <button
              onClick={() => setSelectedFilter('x')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedFilter === 'x'
                  ? (isDark ? 'bg-white text-black font-bold shadow-xs' : 'bg-black text-white font-bold shadow-xs')
                  : (isDark ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black')
              }`}
            >
              X (Twitter)
            </button>
            <button
              onClick={() => setSelectedFilter('tiktok')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedFilter === 'tiktok'
                  ? (isDark ? 'bg-white text-black font-bold shadow-xs' : 'bg-black text-white font-bold shadow-xs')
                  : (isDark ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black')
              }`}
            >
              TikTok
            </button>
          </div>
        </div>

        {/* MASONRY GRID LAYOUT */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {filteredHighlights.map(item => {
            const isPortrait = item.aspectRatio === 'portrait';
            const isTall = item.aspectRatio === 'tall';

            return (
              <div
                key={item.id}
                className={`break-inside-avoid rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col group ${
                  isDark 
                    ? 'bg-[#0C0C10] border-white/10 hover:border-white/30 text-white' 
                    : 'bg-white border-black/10 hover:border-black/30 text-black'
                }`}
              >
                {/* Media Image Container with Scrim & Top Meta */}
                <div 
                  className={`relative w-full overflow-hidden cursor-pointer ${
                    isTall ? 'aspect-[3/4]' : isPortrait ? 'aspect-[4/5]' : 'aspect-square'
                  }`}
                  onClick={() => handleEventClick(item.eventId)}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.eventTitle}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Top Bar on Image: Platform indicator & Share */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md bg-black/60 text-white border border-white/20">
                      {item.platform}
                    </span>

                    <button
                      onClick={(e) => handleShareHighlight(item.id, item.quote, e)}
                      className="p-1.5 rounded-full backdrop-blur-md bg-black/60 text-white hover:bg-black transition-colors cursor-pointer border border-white/10"
                      title="Share highlight"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Bottom Strip on Image: Event Reference */}
                  <div className="absolute bottom-3 left-3 right-3 z-10">
                    <div className="text-white text-xs font-bold leading-snug drop-shadow flex items-center gap-1.5 hover:underline">
                      <span className="line-clamp-1">{item.eventTitle}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-80" />
                    </div>
                  </div>
                </div>

                {/* Card Body & Attendee Meta */}
                <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                  
                  {/* Quote / Highlight Text */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                    <p className={`text-xs sm:text-sm leading-relaxed ${
                      isDark ? 'text-white/85' : 'text-black/85'
                    }`}>
                      "{item.quote}"
                    </p>
                  </div>

                  {/* Author Information Strip */}
                  <div className="pt-3 border-t border-inherit flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.authorAvatar}
                        alt={item.authorName}
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/20"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs truncate">{item.authorName}</span>
                          <span title="Verified Ticket Holder" className="inline-flex items-center">
                            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                          </span>
                        </div>
                        <div className="text-[10px] font-mono opacity-60 truncate">
                          {item.authorHandle} · {item.roleBadge}
                        </div>
                      </div>
                    </div>

                    {/* Like Button */}
                    <button
                      onClick={(e) => handleLike(item.id, e)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer shrink-0 border ${
                        item.userLiked
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                          : isDark
                            ? 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
                            : 'bg-black/5 hover:bg-black/10 text-black/70 border-black/10'
                      }`}
                      title={item.userLiked ? 'Unlike' : 'Like post'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${item.userLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span className="text-[11px] font-bold">{item.likesCount}</span>
                    </button>
                  </div>

                  {/* Footer Meta: City & Timestamp */}
                  <div className="flex items-center justify-between text-[10px] font-mono opacity-50 pt-0.5">
                    <span>{item.city}</span>
                    <span>{item.timestamp}</span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
