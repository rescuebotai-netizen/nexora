import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Calendar, 
  MapPin, 
  Printer, 
  Share2, 
  Check, 
  UserCheck, 
  Clock, 
  RotateCcw,
  Search,
  Send,
  Download,
  ExternalLink,
  Coins,
  Ticket as TicketIcon,
  Radio,
  Timer,
  Zap
} from 'lucide-react';
import QRCode from 'qrcode';
import { Ticket, RefundRequest } from '../../types';
import { store } from '../../lib/store';
import { formatCurrency, formatEventDate } from '../../lib/currencies';
import { CashlessTerminalModal } from '../cashless/CashlessTerminalModal';


interface TicketWalletPageProps {
  tickets: Ticket[];
  onBack: () => void;
  onRefresh: () => void;
  onExploreEvents: () => void;
  theme?: 'light' | 'dark';
}

export const TicketWalletPage: React.FC<TicketWalletPageProps> = ({
  tickets,
  onBack,
  onRefresh,
  onExploreEvents,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(tickets[0] || null);
  
  // Transfer state
  const [transferModalTicket, setTransferModalTicket] = useState<Ticket | null>(null);
  const [transferName, setTransferName] = useState('');
  const [transferEmail, setTransferEmail] = useState('');
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Refund state
  const [refundModalTicket, setRefundModalTicket] = useState<Ticket | null>(null);
  const [refundReason, setRefundReason] = useState('Schedule conflict — Unable to attend');
  const [refundCustomNote, setRefundCustomNote] = useState('');
  const [refundFeedback, setRefundFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // Filter tabs
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'checked_in' | 'refunded'>('all');
  const [searchRef, setSearchRef] = useState('');
  const [isCashlessOpen, setIsCashlessOpen] = useState(false);

  const activeWaitlistClaim = store.getActiveClaimForUser(
    tickets[0]?.attendeeEmail || 'nomvula.dlamini@example.com'
  );

  useEffect(() => {
    async function genQRs() {
      const urls: Record<string, string> = {};
      for (const t of tickets) {
        try {
          urls[t.id] = await QRCode.toDataURL(t.qrPayload, {
            width: 320,
            margin: 1,
            color: { dark: '#000000', light: '#FFFFFF' },
          });
        } catch (err) {
          console.error(err);
        }
      }
      setQrCodeUrls(urls);
    }
    genQRs();
    if (!selectedTicket && tickets.length > 0) {
      setSelectedTicket(tickets[0]);
    }
  }, [tickets]);

  const filteredTickets = tickets.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (searchRef.trim()) {
      const query = searchRef.toLowerCase();
      const codeMatches = t.ticketCode.toLowerCase().includes(query);
      const nameMatches = t.attendeeName.toLowerCase().includes(query);
      const tierMatches = t.tierName.toLowerCase().includes(query);
      return codeMatches || nameMatches || tierMatches;
    }
    return true;
  });

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModalTicket || !transferName.trim() || !transferEmail.trim()) return;

    const all = store.getTickets();
    const idx = all.findIndex(t => t.id === transferModalTicket.id);
    if (idx !== -1) {
      all[idx] = { ...transferModalTicket, attendeeName: transferName.trim(), attendeeEmail: transferEmail.trim() };
      localStorage.setItem('nexora_db_v2_tickets', JSON.stringify(all));
    }

    setTransferSuccess(true);
    setTimeout(() => {
      setTransferSuccess(false);
      setTransferModalTicket(null);
      setTransferName('');
      setTransferEmail('');
      onRefresh();
    }, 1800);
  };

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModalTicket) return;

    const combinedReason = refundCustomNote ? `${refundReason}: ${refundCustomNote}` : refundReason;
    const res = store.requestRefund(refundModalTicket.id, combinedReason);
    setRefundFeedback({
      success: res.success,
      msg: res.success ? `Refund request submitted for ${refundModalTicket.ticketCode}.` : (res.error || 'Failed to submit refund request'),
    });
    setTimeout(() => {
      setRefundFeedback(null);
      if (res.success) {
        setRefundModalTicket(null);
        setRefundCustomNote('');
        onRefresh();
      }
    }, 2000);
  };

  return (
    <div className={`min-h-screen transition-colors ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      
      {/* Top Breadcrumb Header */}
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
            <span>Back to Marketplace</span>
          </button>

          <div className="flex items-center gap-2 font-mono text-xs opacity-60">
            <span>{tickets.length} Digital {tickets.length === 1 ? 'Pass' : 'Passes'} Vaulted</span>
          </div>

        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* Page Title & Status Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              My Ticket Vault
            </h1>
            <p className="text-xs sm:text-sm font-mono opacity-60">
              Cryptographically verified admission passes with sub-second gate validation.
            </p>
          </div>

          {/* Search & Status Pill Filters + Cashless Button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCashlessOpen(true)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer border shadow-xs ${
                isDark
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
              title="Open Cashless RFID Wristband Terminal"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>Cashless Wristband (NFC)</span>
            </button>

            <div className={`flex items-center px-3 py-2 rounded-xl text-xs ${
              isDark ? 'bg-[#101014] text-white' : 'bg-neutral-100 text-black'
            }`}>
              <Search className="w-3.5 h-3.5 opacity-50 mr-2" />
              <input
                type="text"
                value={searchRef}
                onChange={e => setSearchRef(e.target.value)}
                placeholder="Filter by code or name..."
                className="bg-transparent focus:outline-none w-44 font-mono text-xs"
              />
            </div>

            <div className={`flex items-center gap-1 p-1 rounded-xl ${
              isDark ? 'bg-[#101014]' : 'bg-neutral-100'
            }`}>
              {(['all', 'valid', 'checked_in', 'refunded'] as const).map(statusKey => (
                <button
                  key={statusKey}
                  onClick={() => setStatusFilter(statusKey)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize cursor-pointer transition-colors ${
                    statusFilter === statusKey
                      ? (isDark ? 'bg-white text-black shadow-xs' : 'bg-black text-white shadow-xs')
                      : (isDark ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black')
                  }`}
                >
                  {statusKey === 'valid' ? 'Active' : statusKey === 'checked_in' ? 'Used' : statusKey}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ACTIVE WAITLIST CLAIM ALERT BANNER */}
        {activeWaitlistClaim && (
          <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in shadow-lg ${
            isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}>
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-400 text-black flex items-center justify-center font-bold shrink-0 shadow-md">
                <Zap className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-80">
                    Priority Waitlist Unlock Active
                  </span>
                </div>
                <h3 className="font-bold text-sm sm:text-base">
                  A ticket has been released for {activeWaitlistClaim.eventTitle}!
                </h3>
                <p className="text-xs opacity-75 font-mono">
                  Your 2-hour exclusive booking window is ticking. Secure your admission pass before reallocation.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                window.location.href = `/?claimToken=${activeWaitlistClaim.claimToken}`;
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider bg-amber-400 text-black hover:bg-amber-300 transition-all cursor-pointer whitespace-nowrap shadow-md self-start sm:self-center"
            >
              Claim Pass Now
            </button>
          </div>
        )}


        {/* Empty State */}
        {filteredTickets.length === 0 ? (
          <div className={`p-16 text-center space-y-4 rounded-3xl ${
            isDark ? 'bg-[#0E0E12]' : 'bg-neutral-50'
          }`}>
            <TicketIcon className="w-12 h-12 mx-auto opacity-30" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold">No tickets found</h3>
              <p className="text-xs font-mono opacity-60 max-w-sm mx-auto">
                You do not have any admission passes under this filter. Browse the marketplace to discover upcoming festivals and conferences.
              </p>
            </div>
            <button
              onClick={onExploreEvents}
              className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg ${
                isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
              }`}
            >
              Explore Events
            </button>
          </div>
        ) : (
          /* Grid of Tickets */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTickets.map(ticket => {
              const isUsed = ticket.status === 'checked_in';
              const isRefunded = ticket.status === 'refunded';

              return (
                <div
                  key={ticket.id}
                  className={`p-6 sm:p-8 rounded-3xl space-y-6 transition-all ${
                    isDark ? 'bg-[#0E0E12]' : 'bg-neutral-50'
                  }`}
                >
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono uppercase tracking-wider opacity-60">
                        {ticket.tierName}
                      </span>
                      <h3 className="font-bold text-base leading-tight">
                        {ticket.ticketCode}
                      </h3>
                    </div>

                    <span className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg uppercase ${
                      isRefunded 
                        ? 'bg-red-500/20 text-red-400' 
                        : isUsed 
                          ? 'bg-neutral-500/20 text-neutral-400' 
                          : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {ticket.status === 'checked_in' ? 'Used' : ticket.status}
                    </span>
                  </div>

                  {/* QR Presentation Box */}
                  <div className="p-4 bg-white rounded-2xl flex items-center justify-center">
                    {qrCodeUrls[ticket.id] ? (
                      <img
                        src={qrCodeUrls[ticket.id]}
                        alt={ticket.ticketCode}
                        className={`w-48 h-48 object-contain ${
                          isUsed || isRefunded ? 'opacity-30 grayscale' : ''
                        }`}
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-xs text-black font-mono">
                        Generating QR...
                      </div>
                    )}
                  </div>

                  {/* Pass Metadata */}
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="opacity-60">Attendee:</span>
                      <span className="font-bold">{ticket.attendeeName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">Price Paid:</span>
                      <span>{formatCurrency(ticket.priceMinor, ticket.currency)}</span>
                    </div>
                    {ticket.checkedInAt && (
                      <div className="flex justify-between text-neutral-400">
                        <span>Checked In:</span>
                        <span>{new Date(ticket.checkedInAt).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Pass Actions: Transfer & Refund */}
                  {!isUsed && !isRefunded && (
                    <div className={`pt-4 border-t flex items-center gap-2 ${
                      isDark ? 'border-white/10' : 'border-black/10'
                    }`}>
                      <button
                        onClick={() => {
                          setTransferModalTicket(ticket);
                          setTransferName('');
                          setTransferEmail('');
                        }}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          isDark ? 'bg-[#18181C] hover:bg-[#222228] text-white' : 'bg-neutral-200 hover:bg-neutral-300 text-black'
                        }`}
                      >
                        Transfer Pass
                      </button>
                      <button
                        onClick={() => {
                          setRefundModalTicket(ticket);
                          setRefundCustomNote('');
                        }}
                        className="px-3 py-2 rounded-lg text-xs font-mono text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                      >
                        Refund
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Transfer Pass Modal / Form Sheet */}
      {transferModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 sm:p-8 rounded-3xl space-y-6 ${
            isDark ? 'bg-[#0E0E12] text-white' : 'bg-white text-black'
          }`}>
            <h3 className="text-lg font-bold tracking-tight">Transfer Admission Pass</h3>
            <p className="text-xs font-mono opacity-60">
              Transfer {transferModalTicket.ticketCode} ({transferModalTicket.tierName}) to another attendee.
            </p>

            {transferSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold text-center">
                Pass Transferred Successfully!
              </div>
            ) : (
              <form onSubmit={handleTransferSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold mb-1 opacity-70">New Attendee Name</label>
                  <input
                    type="text"
                    required
                    value={transferName}
                    onChange={e => setTransferName(e.target.value)}
                    placeholder="Full Name"
                    className={`w-full px-4 py-3 rounded-xl text-xs focus:outline-none ${
                      isDark ? 'bg-black text-white' : 'bg-neutral-100 text-black'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold mb-1 opacity-70">New Attendee Email</label>
                  <input
                    type="email"
                    required
                    value={transferEmail}
                    onChange={e => setTransferEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className={`w-full px-4 py-3 rounded-xl text-xs focus:outline-none ${
                      isDark ? 'bg-black text-white' : 'bg-neutral-100 text-black'
                    }`}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setTransferModalTicket(null)}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold cursor-pointer ${
                      isDark ? 'bg-black text-white' : 'bg-neutral-100 text-black'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 py-3 rounded-xl text-xs font-bold cursor-pointer ${
                      isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                    }`}
                  >
                    Send Pass
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Refund Request Modal / Form Sheet */}
      {refundModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 sm:p-8 rounded-3xl space-y-6 ${
            isDark ? 'bg-[#0E0E12] text-white' : 'bg-white text-black'
          }`}>
            <h3 className="text-lg font-bold tracking-tight">Request Pass Refund</h3>
            <p className="text-xs font-mono opacity-60">
              Refund {refundModalTicket.ticketCode} ({formatCurrency(refundModalTicket.priceMinor, refundModalTicket.currency)})
            </p>

            {refundFeedback ? (
              <div className={`p-4 rounded-xl text-xs font-mono font-bold text-center ${
                refundFeedback.success ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {refundFeedback.msg}
              </div>
            ) : (
              <form onSubmit={handleRefundSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold mb-1 opacity-70">Reason for Request</label>
                  <select
                    value={refundReason}
                    onChange={e => setRefundReason(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-xs focus:outline-none cursor-pointer ${
                      isDark ? 'bg-black text-white' : 'bg-neutral-100 text-black'
                    }`}
                  >
                    <option value="Schedule conflict — Unable to attend">Schedule conflict — Unable to attend</option>
                    <option value="Medical or personal emergency">Medical or personal emergency</option>
                    <option value="Accidental duplicate booking">Accidental duplicate booking</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold mb-1 opacity-70">Additional Notes</label>
                  <textarea
                    rows={3}
                    value={refundCustomNote}
                    onChange={e => setRefundCustomNote(e.target.value)}
                    placeholder="Details for event organizer..."
                    className={`w-full px-4 py-3 rounded-xl text-xs focus:outline-none ${
                      isDark ? 'bg-black text-white' : 'bg-neutral-100 text-black'
                    }`}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRefundModalTicket(null)}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold cursor-pointer ${
                      isDark ? 'bg-black text-white' : 'bg-neutral-100 text-black'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                  >
                    Confirm Refund
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Cashless RFID Wristband Terminal Modal */}
      {isCashlessOpen && (
        <CashlessTerminalModal
          isOpen={isCashlessOpen}
          onClose={() => setIsCashlessOpen(false)}
          attendeeEmail={tickets[0]?.attendeeEmail || 'nomvula.dlamini@example.com'}
          attendeeName={tickets[0]?.attendeeName || 'Nomvula Dlamini'}
          theme={theme}
        />
      )}

    </div>
  );
};
