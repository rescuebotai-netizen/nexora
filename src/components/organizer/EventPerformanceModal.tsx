import React, { useState, useMemo } from 'react';
import {
  X,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Download,
  Search,
  Edit3,
  Copy,
  Trash2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Filter,
  Check
} from 'lucide-react';
import { Event, Ticket } from '../../types';
import { store } from '../../lib/store';
import { formatCurrency, formatEventDate } from '../../lib/currencies';

interface EventPerformanceModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: Event) => void;
  onCancel: (event: Event) => void;
  onDelete: (event: Event) => void;
  onDuplicate: (event: Event) => void;
  onLaunchScanner?: () => void;
  onViewPublic: (event: Event) => void;
}

export const EventPerformanceModal: React.FC<EventPerformanceModalProps> = ({
  event,
  isOpen,
  onClose,
  onEdit,
  onCancel,
  onDelete,
  onDuplicate,
  onLaunchScanner,
  onViewPublic,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'tiers' | 'attendees' | 'financials' | 'management'>('tiers');
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [attendeeStatusFilter, setAttendeeStatusFilter] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  // Tickets specifically for this event
  const eventTickets = useMemo(() => {
    return store.getTickets().filter(t => t.eventId === event.id);
  }, [event.id]);

  // Aggregate statistics
  const totalCapacity = useMemo(() => {
    return event.tickets.reduce((a, b) => a + b.capacity, 0);
  }, [event.tickets]);

  const totalRemaining = useMemo(() => {
    return event.tickets.reduce((a, b) => a + b.remaining, 0);
  }, [event.tickets]);

  const totalSold = useMemo(() => {
    return Math.max(0, totalCapacity - totalRemaining);
  }, [totalCapacity, totalRemaining]);

  const fillRatePct = useMemo(() => {
    return totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;
  }, [totalSold, totalCapacity]);

  // Revenue calculation based on tier sold amounts
  const grossRevenueMinor = useMemo(() => {
    return event.tickets.reduce((acc, t) => {
      const sold = t.capacity - t.remaining;
      return acc + (sold * t.priceMinor);
    }, 0);
  }, [event.tickets]);

  const platformFeeMinor = useMemo(() => {
    return Math.round(grossRevenueMinor * 0.025); // 2.5% platform fee
  }, [grossRevenueMinor]);

  const processingFeeMinor = useMemo(() => {
    return Math.round(grossRevenueMinor * 0.015); // 1.5% gateway fee
  }, [grossRevenueMinor]);

  const netProceedsMinor = useMemo(() => {
    return Math.max(0, grossRevenueMinor - platformFeeMinor - processingFeeMinor);
  }, [grossRevenueMinor, platformFeeMinor, processingFeeMinor]);

  const checkedInCount = useMemo(() => {
    return eventTickets.filter(t => t.status === 'checked_in').length;
  }, [eventTickets]);

  const checkInRatePct = useMemo(() => {
    return eventTickets.length > 0 ? Math.round((checkedInCount / eventTickets.length) * 100) : 0;
  }, [checkedInCount, eventTickets.length]);

  // Filtered attendees
  const filteredAttendees = useMemo(() => {
    return eventTickets.filter(t => {
      if (attendeeStatusFilter !== 'all' && t.status !== attendeeStatusFilter) return false;
      if (attendeeSearch.trim()) {
        const q = attendeeSearch.toLowerCase();
        return (
          t.attendeeName.toLowerCase().includes(q) ||
          t.attendeeEmail.toLowerCase().includes(q) ||
          t.ticketCode.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [eventTickets, attendeeStatusFilter, attendeeSearch]);

  const handleExportCSV = () => {
    const headers = ['Ticket Code', 'Attendee Name', 'Email', 'Tier', 'Status', 'Price', 'Checked In'];
    const rows = eventTickets.map(t => [
      t.ticketCode,
      t.attendeeName,
      t.attendeeEmail,
      t.tierName,
      t.status,
      (t.priceMinor / 100).toFixed(2),
      t.checkedInAt || 'Not Checked In',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${event.slug}-attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyEventLink = () => {
    const url = `${window.location.origin}/e/${event.slug || event.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#111827] text-white border border-[#374151] rounded-3xl max-w-5xl w-full flex flex-col max-h-[92vh] shadow-2xl overflow-hidden animate-fade-in">
        
        {/* Top Control Header */}
        <div className="p-5 sm:p-6 border-b border-[#374151] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F1523]">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                event.status === 'published' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                event.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {event.status}
              </span>
              <span className="text-[11px] text-[#9CA3AF] font-mono">{event.category}</span>
              <span className="text-[11px] text-[#9CA3AF] font-mono">· {event.venue.city}, {event.venue.country}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white truncate">{event.title}</h2>
            <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-white" />
                {formatEventDate(event.startDate)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-white" />
                {event.venue.name}
              </span>
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onEdit(event)}
              className="px-3 py-1.5 bg-[#1F2937] hover:bg-[#374151] text-white font-semibold text-xs rounded-xl border border-[#374151] transition-colors cursor-pointer flex items-center gap-1.5"
              title="Edit event settings and tiers"
            >
              <Edit3 className="w-3.5 h-3.5 text-white" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => onDuplicate(event)}
              className="px-3 py-1.5 bg-[#1F2937] hover:bg-[#374151] text-white font-semibold text-xs rounded-xl border border-[#374151] transition-colors cursor-pointer flex items-center gap-1.5"
              title="Duplicate event structure"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicate</span>
            </button>

            <button
              onClick={handleCopyEventLink}
              className="px-3 py-1.5 bg-[#1F2937] hover:bg-[#374151] text-white font-semibold text-xs rounded-xl border border-[#374151] transition-colors cursor-pointer flex items-center gap-1.5"
              title="Copy event public link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            {onLaunchScanner && (
              <button
                onClick={onLaunchScanner}
                className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-semibold text-xs rounded-xl border border-emerald-500/40 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Launch staff turnstile scanner"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Scanner</span>
              </button>
            )}

            {event.status !== 'cancelled' ? (
              <button
                onClick={() => onCancel(event)}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs rounded-xl border border-amber-500/40 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Cancel event and halt ticket sales"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            ) : (
              <button
                onClick={() => onEdit(event)}
                className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-semibold text-xs rounded-xl border border-blue-500/40 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Re-publish event"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Resume</span>
              </button>
            )}

            <button
              onClick={() => onDelete(event)}
              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold text-xs rounded-xl border border-red-500/40 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Permanently remove event"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 Performance KPI Metric Cards */}
        <div className="p-5 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 border-b border-[#374151] bg-[#0A0E17]">
          {/* 1. Gross Revenue */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
              <span>Gross Ticket Revenue</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white">
              {formatCurrency(grossRevenueMinor, event.currency)}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono block">
              {fillRatePct}% of max potential
            </span>
          </div>

          {/* 2. Tickets Sold / Capacity */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
              <span>Tickets Sold</span>
              <Users className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white">
              {totalSold} <span className="text-sm font-normal text-white/50">/ {totalCapacity}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#1F2937] overflow-hidden mt-1">
              <div
                className="bg-white h-full transition-all duration-300"
                style={{ width: `${fillRatePct}%` }}
              />
            </div>
          </div>

          {/* 3. Turnstile Checked In */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
              <span>Turnstile Check-In</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-blue-400">
              {checkedInCount} <span className="text-sm font-normal text-white/50">({checkInRatePct}%)</span>
            </div>
            <span className="text-[10px] text-[#9CA3AF] font-mono block">
              Gate entrance scan rate
            </span>
          </div>

          {/* 4. Net Settlement */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
              <span>Estimated Net Proceeds</span>
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
              {formatCurrency(netProceedsMinor, event.currency)}
            </div>
            <span className="text-[10px] text-[#9CA3AF] font-mono block">
              After 2.5% platform + fees
            </span>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="px-6 border-b border-[#374151] flex items-center gap-4 text-xs font-semibold overflow-x-auto bg-[#0F1523]">
          {[
            { id: 'tiers', label: 'Ticket Tiers Breakdown', count: event.tickets.length },
            { id: 'attendees', label: 'Registered Attendees', count: eventTickets.length },
            { id: 'financials', label: 'Financial Settlement Ledger' },
            { id: 'management', label: 'Event Operations & Safety' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 border-b-2 font-medium cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'border-white text-white font-bold'
                  : 'border-transparent text-[#9CA3AF] hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id ? 'bg-white text-black font-bold' : 'bg-white/10 text-white/70'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {/* TAB 1: TICKET TIERS BREAKDOWN */}
          {activeTab === 'tiers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Tier Inventory & Sales Velocity</h4>
                <span className="text-xs font-mono text-[#9CA3AF]">
                  Total capacity allocated: {totalCapacity}
                </span>
              </div>

              <div className="space-y-3">
                {event.tickets.map(tier => {
                  const sold = tier.capacity - tier.remaining;
                  const pct = tier.capacity > 0 ? Math.round((sold / tier.capacity) * 100) : 0;
                  const tierGross = sold * tier.priceMinor;

                  return (
                    <div
                      key={tier.id}
                      className="p-4 rounded-2xl bg-[#1F2937]/50 border border-[#374151] space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-bold text-white font-mono">{tier.name}</h5>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">
                              {tier.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-[#9CA3AF] mt-0.5">{tier.description}</p>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-black font-mono text-white block">
                            {formatCurrency(tier.priceMinor, tier.currency)}
                          </span>
                          <span className="text-[11px] font-mono text-emerald-400">
                            {formatCurrency(tierGross, tier.currency)} gross generated
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-[#9CA3AF]">Sales Progress:</span>
                          <span className="font-bold text-white">{sold} / {tier.capacity} passes sold ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#111827] overflow-hidden">
                          <div
                            className="bg-white h-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: REGISTERED ATTENDEES ROSTER */}
          {activeTab === 'attendees' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search by name, email or pass code..."
                      value={attendeeSearch}
                      onChange={e => setAttendeeSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#1F2937] border border-[#374151] text-white focus:outline-none focus:border-white w-64"
                    />
                  </div>

                  <select
                    value={attendeeStatusFilter}
                    onChange={e => setAttendeeStatusFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-xl bg-[#1F2937] border border-[#374151] text-white cursor-pointer"
                  >
                    <option value="all">All Pass Statuses</option>
                    <option value="valid">Valid (Unscanned)</option>
                    <option value="checked_in">Checked In</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-1.5 bg-[#1F2937] hover:bg-[#374151] text-white font-semibold text-xs rounded-xl border border-[#374151] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Export CSV Manifest</span>
                </button>
              </div>

              {filteredAttendees.length > 0 ? (
                <div className="border border-[#374151] rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1F2937] text-[#9CA3AF] font-mono text-[10px] uppercase">
                      <tr>
                        <th className="p-3">Attendee Name</th>
                        <th className="p-3">Contact</th>
                        <th className="p-3">Tier</th>
                        <th className="p-3">Ticket Code</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Check-In Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#374151]/40">
                      {filteredAttendees.map(t => (
                        <tr key={t.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 font-semibold text-white">{t.attendeeName}</td>
                          <td className="p-3 text-[#9CA3AF]">{t.attendeeEmail}</td>
                          <td className="p-3 font-mono text-white">{t.tierName}</td>
                          <td className="p-3 font-mono text-white/80">{t.ticketCode}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              t.status === 'checked_in' ? 'bg-blue-500/20 text-blue-400' :
                              t.status === 'valid' ? 'bg-emerald-500/20 text-emerald-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {t.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3 text-right text-[#9CA3AF] font-mono">
                            {t.checkedInAt ? new Date(t.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-[#9CA3AF] bg-[#1F2937]/30 rounded-2xl border border-[#374151]">
                  No attendees matching current query.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FINANCIAL SETTLEMENT LEDGER */}
          {activeTab === 'financials' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white">Financial Settlement Breakdown</h4>
              <div className="p-5 rounded-2xl bg-[#1F2937]/50 border border-[#374151] space-y-3 font-mono text-xs">
                <div className="flex justify-between text-white/70">
                  <span>Gross Sales Volume:</span>
                  <strong className="text-white">{formatCurrency(grossRevenueMinor, event.currency)}</strong>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Nexora Platform Fee (2.5%):</span>
                  <span>- {formatCurrency(platformFeeMinor, event.currency)}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Payment Gateway Processing (~1.5%):</span>
                  <span>- {formatCurrency(processingFeeMinor, event.currency)}</span>
                </div>
                <div className="pt-3 border-t border-[#374151] flex justify-between text-base font-bold text-white">
                  <span>Estimated Net Settlement Proceeds:</span>
                  <span className="text-emerald-400">{formatCurrency(netProceedsMinor, event.currency)}</span>
                </div>
              </div>

              {event.payoutSettings && (
                <div className="p-4 rounded-2xl bg-[#1F2937]/30 border border-[#374151] space-y-1 text-xs">
                  <h5 className="font-bold text-white font-sans">Designated Payout Destination</h5>
                  <p className="text-[#9CA3AF]">Bank: {event.payoutSettings.bankName}</p>
                  <p className="text-[#9CA3AF]">Account: •••• {event.payoutSettings.accountNumber.slice(-4)}</p>
                  <p className="text-[#9CA3AF]">Holder: {event.payoutSettings.accountHolder || 'Verified Business Entity'}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EVENT OPERATIONS & SAFETY */}
          {activeTab === 'management' && (
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-white">Event Controls & Safety Operations</h4>

              {/* Status Manager */}
              <div className="p-5 rounded-2xl bg-[#1F2937]/50 border border-[#374151] space-y-3">
                <h5 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Event Lifecycle State</h5>
                <p className="text-xs text-[#9CA3AF]">
                  Current Status: <strong className="text-white capitalize">{event.status}</strong>
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => onEdit(event)}
                    className="px-4 py-2 bg-white text-black hover:bg-neutral-200 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Edit All Event Settings
                  </button>
                  <button
                    onClick={() => onViewPublic(event)}
                    className="px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-white font-bold text-xs rounded-xl border border-[#374151] cursor-pointer"
                  >
                    View Public Marketplace Page
                  </button>
                  {event.status !== 'cancelled' ? (
                    <button
                      onClick={() => onCancel(event)}
                      className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 cursor-pointer"
                    >
                      Cancel Event
                    </button>
                  ) : (
                    <button
                      onClick={() => onEdit(event)}
                      className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/40 cursor-pointer"
                    >
                      Re-Open Ticket Sales
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(event)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold text-xs rounded-xl border border-red-500/40 cursor-pointer"
                  >
                    Delete Event Permanently
                  </button>
                </div>
              </div>

              {/* Cancellation Notice Policy */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                <strong className="block text-amber-300">Cancellation Protocol:</strong>
                <p>
                  Cancelling an event freezes ticket checkout, flags existing passes for credit/refund, and notifies attendees via email notification.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#374151] flex items-center justify-between bg-[#0F1523] text-xs">
          <span className="text-[#9CA3AF] font-mono">
            Event ID: {event.id} · Currency: {event.currency}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1F2937] hover:bg-[#374151] text-white font-semibold rounded-xl border border-[#374151] transition-colors cursor-pointer"
          >
            Close Overview
          </button>
        </div>

      </div>
    </div>
  );
};
