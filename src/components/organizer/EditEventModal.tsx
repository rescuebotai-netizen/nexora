import React, { useState } from 'react';
import {
  X,
  Save,
  Trash2,
  Plus,
  Calendar,
  MapPin,
  Tag,
  CreditCard,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Event, TicketTier, EventCategory, EventFormat } from '../../types';
import { store } from '../../lib/store';

interface EditEventModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEvent: Event) => void;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({
  event,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(event.title);
  const [shortSummary, setShortSummary] = useState(event.shortSummary || '');
  const [description, setDescription] = useState(event.description);
  const [category, setCategory] = useState<EventCategory>(event.category);
  const [format, setFormat] = useState<EventFormat>(event.format);
  const [status, setStatus] = useState<'published' | 'draft' | 'cancelled' | 'ended'>(event.status);

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

  // Policies
  const [refundPolicy, setRefundPolicy] = useState(event.refundPolicy);
  const [ageRestriction, setAgeRestriction] = useState(event.ageRestriction || 'All Ages');

  // Ticket Tiers
  const [tickets, setTickets] = useState<TicketTier[]>(
    event.tickets.map(t => ({ ...t }))
  );

  const handleUpdateTier = (index: number, updates: Partial<TicketTier>) => {
    setTickets(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const handleAddTier = () => {
    const newTier: TicketTier = {
      id: `tier-${Date.now()}`,
      eventId: event.id,
      name: 'General Admission',
      description: 'Standard admission pass',
      priceMinor: 25000,
      currency: event.currency || 'ZAR',
      capacity: 100,
      remaining: 100,
      minPerOrder: 1,
      maxPerOrder: 6,
      salesStart: new Date().toISOString(),
      salesEnd: endDate ? new Date(endDate).toISOString() : new Date().toISOString(),
      status: 'active',
    };
    setTickets(prev => [...prev, newTier]);
  };

  const handleRemoveTier = (index: number) => {
    if (tickets.length <= 1) {
      alert('Event must have at least one ticket tier.');
      return;
    }
    setTickets(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const minPriceMinor = tickets.length > 0 
      ? Math.min(...tickets.map(t => t.priceMinor))
      : 0;

    const updated = store.updateEvent(event.id, {
      title,
      shortSummary,
      description,
      category,
      format,
      status,
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
      tickets,
      minPriceMinor,
    });

    if (updated) {
      onSave(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] text-white border border-[#374151] rounded-2xl max-w-3xl w-full p-6 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#374151] pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-white font-bold">
              EVENT EDITOR
            </span>
            <h3 className="text-lg font-bold text-white">Edit Event Details & Tickets</h3>
            <p className="text-xs text-[#9CA3AF]">
              Update live event configuration, dates, venue, and ticket parameters.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Basic Info */}
          <div className="p-4 rounded-xl bg-[#1F2937]/50 border border-[#374151] space-y-4">
            <h4 className="text-sm font-bold text-white">1. Event Basics & Status</h4>

            <div>
              <label className="block font-bold mb-1 text-white">Event Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#374151] text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-white">Short Tagline / Summary</label>
              <input
                type="text"
                value={shortSummary}
                onChange={e => setShortSummary(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#374151] text-white focus:outline-none focus:border-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold mb-1 text-white">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as EventCategory)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#374151] text-white cursor-pointer"
                >
                  <option value="Tech & Innovation">Tech & Innovation</option>
                  <option value="Business & Summits">Business & Summits</option>
                  <option value="Concerts & Music">Concerts & Music</option>
                  <option value="Food & Wine">Food & Wine</option>
                  <option value="Arts & Culture">Arts & Culture</option>
                  <option value="Sports & Wellness">Sports & Wellness</option>
                  <option value="Faith & Community">Faith & Community</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-white">Format</label>
                <select
                  value={format}
                  onChange={e => setFormat(e.target.value as EventFormat)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#374151] text-white cursor-pointer"
                >
                  <option value="in_person">In-Person</option>
                  <option value="online">Online / Virtual</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-white">Event Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#374151] text-white font-mono font-bold cursor-pointer"
                >
                  <option value="published">Published (Active)</option>
                  <option value="draft">Draft (Unlisted)</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="ended">Ended</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1 text-white">Full Event Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#374151] text-white focus:outline-none focus:border-white"
              />
            </div>
          </div>

          {/* Location & Dates */}
          <div className="p-4 rounded-xl bg-[#1F2937]/50 border border-[#374151] space-y-4">
            <h4 className="text-sm font-bold text-white">2. Venue & Scheduling</h4>

            {format !== 'online' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-white">Venue Name *</label>
                  <input
                    type="text"
                    required
                    value={venueName}
                    onChange={e => setVenueName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#374151] text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-white">Address</label>
                  <input
                    type="text"
                    value={venueAddress}
                    onChange={e => setVenueAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#374151] text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-white">City *</label>
                  <input
                    type="text"
                    required
                    value={venueCity}
                    onChange={e => setVenueCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#374151] text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-white">Country *</label>
                  <input
                    type="text"
                    required
                    value={venueCountry}
                    onChange={e => setVenueCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#374151] text-white"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block font-bold mb-1 text-white">Virtual Stream URL</label>
                <input
                  type="url"
                  value={virtualUrl}
                  onChange={e => setVirtualUrl(e.target.value)}
                  placeholder="https://meet.nexora.events/stream/..."
                  className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#374151] text-white font-mono"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold mb-1 text-white">Start Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#374151] text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-bold mb-1 text-white">End Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#374151] text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-bold mb-1 text-white">Timezone</label>
                <input
                  type="text"
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#374151] text-white"
                />
              </div>
            </div>
          </div>

          {/* Ticket Tiers */}
          <div className="p-4 rounded-xl bg-[#1F2937]/50 border border-[#374151] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">3. Ticket Tiers & Pricing</h4>
                <p className="text-[11px] text-[#9CA3AF]">
                  Total Capacity: {tickets.reduce((a, b) => a + b.capacity, 0)} passes
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddTier}
                className="px-3 py-1.5 bg-white text-black font-bold rounded-lg flex items-center gap-1 cursor-pointer text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tier</span>
              </button>
            </div>

            <div className="space-y-3">
              {tickets.map((tier, idx) => (
                <div
                  key={tier.id || idx}
                  className="p-3 rounded-xl bg-[#111827] border border-[#374151] space-y-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-[#9CA3AF] font-mono">Tier Name</label>
                      <input
                        type="text"
                        value={tier.name}
                        onChange={e => handleUpdateTier(idx, { name: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded bg-[#1F2937] border border-[#374151] text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#9CA3AF] font-mono">Price ({tier.currency})</label>
                      <input
                        type="number"
                        value={tier.priceMinor / 100}
                        onChange={e => handleUpdateTier(idx, { priceMinor: Math.round(Number(e.target.value) * 100) })}
                        className="w-full px-2.5 py-1.5 rounded bg-[#1F2937] border border-[#374151] text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#9CA3AF] font-mono">Capacity</label>
                      <input
                        type="number"
                        value={tier.capacity}
                        onChange={e => handleUpdateTier(idx, { capacity: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 rounded bg-[#1F2937] border border-[#374151] text-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Description & perks"
                      value={tier.description}
                      onChange={e => handleUpdateTier(idx, { description: e.target.value })}
                      className="flex-1 px-2.5 py-1.5 rounded bg-[#1F2937] border border-[#374151] text-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(idx)}
                      className="p-1.5 text-red-400 hover:text-red-300 cursor-pointer"
                      title="Remove tier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Policy */}
          <div className="p-4 rounded-xl bg-[#1F2937]/50 border border-[#374151] space-y-3">
            <h4 className="text-sm font-bold text-white">4. Policies</h4>
            <div>
              <label className="block font-bold mb-1 text-white">Refund & Transfer Policy Statement</label>
              <textarea
                rows={2}
                value={refundPolicy}
                onChange={e => setRefundPolicy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#374151] text-white"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#374151]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#374151] text-[#E5E7EB] hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-white text-black hover:bg-neutral-200 font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>Save Event Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
