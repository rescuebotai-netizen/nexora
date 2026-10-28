import React, { useState, useEffect } from 'react';
import { 
  X, 
  Ticket as TicketIcon, 
  Calendar, 
  MapPin, 
  Printer, 
  Share2, 
  Check, 
  UserCheck, 
  Clock, 
  AlertCircle,
  RotateCcw,
  Search,
  ShieldAlert,
  Send,
  Download,
  ExternalLink,
  Coins
} from 'lucide-react';
import QRCode from 'qrcode';
import { Ticket, RefundRequest } from '../../types';
import { store } from '../../lib/store';
import { formatCurrency, formatEventDate } from '../../lib/currencies';

interface TicketWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: Ticket[];
  onRefresh: () => void;
  onExploreEvents: () => void;
}

export const TicketWalletModal: React.FC<TicketWalletModalProps> = ({
  isOpen,
  onClose,
  tickets,
  onRefresh,
  onExploreEvents,
}) => {
  if (!isOpen) return null;

  const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(tickets[0] || null);
  
  // Transfer state
  const [transferModalTicket, setTransferModalTicket] = useState<Ticket | null>(null);
  const [transferName, setTransferName] = useState('');
  const [transferEmail, setTransferEmail] = useState('');

  // Refund state
  const [refundModalTicket, setRefundModalTicket] = useState<Ticket | null>(null);
  const [refundReason, setRefundReason] = useState('Schedule conflict — Unable to attend');
  const [refundCustomNote, setRefundCustomNote] = useState('');
  const [refundFeedback, setRefundFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // Search / Recover booking filter
  const [searchRef, setSearchRef] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function genQRs() {
      const urls: Record<string, string> = {};
      for (const t of tickets) {
        try {
          urls[t.id] = await QRCode.toDataURL(t.qrPayload, {
            width: 320,
            margin: 1,
            color: { dark: '#111827', light: '#FFFFFF' },
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

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExecuteTransfer = () => {
    if (!transferModalTicket || !transferName.trim() || !transferEmail.trim()) return;
    transferModalTicket.attendeeName = transferName;
    transferModalTicket.attendeeEmail = transferEmail;
    
    // update in store
    const all = store.getTickets();
    const idx = all.findIndex(t => t.id === transferModalTicket.id);
    if (idx !== -1) {
      all[idx] = transferModalTicket;
      localStorage.setItem('nexora_db_v2_tickets', JSON.stringify(all));
    }
    setTransferModalTicket(null);
    setTransferName('');
    setTransferEmail('');
    onRefresh();
  };

  // Execute Refund Request (Journey D)
  const handleSubmitRefundRequest = () => {
    if (!refundModalTicket) return;
    const combinedReason = refundCustomNote ? `${refundReason}: ${refundCustomNote}` : refundReason;
    const res = store.requestRefund(refundModalTicket.id, combinedReason);

    if (res.success) {
      setRefundFeedback({
        success: true,
        msg: `Refund request submitted for ${refundModalTicket.ticketCode}. Under policy review by organizers.`,
      });
      setTimeout(() => {
        setRefundFeedback(null);
        setRefundModalTicket(null);
        onRefresh();
      }, 2500);
    } else {
      setRefundFeedback({
        success: false,
        msg: res.error || 'Failed to submit refund request',
      });
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (!searchRef.trim()) return true;
    const q = searchRef.toLowerCase();
    return (
      t.ticketCode.toLowerCase().includes(q) ||
      t.eventTitle.toLowerCase().includes(q) ||
      t.attendeeName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#111827]/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#111827] text-white flex items-center justify-between border-b border-[#1F2937]">
          <div className="flex items-center gap-2.5">
            <TicketIcon className="w-5 h-5 text-[#F6A623]" />
            <h3 className="text-base font-bold text-white">Attendee Ticket Wallet & Bookings</h3>
            <span className="text-xs bg-[#1F2937] text-[#9CA3AF] px-2 py-0.5 rounded font-mono">
              {tickets.length} {tickets.length === 1 ? 'Pass' : 'Passes'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {tickets.length > 0 && (
              <button
                onClick={handlePrint}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-[#1F2937] hover:bg-[#374151] rounded-lg transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Pass</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#9CA3AF] hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search / Booking filter bar */}
        {tickets.length > 0 && (
          <div className="px-6 py-2.5 bg-[#F8F7F4] border-b border-[#E5E7EB] flex items-center gap-2">
            <Search className="w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              value={searchRef}
              onChange={e => setSearchRef(e.target.value)}
              placeholder="Search by ticket code (e.g. NX-TKT-94821) or attendee name..."
              className="w-full bg-transparent text-xs text-[#111827] focus:outline-none placeholder-[#9CA3AF]"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tickets.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F8F7F4] border border-[#E5E7EB] flex items-center justify-center mx-auto text-[#9CA3AF]">
                <TicketIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-[#111827]">No active tickets found</h4>
                <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
                  When you book passes for festivals, conferences, or cultural summits, they will appear securely here with gate-ready QR codes.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onExploreEvents();
                }}
                className="px-5 py-2.5 bg-[#F6A623] hover:bg-[#E59516] text-[#111827] font-bold text-xs rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                Discover Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Tickets Selector List */}
              <div className="lg:col-span-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  My Booked Passes ({filteredTickets.length})
                </h4>
                <div className="space-y-2.5">
                  {filteredTickets.map(tkt => {
                    const isSelected = selectedTicket?.id === tkt.id;
                    const isCheckedIn = tkt.status === 'checked_in';
                    const isRefunded = tkt.status === 'refunded';

                    return (
                      <div
                        key={tkt.id}
                        onClick={() => setSelectedTicket(tkt)}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#111827] text-white border-[#111827] shadow-md'
                            : 'bg-[#F8F7F4] text-[#111827] border-[#E5E7EB] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                              isSelected ? 'text-[#F6A623]' : 'text-[#6B7280]'
                            }`}>
                              {tkt.tierName}
                            </span>
                            <h5 className="text-sm font-bold line-clamp-1 mt-0.5">
                              {tkt.eventTitle}
                            </h5>
                          </div>
                          
                          {/* Status Badge */}
                          {isRefunded ? (
                            <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded shrink-0 font-mono">
                              Refunded
                            </span>
                          ) : isCheckedIn ? (
                            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded shrink-0 font-mono">
                              Checked In
                            </span>
                          ) : (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded shrink-0 font-mono">
                              Ready
                            </span>
                          )}
                        </div>

                        <div className="mt-2 pt-2 border-t border-current/10 flex items-center justify-between text-xs opacity-80">
                          <span className="font-mono">{tkt.ticketCode}</span>
                          <span>{formatEventDate(tkt.eventDate)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Detailed Ticket Pass View with Scannable QR */}
              <div className="lg:col-span-7">
                {selectedTicket && (
                  <div className="bg-[#111827] text-white rounded-2xl border border-[#1F2937] p-6 shadow-xl space-y-6">
                    
                    {/* Event & Tier Banner */}
                    <div className="border-b border-[#374151] pb-4 flex justify-between items-start gap-4">
                      <div>
                        <span className="text-xs uppercase tracking-widest font-bold text-[#F6A623]">
                          {selectedTicket.tierName}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-1 leading-tight">
                          {selectedTicket.eventTitle}
                        </h3>
                      </div>
                      <div className="text-right">
                        {selectedTicket.status === 'refunded' ? (
                          <div className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-950/80 px-2.5 py-1 rounded border border-red-800 font-mono">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Revoked & Refunded</span>
                          </div>
                        ) : selectedTicket.status === 'checked_in' ? (
                          <div className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded border border-blue-800 font-mono">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Admitted</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800 font-mono">
                            <span>Valid Pass</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* QR Code Presentation */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-white rounded-xl text-[#111827]">
                      <div className="p-2 bg-white rounded-lg border border-[#E5E7EB] shrink-0 shadow-sm">
                        {qrCodeUrls[selectedTicket.id] ? (
                          <img
                            src={qrCodeUrls[selectedTicket.id]}
                            alt={selectedTicket.ticketCode}
                            className="w-40 h-40 object-contain"
                          />
                        ) : (
                          <div className="w-40 h-40 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                            Rendering QR...
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 text-center sm:text-left flex-1">
                        <div className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold">
                          Official Digital Gate Token
                        </div>
                        <div className="font-mono text-base font-extrabold text-[#111827] tracking-wider">
                          {selectedTicket.ticketCode}
                        </div>
                        <button
                          onClick={() => handleCopyCode(selectedTicket.ticketCode)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-[#F8F7F4] hover:bg-[#E59516] text-[#4B5563] rounded border border-[#D1D5DB] transition-colors cursor-pointer"
                        >
                          {copiedCode === selectedTicket.ticketCode ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700 font-medium">Copied Code</span>
                            </>
                          ) : (
                            <span>Copy Code</span>
                          )}
                        </button>
                        <p className="text-[11px] text-[#6B7280] pt-1">
                          Present this pass at any scanner gate. Works with offline verification and turnstile scanners.
                        </p>
                      </div>
                    </div>

                    {/* Meta Details */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-[#1F2937] p-3.5 rounded-xl border border-[#374151]">
                      <div>
                        <span className="text-[#9CA3AF] block">Attendee Name</span>
                        <strong className="text-white text-sm">{selectedTicket.attendeeName}</strong>
                      </div>
                      <div>
                        <span className="text-[#9CA3AF] block">Event Date</span>
                        <strong className="text-white text-sm">{formatEventDate(selectedTicket.eventDate)}</strong>
                      </div>
                      <div>
                        <span className="text-[#9CA3AF] block">Venue</span>
                        <strong className="text-white">{selectedTicket.eventVenue}</strong>
                      </div>
                      <div>
                        <span className="text-[#9CA3AF] block">Price Paid</span>
                        <strong className="text-[#F6A623] font-mono-tabular">
                          {formatCurrency(selectedTicket.priceMinor, selectedTicket.currency)}
                        </strong>
                      </div>
                    </div>

                    {/* Calendar Sync & Referral Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#111827] rounded-xl border border-[#374151]">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-gray-400">Save to Calendar:</span>
                        <a
                          href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(selectedTicket.eventTitle)}&dates=${new Date(selectedTicket.eventDate).toISOString().replace(/-|:|\.\d\d\d/g, '')}/${new Date(new Date(selectedTicket.eventDate).getTime() + 4 * 3600000).toISOString().replace(/-|:|\.\d\d\d/g, '')}&details=${encodeURIComponent(`Official Gate Pass: ${selectedTicket.ticketCode}`)}&location=${encodeURIComponent(selectedTicket.eventVenue)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-[#1F2937] hover:bg-[#374151] text-xs text-white rounded-md border border-[#374151] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Calendar className="w-3 h-3 text-[#F6A623]" />
                          <span>Google</span>
                          <ExternalLink className="w-2.5 h-2.5 text-gray-400" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            const startIso = new Date(selectedTicket.eventDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
                            const endIso = new Date(new Date(selectedTicket.eventDate).getTime() + 4 * 3600000).toISOString().replace(/-|:|\.\d\d\d/g, '');
                            const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//NEXORA//Events//EN\r\nBEGIN:VEVENT\r\nUID:${selectedTicket.id}@nexora.events\r\nDTSTAMP:${startIso}\r\nDTSTART:${startIso}\r\nDTEND:${endIso}\r\nSUMMARY:${selectedTicket.eventTitle}\r\nDESCRIPTION:Gate Pass: ${selectedTicket.ticketCode}\r\nLOCATION:${selectedTicket.eventVenue}\r\nEND:VEVENT\r\nEND:VCALENDAR`;
                            const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
                            const link = document.createElement('a');
                            link.href = window.URL.createObjectURL(blob);
                            link.download = `pass-${selectedTicket.ticketCode}.ics`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="px-2 py-1 bg-[#1F2937] hover:bg-[#374151] text-xs text-white rounded-md border border-[#374151] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Download className="w-3 h-3 text-[#F6A623]" />
                          <span>Apple / iCal</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const refLink = `${window.location.origin}?event=${selectedTicket.eventId}&ref=REF-${selectedTicket.ticketCode.slice(-4)}`;
                          navigator.clipboard?.writeText(refLink);
                          alert('Your referral link was copied! Friends get 10% off & you get 150 points.');
                        }}
                        className="px-2.5 py-1 bg-[#D7B779]/20 hover:bg-[#D7B779]/30 text-[#D7B779] text-xs font-semibold rounded-md border border-[#D7B779]/40 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Refer a Friend (10% Off)</span>
                      </button>
                    </div>

                    {/* Actions: Transfer & Refund & Print */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedTicket.status === 'valid' && (
                        <>
                          <button
                            onClick={() => {
                              setTransferModalTicket(selectedTicket);
                              setTransferName(selectedTicket.attendeeName);
                              setTransferEmail(selectedTicket.attendeeEmail);
                            }}
                            className="flex-1 py-2 text-xs font-semibold bg-[#1F2937] hover:bg-[#374151] text-white border border-[#374151] rounded-lg transition-colors cursor-pointer"
                          >
                            Transfer to Friend
                          </button>
                          <button
                            onClick={() => {
                              setRefundModalTicket(selectedTicket);
                              setRefundCustomNote('');
                              setRefundFeedback(null);
                            }}
                            className="px-3.5 py-2 text-xs font-semibold bg-transparent hover:bg-red-950/40 text-red-300 border border-red-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Request Refund</span>
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={handlePrint}
                        className="px-4 py-2 text-xs font-semibold bg-[#F6A623] hover:bg-[#E59516] text-[#111827] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* REFUND MODAL (PRD Journey D) */}
        {refundModalTicket && (
          <div className="fixed inset-0 z-60 bg-black/75 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#E5E7EB] shadow-2xl">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-red-600" />
                  <h4 className="text-base font-bold text-[#111827]">Request Ticket Refund</h4>
                </div>
                <button onClick={() => setRefundModalTicket(null)} className="text-[#9CA3AF] hover:text-[#111827]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-[#F8F7F4] rounded-xl text-xs space-y-1">
                <div className="font-bold text-[#111827]">{refundModalTicket.eventTitle}</div>
                <div className="text-[#6B7280]">
                  Ticket: <span className="font-mono">{refundModalTicket.ticketCode}</span> · {refundModalTicket.tierName}
                </div>
                <div className="font-bold font-mono text-[#F6A623]">
                  Refund Value: {formatCurrency(refundModalTicket.priceMinor, refundModalTicket.currency)}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#4B5563] mb-1">
                    Select Refund Reason *
                  </label>
                  <select
                    value={refundReason}
                    onChange={e => setRefundReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#D1D5DB] rounded-lg focus:outline-none focus:border-[#F6A623]"
                  >
                    <option value="Schedule conflict — Unable to attend">Schedule conflict — Unable to attend</option>
                    <option value="Medical emergency / illness">Medical emergency / illness</option>
                    <option value="Travel disruption / visa delay">Travel disruption / visa delay</option>
                    <option value="Event date or time rescheduled">Event date or time rescheduled</option>
                    <option value="Accidental duplicate ticket purchase">Accidental duplicate ticket purchase</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4B5563] mb-1">
                    Additional Explanation (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={refundCustomNote}
                    onChange={e => setRefundCustomNote(e.target.value)}
                    placeholder="Provide context for organizer review..."
                    className="w-full px-3 py-2 text-xs border border-[#D1D5DB] rounded-lg focus:outline-none focus:border-[#F6A623]"
                  />
                </div>
              </div>

              {refundFeedback && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  refundFeedback.success ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                }`}>
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{refundFeedback.msg}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  onClick={() => setRefundModalTicket(null)}
                  className="px-3.5 py-2 text-xs text-[#4B5563] hover:bg-[#F8F7F4] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRefundRequest}
                  className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Request</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Modal */}
        {transferModalTicket && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 border border-[#E5E7EB] shadow-2xl">
              <h4 className="text-base font-bold text-[#111827]">Transfer Ticket Pass</h4>
              <p className="text-xs text-[#6B7280]">
                Transfer <strong className="text-[#111827]">{transferModalTicket.ticketCode}</strong> to a new attendee name and email.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#4B5563] mb-1">New Attendee Name</label>
                  <input
                    type="text"
                    value={transferName}
                    onChange={e => setTransferName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#D1D5DB] rounded-lg"
                    placeholder="New Full Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4B5563] mb-1">New Attendee Email</label>
                  <input
                    type="email"
                    value={transferEmail}
                    onChange={e => setTransferEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#D1D5DB] rounded-lg"
                    placeholder="new.email@example.com"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setTransferModalTicket(null)}
                  className="px-3 py-2 text-xs text-[#4B5563] hover:bg-[#F8F7F4] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteTransfer}
                  className="px-4 py-2 text-xs font-bold bg-[#F6A623] hover:bg-[#E59516] text-[#111827] rounded-lg"
                >
                  Confirm Transfer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
