import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  QrCode as QrIcon, 
  Download, 
  ArrowRight,
  Lock,
  Calendar,
  Share2,
  ExternalLink,
  Coins
} from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { Event, Order, Ticket } from '../../types';
import { store } from '../../lib/store';
import { formatCurrency, formatEventDate, formatEventTime } from '../../lib/currencies';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  selectedItems: Array<{ tierId: string; quantity: number }>;
  onTicketsIssued: (tickets: Ticket[]) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  event,
  selectedItems,
  onTicketsIssued,
}) => {
  if (!isOpen) return null;

  // Checkout Steps: 1: Details & Review, 2: Payment Gateway, 3: Processing, 4: Confirmation & Tickets
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Customer Form
  const [name, setName] = useState('Nomvula Dlamini');
  const [email, setEmail] = useState('nomvula.dlamini@example.com');
  const [phone, setPhone] = useState('+27 82 491 0293');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPct: number } | null>(null);
  const [promoError, setPromoError] = useState('');

  // Payment Selection
  const [paymentProvider, setPaymentProvider] = useState<'paystack' | 'flutterwave' | 'mpesa' | 'ozow' | 'sandbox'>('sandbox');
  const [mpesaNumber, setMpesaNumber] = useState('254712345678');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');

  // Active Order & Issued Tickets
  const [order, setOrder] = useState<Order | null>(null);
  const [issuedTickets, setIssuedTickets] = useState<Ticket[]>([]);
  const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});
  const [processingStatus, setProcessingStatus] = useState<string>('Initiating cryptographic checkout...');

  // Countdown reservation timer (10 mins)
  const [secondsRemaining, setSecondsRemaining] = useState(600);

  useEffect(() => {
    if (step >= 4) return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  // Calculate pricing
  const subtotalMinor = selectedItems.reduce((acc, item) => {
    const tier = event.tickets.find(t => t.id === item.tierId);
    return acc + (tier ? tier.priceMinor * item.quantity : 0);
  }, 0);

  const discountMinor = appliedPromo
    ? Math.round((subtotalMinor * appliedPromo.discountPct) / 100)
    : 0;

  const platformFeeMinor = subtotalMinor > 0
    ? Math.round((subtotalMinor - discountMinor) * 0.035)
    : 0;

  const totalMinor = Math.max(0, subtotalMinor - discountMinor + platformFeeMinor);

  // Apply promo or friend referral code
  const handleApplyPromo = () => {
    setPromoError('');
    const cleanCode = promoCodeInput.trim().toUpperCase();
    if (!cleanCode) return;

    // Check if referral code (starts with REF, NEX, or contains REF)
    if (cleanCode.startsWith('REF') || cleanCode.startsWith('NEX') || cleanCode.includes('FRIEND')) {
      setAppliedPromo({ code: cleanCode, discountPct: 10 });
      setPromoCodeInput('');
      return;
    }

    const promo = store.validatePromoCode(cleanCode, event.id);
    if (promo) {
      setAppliedPromo({ code: promo.code, discountPct: promo.discountPercentage });
      setPromoCodeInput('');
    } else {
      setPromoError('Invalid or expired promotional/referral code');
    }
  };

  // Step 1 -> Step 2: Create Order in Store
  const handleProceedToPayment = () => {
    if (!name.trim() || !email.trim()) return;

    const res = store.createOrder({
      eventId: event.id,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      items: selectedItems,
      promoCode: appliedPromo?.code,
    });

    if (res.success && res.order) {
      setOrder(res.order);
      setStep(2);
    } else {
      alert(res.error || 'Failed to reserve ticket inventory');
    }
  };

  // Step 2 -> Step 3 & 4: Execute Payment & Idempotent Ticket Issuance
  const handleExecutePayment = async () => {
    if (!order) return;
    setStep(3);

    // Multi-stage realistic settlement transition
    setProcessingStatus('Connecting to payment clearing network...');
    await new Promise(r => setTimeout(r, 600));

    if (paymentProvider === 'mpesa') {
      setProcessingStatus(`Sending Daraja STK Push to ${mpesaNumber}...`);
      await new Promise(r => setTimeout(r, 800));
    } else if (paymentProvider === 'ozow') {
      setProcessingStatus('Verifying Instant EFT authorization with South African bank...');
      await new Promise(r => setTimeout(r, 800));
    } else {
      setProcessingStatus('Verifying 3D-Secure transaction authorization...');
      await new Promise(r => setTimeout(r, 700));
    }

    setProcessingStatus('Issuing cryptographically signed tickets & updating ledger...');
    await new Promise(r => setTimeout(r, 700));

    // Authoritative backend call in store
    const finalizeRes = store.finalizeOrderPayment(
      order.id,
      paymentProvider,
      paymentProvider === 'mpesa' ? 'M-Pesa STK Push' : paymentProvider === 'ozow' ? 'Instant EFT' : 'Sandbox Card'
    );

    if (finalizeRes.success && finalizeRes.tickets.length > 0) {
      setIssuedTickets(finalizeRes.tickets);
      onTicketsIssued(finalizeRes.tickets);

      // Generate Data URLs for QR codes
      const urls: Record<string, string> = {};
      for (const t of finalizeRes.tickets) {
        try {
          urls[t.id] = await QRCode.toDataURL(t.qrPayload, {
            width: 256,
            margin: 1,
            color: { dark: '#111827', light: '#FFFFFF' },
          });
        } catch (e) {
          console.error(e);
        }
      }
      setQrCodeUrls(urls);

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F6A623', '#111827', '#10B981'],
        });
      } catch {}

      setStep(4);
    } else {
      alert(finalizeRes.error || 'Payment failed');
      setStep(2);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#111827]/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden my-auto max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#111827] text-white flex items-center justify-between border-b border-[#1F2937]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F6A623] text-[#111827] flex items-center justify-center font-extrabold text-sm">
              NX
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                {step === 4 ? 'Booking Confirmed!' : 'Secure Ticket Checkout'}
              </h3>
              <p className="text-xs text-[#9CA3AF] line-clamp-1">{event.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {step < 4 && (
              <div className="flex items-center gap-1.5 text-xs text-[#F6A623] font-mono bg-[#1F2937] px-2.5 py-1 rounded border border-[#374151]">
                <Clock className="w-3.5 h-3.5" />
                <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#9CA3AF] hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {step < 4 && (
          <div className="w-full bg-[#E5E7EB] h-1">
            <div
              className="bg-[#F6A623] h-1 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* STEP 1: Attendee Details & Order Review */}
          {step === 1 && (
            <div className="space-y-6">
              
              {/* Selected Items Summary */}
              <div className="bg-[#F8F7F4] p-4 rounded-xl border border-[#E5E7EB] space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Your Selection
                </h4>
                {selectedItems.map(item => {
                  const tier = event.tickets.find(t => t.id === item.tierId);
                  if (!tier) return null;
                  return (
                    <div key={item.tierId} className="flex justify-between items-center text-sm">
                      <div className="font-semibold text-[#111827]">
                        {item.quantity} × {tier.name}
                      </div>
                      <div className="font-mono-tabular font-bold text-[#111827]">
                        {formatCurrency(tier.priceMinor * item.quantity, event.currency)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Attendee Contact Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#111827]">
                  Attendee & Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#4B5563] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      placeholder="e.g. Nomvula Dlamini"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:border-[#F6A623]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#4B5563] mb-1">
                      Email Address (For Tickets) *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="nomvula@example.com"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:border-[#F6A623]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#4B5563] mb-1">
                      Mobile Number (For Gate Entry & SMS) *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                      placeholder="+27 82 000 0000"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:border-[#F6A623]"
                    />
                  </div>
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#4B5563]">
                  Have a Promo / Discount Code?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. NEXORA10 or AFRICAVIP"
                    className="flex-1 px-3 py-2 text-xs uppercase font-mono bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:border-[#F6A623]"
                  />
                  <button
                    onClick={handleApplyPromo}
                    type="button"
                    className="px-4 py-2 bg-[#1F2937] hover:bg-[#111827] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {appliedPromo && (
                  <p className="text-xs text-emerald-600 font-medium">
                    Promo code {appliedPromo.code} applied ({appliedPromo.discountPct}% off)
                  </p>
                )}
                {promoError && (
                  <p className="text-xs text-red-600 font-medium">{promoError}</p>
                )}
              </div>

              {/* Order Financial Breakdown */}
              <div className="bg-[#F8F7F4] p-4 rounded-xl border border-[#E5E7EB] space-y-2 text-xs">
                <div className="flex justify-between text-[#6B7280]">
                  <span>Subtotal</span>
                  <span className="font-mono-tabular font-medium">
                    {formatCurrency(subtotalMinor, event.currency)}
                  </span>
                </div>

                {discountMinor > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({appliedPromo?.code})</span>
                    <span className="font-mono-tabular font-medium">
                      -{formatCurrency(discountMinor, event.currency)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-[#6B7280]">
                  <span>Platform & Processing Fee (3.5%)</span>
                  <span className="font-mono-tabular font-medium">
                    {formatCurrency(platformFeeMinor, event.currency)}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#D1D5DB] flex justify-between text-base font-bold text-[#111827]">
                  <span>Total Amount</span>
                  <span className="font-mono-tabular text-[#F6A623]">
                    {formatCurrency(totalMinor, event.currency)}
                  </span>
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={handleProceedToPayment}
                className="w-full py-3 bg-[#F6A623] hover:bg-[#E59516] text-[#111827] font-bold text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

          {/* STEP 2: Localized Payment Method Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-[#111827]">Select Payment Method</h4>
                <p className="text-xs text-[#6B7280]">
                  Encrypted bank-grade checkout powered by localized payment infrastructure
                </p>
              </div>

              {/* Payment Methods Options */}
              <div className="space-y-2.5">
                
                {/* Instant Sandbox Fast-Track (Recommended for testing) */}
                <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  paymentProvider === 'sandbox' ? 'bg-[#F8F7F4] border-[#F6A623]' : 'border-[#E5E7EB]'
                }`}>
                  <input
                    type="radio"
                    name="paymentProvider"
                    checked={paymentProvider === 'sandbox'}
                    onChange={() => setPaymentProvider('sandbox')}
                    className="mt-1 text-[#F6A623] focus:ring-[#F6A623]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#111827]">Instant Sandbox Gateway</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.2 rounded font-mono">
                        Instant Test Mode
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      Fast-track test settlement verifying full ledger credit, webhook confirmation & QR issuance without real charges.
                    </p>
                  </div>
                </label>

                {/* South Africa: Ozow Instant EFT / Capitec Pay */}
                <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  paymentProvider === 'ozow' ? 'bg-[#F8F7F4] border-[#F6A623]' : 'border-[#E5E7EB]'
                }`}>
                  <input
                    type="radio"
                    name="paymentProvider"
                    checked={paymentProvider === 'ozow'}
                    onChange={() => setPaymentProvider('ozow')}
                    className="mt-1 text-[#F6A623] focus:ring-[#F6A623]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#111827]">Instant EFT & Capitec Pay</span>
                      <span className="text-xs text-[#9CA3AF]">ZA · South Africa</span>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      FNB, Standard Bank, Capitec, Nedbank, Absa direct account settlement.
                    </p>
                  </div>
                </label>

                {/* Kenya: M-Pesa Express */}
                <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  paymentProvider === 'mpesa' ? 'bg-[#F8F7F4] border-[#F6A623]' : 'border-[#E5E7EB]'
                }`}>
                  <input
                    type="radio"
                    name="paymentProvider"
                    checked={paymentProvider === 'mpesa'}
                    onChange={() => setPaymentProvider('mpesa')}
                    className="mt-1 text-[#F6A623] focus:ring-[#F6A623]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-bold text-[#111827]">M-Pesa Express (STK Push)</span>
                      <span className="text-xs text-[#9CA3AF]">KE · Kenya / East Africa</span>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      Direct prompt sent to Safaricom mobile device for PIN confirmation.
                    </p>
                    {paymentProvider === 'mpesa' && (
                      <div className="mt-2.5">
                        <label className="block text-[11px] font-medium text-[#4B5563] mb-1">
                          Safaricom Phone Number (254...)
                        </label>
                        <input
                          type="tel"
                          value={mpesaNumber}
                          onChange={e => setMpesaNumber(e.target.value)}
                          className="w-full max-w-xs px-3 py-1.5 text-xs bg-white border border-[#D1D5DB] rounded font-mono"
                        />
                      </div>
                    )}
                  </div>
                </label>

                {/* International Cards & Paystack / Flutterwave */}
                <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  paymentProvider === 'paystack' ? 'bg-[#F8F7F4] border-[#F6A623]' : 'border-[#E5E7EB]'
                }`}>
                  <input
                    type="radio"
                    name="paymentProvider"
                    checked={paymentProvider === 'paystack'}
                    onChange={() => setPaymentProvider('paystack')}
                    className="mt-1 text-[#F6A623] focus:ring-[#F6A623]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#F6A623]" />
                      <span className="text-sm font-bold text-[#111827]">Visa, Mastercard & Verve</span>
                      <span className="text-xs text-[#9CA3AF]">Pan-African & Global</span>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      Secured by 3D-Secure 2.0 with tokenized gateway processing.
                    </p>
                  </div>
                </label>

              </div>

              {/* Total Summary */}
              <div className="flex justify-between items-center p-3.5 bg-[#F8F7F4] rounded-xl border border-[#E5E7EB]">
                <div>
                  <span className="text-xs text-[#6B7280] block">Order Ref: {order?.orderReference}</span>
                  <span className="text-sm font-bold text-[#111827]">Amount to Authorize</span>
                </div>
                <div className="text-lg font-bold text-[#111827] font-mono-tabular">
                  {formatCurrency(totalMinor, event.currency)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 border border-[#D1D5DB] hover:bg-[#F8F7F4] text-[#4B5563] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleExecutePayment}
                  className="flex-1 py-3 bg-[#F6A623] hover:bg-[#E59516] text-[#111827] font-bold text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <Lock className="w-4 h-4" />
                  <span>Authorize & Complete Booking</span>
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: Multi-Stage Processing State */}
          {step === 3 && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 border-4 border-[#F6A623]/20 border-t-[#F6A623] rounded-full animate-spin" />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-[#111827]">Processing Transaction</h4>
                <p className="text-xs text-[#6B7280] max-w-sm">{processingStatus}</p>
              </div>
              <div className="text-[11px] text-[#9CA3AF] font-mono pt-4">
                Ref: {order?.orderReference} · 256-Bit SSL Transport
              </div>
            </div>
          )}

          {/* STEP 4: Success, Confirmation & Issued QR Tickets */}
          {step === 4 && (
            <div className="space-y-6">
              
              <div className="text-center space-y-1 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                <div className="inline-flex p-2 bg-emerald-100 rounded-full text-emerald-600 mb-1">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-emerald-900">
                  Payment Verified & Tickets Issued!
                </h3>
                <p className="text-xs text-emerald-700">
                  A receipt and pass details were generated for <strong className="font-semibold">{email}</strong>.
                </p>
                <div className="text-xs font-mono text-emerald-800 pt-1">
                  Booking Reference: {order?.orderReference}
                </div>
              </div>

              {/* Issued Tickets Cards */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                  <QrIcon className="w-4 h-4 text-[#F6A623]" />
                  <span>Your Digital Gate Passes ({issuedTickets.length})</span>
                </h4>

                <div className="space-y-3">
                  {issuedTickets.map((tkt, idx) => (
                    <div
                      key={tkt.id}
                      className="bg-[#111827] text-white p-4 rounded-xl border border-[#1F2937] flex flex-col sm:flex-row gap-4 items-center justify-between shadow-lg"
                    >
                      {/* Left Ticket Info */}
                      <div className="space-y-1 text-center sm:text-left flex-1">
                        <div className="text-xs font-semibold text-[#F6A623] uppercase tracking-wide">
                          Pass #{idx + 1} · {tkt.tierName}
                        </div>
                        <h5 className="text-base font-bold text-white line-clamp-1">{tkt.eventTitle}</h5>
                        <p className="text-xs text-[#9CA3AF]">
                          Attendee: <strong className="text-white">{tkt.attendeeName}</strong>
                        </p>
                        <div className="text-[11px] font-mono text-[#6B7280] pt-1">
                          Code: <span className="text-[#F6A623]">{tkt.ticketCode}</span>
                        </div>
                      </div>

                      {/* Right Scannable QR Code */}
                      <div className="flex flex-col items-center gap-1.5 shrink-0 bg-white p-2 rounded-lg">
                        {qrCodeUrls[tkt.id] ? (
                          <img
                            src={qrCodeUrls[tkt.id]}
                            alt={tkt.ticketCode}
                            className="w-28 h-28 object-contain"
                          />
                        ) : (
                          <div className="w-28 h-28 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                            Loading QR...
                          </div>
                        )}
                        <span className="text-[9px] font-mono font-bold text-[#111827]">
                          VALID FOR ENTRY
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add to Calendar & Referral Sharing Actions */}
              <div className="p-4 bg-[#F8F7F4] border border-gray-200 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
                  <div>
                    <h5 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#F6A623]" />
                      <span>Save Experience to Your Calendar</span>
                    </h5>
                    <p className="text-[11px] text-gray-500">Sync with reminders so you never miss gate opening</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${new Date(event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '')}/${new Date(event.endDate).toISOString().replace(/-|:|\.\d\d\d/g, '')}&details=${encodeURIComponent(event.shortSummary || '')}&location=${encodeURIComponent(event.venue.name + ', ' + event.venue.city)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-white hover:bg-gray-50 text-[#111827] border border-gray-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <span>Google</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        const startIso = new Date(event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
                        const endIso = new Date(event.endDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
                        const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//NEXORA//Events//EN\r\nBEGIN:VEVENT\r\nUID:${event.id}@nexora.events\r\nDTSTAMP:${startIso}\r\nDTSTART:${startIso}\r\nDTEND:${endIso}\r\nSUMMARY:${event.title}\r\nLOCATION:${event.venue.name}, ${event.venue.city}\r\nEND:VEVENT\r\nEND:VCALENDAR`;
                        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
                        const link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);
                        link.download = `${event.slug}.ics`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="px-2.5 py-1.5 bg-white hover:bg-gray-50 text-[#111827] border border-gray-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3 h-3 text-gray-500" />
                      <span>Apple / iCal</span>
                    </button>
                  </div>
                </div>

                {/* Referral Invite Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div>
                    <h5 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-[#D7B779]" />
                      <span>Invite Friends & Earn 150 Points</span>
                    </h5>
                    <p className="text-[11px] text-gray-500">Your friends get 10% off. You earn reward credit per ticket!</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const refLink = `${window.location.origin}?event=${event.id}&ref=REF-NEX${event.id.slice(-3).toUpperCase()}`;
                      navigator.clipboard?.writeText(refLink);
                      alert('Referral link copied to clipboard! Share it with your friends for 10% off.');
                    }}
                    className="px-3 py-1.5 bg-[#101522] hover:bg-[#1f293d] text-[#D7B779] text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs whitespace-nowrap self-start sm:self-auto"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Copy Referral Link</span>
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-[#111827] hover:bg-[#1F2937] text-white font-bold text-sm rounded-lg transition-colors cursor-pointer"
                >
                  View My Tickets in Wallet
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
