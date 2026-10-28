import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  ShieldCheck, 
  Clock, 
  CreditCard, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  ArrowRight,
  Lock,
  Calendar,
  Share2,
  ExternalLink,
  Coins,
  Check
} from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { Event, Order, Ticket } from '../../types';
import { store } from '../../lib/store';
import { formatCurrency, formatEventDate, formatEventTime } from '../../lib/currencies';

interface CheckoutPageProps {
  event: Event;
  selectedItems: Array<{ tierId: string; quantity: number }>;
  onBack: () => void;
  onTicketsIssued: (tickets: Ticket[]) => void;
  onGoToWallet: () => void;
  theme?: 'light' | 'dark';
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  event,
  selectedItems,
  onBack,
  onTicketsIssued,
  onGoToWallet,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  // Checkout Steps: 1: Details & Review, 2: Payment Gateway, 3: Processing, 4: Confirmation
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Customer Form
  const [name, setName] = useState('Nomvula Dlamini');
  const [email, setEmail] = useState('nomvula.dlamini@example.com');
  const [phone, setPhone] = useState('+27 82 491 0293');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPct: number } | null>(null);
  const [promoError, setPromoError] = useState('');

  // Payment Selection
  const [paymentProvider, setPaymentProvider] = useState<'sandbox' | 'ozow' | 'mpesa'>('sandbox');
  const [mpesaNumber, setMpesaNumber] = useState('254712345678');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');

  // Active Order & Issued Tickets
  const [order, setOrder] = useState<Order | null>(null);
  const [issuedTickets, setIssuedTickets] = useState<Ticket[]>([]);
  const [ticketQrs, setTicketQrs] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Loyalty Points
  const [loyaltyRedeemed, setLoyaltyRedeemed] = useState(false);
  const loyaltyCreditAmount = 25000; // e.g. R250.00 credit

  // Calculate items with details
  const orderItemsWithDetails = selectedItems.map(item => {
    const tier = event.tickets.find(t => t.id === item.tierId);
    return {
      tierId: item.tierId,
      tierName: tier ? tier.name : 'General Admission',
      unitPriceMinor: tier ? tier.priceMinor : 0,
      quantity: item.quantity,
      subtotalMinor: (tier ? tier.priceMinor : 0) * item.quantity,
    };
  });

  const subtotal = orderItemsWithDetails.reduce((acc, item) => acc + item.subtotalMinor, 0);
  const discountAmount = appliedPromo ? Math.round(subtotal * (appliedPromo.discountPct / 100)) : 0;
  const loyaltyDiscount = loyaltyRedeemed ? Math.min(subtotal - discountAmount, loyaltyCreditAmount) : 0;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount - loyaltyDiscount);
  const fees = Math.round(taxableSubtotal * 0.05); // 5% platform & booking fee
  const total = taxableSubtotal + fees;
  const totalTickets = selectedItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'NEXORA10' || code === 'AFRO2026' || code === 'EARLYBIRD') {
      const discount = code === 'AFRO2026' ? 20 : 10;
      setAppliedPromo({ code, discountPct: discount });
      setPromoCodeInput('');
    } else {
      setPromoError('Invalid promo voucher code.');
    }
  };

  const handleCompleteOrder = async () => {
    setIsProcessing(true);
    setStep(3);

    try {
      const orderRes = store.createOrder({
        eventId: event.id,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        items: selectedItems,
        promoCode: appliedPromo?.code,
      });

      if (!orderRes.success || !orderRes.order) {
        throw new Error(orderRes.error || 'Failed to initialize booking');
      }

      setOrder(orderRes.order);

      // Finalize and issue tickets
      const finalizeRes = store.finalizeOrderPayment(
        orderRes.order.id,
        paymentProvider,
        paymentProvider === 'mpesa' ? 'M-Pesa STK Push' : paymentProvider === 'ozow' ? 'Instant EFT' : 'Sandbox Instant'
      );

      if (!finalizeRes.success || finalizeRes.tickets.length === 0) {
        throw new Error(finalizeRes.error || 'Payment finalization failed');
      }

      const tickets = finalizeRes.tickets;
      setIssuedTickets(tickets);
      onTicketsIssued(tickets);

      // Generate QR codes
      const qrs: Record<string, string> = {};
      for (const t of tickets) {
        try {
          qrs[t.id] = await QRCode.toDataURL(t.qrPayload, {
            width: 320,
            margin: 1,
            color: { dark: '#000000', light: '#FFFFFF' },
          });
        } catch (err) {
          console.error(err);
        }
      }
      setTicketQrs(qrs);

      setStep(4);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error(err);
      setStep(2);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      
      {/* Top Breadcrumb Navigation */}
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
            <span>{step === 4 ? 'Back to Marketplace' : 'Back to Event Details'}</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono opacity-60">
            <span>Step {step} of 4</span>
            <span>·</span>
            <span className="capitalize">{step === 1 ? 'Review' : step === 2 ? 'Payment' : step === 3 ? 'Issuing' : 'Confirmed'}</span>
          </div>

        </div>
      </div>

      {/* Main Expansive Webpage Container */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* STEP 1 & 2: Review and Payment Selection */}
        {(step === 1 || step === 2) && (
          <div className="space-y-8">
            
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                Complete Your Booking
              </h1>
              <p className="text-xs sm:text-sm font-mono opacity-60">
                {event.title} · {event.venue.city}, {event.venue.country}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Left Column (7 cols): Attendee Form & Payment Options */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* Attendee Contact Information */}
                <div className={`p-6 sm:p-8 rounded-3xl space-y-4 ${
                  isDark ? 'bg-[#0E0E12]' : 'bg-neutral-50'
                }`}>
                  <h3 className="text-base font-bold tracking-tight">Attendee Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-mono font-bold mb-1 opacity-70">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none ${
                          isDark ? 'bg-black text-white' : 'bg-white text-black'
                        }`}
                        placeholder="e.g. Tendai Chiwenga"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono font-bold mb-1 opacity-70">Email Address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none ${
                            isDark ? 'bg-black text-white' : 'bg-white text-black'
                          }`}
                          placeholder="name@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold mb-1 opacity-70">Mobile Phone</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none ${
                            isDark ? 'bg-black text-white' : 'bg-white text-black'
                          }`}
                          placeholder="+27 82 000 0000"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Rail Selection */}
                <div className={`p-6 sm:p-8 rounded-3xl space-y-4 ${
                  isDark ? 'bg-[#0E0E12]' : 'bg-neutral-50'
                }`}>
                  <h3 className="text-base font-bold tracking-tight">Pan-African Payment Method</h3>
                  
                  <div className="space-y-3">
                    {/* Instant Sandbox Simulation */}
                    <label className={`block p-4 rounded-2xl cursor-pointer transition-all ${
                      paymentProvider === 'sandbox' 
                        ? (isDark ? 'bg-black text-white' : 'bg-white text-black')
                        : (isDark ? 'bg-black/50 text-white/70' : 'bg-white/60 text-black/70')
                    }`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentProvider === 'sandbox'}
                          onChange={() => setPaymentProvider('sandbox')}
                          className="mt-1"
                        />
                        <div className="space-y-1">
                          <span className="font-bold text-sm block">Instant Verified Simulation (Sandbox)</span>
                          <p className="text-xs opacity-70">
                            Instant zero-latency cryptographic clearing verifying full double-entry ledger balance without charging cards.
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* Ozow Instant EFT */}
                    <label className={`block p-4 rounded-2xl cursor-pointer transition-all ${
                      paymentProvider === 'ozow' 
                        ? (isDark ? 'bg-black text-white' : 'bg-white text-black')
                        : (isDark ? 'bg-black/50 text-white/70' : 'bg-white/60 text-black/70')
                    }`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentProvider === 'ozow'}
                          onChange={() => setPaymentProvider('ozow')}
                          className="mt-1"
                        />
                        <div className="space-y-1">
                          <span className="font-bold text-sm block">Instant EFT & Capitec Pay (South Africa)</span>
                          <p className="text-xs opacity-70">
                            FNB, Standard Bank, Capitec, Nedbank, and Absa bank clearing.
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* M-Pesa Express */}
                    <label className={`block p-4 rounded-2xl cursor-pointer transition-all ${
                      paymentProvider === 'mpesa' 
                        ? (isDark ? 'bg-black text-white' : 'bg-white text-black')
                        : (isDark ? 'bg-black/50 text-white/70' : 'bg-white/60 text-black/70')
                    }`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentProvider === 'mpesa'}
                          onChange={() => setPaymentProvider('mpesa')}
                          className="mt-1"
                        />
                        <div className="space-y-1">
                          <span className="font-bold text-sm block">M-Pesa Express STK Push (Kenya & East Africa)</span>
                          <p className="text-xs opacity-70">
                            Direct mobile prompt sent to Safaricom mobile device for instant PIN verification.
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

              </div>

              {/* Right Column (5 cols): Order Breakdown & Checkout Action */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className={`p-6 sm:p-8 rounded-3xl space-y-6 sticky top-28 ${
                  isDark ? 'bg-[#0E0E12]' : 'bg-neutral-50'
                }`}>
                  
                  <h3 className="text-base font-bold tracking-tight">Order Breakdown</h3>

                  {/* Selected Tickets List */}
                  <div className="space-y-2">
                    {orderItemsWithDetails.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span>{item.quantity}× {item.tierName}</span>
                        <span className="font-mono font-bold">
                          {formatCurrency(item.subtotalMinor, event.currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Promo Code Input */}
                  <div className="pt-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCodeInput}
                        onChange={e => setPromoCodeInput(e.target.value)}
                        placeholder="Voucher Code"
                        className={`flex-1 px-3 py-2 text-xs rounded-xl uppercase font-mono focus:outline-none ${
                          isDark ? 'bg-black text-white' : 'bg-white text-black'
                        }`}
                      />
                      <button
                        onClick={handleApplyPromo}
                        className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer ${
                          isDark ? 'bg-white text-black' : 'bg-black text-white'
                        }`}
                      >
                        Apply
                      </button>
                    </div>
                    {appliedPromo && (
                      <p className="text-xs text-emerald-500 font-mono mt-1">
                        Promo {appliedPromo.code} applied ({appliedPromo.discountPct}% off)
                      </p>
                    )}
                    {promoError && (
                      <p className="text-xs text-red-500 font-mono mt-1">{promoError}</p>
                    )}
                  </div>

                  {/* Loyalty Points Redemption Toggle */}
                  <div className={`p-3.5 rounded-xl flex items-center justify-between text-xs ${
                    isDark ? 'bg-black/60' : 'bg-white'
                  }`}>
                    <div>
                      <span className="font-bold block">Nexora Member Points</span>
                      <span className="text-[11px] opacity-60 font-mono">500 Pts available</span>
                    </div>
                    <button
                      onClick={() => setLoyaltyRedeemed(!loyaltyRedeemed)}
                      className="font-bold underline cursor-pointer text-xs"
                    >
                      {loyaltyRedeemed ? 'Applied' : 'Redeem'}
                    </button>
                  </div>

                  {/* Financial Math Summary */}
                  <div className={`pt-4 border-t space-y-2 text-xs font-mono ${
                    isDark ? 'border-white/10' : 'border-black/10'
                  }`}>
                    <div className="flex justify-between">
                      <span className="opacity-60">Subtotal:</span>
                      <span>{formatCurrency(subtotal, event.currency)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-500">
                        <span>Discount:</span>
                        <span>-{formatCurrency(discountAmount, event.currency)}</span>
                      </div>
                    )}
                    {loyaltyDiscount > 0 && (
                      <div className="flex justify-between text-emerald-500">
                        <span>Loyalty Credit:</span>
                        <span>-{formatCurrency(loyaltyDiscount, event.currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="opacity-60">Service & Booking Fee:</span>
                      <span>{formatCurrency(fees, event.currency)}</span>
                    </div>
                    <div className="flex justify-between text-base font-sans font-black pt-2">
                      <span>Total Amount:</span>
                      <span className="font-mono">{formatCurrency(total, event.currency)}</span>
                    </div>
                  </div>

                  {/* Authorize & Purchase CTA */}
                  <button
                    onClick={handleCompleteOrder}
                    disabled={isProcessing || !name || !email}
                    className={`w-full py-4 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xl disabled:opacity-40 disabled:cursor-not-allowed ${
                      isDark
                        ? 'bg-white hover:bg-neutral-200 text-black'
                        : 'bg-black hover:bg-neutral-800 text-white'
                    }`}
                  >
                    Authorize & Issue Tickets ({formatCurrency(total, event.currency)})
                  </button>

                  <div className="text-[11px] opacity-50 font-mono text-center flex items-center justify-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>256-Bit Encrypted · Double-Entry Ledger Protection</span>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* STEP 3: Processing */}
        {step === 3 && (
          <div className="py-24 text-center space-y-6 max-w-md mx-auto">
            <div className={`w-16 h-16 rounded-full border-2 border-t-transparent animate-spin mx-auto ${
              isDark ? 'border-white' : 'border-black'
            }`} />
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight">Securing Your Admission</h2>
              <p className="text-xs font-mono opacity-60">
                Authorizing funds with {paymentProvider.toUpperCase()} and generating cryptographic tokens...
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: Confirmation & Issued Tickets */}
        {step === 4 && (
          <div className="space-y-10 max-w-4xl mx-auto">
            
            <div className={`p-8 sm:p-12 rounded-3xl text-center space-y-4 ${
              isDark ? 'bg-[#0E0E12]' : 'bg-neutral-50'
            }`}>
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Booking Confirmed!</h2>
              <p className="text-sm font-mono opacity-70 max-w-lg mx-auto">
                Your admission passes have been cryptographically signed and issued to <strong>{email}</strong>.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <button
                  onClick={onGoToWallet}
                  className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg ${
                    isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                  }`}
                >
                  View in Ticket Wallet
                </button>
                <button
                  onClick={onBack}
                  className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer ${
                    isDark ? 'bg-[#18181C] text-white hover:bg-[#202025]' : 'bg-neutral-200 text-black hover:bg-neutral-300'
                  }`}
                >
                  Discover More Events
                </button>
              </div>
            </div>

            {/* Issued Passes Grid */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold tracking-tight">Your Digital Passports</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {issuedTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    className={`p-6 rounded-3xl space-y-4 ${
                      isDark ? 'bg-[#0E0E12]' : 'bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-mono uppercase tracking-wider opacity-60 block">Ticket Pass</span>
                        <h4 className="font-bold text-base">{ticket.tierName}</h4>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                        {ticket.status.toUpperCase()}
                      </span>
                    </div>

                    {/* QR Code Presentation */}
                    <div className="p-4 bg-white rounded-2xl flex items-center justify-center">
                      {ticketQrs[ticket.id] ? (
                        <img
                          src={ticketQrs[ticket.id]}
                          alt={ticket.ticketCode}
                          className="w-48 h-48 object-contain"
                        />
                      ) : (
                        <div className="w-48 h-48 flex items-center justify-center text-xs text-black font-mono">
                          Generating QR...
                        </div>
                      )}
                    </div>

                    <div className="text-center space-y-1 font-mono text-xs">
                      <p className="font-bold tracking-wider">{ticket.ticketCode}</p>
                      <p className="opacity-60 text-[11px]">Attendee: {ticket.attendeeName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
