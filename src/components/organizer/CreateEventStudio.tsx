import React, { useState, useId, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  Tag,
  Globe,
  Share2,
  Smartphone,
  Monitor,
  Eye,
  Save,
  Plus,
  Trash2,
  Copy,
  ArrowRight,
  X,
  ChevronRight,
  Settings,
  Upload,
  Zap,
  FileText,
  Layers,
  Lock,
  ShieldCheck,
  HelpCircle,
  Send,
  RefreshCw,
  ExternalLink,
  Edit3
} from 'lucide-react';
import { Event, TicketTier, EventCategory, EventFormat, AgendaItem, Performer } from '../../types';
import { store } from '../../lib/store';

import heroFestivalImg from '../../assets/images/hero_afro_festival_1791591623547.jpg';
import techSummitImg from '../../assets/images/event_tech_summit_1791591635169.jpg';
import culinaryWineImg from '../../assets/images/event_culinary_wine_1791591643928.jpg';
import artExhibitImg from '../../assets/images/event_art_exhibit_1791591654774.jpg';

interface CreateEventStudioProps {
  onClose: () => void;
  onEventCreated: (event: Event) => void;
  initialTemplate?: string;
  duplicateFromEventId?: string;
}

type StudioStage =
  | 'start'
  | 'identity'
  | 'programme'
  | 'visuals'
  | 'tickets'
  | 'attendees'
  | 'payments'
  | 'marketing'
  | 'review';

const STAGES: { id: StudioStage; number: string; title: string; subtitle: string }[] = [
  { id: 'start', number: '01', title: 'Start & Method', subtitle: 'Creation options & templates' },
  { id: 'identity', number: '02', title: 'Event Identity', subtitle: 'Basics, dates & location' },
  { id: 'programme', number: '03', title: 'Programme & Content', subtitle: 'Agenda, speakers & FAQs' },
  { id: 'visuals', number: '04', title: 'Visual Page Builder', subtitle: 'Cover artwork & theme' },
  { id: 'tickets', number: '05', title: 'Tickets & Inventory', subtitle: 'Tiers, capacity & add-ons' },
  { id: 'attendees', number: '06', title: 'Attendee Experience', subtitle: 'Registration questions & passes' },
  { id: 'payments', number: '07', title: 'Payments & Payouts', subtitle: 'Africa rails & bank account' },
  { id: 'marketing', number: '08', title: 'Marketing & SEO', subtitle: 'Discoverability & promo copy' },
  { id: 'review', number: '09', title: 'Readiness & Publish', subtitle: 'Validation check & launch' },
];

const PRESET_ARTWORKS = [
  { img: techSummitImg, label: 'Tech Plenary & Summit' },
  { img: heroFestivalImg, label: 'Cape Town Festival' },
  { img: culinaryWineImg, label: 'Culinary & Wine Gathering' },
  { img: artExhibitImg, label: 'Contemporary African Art' },
];

export const CreateEventStudio: React.FC<CreateEventStudioProps> = ({
  onClose,
  onEventCreated,
  initialTemplate,
  duplicateFromEventId,
}) => {
  const isDark = true; // High contrast dark studio
  const existingEvents = useMemo(() => store.getEvents(), []);
  const existingOrganizers = useMemo(() => store.getOrganizers(), []);

  // Active Stage
  const [currentStage, setCurrentStage] = useState<StudioStage>(
    initialTemplate || duplicateFromEventId ? 'identity' : 'start'
  );

  // Autosave status
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');

  // Preview Mode in Right Panel
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [rightPanelTab, setRightPanelTab] = useState<'preview' | 'readiness' | 'ledger'>('preview');

  // Stage 01: Creation Method
  const [creationMethod, setCreationMethod] = useState<'blank' | 'generator' | 'template' | 'duplicate' | 'import'>('blank');
  const [generatorPrompt, setGeneratorPrompt] = useState(
    'Create a two-day African technology summit in Johannesburg for 500 attendees, with early-bird, general admission and VIP tickets, five speakers, a networking session and mobile-money payment options.'
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Stage 02: Event Identity & Basics
  const [title, setTitle] = useState('');
  const [shortSummary, setShortSummary] = useState('');
  const [category, setCategory] = useState<EventCategory>('Tech & Innovation');
  const [format, setFormat] = useState<EventFormat>('in_person');
  const [venueName, setVenueName] = useState('Sandton Convention Centre');
  const [venueAddress, setVenueAddress] = useState('161 Maude Street, Sandton');
  const [venueCity, setVenueCity] = useState('Johannesburg');
  const [venueCountry, setVenueCountry] = useState('South Africa');
  const [virtualUrl, setVirtualUrl] = useState('');
  const [startDate, setStartDate] = useState('2026-11-15T09:00');
  const [endDate, setEndDate] = useState('2026-11-16T18:00');
  const [timezone, setTimezone] = useState('Africa/Johannesburg (GMT+2)');
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private' | 'invitation'>('public');
  const [selectedOrganizerId, setSelectedOrganizerId] = useState(existingOrganizers[0]?.id || 'org-nexora');
  const [capacityCap, setCapacityCap] = useState(500);
  const [ageRestriction, setAgeRestriction] = useState('All Ages');
  const [slug, setSlug] = useState('');

  // Stage 03: Programme, Agenda & Content
  const [description, setDescription] = useState(
    'Join Africa’s premier founders, investors, and ecosystem builders for two transformative days of keynotes, intimate masterclasses, venture roundtables, and high-impact networking.'
  );
  const [agenda, setAgenda] = useState<AgendaItem[]>([
    {
      id: 'ag-1',
      time: '09:00 - 10:15 AM',
      title: 'Opening Keynote: The Pan-African Sovereign Tech Infrastructure',
      description: 'Examining cross-border payment rails, digital identity, and regional cloud sovereignty.',
      speaker: 'Dr. Kwame Mensah',
      stage: 'Main Plenary Hall',
      track: 'Infrastructure',
    },
    {
      id: 'ag-2',
      time: '11:00 - 12:30 PM',
      title: 'Founder Roundtable: Scaling to Series B Across Emerging Markets',
      description: 'Navigating currency fluctuation, regulatory compliance, and multi-country hiring.',
      speaker: 'Amina Al-Mansoor',
      stage: 'Innovation Stage B',
      track: 'Venture',
    },
    {
      id: 'ag-3',
      time: '02:00 - 03:30 PM',
      title: 'Fintech Masterclass: Real-Time Payment Routing & Fraud Prevention',
      description: 'Architecture and settlement patterns across mobile money and instant EFT.',
      speaker: 'Sipho Dlamini',
      stage: 'Technical Workshop Room',
      track: 'Fintech',
    },
  ]);
  const [speakers, setSpeakers] = useState<Performer[]>([
    { name: 'Dr. Kwame Mensah', role: 'Partner & Chief Architect, Pan-African Labs' },
    { name: 'Amina Al-Mansoor', role: 'Founder & CEO, Serengeti Data Networks' },
    { name: 'Sipho Dlamini', role: 'Head of Settlement Infrastructure, Nexora Financial' },
  ]);
  const [sponsors, setSponsors] = useState<{ id: string; name: string; tier: string; logo?: string; url?: string }[]>([
    { id: 'sp-1', name: 'Standard Bank Group', tier: 'Headline Partner' },
    { id: 'sp-2', name: 'Google for Startups Africa', tier: 'Ecosystem Partner' },
    { id: 'sp-3', name: 'AWS Cloud Africa', tier: 'Technology Partner' },
  ]);
  const [faqs, setFaqs] = useState<{ id: string; question: string; answer: string }[]>([
    {
      id: 'faq-1',
      question: 'Will sessions be recorded for virtual pass holders?',
      answer: 'Yes, all keynote sessions and masterclasses will be available on-demand within 24 hours of streaming.',
    },
    {
      id: 'faq-2',
      question: 'What is the refund and ticket transfer policy?',
      answer: 'Tickets are fully transferable up to 48 hours prior to start. Full refunds are eligible up to 14 days before the event.',
    },
  ]);
  const [refundPolicy, setRefundPolicy] = useState(
    'Full refunds are granted up to 14 days before the event. Within 14 days, passes can be transferred to another attendee or credited toward future editions.'
  );

  // Stage 04: Visual Page Builder (Cover, Company Logo, Event Banner)
  const [coverImage, setCoverImage] = useState(techSummitImg);
  const [companyLogo, setCompanyLogo] = useState<string>('');
  const [eventBanner, setEventBanner] = useState<string>('');
  const [customBannerUrl, setCustomBannerUrl] = useState('');
  const [themePreset, setThemePreset] = useState<'onyx' | 'ivory' | 'ember' | 'slate'>('onyx');

  // Stage 05: Tickets & Inventory
  const [currency, setCurrency] = useState('ZAR');
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([
    {
      id: 'tier-1',
      eventId: 'draft',
      name: 'Early Bird Pass',
      description: 'Full two-day conference access, keynote recordings, and welcome networking reception.',
      priceMinor: 45000, // R 450.00
      currency: 'ZAR',
      capacity: 150,
      remaining: 150,
      minPerOrder: 1,
      maxPerOrder: 4,
      salesStart: '2026-10-01T00:00',
      salesEnd: '2026-10-31T23:59',
      status: 'active',
    },
    {
      id: 'tier-2',
      eventId: 'draft',
      name: 'General Admission',
      description: 'Standard access to all tracks, exhibition floor, workshops, and attendee directory.',
      priceMinor: 75000, // R 750.00
      currency: 'ZAR',
      capacity: 250,
      remaining: 250,
      minPerOrder: 1,
      maxPerOrder: 8,
      salesStart: '2026-10-15T00:00',
      salesEnd: '2026-11-15T08:00',
      status: 'active',
    },
    {
      id: 'tier-3',
      eventId: 'draft',
      name: 'VIP Executive & Investor Pass',
      description: 'VIP lounge access, reserved keynote front seating, private speaker dinner, and concierge check-in.',
      priceMinor: 180000, // R 1,800.00
      currency: 'ZAR',
      capacity: 100,
      remaining: 100,
      minPerOrder: 1,
      maxPerOrder: 4,
      salesStart: '2026-10-01T00:00',
      salesEnd: '2026-11-15T08:00',
      status: 'active',
    },
  ]);
  const [addOns, setAddOns] = useState<{ id: string; name: string; priceMinor: number; description: string }[]>([
    { id: 'ao-1', name: 'Reserved On-Site Parking Pass (2-Day)', priceMinor: 15000, description: 'Secure underground parking bay at Sandton Convention Centre' },
    { id: 'ao-2', name: 'Networking Gala Dinner Voucher', priceMinor: 60000, description: 'Exclusive 3-course dinner with speakers and sponsors' },
  ]);
  const [promoCodes, setPromoCodes] = useState<{ code: string; discountPct: number; maxUses: number }[]>([
    { code: 'EARLYVIP20', discountPct: 20, maxUses: 50 },
    { code: 'STUDENT50', discountPct: 50, maxUses: 30 },
  ]);

  // Stage 06: Attendee Experience
  const [customQuestions, setCustomQuestions] = useState<
    { id: string; label: string; type: 'text' | 'dropdown' | 'checkbox'; required: boolean; options?: string[] }[]
  >([
    { id: 'q-1', label: 'Organization / Company Name', type: 'text', required: true },
    { id: 'q-2', label: 'Primary Industry Track', type: 'dropdown', required: true, options: ['Fintech & Payments', 'Venture & Growth', 'Cloud & AI Infrastructure', 'Policy & Trade'] },
    { id: 'q-3', label: 'Dietary Preferences', type: 'dropdown', required: false, options: ['Standard', 'Vegetarian', 'Halaal', 'Vegan', 'Gluten Free'] },
  ]);
  const [ticketDeliveryNote, setTicketDeliveryNote] = useState(
    'Digital QR pass will be delivered via email and saved to your Nexora Pass wallet. Please present your pass at the expedited check-in gates upon arrival.'
  );

  // Stage 07: Payments & Payouts
  const [selectedRails, setSelectedRails] = useState<string[]>([
    'Instant EFT (South Africa)',
    'Capitec Pay',
    'Credit / Debit Card (Visa, Mastercard)',
    'M-Pesa (East Africa)',
  ]);
  const [payoutBank, setPayoutBank] = useState('First National Bank (FNB)');
  const [payoutAccountNumber, setPayoutAccountNumber] = useState('62891048291');
  const [payoutAccountHolder, setPayoutAccountHolder] = useState('Pan-African Innovation Ventures (Pty) Ltd');
  const [payoutBranchCode, setPayoutBranchCode] = useState('250655');

  // Stage 08: Marketing & SEO
  const [seoTitle, setSeoTitle] = useState('Pan-African Tech & Innovation Summit 2026 | Johannesburg');
  const [seoDescription, setSeoDescription] = useState('Africa’s premier summit bringing together 500+ founders, investors, and ecosystem builders in Sandton, Johannesburg.');
  const [shareCopyCopied, setShareCopyCopied] = useState<string | null>(null);

  // New item inputs
  const [newSpeakerName, setNewSpeakerName] = useState('');
  const [newSpeakerRole, setNewSpeakerRole] = useState('');
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [newAgendaTime, setNewAgendaTime] = useState('');
  const [newAgendaStage, setNewAgendaStage] = useState('');
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState(15);
  const [newQuestionLabel, setNewQuestionLabel] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'text' | 'dropdown' | 'checkbox'>('text');

  // Initial title setup
  useEffect(() => {
    if (!title) {
      if (duplicateFromEventId) {
        const found = existingEvents.find(e => e.id === duplicateFromEventId);
        if (found) {
          setTitle(`${found.title} (Copy)`);
          setShortSummary(found.shortSummary || '');
          setDescription(found.description);
          setCategory(found.category);
          setFormat(found.format);
          setVenueName(found.venue.name);
          setVenueAddress(found.venue.address);
          setVenueCity(found.venue.city);
          setVenueCountry(found.venue.country);
          setCoverImage(found.coverImage);
          setTicketTiers(found.tickets.map(t => ({ ...t, id: `tier-${Date.now()}-${Math.random().toString(36).substring(7)}`, remaining: t.capacity })));
        }
      } else if (initialTemplate) {
        applyTemplate(initialTemplate);
      } else {
        setTitle('Pan-African Tech & Innovation Summit 2026');
        setShortSummary('Two days of keynotes, masterclasses, and venture networking in Johannesburg.');
        setSlug('pan-african-tech-innovation-summit-2026');
      }
    }
  }, [duplicateFromEventId, initialTemplate]);

  // Sync slug with title
  useEffect(() => {
    if (title && !slug) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      );
    }
  }, [title]);

  // Autosave simulator
  useEffect(() => {
    setSaveStatus('unsaved');
    const timer = setTimeout(() => {
      setSaveStatus('saved');
      setLastSavedTime('Just now');
    }, 1200);
    return () => clearTimeout(timer);
  }, [
    title,
    description,
    venueName,
    startDate,
    endDate,
    ticketTiers,
    agenda,
    speakers,
    coverImage,
    payoutBank,
    payoutAccountNumber,
  ]);

  // Apply predefined templates
  const applyTemplate = (tmpl: string) => {
    if (tmpl === 'conference') {
      setTitle('Africa Fintech & Digital Assets Summit 2026');
      setShortSummary('The premier gathering of central bankers, fintech founders, and venture partners.');
      setCategory('Business & Summits');
      setFormat('hybrid');
      setVenueName('Cape Town International Convention Centre (CTICC)');
      setVenueAddress('1 Lower Long St, Cape Town');
      setVenueCity('Cape Town');
      setVenueCountry('South Africa');
      setCoverImage(techSummitImg);
      setCapacityCap(600);
      setTicketTiers([
        {
          id: 'tier-c1',
          eventId: 'draft',
          name: 'Virtual Broadcast Pass',
          description: 'Live interactive streaming, Q&A access, and on-demand replay library.',
          priceMinor: 25000, // R 250
          currency: 'ZAR',
          capacity: 500,
          remaining: 500,
          minPerOrder: 1,
          maxPerOrder: 10,
          salesStart: '2026-10-01T00:00',
          salesEnd: '2026-11-20T18:00',
          status: 'active',
        },
        {
          id: 'tier-c2',
          eventId: 'draft',
          name: 'Conference Delegate Pass',
          description: 'Access to main plenary, exhibition floor, daily catered lunch, and networking portal.',
          priceMinor: 95000, // R 950
          currency: 'ZAR',
          capacity: 400,
          remaining: 400,
          minPerOrder: 1,
          maxPerOrder: 6,
          salesStart: '2026-10-01T00:00',
          salesEnd: '2026-11-20T08:00',
          status: 'active',
        },
        {
          id: 'tier-c3',
          eventId: 'draft',
          name: 'Executive & VIP Pass',
          description: 'Priority keynote seating, VIP networking cocktail, private boardroom access.',
          priceMinor: 220000, // R 2,200
          currency: 'ZAR',
          capacity: 100,
          remaining: 100,
          minPerOrder: 1,
          maxPerOrder: 4,
          salesStart: '2026-10-01T00:00',
          salesEnd: '2026-11-20T08:00',
          status: 'active',
        },
      ]);
    } else if (tmpl === 'concert') {
      setTitle('Kigali Soundscape Live Festival 2026');
      setShortSummary('Celebrating Afro-electronic rhythms, Amapiano, and live vocalists in the heart of Kigali.');
      setCategory('Concerts & Music');
      setFormat('in_person');
      setVenueName('BK Arena Kigali');
      setVenueAddress('KG 17 Ave, Kigali');
      setVenueCity('Kigali');
      setVenueCountry('Rwanda');
      setCurrency('USD');
      setCoverImage(heroFestivalImg);
      setCapacityCap(3500);
      setTicketTiers([
        {
          id: 'tier-m1',
          eventId: 'draft',
          name: 'General Arena Entry',
          description: 'Access to main arena standing floor and beverage village.',
          priceMinor: 2500, // $25.00
          currency: 'USD',
          capacity: 2500,
          remaining: 2500,
          minPerOrder: 1,
          maxPerOrder: 6,
          salesStart: '2026-10-01T00:00',
          salesEnd: '2026-12-05T20:00',
          status: 'active',
        },
        {
          id: 'tier-m2',
          eventId: 'draft',
          name: 'Golden Circle VIP',
          description: 'Front stage golden circle zone, expedited entry gate, and commemorative wristband.',
          priceMinor: 6500, // $65.00
          currency: 'USD',
          capacity: 800,
          remaining: 800,
          minPerOrder: 1,
          maxPerOrder: 4,
          salesStart: '2026-10-01T00:00',
          salesEnd: '2026-12-05T20:00',
          status: 'active',
        },
        {
          id: 'tier-m3',
          eventId: 'draft',
          name: 'Artist Lounge & Table (Pack of 4)',
          description: 'Elevated VIP table, dedicated hostess service, and backstage access passes.',
          priceMinor: 35000, // $350.00
          currency: 'USD',
          capacity: 50,
          remaining: 50,
          minPerOrder: 1,
          maxPerOrder: 2,
          salesStart: '2026-10-01T00:00',
          salesEnd: '2026-12-05T18:00',
          status: 'active',
        },
      ]);
    } else if (tmpl === 'workshop') {
      setTitle('Hands-On Cloud Architecture & AI Infrastructure Workshop');
      setShortSummary('Intensive technical lab building resilient multi-cloud architectures for high throughput.');
      setCategory('Tech & Innovation');
      setFormat('in_person');
      setVenueName('The Foundry Co-Working Hub');
      setVenueAddress('Chiromo Road, Westlands');
      setVenueCity('Nairobi');
      setVenueCountry('Kenya');
      setCurrency('KES');
      setCoverImage(techSummitImg);
      setCapacityCap(80);
      setTicketTiers([
        {
          id: 'tier-w1',
          eventId: 'draft',
          name: 'Workshop Seat & Lab Access',
          description: 'Full day hands-on lab access, cloud compute credits, lunch, and course certification.',
          priceMinor: 1500000, // 15,000 KES
          currency: 'KES',
          capacity: 80,
          remaining: 80,
          minPerOrder: 1,
          maxPerOrder: 2,
          salesStart: '2026-10-01T00:00',
          salesEnd: '2026-11-10T12:00',
          status: 'active',
        },
      ]);
    } else if (tmpl === 'webinar') {
      setTitle('Cross-Border AfCFTA Trade Logistics: Legal & Tax Framework');
      setShortSummary('Strategic briefing on tariff harmonisation and supply chain routing under AfCFTA.');
      setCategory('Business & Summits');
      setFormat('online');
      setVirtualUrl('https://meet.nexora.events/afcfta-briefing-2026');
      setVenueName('Virtual Auditorium (Nexora Broadcast)');
      setVenueAddress('Online Live Stream');
      setVenueCity('Global');
      setVenueCountry('Pan-Africa');
      setCoverImage(artExhibitImg);
      setCapacityCap(1000);
      setTicketTiers([
        {
          id: 'tier-wb1',
          eventId: 'draft',
          name: 'Free Live Access',
          description: 'Live attendance to the briefing and public Q&A text chat.',
          priceMinor: 0,
          currency: 'ZAR',
          capacity: 800,
          remaining: 800,
          minPerOrder: 1,
          maxPerOrder: 1,
          salesStart: '2026-10-01T00:00',
          salesEnd: '2026-11-25T14:00',
          status: 'active',
        },
        {
          id: 'tier-wb2',
          eventId: 'draft',
          name: 'Executive Dossier & Replay Pass',
          description: 'Includes full unedited video recording, presentation decks, and legal compliance checklist.',
          priceMinor: 35000, // R 350
          currency: 'ZAR',
          capacity: 200,
          remaining: 200,
          minPerOrder: 1,
          maxPerOrder: 3,
          salesStart: '2026-10-01T00:00',
          salesEnd: '2026-11-25T14:00',
          status: 'active',
        },
      ]);
    }
  };

  // Run Smart Event Generator
  const handleRunGenerator = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setTitle('Southern Africa Digital Economy Summit 2026');
      setShortSummary('500 attendees exploring sovereign cloud, digital identity, and cross-border trade rails.');
      setCategory('Business & Summits');
      setFormat('hybrid');
      setVenueName('Sandton Convention Centre');
      setVenueAddress('161 Maude St, Sandton, Johannesburg');
      setVenueCity('Johannesburg');
      setVenueCountry('South Africa');
      setCoverImage(techSummitImg);
      setCapacityCap(500);
      setCurrency('ZAR');
      setTicketTiers([
        {
          id: `tier-gen-1`,
          eventId: 'draft',
          name: 'Early Bird Pass',
          description: 'Discounted two-day conference pass with access to all keynotes and exhibition stalls.',
          priceMinor: 35000,
          currency: 'ZAR',
          capacity: 150,
          remaining: 150,
          minPerOrder: 1,
          maxPerOrder: 4,
          salesStart: '2026-10-01T00:00',
          salesEnd: '2026-11-01T23:59',
          status: 'active',
        },
        {
          id: `tier-gen-2`,
          eventId: 'draft',
          name: 'General Admission',
          description: 'Full conference access, networking coffee breaks, and plenary breakout rooms.',
          priceMinor: 65000,
          currency: 'ZAR',
          capacity: 250,
          remaining: 250,
          minPerOrder: 1,
          maxPerOrder: 6,
          salesStart: '2026-10-01T00:00',
          salesEnd: '2026-11-20T08:00',
          status: 'active',
        },
        {
          id: `tier-gen-3`,
          eventId: 'draft',
          name: 'VIP Executive Pass',
          description: 'Front reserved seating, private speaker lounge access, and evening gala dinner.',
          priceMinor: 150000,
          currency: 'ZAR',
          capacity: 100,
          remaining: 100,
          minPerOrder: 1,
          maxPerOrder: 4,
          salesStart: '2026-10-01T00:00',
          salesEnd: '2026-11-20T08:00',
          status: 'active',
        },
      ]);
      setSeoTitle('Southern Africa Digital Economy Summit 2026 | Johannesburg');
      setSeoDescription('Join 500+ leaders in Sandton for Southern Africa’s premier digital economy summit.');
      setCurrentStage('identity');
    }, 800);
  };

  // Readiness Calculation
  const readinessChecks = useMemo(() => {
    return [
      { id: 'title', label: 'Event name & summary', passed: title.trim().length >= 4, weight: 15 },
      { id: 'venue', label: 'Venue or virtual link configured', passed: format === 'online' ? virtualUrl.trim().length > 5 : venueName.trim().length >= 3, weight: 10 },
      { id: 'dates', label: 'Valid dates & schedule window', passed: Boolean(startDate && endDate && startDate < endDate), weight: 10 },
      { id: 'tickets', label: 'At least one ticket tier created', passed: ticketTiers.length > 0, weight: 20 },
      { id: 'capacity', label: 'Overall capacity configured', passed: capacityCap > 0, weight: 10 },
      { id: 'cover', label: 'Cover banner artwork selected', passed: Boolean(coverImage), weight: 10 },
      { id: 'policies', label: 'Refund policy defined', passed: refundPolicy.trim().length >= 10, weight: 10 },
      { id: 'payouts', label: 'Payout bank account configured', passed: payoutAccountNumber.trim().length >= 5, weight: 15 },
    ];
  }, [title, format, virtualUrl, venueName, startDate, endDate, ticketTiers, capacityCap, coverImage, refundPolicy, payoutAccountNumber]);

  const readinessScore = useMemo(() => {
    return readinessChecks.reduce((acc, item) => (item.passed ? acc + item.weight : acc), 0);
  }, [readinessChecks]);

  // Financial calculations
  const totalTicketCapacity = useMemo(() => {
    return ticketTiers.reduce((acc, t) => acc + t.capacity, 0);
  }, [ticketTiers]);

  const totalGrossPotential = useMemo(() => {
    return ticketTiers.reduce((acc, t) => acc + (t.priceMinor * t.capacity), 0);
  }, [ticketTiers]);

  const platformFeeMinor = useMemo(() => {
    return Math.round(totalGrossPotential * 0.025); // 2.5% platform fee
  }, [totalGrossPotential]);

  const processingFeeMinor = useMemo(() => {
    return Math.round(totalGrossPotential * 0.015); // 1.5% local rails processing
  }, [totalGrossPotential]);

  const estimatedOrganizerProceedsMinor = useMemo(() => {
    return Math.max(0, totalGrossPotential - platformFeeMinor - processingFeeMinor);
  }, [totalGrossPotential, platformFeeMinor, processingFeeMinor]);

  // Ticket tier actions
  const handleAddTicketTier = () => {
    const newTier: TicketTier = {
      id: `tier-${Date.now()}`,
      eventId: 'draft',
      name: 'New Pass Tier',
      description: 'Admission tier details and perks description.',
      priceMinor: 25000,
      currency,
      capacity: 50,
      remaining: 50,
      minPerOrder: 1,
      maxPerOrder: 6,
      salesStart: startDate || new Date().toISOString(),
      salesEnd: endDate || new Date().toISOString(),
      status: 'active',
    };
    setTicketTiers(prev => [...prev, newTier]);
  };

  const handleUpdateTicketTier = (index: number, updates: Partial<TicketTier>) => {
    setTicketTiers(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const handleDeleteTicketTier = (index: number) => {
    setTicketTiers(prev => prev.filter((_, i) => i !== index));
  };

  // Add agenda session
  const handleAddAgendaItem = () => {
    if (!newAgendaTitle) return;
    setAgenda(prev => [
      ...prev,
      {
        id: `ag-${Date.now()}`,
        time: newAgendaTime || '10:00 - 11:00 AM',
        title: newAgendaTitle,
        stage: newAgendaStage || 'Main Stage',
      },
    ]);
    setNewAgendaTitle('');
    setNewAgendaTime('');
    setNewAgendaStage('');
  };

  // Add speaker
  const handleAddSpeaker = () => {
    if (!newSpeakerName) return;
    setSpeakers(prev => [
      ...prev,
      {
        name: newSpeakerName,
        role: newSpeakerRole || 'Guest Speaker',
      },
    ]);
    setNewSpeakerName('');
    setNewSpeakerRole('');
  };

  // Add FAQ
  const handleAddFaq = () => {
    if (!newFaqQuestion) return;
    setFaqs(prev => [
      ...prev,
      {
        id: `faq-${Date.now()}`,
        question: newFaqQuestion,
        answer: newFaqAnswer || 'Detailed answer provided by organizer.',
      },
    ]);
    setNewFaqQuestion('');
    setNewFaqAnswer('');
  };

  // Add Promo Code
  const handleAddPromoCode = () => {
    if (!newPromoCode) return;
    setPromoCodes(prev => [
      ...prev,
      {
        code: newPromoCode.toUpperCase().trim(),
        discountPct: newPromoDiscount,
        maxUses: 50,
      },
    ]);
    setNewPromoCode('');
  };

  // Add Custom Question
  const handleAddQuestion = () => {
    if (!newQuestionLabel) return;
    setCustomQuestions(prev => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        label: newQuestionLabel,
        type: newQuestionType,
        required: true,
        options: newQuestionType === 'dropdown' ? ['Option A', 'Option B', 'Option C'] : undefined,
      },
    ]);
    setNewQuestionLabel('');
  };

  // Navigation handlers
  const currentStageIndex = STAGES.findIndex(s => s.id === currentStage);
  const handleNextStage = () => {
    if (currentStageIndex < STAGES.length - 1) {
      setCurrentStage(STAGES[currentStageIndex + 1].id);
    }
  };
  const handlePrevStage = () => {
    if (currentStageIndex > 0) {
      setCurrentStage(STAGES[currentStageIndex - 1].id);
    }
  };

  // Final Publish Handler
  const handlePublish = (status: 'published' | 'draft' = 'published') => {
    const finalEvent = store.createEvent({
      slug: slug || `event-${Date.now()}`,
      title: title || 'Untitled Event',
      shortSummary: shortSummary || title,
      category,
      format,
      description,
      coverImage: customBannerUrl || coverImage,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      timezone,
      venue: {
        name: venueName,
        address: venueAddress,
        city: venueCity,
        country: venueCountry,
      },
      virtualUrl: format !== 'in_person' ? virtualUrl : undefined,
      organizer: {
        id: selectedOrganizerId,
        name: existingOrganizers.find(o => o.id === selectedOrganizerId)?.name || 'Nexora Verified Organizer',
        verified: true,
        rating: 4.9,
      },
      tickets: ticketTiers.map(t => ({
        ...t,
        eventId: 'pending',
        currency,
      })),
      status,
      featured: true,
      ageRestriction,
      refundPolicy,
      tags: [category, venueCity, venueCountry, 'Africa'],
      agenda,
      performers: speakers,
      currency,
      capacityCap,
      visibility,
      sponsors,
      faqs,
      customQuestions,
      themePreset,
      seoMetadata: {
        title: seoTitle,
        description: seoDescription,
        slug: slug,
      },
      payoutSettings: {
        bankName: payoutBank,
        accountNumber: payoutAccountNumber,
        currency,
        accountHolder: payoutAccountHolder,
      },
    });

    onEventCreated(finalEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0D14] text-white flex flex-col font-sans overflow-hidden">
      {/* ========================================================= */}
      {/* 1. TOP PERSISTENT WORKSPACE BAR (Apple + Notion Inspired) */}
      {/* ========================================================= */}
      <header className="h-16 border-b border-white/10 bg-[#0F141C]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Exit Studio"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-white/10 text-white font-bold border border-white/15">
              STUDIO
            </span>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <h1 className="text-sm font-bold truncate max-w-[140px] sm:max-w-xs md:max-w-md text-white">
              {title || 'Untitled Event'}
            </h1>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-white/50 font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saved' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span>{saveStatus === 'saved' ? `Saved ${lastSavedTime}` : 'Saving changes...'}</span>
          </div>
        </div>

        {/* Center / Right Control Hub */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Readiness Pill */}
          <div
            onClick={() => setRightPanelTab('readiness')}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border cursor-pointer transition-all ${
              readinessScore >= 80
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{readinessScore}% Ready</span>
          </div>

          {/* Device Preview Toggle */}
          <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => {
                setRightPanelTab('preview');
                setPreviewDevice('desktop');
              }}
              className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                rightPanelTab === 'preview' && previewDevice === 'desktop' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
              title="Desktop preview"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setRightPanelTab('preview');
                setPreviewDevice('mobile');
              }}
              className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                rightPanelTab === 'preview' && previewDevice === 'mobile' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
              title="Mobile phone preview"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => handlePublish('draft')}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-white/20 hover:bg-white/10 transition-colors cursor-pointer text-white/80 hover:text-white hidden sm:block"
          >
            Save Draft
          </button>

          <button
            onClick={() => handlePublish('published')}
            className="px-4 py-1.5 bg-white text-black font-bold text-xs rounded-lg hover:bg-white/90 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Live</span>
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN WORKSPACE CONTAINER (3-COLUMN NOTION/STRIPE LAYOUT) */}
      {/* ========================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* ------------------------------------------------------- */}
        {/* LEFT COLUMN: GUIDED WORKFLOW STAGES                     */}
        {/* ------------------------------------------------------- */}
        <aside className="w-64 border-r border-white/10 bg-[#0B0F17] flex flex-col shrink-0 overflow-y-auto hidden md:flex">
          <div className="p-4 border-b border-white/10">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block mb-1">
              SETUP WORKSPACE
            </span>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/70">Completed</span>
              <span className="font-mono font-bold text-white">
                {readinessScore >= 90 ? 'All Set' : `${Math.round(readinessScore / 11)} / 9 Stages`}
              </span>
            </div>
            {/* Progress line */}
            <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-300"
                style={{ width: `${readinessScore}%` }}
              />
            </div>
          </div>

          <nav className="p-2 space-y-1 flex-1">
            {STAGES.map(stage => {
              const isActive = currentStage === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => setCurrentStage(stage.id)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-3 ${
                    isActive
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-black text-white font-bold' : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {stage.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate leading-tight">{stage.title}</div>
                    <div
                      className={`text-[10px] truncate ${
                        isActive ? 'text-black/70' : 'text-white/40'
                      }`}
                    >
                      {stage.subtitle}
                    </div>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto shrink-0" />}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10 bg-white/2 text-[11px] text-white/50 space-y-1">
            <div className="flex items-center gap-1.5 text-white/70">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Africa-First Compliant</span>
            </div>
            <p className="text-[10px]">Autosave enabled across all sessions.</p>
          </div>
        </aside>

        {/* ------------------------------------------------------- */}
        {/* CENTER COLUMN: ACTIVE STAGE EDITING CANVAS              */}
        {/* ------------------------------------------------------- */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 max-w-4xl mx-auto w-full">
          {/* Mobile stage selector tabs */}
          <div className="md:hidden flex overflow-x-auto gap-2 pb-2 scrollbar-none border-b border-white/10">
            {STAGES.map(stage => (
              <button
                key={stage.id}
                onClick={() => setCurrentStage(stage.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 cursor-pointer ${
                  currentStage === stage.id ? 'bg-white text-black' : 'bg-white/10 text-white/70'
                }`}
              >
                {stage.number} {stage.title}
              </button>
            ))}
          </div>

          {/* ===================================================== */}
          {/* STAGE 01: START & CHOOSE CREATION METHOD              */}
          {/* ===================================================== */}
          {currentStage === 'start' && (
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-white/50 block mb-1">
                  STAGE 01
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">How would you like to start?</h2>
                <p className="text-xs sm:text-sm text-white/60">
                  Select a workflow to initialize your event structure in seconds.
                </p>
              </div>

              {/* Entry Mode Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Blank */}
                <div
                  onClick={() => {
                    setCreationMethod('blank');
                    setCurrentStage('identity');
                  }}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all hover:border-white/40 ${
                    creationMethod === 'blank' ? 'bg-white/10 border-white' : 'bg-[#111722] border-white/10'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Create from Scratch</h3>
                  <p className="text-xs text-white/60">
                    Start with a blank canvas and build every ticket tier, agenda item, and policy manually.
                  </p>
                </div>

                {/* 2. Smart Event Generator */}
                <div
                  onClick={() => setCreationMethod('generator')}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all hover:border-white/40 ${
                    creationMethod === 'generator' ? 'bg-white/10 border-white' : 'bg-[#111722] border-white/10'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Smart Event Generator</h3>
                  <p className="text-xs text-white/60">
                    Describe your event in plain language to instantly configure tickets, agenda, and draft copy.
                  </p>
                </div>

                {/* 3. Industry Template */}
                <div
                  onClick={() => setCreationMethod('template')}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all hover:border-white/40 ${
                    creationMethod === 'template' ? 'bg-white/10 border-white' : 'bg-[#111722] border-white/10'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                    <Layers className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Use a Template</h3>
                  <p className="text-xs text-white/60">
                    Pre-configured setups for Summits, Concerts, Workshops, Webinars, and Festivals.
                  </p>
                </div>

                {/* 4. Duplicate Event */}
                <div
                  onClick={() => setCreationMethod('duplicate')}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all hover:border-white/40 ${
                    creationMethod === 'duplicate' ? 'bg-white/10 border-white' : 'bg-[#111722] border-white/10'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                    <Copy className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Duplicate Past Event</h3>
                  <p className="text-xs text-white/60">
                    Clone settings, ticket tiers, registration questions, and branding from an existing event.
                  </p>
                </div>
              </div>

              {/* Mode Detail Container */}
              {creationMethod === 'generator' && (
                <div className="p-6 rounded-2xl bg-[#111722] border border-white/15 space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-white" />
                    <h4 className="text-sm font-bold">Natural Language Event Assistant</h4>
                  </div>
                  <p className="text-xs text-white/60">
                    Enter your requirements or pick one of the verified prompts below. Assumptions will be highlighted for your review.
                  </p>
                  <textarea
                    rows={3}
                    value={generatorPrompt}
                    onChange={e => setGeneratorPrompt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-hidden focus:border-white"
                  />
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Pan-African Tech Plenary in Sandton (500 cap)',
                      'Cape Town Sunset Afrobeats Festival (2,500 cap)',
                      'Nairobi Executive Cloud Architecture Masterclass',
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setGeneratorPrompt(`Create a ${p} with tiered tickets, agenda and mobile-money settlement.`)}
                        className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/15 text-white/80 cursor-pointer"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleRunGenerator}
                      disabled={isGenerating}
                      className="px-5 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 transition-all cursor-pointer flex items-center gap-2"
                    >
                      {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                      <span>{isGenerating ? 'Configuring Event...' : 'Generate Proposed Configuration'}</span>
                    </button>
                  </div>
                </div>
              )}

              {creationMethod === 'template' && (
                <div className="p-6 rounded-2xl bg-[#111722] border border-white/15 space-y-4">
                  <h4 className="text-sm font-bold">Select an Industry Template</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'conference', name: 'Conference & Summit', desc: 'Hybrid, multi-track agenda, VIP delegate passes' },
                      { id: 'concert', name: 'Concert & Music Festival', desc: 'Arena/field standing, VIP golden circle, table packages' },
                      { id: 'workshop', name: 'Executive Masterclass', desc: 'Intensive lab, limited capacity, lab materials add-on' },
                      { id: 'webinar', name: 'Virtual Global Webinar', desc: 'Free access, recorded replay pass, global live stream' },
                    ].map(tmpl => (
                      <div
                        key={tmpl.id}
                        onClick={() => {
                          applyTemplate(tmpl.id);
                          setCurrentStage('identity');
                        }}
                        className="p-3.5 rounded-xl border border-white/10 hover:border-white/40 bg-white/5 cursor-pointer transition-all"
                      >
                        <strong className="text-xs block text-white">{tmpl.name}</strong>
                        <span className="text-[11px] text-white/60">{tmpl.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {creationMethod === 'duplicate' && (
                <div className="p-6 rounded-2xl bg-[#111722] border border-white/15 space-y-4">
                  <h4 className="text-sm font-bold">Select Past Event to Clone</h4>
                  <div className="space-y-2">
                    {existingEvents.map(evt => (
                      <div
                        key={evt.id}
                        onClick={() => {
                          setTitle(`${evt.title} (2026 Edition)`);
                          setShortSummary(evt.shortSummary || '');
                          setDescription(evt.description);
                          setCategory(evt.category);
                          setFormat(evt.format);
                          setVenueName(evt.venue.name);
                          setVenueAddress(evt.venue.address);
                          setVenueCity(evt.venue.city);
                          setVenueCountry(evt.venue.country);
                          setCoverImage(evt.coverImage);
                          setTicketTiers(evt.tickets.map(t => ({ ...t, id: `tier-${Date.now()}-${Math.random().toString(36).substring(7)}`, remaining: t.capacity })));
                          setCurrentStage('identity');
                        }}
                        className="p-3 rounded-xl border border-white/10 hover:border-white/40 bg-white/5 flex items-center justify-between cursor-pointer transition-all"
                      >
                        <div>
                          <strong className="text-xs block text-white">{evt.title}</strong>
                          <span className="text-[10px] text-white/50">{evt.venue.name}, {evt.venue.city}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">
                          Clone Structure
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-white/10">
                <div />
                <button
                  onClick={() => setCurrentStage('identity')}
                  className="px-5 py-2.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Continue to Identity</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* STAGE 02: EVENT IDENTITY & BASIC INFORMATION          */}
          {/* ===================================================== */}
          {currentStage === 'identity' && (
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-white/50 block mb-1">
                  STAGE 02
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Event Identity & Basics</h2>
                <p className="text-xs sm:text-sm text-white/60">
                  Establish the authoritative titles, format, dates, venue, and public discoverability.
                </p>
              </div>

              {/* Title & Short Summary */}
              <div className="p-6 rounded-2xl bg-[#111722] border border-white/10 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-white">Event Name *</label>
                    <span className="text-[10px] font-mono text-white/40">{title.length} / 100 characters</span>
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Pan-African Tech & Innovation Summit 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-hidden focus:border-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1">Short Summary / Tagline</label>
                  <input
                    type="text"
                    value={shortSummary}
                    onChange={e => setShortSummary(e.target.value)}
                    placeholder="e.g. Two days of venture roundtables and founder masterclasses"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-hidden focus:border-white"
                  />
                </div>

                {/* Category & Format */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-white block mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as EventCategory)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-hidden focus:border-white cursor-pointer"
                    >
                      <option value="Tech & Innovation">Tech & Innovation</option>
                      <option value="Business & Summits">Business & Summits</option>
                      <option value="Concerts & Music">Concerts & Music</option>
                      <option value="Food & Wine">Food & Wine</option>
                      <option value="Arts & Culture">Arts & Culture</option>
                      <option value="Sports & Wellness">Sports & Wellness</option>
                      <option value="Faith & Community">Faith & Community</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-white block mb-1">Event Format *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'in_person', label: 'In-person' },
                        { id: 'online', label: 'Online' },
                        { id: 'hybrid', label: 'Hybrid' },
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFormat(f.id as EventFormat)}
                          className={`py-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                            format === f.id ? 'bg-white text-black border-white' : 'bg-black/40 border-white/15 text-white/70 hover:text-white'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Venue or Virtual Link */}
                {format !== 'online' ? (
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-white block mb-1">Venue Name *</label>
                        <input
                          type="text"
                          value={venueName}
                          onChange={e => setVenueName(e.target.value)}
                          placeholder="e.g. Sandton Convention Centre"
                          className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-hidden focus:border-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-white block mb-1">Address</label>
                        <input
                          type="text"
                          value={venueAddress}
                          onChange={e => setVenueAddress(e.target.value)}
                          placeholder="e.g. 161 Maude Street, Sandton"
                          className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-hidden focus:border-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-white block mb-1">City *</label>
                        <input
                          type="text"
                          value={venueCity}
                          onChange={e => setVenueCity(e.target.value)}
                          placeholder="e.g. Johannesburg"
                          className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-hidden focus:border-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-white block mb-1">Country *</label>
                        <input
                          type="text"
                          value={venueCountry}
                          onChange={e => setVenueCountry(e.target.value)}
                          placeholder="e.g. South Africa"
                          className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-hidden focus:border-white"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-white/10">
                    <label className="text-xs font-bold text-white block mb-1">Virtual Stream / Meeting URL *</label>
                    <input
                      type="url"
                      value={virtualUrl}
                      onChange={e => setVirtualUrl(e.target.value)}
                      placeholder="https://meet.nexora.events/stream/summit-2026"
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono focus:outline-hidden focus:border-white"
                    />
                  </div>
                )}

                {/* Dates & Times */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                  <div>
                    <label className="text-xs font-bold text-white block mb-1">Start Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono focus:outline-hidden focus:border-white cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white block mb-1">End Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono focus:outline-hidden focus:border-white cursor-pointer"
                    />
                  </div>
                </div>

                {/* Capacity & Timezone */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-white block mb-1">Overall Capacity Cap *</label>
                    <input
                      type="number"
                      value={capacityCap}
                      onChange={e => setCapacityCap(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono focus:outline-hidden focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white block mb-1">Time Zone</label>
                    <input
                      type="text"
                      value={timezone}
                      onChange={e => setTimezone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-hidden focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white block mb-1">Age Restriction</label>
                    <select
                      value={ageRestriction}
                      onChange={e => setAgeRestriction(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-hidden focus:border-white cursor-pointer"
                    >
                      <option value="All Ages">All Ages</option>
                      <option value="18+ Only">18+ Only</option>
                      <option value="21+ Only">21+ Only</option>
                      <option value="Family Friendly">Family Friendly</option>
                    </select>
                  </div>
                </div>

                {/* Organiser Profile & Visibility */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                  <div>
                    <label className="text-xs font-bold text-white block mb-1">Organiser Profile</label>
                    <select
                      value={selectedOrganizerId}
                      onChange={e => setSelectedOrganizerId(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-hidden focus:border-white cursor-pointer"
                    >
                      {existingOrganizers.map(o => (
                        <option key={o.id} value={o.id}>
                          {o.name} ({o.verificationStatus})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-white block mb-1">Visibility</label>
                    <select
                      value={visibility}
                      onChange={e => setVisibility(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-hidden focus:border-white cursor-pointer"
                    >
                      <option value="public">Public — Indexed on Nexora Marketplace</option>
                      <option value="unlisted">Unlisted — Accessible only via direct URL</option>
                      <option value="private">Private — Password protected</option>
                      <option value="invitation">Invitation Only — Whitelisted emails</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  onClick={handlePrevStage}
                  className="px-4 py-2 border border-white/20 text-xs font-bold rounded-xl cursor-pointer hover:bg-white/10"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStage}
                  className="px-5 py-2.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Continue to Programme</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* STAGE 03: PROGRAMME, AGENDA & CONTENT                 */}
          {/* ===================================================== */}
          {currentStage === 'programme' && (
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-white/50 block mb-1">
                  STAGE 03
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Programme & Event Content</h2>
                <p className="text-xs sm:text-sm text-white/60">
                  Add rich event descriptions, session agenda timelines, speaker profiles, and FAQs.
                </p>
              </div>

              {/* Event Description */}
              <div className="p-6 rounded-2xl bg-[#111722] border border-white/10 space-y-3">
                <label className="text-xs font-bold text-white block">Full Event Overview</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe your event, audience, key themes, and what attendees will experience..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-hidden focus:border-white leading-relaxed"
                />
              </div>

              {/* Agenda Builder */}
              <div className="p-6 rounded-2xl bg-[#111722] border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-white">Programme & Sessions Agenda</h3>
                    <p className="text-[11px] text-white/60">Publish time slots, tracks, and keynote stages</p>
                  </div>
                  <span className="text-xs font-mono text-white/40">{agenda.length} Sessions</span>
                </div>

                <div className="space-y-2">
                  {agenda.map((ag, idx) => (
                    <div
                      key={ag.id || idx}
                      className="p-3.5 rounded-xl bg-black/30 border border-white/10 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                            {ag.time}
                          </span>
                          <span className="text-[10px] text-white/50">{ag.stage}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white">{ag.title}</h4>
                        {ag.description && <p className="text-[11px] text-white/60">{ag.description}</p>}
                      </div>
                      <button
                        onClick={() => setAgenda(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1 text-white/40 hover:text-red-400 cursor-pointer"
                        title="Remove session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new session inline */}
                <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newAgendaTime}
                    onChange={e => setNewAgendaTime(e.target.value)}
                    placeholder="Time (e.g. 10:00 - 11:30 AM)"
                    className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={newAgendaStage}
                    onChange={e => setNewAgendaStage(e.target.value)}
                    placeholder="Stage / Room (e.g. Plenary Hall)"
                    className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAgendaTitle}
                      onChange={e => setNewAgendaTitle(e.target.value)}
                      placeholder="Session Title"
                      className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddAgendaItem}
                      className="px-3 py-2 bg-white/10 hover:bg-white text-white hover:text-black font-bold text-xs rounded-xl cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Speakers Directory */}
              <div className="p-6 rounded-2xl bg-[#111722] border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white">Speakers & Performers</h3>
                  <span className="text-xs font-mono text-white/40">{speakers.length} Featured</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {speakers.map((spk, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <strong className="text-xs block text-white">{spk.name}</strong>
                        <span className="text-[10px] text-white/60">{spk.role}</span>
                      </div>
                      <button
                        onClick={() => setSpeakers(prev => prev.filter((_, i) => i !== idx))}
                        className="text-white/40 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    value={newSpeakerName}
                    onChange={e => setNewSpeakerName(e.target.value)}
                    placeholder="Full Name"
                    className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={newSpeakerRole}
                    onChange={e => setNewSpeakerRole(e.target.value)}
                    placeholder="Role / Title"
                    className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                  />
                  <button
                    onClick={handleAddSpeaker}
                    className="px-4 py-2 bg-white/10 hover:bg-white text-white hover:text-black font-bold text-xs rounded-xl cursor-pointer transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* FAQs & Refund Policy */}
              <div className="p-6 rounded-2xl bg-[#111722] border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white">Frequently Asked Questions & Policy</h3>
                <div className="space-y-2">
                  {faqs.map((faq, idx) => (
                    <div key={faq.id || idx} className="p-3 rounded-xl bg-black/30 border border-white/10 space-y-1">
                      <div className="flex justify-between">
                        <strong className="text-xs text-white">{faq.question}</strong>
                        <button
                          onClick={() => setFaqs(prev => prev.filter((_, i) => i !== idx))}
                          className="text-white/40 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-white/60">{faq.answer}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 space-y-2">
                  <input
                    type="text"
                    value={newFaqQuestion}
                    onChange={e => setNewFaqQuestion(e.target.value)}
                    placeholder="Question (e.g. What parking is available?)"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFaqAnswer}
                      onChange={e => setNewFaqAnswer(e.target.value)}
                      placeholder="Answer"
                      className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                    />
                    <button
                      onClick={handleAddFaq}
                      className="px-4 py-2 bg-white/10 hover:bg-white text-white hover:text-black font-bold text-xs rounded-xl cursor-pointer transition-colors"
                    >
                      Add FAQ
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <label className="text-xs font-bold text-white block mb-1">Official Refund & Transfer Terms *</label>
                  <textarea
                    rows={2}
                    value={refundPolicy}
                    onChange={e => setRefundPolicy(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  onClick={handlePrevStage}
                  className="px-4 py-2 border border-white/20 text-xs font-bold rounded-xl cursor-pointer hover:bg-white/10"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStage}
                  className="px-5 py-2.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Continue to Visual Builder</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* STAGE 04: VISUAL EVENT PAGE BUILDER                   */}
          {/* ===================================================== */}
          {currentStage === 'visuals' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-white/50 block mb-1">
                  STAGE 04 • VISUAL BUILDER
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Visual Page Builder & Artwork Assets</h2>
                <p className="text-xs sm:text-sm text-white/60">
                  Upload your primary Event Cover image, Company Logo, and Event Banner, or choose from high-resolution curated presets.
                </p>
              </div>

              {/* Upload Grid: 3 Dedicated Asset Uploaders */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. EVENT COVER IMAGE (Square / Listing Thumbnail) */}
                <div className="p-6 rounded-2xl bg-[#0D0D11] border border-white/15 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white block">Event Cover Image *</label>
                      <span className="text-[10px] font-mono text-white/50 px-2 py-0.5 rounded border border-white/10">1:1 Square</span>
                    </div>
                    <p className="text-[11px] text-white/60">
                      Primary promotional image displayed on discovery cards, social share cards, and mobile wallets.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="relative aspect-video sm:aspect-square rounded-xl overflow-hidden border border-white/20 bg-black/50 group">
                      <img
                        src={coverImage}
                        alt="Event Cover Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-center">
                        <label className="px-3.5 py-1.5 bg-white text-black font-bold text-xs rounded-lg cursor-pointer hover:bg-neutral-200 transition-all">
                          <span>Replace Cover</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    setCoverImage(event.target.result as string);
                                    setCustomBannerUrl('');
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <label className="w-full py-2.5 px-3 border border-white/20 hover:border-white/50 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-center block cursor-pointer transition-all">
                      <span>Upload Cover Image (PNG/JPG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setCoverImage(event.target.result as string);
                                setCustomBannerUrl('');
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* 2. COMPANY / BRAND LOGO */}
                <div className="p-6 rounded-2xl bg-[#0D0D11] border border-white/15 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white block">Company / Organizer Logo</label>
                      <span className="text-[10px] font-mono text-white/50 px-2 py-0.5 rounded border border-white/10">Badge</span>
                    </div>
                    <p className="text-[11px] text-white/60">
                      High-contrast brand mark shown next to event verification seals and organizer accreditation.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="aspect-video sm:aspect-square rounded-xl overflow-hidden border border-white/20 bg-black/50 flex items-center justify-center p-4">
                      {companyLogo ? (
                        <div className="relative w-full h-full flex items-center justify-center group">
                          <img
                            src={companyLogo}
                            alt="Company Logo Preview"
                            className="max-h-full max-w-full object-contain"
                          />
                          <button
                            onClick={() => setCompanyLogo('')}
                            className="absolute top-1 right-1 p-1 bg-black/80 rounded-md text-white/70 hover:text-white"
                            title="Remove logo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center space-y-2">
                          <div className="w-12 h-12 rounded-xl bg-white/10 mx-auto flex items-center justify-center font-black text-sm text-white font-mono">
                            NX
                          </div>
                          <span className="text-[11px] text-white/50 block">No Custom Logo Uploaded</span>
                        </div>
                      )}
                    </div>

                    <label className="w-full py-2.5 px-3 border border-white/20 hover:border-white/50 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-center block cursor-pointer transition-all">
                      <span>{companyLogo ? 'Replace Company Logo' : 'Upload Company Logo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setCompanyLogo(event.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* 3. EVENT WIDE BANNER ARTWORK */}
                <div className="p-6 rounded-2xl bg-[#0D0D11] border border-white/15 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white block">Event Banner Artwork</label>
                      <span className="text-[10px] font-mono text-white/50 px-2 py-0.5 rounded border border-white/10">16:9 Landscape</span>
                    </div>
                    <p className="text-[11px] text-white/60">
                      Panoramic hero backdrop rendered at the top of the standalone event landing webpage.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="aspect-video sm:aspect-square rounded-xl overflow-hidden border border-white/20 bg-black/50 relative group">
                      <img
                        src={eventBanner || coverImage}
                        alt="Event Banner Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-center">
                        <label className="px-3.5 py-1.5 bg-white text-black font-bold text-xs rounded-lg cursor-pointer hover:bg-neutral-200 transition-all">
                          <span>Replace Banner</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    setEventBanner(event.target.result as string);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <label className="w-full py-2.5 px-3 border border-white/20 hover:border-white/50 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-center block cursor-pointer transition-all">
                      <span>{eventBanner ? 'Replace Event Banner' : 'Upload Event Banner'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setEventBanner(event.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

              </div>

              {/* Artwork Curated Gallery Presets */}
              <div className="p-6 rounded-2xl bg-[#0D0D11] border border-white/15 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white block">Or Choose Curated Pan-African Presets</label>
                  <span className="text-[10px] font-mono text-white/50">High-Res Photographed Assets</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_ARTWORKS.map((art, idx) => {
                    const isSelected = coverImage === art.img && !customBannerUrl;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setCoverImage(art.img);
                          setCustomBannerUrl('');
                        }}
                        className={`p-2 rounded-xl border cursor-pointer transition-all ${
                          isSelected ? 'border-white bg-white/10 ring-2 ring-white/50' : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <img src={art.img} alt={art.label} className="w-full h-24 object-cover rounded-lg mb-2" />
                        <span className="text-[11px] font-bold block truncate text-white">{art.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-white/10">
                  <label className="text-[11px] text-white/60 block mb-1">Or paste a remote image CDN URL:</label>
                  <input
                    type="url"
                    value={customBannerUrl}
                    onChange={e => {
                      setCustomBannerUrl(e.target.value);
                      if (e.target.value) {
                        setCoverImage(e.target.value);
                      }
                    }}
                    placeholder="https://images.unsplash.com/photo-example..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {/* Theme Presets */}
              <div className="p-6 rounded-2xl bg-[#0D0D11] border border-white/15 space-y-4">
                <h3 className="text-sm font-bold text-white">Event Page Visual Theme Preset</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'onyx', name: 'Monochrome Onyx', desc: 'Ultra-clean high contrast' },
                    { id: 'ivory', name: 'Minimalist Ivory', desc: 'Editorial soft lighting' },
                    { id: 'ember', name: 'Festival Ember', desc: 'Warm African golden amber' },
                    { id: 'slate', name: 'Tech Slate', desc: 'Sharp architectural blueprint' },
                  ].map(t => (
                    <div
                      key={t.id}
                      onClick={() => setThemePreset(t.id as any)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        themePreset === t.id ? 'border-white bg-white/10 ring-1 ring-white/50' : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <strong className="text-xs block text-white">{t.name}</strong>
                      <span className="text-[10px] text-white/50">{t.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  onClick={handlePrevStage}
                  className="px-5 py-2.5 border border-white/20 text-xs font-bold rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStage}
                  className="px-6 py-2.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-neutral-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg"
                >
                  <span>Continue to Tickets</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
          {/* ===================================================== */}
          {/* STAGE 05: TICKETS & INVENTORY ENGINE                  */}
          {/* ===================================================== */}
          {currentStage === 'tickets' && (
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-white/50 block mb-1">
                  STAGE 05
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Ticketing & Inventory Engine</h2>
                <p className="text-xs sm:text-sm text-white/60">
                  Configure admission tiers, sales windows, quantities, capacity limits, add-ons, and promo codes.
                </p>
              </div>

              {/* Currency Selector */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#111722] border border-white/10">
                <div>
                  <strong className="text-xs text-white block">Settlement Currency</strong>
                  <span className="text-[11px] text-white/50">Base currency for orders, payouts, and checkout</span>
                </div>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-black border border-white/20 text-xs font-mono font-bold text-white cursor-pointer"
                >
                  <option value="ZAR">ZAR (South African Rand - R)</option>
                  <option value="USD">USD (US Dollar - $)</option>
                  <option value="KES">KES (Kenyan Shilling - KSh)</option>
                  <option value="NGN">NGN (Nigerian Naira - ₦)</option>
                  <option value="GHS">GHS (Ghanaian Cedi - GH₵)</option>
                  <option value="EUR">EUR (Euro - €)</option>
                </select>
              </div>

              {/* Ticket Tiers List */}
              <div className="p-6 rounded-2xl bg-[#111722] border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-white">Admittance Tiers</h3>
                    <p className="text-[11px] text-white/50">Total allocation: {totalTicketCapacity} / {capacityCap} capacity</p>
                  </div>
                  <button
                    onClick={handleAddTicketTier}
                    className="px-3.5 py-1.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Tier</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {ticketTiers.map((tier, idx) => (
                    <div
                      key={tier.id || idx}
                      className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-white/50 uppercase font-mono block mb-1">Tier Name</label>
                          <input
                            type="text"
                            value={tier.name}
                            onChange={e => handleUpdateTicketTier(idx, { name: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/50 uppercase font-mono block mb-1">Price ({currency})</label>
                          <input
                            type="number"
                            step="1"
                            value={tier.priceMinor / 100}
                            onChange={e => handleUpdateTicketTier(idx, { priceMinor: Math.round(Number(e.target.value) * 100) })}
                            className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/50 uppercase font-mono block mb-1">Quantity</label>
                          <input
                            type="number"
                            value={tier.capacity}
                            onChange={e => handleUpdateTicketTier(idx, { capacity: Number(e.target.value), remaining: Number(e.target.value) })}
                            className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs text-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={tier.description}
                          onChange={e => handleUpdateTicketTier(idx, { description: e.target.value })}
                          placeholder="Tier benefits and inclusions description..."
                          className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs text-white/80"
                        />
                        <button
                          onClick={() => handleDeleteTicketTier(idx)}
                          className="p-1.5 text-white/40 hover:text-red-400 cursor-pointer"
                          title="Delete tier"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add-ons and Merchandise */}
              <div className="p-6 rounded-2xl bg-[#111722] border border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white">Event Add-Ons (Parking, Meals & Merch)</h3>
                  <span className="text-xs font-mono text-white/40">{addOns.length} Active</span>
                </div>
                <div className="space-y-2">
                  {addOns.map((ao, idx) => (
                    <div key={ao.id} className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between">
                      <div>
                        <strong className="text-xs text-white block">{ao.name}</strong>
                        <span className="text-[11px] text-white/50">{ao.description}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-white">
                          {currency} {(ao.priceMinor / 100).toFixed(2)}
                        </span>
                        <button
                          onClick={() => setAddOns(prev => prev.filter((_, i) => i !== idx))}
                          className="text-white/40 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Promo & Discount Codes */}
              <div className="p-6 rounded-2xl bg-[#111722] border border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-white">Promo Codes & Discounts</h3>
                <div className="flex flex-wrap gap-2">
                  {promoCodes.map((p, idx) => (
                    <div key={idx} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{p.code}</span>
                      <span className="text-[11px] text-emerald-400 font-mono">({p.discountPct}% OFF)</span>
                      <button
                        onClick={() => setPromoCodes(prev => prev.filter((_, i) => i !== idx))}
                        className="text-white/40 hover:text-white cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    value={newPromoCode}
                    onChange={e => setNewPromoCode(e.target.value)}
                    placeholder="NEW CODE (e.g. FLASH25)"
                    className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white uppercase font-mono"
                  />
                  <input
                    type="number"
                    value={newPromoDiscount}
                    onChange={e => setNewPromoDiscount(Number(e.target.value))}
                    placeholder="Discount %"
                    className="w-24 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono"
                  />
                  <button
                    onClick={handleAddPromoCode}
                    className="px-4 py-2 bg-white/10 hover:bg-white text-white hover:text-black font-bold text-xs rounded-xl cursor-pointer transition-colors"
                  >
                    Add Code
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  onClick={handlePrevStage}
                  className="px-4 py-2 border border-white/20 text-xs font-bold rounded-xl cursor-pointer hover:bg-white/10"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStage}
                  className="px-5 py-2.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Continue to Registration</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* STAGE 06: REGISTRATION & ATTENDEE EXPERIENCE          */}
          {/* ===================================================== */}
          {currentStage === 'attendees' && (
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-white/50 block mb-1">
                  STAGE 06
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Registration & Attendee Experience</h2>
                <p className="text-xs sm:text-sm text-white/60">
                  Build custom intake questions, set attendee badge preferences, and configure digital pass delivery.
                </p>
              </div>

              {/* Custom Questions Builder */}
              <div className="p-6 rounded-2xl bg-[#111722] border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white">Checkout Questionnaire</h3>
                  <span className="text-xs font-mono text-white/40">{customQuestions.length} Questions</span>
                </div>

                <div className="space-y-2">
                  {customQuestions.map((q, idx) => (
                    <div key={q.id} className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between">
                      <div>
                        <strong className="text-xs text-white block">{q.label}</strong>
                        <span className="text-[10px] text-white/50 font-mono capitalize">
                          Type: {q.type} · {q.required ? 'Mandatory' : 'Optional'}
                        </span>
                      </div>
                      <button
                        onClick={() => setCustomQuestions(prev => prev.filter((_, i) => i !== idx))}
                        className="text-white/40 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    value={newQuestionLabel}
                    onChange={e => setNewQuestionLabel(e.target.value)}
                    placeholder="Question (e.g. T-Shirt Size, Dietary Allergy)"
                    className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                  />
                  <select
                    value={newQuestionType}
                    onChange={e => setNewQuestionType(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white cursor-pointer"
                  >
                    <option value="text">Text input</option>
                    <option value="dropdown">Dropdown select</option>
                    <option value="checkbox">Consent checkbox</option>
                  </select>
                  <button
                    onClick={handleAddQuestion}
                    className="px-4 py-2 bg-white/10 hover:bg-white text-white hover:text-black font-bold text-xs rounded-xl cursor-pointer transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Digital Pass Instructions */}
              <div className="p-6 rounded-2xl bg-[#111722] border border-white/10 space-y-3">
                <label className="text-xs font-bold text-white block">Post-Purchase Attendee Instructions</label>
                <textarea
                  rows={3}
                  value={ticketDeliveryNote}
                  onChange={e => setTicketDeliveryNote(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                />
                <p className="text-[11px] text-white/50">
                  Included in order confirmation emails and on digital ticket pass screens.
                </p>
              </div>

              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  onClick={handlePrevStage}
                  className="px-4 py-2 border border-white/20 text-xs font-bold rounded-xl cursor-pointer hover:bg-white/10"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStage}
                  className="px-5 py-2.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Continue to Payments</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* STAGE 07: PAYMENTS, FEES & FINANCIAL CONTROLS         */}
          {/* ===================================================== */}
          {currentStage === 'payments' && (
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-white/50 block mb-1">
                  STAGE 07
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Payments, Fees & Compliance</h2>
                <p className="text-xs sm:text-sm text-white/60">
                  Configure Africa-first payment rails, settlement accounts, and view transparent financial fee breakdowns.
                </p>
              </div>

              {/* Africa-first Payment Rails */}
              <div className="p-6 rounded-2xl bg-[#111722] border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white">Active Payment Rails for Checkout</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Instant EFT (South Africa)',
                    'Capitec Pay',
                    'Credit / Debit Card (Visa, Mastercard)',
                    'M-Pesa (East Africa)',
                    'Flutterwave / Paystack Bank Transfer',
                  ].map(rail => {
                    const isSelected = selectedRails.includes(rail);
                    return (
                      <div
                        key={rail}
                        onClick={() => {
                          setSelectedRails(prev =>
                            isSelected ? prev.filter(r => r !== rail) : [...prev, rail]
                          );
                        }}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                          isSelected ? 'bg-white/10 border-white' : 'bg-black/30 border-white/10'
                        }`}
                      >
                        <span className="text-xs text-white font-medium">{rail}</span>
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isSelected ? 'bg-white text-black border-white' : 'border-white/30'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bank Payout Account */}
              <div className="p-6 rounded-2xl bg-[#111722] border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white">Settlement Payout Account *</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-white block mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={payoutBank}
                      onChange={e => setPayoutBank(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white block mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={payoutAccountHolder}
                      onChange={e => setPayoutAccountHolder(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white block mb-1">Account Number *</label>
                    <input
                      type="text"
                      value={payoutAccountNumber}
                      onChange={e => setPayoutAccountNumber(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white block mb-1">Branch Code</label>
                    <input
                      type="text"
                      value={payoutBranchCode}
                      onChange={e => setPayoutBranchCode(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Stripe-style Financial Ledger Summary */}
              <div className="p-6 rounded-2xl bg-[#111722] border border-white/10 space-y-4 font-mono text-xs">
                <h3 className="text-sm font-bold text-white font-sans">Live Financial Transparency Breakdown</h3>
                <div className="space-y-2 text-white/70">
                  <div className="flex justify-between">
                    <span>Projected Gross Sales (at 100% cap):</span>
                    <strong className="text-white">{currency} {(totalGrossPotential / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Nexora Platform Fee (2.5%):</span>
                    <span className="text-red-400">- {currency} {(platformFeeMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Local Gateway Processing Fee (~1.5%):</span>
                    <span className="text-red-400">- {currency} {(processingFeeMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold text-white font-sans">
                    <span>Estimated Net Organiser Payout:</span>
                    <span className="text-emerald-400 font-mono">{currency} {(estimatedOrganizerProceedsMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  onClick={handlePrevStage}
                  className="px-4 py-2 border border-white/20 text-xs font-bold rounded-xl cursor-pointer hover:bg-white/10"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStage}
                  className="px-5 py-2.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Continue to Marketing & SEO</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* STAGE 08: MARKETING & DISCOVERY                       */}
          {/* ===================================================== */}
          {currentStage === 'marketing' && (
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-white/50 block mb-1">
                  STAGE 08
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Marketing, Discovery & SEO</h2>
                <p className="text-xs sm:text-sm text-white/60">
                  Search engine metadata, copyable invite links, and pre-generated social announcement copy.
                </p>
              </div>

              {/* SEO Controls */}
              <div className="p-6 rounded-2xl bg-[#111722] border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white">Search Engine Discovery (SEO)</h3>
                <div>
                  <label className="text-xs font-bold text-white block mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={e => setSeoTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white block mb-1">SEO Description</label>
                  <textarea
                    rows={2}
                    value={seoDescription}
                    onChange={e => setSeoDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white block mb-1">Readable URL Slug</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40 font-mono">nexora.events/e/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={e => setSlug(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Promotional Copy Generator */}
              <div className="p-6 rounded-2xl bg-[#111722] border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white">Pre-Generated Campaign Copy</h3>
                <div className="space-y-3">
                  {[
                    {
                      channel: 'WhatsApp & SMS Broadcast',
                      copy: `Tickets are now officially live for ${title || 'our upcoming event'} in ${venueCity}! Join founders, executives, and leaders. Reserve your pass: https://nexora.events/e/${slug || 'tickets'}`,
                    },
                    {
                      channel: 'Email Newsletter Announcement',
                      copy: `Subject: Announcement: ${title} is happening in ${venueCity}!\n\nWe are excited to unveil our schedule and speaker lineup for ${title}. Early bird tiers are strictly limited. Register today at https://nexora.events/e/${slug || 'tickets'}.`,
                    },
                    {
                      channel: 'Twitter / X / LinkedIn Post',
                      copy: `Excited to announce ${title}! 2 days of sovereign technology, venture keynotes, and masterclasses in ${venueCity}. Passes live now on @NexoraEvents: https://nexora.events/e/${slug || 'tickets'}`,
                    },
                  ].map((cmp, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-2">
                      <div className="flex justify-between items-center">
                        <strong className="text-xs text-white">{cmp.channel}</strong>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(cmp.copy);
                            setShareCopyCopied(cmp.channel);
                            setTimeout(() => setShareCopyCopied(null), 2500);
                          }}
                          className="px-2.5 py-1 text-[11px] rounded bg-white/10 hover:bg-white text-white hover:text-black font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{shareCopyCopied === cmp.channel ? 'Copied' : 'Copy Text'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-white/70 font-mono whitespace-pre-line leading-relaxed">
                        {cmp.copy}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  onClick={handlePrevStage}
                  className="px-4 py-2 border border-white/20 text-xs font-bold rounded-xl cursor-pointer hover:bg-white/10"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStage}
                  className="px-5 py-2.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Continue to Review & Publish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* STAGE 09: REVIEW, VALIDATE & PUBLISH                  */}
          {/* ===================================================== */}
          {currentStage === 'review' && (
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-white/50 block mb-1">
                  STAGE 09
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Event Readiness Centre</h2>
                <p className="text-xs sm:text-sm text-white/60">
                  Perform pre-publication validation, inspect checklist readiness, and deploy live to the marketplace.
                </p>
              </div>

              {/* Readiness Score Banner */}
              <div className="p-6 rounded-2xl bg-[#111722] border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-bold font-mono text-white">{readinessScore}%</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white font-mono">
                      {readinessScore >= 80 ? 'Production Ready' : 'Items Incomplete'}
                    </span>
                  </div>
                  <p className="text-xs text-white/60">
                    {readinessScore >= 80
                      ? 'All mandatory requirements satisfied. Ready for immediate marketplace discovery.'
                      : 'Resolve the missing essential items below before going live.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePublish('draft')}
                    className="px-4 py-2 text-xs font-bold rounded-xl border border-white/20 hover:bg-white/10 text-white cursor-pointer"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={() => handlePublish('published')}
                    className="px-5 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 transition-all cursor-pointer shadow-lg flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Event Live</span>
                  </button>
                </div>
              </div>

              {/* Validation Checklist Items */}
              <div className="p-6 rounded-2xl bg-[#111722] border border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-white">Pre-Publication Audit Checklist</h3>
                <div className="space-y-2">
                  {readinessChecks.map(item => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            item.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {item.passed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        </div>
                        <span className="text-xs text-white font-medium">{item.label}</span>
                      </div>
                      <span className={`text-[11px] font-mono ${item.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                        {item.passed ? 'Complete' : 'Needs Review'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Summary Card */}
              <div className="p-6 rounded-2xl bg-[#111722] border border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-white">Event Architecture Snapshot</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-[10px] text-white/50 block font-mono">TICKETS</span>
                    <strong className="text-white block mt-0.5">{ticketTiers.length} Active Tiers</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-[10px] text-white/50 block font-mono">CAPACITY</span>
                    <strong className="text-white block mt-0.5">{capacityCap} Attendees</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-[10px] text-white/50 block font-mono">FORMAT</span>
                    <strong className="text-white block mt-0.5 capitalize">{format.replace('_', ' ')}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-[10px] text-white/50 block font-mono">CURRENCY</span>
                    <strong className="text-white block mt-0.5">{currency}</strong>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  onClick={handlePrevStage}
                  className="px-4 py-2 border border-white/20 text-xs font-bold rounded-xl cursor-pointer hover:bg-white/10"
                >
                  Back
                </button>
                <button
                  onClick={() => handlePublish('published')}
                  className="px-6 py-2.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 transition-all cursor-pointer shadow-xl flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Deploy to Marketplace Now</span>
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ------------------------------------------------------- */}
        {/* RIGHT COLUMN: INTERACTIVE DEVICE PREVIEW & READINESS    */}
        {/* ------------------------------------------------------- */}
        <aside className="w-80 lg:w-96 border-l border-white/10 bg-[#0B0F17] flex flex-col shrink-0 overflow-y-auto hidden xl:flex">
          {/* Panel Header Tabs */}
          <div className="p-3 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setRightPanelTab('preview')}
                className={`px-3 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                  rightPanelTab === 'preview' ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                Live Preview
              </button>
              <button
                onClick={() => setRightPanelTab('readiness')}
                className={`px-3 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                  rightPanelTab === 'readiness' ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                Readiness
              </button>
              <button
                onClick={() => setRightPanelTab('ledger')}
                className={`px-3 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                  rightPanelTab === 'ledger' ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                Ledger
              </button>
            </div>

            {rightPanelTab === 'preview' && (
              <div className="flex items-center gap-1 text-white/50">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded cursor-pointer ${previewDevice === 'desktop' ? 'text-white' : 'hover:text-white'}`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded cursor-pointer ${previewDevice === 'mobile' ? 'text-white' : 'hover:text-white'}`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Panel Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {/* 1. Live Preview Tab */}
            {rightPanelTab === 'preview' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[11px] text-white/50 font-mono">
                  <span>REAL-TIME SIMULATION</span>
                  <span>{previewDevice.toUpperCase()}</span>
                </div>

                {/* Device Wrapper */}
                <div
                  className={`mx-auto rounded-2xl border border-white/20 overflow-hidden bg-black shadow-2xl transition-all ${
                    previewDevice === 'mobile' ? 'max-w-[280px] ring-4 ring-neutral-800' : 'w-full'
                  }`}
                >
                  {/* Mock mobile top indicator */}
                  {previewDevice === 'mobile' && (
                    <div className="h-4 bg-neutral-900 flex items-center justify-center">
                      <div className="w-12 h-1 rounded-full bg-white/20" />
                    </div>
                  )}

                  {/* Event Page Simulation Canvas */}
                  <div className="p-3 bg-[#0A0D14] space-y-3">
                    {/* Hero Artwork */}
                    <div className="relative rounded-xl overflow-hidden aspect-video bg-neutral-900">
                      <img
                        src={customBannerUrl || coverImage}
                        alt="Preview Hero"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 text-[9px] font-mono px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-white font-bold uppercase">
                        {category}
                      </span>
                    </div>

                    {/* Title & Metadata */}
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight">
                        {title || 'Untitled Event'}
                      </h4>
                      <p className="text-[10px] text-white/60 line-clamp-2 mt-0.5">
                        {shortSummary || description}
                      </p>
                    </div>

                    {/* Venue & Date */}
                    <div className="space-y-1 text-[10px] text-white/70 border-y border-white/10 py-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-white/50 shrink-0" />
                        <span className="truncate">
                          {startDate ? new Date(startDate).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date Pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-white/50 shrink-0" />
                        <span className="truncate">
                          {format === 'online' ? 'Online Live Stream' : `${venueName}, ${venueCity}`}
                        </span>
                      </div>
                    </div>

                    {/* Ticket Tiers Preview */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-white/50 uppercase block">Available Tickets</span>
                      {ticketTiers.slice(0, 2).map((tier, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-[10px]">
                          <div>
                            <strong className="text-white block">{tier.name}</strong>
                            <span className="text-white/50">{tier.capacity} passes</span>
                          </div>
                          <span className="font-mono font-bold text-white">
                            {currency} {(tier.priceMinor / 100).toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Primary CTA */}
                    <button className="w-full py-2 bg-white text-black font-bold text-xs rounded-lg text-center cursor-pointer shadow-md">
                      Get Tickets · From {currency} {(ticketTiers[0]?.priceMinor / 100 || 0).toFixed(0)}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Readiness Audit Tab */}
            {rightPanelTab === 'readiness' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className="text-3xl font-mono font-bold text-white mb-1">{readinessScore}%</div>
                  <span className="text-xs text-white/60">Launch Readiness Score</span>
                </div>

                <div className="space-y-2">
                  {readinessChecks.map(item => (
                    <div key={item.id} className="p-2.5 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between text-xs">
                      <span className="text-white/80">{item.label}</span>
                      <span className={`font-mono text-[10px] ${item.passed ? 'text-emerald-400 font-bold' : 'text-amber-400'}`}>
                        {item.passed ? '+ ' + item.weight + '%' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Ledger Preview Tab */}
            {rightPanelTab === 'ledger' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 font-mono text-xs space-y-2">
                  <span className="text-[10px] text-white/50 uppercase block font-sans font-bold">Estimated Proceeds</span>
                  <div className="text-xl font-bold text-emerald-400">
                    {currency} {(estimatedOrganizerProceedsMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-white/50 font-sans">
                    Estimated payout once all {totalTicketCapacity} ticket allocations are settled.
                  </p>
                </div>

                <div className="space-y-2 text-xs text-white/70 font-mono">
                  <div className="flex justify-between p-2 rounded bg-white/5">
                    <span>Gross Sales:</span>
                    <span className="text-white">{currency} {(totalGrossPotential / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-white/5">
                    <span>Platform (2.5%):</span>
                    <span className="text-red-400">- {currency} {(platformFeeMinor / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-white/5">
                    <span>Gateways (1.5%):</span>
                    <span className="text-red-400">- {currency} {(processingFeeMinor / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
