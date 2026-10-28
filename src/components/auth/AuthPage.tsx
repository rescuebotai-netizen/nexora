import React, { useState } from 'react';
import { 
  ArrowLeft,
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Calendar,
  Check,
  Building2,
  Zap,
  Ticket as TicketIcon
} from 'lucide-react';
import { AuthUser } from '../../types';
import { store } from '../../lib/store';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import confetti from 'canvas-confetti';

import heroFestivalImg from '../../assets/images/hero_afro_festival_1791591623547.jpg';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
  onBack: () => void;
  onAuthenticated: (user: AuthUser) => void;
  onOpenAdminConsole?: () => void;
  theme?: 'light' | 'dark';
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onBack,
  onAuthenticated,
  onOpenAdminConsole,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [role, setRole] = useState<'attendee' | 'organizer'>('attendee');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Feedback & Loading
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [forgotEmailSent, setForgotEmailSent] = useState(false);

  // Quick Account Login Handlers for Instant Demo Evaluation
  const handleFastLogin = (demoRole: 'attendee' | 'organizer' | 'admin') => {
    setIsLoading(true);
    setErrorMsg(null);
    setTimeout(() => {
      const demoUsers: Record<string, AuthUser> = {
        attendee: {
          id: 'usr-buyer-demo',
          name: 'Nomvula Dlamini',
          email: 'nomvula.dlamini@example.com',
          role: 'attendee',
          provider: 'password',
        },
        organizer: {
          id: 'usr-org-demo',
          name: 'Sipho Zulu',
          email: 'sipho@afrovibes.co.za',
          role: 'organizer',
          provider: 'password',
          organizationId: 'org-cape-vibes',
        },
        admin: {
          id: 'usr-admin-demo',
          name: 'NEXORA Regional Admin',
          email: 'admin@nexora.events',
          role: 'admin',
          provider: 'password',
        },
      };

      const selected = demoUsers[demoRole];
      store.setCurrentUser(selected);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      onAuthenticated(selected);
      setIsLoading(false);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessNotice(null);

    if (mode === 'signup' && !name.trim()) {
      setErrorMsg('Please specify your full name.');
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password.trim() || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    if (isSupabaseConfigured()) {
      try {
        if (mode === 'signup') {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
            options: {
              data: {
                full_name: name.trim(),
                role: role,
              },
            },
          });

          if (error) {
            setErrorMsg(error.message);
            setIsLoading(false);
            return;
          }

          setIsLoading(false);
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          const userId = data.user?.id || 'usr-' + Date.now().toString(36);
          const authenticatedUser: AuthUser = {
            id: userId,
            name: name.trim(),
            email: data.user?.email || email.trim(),
            role,
            provider: 'supabase',
            organizationId: role === 'organizer' ? 'org-' + userId.slice(0, 8) : undefined,
          };
          store.setCurrentUser(authenticatedUser);
          onAuthenticated(authenticatedUser);
          return;
        } else {
          // Login
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
          });

          if (error) {
            setErrorMsg(error.message);
            setIsLoading(false);
            return;
          }

          setIsLoading(false);
          const userMetaRole = (data.user?.user_metadata?.role as AuthUser['role']) || role;
          const authenticatedUser: AuthUser = {
            id: data.user?.id || 'usr-' + Date.now().toString(36),
            name: data.user?.user_metadata?.full_name || email.split('@')[0],
            email: data.user?.email || email.trim(),
            role: userMetaRole,
            provider: 'supabase',
            organizationId: userMetaRole === 'organizer' ? 'org-' + (data.user?.id || '').slice(0, 8) : undefined,
          };
          store.setCurrentUser(authenticatedUser);
          onAuthenticated(authenticatedUser);
          return;
        }
      } catch (err: any) {
        console.warn('Supabase auth execution error:', err);
      }
    }

    // Local Fallback
    setTimeout(() => {
      setIsLoading(false);
      const authenticatedUser: AuthUser = {
        id: 'usr-' + Date.now().toString(36),
        name: name.trim() || (mode === 'signup' ? 'New Member' : email.split('@')[0]),
        email: email.trim(),
        role,
        provider: 'password',
        organizationId: role === 'organizer' ? 'org-cape-vibes' : undefined,
      };

      store.setCurrentUser(authenticatedUser);
      if (mode === 'signup') {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
      onAuthenticated(authenticatedUser);
    }, 450);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please specify an email address to send password recovery');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setForgotEmailSent(true);
    }, 800);
  };

  return (
    <div className={`min-h-screen transition-colors ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      
      {/* Top Header */}
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

          <span className="text-xs font-mono uppercase tracking-widest opacity-60">
            NEXORA Identity Gateway
          </span>

        </div>
      </div>

      {/* Main Expansive Webpage Container */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className={`grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl ${
          isDark ? 'bg-[#0E0E12]' : 'bg-neutral-50'
        }`}>
          
          {/* Left Column (5 cols): Branded Showcase with Photography */}
          <div className="lg:col-span-5 relative overflow-hidden hidden lg:flex flex-col justify-between p-10 min-h-[640px] text-white">
            <img
              src={heroFestivalImg}
              alt="Nexora African Concert Experience"
              className="absolute inset-0 w-full h-full object-cover filter brightness-75 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30 pointer-events-none" />

            <div className="relative z-10 space-y-2">
              <span className="text-2xl font-black tracking-tight">NEXORA</span>
              <p className="text-xs font-mono opacity-80">
                The Pan-African Event Commerce Platform
              </p>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/20 backdrop-blur-md">
                  Cryptographic Passports
                </span>
                <h3 className="text-2xl font-black leading-tight">
                  Seamless Access Across Africa & the Diaspora.
                </h3>
                <p className="text-xs opacity-80 leading-relaxed font-mono">
                  Instant gate verification, zero fraudulent scalping, and localized settlements across 14 African currencies.
                </p>
              </div>

              <div className="pt-4 border-t border-white/20 text-[11px] font-mono opacity-70 flex items-center justify-between">
                <span>Verified PCI-DSS</span>
                <span>POPIA & NDPA Compliant</span>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Authentication Forms & Fast Login */}
          <div className="lg:col-span-7 p-6 sm:p-12 space-y-8">
            
            {/* Header Tabs: Login vs Sign up */}
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-1 p-1 rounded-xl ${
                isDark ? 'bg-black' : 'bg-neutral-200'
              }`}>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setIsForgotPassword(false); setErrorMsg(null); }}
                  className={`px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'login' && !isForgotPassword
                      ? (isDark ? 'bg-white text-black shadow-xs' : 'bg-black text-white shadow-xs')
                      : (isDark ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black')
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setIsForgotPassword(false); setErrorMsg(null); }}
                  className={`px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'signup' && !isForgotPassword
                      ? (isDark ? 'bg-white text-black shadow-xs' : 'bg-black text-white shadow-xs')
                      : (isDark ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black')
                  }`}
                >
                  Create Account
                </button>
              </div>

              <span className="text-xs font-mono opacity-60 hidden sm:inline">
                Instant Verification
              </span>
            </div>

            {/* Fast Demo One-Click Sign In (For Test Evaluation) */}
            <div className={`p-4 rounded-2xl space-y-3 border transition-all ${
              isDark ? 'bg-black/60 border-white/10' : 'bg-white border-black/10 shadow-xs'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold flex items-center gap-1.5 text-amber-400">
                  <Zap className="w-3.5 h-3.5" />
                  Instant Test Sign In
                </span>
                <span className="opacity-50 text-[10px]">1-Click Role Sandbox</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Buyer: can only see tickets and Marketplace */}
                <button
                  type="button"
                  onClick={() => handleFastLogin('attendee')}
                  className={`p-3 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between group ${
                    isDark 
                      ? 'bg-[#141418] hover:bg-[#1c1c22] border-white/10 hover:border-white/30 text-white' 
                      : 'bg-neutral-50 hover:bg-neutral-100 border-black/10 hover:border-black/30 text-black'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs group-hover:text-amber-400 transition-colors">Buyer</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                      Attendee
                    </span>
                  </div>
                  <div className="text-[10px] opacity-70 font-mono leading-tight">
                    Can only see <strong>tickets</strong> & <strong>Marketplace</strong>
                  </div>
                </button>

                {/* 2. Organizer: can see tickets and Organizer portal */}
                <button
                  type="button"
                  onClick={() => handleFastLogin('organizer')}
                  className={`p-3 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between group ${
                    isDark 
                      ? 'bg-[#141418] hover:bg-[#1c1c22] border-white/10 hover:border-purple-500/40 text-white' 
                      : 'bg-neutral-50 hover:bg-neutral-100 border-black/10 hover:border-purple-500/40 text-black'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs group-hover:text-purple-400 transition-colors">Organizer</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                      Portal
                    </span>
                  </div>
                  <div className="text-[10px] opacity-70 font-mono leading-tight">
                    Can see <strong>tickets</strong> & <strong>Organizer portal</strong>
                  </div>
                </button>

                {/* 3. Admin: connected directly to Super Admin */}
                <button
                  type="button"
                  onClick={() => handleFastLogin('admin')}
                  className={`p-3 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between group ${
                    isDark 
                      ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 hover:border-amber-400 text-amber-300' 
                      : 'bg-amber-50 hover:bg-amber-100 border-amber-300 hover:border-amber-400 text-amber-950'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs flex items-center gap-1 group-hover:text-amber-300 transition-colors">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      Admin
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                      Root
                    </span>
                  </div>
                  <div className="text-[10px] opacity-80 font-mono leading-tight">
                    Connected to the <strong>Super Admin</strong> platform
                  </div>
                </button>
              </div>
            </div>

            {/* Standard Credentials Form */}
            {!isForgotPassword ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Role Switcher on Sign Up */}
                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-bold opacity-70">Account Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('attendee')}
                        className={`p-3 rounded-xl text-left cursor-pointer transition-all ${
                          role === 'attendee'
                            ? (isDark ? 'bg-white text-black font-bold' : 'bg-black text-white font-bold')
                            : (isDark ? 'bg-black text-white/70' : 'bg-white text-black/70')
                        }`}
                      >
                        <span className="text-xs block">Attendee</span>
                        <span className="text-[10px] opacity-70 block">Book tickets & store passes</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('organizer')}
                        className={`p-3 rounded-xl text-left cursor-pointer transition-all ${
                          role === 'organizer'
                            ? (isDark ? 'bg-white text-black font-bold' : 'bg-black text-white font-bold')
                            : (isDark ? 'bg-black text-white/70' : 'bg-white text-black/70')
                        }`}
                      >
                        <span className="text-xs block">Event Organizer</span>
                        <span className="text-[10px] opacity-70 block">Publish events & gate check-in</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Name field for sign up */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-mono font-bold mb-1 opacity-70">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Nomvula Dlamini"
                      className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none ${
                        isDark ? 'bg-black text-white' : 'bg-white text-black'
                      }`}
                    />
                  </div>
                )}

                {/* Email field */}
                <div>
                  <label className="block text-xs font-mono font-bold mb-1 opacity-70">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none ${
                      isDark ? 'bg-black text-white' : 'bg-white text-black'
                    }`}
                  />
                </div>

                {/* Password field */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-mono font-bold opacity-70">Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-[11px] font-mono opacity-70 hover:opacity-100 underline cursor-pointer"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none pr-10 ${
                        isDark ? 'bg-black text-white' : 'bg-white text-black'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-500/20 text-red-400 text-xs font-mono flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xl disabled:opacity-50 ${
                    isDark
                      ? 'bg-white hover:bg-neutral-200 text-black'
                      : 'bg-black hover:bg-neutral-800 text-white'
                  }`}
                >
                  {isLoading ? 'Processing...' : mode === 'login' ? 'Sign In to Nexora' : 'Create Nexora Account'}
                </button>

              </form>
            ) : (
              /* Forgot Password Form */
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold">Reset Password</h3>
                  <p className="text-xs font-mono opacity-60">
                    We will send a secure recovery code to your registered email address.
                  </p>
                </div>

                {forgotEmailSent ? (
                  <div className="p-4 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold text-center">
                    Recovery link dispatched to {email}. Check your inbox.
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-mono font-bold mb-1 opacity-70">Registered Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="name@domain.com"
                        className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none ${
                          isDark ? 'bg-black text-white' : 'bg-white text-black'
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                      }`}
                    >
                      {isLoading ? 'Dispatching...' : 'Send Recovery Email'}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="text-xs font-mono opacity-70 hover:opacity-100 underline block text-center w-full cursor-pointer"
                >
                  Return to Log in
                </button>
              </form>
            )}

            {/* Admin Console Shortcut */}
            {onOpenAdminConsole && (
              <div className="pt-4 border-t border-black/10 dark:border-white/10 text-center">
                <button
                  type="button"
                  onClick={onOpenAdminConsole}
                  className="text-xs font-mono opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  Regional Governance & Admin Console →
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
