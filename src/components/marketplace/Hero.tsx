import React from 'react';
import { Event } from '../../types';

// Import S003_Tour_SC_6604 hero image
import s003TourSc from '../../assets/images/S003_Tour_SC_6604.jpg';

interface HeroProps {
  featuredEvent?: Event;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCity: string;
  setSelectedCity: (c: string) => void;
  onExploreEvent?: (event: Event) => void;
  onQuickSearch: () => void;
  theme?: 'light' | 'dark';
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCity,
  setSelectedCity,
  onQuickSearch,
  theme = 'dark',
}) => {
  const cities = ['All Cities', 'Cape Town', 'Nairobi', 'Lagos', 'Johannesburg', 'Accra', 'Kigali'];
  const isDark = theme === 'dark';

  return (
    <section
      className={`relative overflow-hidden min-h-[580px] sm:min-h-[640px] flex items-center transition-colors w-full ${
        isDark ? 'bg-black text-white' : 'bg-white text-black'
      }`}
    >
      {/* Background: S003_Tour_SC_6604 in the hero section background with 50% opacity */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
        <img
          src={s003TourSc}
          alt="Stadium Tour Background"
          className={`w-full h-full object-cover transform scale-105 transition-transform duration-[8000ms] ease-out opacity-70 ${
            isDark ? 'filter brightness-90 contrast-110' : 'filter brightness-105 contrast-105'
          }`}
        />

        {/* Ambient Overlays tailored for ultra-clean readability & 80/20 contrast */}
        {isDark ? (
          <>
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/75 to-black/40" />
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/85 via-black/50 to-black/80" />
            <div className="absolute inset-0 z-10 bg-black/25 backdrop-blur-[0.5px]" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-white via-white/80 to-white/50" />
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-white/85 via-white/55 to-white/80" />
            <div className="absolute inset-0 z-10 bg-white/30 backdrop-blur-[0.5px]" />
          </>
        )}
      </div>

      {/* Main Content Container */}
      <div className="relative z-30 w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-16 sm:py-24 text-center space-y-8 animate-text-zoom">
        {/* Display Headline with Zoom-in and Bounce interactive animations */}
        <div className="space-y-4 max-w-5xl mx-auto">
          <h1
            className={`text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] interactive-text ${
              isDark ? 'text-white' : 'text-black'
            }`}
          >
            Your Next Great <br className="hidden sm:inline" />
            <span className="animate-text-bounce">Experience Starts Here.</span>
          </h1>
          <p
            className={`text-base sm:text-xl max-w-3xl mx-auto leading-relaxed interactive-text ${
              isDark ? 'text-white/85' : 'text-black/85'
            }`}
          >
            Discover, book, and attend live concerts, innovation summits, festivals, and cultural gatherings across Africa and the global diaspora.
          </p>
        </div>

        {/* Integrated Search Strip */}
        <div
          className={`max-w-4xl mx-auto backdrop-blur-xl rounded-2xl p-3 shadow-2xl space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2 transition-all border ${
            isDark
              ? 'bg-black/80 text-white border-white/10 shadow-black/80'
              : 'bg-white/90 text-black border-black/10 shadow-black/10'
          }`}
        >
          {/* Keyword Input */}
          <div
            className={`flex-1 flex items-center px-4 py-3 rounded-xl ${
              isDark ? 'bg-[#101012] text-white border border-white/5' : 'bg-neutral-50 text-black border border-black/5'
            }`}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search festival, artist, venue, conference..."
              className={`w-full bg-transparent text-sm focus:outline-none ${
                isDark ? 'text-white placeholder-white/40' : 'text-black placeholder-black/40'
              }`}
              onKeyDown={(e) => e.key === 'Enter' && onQuickSearch()}
            />
          </div>

          {/* City Selector */}
          <div
            className={`sm:w-52 flex items-center px-3 py-3 rounded-xl ${
              isDark ? 'bg-[#101012] text-white border border-white/5' : 'bg-neutral-50 text-black border border-black/5'
            }`}
          >
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className={`w-full bg-transparent text-xs focus:outline-none cursor-pointer ${
                isDark ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              {cities.map((city) => (
                <option key={city} value={city} className={isDark ? 'bg-black text-white' : 'bg-white text-black'}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Search CTA Button (High Contrast 80/20) */}
          <button
            onClick={onQuickSearch}
            className={`w-full sm:w-auto px-8 py-3.5 font-bold text-xs tracking-wide rounded-xl transition-all cursor-pointer flex items-center justify-center whitespace-nowrap shrink-0 shadow-lg interactive-text ${
              isDark
                ? 'bg-white hover:bg-neutral-200 text-black'
                : 'bg-black hover:bg-neutral-800 text-white'
            }`}
          >
            <span>Find Events</span>
          </button>
        </div>

        {/* Trending Suggestions */}
        <div
          className={`flex items-center justify-center flex-wrap gap-2 pt-2 text-xs ${
            isDark ? 'text-white/70' : 'text-black/70'
          }`}
        >
          <span className="font-medium opacity-60">Trending:</span>
          {['Amapiano Festivals', 'Tech Summits', 'Food & Wine', 'Art Exhibitions'].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSearchQuery(tag.split(' ')[0]);
                onQuickSearch();
              }}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer interactive-text ${
                isDark
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-black/5 hover:bg-black/10 text-black'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Trust Badges without emojis or icons */}
        <div
          className={`pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-mono ${
            isDark ? 'text-white/60' : 'text-black/60'
          }`}
        >
          <div className="flex items-center gap-2 interactive-text">
            <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`} />
            <span>48,000+ Verified Passes Issued</span>
          </div>
          <div className="flex items-center gap-2 interactive-text">
            <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`} />
            <span>14 African Currencies Supported</span>
          </div>
          <div className="flex items-center gap-2 interactive-text">
            <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`} />
            <span>Sub-Second Gate QR Scanning</span>
          </div>
        </div>
      </div>
    </section>
  );
};
