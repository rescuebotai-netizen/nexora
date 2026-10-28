import React, { useState } from 'react';
import { 
  X, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  KeyRound, 
  Ticket, 
  Calendar,
  Check,
  Building2,
  RefreshCw
} from 'lucide-react';
import { AuthUser } from '../../types';
import { store } from '../../lib/store';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import confetti from 'canvas-confetti';

import heroFestivalImg from '../../assets/images/hero_afro_festival_1791591623547.jpg';
import techSummitImg from '../../assets/images/event_tech_summit_1791591635169.jpg';
import culinaryWineImg from '../../assets/images/event_culinary_wine_1791591643928.jpg';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onAuthenticated?: (user: AuthUser) => void;
  onOpenAdminConsole?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onAuthenticated,
  onOpenAdminConsole,
}) => {
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

  // Active showcase background image
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const showcaseImages = [
    {
      img: heroFestivalImg,
      tag: 'Cape Town Festival',
      quote: '“Unforgettable atmosphere and effortless digital entry.”',
      author: 'Nomvula D., Attendee',
    },
    {
      img: techSummitImg,
      tag: 'Nairobi Innovation Summit',
      quote: '“Seamless ticketing and VIP check-in for 3,500 delegates.”',
      author: 'David K., Event Director',
    },
    {
      img: culinaryWineImg,
      tag: 'Lagos Gastronomy Soirée',
      quote: '“Instant payment rails with zero checkout friction.”',
      author: 'Amina M., Curator',
    },
  ];

  if (!isOpen) return null;

  // Sound feedback helper
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio autoplay fallback
    }
  };

  // Password Strength Calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-gray-200' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  // Email format validation check
  const isEmailValid = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  // Handle Submit with Supabase Authentication
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !isEmailValid(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!isMagicLink && mode === 'login' && !password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    if (!isMagicLink && mode === 'signup' && password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    if (isForgotPassword) {
      if (isSupabaseConfigured()) {
        try {
          await supabase.auth.resetPasswordForEmail(email.trim());
        } catch {
          // ignore error for reset email
        }
      }
      setIsLoading(false);
      setForgotEmailSent(true);
      return;
    }

    if (isMagicLink) {
      if (isSupabaseConfigured()) {
        try {
          const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
          if (error) {
            setErrorMsg(error.message);
            setIsLoading(false);
            return;
          }
        } catch (err: any) {
          console.warn('Magic link error:', err);
        }
      }
      setIsLoading(false);
      setSuccessNotice(`Magic verification link dispatched to ${email}!`);
      setTimeout(() => {
        completeAuth({
          id: 'usr-' + Date.now(),
          name: email.split('@')[0],
          email,
          role,
          provider: 'magic_link',
        });
      }, 1200);
      return;
    }

    // Live Supabase Authentication
    if (isSupabaseConfigured()) {
      try {
        if (mode === 'signup') {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
            options: {
              data: {
                full_name: name.trim() || email.split('@')[0],
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
          playChime();
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#F6A623', '#D7B779', '#101522'],
          });

          const userId = data.user?.id || 'usr-' + Date.now();
          const authenticatedUser: AuthUser = {
            id: userId,
            name: name.trim() || email.split('@')[0],
            email: data.user?.email || email.trim(),
            role,
            provider: 'supabase',
            organizationId: role === 'organizer' ? 'org-' + userId.slice(0, 8) : undefined,
          };
          completeAuth(authenticatedUser);
          return;
        } else {
          // Mode: login
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
          playChime();
          const userMetaRole = (data.user?.user_metadata?.role as AuthUser['role']) || role;
          const authenticatedUser: AuthUser = {
            id: data.user?.id || 'usr-' + Date.now(),
            name: data.user?.user_metadata?.full_name || email.split('@')[0],
            email: data.user?.email || email.trim(),
            role: userMetaRole,
            provider: 'supabase',
            organizationId: userMetaRole === 'organizer' ? 'org-' + (data.user?.id || '').slice(0, 8) : undefined,
          };
          completeAuth(authenticatedUser);
          return;
        }
      } catch (err: any) {
        console.warn('Supabase auth execution encountered error:', err);
      }
    }

    // Seamless Local Fallback if Supabase network is unavailable
    setTimeout(() => {
      setIsLoading(false);
      playChime();

      const authenticatedUser: AuthUser = {
        id: 'usr-' + Date.now(),
        name: name.trim() || (mode === 'signup' ? 'New Member' : email.split('@')[0]),
        email,
        role,
        provider: 'password',
        organizationId: role === 'organizer' ? 'org-cape-vibes' : undefined,
      };

      if (mode === 'signup') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#F6A623', '#D7B779', '#101522'],
        });
      }

      completeAuth(authenticatedUser);
    }, 450);
  };

  // Social Auth Handlers
  const handleSocialAuth = (provider: 'google' | 'apple') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      playChime();
      const mockName = provider === 'google' ? 'Google Account User' : 'Apple ID Member';
      const authenticatedUser: AuthUser = {
        id: 'usr-' + provider + '-' + Date.now(),
        name: mockName,
        email: `member@${provider}.com`,
        role,
        provider,
        organizationId: role === 'organizer' ? 'org-cape-vibes' : undefined,
      };
      completeAuth(authenticatedUser);
    }, 700);
  };

  const completeAuth = (user: AuthUser) => {
    store.setCurrentUser(user);
    if (onAuthenticated) {
      onAuthenticated(user);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      
      {/* Split-Screen Container */}
      <div className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col lg:flex-row min-h-[640px] text-[#101522]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-gray-100/80 hover:bg-gray-200 text-[#101522] transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ========================================================= */}
        {/* LEFT COLUMN: CINEMATIC EVENT PHOTOGRAPHY & BRAND IDENTITY */}
        {/* ========================================================= */}
        <div className="relative lg:w-1/2 min-h-[280px] lg:min-h-full bg-[#101522] text-white flex flex-col justify-between p-8 sm:p-12 overflow-hidden">
          
          {/* Background Image Carousel with Overlay */}
          <div className="absolute inset-0">
            <img 
              src={showcaseImages[activeImageIdx].img} 
              alt="Experience Showcase" 
              className="w-full h-full object-cover opacity-60 scale-105 transition-all duration-700 filter brightness-90"
            />
            {/* Cinematic Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#101522] via-[#101522]/60 to-[#101522]/40" />
            <div className="absolute inset-0 bg-radial from-transparent to-[#101522]/70" />
          </div>

          {/* Top Branding Section */}
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white flex items-center">
                NEX<span className="text-[#D7B779]">ORA</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#D7B779] bg-white/10 px-2 py-0.5 rounded border border-white/10">
                Studio
              </span>
            </div>
            <p className="text-xs uppercase tracking-widest text-[#D7B779] font-medium font-mono">
              Discover more.
            </p>
          </div>

          {/* Middle Cinematic Content */}
          <div className="relative z-10 my-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] text-[#D7B779] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D7B779]" />
              <span>EXPERIENCES AWAIT</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Your next great <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F8F7F4] to-[#D7B779]">
                experience starts here.
              </span>
            </h1>

            <p className="text-sm text-gray-300 leading-relaxed max-w-md">
              Discover extraordinary events, connect with your community, and make every moment count.
            </p>

            {/* Testimonial Quote */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 max-w-md space-y-1 mt-6">
              <p className="text-xs italic text-gray-200">
                {showcaseImages[activeImageIdx].quote}
              </p>
              <div className="flex justify-between items-center pt-1 text-[11px] text-[#D7B779]">
                <span className="font-semibold">{showcaseImages[activeImageIdx].author}</span>
                <span className="font-mono text-[10px] opacity-80">{showcaseImages[activeImageIdx].tag}</span>
              </div>
            </div>

            {/* Showcase Dots */}
            <div className="flex gap-1.5 pt-2">
              {showcaseImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    activeImageIdx === idx ? 'w-6 bg-[#D7B779]' : 'w-2 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between text-[11px] text-gray-400 gap-2 font-mono">
            <span>nexora.events</span>
            <span>One account. Every experience.</span>
          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: REFINED AUTHENTICATION FORM                 */}
        {/* ========================================================= */}
        <div className="lg:w-1/2 p-8 sm:p-12 lg:p-14 flex flex-col justify-between bg-white overflow-y-auto">
          
          <div className="space-y-6 max-w-md mx-auto w-full">
            
            {/* Headline Header */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#D7B779] uppercase tracking-wider">
                <Ticket className="w-3.5 h-3.5 text-[#D7B779]" />
                <span>One account. Every experience.</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101522]">
                {isForgotPassword ? (
                  'Reset password'
                ) : mode === 'login' ? (
                  'Welcome back'
                ) : (
                  'Create an account'
                )}
              </h2>

              <p className="text-xs sm:text-sm text-gray-500">
                {isForgotPassword ? (
                  'Enter your email address and we will send a password reset link.'
                ) : mode === 'login' ? (
                  'Sign in to access your tickets and discover what\'s next.'
                ) : (
                  'Join our community to book tickets, save events, and host your own.'
                )}
              </p>
            </div>

            {/* Log in / Sign up Mode Switcher Toggle */}
            {!isForgotPassword && (
              <div className="p-1 bg-[#F8F7F4] rounded-xl border border-gray-200 flex text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setIsMagicLink(false);
                  }}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-[#101522] text-white shadow-sm'
                      : 'text-gray-500 hover:text-[#101522]'
                  }`}
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                    setIsMagicLink(false);
                  }}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-[#101522] text-white shadow-sm'
                      : 'text-gray-500 hover:text-[#101522]'
                  }`}
                >
                  Sign up
                </button>
              </div>
            )}

            {/* Role-Aware Onboarding Selector (on Sign Up) */}
            {!isForgotPassword && mode === 'signup' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">Select your account role</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setRole('attendee')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      role === 'attendee'
                        ? 'border-[#101522] bg-[#F8F7F4] ring-1 ring-[#101522]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Ticket className="w-4 h-4 text-[#D7B779]" />
                      {role === 'attendee' && <Check className="w-3.5 h-3.5 text-[#101522]" />}
                    </div>
                    <strong className="block text-xs text-[#101522]">Attendee</strong>
                    <span className="text-[11px] text-gray-500">Book & save tickets</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('organizer')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      role === 'organizer'
                        ? 'border-[#101522] bg-[#F8F7F4] ring-1 ring-[#101522]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Building2 className="w-4 h-4 text-[#D7B779]" />
                      {role === 'organizer' && <Check className="w-3.5 h-3.5 text-[#101522]" />}
                    </div>
                    <strong className="block text-xs text-[#101522]">Event Organizer</strong>
                    <span className="text-[11px] text-gray-500">Host, sell & manage</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error & Success Messages */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* Main Form */}
            {forgotEmailSent ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-emerald-900">Check your inbox</h4>
                <p className="text-xs text-emerald-700">
                  We have dispatched password recovery instructions to <strong>{email}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setForgotEmailSent(false);
                  }}
                  className="px-4 py-2 bg-[#101522] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Back to Log in
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                
                {/* Name (Sign up only) */}
                {mode === 'signup' && !isForgotPassword && (
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Tendai Chiwenga"
                        className="w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#101522]/10 focus:border-[#101522] transition-all text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#101522]/10 focus:border-[#101522] transition-all text-xs"
                    />
                    {email && isEmailValid(email) && (
                      <Check className="w-4 h-4 text-emerald-600 absolute right-3.5 top-3" />
                    )}
                  </div>
                </div>

                {/* Password (if not passwordless) */}
                {!isForgotPassword && !isMagicLink && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-bold text-gray-700">Password</label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setIsForgotPassword(true)}
                          className="text-[11px] text-[#D7B779] hover:underline font-bold cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#101522]/10 focus:border-[#101522] transition-all text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-gray-400 hover:text-gray-600 absolute right-2.5 top-2.5 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator during registration */}
                    {mode === 'signup' && password && (
                      <div className="mt-2 space-y-1 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] text-gray-500">
                          <span>Password strength: <strong className="text-gray-700">{strength.label}</strong></span>
                          <span>Min 6 characters</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 h-1">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`h-1 rounded-full transition-all ${
                                step <= strength.score ? strength.color : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Passwordless / Magic link toggle */}
                {!isForgotPassword && mode === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setIsMagicLink(!isMagicLink)}
                      className="text-[11px] text-gray-500 hover:text-[#101522] underline cursor-pointer"
                    >
                      {isMagicLink ? '← Use email & password instead' : 'Send passwordless login link instead'}
                    </button>
                  </div>
                )}

                {/* Primary CTA Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-[#101522] hover:bg-[#1a2236] text-white font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#D7B779]" />
                  ) : isForgotPassword ? (
                    'Send reset instructions'
                  ) : isMagicLink ? (
                    'Send magic link'
                  ) : mode === 'login' ? (
                    'Log in'
                  ) : (
                    'Create account'
                  )}
                </button>

                {isForgotPassword && (
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="text-xs text-gray-500 hover:underline cursor-pointer"
                    >
                      ← Back to log in
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* Social Authentication */}
            {!isForgotPassword && (
              <div className="space-y-4 pt-1">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-gray-200 w-full" />
                  <span className="bg-white px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                    OR CONTINUE WITH
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Google Button */}
                  <button
                    type="button"
                    onClick={() => handleSocialAuth('google')}
                    disabled={isLoading}
                    className="py-2.5 px-4 bg-white hover:bg-gray-50 text-[#101522] font-semibold text-xs rounded-xl border border-gray-200 transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>

                  {/* Apple Button */}
                  <button
                    type="button"
                    onClick={() => handleSocialAuth('apple')}
                    disabled={isLoading}
                    className="py-2.5 px-4 bg-white hover:bg-gray-50 text-[#101522] font-semibold text-xs rounded-xl border border-gray-200 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.85-11.71-14.44-6.42-10.23-11.25-21.68-14.48-34.34-3.23-12.67-4.85-24.32-4.85-34.96 0-14.94 3.63-27.18 10.89-36.72 7.26-9.54 16.5-14.43 27.71-14.67 4.7 0 10.1 1.25 16.2 3.75 6.1 2.5 9.87 3.81 11.31 3.93 1.96-.25 5.92-1.63 11.89-4.14 5.97-2.51 11.1-3.69 15.39-3.53 11.64.48 21.17 4.67 28.58 12.56 7.42 7.89 11.97 17.58 13.67 29.07-10.37 6.27-15.42 14.9-15.14 25.88.27 8.52 3.7 15.65 10.27 21.39 6.58 5.74 14.18 9.07 22.82 10-1.89 5.86-4.18 11.66-6.86 17.4zM119.22 31.84c0-7.39 2.65-14.28 7.95-20.67 5.3-6.39 11.87-10.33 19.7-11.83.65 2.18.98 4.38.98 6.61 0 7.39-2.73 14.32-8.2 20.8-5.46 6.47-12.04 10.42-19.72 11.84-.21-2.18-.71-4.43-.71-6.75z" />
                    </svg>
                    <span>Apple</span>
                  </button>

                </div>
              </div>
            )}

            {/* Terms and Security Badges */}
            <div className="space-y-3 pt-2 text-[11px] text-gray-500">
              <p className="text-center leading-relaxed">
                By continuing, you agree to our{' '}
                <a href="#terms" onClick={e => e.preventDefault()} className="text-[#101522] underline font-medium">Terms of Service</a>{' '}
                and{' '}
                <a href="#privacy" onClick={e => e.preventDefault()} className="text-[#101522] underline font-medium">Privacy Policy</a>.
              </p>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-bit SSL encrypted · Verified Session</span>
              </div>
            </div>

          </div>

          {/* Admin Console Access Gateway (Accessed from Login Panel as requested) */}
          <div className="pt-4 mt-4 border-t border-gray-100">
            <div className="p-3 bg-gradient-to-r from-[#F8F7F4] via-amber-50/50 to-white border border-[#D7B779]/40 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#101522] text-[#D7B779] flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-[#D7B779]" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <strong className="text-xs text-[#101522] font-bold">Admin Console</strong>
                    <span className="text-[9px] uppercase tracking-wider font-mono font-bold bg-[#101522] text-[#D7B779] px-1.5 py-0.2 rounded">Console</span>
                  </div>
                  <p className="text-[11px] text-gray-500">Governance, multi-currency ledger & fraud audits</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onOpenAdminConsole) {
                    onOpenAdminConsole();
                  } else {
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-[#101522] hover:bg-[#1a2236] text-[#D7B779] text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 shadow-sm shrink-0"
              >
                <span>Launch Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Concept Disclaimer */}
          <div className="pt-4 mt-2 border-t border-gray-100 text-center">
            <span className="text-[10px] text-gray-400 block font-mono">
              Interactive design concept only — the form simulates authentic session onboarding.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
