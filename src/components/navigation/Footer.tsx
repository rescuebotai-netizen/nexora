import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { AuthUser } from '../../types';

interface FooterProps {
  theme?: 'light' | 'dark';
  onNavigateLegal?: (page: 'terms' | 'privacy' | 'security') => void;
  onNavigatePortal?: (view: 'marketplace' | 'organizer' | 'scanner' | 'admin') => void;
  currentUser?: AuthUser | null;
  onOpenWallet?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  theme = 'dark',
  onNavigateLegal,
  onNavigatePortal,
  currentUser,
  onOpenWallet
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const isDark = theme === 'dark';

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className={`pt-16 pb-12 mt-20 transition-colors w-full ${
      isDark
        ? 'bg-black text-white/70'
        : 'bg-white text-black/70'
    }`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-column layout expanded corner to corner */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 ${
          isDark ? 'border-b border-white/10' : 'border-b border-black/10'
        }`}>
          
          {/* Brand & Mission column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-black tracking-tight ${
                isDark ? 'text-white' : 'text-black'
              }`}>
                NEXORA
              </span>
            </div>
            <p className="text-sm max-w-xl leading-relaxed opacity-80">
              Every Event. Every Connection. The event commerce gateway connecting African cultural, tech, business, and entertainment experiences to the continent and the world.
            </p>
            <div className="pt-2 text-xs font-mono opacity-60">
              <span>PCI-DSS Compliant · Double Entry Ledger Architecture</span>
            </div>
          </div>

          {/* Regional Hubs */}
          <div className="space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider font-mono ${
              isDark ? 'text-white' : 'text-black'
            }`}>
              Regional Nodes
            </h4>
            <ul className="space-y-2 text-sm">
              <li><span className={`transition-colors cursor-pointer ${isDark ? 'hover:text-white' : 'hover:text-black'}`}>Cape Town & Joburg</span></li>
              <li><span className={`transition-colors cursor-pointer ${isDark ? 'hover:text-white' : 'hover:text-black'}`}>Nairobi & Mombasa</span></li>
              <li><span className={`transition-colors cursor-pointer ${isDark ? 'hover:text-white' : 'hover:text-black'}`}>Lagos & Abuja</span></li>
              <li><span className={`transition-colors cursor-pointer ${isDark ? 'hover:text-white' : 'hover:text-black'}`}>Accra & Kumasi</span></li>
              <li><span className={`transition-colors cursor-pointer ${isDark ? 'hover:text-white' : 'hover:text-black'}`}>Kigali Hub</span></li>
            </ul>
          </div>

          {/* Platform Products (Role-Filtered) */}
          <div className="space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider font-mono ${
              isDark ? 'text-white' : 'text-black'
            }`}>
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              {/* Discover Marketplace: Available to all */}
              <li>
                <button 
                  onClick={() => onNavigatePortal && onNavigatePortal('marketplace')}
                  className={`transition-colors cursor-pointer text-left ${isDark ? 'hover:text-white' : 'hover:text-black'}`}
                >
                  Discover Marketplace
                </button>
              </li>

              {/* My Tickets: Available to all logged-in users (Buyer, Organizer, Admin) */}
              {currentUser && onOpenWallet && (
                <li>
                  <button 
                    onClick={onOpenWallet}
                    className={`transition-colors cursor-pointer text-left ${isDark ? 'hover:text-white' : 'hover:text-black'}`}
                  >
                    My Tickets
                  </button>
                </li>
              )}

              {/* Organizer Portal: Visible to Organizers & Admins (NEVER to Buyer) */}
              {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                <li>
                  <button 
                    onClick={() => onNavigatePortal && onNavigatePortal('organizer')}
                    className={`transition-colors cursor-pointer text-left ${isDark ? 'hover:text-white' : 'hover:text-black'}`}
                  >
                    Organizer Portal
                  </button>
                </li>
              )}

              {/* Guest Ticket Scanner: Visible only to Admins (NEVER to Buyer) */}
              {currentUser?.role === 'admin' && (
                <li>
                  <button 
                    onClick={() => onNavigatePortal && onNavigatePortal('scanner')}
                    className={`transition-colors cursor-pointer text-left ${isDark ? 'hover:text-white' : 'hover:text-black'}`}
                  >
                    Guest Ticket Scanner
                  </button>
                </li>
              )}

              {/* Security Architecture: Available to all */}
              <li>
                <button 
                  onClick={() => onNavigateLegal && onNavigateLegal('security')}
                  className={`transition-colors cursor-pointer text-left ${isDark ? 'hover:text-white' : 'hover:text-black'}`}
                >
                  Security Architecture
                </button>
              </li>

              {/* Super Admin Platform: ONLY for Admin */}
              {currentUser?.role === 'admin' && (
                <li className="pt-1">
                  <button 
                    onClick={() => onNavigatePortal && onNavigatePortal('admin')}
                    className="transition-colors cursor-pointer text-left flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Super Admin Platform</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Newsletter / Updates */}
          <div className="space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider font-mono ${
              isDark ? 'text-white' : 'text-black'
            }`}>
              Event Intelligence
            </h4>
            <p className="text-xs opacity-75">
              Curated festival drops, venture summits, and exclusive ticket releases.
            </p>
            {subscribed ? (
              <div className="text-xs font-mono font-bold pt-1 text-emerald-500">
                <span>Subscribed to Nexora Dispatch.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    required
                    className={`w-full px-3 py-2 text-xs rounded-l-lg focus:outline-none ${
                      isDark 
                        ? 'bg-[#121214] text-white placeholder-white/40' 
                        : 'bg-neutral-100 text-black placeholder-black/40'
                    }`}
                  />
                  <button
                    type="submit"
                    className={`px-3 py-2 font-bold text-xs rounded-r-lg transition-colors cursor-pointer shrink-0 ${
                      isDark
                        ? 'bg-white text-black hover:bg-neutral-200'
                        : 'bg-black text-white hover:bg-neutral-800'
                    }`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* Bottom copyright and legal page links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs opacity-60 font-mono gap-4 w-full">
          <div>
            © {new Date().getFullYear()} NEXORA. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <button
              onClick={() => onNavigatePortal && onNavigatePortal('admin')}
              className={`cursor-pointer transition-all flex items-center gap-1.5 px-3 py-1 rounded-md border font-mono text-[11px] font-semibold ${
                isDark 
                  ? 'border-amber-500/30 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 hover:border-amber-500/60 shadow-xs' 
                  : 'border-amber-600/30 text-amber-800 bg-amber-100/60 hover:bg-amber-100 hover:border-amber-600/60 shadow-xs'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Super Admin Control</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            </button>
            <button
              onClick={() => onNavigateLegal && onNavigateLegal('terms')}
              className={`cursor-pointer transition-colors ${
                isDark ? 'hover:text-white' : 'hover:text-black'
              }`}
            >
              Terms of Service
            </button>
            <button
              onClick={() => onNavigateLegal && onNavigateLegal('privacy')}
              className={`cursor-pointer transition-colors ${
                isDark ? 'hover:text-white' : 'hover:text-black'
              }`}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigateLegal && onNavigateLegal('security')}
              className={`cursor-pointer transition-colors ${
                isDark ? 'hover:text-white' : 'hover:text-black'
              }`}
            >
              Security Architecture
            </button>
          </div>
        </div>

      </div>

      {/* Massive NEXORA wordmark below all text expanding corner to corner */}
      <div className="w-full overflow-hidden select-none pointer-events-none mt-8 pt-4">
        <div className={`w-full text-center leading-none font-black tracking-tighter uppercase whitespace-nowrap text-[20vw] sm:text-[21vw] md:text-[22vw] lg:text-[23vw] transition-colors ${
          isDark 
            ? 'text-white/20 hover:text-white/30' 
            : 'text-black/15 hover:text-black/25'
        }`}>
          NEXORA
        </div>
      </div>
    </footer>
  );
};
