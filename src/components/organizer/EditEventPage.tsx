import React, { useState } from 'react';
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Calendar,
  MapPin,
  Tag,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Eye,
  Globe,
  DollarSign,
  Users
} from 'lucide-react';
import { Event, TicketTier, EventCategory, EventFormat } from '../../types';
import { store } from '../../lib/store';

interface EditEventPageProps {
  event: Event;
  onBack: () => void;
  onSave: (updatedEvent: Event) => void;
  theme?: 'light' | 'dark';
}

export const EditEventPage: React.FC<EditEventPageProps> = ({
  event,
  onBack,
  onSave,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  // Core Form State
  const [title, setTitle] = useState(event.title);
  const [shortSummary, setShortSummary] = useState(event.shortSummary || '');
  const [description, setDescription] = useState(event.description);
  const [category, setCategory] = useState<EventCategory>(event.category);
  const [format, setFormat] = useState<EventFormat>(event.format);
  const [status, setStatus] = useState<'published' | 'draft' | 'cancelled' | 'ended'>(event.status);

  // Artwork & Media Assets
  const [coverImage, setCoverImage] = useState(event.coverImage);
  const [eventBanner, setEventBanner] = useState(event.bannerImage || event.coverImage);
  const [organizerLogo, setOrganizerLogo] = useState(event.organizer?.avatar || '');

  // Venue & Location
  const [venueName, setVenueName] = useState(event.venue.name);
  const [venueAddress, setVenueAddress] = useState(event.venue.address);
  const [venueCity, setVenueCity] = useState(event.venue.city);
  const [venueCountry, setVenueCountry] = useState(event.venue.country);
  const [virtualUrl, setVirtualUrl] = useState(event.virtualUrl || '');

  // Schedule
  const [startDate, setStartDate] = useState(
    event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : ''
  );
  const [endDate, setEndDate] = useState(
    event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : ''
  );
  const [timezone, setTimezone] = useState(event.timezone || 'Africa/Johannesburg (GMT+2)');

  // Policies & Controls
  const [refundPolicy, setRefundPolicy] = useState(event.refundPolicy);
  const [ageRestriction, setAgeRestriction] = useState(event.ageRestriction || 'All Ages');
  const [capacityCap, setCapacityCap] = useState(event.capacityCap || 1000);

  // Ticket Tiers
  const [tickets, setTickets] = useState<TicketTier[]>(
    event.tickets.length > 0
      ? event.tickets
      : [
          {
            id: 'tier-1',
            eventId: event.id,
            name: 'General Admission',
            description: 'Standard event entry ticket.',
            priceMinor: event.minPriceMinor,
            currency: event.currency,
            capacity: 250,
            remaining: 250,
            minPerOrder: 1,
            maxPerOrder: 6,
            salesStart: new Date().toISOString(),
            salesEnd: event.startDate,
            status: 'active',
          },
        ]
  );

  const [activeTab, setActiveTab] = useState<'basics' | 'artwork' | 'venue' | 'schedule' | 'tickets' | 'policies'>('basics');
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Ticket Manipulation
  const handleAddTier = () => {
    const newTier: TicketTier = {
      id: `tier-${Date.now()}`,
      eventId: event.id,
      name: 'New Ticket Tier',
      description: 'Tier inclusions, privileges, and conditions.',
      priceMinor: 25000,
      currency: event.currency,
      capacity: 100,
      remaining: 100,
      minPerOrder: 1,
      maxPerOrder: 4,
      salesStart: new Date().toISOString(),
      salesEnd: event.startDate,
      status: 'active',
    };
    setTickets([...tickets, newTier]);
  };

  const handleUpdateTier = (tierId: string, updates: Partial<TicketTier>) => {
    setTickets(tickets.map(t => (t.id === tierId ? { ...t, ...updates } : t)));
  };

  const handleRemoveTier = (tierId: string) => {
    if (tickets.length <= 1) return;
    setTickets(tickets.filter(t => t.id !== tierId));
  };

  // Submit Handler
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    const minPriceMinor = tickets.reduce(
      (min, t) => (t.priceMinor < min ? t.priceMinor : min),
      tickets[0]?.priceMinor || 0
    );

    const updated = store.updateEvent(event.id, {
      title,
      shortSummary,
      description,
      category,
      format,
      status,
      coverImage,
      bannerImage: eventBanner,
      venue: {
        name: venueName,
        address: venueAddress,
        city: venueCity,
        country: venueCountry,
      },
      virtualUrl: format !== 'in_person' ? virtualUrl : undefined,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      timezone,
      refundPolicy,
      ageRestriction,
      capacityCap,
      tickets,
      minPriceMinor,
    });

    setTimeout(() => {
      setIsSaving(false);
      setSaveFeedback('Event changes published successfully to live platform.');
      if (updated) {
        onSave(updated);
      }
    }, 400);
  };

  return (
    <div className={`min-h-screen w-full transition-colors ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Top Sticky Branded Header Bar */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors px-4 sm:px-6 lg:px-8 xl:px-12 h-20 flex items-center justify-between gap-4 ${
        isDark ? 'bg-black/70 border-white/15' : 'bg-white/70 border-black/15'
      }`}>
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-2 ${
              isDark ? 'border-white/20 hover:bg-white/10 text-white' : 'border-black/20 hover:bg-black/5 text-black'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold hidden sm:inline">Back to Events</span>
          </button>
          
          <div>
            <div className="flex items-center gap-2.5">
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                status === 'published'
                  ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                  : 'border-white/20 text-white/70 bg-white/5'
              }`}>
                {status.toUpperCase()}
              </span>
              <span className={`text-xs font-mono ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                EVENT-ID: {event.id}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight truncate max-w-md sm:max-w-xl">
              {title || 'Untitled Event'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onBack()}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
              isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-black/20 text-black hover:bg-black/5'
            }`}
          >
            Discard
          </button>
          <button
            onClick={() => handleSubmit()}
            disabled={isSaving}
            className={`px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg flex items-center gap-2 ${
              isDark 
                ? 'bg-white text-black hover:bg-neutral-200 disabled:opacity-50' 
                : 'bg-black text-white hover:bg-neutral-800 disabled:opacity-50'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save & Publish'}</span>
          </button>
        </div>
      </header>

      {/* Main Full Page Workspace */}
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-10 space-y-8">
        
        {/* Feedback Alert */}
        {saveFeedback && (
          <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold animate-fadeIn ${
            isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{saveFeedback}</span>
            </div>
            <button onClick={() => setSaveFeedback(null)} className="underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Navigation Segment */}
        <div className={`flex items-center gap-2 border-b overflow-x-auto pb-4 scrollbar-none ${
          isDark ? 'border-white/15' : 'border-black/15'
        }`}>
          {[
            { id: 'basics', label: '1. Basic Information' },
            { id: 'artwork', label: '2. Artwork & Branding' },
            { id: 'venue', label: '3. Venue & Coordinates' },
            { id: 'schedule', label: '4. Dates & Scheduling' },
            { id: 'tickets', label: '5. Ticket Tiers & Pricing' },
            { id: 'policies', label: '6. Policies & Compliance' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? (isDark ? 'bg-white text-black shadow-md' : 'bg-black text-white shadow-md')
                  : (isDark ? 'text-white/60 hover:text-white hover:bg-white/5' : 'text-black/60 hover:text-black hover:bg-black/5')
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: BASICS */}
        {activeTab === 'basics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
            <div className={`lg:col-span-8 p-8 rounded-2xl border space-y-6 ${
              isDark ? 'bg-[#0B0B0E] border-white/15' : 'bg-neutral-50 border-black/15'
            }`}>
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight">Event Identity & Category</h2>
                <p className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  Title, summary tagline, and discovery categorisation.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none ${
                      isDark ? 'bg-black/60 border-white/15 text-white focus:border-white' : 'bg-white border-black/15 text-black focus:border-black'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                    Short Tagline / Catchphrase
                  </label>
                  <input
                    type="text"
                    value={shortSummary}
                    onChange={e => setShortSummary(e.target.value)}
                    placeholder="e.g. Africa's largest celebration of music, culture, and art"
                    className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none ${
                      isDark ? 'bg-black/60 border-white/15 text-white focus:border-white' : 'bg-white border-black/15 text-black focus:border-black'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                    Full Event Description
                  </label>
                  <textarea
                    rows={6}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none resize-y ${
                      isDark ? 'bg-black/60 border-white/15 text-white focus:border-white' : 'bg-white border-black/15 text-black focus:border-black'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className={`lg:col-span-4 p-8 rounded-2xl border space-y-6 ${
              isDark ? 'bg-[#0B0B0E] border-white/15' : 'bg-neutral-50 border-black/15'
            }`}>
              <h3 className="text-base font-bold tracking-tight">Format & Lifecycle</h3>
              
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as EventCategory)}
                    className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none cursor-pointer ${
                      isDark ? 'bg-black text-white border-white/15 focus:border-white' : 'bg-white text-black border-black/15 focus:border-black'
                    }`}
                  >
                    <option value="Concerts & Music">Concerts & Music</option>
                    <option value="Tech & Innovation">Tech & Innovation</option>
                    <option value="Food & Wine">Food & Wine</option>
                    <option value="Arts & Culture">Arts & Culture</option>
                    <option value="Business & Networking">Business & Networking</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Format</label>
                  <select
                    value={format}
                    onChange={e => setFormat(e.target.value as EventFormat)}
                    className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none cursor-pointer ${
                      isDark ? 'bg-black text-white border-white/15 focus:border-white' : 'bg-white text-black border-black/15 focus:border-black'
                    }`}
                  >
                    <option value="in_person">In-Person Experience</option>
                    <option value="online">Virtual / Online Event</option>
                    <option value="hybrid">Hybrid (Physical & Stream)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Publishing Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none cursor-pointer ${
                      isDark ? 'bg-black text-white border-white/15 focus:border-white' : 'bg-white text-black border-black/15 focus:border-black'
                    }`}
                  >
                    <option value="published">Published (Live Tickets)</option>
                    <option value="draft">Draft (Unlisted)</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ARTWORK & BRANDING (Cover Image, Company Logo, Event Banner Uploads) */}
        {activeTab === 'artwork' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Artwork & Brand Assets</h2>
                <p className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  Upload dedicated artwork for discovery feeds, organizer accreditation, and widescreen web banners.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Asset 1: Event Cover Image */}
              <div className={`p-8 rounded-2xl border flex flex-col justify-between space-y-6 ${
                isDark ? 'bg-[#0B0B0E] border-white/15' : 'bg-neutral-50 border-black/15'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">Event Cover Image *</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-inherit">1:1 Square</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                    Primary thumbnail shown across event marketplace cards, search results, and mobile wallets.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="aspect-video sm:aspect-square rounded-xl overflow-hidden border border-inherit bg-black/40 group relative">
                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                      <label className="px-4 py-2 bg-white text-black text-xs font-bold rounded-xl cursor-pointer hover:bg-neutral-200">
                        <span>Change Cover</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const r = new FileReader();
                              r.onload = ev => { if (ev.target?.result) setCoverImage(ev.target.result as string); };
                              r.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <label className={`w-full py-3 px-4 border rounded-xl text-xs font-bold text-center block cursor-pointer transition-all ${
                    isDark ? 'border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10' : 'border-black/20 hover:border-black/50 bg-black/5 hover:bg-black/10'
                  }`}>
                    <span>Upload New Cover (PNG/JPG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const r = new FileReader();
                          r.onload = ev => { if (ev.target?.result) setCoverImage(ev.target.result as string); };
                          r.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Asset 2: Company Logo */}
              <div className={`p-8 rounded-2xl border flex flex-col justify-between space-y-6 ${
                isDark ? 'bg-[#0B0B0E] border-white/15' : 'bg-neutral-50 border-black/15'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">Company / Producer Logo</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-inherit">Logo Badge</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                    Featured next to organizer bio, contact routes, and verified credential certificates.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="aspect-video sm:aspect-square rounded-xl overflow-hidden border border-inherit bg-black/40 flex items-center justify-center p-6 relative">
                    {organizerLogo ? (
                      <div className="w-full h-full flex items-center justify-center relative group">
                        <img src={organizerLogo} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                        <button
                          onClick={() => setOrganizerLogo('')}
                          className="absolute top-0 right-0 p-1.5 rounded-lg bg-black/80 text-white/70 hover:text-white"
                          title="Clear logo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 mx-auto flex items-center justify-center font-black font-mono text-sm">
                          {title.slice(0, 2).toUpperCase() || 'NX'}
                        </div>
                        <span className={`text-[11px] block ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                          No Custom Logo Uploaded
                        </span>
                      </div>
                    )}
                  </div>

                  <label className={`w-full py-3 px-4 border rounded-xl text-xs font-bold text-center block cursor-pointer transition-all ${
                    isDark ? 'border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10' : 'border-black/20 hover:border-black/50 bg-black/5 hover:bg-black/10'
                  }`}>
                    <span>{organizerLogo ? 'Replace Company Logo' : 'Upload Company Logo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const r = new FileReader();
                          r.onload = ev => { if (ev.target?.result) setOrganizerLogo(ev.target.result as string); };
                          r.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Asset 3: Event Banner */}
              <div className={`p-8 rounded-2xl border flex flex-col justify-between space-y-6 ${
                isDark ? 'bg-[#0B0B0E] border-white/15' : 'bg-neutral-50 border-black/15'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">Event Banner Artwork</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-inherit">16:9 Banner</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                    Panoramic widescreen hero banner displayed at the top of the standalone event landing page.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="aspect-video sm:aspect-square rounded-xl overflow-hidden border border-inherit bg-black/40 group relative">
                    <img src={eventBanner} alt="Banner Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                      <label className="px-4 py-2 bg-white text-black text-xs font-bold rounded-xl cursor-pointer hover:bg-neutral-200">
                        <span>Change Banner</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const r = new FileReader();
                              r.onload = ev => { if (ev.target?.result) setEventBanner(ev.target.result as string); };
                              r.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <label className={`w-full py-3 px-4 border rounded-xl text-xs font-bold text-center block cursor-pointer transition-all ${
                    isDark ? 'border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10' : 'border-black/20 hover:border-black/50 bg-black/5 hover:bg-black/10'
                  }`}>
                    <span>{eventBanner ? 'Replace Event Banner' : 'Upload Event Banner'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const r = new FileReader();
                          r.onload = ev => { if (ev.target?.result) setEventBanner(ev.target.result as string); };
                          r.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: VENUE */}
        {activeTab === 'venue' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
            <div className={`lg:col-span-8 p-8 rounded-2xl border space-y-6 ${
              isDark ? 'bg-[#0B0B0E] border-white/15' : 'bg-neutral-50 border-black/15'
            }`}>
              <h2 className="text-xl font-bold tracking-tight">Venue Details & Physical Coordinates</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Venue Name *</label>
                  <input
                    type="text"
                    required
                    value={venueName}
                    onChange={e => setVenueName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none ${
                      isDark ? 'bg-black/60 border-white/15 text-white focus:border-white' : 'bg-white border-black/15 text-black focus:border-black'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Street Address</label>
                  <input
                    type="text"
                    value={venueAddress}
                    onChange={e => setVenueAddress(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none ${
                      isDark ? 'bg-black/60 border-white/15 text-white focus:border-white' : 'bg-white border-black/15 text-black focus:border-black'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">City</label>
                    <input
                      type="text"
                      value={venueCity}
                      onChange={e => setVenueCity(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none ${
                        isDark ? 'bg-black/60 border-white/15 text-white focus:border-white' : 'bg-white border-black/15 text-black focus:border-black'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Country</label>
                    <input
                      type="text"
                      value={venueCountry}
                      onChange={e => setVenueCountry(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none ${
                        isDark ? 'bg-black/60 border-white/15 text-white focus:border-white' : 'bg-white border-black/15 text-black focus:border-black'
                      }`}
                    />
                  </div>
                </div>

                {format !== 'in_person' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Virtual Stream URL</label>
                    <input
                      type="url"
                      value={virtualUrl}
                      onChange={e => setVirtualUrl(e.target.value)}
                      placeholder="https://zoom.us/j/example or https://youtube.com/live/..."
                      className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none font-mono ${
                        isDark ? 'bg-black/60 border-white/15 text-white focus:border-white' : 'bg-white border-black/15 text-black focus:border-black'
                      }`}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className={`lg:col-span-4 p-8 rounded-2xl border space-y-4 ${
              isDark ? 'bg-[#0B0B0E] border-white/15' : 'bg-neutral-50 border-black/15'
            }`}>
              <h3 className="text-base font-bold">Venue Map Snapshot</h3>
              <div className="aspect-video rounded-xl border border-inherit bg-black/40 flex items-center justify-center p-4 text-center">
                <div className="space-y-1">
                  <MapPin className="w-6 h-6 mx-auto opacity-70" />
                  <div className="font-bold text-xs">{venueName}</div>
                  <div className={`text-[10px] ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                    {venueCity}, {venueCountry}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className={`max-w-3xl p-8 rounded-2xl border space-y-6 ${
            isDark ? 'bg-[#0B0B0E] border-white/15' : 'bg-neutral-50 border-black/15'
          }`}>
            <h2 className="text-xl font-bold tracking-tight">Event Dates & Timezone</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none ${
                    isDark ? 'bg-black/60 border-white/15 text-white focus:border-white' : 'bg-white border-black/15 text-black focus:border-black'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">End Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none ${
                    isDark ? 'bg-black/60 border-white/15 text-white focus:border-white' : 'bg-white border-black/15 text-black focus:border-black'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Timezone</label>
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none cursor-pointer ${
                  isDark ? 'bg-black text-white border-white/15 focus:border-white' : 'bg-white text-black border-black/15 focus:border-black'
                }`}
              >
                <option value="Africa/Johannesburg (GMT+2)">Africa/Johannesburg (GMT+2)</option>
                <option value="Africa/Nairobi (GMT+3)">Africa/Nairobi (GMT+3)</option>
                <option value="Africa/Lagos (GMT+1)">Africa/Lagos (GMT+1)</option>
                <option value="Africa/Accra (GMT+0)">Africa/Accra (GMT+0)</option>
                <option value="Africa/Cairo (GMT+2)">Africa/Cairo (GMT+2)</option>
                <option value="UTC (GMT+0)">UTC (GMT+0)</option>
              </select>
            </div>
          </div>
        )}

        {/* TAB 5: TICKETS */}
        {activeTab === 'tickets' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Configured Ticket Tiers ({tickets.length})</h2>
                <p className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  Manage pricing, release windows, allocations, and order quantity limits.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddTier}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer flex items-center gap-2 ${
                  isDark ? 'border-white/30 hover:bg-white/10 text-white' : 'border-black/30 hover:bg-black/5 text-black'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Ticket Tier</span>
              </button>
            </div>

            <div className="space-y-4">
              {tickets.map((t, idx) => (
                <div
                  key={t.id}
                  className={`p-6 rounded-2xl border space-y-4 transition-all ${
                    isDark ? 'bg-[#0B0B0E] border-white/15' : 'bg-neutral-50 border-black/15'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-inherit pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg border border-inherit flex items-center justify-center font-mono text-xs font-bold">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={t.name}
                        onChange={e => handleUpdateTier(t.id, { name: e.target.value })}
                        className={`font-black text-base px-2 py-1 rounded-lg border bg-transparent focus:outline-none ${
                          isDark ? 'border-white/15 focus:border-white' : 'border-black/15 focus:border-black'
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 font-mono text-xs">
                        <span>Price:</span>
                        <input
                          type="number"
                          step="1"
                          value={Math.round(t.priceMinor / 100)}
                          onChange={e => handleUpdateTier(t.id, { priceMinor: Math.round(Number(e.target.value) * 100) })}
                          className={`w-24 px-2 py-1 rounded-lg border bg-transparent font-bold ${
                            isDark ? 'border-white/15' : 'border-black/15'
                          }`}
                        />
                        <span className="font-bold">{t.currency}</span>
                      </div>

                      {tickets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTier(t.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer"
                          title="Delete tier"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-mono uppercase text-[10px] opacity-70 mb-1">Capacity Cap</label>
                      <input
                        type="number"
                        value={t.capacity}
                        onChange={e => handleUpdateTier(t.id, { capacity: Number(e.target.value), remaining: Number(e.target.value) })}
                        className={`w-full px-3 py-2 rounded-xl border bg-transparent ${
                          isDark ? 'border-white/15' : 'border-black/15'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block font-mono uppercase text-[10px] opacity-70 mb-1">Min Per Order</label>
                      <input
                        type="number"
                        value={t.minPerOrder || 1}
                        onChange={e => handleUpdateTier(t.id, { minPerOrder: Number(e.target.value) })}
                        className={`w-full px-3 py-2 rounded-xl border bg-transparent ${
                          isDark ? 'border-white/15' : 'border-black/15'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block font-mono uppercase text-[10px] opacity-70 mb-1">Max Per Order</label>
                      <input
                        type="number"
                        value={t.maxPerOrder || 4}
                        onChange={e => handleUpdateTier(t.id, { maxPerOrder: Number(e.target.value) })}
                        className={`w-full px-3 py-2 rounded-xl border bg-transparent ${
                          isDark ? 'border-white/15' : 'border-black/15'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono uppercase text-[10px] opacity-70 mb-1">Description / Perks</label>
                    <input
                      type="text"
                      value={t.description || ''}
                      onChange={e => handleUpdateTier(t.id, { description: e.target.value })}
                      placeholder="e.g. Keynote access, private networking lunch, conference gift bag"
                      className={`w-full px-3 py-2 rounded-xl border bg-transparent text-xs ${
                        isDark ? 'border-white/15' : 'border-black/15'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: POLICIES */}
        {activeTab === 'policies' && (
          <div className={`max-w-3xl p-8 rounded-2xl border space-y-6 ${
            isDark ? 'bg-[#0B0B0E] border-white/15' : 'bg-neutral-50 border-black/15'
          }`}>
            <h2 className="text-xl font-bold tracking-tight">Refund Terms & Admission Policies</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Refund Policy</label>
                <select
                  value={refundPolicy}
                  onChange={e => setRefundPolicy(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none cursor-pointer ${
                    isDark ? 'bg-black text-white border-white/15 focus:border-white' : 'bg-white text-black border-black/15 focus:border-black'
                  }`}
                >
                  <option value="Refunds allowed up to 7 days before event">Flexible (Up to 7 days prior)</option>
                  <option value="Refunds allowed up to 30 days before event">Strict (Up to 30 days prior)</option>
                  <option value="No refunds permitted">Non-Refundable (Strict All Sales Final)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Age Restriction</label>
                <select
                  value={ageRestriction}
                  onChange={e => setAgeRestriction(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none cursor-pointer ${
                    isDark ? 'bg-black text-white border-white/15 focus:border-white' : 'bg-white text-black border-black/15 focus:border-black'
                  }`}
                >
                  <option value="All Ages">All Ages (Family Friendly)</option>
                  <option value="18+">18+ (Valid ID Required at Gate)</option>
                  <option value="21+">21+ (Adult Venue & Alcohol License)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  Overall Venue Capacity Cap
                </label>
                <input
                  type="number"
                  value={capacityCap}
                  onChange={e => setCapacityCap(Number(e.target.value))}
                  className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none ${
                    isDark ? 'bg-black/60 border-white/15 text-white focus:border-white' : 'bg-white border-black/15 text-black focus:border-black'
                  }`}
                />
                <span className={`text-[11px] block mt-1 ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                  Limits combined orders across all tiers to protect municipal safety permits.
                </span>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
