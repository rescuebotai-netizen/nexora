import React, { useState } from 'react';
import { 
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
  X,
  Share2,
  Sparkles,
  Save,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { OrganizerProfile } from '../../types';
import { store } from '../../lib/store';
import heroFestivalImg from '../../assets/images/hero_afro_festival_1791591623547.jpg';
import techSummitImg from '../../assets/images/event_tech_summit_1791591635169.jpg';
import culinaryWineImg from '../../assets/images/event_culinary_wine_1791591643928.jpg';
import artExhibitImg from '../../assets/images/event_art_exhibit_1791591654774.jpg';

interface EditOrganizerProfileModalProps {
  organizer: OrganizerProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updated: OrganizerProfile) => void;
  theme?: 'dark' | 'light';
}

const PRESET_BANNERS = [
  { id: 'fest', label: 'Festival Stage', url: heroFestivalImg },
  { id: 'tech', label: 'Tech Summit', url: techSummitImg },
  { id: 'wine', label: 'Culinary Pavilion', url: culinaryWineImg },
  { id: 'art', label: 'Art Gallery', url: artExhibitImg },
];

export const EditOrganizerProfileModal: React.FC<EditOrganizerProfileModalProps> = ({
  organizer,
  isOpen,
  onClose,
  onSaved,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  // Form State
  const [activeTab, setActiveTab] = useState<'brand' | 'contact' | 'banking' | 'compliance'>('brand');

  // Brand identity
  const [name, setName] = useState(organizer.name);
  const [legalEntityName, setLegalEntityName] = useState(organizer.legalEntityName);
  const [bio, setBio] = useState(organizer.bio || 'Premier event curation company delivering high-impact cultural spectacles.');
  const [website, setWebsite] = useState(organizer.website || 'https://nexora.events');
  const [logoUrl, setLogoUrl] = useState(organizer.logoUrl || heroFestivalImg);
  const [bannerUrl, setBannerUrl] = useState(organizer.bannerUrl || heroFestivalImg);

  // Social links
  const [instagram, setInstagram] = useState(organizer.socialLinks?.instagram || '@capetownvibes');
  const [twitter, setTwitter] = useState(organizer.socialLinks?.twitter || '@cptvibeslive');
  const [linkedin, setLinkedin] = useState(organizer.socialLinks?.linkedin || 'cape-town-vibes');
  const [youtube, setYoutube] = useState(organizer.socialLinks?.youtube || '@capetownvibeslive');

  // Contact & Location
  const [email, setEmail] = useState(organizer.email);
  const [phone, setPhone] = useState(organizer.phone);
  const [country, setCountry] = useState(organizer.country);
  const [city, setCity] = useState(organizer.city);
  const [address, setAddress] = useState(organizer.address || 'Suite 402, The Boulevard Office Park, Woodstock, Cape Town');

  // Banking
  const [bankName, setBankName] = useState(organizer.bankDetails.bankName);
  const [accountNumber, setAccountNumber] = useState(organizer.bankDetails.accountNumber);
  const [accountHolder, setAccountHolder] = useState(organizer.bankDetails.accountHolder);
  const [branchCode, setBranchCode] = useState(organizer.bankDetails.branchCode || '250655');
  const [accountType, setAccountType] = useState(organizer.bankDetails.accountType || 'Business Cheque');

  // Legal
  const [taxNumber, setTaxNumber] = useState(organizer.taxNumber || 'ZA-VAT-4910294821');

  // Status feedback
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Logo File Upload
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

  // Handle Banner File Upload
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

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMsg('Organization name is required.');
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
        onSaved(result);
        onClose();
      } else {
        setErrorMsg('Failed to persist profile changes. Please try again.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        className={`w-full max-w-4xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[92vh] ${
          isDark ? 'bg-[#0B0F17] border-[#1F2937] text-white' : 'bg-white border-[#E5E7EB] text-[#111827]'
        }`}
      >
        {/* MODAL HEADER WITH HERO BANNER PREVIEW */}
        <div className="relative">
          {/* Banner backdrop preview */}
          <div className="h-32 sm:h-44 w-full relative overflow-hidden bg-neutral-900">
            <img 
              src={bannerUrl} 
              alt="Organizer Cover" 
              className="w-full h-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute top-3 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono text-white border border-white/10">
              <Building2 className="w-3.5 h-3.5 text-white" />
              <span>ORGANIZER PROFILE STUDIO</span>
            </div>
          </div>

          {/* Profile Identity Bar */}
          <div className="px-6 -mt-12 sm:-mt-14 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10">
            <div className="flex items-end gap-4">
              <div className="relative group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white bg-black shadow-xl shrink-0">
                  <img 
                    src={logoUrl} 
                    alt={name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <label 
                  htmlFor="logo-file-input" 
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold rounded-2xl cursor-pointer transition-opacity"
                >
                  <Upload className="w-4 h-4 mb-0.5" />
                  <span>Change</span>
                </label>
                <input 
                  id="logo-file-input" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoUpload} 
                  className="hidden" 
                />
              </div>

              <div className="space-y-0.5 pb-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-md">
                    {name || 'Organizer Brand'}
                  </h2>
                  {organizer.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-white text-black px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  {legalEntityName} · {city}, {country}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label 
                htmlFor="banner-file-input" 
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur-md cursor-pointer transition-colors flex items-center gap-1.5 border border-white/10"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Banner</span>
              </label>
              <input 
                id="banner-file-input" 
                type="file" 
                accept="image/*" 
                onChange={handleBannerUpload} 
                className="hidden" 
              />
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className={`px-6 border-b flex items-center gap-2 overflow-x-auto ${
          isDark ? 'border-[#1F2937] bg-[#111827]/60' : 'border-[#E5E7EB] bg-neutral-50'
        }`}>
          {[
            { id: 'brand', label: '1. Brand & Presentation', icon: Sparkles },
            { id: 'contact', label: '2. Contacts & Location', icon: MapPin },
            { id: 'banking', label: '3. Payout & Settlements', icon: CreditCard },
            { id: 'compliance', label: '4. Legal & Verification', icon: ShieldCheck },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive 
                    ? (isDark ? 'border-white text-white' : 'border-black text-black') 
                    : (isDark ? 'border-transparent text-neutral-400 hover:text-white' : 'border-transparent text-neutral-500 hover:text-black')
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ERROR NOTIFICATION */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB CONTENTS (SCROLLABLE) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* TAB 1: BRAND IDENTITY */}
          {activeTab === 'brand' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                    Organization / Brand Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Cape Town Vibes Live Ltd"
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold outline-none transition-colors ${
                      isDark 
                        ? 'bg-[#161F30] border-[#2A3850] text-white focus:border-white' 
                        : 'bg-white border-[#D1D5DB] text-black focus:border-black'
                    }`}
                  />
                  <p className="text-[10px] mt-1 opacity-60">This brand name appears on event listings, tickets, and marketplace cards.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                    Registered Legal Entity Name *
                  </label>
                  <input
                    type="text"
                    value={legalEntityName}
                    onChange={(e) => setLegalEntityName(e.target.value)}
                    placeholder="e.g. Cape Town Entertainment Group (Pty) Ltd"
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold outline-none transition-colors ${
                      isDark 
                        ? 'bg-[#161F30] border-[#2A3850] text-white focus:border-white' 
                        : 'bg-white border-[#D1D5DB] text-black focus:border-black'
                    }`}
                  />
                  <p className="text-[10px] mt-1 opacity-60">Official registered company name used for merchant settlements and tax invoices.</p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                  Brand Editorial Bio / About Us
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your collective, festival vision, or conference focus..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium transition-colors ${
                    isDark 
                      ? 'bg-[#161F30] border-[#2A3850] text-white focus:border-white' 
                      : 'bg-white border-[#D1D5DB] text-black focus:border-black'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                  Official Website
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-3 opacity-50" />
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourbrand.com"
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border font-mono outline-none transition-colors ${
                      isDark 
                        ? 'bg-[#161F30] border-[#2A3850] text-white focus:border-white' 
                        : 'bg-white border-[#D1D5DB] text-black focus:border-black'
                    }`}
                  />
                </div>
              </div>

              {/* Preset Banner Selector */}
              <div className="space-y-2 pt-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider opacity-80">
                  Quick Select Premium Banner Asset
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_BANNERS.map(preset => {
                    const isSelected = bannerUrl === preset.url;
                    return (
                      <div 
                        key={preset.id}
                        onClick={() => setBannerUrl(preset.url)}
                        className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                          isSelected ? 'border-white scale-[1.02] shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-16 object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1 text-center">
                          <span className="text-[10px] font-bold text-white font-mono">{preset.label}</span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-white text-black p-0.5 rounded-full">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Social Channels */}
              <div className="space-y-3 pt-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider opacity-80">
                  Social Channels & Handles
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] opacity-70 mb-1 block">Instagram Handle</span>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@yourhandle"
                      className={`w-full px-3 py-2 rounded-xl border font-mono outline-none ${
                        isDark ? 'bg-[#161F30] border-[#2A3850] text-white' : 'bg-white border-[#D1D5DB] text-black'
                      }`}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] opacity-70 mb-1 block">Twitter / X Handle</span>
                    <input
                      type="text"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="@yourhandle"
                      className={`w-full px-3 py-2 rounded-xl border font-mono outline-none ${
                        isDark ? 'bg-[#161F30] border-[#2A3850] text-white' : 'bg-white border-[#D1D5DB] text-black'
                      }`}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] opacity-70 mb-1 block">LinkedIn Organization Page</span>
                    <input
                      type="text"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="company-name"
                      className={`w-full px-3 py-2 rounded-xl border font-mono outline-none ${
                        isDark ? 'bg-[#161F30] border-[#2A3850] text-white' : 'bg-white border-[#D1D5DB] text-black'
                      }`}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] opacity-70 mb-1 block">YouTube Channel</span>
                    <input
                      type="text"
                      value={youtube}
                      onChange={(e) => setYoutube(e.target.value)}
                      placeholder="@channelname"
                      className={`w-full px-3 py-2 rounded-xl border font-mono outline-none ${
                        isDark ? 'bg-[#161F30] border-[#2A3850] text-white' : 'bg-white border-[#D1D5DB] text-black'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTACTS & LOCATION */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                    Official Support Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 opacity-50" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="info@yourcompany.co.za"
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border font-medium outline-none ${
                        isDark ? 'bg-[#161F30] border-[#2A3850] text-white' : 'bg-white border-[#D1D5DB] text-black'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                    Phone / WhatsApp Hotline *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 opacity-50" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+27 21 555 0192"
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border font-mono outline-none ${
                        isDark ? 'bg-[#161F30] border-[#2A3850] text-white' : 'bg-white border-[#D1D5DB] text-black'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                    Jurisdiction / Country *
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold outline-none ${
                      isDark ? 'bg-[#161F30] border-[#2A3850] text-white' : 'bg-white border-[#D1D5DB] text-black'
                    }`}
                  >
                    <option value="ZA">South Africa (ZA - ZAR)</option>
                    <option value="KE">Kenya (KE - KES)</option>
                    <option value="NG">Nigeria (NG - NGN)</option>
                    <option value="GH">Ghana (GH - GHS)</option>
                    <option value="RW">Rwanda (RW - RWF)</option>
                    <option value="EG">Egypt (EG - EGP)</option>
                    <option value="TZ">Tanzania (TZ - TZS)</option>
                    <option value="UG">Uganda (UG - UGX)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                    Headquarters City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Cape Town"
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-medium outline-none ${
                      isDark ? 'bg-[#161F30] border-[#2A3850] text-white' : 'bg-white border-[#D1D5DB] text-black'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                  Physical Office Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, building, suite number"
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-medium outline-none ${
                    isDark ? 'bg-[#161F30] border-[#2A3850] text-white' : 'bg-white border-[#D1D5DB] text-black'
                  }`}
                />
              </div>
            </div>
          )}

          {/* TAB 3: PAYOUT & BANKING */}
          {activeTab === 'banking' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-neutral-50 border-neutral-200'
              }`}>
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold">Enterprise Settlement Rails (T+1 Daily Payouts)</h4>
                  <p className="opacity-70 leading-relaxed">
                    Ticket revenues cleared through Paystack, Ozow, and M-Pesa are held in segregated trust escrow and disbursed daily to this verified account.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                    Clearing Bank Name *
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. First National Bank (FNB)"
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold outline-none ${
                      isDark ? 'bg-[#161F30] border-[#2A3850] text-white' : 'bg-white border-[#D1D5DB] text-black'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="Must match Legal Entity Name"
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold outline-none ${
                      isDark ? 'bg-[#161F30] border-[#2A3850] text-white' : 'bg-white border-[#D1D5DB] text-black'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 62891048291"
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold outline-none ${
                      isDark ? 'bg-[#161F30] border-[#2A3850] text-white' : 'bg-white border-[#D1D5DB] text-black'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                    Branch / Routing Code
                  </label>
                  <input
                    type="text"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    placeholder="e.g. 250655"
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-mono outline-none ${
                      isDark ? 'bg-[#161F30] border-[#2A3850] text-white' : 'bg-white border-[#D1D5DB] text-black'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                    Account Classification
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold outline-none ${
                      isDark ? 'bg-[#161F30] border-[#2A3850] text-white' : 'bg-white border-[#D1D5DB] text-black'
                    }`}
                  >
                    <option value="Business Cheque">Business Cheque Account</option>
                    <option value="Corporate Current">Corporate Current Account</option>
                    <option value="Commercial Trust">Commercial Trust Account</option>
                    <option value="Treasury Call">Treasury Call Account</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LEGAL & COMPLIANCE */}
          {activeTab === 'compliance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                    Tax / VAT Registration Number
                  </label>
                  <input
                    type="text"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    placeholder="e.g. ZA-VAT-4910294821"
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-mono outline-none ${
                      isDark ? 'bg-[#161F30] border-[#2A3850] text-white' : 'bg-white border-[#D1D5DB] text-black'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                    Subscription Tier
                  </label>
                  <div className={`px-3.5 py-2.5 rounded-xl border flex items-center justify-between ${
                    isDark ? 'bg-[#161F30] border-[#2A3850]' : 'bg-neutral-50 border-neutral-200'
                  }`}>
                    <span className="font-bold capitalize">{organizer.subscriptionPlan} Tier</span>
                    <span className="font-mono text-[11px] bg-white text-black px-2 py-0.5 rounded font-bold">
                      {(organizer.commissionRate * 100).toFixed(1)}% Fee
                    </span>
                  </div>
                </div>
              </div>

              {/* KYC Verification Card */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                isDark ? 'bg-[#161F30] border-[#2A3850]' : 'bg-neutral-50 border-[#E5E7EB]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold">KYC Business Verification Status</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono ${
                    organizer.verificationStatus === 'verified' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {organizer.verificationStatus.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] opacity-75">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Verified Document: {organizer.verificationDocName || 'CIPC_Registration_Cert.pdf'}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER ACTIONS */}
        <div className={`p-4 sm:p-5 border-t flex items-center justify-between gap-4 ${
          isDark ? 'border-[#1F2937] bg-[#111827]' : 'border-[#E5E7EB] bg-neutral-50'
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              isDark ? 'hover:bg-white/10 text-neutral-300' : 'hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-lg disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Organizer Profile</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
