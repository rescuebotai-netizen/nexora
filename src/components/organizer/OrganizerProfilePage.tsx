import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Check,
  Upload,
  Image as ImageIcon,
  CreditCard,
  ShieldCheck,
  FileText,
  AlertCircle,
  Share2,
  Sparkles,
  Save,
  CheckCircle2,
  Lock,
  ArrowRight,
  Eye,
  Copy,
  RefreshCw,
  Users,
  Plus,
  Trash2,
  ExternalLink,
  Calendar,
  Star,
  DollarSign,
  Award,
  Layers,
  HelpCircle,
  Sliders
} from 'lucide-react';
import { OrganizerProfile, Event } from '../../types';
import { store } from '../../lib/store';
import heroFestivalImg from '../../assets/images/hero_afro_festival_1791591623547.jpg';
import techSummitImg from '../../assets/images/event_tech_summit_1791591635169.jpg';
import culinaryWineImg from '../../assets/images/event_culinary_wine_1791591643928.jpg';
import artExhibitImg from '../../assets/images/event_art_exhibit_1791591654774.jpg';

interface OrganizerProfilePageProps {
  organizer: OrganizerProfile;
  onBack: () => void;
  onSaved: (updated: OrganizerProfile) => void;
  theme?: 'dark' | 'light';
}

const PRESET_BANNERS = [
  { id: 'fest', label: 'Festival Arena', url: heroFestivalImg },
  { id: 'tech', label: 'Tech Summit', url: techSummitImg },
  { id: 'wine', label: 'Culinary Pavilion', url: culinaryWineImg },
  { id: 'art', label: 'Art Gallery', url: artExhibitImg },
];

type ProfileTab = 'brand' | 'contact' | 'banking' | 'compliance' | 'policies' | 'team' | 'preview';

export const OrganizerProfilePage: React.FC<OrganizerProfilePageProps> = ({
  organizer,
  onBack,
  onSaved,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  // Navigation
  const [activeTab, setActiveTab] = useState<ProfileTab>('brand');
  const [copiedLink, setCopiedLink] = useState(false);

  // Brand Identity Form State
  const [name, setName] = useState(organizer.name);
  const [legalEntityName, setLegalEntityName] = useState(organizer.legalEntityName);
  const [bio, setBio] = useState(organizer.bio || 'Premier event curation company delivering high-impact cultural spectacles, concerts, and professional summits.');
  const [website, setWebsite] = useState(organizer.website || 'https://nexora.events');
  const [logoUrl, setLogoUrl] = useState(organizer.logoUrl || heroFestivalImg);
  const [bannerUrl, setBannerUrl] = useState(organizer.bannerUrl || heroFestivalImg);

  // Social handles
  const [instagram, setInstagram] = useState(organizer.socialLinks?.instagram || '@capetownvibes');
  const [twitter, setTwitter] = useState(organizer.socialLinks?.twitter || '@cptvibeslive');
  const [linkedin, setLinkedin] = useState(organizer.socialLinks?.linkedin || 'cape-town-vibes');
  const [youtube, setYoutube] = useState(organizer.socialLinks?.youtube || '@capetownvibeslive');

  // Contact & Location
  const [email, setEmail] = useState(organizer.email);
  const [supportEmail, setSupportEmail] = useState('attendees@capetownvibes.co.za');
  const [phone, setPhone] = useState(organizer.phone);
  const [country, setCountry] = useState(organizer.country);
  const [city, setCity] = useState(organizer.city);
  const [address, setAddress] = useState(organizer.address || 'Suite 402, The Boulevard Office Park, Woodstock, Cape Town');

  // Settlement Banking
  const [bankName, setBankName] = useState(organizer.bankDetails.bankName);
  const [accountNumber, setAccountNumber] = useState(organizer.bankDetails.accountNumber);
  const [accountHolder, setAccountHolder] = useState(organizer.bankDetails.accountHolder);
  const [branchCode, setBranchCode] = useState(organizer.bankDetails.branchCode || '250655');
  const [accountType, setAccountType] = useState(organizer.bankDetails.accountType || 'Business Cheque');
  const [settlementSchedule, setSettlementSchedule] = useState<'daily' | 'weekly' | 'post_event'>('daily');

  // Legal & Compliance
  const [taxNumber, setTaxNumber] = useState(organizer.taxNumber || 'ZA-VAT-4910294821');
  const [registrationNumber, setRegistrationNumber] = useState('2019/584910/07');

  // Operational Policies
  const [refundPolicy, setRefundPolicy] = useState('Flexible 48-Hour Guarantee');
  const [absorbFees, setAbsorbFees] = useState(false);
  const [allowTransfers, setAllowTransfers] = useState(true);

  // Team Members
  const [teamMembers, setTeamMembers] = useState([
    { name: 'David Mokoena', role: 'Managing Director & Founder', email: organizer.email, status: 'Owner' },
    { name: 'Zanele Ndlovu', role: 'Lead Event Operations', email: 'zanele@capetownvibes.co.za', status: 'Manager' },
    { name: 'Kwame Mensah', role: 'Box Office & Gate Supervisor', email: 'kwame@capetownvibes.co.za', status: 'Gate Lead' },
  ]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Event Staff');

  // State Feedback
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // File Upload Handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setLogoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setBannerUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://nexora.events/@${name.toLowerCase().replace(/\s+/g, '')}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMsg('Organization display name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('A valid corporate email address is required.');
      return;
    }
    if (!bankName.trim() || !accountNumber.trim()) {
      setErrorMsg('Complete payout banking details are required for enterprise ticket settlements.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const updates: Partial<OrganizerProfile> = {
      name: name.trim(),
      legalEntityName: legalEntityName.trim(),
      bio: bio.trim(),
      website: website.trim(),
      logoUrl,
      bannerUrl,
      email: email.trim(),
      phone: phone.trim(),
      country,
      city: city.trim(),
      address: address.trim(),
      taxNumber: taxNumber.trim(),
      socialLinks: {
        instagram: instagram.trim(),
        twitter: twitter.trim(),
        linkedin: linkedin.trim(),
        youtube: youtube.trim(),
      },
      bankDetails: {
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim(),
        branchCode: branchCode.trim(),
        accountType,
      },
    };

    setTimeout(() => {
      const result = store.updateOrganizerProfile(organizer.id, updates);
      setSaving(false);
      if (result) {
        setSavedSuccess(true);
        onSaved(result);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        setErrorMsg('Failed to persist profile changes. Please try again.');
      }
    }, 450);
  };

  return (
    <div className={`min-h-screen w-full transition-colors flex flex-col ${
      isDark ? 'bg-[#0A0D14] text-white' : 'bg-[#F4F6F9] text-[#111827]'
    }`}>

      {/* STICKY TOP HEADER COMMAND BAR */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 ${
        isDark ? 'bg-[#0E131F]/90 border-[#1F2937]' : 'bg-white/95 border-[#E5E7EB] shadow-xs'
      }`}>
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-2 ${
              isDark ? 'border-white/15 hover:bg-white/10 text-white' : 'border-neutral-300 hover:bg-neutral-100 text-neutral-800'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold hidden md:inline">Back to Dashboard</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase text-[#F6A623]">
                NEXORA
              </span>
              <span className={`text-[10px] font-mono uppercase ${isDark ? 'text-white/40' : 'text-neutral-400'}`}>/</span>
              <span className={`text-[10px] font-mono uppercase font-bold ${isDark ? 'text-white/70' : 'text-neutral-600'}`}>
                ORGANIZATION PROFILE
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase font-mono">
                <ShieldCheck className="w-3 h-3" />
                Verified Entity
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight">
              Corporate Identity & Brand Command
            </h1>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setActiveTab(activeTab === 'preview' ? 'brand' : 'preview')}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-[#F6A623] text-black border-[#F6A623]'
                : (isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-50 shadow-xs')
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{activeTab === 'preview' ? 'Exit Storefront Preview' : 'Preview Storefront'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className={`p-2 rounded-xl border transition-colors cursor-pointer hidden sm:flex items-center gap-1.5 text-xs font-mono ${
              copiedLink
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : (isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-50 shadow-xs')
            }`}
            title="Copy Public Storefront URL"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Copied' : 'Share URL'}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-[#F6A623] hover:bg-[#E59516] disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ERROR FEEDBACK BANNER */}
      {errorMsg && (
        <div className="px-6 py-3 bg-red-500/15 border-b border-red-500/30 text-red-400 text-xs flex items-center justify-between font-bold">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* BRAND COVER HERO SECTION */}
      <section className="relative">
        <div className="h-48 sm:h-64 lg:h-72 w-full relative overflow-hidden bg-neutral-900">
          <img
            src={bannerUrl}
            alt={name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Change Banner Button Overlay */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <label className="px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/90 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all cursor-pointer flex items-center gap-2 shadow-lg">
              <Upload className="w-3.5 h-3.5" />
              <span>Change Cover Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Hero Content Overlay: Logo & Info */}
          <div className="absolute bottom-4 left-4 sm:left-8 right-4 sm:right-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4 sm:gap-6">
              
              {/* Logo with upload overlay */}
              <div className="relative group">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white bg-black shadow-2xl shrink-0">
                  <img
                    src={logoUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer backdrop-blur-xs">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold">Change Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Title & Badges */}
              <div className="text-white pb-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-3xl font-black tracking-tight">{name}</h2>
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded-full font-black uppercase font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </div>
                <p className="text-neutral-300 text-xs sm:text-sm font-medium">
                  {legalEntityName} · {city}, {country}
                </p>
              </div>

            </div>

            {/* Quick Stats Pill */}
            <div className="hidden lg:flex items-center gap-4 bg-black/50 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 text-xs text-white">
              <div>
                <span className="text-[10px] uppercase font-mono opacity-60 block">Platform Plan</span>
                <strong className="text-amber-400 capitalize">{organizer.subscriptionPlan || 'Enterprise'}</strong>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <div>
                <span className="text-[10px] uppercase font-mono opacity-60 block">Commission Rate</span>
                <strong>{((organizer.commissionRate || 0.025) * 100).toFixed(1)}%</strong>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <div>
                <span className="text-[10px] uppercase font-mono opacity-60 block">Profile Strength</span>
                <strong className="text-emerald-400">98% Verified</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TAB NAVIGATION BAR */}
      <div className={`border-b px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4 overflow-x-auto ${
        isDark ? 'bg-[#0E131F]/50 border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
      }`}>
        <div className="flex items-center gap-1 sm:gap-2 min-w-max">
          {[
            { id: 'brand', label: 'Brand & Media', icon: Building2 },
            { id: 'contact', label: 'Corporate Contact', icon: Mail },
            { id: 'banking', label: 'Settlement Banking', icon: CreditCard },
            { id: 'compliance', label: 'Legal & Tax (KYC)', icon: ShieldCheck },
            { id: 'policies', label: 'Operational Policies', icon: Sliders },
            { id: 'team', label: 'Team & Governance', icon: Users },
            { id: 'preview', label: 'Public Storefront', icon: Eye },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ProfileTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#F6A623] text-black shadow-md'
                    : (isDark ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900')
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT FORM WORKSPACE */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl w-full mx-auto">
        
        {/* ========================================================= */}
        {/* TAB 1: BRAND IDENTITY & MEDIA                             */}
        {/* ========================================================= */}
        {activeTab === 'brand' && (
          <div className="space-y-8 animate-fadeIn">
            <div className={`p-6 sm:p-8 rounded-2xl border space-y-6 ${
              isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB] shadow-xs'
            }`}>
              <div>
                <h3 className="text-base font-bold">Public Organization Brand Identity</h3>
                <p className={`text-xs ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>
                  Your brand appearance across the NEXORA event marketplace, ticket wallets, and attendee invoices.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase font-bold mb-1.5">
                    Organization Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Cape Town Vibes Live Ltd"
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#F6A623] ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-bold mb-1.5">
                    Registered Legal Entity Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={legalEntityName}
                    onChange={e => setLegalEntityName(e.target.value)}
                    placeholder="e.g. Cape Town Entertainment Group (Pty) Ltd"
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#F6A623] ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold mb-1.5">
                  Editorial Biography & Mission Statement
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Describe your organization, history, cultural focus, and standard event experiences..."
                  className={`w-full p-4 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#F6A623] ${
                    isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                  }`}
                />
                <span className={`text-[10px] font-mono ${isDark ? 'text-white/40' : 'text-neutral-400'}`}>
                  {bio.length} characters · Appears on public organizer profile
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold mb-1.5">
                  Corporate Website URL
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://yourbrand.com"
                  className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#F6A623] ${
                    isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>

              {/* Banner Presets Gallery */}
              <div className="pt-2">
                <label className="block text-xs font-mono uppercase font-bold mb-2">
                  Curated Banner Cover Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_BANNERS.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBannerUrl(b.url)}
                      className={`relative aspect-[16/9] rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                        bannerUrl === b.url ? 'border-[#F6A623] scale-[1.02]' : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={b.url} alt={b.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-end p-2">
                        <span className="text-[10px] font-bold text-white drop-shadow-md">{b.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Social Channels */}
              <div className="pt-4 border-t border-neutral-500/20 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#F6A623]">
                  Connected Social Profiles
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono mb-1">Instagram Handle</label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={e => setInstagram(e.target.value)}
                      placeholder="@yourhandle"
                      className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                        isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono mb-1">X / Twitter Handle</label>
                    <input
                      type="text"
                      value={twitter}
                      onChange={e => setTwitter(e.target.value)}
                      placeholder="@yourhandle"
                      className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                        isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono mb-1">LinkedIn Page</label>
                    <input
                      type="text"
                      value={linkedin}
                      onChange={e => setLinkedin(e.target.value)}
                      placeholder="company-handle"
                      className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                        isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono mb-1">YouTube Channel</label>
                    <input
                      type="text"
                      value={youtube}
                      onChange={e => setYoutube(e.target.value)}
                      placeholder="@channel"
                      className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                        isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CORPORATE CONTACT & HEADQUARTERS                   */}
        {/* ========================================================= */}
        {activeTab === 'contact' && (
          <div className="space-y-6 animate-fadeIn">
            <div className={`p-6 sm:p-8 rounded-2xl border space-y-6 ${
              isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB] shadow-xs'
            }`}>
              <div>
                <h3 className="text-base font-bold">Contact Coordinates & Headquarters</h3>
                <p className={`text-xs ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>
                  Official communication addresses for event notifications, regulatory inquiries, and attendee support.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase font-bold mb-1.5">
                    Official Executive Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-bold mb-1.5">
                    Public Attendee Support Email
                  </label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={e => setSupportEmail(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-bold mb-1.5">
                    Corporate Phone / WhatsApp Hotline *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-bold mb-1.5">
                    Country Jurisdiction *
                  </label>
                  <select
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none cursor-pointer ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                    }`}
                  >
                    <option value="ZA">South Africa (ZAR)</option>
                    <option value="NG">Nigeria (NGN)</option>
                    <option value="KE">Kenya (KES)</option>
                    <option value="GH">Ghana (GHS)</option>
                    <option value="RW">Rwanda (RWF)</option>
                    <option value="US">International (USD)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-mono uppercase font-bold mb-1.5">
                    Physical Headquarters Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-bold mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                    }`}
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SETTLEMENT BANKING & PAYOUT RAILS                  */}
        {/* ========================================================= */}
        {activeTab === 'banking' && (
          <div className="space-y-6 animate-fadeIn">
            <div className={`p-6 sm:p-8 rounded-2xl border space-y-6 ${
              isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB] shadow-xs'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold">Settlement Banking & Payout Rails</h3>
                  <p className={`text-xs ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>
                    Primary bank account receiving ticket revenues via Ozow, M-Pesa, Paystack, and Card rails.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Direct EFT Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase font-bold mb-1.5">
                    Banking Institution *
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    placeholder="e.g. Standard Bank / First National Bank"
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-bold mb-1.5">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={e => setAccountHolder(e.target.value)}
                    placeholder="e.g. Cape Town Entertainment Group (Pty) Ltd"
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-bold mb-1.5">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="e.g. 10184920491"
                    className={`w-full px-4 py-2.5 rounded-xl text-sm font-mono border focus:outline-none ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-bold mb-1.5">
                    Branch / Clearing Code *
                  </label>
                  <input
                    type="text"
                    value={branchCode}
                    onChange={e => setBranchCode(e.target.value)}
                    placeholder="e.g. 250655"
                    className={`w-full px-4 py-2.5 rounded-xl text-sm font-mono border focus:outline-none ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-bold mb-1.5">
                    Account Type
                  </label>
                  <select
                    value={accountType}
                    onChange={e => setAccountType(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none cursor-pointer ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                    }`}
                  >
                    <option value="Business Cheque">Business Cheque / Checking</option>
                    <option value="Corporate Savings">Corporate Savings</option>
                    <option value="Trust Account">Trust Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-bold mb-1.5">
                    Automated Settlement Schedule
                  </label>
                  <select
                    value={settlementSchedule}
                    onChange={e => setSettlementSchedule(e.target.value as any)}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none cursor-pointer ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                    }`}
                  >
                    <option value="daily">Daily Automated Transfers</option>
                    <option value="weekly">Weekly Friday Batch</option>
                    <option value="post_event">T+1 Post Event Final Settlement</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs flex items-center gap-3 text-blue-300">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
                <span>
                  Bank accounts are verified with national instant EFT rails. Settlements clear automatically without requiring manual withdrawal requests.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: LEGAL, COMPLIANCE & KYC                            */}
        {/* ========================================================= */}
        {activeTab === 'compliance' && (
          <div className="space-y-6 animate-fadeIn">
            <div className={`p-6 sm:p-8 rounded-2xl border space-y-6 ${
              isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB] shadow-xs'
            }`}>
              <div>
                <h3 className="text-base font-bold">Enterprise Legal Registration & KYC</h3>
                <p className={`text-xs ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>
                  Statutory corporate compliance documents guaranteeing tax-compliant ticketing and fiscal integrity.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase font-bold mb-1.5">
                    Tax / VAT Identification Number
                  </label>
                  <input
                    type="text"
                    value={taxNumber}
                    onChange={e => setTaxNumber(e.target.value)}
                    placeholder="e.g. ZA-VAT-4910294821"
                    className={`w-full px-4 py-2.5 rounded-xl text-sm font-mono border focus:outline-none ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-bold mb-1.5">
                    Company Registration Number (CIPC / CAC)
                  </label>
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={e => setRegistrationNumber(e.target.value)}
                    placeholder="e.g. 2019/584910/07"
                    className={`w-full px-4 py-2.5 rounded-xl text-sm font-mono border focus:outline-none ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-500/20 space-y-3">
                <span className="text-xs font-mono uppercase font-bold text-[#F6A623] block">
                  Verified Compliance Documents:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    isDark ? 'bg-[#151D2C] border-[#253247]' : 'bg-neutral-50 border-neutral-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-emerald-400" />
                      <div>
                        <strong>CIPC Certificate of Incorporation</strong>
                        <div className="text-[11px] opacity-60">Verified on 12 Jan 2026</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                      VALID
                    </span>
                  </div>

                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    isDark ? 'bg-[#151D2C] border-[#253247]' : 'bg-neutral-50 border-neutral-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-emerald-400" />
                      <div>
                        <strong>SARS Tax Clearance Pin</strong>
                        <div className="text-[11px] opacity-60">Good Standing Status</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: OPERATIONAL POLICIES & DEFAULTS                    */}
        {/* ========================================================= */}
        {activeTab === 'policies' && (
          <div className="space-y-6 animate-fadeIn">
            <div className={`p-6 sm:p-8 rounded-2xl border space-y-6 ${
              isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB] shadow-xs'
            }`}>
              <h3 className="text-base font-bold">Standard Event Policies & Defaults</h3>
              
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-500/20">
                  <div>
                    <div className="font-bold text-sm">Absorb Platform Ticketing Fee</div>
                    <div className="opacity-60 text-xs">
                      When enabled, the 3.5% fee is deducted from organizer revenue rather than added at attendee checkout.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={absorbFees}
                    onChange={e => setAbsorbFees(e.target.checked)}
                    className="w-5 h-5 accent-[#F6A623] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-500/20">
                  <div>
                    <div className="font-bold text-sm">Allow Peer-to-Peer Ticket Transfers</div>
                    <div className="opacity-60 text-xs">
                      Permits attendees to transfer digital ticket tokens securely to friends via email or phone.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowTransfers}
                    onChange={e => setAllowTransfers(e.target.checked)}
                    className="w-5 h-5 accent-[#F6A623] cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-bold mb-1.5">
                    Default Refund Policy Framework
                  </label>
                  <select
                    value={refundPolicy}
                    onChange={e => setRefundPolicy(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none cursor-pointer ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                    }`}
                  >
                    <option value="Flexible 48-Hour Guarantee">Flexible 48-Hour Guarantee (Refundable up to 2 days before event)</option>
                    <option value="Moderate 7-Day Window">Moderate 7-Day Window (Refundable up to 7 days before event)</option>
                    <option value="Strict 14-Day Cutoff">Strict 14-Day Cutoff</option>
                    <option value="No Refunds Except Cancellation">No Refunds (Except in event cancellation)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: TEAM & GOVERNANCE                                  */}
        {/* ========================================================= */}
        {activeTab === 'team' && (
          <div className="space-y-6 animate-fadeIn">
            <div className={`p-6 sm:p-8 rounded-2xl border space-y-6 ${
              isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB] shadow-xs'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold">Authorized Organization Governance</h3>
                  <p className={`text-xs ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>
                    Manage collaborator access for box office management, scanning operators, and finance reconciliation.
                  </p>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-3">
                {teamMembers.map((m, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border flex items-center justify-between gap-4 text-xs ${
                      isDark ? 'bg-[#151D2C] border-[#253247]' : 'bg-neutral-50 border-neutral-200'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm">{m.name}</div>
                      <div className={`text-[11px] font-mono ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>
                        {m.role} · {m.email}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#F6A623]/20 text-[#F6A623]">
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add New Member Input */}
              <div className="pt-4 border-t border-neutral-500/20 space-y-3">
                <span className="text-xs font-mono uppercase font-bold text-[#F6A623] block">
                  Invite New Staff Member:
                </span>
                <div className="flex gap-2 flex-wrap">
                  <input
                    type="email"
                    placeholder="colleague@domain.com"
                    value={newMemberEmail}
                    onChange={e => setNewMemberEmail(e.target.value)}
                    className={`flex-1 min-w-[200px] px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                    }`}
                  />
                  <select
                    value={newMemberRole}
                    onChange={e => setNewMemberRole(e.target.value)}
                    className={`px-3.5 py-2 rounded-xl text-xs border focus:outline-none cursor-pointer ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                    }`}
                  >
                    <option value="Event Staff">Gate Scanning Staff</option>
                    <option value="Event Manager">Event Operations Manager</option>
                    <option value="Finance Lead">Finance & Settlements</option>
                  </select>
                  <button
                    onClick={() => {
                      if (newMemberEmail.trim()) {
                        setTeamMembers(prev => [
                          ...prev,
                          { name: newMemberEmail.split('@')[0], role: newMemberRole, email: newMemberEmail.trim(), status: 'Invited' }
                        ]);
                        setNewMemberEmail('');
                      }
                    }}
                    className="px-4 py-2 bg-[#F6A623] text-black font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Send Invitation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: PUBLIC STOREFRONT LIVE PREVIEW                     */}
        {/* ========================================================= */}
        {activeTab === 'preview' && (
          <div className="space-y-6 animate-fadeIn">
            <div className={`p-6 sm:p-8 rounded-2xl border space-y-6 ${
              isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB] shadow-xs'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold">Public Attendee Storefront Preview</h3>
                  <p className={`text-xs ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>
                    Real-time representation of how ticket buyers see your brand profile on NEXORA.
                  </p>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Storefront</span>
                </button>
              </div>

              {/* Mock Attendee Storefront Card */}
              <div className="rounded-2xl border border-neutral-500/20 overflow-hidden shadow-xl bg-black text-white">
                <div className="relative h-44 w-full overflow-hidden">
                  <img src={bannerUrl} alt={name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-6 flex items-end gap-4">
                    <img src={logoUrl} alt={name} className="w-16 h-16 rounded-xl border-2 border-white object-cover" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-black">{name}</h4>
                        <span className="text-[10px] bg-emerald-400 text-black px-1.5 py-0.5 rounded font-black font-mono">
                          VERIFIED
                        </span>
                      </div>
                      <div className="text-xs text-neutral-300">{city}, {country}</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl">
                    {bio}
                  </p>

                  <div className="flex items-center gap-6 text-xs font-mono pt-2 border-t border-white/10">
                    <div>
                      <span className="opacity-60 block text-[10px]">TOTAL EVENTS</span>
                      <strong>14 Hosted</strong>
                    </div>
                    <div>
                      <span className="opacity-60 block text-[10px]">TICKETS SOLD</span>
                      <strong>24,800+</strong>
                    </div>
                    <div>
                      <span className="opacity-60 block text-[10px]">RATING</span>
                      <strong className="text-amber-400">★ 4.9 / 5.0</strong>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

    </div>
  );
};
