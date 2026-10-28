import React, { useState } from 'react';
import { ChevronDown, LogOut, Sun, Moon, ShieldCheck } from 'lucide-react';
import { AuthUser } from '../../types';

interface NavbarProps {
  activeView: string;
  setActiveView: (view: any) => void;
  onOpenWallet: () => void;
  ticketCount: number;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  onOpenWallet,
  ticketCount,
  onOpenAuth,
  currentUser,
  onLogout,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-40 transition-colors backdrop-blur-md bg-transparent ${
      isDark ? 'bg-black/30 text-white border-b border-white/10' : 'bg-white/30 text-black border-b border-black/10'
    }`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Left Side: Brand Wordmark (Only NEXORA, no 'Events') */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveView('marketplace')}
            className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
          >
            <span className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center ${
              isDark ? 'text-white' : 'text-black'
            }`}>
              NEXORA
            </span>
          </button>
        </div>

        {/* Center: Navigation Links (Buyer: only Marketplace & Tickets; Organizer: Marketplace & Organizer; Admin: Super Admin) */}
        <nav className={`hidden lg:flex items-center gap-8 text-sm font-medium ${
          isDark ? 'text-white/70' : 'text-black/70'
        }`}>
          {/* Marketplace Discover link */}
          <button
            onClick={() => setActiveView('marketplace')}
            className={`cursor-pointer transition-colors whitespace-nowrap ${
              activeView === 'marketplace' 
                ? (isDark ? 'text-white font-bold' : 'text-black font-bold') 
                : (isDark ? 'hover:text-white' : 'hover:text-black')
            }`}
          >
            Discover
          </button>

          {/* Organizer link: only for organizer and admin */}
          {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
            <button
              onClick={() => setActiveView('organizer')}
              className={`cursor-pointer transition-colors whitespace-nowrap ${
                activeView === 'organizer' 
                  ? (isDark ? 'text-white font-bold' : 'text-black font-bold') 
                  : (isDark ? 'hover:text-white' : 'hover:text-black')
              }`}
            >
              Organizer Portal
            </button>
          )}

          {/* Admin link: directly connected to Super Admin */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setActiveView('admin')}
              className={`cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeView === 'admin' 
                  ? 'text-amber-400 font-bold' 
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Super Admin Platform</span>
            </button>
          )}
        </nav>

        {/* Right Side: Theme Toggle + Auth Links (Sign up / Log in on the RIGHT) + Authenticated Tickets & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Theme Toggle Button (Icon only) */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`flex items-center justify-center p-2 rounded-lg transition-all cursor-pointer shadow-xs ${
                isDark
                  ? 'bg-[#121214] hover:bg-[#1a1a1f] text-white'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-black'
              }`}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-800" />
              )}
            </button>
          )}

          {/* Condition: If user is logged in / registered, show Role-specific buttons, My Tickets & Profile */}
          {currentUser ? (
            <>
              {/* Admin Quick Action Button: Direct link to Super Admin Platform */}
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setActiveView('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer shadow-xs ${
                    activeView === 'admin'
                      ? 'bg-amber-500 text-black shadow-amber-500/20'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                  }`}
                  title="Connected to Super Admin Platform"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Super Admin</span>
                </button>
              )}

              {/* Organizer Quick Action Button */}
              {currentUser.role === 'organizer' && (
                <button
                  onClick={() => setActiveView('organizer')}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-xs border ${
                    activeView === 'organizer'
                      ? (isDark ? 'bg-white text-black font-bold' : 'bg-black text-white font-bold')
                      : (isDark ? 'bg-[#121214] hover:bg-[#1f1f24] text-white border-white/10' : 'bg-neutral-100 hover:bg-neutral-200 text-black border-black/10')
                  }`}
                  title="Organizer Portal"
                >
                  <span>Organizer Portal</span>
                </button>
              )}

              {/* Ticket Wallet Button - Visible to all logged-in roles (Buyer, Organizer, Admin) */}
              <button
                onClick={onOpenWallet}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-xs relative ${
                  isDark
                    ? 'bg-[#121214] hover:bg-[#1f1f24] text-white'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-black'
                }`}
                title="My Tickets"
              >
                <span className="whitespace-nowrap">My Tickets</span>
                {ticketCount > 0 && (
                  <span className={`inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full min-w-4 ${
                    isDark ? 'bg-white text-black' : 'bg-black text-white'
                  }`}>
                    {ticketCount}
                  </span>
                )}
              </button>

              {/* Profile Toggle Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-[#121214] text-white hover:bg-[#1f1f24]'
                      : 'bg-neutral-100 text-black hover:bg-neutral-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    currentUser.role === 'admin'
                      ? 'bg-amber-500 text-black font-mono'
                      : isDark ? 'bg-white text-black' : 'bg-black text-white'
                  }`}>
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[90px] sm:max-w-[120px] truncate hidden sm:inline">{currentUser.name}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {showUserDropdown && (
                  <div className={`absolute top-full right-0 mt-2 w-56 rounded-xl shadow-2xl py-2 z-50 border ${
                    isDark
                      ? 'bg-[#0E121B] text-white border-white/10'
                      : 'bg-white text-black border-black/10'
                  }`}>
                    <div className={`px-4 py-2 text-xs mb-1 border-b ${
                      isDark ? 'text-white/60 border-white/10' : 'text-black/60 border-black/10'
                    }`}>
                      <strong className={`block truncate ${isDark ? 'text-white' : 'text-black'}`}>{currentUser.name}</strong>
                      <span className="text-[10px] capitalize font-mono opacity-80 flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          currentUser.role === 'admin' ? 'bg-amber-400' : currentUser.role === 'organizer' ? 'bg-purple-400' : 'bg-blue-400'
                        }`} />
                        {currentUser.role === 'attendee' ? 'Buyer (Attendee)' : `${currentUser.role} Account`}
                      </span>
                    </div>

                    {/* Admin only: Super Admin Platform */}
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => { setActiveView('admin'); setShowUserDropdown(false); }}
                        className={`w-full text-left px-4 py-2 text-xs font-bold cursor-pointer flex items-center justify-between text-amber-400 ${
                          isDark ? 'hover:bg-neutral-900' : 'hover:bg-neutral-100'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Super Admin</span>
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">Root</span>
                      </button>
                    )}

                    {/* Organizer & Admin: Organizer Portal */}
                    {(currentUser.role === 'organizer' || currentUser.role === 'admin') && (
                      <button
                        onClick={() => { setActiveView('organizer'); setShowUserDropdown(false); }}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold cursor-pointer flex items-center justify-between ${
                          isDark ? 'text-white hover:bg-neutral-900' : 'text-black hover:bg-neutral-100'
                        }`}
                      >
                        <span>Organizer Portal</span>
                        <span className="text-[10px] font-mono opacity-60">Manage</span>
                      </button>
                    )}

                    {/* My Tickets - Accessible to all (Buyer, Organizer, Admin) */}
                    <button
                      onClick={() => { onOpenWallet(); setShowUserDropdown(false); }}
                      className={`w-full text-left px-4 py-2 text-xs cursor-pointer flex items-center justify-between ${
                        isDark ? 'text-white hover:bg-neutral-900' : 'text-black hover:bg-neutral-100'
                      }`}
                    >
                      <span>My Tickets</span>
                      {ticketCount > 0 && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                          isDark ? 'bg-white text-black font-bold' : 'bg-black text-white font-bold'
                        }`}>
                          {ticketCount}
                        </span>
                      )}
                    </button>

                    {/* Marketplace Discover link */}
                    <button
                      onClick={() => { setActiveView('marketplace'); setShowUserDropdown(false); }}
                      className={`w-full text-left px-4 py-2 text-xs cursor-pointer flex items-center justify-between ${
                        isDark ? 'text-white hover:bg-neutral-900' : 'text-black hover:bg-neutral-100'
                      }`}
                    >
                      <span>Discover Marketplace</span>
                    </button>

                    <div className={`my-1 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`} />

                    <button
                      onClick={() => {
                        if (onLogout) onLogout();
                        setShowUserDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs text-red-500 cursor-pointer flex items-center gap-1.5 ${
                        isDark ? 'hover:bg-neutral-900' : 'hover:bg-neutral-100'
                      }`}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Condition: If NOT logged in, show Sign up and Log in on the RIGHT */
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth && onOpenAuth('login')}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap rounded-lg ${
                  isDark
                    ? 'text-white hover:bg-white/10'
                    : 'text-black hover:bg-black/5'
                }`}
              >
                Log in
              </button>
              <button
                onClick={() => onOpenAuth && onOpenAuth('signup')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                  isDark
                    ? 'bg-white text-black hover:bg-neutral-200'
                    : 'bg-black text-white hover:bg-neutral-800'
                }`}
              >
                Sign up
              </button>
            </div>
          )}

          {/* Mobile view dropdown button */}
          <div className="lg:hidden relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              onBlur={() => setTimeout(() => setShowRoleDropdown(false), 200)}
              className={`p-2 rounded-lg cursor-pointer ${
                isDark
                  ? 'bg-[#121214] text-white'
                  : 'bg-neutral-100 text-black'
              }`}
              title="Toggle Menu"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            {showRoleDropdown && (
              <div className={`absolute top-full right-0 mt-2 w-52 rounded-xl shadow-2xl py-2 z-50 border ${
                isDark
                  ? 'bg-[#0E121B] text-white border-white/10'
                  : 'bg-white text-black border-black/10'
              }`}>
                <button
                  onClick={() => { setActiveView('marketplace'); setShowRoleDropdown(false); }}
                  className={`w-full text-left px-4 py-2 text-xs ${
                    isDark ? 'text-white hover:bg-neutral-900' : 'text-black hover:bg-neutral-100'
                  }`}
                >
                  Discover Marketplace
                </button>

                {currentUser && (
                  <button
                    onClick={() => { onOpenWallet(); setShowRoleDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between ${
                      isDark ? 'text-white hover:bg-neutral-900' : 'text-black hover:bg-neutral-100'
                    }`}
                  >
                    <span>My Tickets</span>
                    {ticketCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-black">
                        {ticketCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Organizer Portal: visible to Organizer & Admin */}
                {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                  <button
                    onClick={() => { setActiveView('organizer'); setShowRoleDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-xs ${
                      isDark ? 'text-white hover:bg-neutral-900' : 'text-black hover:bg-neutral-100'
                    }`}
                  >
                    Organizer Portal
                  </button>
                )}

                {/* Admin: Super Admin Platform */}
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => { setActiveView('admin'); setShowRoleDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between text-amber-400 ${
                      isDark ? 'hover:bg-neutral-900' : 'hover:bg-neutral-100'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Super Admin</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">Root</span>
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
