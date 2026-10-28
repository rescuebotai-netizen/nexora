import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/navigation/Navbar';
import { Footer } from './components/navigation/Footer';
import { Hero } from './components/marketplace/Hero';
import { EventCard } from './components/marketplace/EventCard';
import { EventDetailsPage } from './components/marketplace/EventDetailsPage';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { TicketWalletPage } from './components/wallet/TicketWalletPage';
import { AuthPage } from './components/auth/AuthPage';
import { TicketScannerModal } from './components/scanner/TicketScannerModal';
import { OrganizerPortal } from './components/organizer/OrganizerPortal';
import { SuperAdminPlatform } from './components/admin/SuperAdminPlatform';
import { CommunityPulse } from './components/marketplace/CommunityPulse';
import { LegalPage } from './components/navigation/LegalPage';
import { store } from './lib/store';
import { Event, Ticket, AuthUser } from './types';
import { 
  ShieldCheck, 
  Smartphone, 
  Zap, 
  MapPin, 
  Search, 
  FilterX, 
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Users,
  CreditCard,
  QrCode,
  Tag,
  BarChart3,
  Layers,
  Mail,
  Send,
  Check,
  Building,
  Phone,
  Radio,
  Lock,
  Cpu,
  ChevronDown,
  ChevronUp,
  HelpCircle
} from 'lucide-react';

// Names of companies for Trusted by section (names only, no logos, no emojis, no descriptions)
const TRUSTED_COMPANIES = [
  'Steyn Entertainment',
  'Afro Nation',
  'Event Horizon',
  'House of Funk',
  'Blankets & Wine',
  'House On Fire',
  'Showtime Management',
  'Ultra South Africa',
  'Eclipse Live',
  'Gidi Culture Festival',
  'Hidden Culture',
  'Vic Falls Carnival',
  'Nyege Nyege Collective',
  'Busara Promotions',
  'The Grid',
  'EatDrinkFestival',
];

export default function App() {
  // Navigation & View Routing: Landing page / Public Marketplace appears first as requested
  const [activeView, setActiveView] = useState<'marketplace' | 'organizer' | 'scanner' | 'admin' | 'terms' | 'privacy' | 'security' | 'event' | 'checkout' | 'wallet' | 'auth'>('marketplace');

  // Overall Platform Theme: 80% Black / 20% White (Dark) and 80% White / 20% Black (Light)
    // Contact & Partnership Lead Form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactOrganization, setContactOrganization] = useState('');
  const [contactEstimatedAttendees, setContactEstimatedAttendees] = useState('5,000 - 25,000');
  const [contactCountry, setContactCountry] = useState('South Africa');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);

  // Active feature tab for interactive animated feature showcase
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);



  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('nexora_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('nexora_theme', next);
      return next;
    });
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#000000';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#FFFFFF';
    }
  }, [theme]);
  
  // Data state
  const [events, setEvents] = useState<Event[]>(store.getEvents());
  const [tickets, setTickets] = useState<Ticket[]>(store.getTickets());
  const [currency, setCurrency] = useState<string>(store.getSelectedCurrency());

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFormat, setSelectedFormat] = useState<string>('All');

  // IntersectionObserver to reveal texts on scroll-down and disappear on scroll-up
  useEffect(() => {
    if (activeView !== "marketplace") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          } else {
            // Disappear when scrolled past or scrolled back up out of view
            entry.target.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    const elements = document.querySelectorAll(".reveal-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [activeView, events, selectedCategory, selectedCity, selectedFormat]);

  // Modals
  const [inspectEvent, setInspectEvent] = useState<Event | null>(null);
  const [checkoutEvent, setCheckoutEvent] = useState<Event | null>(null);
  const [checkoutItems, setCheckoutItems] = useState<Array<{ tierId: string; quantity: number }>>([]);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(store.getCurrentUser());

  // Sync state on updates
  const refreshData = () => {
    setEvents(store.getEvents());
    setTickets(store.getTickets());
  };

  // Direct shared link & waitlist claim token listener
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');
    const claimToken = params.get('claimToken');

    if (claimToken) {
      const res = store.claimWaitlistTicket(claimToken);
      if (res.success && res.event && res.entry) {
        setInspectEvent(res.event);
        const tierId = res.entry.tierId || res.event.tickets[0]?.id;
        if (tierId) {
          setCheckoutEvent(res.event);
          setCheckoutItems([{ tierId, quantity: 1 }]);
          setActiveView('checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } else if (eventId) {
      const found = events.find(e => e.id === eventId);
      if (found) {
        setInspectEvent(found);
        setActiveView('event');
      }
    }
  }, [events]);

  // Strict Role Route Guards:
  // - Buyer can only see tickets and Marketplace
  // - Organizer can see tickets and Organizer portal
  // - Admin must be connected to the Super Admin
  useEffect(() => {
    if (currentUser?.role === 'attendee') {
      if (activeView === 'organizer' || activeView === 'admin' || activeView === 'scanner') {
        setActiveView('marketplace');
      }
    } else if (currentUser?.role === 'organizer') {
      if (activeView === 'admin' || activeView === 'scanner') {
        setActiveView('organizer');
      }
    } else if (!currentUser) {
      if (activeView === 'admin' || activeView === 'organizer' || activeView === 'scanner') {
        setActiveView('marketplace');
      }
    }
  }, [currentUser, activeView]);

  const handleCurrencyChange = (curr: string) => {
    setCurrency(curr);
    store.setSelectedCurrency(curr);
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(q);
        const matchDesc = e.description.toLowerCase().includes(q);
        const matchVenue = e.venue.name.toLowerCase().includes(q) || e.venue.city.toLowerCase().includes(q);
        const matchOrg = e.organizer.name.toLowerCase().includes(q);
        const matchTag = e.tags.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchVenue && !matchOrg && !matchTag) return false;
      }

      // City
      if (selectedCity !== 'All Cities' && e.venue.city !== selectedCity) {
        return false;
      }

      // Category
      if (selectedCategory !== 'All' && e.category !== selectedCategory) {
        return false;
      }

      // Format
      if (selectedFormat !== 'All' && e.format !== selectedFormat) {
        return false;
      }

      return true;
    });
  }, [events, searchQuery, selectedCity, selectedCategory, selectedFormat]);

  // Featured Hero Event
  const featuredEvent = events.find(e => e.featured) || events[0];

  const categories = [
    'All',
    'Concerts & Music',
    'Tech & Innovation',
    'Food & Wine',
    'Arts & Culture',
  ];

  const formats = [
    { label: 'All Formats', value: 'All' },
    { label: 'In-Person', value: 'in_person' },
    { label: 'Hybrid', value: 'hybrid' },
    { label: 'Online', value: 'online' },
  ];

  // Dynamic Schema.org JSON-LD for SEO
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: events.map((e, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'Event',
          name: e.title,
          startDate: e.startDate,
          endDate: e.endDate,
          eventAttendanceMode: e.format === 'online' 
            ? 'https://schema.org/OnlineEventAttendanceMode'
            : 'https://schema.org/OfflineEventAttendanceMode',
          location: {
            '@type': 'Place',
            name: e.venue.name,
            address: {
              '@type': 'PostalAddress',
              addressLocality: e.venue.city,
              addressCountry: e.venue.country,
            },
          },
          organizer: {
            '@type': 'Organization',
            name: e.organizer.name,
          },
          offers: {
            '@type': 'Offer',
            price: (e.minPriceMinor / 100).toFixed(2),
            priceCurrency: e.currency,
            availability: 'https://schema.org/InStock',
            url: window.location.origin,
          },
        },
      })),
    });
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [events]);

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      
      {/* Top Bar Navigation (shown on Public Marketplace, Scanner, Admin) */}
      {activeView !== 'organizer' && (
        <Navbar
          activeView={activeView}
          setActiveView={setActiveView}
          onOpenWallet={() => {
            setActiveView('wallet');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          ticketCount={tickets.length}
          onOpenAuth={(mode) => {
            setAuthMode(mode || 'login');
            setActiveView('auth');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          currentUser={currentUser}
          onLogout={() => {
            store.logout();
            setCurrentUser(null);
          }}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}



      {/* Main View Router */}
      <main className="flex-1">
        
        {/* VIEW 1: ORGANIZER PORTAL */}
        {activeView === 'organizer' && (
          <OrganizerPortal
            onBackToMarketplace={() => setActiveView('marketplace')}
            onEventCreated={(newEvt) => {
              refreshData();
              setInspectEvent(newEvt);
            }}
            onLaunchScanner={() => setActiveView('scanner')}
            onOpenAuth={(mode) => {
              setAuthMode(mode || 'login');
              setIsAuthOpen(true);
            }}
          />
        )}

        {/* VIEW 2: CHECK-IN SCANNER */}
        {activeView === 'scanner' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <TicketScannerModal
              isOpen={true}
              onClose={() => setActiveView('marketplace')}
              events={events}
            />
          </div>
        )}

        {/* VIEW 3: SUPER ADMIN CONTROL PLATFORM */}
        {activeView === 'admin' && (
          <SuperAdminPlatform
            onBackToMarketplace={() => {
              setActiveView('marketplace');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenOrganizerPortal={() => {
              setActiveView('organizer');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenGuestScanner={() => {
              setActiveView('scanner');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            theme={isDark ? 'dark' : 'light'}
          />
        )}

        {/* VIEW 4: PUBLIC MARKETPLACE */}
        {activeView === 'marketplace' && (
          <div>
            
            {/* Active Waitlist Priority Allocation Banner */}
            {currentUser && store.getActiveClaimForUser(currentUser.email) && (() => {
              const claim = store.getActiveClaimForUser(currentUser.email)!;
              return (
                <div className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black py-3 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs shadow-xl z-20">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-black animate-pulse shrink-0" />
                    <span className="font-extrabold uppercase tracking-wider">
                      Waitlist Allocation Unlocked!
                    </span>
                    <span className="hidden md:inline font-sans font-medium text-black/85">
                      Held tickets for <strong>{claim.eventTitle}</strong> released for your account. 2-Hour exclusive claim window active.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const found = events.find(e => e.id === claim.eventId);
                      if (found) {
                        setInspectEvent(found);
                        const tierId = claim.tierId || found.tickets[0]?.id;
                        if (tierId) {
                          setCheckoutEvent(found);
                          setCheckoutItems([{ tierId, quantity: 1 }]);
                          setActiveView('checkout');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }
                    }}
                    className="px-4 py-1.5 rounded-lg bg-black text-white hover:bg-neutral-800 font-bold transition-all cursor-pointer whitespace-nowrap shadow-md text-xs uppercase tracking-wider"
                  >
                    Claim Pass Now
                  </button>
                </div>
              );
            })()}

            {/* Curated Hero Section with Background YouTube Video */}
            <Hero
              featuredEvent={featuredEvent}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              onExploreEvent={(evt) => {
                setInspectEvent(evt);
                setActiveView('event');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onQuickSearch={() => {
                const el = document.getElementById('events-catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              theme={theme}
            />

            {/* Catalog Discovery Section expanded corner to corner */}
            <section id="events-catalog" className="w-full reveal-on-scroll px-4 sm:px-6 lg:px-8 xl:px-12 py-12 space-y-8">
              
              {/* Filter Controls Header */}
              <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 ${
                isDark ? 'border-white/15' : 'border-black/15'
              }`}>
                
                {/* Category Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                        selectedCategory === cat
                          ? (isDark ? 'bg-white text-black font-bold shadow-xs' : 'bg-black text-white font-bold shadow-xs')
                          : (isDark 
                              ? 'bg-[#101012] text-white/70 border border-white/20 hover:text-white hover:border-white/40' 
                              : 'bg-neutral-100 text-black/70 border border-black/15 hover:text-black hover:border-black/30')
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Format Filter Segment */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className={`flex items-center gap-1 p-1 rounded-lg border ${
                    isDark ? 'bg-[#101012] border-white/20' : 'bg-neutral-100 border-black/15'
                  }`}>
                    {formats.map(fmt => (
                      <button
                        key={fmt.value}
                        onClick={() => setSelectedFormat(fmt.value)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                          selectedFormat === fmt.value
                            ? (isDark ? 'bg-white text-black font-bold' : 'bg-black text-white font-bold')
                            : (isDark ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black')
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>

                  {(searchQuery || selectedCity !== 'All Cities' || selectedCategory !== 'All' || selectedFormat !== 'All') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCity('All Cities');
                        setSelectedCategory('All');
                        setSelectedFormat('All');
                      }}
                      className="px-2.5 py-1 text-xs text-red-500 hover:bg-red-500/10 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      title="Reset filters"
                    >
                      <FilterX className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Reset</span>
                    </button>
                  )}
                </div>

              </div>

              {/* Event Cards Grid */}
              {filteredEvents.length === 0 ? (
                <div className={`py-20 text-center space-y-4 rounded-2xl border ${
                  isDark ? 'bg-[#0B0B0E] border-white/15 text-white' : 'bg-neutral-50 border-black/15 text-black'
                }`}>
                  <div className={`w-14 h-14 rounded-full border flex items-center justify-center mx-auto ${
                    isDark ? 'bg-black border-white/20 text-white/50' : 'bg-white border-black/20 text-black/50'
                  }`}>
                    <Search className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold">No events found</h3>
                    <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                      No experiences matched your current query. Broaden your filters or explore other categories.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCity('All Cities');
                      setSelectedCategory('All');
                      setSelectedFormat('All');
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs ${
                      isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                    }`}
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 w-full">
                  {filteredEvents.map(evt => (
                    <EventCard
                      key={evt.id}
                      event={evt}
                      currentCurrency={currency}
                      currentUser={currentUser}
                      onSelect={(e) => {
                        setInspectEvent(e);
                        setActiveView('event');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      theme={theme}
                    />
                  ))}
                </div>
              )}

            </section>

            {/* ========================================================= */}
            {/* COMMUNITY PULSE: MASONRY GRID OF ATTENDEE HIGHLIGHTS      */}
            {/* ========================================================= */}
            <CommunityPulse
              events={events}
              onSelectEvent={(e) => {
                setInspectEvent(e);
                setActiveView('event');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              theme={theme}
            />


            {/* ========================================================= */}
            {/* TRUSTED BY SECTION: ANIMATED FROM LEFT TO RIGHT          */}
            {/* ONLY company names, no logos, no emojis, no descriptions */}
            {/* ========================================================= */}
            <section className={`py-14 border-y overflow-hidden transition-colors reveal-on-scroll ${
              isDark 
                ? 'bg-black border-white/15 text-white' 
                : 'bg-white border-black/15 text-black'
            }`}>
              <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 mb-6 text-center">
                <span className={`text-xs uppercase tracking-[0.25em] font-mono font-bold ${
                  isDark ? 'text-white/60' : 'text-black/60'
                }`}>
                  Trusted by
                </span>
              </div>

              {/* Moving marquee: animated from left to right */}
              <div className="relative w-full overflow-hidden">
                {/* Edge fade scrims */}
                <div className={`absolute top-0 bottom-0 left-0 w-24 sm:w-48 z-10 pointer-events-none ${
                  isDark 
                    ? 'bg-gradient-to-r from-black to-transparent' 
                    : 'bg-gradient-to-r from-white to-transparent'
                }`} />
                <div className={`absolute top-0 bottom-0 right-0 w-24 sm:w-48 z-10 pointer-events-none ${
                  isDark 
                    ? 'bg-gradient-to-l from-black to-transparent' 
                    : 'bg-gradient-to-l from-white to-transparent'
                }`} />

                <div className="animate-marquee-ltr py-2 flex items-center gap-10 sm:gap-16 whitespace-nowrap">
                  {[...TRUSTED_COMPANIES, ...TRUSTED_COMPANIES, ...TRUSTED_COMPANIES].map((companyName, idx) => (
                    <div key={`${companyName}-${idx}`} className="flex items-center gap-10 sm:gap-16 shrink-0">
                      <span className={`text-lg sm:text-2xl font-black tracking-tight uppercase select-none transition-opacity ${
                        isDark 
                          ? 'text-white hover:text-white/80' 
                          : 'text-black hover:text-black/80'
                      }`}>
                        {companyName}
                      </span>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        isDark ? 'bg-white/30' : 'bg-black/30'
                      }`} />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Pan-African Commerce Trust & Infrastructure Section */}
            <section className={`py-16 my-8 border-y transition-colors reveal-on-scroll ${
              isDark ? 'bg-[#050507] border-white/15 text-white' : 'bg-neutral-50 border-black/15 text-black'
            }`}>
              <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
                
                <div className="w-full mb-12 space-y-2">
                  <span className={`text-xs uppercase tracking-widest font-mono font-bold ${
                    isDark ? 'text-white/70' : 'text-black/70'
                  }`}>
                    Infrastructure Architecture
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                    Engineered for Africa. Built for the World.
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                    NEXORA solves the fragmentation of African event commerce with localized payments, instant fraud-proof QR validation, and compliant multi-currency settlements.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  
                  {/* Pillar 1 */}
                  <div className={`p-6 rounded-2xl border space-y-3 shadow-xs ${
                    isDark ? 'bg-[#0E0E12] border-white/15 text-white' : 'bg-white border-black/15 text-black'
                  }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      isDark ? 'bg-white text-black' : 'bg-black text-white'
                    }`}>
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold">
                      Localized African Payment Rails
                    </h3>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                      Native support for M-Pesa in Kenya, Ozow Instant EFT in South Africa, Paystack and Flutterwave cards across Nigeria and Ghana, plus international credit cards.
                    </p>
                  </div>

                  {/* Pillar 2 */}
                  <div className={`p-6 rounded-2xl border space-y-3 shadow-xs ${
                    isDark ? 'bg-[#0E0E12] border-white/15 text-white' : 'bg-white border-black/15 text-black'
                  }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      isDark ? 'bg-white text-black' : 'bg-black text-white'
                    }`}>
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold">
                      Cryptographic Anti-Fraud Passports
                    </h3>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                      Each ticket contains a tamper-evident digital token. The Guest Ticket Scanner engine prevents pass-backs, duplicate check-ins, and counterfeit gate entry with sub-second feedback.
                    </p>
                  </div>

                  {/* Pillar 3 */}
                  <div className={`p-6 rounded-2xl border space-y-3 shadow-xs ${
                    isDark ? 'bg-[#0E0E12] border-white/15 text-white' : 'bg-white border-black/15 text-black'
                  }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      isDark ? 'bg-white text-black' : 'bg-black text-white'
                    }`}>
                      <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold">
                      Double-Entry Authoritative Ledger
                    </h3>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                      Financial transactions are recorded into an immutable double-entry journal. Organizers receive transparent, verifiable settlements directly into their local bank accounts.
                    </p>
                  </div>

                </div>

              </div>
            </section>

            {/* ========================================================= */}
            {/* PLATFORM FEATURES SUITE: PREMIUM, MINIMAL & ANIMATED       */}
            {/* CORNER-TO-CORNER EXPANSION                                */}
            {/* ========================================================= */}
            <section className={`w-full py-24 border-b transition-colors relative overflow-hidden reveal-on-scroll ${
              isDark ? 'bg-black border-white/15 text-white' : 'bg-white border-black/15 text-black'
            }`}>
              <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 space-y-16">
                
                {/* Header Strip - Corner to Corner */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-inherit">
                  <div className="space-y-4 max-w-3xl">
                    <div className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest ${
                      isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Architecture Suite • Version 3.4</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] interactive-text animate-text-zoom">
                      Engineered for Maximum Scale. Built with Precision.
                    </h2>
                    <p className={`text-base sm:text-lg leading-relaxed ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                      An ultra-resilient operating system powering Africa's most demanding festivals, stadium tours, and corporate congresses. Every subsystem is decoupled, cryptographically verified, and continuously monitored.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 shrink-0">
                    {currentUser?.role === 'attendee' ? (
                      <button
                        onClick={() => {
                          setActiveView('wallet');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`px-6 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2.5 shadow-xl ${
                          isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                        }`}
                      >
                        <span>View My Tickets</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : currentUser?.role === 'admin' ? (
                      <button
                        onClick={() => {
                          setActiveView('admin');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-6 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2.5 shadow-xl bg-amber-500 text-black hover:bg-amber-400"
                      >
                        <ShieldCheck className="w-4 h-4 text-black" />
                        <span>Super Admin Platform</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveView('organizer');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`px-6 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2.5 shadow-xl ${
                          isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                        }`}
                      >
                        <span>Open Organizer Studio</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Interactive Animated Subsystem Controller */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Left Column: Interactive Feature Nav Selector (Minimalist, Apple/Stripe inspired) */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
                    {[
                      {
                        idx: 0,
                        title: 'Pan-African Payment Engine',
                        tag: '14 Currencies • M-Pesa • Instant EFT',
                        desc: 'Native routing via Paystack, Flutterwave, M-Pesa, Ozow, and Stripe with automatic FX settlement.',
                        icon: CreditCard,
                        stat: '99.98% Auth Rate',
                      },
                      {
                        idx: 1,
                        title: 'Sub-Second Cryptographic Gate Scanner',
                        tag: 'Offline Resilient • Optical Engine',
                        desc: 'Hardware and mobile camera pass verification that prevents screenshot resale and pass-backs.',
                        icon: QrCode,
                        stat: '< 0.8s Scan Latency',
                      },
                      {
                        idx: 2,
                        title: 'High-Throughput Tiered Inventory',
                        tag: 'Capacity Caps • Dynamic Releases',
                        desc: 'Early Bird triggers, phased tranches, VIP guestlists, and strict prevention of overselling.',
                        icon: Tag,
                        stat: '100% Oversell Proof',
                      },
                      {
                        idx: 3,
                        title: 'Double-Entry Authoritative Ledger',
                        tag: 'Immutable • Real-Time Payouts',
                        desc: 'Automated escrow, fee pass-through configurations, and daily bank account settlement journals.',
                        icon: BarChart3,
                        stat: 'T+1 Bank Settlement',
                      },
                      {
                        idx: 4,
                        title: 'Offline Digital Passports & Wallet',
                        tag: 'Apple Wallet • PDF • Web Pass',
                        desc: 'Encrypted attendee passes stored natively on consumer phones with zero connectivity requirements.',
                        icon: ShieldCheck,
                        stat: 'Zero Paper Waste',
                      },
                      {
                        idx: 5,
                        title: '9-Stage Guided Event Studio',
                        tag: 'Real-Time Desktop & Mobile Preview',
                        desc: 'Agendas, speaker matrices, venue geo-fencing, readiness diagnostics, and live ticket simulation.',
                        icon: Layers,
                        stat: '5 Min Setup',
                      },
                    ].map((item) => {
                      const IconComp = item.icon;
                      const isActive = activeFeatureIndex === item.idx;
                      return (
                        <div
                          key={item.idx}
                          onClick={() => setActiveFeatureIndex(item.idx)}
                          className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                            isActive
                              ? (isDark 
                                  ? 'bg-[#121216] border-white shadow-2xl translate-x-2' 
                                  : 'bg-neutral-100 border-black shadow-lg translate-x-2')
                              : (isDark
                                  ? 'bg-[#08080A] border-white/10 hover:border-white/30 hover:bg-[#0D0D11]'
                                  : 'bg-white border-black/10 hover:border-black/30 hover:bg-neutral-50')
                          }`}
                        >
                          {/* Active highlight indicator bar */}
                          {isActive && (
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isDark ? 'bg-white' : 'bg-black'}`} />
                          )}
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              isActive 
                                ? (isDark ? 'bg-white text-black' : 'bg-black text-white')
                                : (isDark ? 'bg-white/10 text-white group-hover:bg-white/20' : 'bg-black/5 text-black group-hover:bg-black/10')
                            }`}>
                              <IconComp className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className={`text-sm font-bold truncate ${isActive ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-white/80' : 'text-black/80')}`}>
                                  {item.title}
                                </h3>
                                <span className={`text-[10px] font-mono shrink-0 px-2 py-0.5 rounded border ${
                                  isActive
                                    ? (isDark ? 'border-white/30 bg-white/10 text-white font-bold' : 'border-black/30 bg-black/10 text-black font-bold')
                                    : (isDark ? 'border-white/10 text-white/50' : 'border-black/10 text-black/50')
                                }`}>
                                  {item.stat}
                                </span>
                              </div>
                              <p className={`text-xs line-clamp-2 ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Column: High-Fidelity Animated Deep-Dive Display Terminal */}
                  <div className="lg:col-span-7 flex flex-col">
                    <div className={`flex-1 rounded-2xl border p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden transition-all duration-500 shadow-2xl ${
                      isDark 
                        ? 'bg-[#0A0A0E] border-white/20 text-white' 
                        : 'bg-neutral-50 border-black/20 text-black'
                    }`}>
                      {/* Ambient corner glow */}
                      <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none opacity-20 blur-[100px] bg-gradient-to-br from-white/20 to-transparent" />

                      <div className="space-y-6 relative z-10">
                        {/* Terminal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-inherit">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            <span className="text-xs font-mono font-bold uppercase tracking-wider">
                              Subsystem Live Telemetry: Mode Active
                            </span>
                          </div>
                          <span className={`text-xs font-mono px-2.5 py-1 rounded-md border ${
                            isDark ? 'border-white/15 bg-white/5 text-white/70' : 'border-black/15 bg-black/5 text-black/70'
                          }`}>
                            NODE-0{activeFeatureIndex + 1} // AFRICA-CORE
                          </span>
                        </div>

                        {/* Dynamic Active Feature Title */}
                        {activeFeatureIndex === 0 && (
                          <div className="space-y-6 animate-fadeIn">
                            <div className="space-y-2">
                              <h3 className="text-2xl sm:text-4xl font-black tracking-tight">Pan-African Payment Orchestration</h3>
                              <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-white/75' : 'text-black/75'}`}>
                                Unifies fragmented continental payment ecosystems into a single frictionless checkout modal. Buyers pay in their home currency while organizers receive domestic bank wire settlement.
                              </p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                              {[
                                { rail: 'M-PESA', region: 'Kenya & East Africa', latency: '1.2s' },
                                { rail: 'OZOW EFT', region: 'South Africa', latency: '0.9s' },
                                { rail: 'PAYSTACK', region: 'Nigeria & Ghana', latency: '1.1s' },
                                { rail: 'STRIPE 3D', region: 'Global Cards', latency: '0.7s' },
                              ].map((r) => (
                                <div key={r.rail} className={`p-4 rounded-xl border text-center space-y-1 ${
                                  isDark ? 'bg-black/60 border-white/10' : 'bg-white border-black/10'
                                }`}>
                                  <div className="font-mono font-bold text-xs">{r.rail}</div>
                                  <div className={`text-[10px] ${isDark ? 'text-white/60' : 'text-black/60'}`}>{r.region}</div>
                                  <div className="text-[10px] font-mono text-emerald-400 font-bold">{r.latency}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {activeFeatureIndex === 1 && (
                          <div className="space-y-6 animate-fadeIn">
                            <div className="space-y-2">
                              <h3 className="text-2xl sm:text-4xl font-black tracking-tight">Sub-Second Optical Gate Scanner</h3>
                              <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-white/75' : 'text-black/75'}`}>
                                Uses AES-256 rotating QR tokens and client-side database caching. Gate operators continue scanning uninterrupted even when internet connectivity drops in crowded stadiums.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                              <div className={`p-4 rounded-xl border space-y-1 ${isDark ? 'bg-black/60 border-white/10' : 'bg-white border-black/10'}`}>
                                <div className="text-2xl font-black font-mono">0.68s</div>
                                <div className="text-xs font-bold">Gate Scan Velocity</div>
                                <div className={`text-[11px] ${isDark ? 'text-white/60' : 'text-black/60'}`}>Sub-second verification cycle</div>
                              </div>
                              <div className={`p-4 rounded-xl border space-y-1 ${isDark ? 'bg-black/60 border-white/10' : 'bg-white border-black/10'}`}>
                                <div className="text-2xl font-black font-mono">100%</div>
                                <div className="text-xs font-bold">Offline Redundancy</div>
                                <div className={`text-[11px] ${isDark ? 'text-white/60' : 'text-black/60'}`}>Full edge-cached validation</div>
                              </div>
                              <div className={`p-4 rounded-xl border space-y-1 ${isDark ? 'bg-black/60 border-white/10' : 'bg-white border-black/10'}`}>
                                <div className="text-2xl font-black font-mono">0 Duplicates</div>
                                <div className="text-xs font-bold">Anti Pass-Back</div>
                                <div className={`text-[11px] ${isDark ? 'text-white/60' : 'text-black/60'}`}>Instant multi-gate lockout</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeFeatureIndex === 2 && (
                          <div className="space-y-6 animate-fadeIn">
                            <div className="space-y-2">
                              <h3 className="text-2xl sm:text-4xl font-black tracking-tight">Dynamic Tier & Capacity Enforcement</h3>
                              <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-white/75' : 'text-black/75'}`}>
                                Protects your event licensing limits with strict multi-tier capacity algorithms. Schedule automated early-bird cutoffs, secret guestlist links, and real-time waitlists.
                              </p>
                            </div>

                            <div className={`p-5 rounded-xl border space-y-3 font-mono text-xs ${
                              isDark ? 'bg-black/80 border-white/15' : 'bg-white border-black/15'
                            }`}>
                              <div className="flex justify-between items-center pb-2 border-b border-inherit">
                                <span className="opacity-70">OVERALL VENUE SAFETY CAP</span>
                                <span className="font-bold text-emerald-400">ENFORCED // 25,000 MAX</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>General Admission Early Bird</span>
                                <span>15,000 / 15,000 (SOLD OUT)</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>VIP Golden Circle Tranche II</span>
                                <span>6,850 / 8,000 (85% BOOKED)</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Backstage AAA All-Access</span>
                                <span>250 / 250 (RESERVED)</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeFeatureIndex === 3 && (
                          <div className="space-y-6 animate-fadeIn">
                            <div className="space-y-2">
                              <h3 className="text-2xl sm:text-4xl font-black tracking-tight">Double-Entry Financial Transparency</h3>
                              <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-white/75' : 'text-black/75'}`}>
                                Real-time gross proceeds calculation with split booking fees, organizer merchant payouts, tax withholdings, and downloadable CSV statements ready for auditors.
                              </p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/60 border-white/10' : 'bg-white border-black/10'}`}>
                                <div className={`text-[10px] font-mono ${isDark ? 'text-white/60' : 'text-black/60'}`}>SETTLEMENT CYCLE</div>
                                <div className="text-lg font-black font-mono mt-1">T+1 Domestic</div>
                              </div>
                              <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/60 border-white/10' : 'bg-white border-black/10'}`}>
                                <div className={`text-[10px] font-mono ${isDark ? 'text-white/60' : 'text-black/60'}`}>FEE TRANSPARENCY</div>
                                <div className="text-lg font-black font-mono mt-1">0 Hidden Fees</div>
                              </div>
                              <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/60 border-white/10' : 'bg-white border-black/10'}`}>
                                <div className={`text-[10px] font-mono ${isDark ? 'text-white/60' : 'text-black/60'}`}>RECONCILIATION</div>
                                <div className="text-lg font-black font-mono mt-1">Automated CSV</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeFeatureIndex === 4 && (
                          <div className="space-y-6 animate-fadeIn">
                            <div className="space-y-2">
                              <h3 className="text-2xl sm:text-4xl font-black tracking-tight">Cryptographic Passes & Offline Wallets</h3>
                              <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-white/75' : 'text-black/75'}`}>
                                Generates tamper-proof digital tickets delivered via email, SMS, and in-app wallet. Attendees can save passes to Apple Wallet or export offline PDFs without relying on paper.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-black/60 border-white/10' : 'bg-white border-black/10'}`}>
                                <div className="font-bold text-xs">Dynamic Seed Security</div>
                                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                                  QR payloads are digitally signed and timestamped to block unauthorized screen transfers.
                                </p>
                              </div>
                              <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-black/60 border-white/10' : 'bg-white border-black/10'}`}>
                                <div className="font-bold text-xs">Universal Compatibility</div>
                                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                                  Works on iOS, Android, feature phones, and printed passes with zero distortion.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeFeatureIndex === 5 && (
                          <div className="space-y-6 animate-fadeIn">
                            <div className="space-y-2">
                              <h3 className="text-2xl sm:text-4xl font-black tracking-tight">9-Stage Guided Event Studio</h3>
                              <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-white/75' : 'text-black/75'}`}>
                                From basic metadata and rich agendas to tiered ticketing, custom checkout questionnaires, and legal terms. Built-in readiness audit scores ensure no critical settings are missed.
                              </p>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div className={`p-3 rounded-xl border text-center ${isDark ? 'bg-black/60 border-white/10' : 'bg-white border-black/10'}`}>
                                <div className="text-xs font-mono font-bold text-emerald-400">100% Ready</div>
                                <div className="text-[10px] opacity-70">Pre-Launch Audit</div>
                              </div>
                              <div className={`p-3 rounded-xl border text-center ${isDark ? 'bg-black/60 border-white/10' : 'bg-white border-black/10'}`}>
                                <div className="text-xs font-mono font-bold">Dual Device</div>
                                <div className="text-[10px] opacity-70">Mobile + Web Preview</div>
                              </div>
                              <div className={`p-3 rounded-xl border text-center ${isDark ? 'bg-black/60 border-white/10' : 'bg-white border-black/10'}`}>
                                <div className="text-xs font-mono font-bold">Instant Clone</div>
                                <div className="text-[10px] opacity-70">1-Click Duplicate</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Terminal Footer Navigation Dots */}
                      <div className="pt-6 border-t border-inherit flex items-center justify-between mt-6">
                        <div className="flex items-center gap-2">
                          {[0, 1, 2, 3, 4, 5].map((idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveFeatureIndex(idx)}
                              aria-label={`View feature ${idx + 1}`}
                              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                idx === activeFeatureIndex
                                  ? (isDark ? 'w-8 bg-white' : 'w-8 bg-black')
                                  : (isDark ? 'w-2 bg-white/20 hover:bg-white/40' : 'w-2 bg-black/20 hover:bg-black/40')
                              }`}
                            />
                          ))}
                        </div>
                        <div className={`text-xs font-mono ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                          Click any module to inspect architecture
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </section>

            {/* ========================================================= */}
            {/* TESTIMONIALS SECTION: EXPANDED CORNER TO CORNER           */}
            {/* ========================================================= */}
            <section className={`w-full py-24 border-b transition-colors reveal-on-scroll ${
              isDark ? 'bg-[#060608] border-white/15 text-white' : 'bg-neutral-50 border-black/15 text-black'
            }`}>
              <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 space-y-16">
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-inherit">
                  <div className="space-y-3 max-w-3xl">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-widest ${
                      isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black'
                    }`}>
                      <span>Verified Producers</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight interactive-text animate-text-zoom">
                      Validated on the Field by Industry Directors
                    </h2>
                    <p className={`text-base leading-relaxed ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                      From 25,000-person music festivals in the Cape Winelands to global innovation summits in Lagos. Read real dispatch reports from our organizers.
                    </p>
                  </div>
                  <div className={`text-xs font-mono shrink-0 ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                    <span>99.98% Verification Reliability • 48k+ Gate Scans</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Testimonial 1 */}
                  <div className={`p-8 sm:p-10 rounded-2xl border flex flex-col justify-between space-y-8 transition-all hover:border-white/30 ${
                    isDark ? 'bg-[#0E0E12] border-white/15' : 'bg-white border-black/15'
                  }`}>
                    <div className="space-y-5">
                      <div className="flex items-center justify-between font-mono text-xs opacity-60">
                        <span>01 / CAPE TOWN</span>
                        <span>FESTIVAL CAPACITY: 20,000</span>
                      </div>
                      <p className={`text-base leading-relaxed font-medium ${isDark ? 'text-white/90' : 'text-black/90'}`}>
                        "Switching our festival to NEXORA eliminated gate bottlenecks completely. We processed over 18,000 attendees across four gates with average scan times under 0.8 seconds, even when venue LTE degraded."
                      </p>
                    </div>
                    <div className={`pt-5 border-t flex items-center justify-between ${
                      isDark ? 'border-white/10' : 'border-black/10'
                    }`}>
                      <div>
                        <div className="font-bold text-base">Thabo Mokoena</div>
                        <div className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                          Operations Director, Rocking The Daisies
                        </div>
                      </div>
                      <span className={`text-[11px] font-mono px-2.5 py-1 rounded border ${
                        isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-black/5 border-black/20 text-black'
                      }`}>Verified</span>
                    </div>
                  </div>

                  {/* Testimonial 2 */}
                  <div className={`p-8 sm:p-10 rounded-2xl border flex flex-col justify-between space-y-8 transition-all hover:border-white/30 ${
                    isDark ? 'bg-[#0E0E12] border-white/15' : 'bg-white border-black/15'
                  }`}>
                    <div className="space-y-5">
                      <div className="flex items-center justify-between font-mono text-xs opacity-60">
                        <span>02 / NAIROBI</span>
                        <span>ATTENDEE METRIC: 12,000+</span>
                      </div>
                      <p className={`text-base leading-relaxed font-medium ${isDark ? 'text-white/90' : 'text-black/90'}`}>
                        "Accepting M-Pesa directly in Kenyan Shillings while giving international attendees instant credit card checkout doubled our early bird velocity in week one. The ledger transparency is unmatched."
                      </p>
                    </div>
                    <div className={`pt-5 border-t flex items-center justify-between ${
                      isDark ? 'border-white/10' : 'border-black/10'
                    }`}>
                      <div>
                        <div className="font-bold text-base">Amina Wanjiku</div>
                        <div className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                          Executive Producer, Blankets & Wine Festival
                        </div>
                      </div>
                      <span className={`text-[11px] font-mono px-2.5 py-1 rounded border ${
                        isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-black/5 border-black/20 text-black'
                      }`}>Verified</span>
                    </div>
                  </div>

                  {/* Testimonial 3 */}
                  <div className={`p-8 sm:p-10 rounded-2xl border flex flex-col justify-between space-y-8 transition-all hover:border-white/30 ${
                    isDark ? 'bg-[#0E0E12] border-white/15' : 'bg-white border-black/15'
                  }`}>
                    <div className="space-y-5">
                      <div className="flex items-center justify-between font-mono text-xs opacity-60">
                        <span>03 / LAGOS</span>
                        <span>DELEGATES: 3,500 SUMMIT</span>
                      </div>
                      <p className={`text-base leading-relaxed font-medium ${isDark ? 'text-white/90' : 'text-black/90'}`}>
                        "For a high-stakes tech summit with 3,500 delegates, fraudulent passes and duplicated badges used to be our biggest vulnerability. NEXORA's cryptographic tokens solved it entirely."
                      </p>
                    </div>
                    <div className={`pt-5 border-t flex items-center justify-between ${
                      isDark ? 'border-white/10' : 'border-black/10'
                    }`}>
                      <div>
                        <div className="font-bold text-base">Emeka Okonkwo</div>
                        <div className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                          Head of Experience, AfroTech Summit
                        </div>
                      </div>
                      <span className={`text-[11px] font-mono px-2.5 py-1 rounded border ${
                        isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-black/5 border-black/20 text-black'
                      }`}>Verified</span>
                    </div>
                  </div>
                </div>

              </div>
            </section>


            {/* ========================================================= */}
            {/* FAQ SECTION: ANIMATED ACCORDION FOR ORGANIZER INQUIRIES   */}
            {/* EXPANDED CORNER TO CORNER                                 */}
            {/* ========================================================= */}
            <section className={`w-full py-24 border-b transition-colors relative overflow-hidden reveal-on-scroll ${
              isDark ? 'bg-[#08080B] border-white/15 text-white' : 'bg-white border-black/15 text-black'
            }`}>
              <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 space-y-16">
                
                {/* Header Strip with Zoom-in & Bounce interactive animations */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-inherit">
                  <div className="space-y-3 max-w-3xl animate-text-zoom">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-widest ${
                      isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black'
                    }`}>
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Organizer Operations • FAQ</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight interactive-text">
                      Frequently Asked <span className="animate-text-bounce">Questions.</span>
                    </h2>
                    <p className={`text-base leading-relaxed interactive-text ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                      Clear answers regarding settlement timeframes, fee transparent economics, gate scanner reliability, and multi-currency operations across Africa.
                    </p>
                  </div>
                  <div className={`text-xs font-mono shrink-0 ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                    <span>Dedicated Support • 24/7 Production Gate Desk</span>
                  </div>
                </div>

                {/* Animated Accordion List */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column Quick Summary */}
                  <div className="lg:col-span-4 space-y-6 animate-text-zoom">
                    <div className={`p-8 rounded-2xl border space-y-4 ${
                      isDark ? 'bg-[#0E0E14] border-white/15' : 'bg-neutral-50 border-black/15'
                    }`}>
                      <h3 className="text-xl font-black tracking-tight interactive-text">
                        Transparent, Producer-First Commerce
                      </h3>
                      <p className={`text-xs leading-relaxed ${isDark ? 'text-white/65' : 'text-black/65'}`}>
                        Unlike legacy platforms with opaque settlement holds and surprise transaction cuts, NEXORA operates an immutable ledger where organizers retain complete custody and line-item visibility.
                      </p>
                      <div className={`pt-4 border-t space-y-2 text-xs font-mono ${isDark ? 'border-white/10 text-white/70' : 'border-black/10 text-black/70'}`}>
                        <div className="flex justify-between items-center py-1">
                          <span>Standard Setup Fee</span>
                          <span className="font-bold text-emerald-400">FREE ($0)</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span>Domestic Settlement</span>
                          <span className="font-bold text-emerald-400">T+1 Wire</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span>Currencies Handled</span>
                          <span className="font-bold">14 Continental</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Accordion Items */}
                  <div className="lg:col-span-8 space-y-4">
                    {[
                      {
                        q: 'How are settlements processed?',
                        a: 'Event proceeds are tracked into an immutable double-entry ledger in real time. For domestic accounts in South Africa, Kenya, Nigeria, Ghana, and Rwanda, settlements are dispatched on a T+1 schedule (or customizable weekly/monthly batches) straight into your bank account or local treasury. International wire payouts via SWIFT/IBAN are supported for cross-border and UK/EU/US-registered entities.',
                      },
                      {
                        q: 'What is the standard booking fee?',
                        a: 'NEXORA charges a transparent 3.5% + $0.30 (or regional currency equivalent) booking fee per completed ticket order. Organizers can configure whether this fee is absorbed into the ticket price or passed through to the buyer at checkout. There are zero upfront software fees, zero monthly subscriptions, and free registration tickets incur zero platform charges.',
                      },
                      {
                        q: 'How does gate check-in work if internet connectivity drops?',
                        a: 'The Guest Ticket Scanner engine features robust edge-caching. Gate attendants download the encrypted attendee manifest before doors open. Scans continue optical verification offline using cryptographic tokens, preventing ticket duplication. As soon as cellular or WiFi connectivity reconnects, check-in records reconcile seamlessly across all gates.',
                      },
                      {
                        q: 'Which African payment methods are natively supported?',
                        a: 'Attendees can pay using M-Pesa (Kenya & East Africa), Ozow Instant EFT (South Africa), Paystack / Flutterwave cards (Nigeria, Ghana, Kenya), Airtel Money, MTN Mobile Money, Apple Pay, Google Pay, and international Visa & Mastercard. All transactions settle automatically without forcing users to register third-party wallets.',
                      },
                      {
                        q: 'Can we configure tiered ticket releases and strict venue capacity caps?',
                        a: 'Yes. Through the 9-stage Event Studio, you can define Early Bird, First Release, Second Release, VIP, and Backstage tiers with automated launch schedules and inventory caps. Our capacity engine strictly prevents overselling across combined ticket types even during peak concurrent traffic.',
                      },
                      {
                        q: 'How do refunds, ticket cancellations, and transfers work?',
                        a: 'Organizers can set granular event-level refund policies (Strict 24h, Flexible 7-Day, or No Refunds). When an attendee requests a transfer, the platform burns the existing cryptographic token and reissues a fresh, signed pass to the recipient, ensuring old tickets can never be resold or re-scanned at the entrance.',
                      },
                    ].map((faq, idx) => {
                      const isOpen = openFaqIndex === idx;
                      return (
                        <div
                          key={idx}
                          className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                            isOpen
                              ? (isDark 
                                  ? 'bg-[#121218] border-white/40 shadow-xl' 
                                  : 'bg-neutral-50 border-black/40 shadow-md')
                              : (isDark 
                                  ? 'bg-[#0A0A0E] border-white/10 hover:border-white/25' 
                                  : 'bg-white border-black/10 hover:border-black/25')
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                            className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                            aria-expanded={isOpen}
                          >
                            <span className={`text-base sm:text-lg font-black tracking-tight interactive-text ${
                              isOpen ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-white/90' : 'text-black/90')
                            }`}>
                              {faq.q}
                            </span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                              isOpen
                                ? (isDark ? 'bg-white text-black rotate-180' : 'bg-black text-white rotate-180')
                                : (isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black')
                            }`}>
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </button>
                          
                          {/* Animated Accordion Content */}
                          <div
                            className={`transition-all duration-300 ease-in-out px-6 ${
                              isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 pb-0 opacity-0 pointer-events-none'
                            }`}
                          >
                            <p className={`text-sm sm:text-base leading-relaxed ${
                              isDark ? 'text-white/70' : 'text-black/70'
                            }`}>
                              {faq.a}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>

              </div>
            </section>


            {/* ========================================================= */}
            {/* CALL TO ACTION & PREMIUM CONTACT FORM                     */}
            {/* EXPANDED CORNER TO CORNER                                 */}
            {/* ========================================================= */}
            <section className={`w-full py-24 border-b transition-colors relative overflow-hidden reveal-on-scroll ${
              isDark ? 'bg-black border-white/15 text-white' : 'bg-white border-black/15 text-black'
            }`}>
              {/* Subtle Ambient Vignettes */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className={`w-[700px] h-[700px] rounded-full blur-[160px] absolute -top-40 -right-40 ${
                  isDark ? 'bg-white/10' : 'bg-black/5'
                }`} />
                <div className={`w-[600px] h-[600px] rounded-full blur-[160px] absolute -bottom-40 -left-40 ${
                  isDark ? 'bg-white/10' : 'bg-black/5'
                }`} />
              </div>

              <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative z-10 space-y-16">
                
                {/* Top Call to Action Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                  
                  {/* Left Column: Direct Action & Overview */}
                  <div className="lg:col-span-5 space-y-8">
                    <div className="space-y-4">
                      <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest ${
                        isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black'
                      }`}>
                        <span>Enterprise Onboarding & Launch</span>
                      </div>
                      <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.08] interactive-text animate-text-zoom">
                        Ready to deploy your next live event experience?
                      </h2>
                      <p className={`text-base leading-relaxed ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                        Join hundreds of event directors, promoters, and festivals already powering live ticket sales and gate admissions with NEXORA. Start self-serve in minutes, or submit your bespoke production requirements below.
                      </p>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      {currentUser?.role === 'attendee' ? (
                        <button
                          onClick={() => {
                            setActiveView('wallet');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`px-8 py-4 text-sm font-black tracking-wide rounded-xl transition-all cursor-pointer shadow-xl flex items-center justify-center gap-3 ${
                            isDark ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'
                          }`}
                        >
                          <span>View My Tickets</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : currentUser?.role === 'admin' ? (
                        <button
                          onClick={() => {
                            setActiveView('admin');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-8 py-4 text-sm font-black tracking-wide rounded-xl transition-all cursor-pointer shadow-xl flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-400 text-black"
                        >
                          <ShieldCheck className="w-4 h-4 text-black" />
                          <span>Super Admin Platform</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveView('organizer');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`px-8 py-4 text-sm font-black tracking-wide rounded-xl transition-all cursor-pointer shadow-xl flex items-center justify-center gap-3 ${
                            isDark ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'
                          }`}
                        >
                          <span>Create Your Event</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const el = document.getElementById('events-catalog');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`px-8 py-4 text-sm font-bold rounded-xl transition-all cursor-pointer border flex items-center justify-center ${
                          isDark
                            ? 'border-white/20 text-white hover:bg-white/10'
                            : 'border-black/20 text-black hover:bg-black/5'
                        }`}
                      >
                        <span>Browse Catalog</span>
                      </button>
                    </div>

                    {/* Operational SLAs & Trust Metrics */}
                    <div className={`pt-6 border-t space-y-3 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Instant Self-Serve Deployment (No Approval Lag)</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Zero Fixed Monthly Subscriptions (Performance Driven)</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Dedicated On-Site Gate Support & Guest Ticket Scanners</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Premium Interactive Contact Form */}
                  <div className="lg:col-span-7">
                    <div className={`p-8 sm:p-10 rounded-2xl border transition-all shadow-2xl relative ${
                      isDark ? 'bg-[#0A0A0E] border-white/20 text-white' : 'bg-neutral-50 border-black/20 text-black'
                    }`}>
                      
                      {contactSubmitted ? (
                        <div className="py-12 text-center space-y-4 animate-fadeIn">
                          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                            isDark ? 'bg-white text-black' : 'bg-black text-white'
                          }`}>
                            <Check className="w-8 h-8" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-2xl font-black">Message Dispatched</h3>
                            <p className={`text-sm max-w-md mx-auto ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                              Thank you, <span className="font-bold">{contactName || 'Organizer'}</span>. Our live operations lead will review your submission and contact you at <span className="font-mono">{contactEmail}</span> within 2 hours.
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setContactSubmitted(false);
                              setContactName('');
                              setContactEmail('');
                              setContactOrganization('');
                              setContactMessage('');
                            }}
                            className={`mt-4 px-6 py-2.5 text-xs font-bold rounded-xl border cursor-pointer ${
                              isDark ? 'border-white/30 text-white hover:bg-white/10' : 'border-black/30 text-black hover:bg-black/5'
                            }`}
                          >
                            Submit Another Inquiry
                          </button>
                        </div>
                      ) : (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!contactEmail) return;
                            setContactSubmitting(true);
                            setTimeout(() => {
                              setContactSubmitting(false);
                              setContactSubmitted(true);
                            }, 700);
                          }}
                          className="space-y-6"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-xl font-black tracking-tight">Direct Producer Inquiries & Custom Deployments</h3>
                              <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                                isDark ? 'border-white/20 text-white/60' : 'border-black/20 text-black/60'
                              }`}>SLA &lt; 2h</span>
                            </div>
                            <p className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                              Discuss multi-city tours, on-site gate turnstiles, enterprise invoicing, or bespoke integrations.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div className="space-y-1.5">
                              <label className={`text-xs font-mono font-bold uppercase tracking-wider block ${
                                isDark ? 'text-white/70' : 'text-black/70'
                              }`}>
                                Full Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                                placeholder="e.g. Sipho Dlamini"
                                className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none transition-all ${
                                  isDark 
                                    ? 'bg-black/60 border-white/15 text-white placeholder-white/30 focus:border-white' 
                                    : 'bg-white border-black/15 text-black placeholder-black/30 focus:border-black'
                                }`}
                              />
                            </div>

                            {/* Email Address */}
                            <div className="space-y-1.5">
                              <label className={`text-xs font-mono font-bold uppercase tracking-wider block ${
                                isDark ? 'text-white/70' : 'text-black/70'
                              }`}>
                                Work Email *
                              </label>
                              <input
                                type="email"
                                required
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                placeholder="producer@festival.africa"
                                className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none transition-all ${
                                  isDark 
                                    ? 'bg-black/60 border-white/15 text-white placeholder-white/30 focus:border-white' 
                                    : 'bg-white border-black/15 text-black placeholder-black/30 focus:border-black'
                                }`}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Organization / Company */}
                            <div className="space-y-1.5">
                              <label className={`text-xs font-mono font-bold uppercase tracking-wider block ${
                                isDark ? 'text-white/70' : 'text-black/70'
                              }`}>
                                Company / Brand
                              </label>
                              <input
                                type="text"
                                value={contactOrganization}
                                onChange={(e) => setContactOrganization(e.target.value)}
                                placeholder="Steyn Entertainment"
                                className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none transition-all ${
                                  isDark 
                                    ? 'bg-black/60 border-white/15 text-white placeholder-white/30 focus:border-white' 
                                    : 'bg-white border-black/15 text-black placeholder-black/30 focus:border-black'
                                }`}
                              />
                            </div>

                            {/* Country Base */}
                            <div className="space-y-1.5">
                              <label className={`text-xs font-mono font-bold uppercase tracking-wider block ${
                                isDark ? 'text-white/70' : 'text-black/70'
                              }`}>
                                Primary Market
                              </label>
                              <select
                                value={contactCountry}
                                onChange={(e) => setContactCountry(e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none transition-all cursor-pointer ${
                                  isDark 
                                    ? 'bg-black text-white border-white/15 focus:border-white' 
                                    : 'bg-white text-black border-black/15 focus:border-black'
                                }`}
                              >
                                <option value="South Africa">South Africa</option>
                                <option value="Kenya">Kenya</option>
                                <option value="Nigeria">Nigeria</option>
                                <option value="Ghana">Ghana</option>
                                <option value="Rwanda">Rwanda</option>
                                <option value="United Kingdom">United Kingdom</option>
                                <option value="Other">Other Global</option>
                              </select>
                            </div>

                            {/* Projected Attendee Capacity */}
                            <div className="space-y-1.5">
                              <label className={`text-xs font-mono font-bold uppercase tracking-wider block ${
                                isDark ? 'text-white/70' : 'text-black/70'
                              }`}>
                                Expected Attendees
                              </label>
                              <select
                                value={contactEstimatedAttendees}
                                onChange={(e) => setContactEstimatedAttendees(e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none transition-all cursor-pointer ${
                                  isDark 
                                    ? 'bg-black text-white border-white/15 focus:border-white' 
                                    : 'bg-white text-black border-black/15 focus:border-black'
                                }`}
                              >
                                <option value="Under 2,500">Under 2,500</option>
                                <option value="2,500 - 10,000">2,500 - 10,000</option>
                                <option value="10,000 - 30,000">10,000 - 30,000</option>
                                <option value="30,000 - 60,000">30,000 - 60,000</option>
                                <option value="60,000+ Stadium">60,000+ Stadium</option>
                              </select>
                            </div>
                          </div>

                          {/* Message / Requirements */}
                          <div className="space-y-1.5">
                            <label className={`text-xs font-mono font-bold uppercase tracking-wider block ${
                              isDark ? 'text-white/70' : 'text-black/70'
                            }`}>
                              Event Overview & Requirements
                            </label>
                            <textarea
                              rows={3}
                              value={contactMessage}
                              onChange={(e) => setContactMessage(e.target.value)}
                              placeholder="Tell us about the dates, venue setup, gate scanning needs, or custom merchant settlement requirements..."
                              className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none transition-all resize-none ${
                                isDark 
                                  ? 'bg-black/60 border-white/15 text-white placeholder-white/30 focus:border-white' 
                                  : 'bg-white border-black/15 text-black placeholder-black/30 focus:border-black'
                              }`}
                            />
                          </div>

                          {/* Form Submit Button */}
                          <button
                            type="submit"
                            disabled={contactSubmitting}
                            className={`w-full py-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xl flex items-center justify-center gap-2 ${
                              isDark 
                                ? 'bg-white text-black hover:bg-neutral-200 disabled:opacity-50' 
                                : 'bg-black text-white hover:bg-neutral-800 disabled:opacity-50'
                            }`}
                          >
                            {contactSubmitting ? (
                              <div className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                <span>Dispatching Inquiry...</span>
                              </div>
                            ) : (
                              <>
                                <Send className="w-4 h-4" />
                                <span>Submit Producer Inquiry</span>
                              </>
                            )}
                          </button>
                        </form>
                      )}

                    </div>
                  </div>

                </div>

              </div>
            </section>


          </div>
        )}

        {/* VIEW 5: EVENT DETAILS WEBPAGE */}
        {activeView === 'event' && inspectEvent && (
          <EventDetailsPage
            event={inspectEvent}
            onBack={() => {
              setActiveView('marketplace');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onStartCheckout={(evt, items) => {
              setCheckoutEvent(evt);
              setCheckoutItems(items);
              setActiveView('checkout');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentCurrency={currency}
            currentUser={currentUser}
            theme={theme}
          />
        )}

        {/* VIEW 6: CHECKOUT WEBPAGE */}
        {activeView === 'checkout' && checkoutEvent && checkoutItems.length > 0 && (
          <CheckoutPage
            event={checkoutEvent}
            selectedItems={checkoutItems}
            onBack={() => {
              setActiveView('event');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onTicketsIssued={(issued) => {
              refreshData();
            }}
            onGoToWallet={() => {
              setActiveView('wallet');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            theme={theme}
          />
        )}

        {/* VIEW 7: ATTENDEE TICKET WALLET WEBPAGE */}
        {activeView === 'wallet' && (
          <TicketWalletPage
            tickets={tickets}
            onBack={() => {
              setActiveView('marketplace');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRefresh={refreshData}
            onExploreEvents={() => {
              setActiveView('marketplace');
              const el = document.getElementById('events-catalog');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            theme={theme}
          />
        )}

        {/* VIEW 8: AUTHENTICATION WEBPAGE */}
        {activeView === 'auth' && (
          <AuthPage
            initialMode={authMode}
            onBack={() => {
              setActiveView('marketplace');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAdminConsole={() => {
              setActiveView('admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAuthenticated={(user) => {
              setCurrentUser(user);
              if (user.role === 'admin') {
                setActiveView('admin');
              } else if (user.role === 'organizer') {
                setActiveView('organizer');
              } else {
                setActiveView('marketplace');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            theme={theme}
          />
        )}

        {/* VIEW 9: LEGAL & ARCHITECTURE WEBPAGES */}
        {(activeView === 'terms' || activeView === 'privacy' || activeView === 'security') && (
          <LegalPage
            type={activeView}
            onBack={() => {
              setActiveView('marketplace');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            theme={theme}
          />
        )}

      </main>

      {/* Footer with theme support and legal/portal navigation */}
      {activeView !== 'organizer' && activeView !== 'scanner' && activeView !== 'admin' && (
        <Footer 
          theme={theme} 
          currentUser={currentUser}
          onOpenWallet={() => {
            setActiveView('wallet');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateLegal={(legalPage) => {
            setActiveView(legalPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigatePortal={(portalView) => {
            if (currentUser?.role === 'attendee' && (portalView === 'organizer' || portalView === 'scanner' || portalView === 'admin')) {
              setActiveView('marketplace');
              return;
            }
            if (currentUser?.role === 'organizer' && portalView === 'admin') {
              setActiveView('organizer');
              return;
            }
            setActiveView(portalView);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

    </div>
  );
}
