import React, { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Zap, 
  X, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle, 
  Plus, 
  ArrowUpRight, 
  ShoppingBag, 
  Coffee, 
  Wine, 
  Music,
  ShieldCheck,
  Radio,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CashlessWristband, Event } from '../../types';
import { store } from '../../lib/store';
import { formatCurrency } from '../../lib/currencies';

interface CashlessTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendeeEmail?: string;
  attendeeName?: string;
  theme?: 'light' | 'dark';
}

const SAMPLE_VENDORS = [
  { name: 'Garden Amphitheatre Craft Bar', category: 'Beverage' },
  { name: 'Afro-Fusion Suya Kitchen', category: 'Food' },
  { name: 'Official Tour Merch Store', category: 'Merchandise' },
  { name: 'VIP Terrace Champagne Lounge', category: 'VIP Hospitality' },
];

const MENU_ITEMS = [
  { id: 'item-1', name: 'Local Craft Cider / Beer', priceMinor: 6500, icon: Wine },
  { id: 'item-2', name: 'Suya Spiced Beef Box', priceMinor: 11000, icon: Coffee },
  { id: 'item-3', name: 'Artisan Sparkling Mineral Water', priceMinor: 3500, icon: Coffee },
  { id: 'item-4', name: 'Official Festival Cotton Tee', priceMinor: 35000, icon: ShoppingBag },
  { id: 'item-5', name: 'Signature Stellenbosch Pinotage', priceMinor: 9500, icon: Wine },
];

export const CashlessTerminalModal: React.FC<CashlessTerminalModalProps> = ({
  isOpen,
  onClose,
  attendeeEmail = 'nomvula.dlamini@example.com',
  attendeeName = 'Nomvula Dlamini',
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<'attendee_wallet' | 'vendor_pos'>('attendee_wallet');
  const [wristband, setWristband] = useState<CashlessWristband>(() => {
    const existing = store.getWristbandForAttendee(attendeeEmail);
    if (existing) return existing;
    return store.pairWristband({
      uid: 'NFC-4A:9B:C2:11',
      attendeeEmail,
      attendeeName,
      eventId: 'evt-cape-town-vibes-2026',
      eventTitle: 'Cape Town Vibes Festival 2026',
      initialBalanceMinor: 75000,
      currency: 'ZAR'
    });
  });

  // Attendee Top Up State
  const [topUpAmount, setTopUpAmount] = useState<number>(25000); // R250.00
  const [selectedGateway, setSelectedGateway] = useState<string>('M-Pesa / Ozow EFT');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Vendor POS State
  const [selectedVendor, setSelectedVendor] = useState(SAMPLE_VENDORS[0].name);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [tapSuccess, setTapSuccess] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const handleTopUp = () => {
    setIsProcessing(true);
    setFeedback(null);

    setTimeout(() => {
      const res = store.topUpWristband(wristband.uid, topUpAmount, selectedGateway);
      setIsProcessing(false);
      if (res.success && res.wristband) {
        setWristband(res.wristband);
        setFeedback(res.message);
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      }
    }, 450);
  };

  const handleCartAdd = (itemId: string) => {
    setCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const handleCartRemove = (itemId: string) => {
    setCart(prev => {
      const current = prev[itemId] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: current - 1 };
    });
  };

  const cartTotalMinor = Object.entries(cart).reduce((sum, [itemId, qty]) => {
    const item = MENU_ITEMS.find(i => i.id === itemId);
    return sum + (item ? item.priceMinor * qty : 0);
  }, 0);

  const handleSimulateNfcTap = () => {
    if (cartTotalMinor === 0) return;
    setIsProcessing(true);
    setTapSuccess(null);
    setFeedback(null);

    setTimeout(() => {
      const res = store.chargeWristband(wristband.uid, cartTotalMinor, selectedVendor);
      setIsProcessing(false);
      if (res.success && res.wristband) {
        setWristband(res.wristband);
        setTapSuccess(true);
        setFeedback(res.message);
        setCart({});
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      } else {
        setTapSuccess(false);
        setFeedback(res.message);
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden transition-all ${
          isDark 
            ? 'bg-[#0B0B0E] border-white/15 text-white' 
            : 'bg-white border-black/15 text-black'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between gap-4 ${
          isDark ? 'border-white/10 bg-white/2' : 'border-black/10 bg-black/2'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider uppercase opacity-75">
                On-Site Cashless Infrastructure
              </span>
            </div>
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
              <span>NFC Wristband & Cashless Terminal</span>
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Switcher */}
            <div className={`p-1 rounded-xl border flex items-center gap-1 ${
              isDark ? 'bg-black/60 border-white/15' : 'bg-neutral-100 border-black/10'
            }`}>
              <button
                onClick={() => { setMode('attendee_wallet'); setFeedback(null); }}
                className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                  mode === 'attendee_wallet'
                    ? (isDark ? 'bg-white text-black' : 'bg-black text-white')
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                Attendee Wallet
              </button>
              <button
                onClick={() => { setMode('vendor_pos'); setFeedback(null); }}
                className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                  mode === 'vendor_pos'
                    ? (isDark ? 'bg-white text-black' : 'bg-black text-white')
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                Vendor POS Bar
              </button>
            </div>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isDark ? 'hover:bg-white/10 text-white/70' : 'hover:bg-black/10 text-black/70'
              }`}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Virtual Wristband Card Graphic */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-950 text-white border border-white/15 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold tracking-wider uppercase opacity-80">NFC Pass Active</span>
              </div>
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20">
                UID: {wristband.uid}
              </span>
            </div>

            <div className="space-y-1 mb-6">
              <span className="text-[11px] font-mono opacity-60 uppercase block">Available Balance</span>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                {formatCurrency(wristband.balanceMinor, wristband.currency)}
              </div>
            </div>

            <div className="flex items-end justify-between text-xs font-mono pt-3 border-t border-white/15">
              <div>
                <span className="opacity-50 text-[10px] block">Passholder</span>
                <span className="font-bold">{wristband.attendeeName}</span>
              </div>
              <div className="text-right">
                <span className="opacity-50 text-[10px] block">Linked Event</span>
                <span className="font-bold text-white/90">{wristband.eventTitle.split(' ')[0]}</span>
              </div>
            </div>
          </div>

          {feedback && (
            <div className={`p-3.5 rounded-xl text-xs font-mono flex items-center gap-2 animate-fade-in ${
              tapSuccess === false 
                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' 
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            }`}>
              {tapSuccess === false ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{feedback}</span>
            </div>
          )}

          {/* VIEW A: ATTENDEE WALLET & TOP-UP */}
          {mode === 'attendee_wallet' && (
            <div className="space-y-6">
              
              {/* Quick Top-up Selector */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isDark ? 'bg-black/40 border-white/10' : 'bg-neutral-50 border-black/10'
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider font-mono opacity-80 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Instant Wristband Top-up</span>
                  </h4>
                  <span className="text-[10px] font-mono opacity-60">Zero Service Fee</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[10000, 25000, 50000, 100000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setTopUpAmount(amount)}
                      className={`p-3 rounded-xl text-center text-xs font-mono font-bold transition-all cursor-pointer border ${
                        topUpAmount === amount
                          ? (isDark ? 'bg-white text-black font-extrabold shadow-md' : 'bg-black text-white font-extrabold shadow-md')
                          : (isDark ? 'bg-[#121214] border-white/10 hover:border-white/30 text-white/80' : 'bg-white border-black/10 hover:border-black/30 text-black/80')
                      }`}
                    >
                      {formatCurrency(amount, wristband.currency)}
                    </button>
                  ))}
                </div>

                {/* Gateway Selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono opacity-70 block">Settlement Rail:</label>
                  <select
                    value={selectedGateway}
                    onChange={e => setSelectedGateway(e.target.value)}
                    className={`w-full p-2.5 text-xs font-mono rounded-lg border outline-none cursor-pointer ${
                      isDark ? 'bg-black border-white/20 text-white' : 'bg-white border-black/20 text-black'
                    }`}
                  >
                    <option value="M-Pesa / Ozow EFT">M-Pesa Express / Ozow Instant EFT (Fastest)</option>
                    <option value="Paystack Card & Bank">Paystack 3D-Secure Card & Bank Transfer</option>
                    <option value="Flutterwave Mobile Money">Flutterwave Mobile Money & Barter</option>
                    <option value="Apple Pay / International Card">Apple Pay / Visa / Mastercard</option>
                  </select>
                </div>

                <button
                  onClick={handleTopUp}
                  disabled={isProcessing}
                  className={`w-full py-3.5 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
                    isDark 
                      ? 'bg-amber-400 hover:bg-amber-300 text-black font-extrabold shadow-amber-400/20' 
                      : 'bg-black hover:bg-neutral-800 text-white'
                  }`}
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Load {formatCurrency(topUpAmount, wristband.currency)} onto Wristband</span>
                </button>
              </div>

              {/* Transaction Ledger on Wristband */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono opacity-70 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 opacity-60" />
                  <span>On-Wristband Transaction Ledger ({wristband.transactions.length})</span>
                </h4>

                <div className={`rounded-xl border divide-y overflow-hidden ${
                  isDark ? 'border-white/10 divide-white/10 bg-black/30' : 'border-black/10 divide-black/10 bg-white'
                }`}>
                  {wristband.transactions.map(tx => (
                    <div key={tx.id} className="p-3 text-xs flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-bold font-sans block">{tx.vendorName}</span>
                        <span className="text-[10px] font-mono opacity-50">
                          {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {tx.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right font-mono">
                        <span className={`font-bold block ${
                          tx.type === 'topup' ? 'text-emerald-400' : isDark ? 'text-white' : 'text-black'
                        }`}>
                          {tx.type === 'topup' ? '+' : '-'} {formatCurrency(tx.amountMinor, wristband.currency)}
                        </span>
                        <span className="text-[10px] opacity-40">
                          Bal: {formatCurrency(tx.balanceAfterMinor, wristband.currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* VIEW B: VENDOR POS TERMINAL MODE */}
          {mode === 'vendor_pos' && (
            <div className="space-y-6">
              
              {/* Vendor Selector */}
              <div className="flex items-center justify-between gap-3 text-xs font-mono">
                <span className="opacity-70">Active Bar / Stand:</span>
                <select
                  value={selectedVendor}
                  onChange={e => setSelectedVendor(e.target.value)}
                  className={`p-2 text-xs font-bold rounded-lg border outline-none cursor-pointer ${
                    isDark ? 'bg-black border-white/20 text-white' : 'bg-white border-black/20 text-black'
                  }`}
                >
                  {SAMPLE_VENDORS.map(v => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Menu Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MENU_ITEMS.map(item => {
                  const qty = cart[item.id] || 0;
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        qty > 0 
                          ? (isDark ? 'bg-white/10 border-amber-400' : 'bg-amber-50 border-amber-500') 
                          : (isDark ? 'bg-black/40 border-white/10' : 'bg-white border-black/10')
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isDark ? 'bg-white/10 text-amber-400' : 'bg-black/5 text-amber-600'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-xs block leading-tight">{item.name}</span>
                          <span className="font-mono text-xs opacity-70">
                            {formatCurrency(item.priceMinor, wristband.currency)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {qty > 0 && (
                          <button
                            onClick={() => handleCartRemove(item.id)}
                            className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs bg-white/10 hover:bg-white/20 cursor-pointer"
                          >
                            -
                          </button>
                        )}
                        {qty > 0 && (
                          <span className="font-mono font-bold text-xs w-4 text-center">{qty}</span>
                        )}
                        <button
                          onClick={() => handleCartAdd(item.id)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer shadow-xs ${
                            isDark ? 'bg-white text-black' : 'bg-black text-white'
                          }`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* POS Cart Summary & Tap CTA */}
              <div className={`p-4 rounded-xl border space-y-3 font-mono ${
                isDark ? 'bg-black/60 border-white/10' : 'bg-neutral-50 border-black/10'
              }`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="opacity-60">Terminal Cart Total:</span>
                  <span className="text-base font-black text-amber-400">
                    {formatCurrency(cartTotalMinor, wristband.currency)}
                  </span>
                </div>

                <button
                  onClick={handleSimulateNfcTap}
                  disabled={cartTotalMinor === 0 || isProcessing}
                  className={`w-full py-4 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all cursor-pointer shadow-xl flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed ${
                    isDark
                      ? 'bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold shadow-emerald-400/20'
                      : 'bg-black hover:bg-neutral-800 text-white'
                  }`}
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Radio className="w-4 h-4 animate-pulse" />
                  )}
                  <span>Tap Wristband to Charge ({formatCurrency(cartTotalMinor, wristband.currency)})</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t flex items-center justify-between text-xs font-mono ${
          isDark ? 'border-white/10 bg-black/60' : 'border-black/10 bg-neutral-50'
        }`}>
          <div className="flex items-center gap-2 opacity-60">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted offline balance signed with HMAC-SHA256 tokens.</span>
          </div>

          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
            }`}
          >
            Close Terminal
          </button>
        </div>

      </div>
    </div>
  );
};
