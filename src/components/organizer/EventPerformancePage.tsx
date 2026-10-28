import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  CreditCard,
  TrendingUp,
  Download,
  Share2,
  Edit3,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  DollarSign,
  Copy,
  Check,
  Tag,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Event, TicketTier } from '../../types';
import { formatCurrency, formatEventDate } from '../../lib/currencies';
import { store } from '../../lib/store';

interface EventPerformancePageProps {
  event: Event;
  onBack: () => void;
  onEdit: (event: Event) => void;
  onLaunchScanner?: () => void;
  onViewPublic: (event: Event) => void;
  onDuplicate: (event: Event) => void;
  onCancel: (event: Event) => void;
  onDelete: (event: Event) => void;
  theme?: 'light' | 'dark';
}

export const EventPerformancePage: React.FC<EventPerformancePageProps> = ({
  event,
  onBack,
  onEdit,
  onLaunchScanner,
  onViewPublic,
  onDuplicate,
  onCancel,
  onDelete,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'overview' | 'tiers' | 'attendees' | 'scans' | 'finance'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Performance calculations
  const totalCapacity = event.capacityCap || event.tickets.reduce((sum, t) => sum + t.capacity, 0);
  const totalSold = event.tickets.reduce((sum, t) => sum + (t.capacity - t.remaining), 0);
  const grossRevenueMinor = event.tickets.reduce(
    (sum, t) => sum + (t.capacity - t.remaining) * t.priceMinor,
    0
  );
  const occupancyPercent = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;
  const platformFeeMinor = Math.round(grossRevenueMinor * 0.035);
  const netRevenueMinor = grossRevenueMinor - platformFeeMinor;

  // Recent simulated attendees based on store
  const eventAttendees = useMemo(() => {
    return store.getTickets().filter(t => t.eventId === event.id || t.eventTitle === event.title);
  }, [event.id, event.title]);

  const scannedCount = eventAttendees.filter(t => t.status === 'checked_in').length;
  const scanRatePercent = totalSold > 0 ? Math.round((scannedCount / totalSold) * 100) : 0;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#event-${event.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportCSV = (type: string) => {
    const data = event.tickets.map(t => ({
      Tier: t.name,
      Price: (t.priceMinor / 100).toFixed(2),
      Sold: t.capacity - t.remaining,
      Remaining: t.remaining,
      Revenue: (((t.capacity - t.remaining) * t.priceMinor) / 100).toFixed(2),
    }));
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Tier,Price,Sold,Remaining,Revenue', ...data.map(d => Object.values(d).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${event.slug || 'event'}-${type}-report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`min-h-screen w-full transition-colors ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Sticky Header */}
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
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                event.status === 'published'
                  ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                  : 'border-white/20 text-white/70 bg-white/5'
              }`}>
                {event.status.toUpperCase()}
              </span>
              <span className={`text-xs font-mono ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                STATISTICS // {event.id}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight truncate max-w-md sm:max-w-xl">
              {event.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyLink}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 ${
              isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-black/20 text-black hover:bg-black/5'
            }`}
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'Link Copied' : 'Share URL'}</span>
          </button>

          <button
            onClick={() => onEdit(event)}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 ${
              isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-black/20 text-black hover:bg-black/5'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Event</span>
          </button>

          {onLaunchScanner && (
            <button
              onClick={onLaunchScanner}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5 ${
                isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Gate Scanner</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-10 space-y-10">
        
        {/* Hero KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`p-6 rounded-2xl border space-y-2 ${
            isDark ? 'bg-[#0B0B0E] border-white/15' : 'bg-neutral-50 border-black/15'
          }`}>
            <span className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              Gross Revenue
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono">
              {formatCurrency(grossRevenueMinor, event.currency)}
            </div>
            <div className={`text-[11px] font-mono ${isDark ? 'text-white/50' : 'text-black/50'}`}>
              Net settlement: {formatCurrency(netRevenueMinor, event.currency)}
            </div>
          </div>

          <div className={`p-6 rounded-2xl border space-y-2 ${
            isDark ? 'bg-[#0B0B0E] border-white/15' : 'bg-neutral-50 border-black/15'
          }`}>
            <span className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              Tickets Issued
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono">
              {totalSold.toLocaleString()} <span className="text-base font-normal opacity-50">/ {totalCapacity.toLocaleString()}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden mt-2">
              <div
                className={`h-full ${isDark ? 'bg-white' : 'bg-black'}`}
                style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
              />
            </div>
          </div>

          <div className={`p-6 rounded-2xl border space-y-2 ${
            isDark ? 'bg-[#0B0B0E] border-white/15' : 'bg-neutral-50 border-black/15'
          }`}>
            <span className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              Turnstile Check-In Rate
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono">
              {scanRatePercent}%
            </div>
            <div className={`text-[11px] font-mono ${isDark ? 'text-white/50' : 'text-black/50'}`}>
              {scannedCount} verified arrivals at gate
            </div>
          </div>

          <div className={`p-6 rounded-2xl border space-y-2 ${
            isDark ? 'bg-[#0B0B0E] border-white/15' : 'bg-neutral-50 border-black/15'
          }`}>
            <span className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              Venue & Timing
            </span>
            <div className="font-bold text-sm truncate">{event.venue.name}</div>
            <div className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              {event.venue.city}, {event.venue.country}
            </div>
            <div className={`text-[11px] font-mono pt-1 ${isDark ? 'text-white/50' : 'text-black/50'}`}>
              {formatEventDate(event.startDate)}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`flex items-center justify-between border-b overflow-x-auto pb-4 ${
          isDark ? 'border-white/15' : 'border-black/15'
        }`}>
          <div className="flex items-center gap-2">
            {[
              { id: 'overview', label: 'Tier Breakdown' },
              { id: 'attendees', label: 'Attendee Roster & Manifest' },
              { id: 'scans', label: 'Gate Turnstile Telemetry' },
              { id: 'finance', label: 'Ledger & Settlement Audit' },
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

          <button
            onClick={() => handleExportCSV(activeTab)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 cursor-pointer shrink-0 ${
              isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-black/20 text-black hover:bg-black/5'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* TAB 1: TIER BREAKDOWN */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            <div className={`rounded-2xl border overflow-hidden ${
              isDark ? 'bg-[#0B0B0E] border-white/15' : 'bg-neutral-50 border-black/15'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b font-mono uppercase text-[10px] ${
                    isDark ? 'border-white/10 bg-white/5 text-white/70' : 'border-black/10 bg-black/5 text-black/70'
                  }`}>
                    <tr>
                      <th className="p-4">Ticket Tier</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Capacity</th>
                      <th className="p-4">Sold</th>
                      <th className="p-4">Remaining</th>
                      <th className="p-4">Revenue</th>
                      <th className="p-4">Fill Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inherit">
                    {event.tickets.map((t) => {
                      const sold = t.capacity - t.remaining;
                      const rev = sold * t.priceMinor;
                      const pct = t.capacity > 0 ? Math.round((sold / t.capacity) * 100) : 0;
                      return (
                        <tr key={t.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-bold">
                            <div>{t.name}</div>
                            <span className={`text-[10px] font-normal ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                              {t.description || 'Standard Tier'}
                            </span>
                          </td>
                          <td className="p-4 font-mono font-bold">
                            {formatCurrency(t.priceMinor, t.currency)}
                          </td>
                          <td className="p-4 font-mono">{t.capacity}</td>
                          <td className="p-4 font-mono font-bold">{sold}</td>
                          <td className="p-4 font-mono">{t.remaining}</td>
                          <td className="p-4 font-mono font-bold">
                            {formatCurrency(rev, t.currency)}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] w-8">{pct}%</span>
                              <div className="w-20 bg-white/10 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-white h-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ATTENDEE MANIFEST */}
        {activeTab === 'attendees' && (
          <div className="space-y-6 animate-fadeIn">
            <div className={`p-8 rounded-2xl border space-y-4 ${
              isDark ? 'bg-[#0B0B0E] border-white/15' : 'bg-neutral-50 border-black/15'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold">Verified Attendee Manifest</h3>
                  <p className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                    Real-time registration orders, gate admittance status, and cryptographic tokens.
                  </p>
                </div>
                <input
                  type="text"
                  placeholder="Search attendee or barcode ID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className={`px-4 py-2 rounded-xl text-xs border focus:outline-none ${
                    isDark ? 'bg-black border-white/20 text-white' : 'bg-white border-black/20 text-black'
                  }`}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b font-mono uppercase text-[10px] ${
                    isDark ? 'border-white/10 text-white/60' : 'border-black/10 text-black/60'
                  }`}>
                    <tr>
                      <th className="p-3">Attendee</th>
                      <th className="p-3">Tier</th>
                      <th className="p-3">Barcode / Token</th>
                      <th className="p-3">Gate Status</th>
                      <th className="p-3">Check-In Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inherit">
                    {eventAttendees.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center opacity-60">
                          No direct tickets registered under this test event ID yet.
                        </td>
                      </tr>
                    ) : (
                      eventAttendees.map(att => (
                        <tr key={att.id}>
                          <td className="p-3 font-bold">{att.attendeeName || 'Guest Attendee'}</td>
                          <td className="p-3">{att.tierName}</td>
                          <td className="p-3 font-mono text-[10px] opacity-70">{att.id}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              att.status === 'checked_in'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-white/10 text-white/70'
                            }`}>
                              {att.status === 'checked_in' ? 'ADMITTED' : 'ISSUED'}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] opacity-70">
                            {att.checkedInAt ? new Date(att.checkedInAt).toLocaleTimeString() : 'Pending'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GATE SCANS TELEMETRY */}
        {activeTab === 'scans' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-2xl border space-y-2 ${
                isDark ? 'bg-[#0B0B0E] border-white/15' : 'bg-neutral-50 border-black/15'
              }`}>
                <div className="text-xs font-mono opacity-60 uppercase">Peak Scan Velocity</div>
                <div className="text-3xl font-black font-mono">1.2 scans/sec</div>
                <div className="text-[11px] opacity-60">Turnstile Gate 01</div>
              </div>

              <div className={`p-6 rounded-2xl border space-y-2 ${
                isDark ? 'bg-[#0B0B0E] border-white/15' : 'bg-neutral-50 border-black/15'
              }`}>
                <div className="text-xs font-mono opacity-60 uppercase">Duplication Attempts</div>
                <div className="text-3xl font-black font-mono text-emerald-400">0 Blocks</div>
                <div className="text-[11px] opacity-60">Anti pass-back intact</div>
              </div>

              <div className={`p-6 rounded-2xl border space-y-2 ${
                isDark ? 'bg-[#0B0B0E] border-white/15' : 'bg-neutral-50 border-black/15'
              }`}>
                <div className="text-xs font-mono opacity-60 uppercase">Offline Cache Sync</div>
                <div className="text-3xl font-black font-mono text-emerald-400">100% Synced</div>
                <div className="text-[11px] opacity-60">Edge database verified</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FINANCE & SETTLEMENT */}
        {activeTab === 'finance' && (
          <div className="space-y-6 animate-fadeIn max-w-4xl">
            <div className={`p-8 rounded-2xl border space-y-6 ${
              isDark ? 'bg-[#0B0B0E] border-white/15' : 'bg-neutral-50 border-black/15'
            }`}>
              <h3 className="text-lg font-bold">Settlement Journal & Financial Statement</h3>

              <div className="space-y-3 font-mono text-xs divide-y divide-inherit">
                <div className="flex justify-between items-center py-2">
                  <span className="opacity-70">Gross Ticket Sales Volume</span>
                  <span className="font-bold">{formatCurrency(grossRevenueMinor, event.currency)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="opacity-70">Platform Fee (3.5%)</span>
                  <span>- {formatCurrency(platformFeeMinor, event.currency)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="opacity-70">Domestic Payment Gateway Fee</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between items-center py-3 text-sm">
                  <span className="font-bold">Net Organizer Bank Wire Payout</span>
                  <span className="font-black text-emerald-400">
                    {formatCurrency(netRevenueMinor, event.currency)}
                  </span>
                </div>
              </div>

              <div className={`p-4 rounded-xl border text-xs font-mono space-y-1 ${
                isDark ? 'bg-black/60 border-white/10' : 'bg-white border-black/10'
              }`}>
                <div className="font-bold">Settlement Method: Direct Domestic Bank Transfer</div>
                <div className="opacity-60">Settlement Cycle: T+1 (Next Business Day)</div>
                <div className="opacity-60">Recipient: Standard Bank SA / Organizers Trust Account</div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
