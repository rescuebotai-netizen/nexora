import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard,
  CalendarDays,
  Users,
  User,
  MapPin,
  Megaphone,
  Plus, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  Building2, 
  AlertCircle,
  AlertTriangle,
  Tag,
  CreditCard,
  FileSpreadsheet,
  RotateCcw,
  UserPlus,
  Layers,
  Zap,
  Copy,
  XCircle,
  Search,
  Filter,
  Check,
  Send,
  Share2,
  Mail,
  Smartphone,
  Eye,
  Edit3,
  Trash2,
  Radio,
  FileText,
  Activity,
  Award,
  Globe,
  Sliders,
  Code2,
  Moon,
  Sun,
  Menu,
  X,
  Volume2,
  BarChart3,
  QrCode,
  CheckSquare,
  Percent,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { 
  Event, 
  TicketTier, 
  OrganizerProfile, 
  PromoCode, 
  LedgerEntry, 
  PayoutRequest, 
  RefundRequest,
  TeamMember,
  VenueRFP,
  MarketingCampaign,
  PriorityTask,
  ActivityFeedItem,
  Ticket
} from '../../types';
import { store } from '../../lib/store';
import { formatCurrency, formatEventDate, formatEventTime } from '../../lib/currencies';

import heroFestivalImg from '../../assets/images/hero_afro_festival_1791591623547.jpg';
import techSummitImg from '../../assets/images/event_tech_summit_1791591635169.jpg';
import culinaryWineImg from '../../assets/images/event_culinary_wine_1791591643928.jpg';
import artExhibitImg from '../../assets/images/event_art_exhibit_1791591654774.jpg';

import { CreateEventStudio } from './CreateEventStudio';
import { EventPerformancePage } from './EventPerformancePage';
import { GuestTicketScannerPage, StaffGatePage } from './GuestTicketScannerPage';
import { EditEventPage } from './EditEventPage';
import { OrganizerProfilePage } from './OrganizerProfilePage';
import { EditOrganizerProfileModal } from './EditOrganizerProfileModal';
import { IntegrationsManager } from './IntegrationsManager';
import { WaitlistReclamationDrawer } from '../admin/WaitlistReclamationDrawer';
import { CashlessTerminalModal } from '../cashless/CashlessTerminalModal';

interface OrganizerPortalProps {
  onBackToMarketplace: () => void;
  onEventCreated: (event: Event) => void;
  onLaunchScanner?: () => void;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
}

export const OrganizerPortal: React.FC<OrganizerPortalProps> = ({
  onBackToMarketplace,
  onEventCreated,
  onLaunchScanner,
  onOpenAuth,
}) => {
  // Navigation: 7 Enterprise Modules
  const [activeSection, setActiveSection] = useState<'dashboard' | 'events' | 'attendees' | 'venues_agenda' | 'marketing_analytics' | 'integrations' | 'profile'>('dashboard');
  const [engagementSubTab, setEngagementSubTab] = useState<'hub' | 'checkin' | 'campaigns' | 'reports' | 'settings'>('hub');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showWaitlistDrawer, setShowWaitlistDrawer] = useState(false);
  const [showCashlessTerminal, setShowCashlessTerminal] = useState(false);

  // Theme Switching
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    return localStorage.getItem('nexora_theme') === 'dark';
  });

  const toggleTheme = () => {
    const next = !isDarkTheme;
    setIsDarkTheme(next);
    localStorage.setItem('nexora_theme', next ? 'dark' : 'light');
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkTheme]);

  // Audio Feedback
  const playAudioFeedback = (type: 'success' | 'warning' | 'error') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // Audio autoplay permission fallback
    }
  };

  // Store data state
  const [organizers, setOrganizers] = useState<OrganizerProfile[]>(store.getOrganizers());
  const [selectedOrgId, setSelectedOrgId] = useState<string>(organizers[0]?.id || 'org-cape-vibes');

  const currentOrg = organizers.find(o => o.id === selectedOrgId) || organizers[0];
  const allEvents = store.getEvents().filter(e => e.organizer.id === currentOrg.id || e.organizer.name.includes(currentOrg.name));
  const allTickets = store.getTickets().filter(t => allEvents.some(e => e.id === t.eventId));
  const orgBalance = store.getOrganizerBalance(currentOrg.id);
  const ledgerEntries = store.getLedgerEntries(currentOrg.id);
  const refundRequests = store.getRefundRequests(currentOrg.id);
  const teamMembers = store.getTeamMembers(currentOrg.id);
  const venueRFPs = store.getVenueRFPs();
  const marketingCampaigns = store.getMarketingCampaigns();
  const priorityTasks = store.getPriorityTasks();
  const activityFeed = store.getActivityFeed();

  // Search & Filters across modules
  const [eventFilterStatus, setEventFilterStatus] = useState<string>('all');
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState('');
  const [attendeeStatusFilter, setAttendeeStatusFilter] = useState('all');
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'registrations' | 'tiers'>('revenue');
  const [activityCategoryFilter, setActivityCategoryFilter] = useState('all');
  const [venueSearchQuery, setVenueSearchQuery] = useState('');
  const [venueCityFilter, setVenueCityFilter] = useState('all');
  const [agendaEventFilter, setAgendaEventFilter] = useState<string>(allEvents[0]?.id || '');
  const [agendaTrackFilter, setAgendaTrackFilter] = useState('all');

  // Modals state
  const [showCreateStudio, setShowCreateStudio] = useState(false);
  const [studioTemplate, setStudioTemplate] = useState<string | undefined>(undefined);
  const [studioDuplicateId, setStudioDuplicateId] = useState<string | undefined>(undefined);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [inspectEventModal, setInspectEventModal] = useState<Event | null>(null);
  const [eventForPerformance, setEventForPerformance] = useState<Event | null>(null);
  const [showStaffGatePage, setShowStaffGatePage] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [eventToCancel, setEventToCancel] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [showRFPModal, setShowRFPModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [editAttendeeModal, setEditAttendeeModal] = useState<Ticket | null>(null);
  const [showAddAttendeeModal, setShowAddAttendeeModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleConfirmCancelEvent = (evt: Event) => {
    const res = store.cancelEvent(evt.id);
    if (res) {
      setOrganizers([...store.getOrganizers()]);
      playAudioFeedback('success');
      showNotification(`Event "${evt.title}" has been cancelled.`);
      setEventToCancel(null);
      if (eventForPerformance?.id === evt.id) {
        setEventForPerformance(res);
      }
    }
  };

  const handleConfirmDeleteEvent = (evt: Event) => {
    const success = store.deleteEvent(evt.id);
    if (success) {
      setOrganizers([...store.getOrganizers()]);
      playAudioFeedback('success');
      showNotification(`Event "${evt.title}" was permanently deleted.`);
      setEventToDelete(null);
      if (eventForPerformance?.id === evt.id) {
        setEventForPerformance(null);
      }
    }
  };

  const handleSavedEditedEvent = (updated: Event) => {
    setOrganizers([...store.getOrganizers()]);
    playAudioFeedback('success');
    showNotification(`Event "${updated.title}" successfully updated!`);
    setEventToEdit(null);
    if (eventForPerformance?.id === updated.id) {
      setEventForPerformance(updated);
    }
  };

  // Form states for RFP
  const [rfpVenueName, setRfpVenueName] = useState('Green Point Amphitheatre & Track');
  const [rfpAttendees, setRfpAttendees] = useState(1500);
  const [rfpTargetDate, setRfpTargetDate] = useState('2026-11-20');
  const [rfpBudget, setRfpBudget] = useState('R 75,000');
  const [rfpContact, setRfpContact] = useState('Thabo Mokoena (Lead Curator)');

  // Form states for Campaign
  const [campaignTitle, setCampaignTitle] = useState('Spring Amapiano Flash Announcement');
  const [campaignAudience, setCampaignAudience] = useState('All South Africa Past Attendees');
  const [campaignType, setCampaignType] = useState<'email' | 'promoter' | 'social'>('email');

  // Form states for Session
  const [sessionEventId, setSessionEventId] = useState(allEvents[0]?.id || '');
  const [sessionTitle, setSessionTitle] = useState('Keynote: Scaling African Event Tech Across Borders');
  const [sessionTime, setSessionTime] = useState('11:00 AM');
  const [sessionSpeaker, setSessionSpeaker] = useState('Amina Mohamed (Managing Partner)');
  const [sessionStage, setSessionStage] = useState('Main Plenary Stage');

  // Form states for Promo Code
  const [newPromoCode, setNewPromoCode] = useState('NEXORAVIP25');
  const [newPromoDiscount, setNewPromoDiscount] = useState(25);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSentAlert, setBroadcastSentAlert] = useState(false);

  // Manual Attendee Registration Form
  const [newAttendeeName, setNewAttendeeName] = useState('Sipho Dlamini');
  const [newAttendeeEmail, setNewAttendeeEmail] = useState('sipho.d@innovate.africa');
  const [newAttendeePhone, setNewAttendeePhone] = useState('+27 82 459 2910');
  const [newAttendeeEventId, setNewAttendeeEventId] = useState(allEvents[0]?.id || '');
  const [newAttendeeTierId, setNewAttendeeTierId] = useState('');

  // Quick Check-in input code state
  const [manualCheckInCode, setManualCheckInCode] = useState('');
  const [manualCheckInResult, setManualCheckInResult] = useState<{ status: 'success' | 'error'; message: string } | null>(null);

  // Attendee Hub Interactive simulation state
  const [hubSelectedPoll, setHubSelectedPoll] = useState<number | null>(null);
  const [pollVotes, setPollVotes] = useState({ 1: 42, 2: 78, 3: 29 });
  const [qaInput, setQaInput] = useState('');
  const [qaQuestions, setQaQuestions] = useState([
    { id: 'q1', author: 'Nia Adeyemi', text: 'Will workshop slides be shared via the Attendee Hub after the sessions?', upvotes: 14, voted: false },
    { id: 'q2', author: 'Kofi Mensah', text: 'Where is the VIP networking reception taking place on Saturday evening?', upvotes: 9, voted: false },
  ]);

  // Integration connection states
  const [integrations, setIntegrations] = useState([
    { id: 'paystack', name: 'Paystack Rails', category: 'Payment Gateway', status: true, desc: 'Accept cards, bank transfers & USSD in Nigeria & Ghana' },
    { id: 'mpesa', name: 'Safaricom M-Pesa Express', category: 'Mobile Money', status: true, desc: 'Direct STK Push payments for East African attendees' },
    { id: 'ozow', name: 'Ozow Instant EFT', category: 'Payment Gateway', status: true, desc: 'Zero-friction bank clearance across South Africa' },
    { id: 'stripe', name: 'Stripe Global Card Rails', category: 'Payment Gateway', status: true, desc: 'International USD/EUR/GBP card checkout' },
    { id: 'mailchimp', name: 'Mailchimp Sync', category: 'Marketing', status: true, desc: 'Automated subscriber audience segmentation' },
    { id: 'zapier', name: 'Zapier Webhooks', category: 'Automation', status: false, desc: 'Trigger CRM flows on confirmed ticket issuance' },
    { id: 'slack', name: 'Slack Gate Alerts', category: 'Operations', status: true, desc: 'Real-time VIP check-in alerts into private channel' },
  ]);

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(item => item.id === id ? { ...item, status: !item.status } : item));
    showNotification('Integration status updated.');
  };

  // Event Creation Wizard State
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [newTitle, setNewTitle] = useState('Kigali Creative Arts & Beats Fest');
  const [newCategory, setNewCategory] = useState<'Concerts & Music' | 'Tech & Innovation' | 'Food & Wine' | 'Arts & Culture'>('Concerts & Music');
  const [newFormat, setNewFormat] = useState<'in_person' | 'online' | 'hybrid'>('in_person');
  const [newDescription, setNewDescription] = useState('A celebration of modern East African sound, visual arts, and culinary popups at Kigali Convention Arena.');
  const [newStartDate, setNewStartDate] = useState('2026-12-10T15:00:00Z');
  const [newEndDate, setNewEndDate] = useState('2026-12-11T01:00:00Z');
  const [newVenueName, setNewVenueName] = useState('Kigali Convention Arena & Gardens');
  const [newAddress, setNewAddress] = useState('KG 2 Roundabout, Kimihurura');
  const [newCity, setNewCity] = useState('Kigali');
  const [newCountry, setNewCountry] = useState('Rwanda');
  const [newCoverImage, setNewCoverImage] = useState(heroFestivalImg);
  const [newRefundPolicy, setNewRefundPolicy] = useState('Full refund up to 7 days before event opening.');
  const [newTiers, setNewTiers] = useState<Array<{ name: string; priceMinor: number; capacity: number }>>([
    { name: 'Standard General Entry', priceMinor: 35000, capacity: 800 },
    { name: 'VIP Terrace & Lounge', priceMinor: 95000, capacity: 150 },
  ]);

  // Action handlers
  const handleResolveTask = (taskId: string) => {
    store.resolvePriorityTask(taskId);
    setOrganizers([...store.getOrganizers()]);
    playAudioFeedback('success');
    showNotification('Task resolved successfully.');
  };

  const handleCreateSampleEvent = () => {
    const sampleEvent = store.createEvent({
      slug: 'sample-pan-african-sound-forum-' + Date.now().toString().slice(-4),
      title: 'Pan-African Sound & Music Forum 2026',
      category: 'Concerts & Music',
      format: 'hybrid',
      description: 'Industry convening celebrating producers, artists, and live concert innovators from Lagos to Cape Town.',
      shortSummary: 'High-energy music summit and live showcases featuring premier continental acts.',
      coverImage: heroFestivalImg,
      gallery: [heroFestivalImg],
      startDate: '2026-11-25T14:00:00Z',
      endDate: '2026-11-26T22:00:00Z',
      timezone: 'Africa/Johannesburg',
      venue: {
        name: 'The Amphitheatre Pavilion',
        address: '10 Dock Road, Waterfront',
        city: 'Cape Town',
        country: 'South Africa',
      },
      organizer: {
        id: currentOrg.id,
        name: currentOrg.name,
        verified: true,
        rating: 5.0,
      },
      tickets: [
        {
          id: 'tier-smp-1',
          eventId: '',
          name: 'Day 1 Conference Pass',
          description: 'Keynotes & live panel access',
          priceMinor: 25000,
          currency: 'ZAR',
          capacity: 400,
          remaining: 380,
          minPerOrder: 1,
          maxPerOrder: 4,
          salesStart: new Date().toISOString(),
          salesEnd: '2026-11-25T12:00:00Z',
          status: 'active',
        },
        {
          id: 'tier-smp-2',
          eventId: '',
          name: 'VIP All-Access Badge',
          description: 'Plenary keynote, VIP lounge & backstage artist pass',
          priceMinor: 85000,
          currency: 'ZAR',
          capacity: 100,
          remaining: 74,
          minPerOrder: 1,
          maxPerOrder: 2,
          salesStart: new Date().toISOString(),
          salesEnd: '2026-11-25T12:00:00Z',
          status: 'active',
        }
      ],
      status: 'published',
      featured: true,
      refundPolicy: 'Full refund available up to 7 days before event opening.',
      tags: ['Music', 'Pan-African', 'Cape Town'],
      currency: 'ZAR',
    });
    onEventCreated(sampleEvent);
    setOrganizers([...store.getOrganizers()]);
    playAudioFeedback('success');
    showNotification('Sample Event created & published to portfolio!');
  };

  const handleRegisterSampleAttendee = () => {
    const evt = allEvents[0] || store.getEvents()[0];
    if (evt) {
      const tkt = store.createSampleAttendee(evt.id);
      setOrganizers([...store.getOrganizers()]);
      playAudioFeedback('success');
      showNotification(`Sample attendee ${tkt.attendeeName} registered (${tkt.ticketCode})!`);
    }
  };

  const handleManualAttendeeRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const evt = allEvents.find(ev => ev.id === newAttendeeEventId) || allEvents[0] || store.getEvents()[0];
    const tier = evt.tickets.find(t => t.id === newAttendeeTierId) || evt.tickets[0];
    
    const ticketCode = `NX-${Math.floor(100000 + Math.random() * 900000)}-M`;
    const token = 'token_' + Math.random().toString(36).substring(2, 10);

    const ticket: Ticket = {
      id: 'tkt-man-' + Date.now(),
      ticketCode,
      token,
      orderId: 'ord-manual-' + Date.now(),
      eventId: evt.id,
      eventTitle: evt.title,
      eventDate: evt.startDate,
      eventVenue: `${evt.venue.name}, ${evt.venue.city}`,
      tierId: tier.id,
      tierName: tier.name,
      attendeeName: newAttendeeName,
      attendeeEmail: newAttendeeEmail,
      attendeePhone: newAttendeePhone,
      priceMinor: tier.priceMinor,
      currency: tier.currency,
      status: 'valid',
      qrPayload: JSON.stringify({
        code: ticketCode,
        eventId: evt.id,
        token,
        tier: tier.name,
        attendee: newAttendeeName,
      }),
    };

    store.getTickets().unshift(ticket);
    store.logActivity({
      type: 'purchase',
      title: 'Manual Guest Admittance Registered',
      description: `${newAttendeeName} registered for ${evt.title} (${tier.name})`,
      actor: 'Registration Desk',
    });

    setShowAddAttendeeModal(false);
    setOrganizers([...store.getOrganizers()]);
    playAudioFeedback('success');
    showNotification(`Attendee ${newAttendeeName} issued ticket pass!`);
  };

  const handleToggleAttendeeCheckIn = (ticket: Ticket) => {
    const nextStatus = ticket.status === 'checked_in' ? 'valid' : 'checked_in';
    ticket.status = nextStatus;
    if (nextStatus === 'checked_in') {
      ticket.checkedInAt = new Date().toISOString();
      ticket.gate = 'Gate 1 (Main Plaza)';
      playAudioFeedback('success');
      showNotification(`${ticket.attendeeName} marked Checked-In!`);
      store.logActivity({
        type: 'checkin',
        title: 'Attendee Admitted',
        description: `${ticket.attendeeName} (${ticket.ticketCode}) admitted at Gate 1`,
        actor: 'Staff Operator',
      });
    } else {
      ticket.checkedInAt = undefined;
      playAudioFeedback('warning');
      showNotification(`${ticket.attendeeName} reverted to Valid.`);
    }
    setOrganizers([...store.getOrganizers()]);
  };

  const handleIssueRefund = (ticket: Ticket) => {
    ticket.status = 'refunded';
    store.requestRefund(ticket.id, 'Organizer issued direct refund on request.');
    playAudioFeedback('warning');
    showNotification(`Refund processed for ticket ${ticket.ticketCode}. Inventory released.`);
    setOrganizers([...store.getOrganizers()]);
  };

  const handleFastManualCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCheckInCode.trim()) return;

    const query = manualCheckInCode.trim().toLowerCase();
    const tkt = store.getTickets().find(t => 
      t.ticketCode.toLowerCase() === query || 
      t.attendeeEmail.toLowerCase() === query ||
      t.attendeeName.toLowerCase().includes(query)
    );

    if (!tkt) {
      playAudioFeedback('error');
      setManualCheckInResult({ status: 'error', message: `No active pass found matching "${manualCheckInCode}"` });
      return;
    }

    if (tkt.status === 'checked_in') {
      playAudioFeedback('error');
      setManualCheckInResult({ status: 'error', message: `Warning: Pass ${tkt.ticketCode} already checked in at ${tkt.checkedInAt ? new Date(tkt.checkedInAt).toLocaleTimeString() : 'earlier today'}` });
      return;
    }

    if (tkt.status === 'refunded') {
      playAudioFeedback('error');
      setManualCheckInResult({ status: 'error', message: `Revoked: Pass ${tkt.ticketCode} was refunded.` });
      return;
    }

    tkt.status = 'checked_in';
    tkt.checkedInAt = new Date().toISOString();
    tkt.gate = 'Turnstile Fast Check-in';
    playAudioFeedback('success');
    setManualCheckInResult({ status: 'success', message: `Access Granted: ${tkt.attendeeName} (${tkt.tierName})` });
    setManualCheckInCode('');
    setOrganizers([...store.getOrganizers()]);
  };

  const handleSubmitRFP = (e: React.FormEvent) => {
    e.preventDefault();
    store.createVenueRFP({
      venueName: rfpVenueName,
      city: currentOrg.city,
      country: currentOrg.country,
      contactPerson: rfpContact,
      targetDate: rfpTargetDate,
      expectedAttendees: Number(rfpAttendees),
      budgetFormatted: rfpBudget,
      requirements: ['Standard stage lighting rig', 'Dedicated guest turnstiles', 'High-speed fiber stream line'],
      status: 'submitted',
    });
    setShowRFPModal(false);
    setOrganizers([...store.getOrganizers()]);
    playAudioFeedback('success');
    showNotification('Venue proposal (RFP) submitted!');
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    store.createMarketingCampaign({
      title: campaignTitle,
      type: campaignType,
      audience: campaignAudience,
      sentCount: 3500,
      openRate: 42.5,
      conversionRate: 6.8,
      revenueGeneratedMinor: 2450000,
      currency: 'ZAR',
      status: 'active',
      scheduledDate: new Date().toISOString().slice(0, 10),
    });
    setShowCampaignModal(false);
    setOrganizers([...store.getOrganizers()]);
    playAudioFeedback('success');
    showNotification(`Marketing campaign "${campaignTitle}" launched!`);
  };

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEvtId = sessionEventId || allEvents[0]?.id;
    store.addAgendaSession(targetEvtId, {
      time: sessionTime,
      title: sessionTitle,
      speaker: sessionSpeaker,
      stage: sessionStage,
      description: 'Comprehensive panel session on African market readiness and scaling infrastructure.',
    });
    setShowSessionModal(false);
    setOrganizers([...store.getOrganizers()]);
    playAudioFeedback('success');
    showNotification('Session scheduled into programme agenda!');
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPromoCode.trim()) {
      const code = newPromoCode.trim().toUpperCase();
      store.applyPromoCode(code);
      setShowPromoModal(false);
      showNotification(`Promo code "${code}" registered (${newPromoDiscount}% off)!`);
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastSentAlert(true);
    playAudioFeedback('success');
    setTimeout(() => {
      setBroadcastSentAlert(false);
      setShowBroadcastModal(false);
      setBroadcastMessage('');
      showNotification('Push broadcast delivered to confirmed ticket holders.');
    }, 1800);
  };

  // CSV Export utility
  const handleExportCSV = (type: 'attendees' | 'ledger' | 'logs' = 'attendees') => {
    let filename = 'nexora_attendees.csv';
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    if (type === 'attendees') {
      filename = `nexora_attendees_${new Date().toISOString().slice(0, 10)}.csv`;
      csvContent += 'Ticket Code,Attendee Name,Email,Phone,Event,Tier,Price,Currency,Status\n';
      allTickets.forEach(t => {
        csvContent += `"${t.ticketCode}","${t.attendeeName}","${t.attendeeEmail}","${t.attendeePhone}","${t.eventTitle}","${t.tierName}",${(t.priceMinor / 100).toFixed(2)},"${t.currency}","${t.status}"\n`;
      });
    } else if (type === 'ledger') {
      filename = `nexora_settlement_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
      csvContent += 'ID,Timestamp,Type,Debit,Credit,Currency,Description\n';
      ledgerEntries.forEach(l => {
        csvContent += `"${l.id}","${l.timestamp}","${l.type}",${(l.debitMinor / 100).toFixed(2)},${(l.creditMinor / 100).toFixed(2)},"${l.currency}","${l.description}"\n`;
      });
    } else {
      filename = `nexora_scanner_audit_${new Date().toISOString().slice(0, 10)}.csv`;
      csvContent += 'ID,Ticket Code,Timestamp,Staff,Gate,Result,Message\n';
      store.getCheckInLogs().forEach(log => {
        csvContent += `"${log.id}","${log.ticketCode}","${log.timestamp}","${log.staffName}","${log.gate}","${log.result}","${log.message}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Exported ${filename}`);
  };

  const handleSimulateLiveActivity = () => {
    const types: Array<'purchase' | 'checkin' | 'refund' | 'campaign'> = ['purchase', 'checkin', 'refund', 'campaign'];
    const selectedType = types[Math.floor(Math.random() * types.length)];
    const names = ['Kofi Mensah', 'Nia Adeyemi', 'Thabo Sithole', 'Amina Diallo', 'Emeka Eze'];
    const chosenName = names[Math.floor(Math.random() * names.length)];

    if (selectedType === 'purchase') {
      store.logActivity({
        type: 'purchase',
        title: 'New VIP Pass Reserved',
        description: `${chosenName} purchased 2x VIP Passes for Cape Town Vibes`,
        actor: chosenName,
      });
    } else if (selectedType === 'checkin') {
      store.logActivity({
        type: 'checkin',
        title: 'Turnstile Admittance',
        description: `${chosenName} admitted through Gate 2 North`,
        actor: 'Turnstile A2',
      });
    } else if (selectedType === 'refund') {
      store.logActivity({
        type: 'refund',
        title: 'Exchange Processed',
        description: `Customer clearance refunded for ${chosenName}`,
        actor: 'Finance Desk',
      });
    } else {
      store.logActivity({
        type: 'campaign',
        title: 'SMS Reminder Blast Delivered',
        description: `Dispatched gates & parking briefing to 1,200 attendees`,
        actor: 'Nexora Automation',
      });
    }

    setOrganizers([...store.getOrganizers()]);
    playAudioFeedback('success');
    showNotification('Simulated new live event activity.');
  };

  const handlePublishFromWizard = () => {
    const created = store.createEvent({
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4),
      title: newTitle,
      category: newCategory,
      format: newFormat,
      description: newDescription,
      shortSummary: newDescription.slice(0, 120) + '...',
      coverImage: newCoverImage,
      gallery: [newCoverImage],
      startDate: newStartDate,
      endDate: newEndDate,
      timezone: 'Africa/Johannesburg',
      venue: {
        name: newVenueName,
        address: newAddress,
        city: newCity,
        country: newCountry,
      },
      organizer: {
        id: currentOrg.id,
        name: currentOrg.name,
        verified: currentOrg.verified,
        rating: 5.0,
      },
      tickets: newTiers.map((t, idx) => ({
        id: 'tier-' + Date.now() + '-' + idx,
        eventId: '',
        name: t.name,
        description: 'Admission tier for ' + newTitle,
        priceMinor: t.priceMinor,
        currency: 'ZAR',
        capacity: t.capacity,
        remaining: t.capacity,
        minPerOrder: 1,
        maxPerOrder: 6,
        salesStart: new Date().toISOString(),
        salesEnd: newStartDate,
        status: 'active',
      })),
      status: 'published',
      featured: false,
      refundPolicy: newRefundPolicy,
      tags: ['Festival', newCity, 'Nexora'],
      currency: 'ZAR',
    });

    onEventCreated(created);
    setShowCreateEventModal(false);
    setWizardStep(1);
    setOrganizers([...store.getOrganizers()]);
    playAudioFeedback('success');
    showNotification(`Event "${newTitle}" created and published!`);
  };

  // Filtered Events
  const filteredEvents = allEvents.filter(e => {
    if (eventFilterStatus === 'published' && e.status !== 'published') return false;
    if (eventFilterStatus === 'draft' && e.status !== 'draft') return false;
    if (eventFilterStatus === 'cancelled' && e.status !== 'cancelled') return false;
    if (eventSearchQuery.trim()) {
      const q = eventSearchQuery.toLowerCase();
      if (!e.title.toLowerCase().includes(q) && !e.venue.city.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Filtered Attendees
  const filteredAttendees = allTickets.filter(t => {
    if (attendeeStatusFilter !== 'all' && t.status !== attendeeStatusFilter) return false;
    if (attendeeSearchQuery.trim()) {
      const q = attendeeSearchQuery.toLowerCase();
      return (
        t.attendeeName.toLowerCase().includes(q) ||
        t.attendeeEmail.toLowerCase().includes(q) ||
        t.ticketCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // African Venue Catalog
  const venueCatalog = [
    { name: 'Cape Town International Convention Centre (CTICC)', city: 'Cape Town', country: 'South Africa', cap: 10000, rate: 'R 120,000/day', tags: ['Auditorium', 'Exhibition Halls', 'Fiber Stream', 'Harbor View'] },
    { name: 'Kigali Convention Centre & Arena Dome', city: 'Kigali', country: 'Rwanda', cap: 3500, rate: '$7,500/day', tags: ['Iconic Dome', 'Eco-Certified', 'Simultaneous Audio', 'VIP Suites'] },
    { name: 'Eko Convention Centre & Grand Ballroom', city: 'Lagos', country: 'Nigeria', cap: 6000, rate: '₦ 8,500,000/day', tags: ['Ocean Terrace', 'High-capacity AV', 'Dedicated Turnstiles'] },
    { name: 'Sandton Convention Centre', city: 'Johannesburg', country: 'South Africa', cap: 4500, rate: 'R 95,000/day', tags: ['Financial Hub', 'Gautrain Access', 'Security Turnstiles'] },
    { name: 'Sarit Expo Centre & Auditorium', city: 'Nairobi', country: 'Kenya', cap: 3500, rate: 'KSh 650,000/day', tags: ['Westlands', 'Direct Hotel Access', 'Broadcast Ready'] },
    { name: 'Green Point Amphitheatre & Coastal Track', city: 'Cape Town', country: 'South Africa', cap: 5000, rate: 'R 75,000/day', tags: ['Open Air', 'Ocean Breeze', 'Acoustic Shell'] },
  ];

  const filteredVenues = venueCatalog.filter(v => {
    if (venueCityFilter !== 'all' && v.city !== venueCityFilter) return false;
    if (venueSearchQuery.trim()) {
      const q = venueSearchQuery.toLowerCase();
      return v.name.toLowerCase().includes(q) || v.city.toLowerCase().includes(q) || v.tags.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  // Selected Agenda Event
  const selectedAgendaEvent = allEvents.find(e => e.id === agendaEventFilter) || allEvents[0];
  const agendaSessions = selectedAgendaEvent?.agenda || [];
  const filteredAgendaSessions = agendaSessions.filter(s => {
    if (agendaTrackFilter !== 'all' && s.stage !== agendaTrackFilter) return false;
    return true;
  });

  // Filtered Activity
  const filteredActivity = activityFeed.filter(act => {
    if (activityCategoryFilter !== 'all' && act.type !== activityCategoryFilter) return false;
    return true;
  });

  return (
    <div className={`min-h-screen flex ${isDarkTheme ? 'bg-black text-white' : 'bg-white text-black'}`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111827] text-white px-4 py-3 rounded-xl shadow-2xl border border-[#374151] flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 ${
        isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-[#111827] border-[#1F2937]'
      } text-white flex flex-col justify-between transition-transform duration-300 border-r lg:static lg:translate-x-0 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-0 max-lg:-translate-x-full'
      }`}>
        
        {/* Sidebar Brand Header */}
        <div>
          <div className="h-18 px-6 flex items-center justify-between border-b border-[#1F2937]">
            <button
              onClick={onBackToMarketplace}
              className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
            >
              <span className="text-xl font-black tracking-tight text-white flex items-center">
                NEX<span className="text-white">ORA</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-mono bg-[#1F2937] text-[#9CA3AF] px-1.5 py-0.5 rounded border border-[#374151]">
                Platform
              </span>
            </button>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1 text-[#9CA3AF] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Organizer Profile Card with Direct Edit Action */}
          <div className="p-3 mx-3 my-3 bg-[#1F2937] rounded-xl border border-[#374151] flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-white text-black flex items-center justify-center font-bold text-sm shrink-0 border border-white/20">
                {currentOrg.logoUrl ? (
                  <img src={currentOrg.logoUrl} alt={currentOrg.name} className="w-full h-full object-cover" />
                ) : (
                  currentOrg.name.charAt(0)
                )}
              </div>
              <div className="truncate flex-1">
                <h4 className="text-xs font-bold text-white truncate">{currentOrg.name}</h4>
                <p className="text-[10px] text-[#9CA3AF] truncate capitalize">{currentOrg.subscriptionPlan} Plan · {currentOrg.city}</p>
              </div>
            </div>

            <button
              onClick={() => setShowEditProfileModal(true)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
              title="Edit Organizer Profile"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 7 Core Enterprise Modules Navigation Links */}
          <nav className="px-3 space-y-1 text-xs font-medium">
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#6B7280]">
              Management Modules
            </div>

            {/* 1. Executive Dashboard */}
            <button
              onClick={() => { setActiveSection('dashboard'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
                activeSection === 'dashboard'
                  ? 'bg-white text-black font-bold shadow-xs'
                  : 'text-[#D1D5DB] hover:bg-[#1F2937] hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>1. Executive Dashboard</span>
            </button>

            {/* 2. Event Management */}
            <button
              onClick={() => { setActiveSection('events'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
                activeSection === 'events'
                  ? 'bg-white text-black font-bold shadow-xs'
                  : 'text-[#D1D5DB] hover:bg-[#1F2937] hover:text-white'
              }`}
            >
              <CalendarDays className="w-4 h-4 shrink-0" />
              <div className="flex-1 flex items-center justify-between">
                <span>2. Event Management</span>
                <span className="text-[10px] font-mono opacity-80">{allEvents.length}</span>
              </div>
            </button>

            {/* 3. Registration and Attendees */}
            <button
              onClick={() => { setActiveSection('attendees'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
                activeSection === 'attendees'
                  ? 'bg-white text-black font-bold shadow-xs'
                  : 'text-[#D1D5DB] hover:bg-[#1F2937] hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <div className="flex-1 flex items-center justify-between">
                <span>3. Registration & Attendees</span>
                <span className="text-[10px] font-mono opacity-80">{allTickets.length}</span>
              </div>
            </button>

            {/* 4. Venue Sourcing and Agenda */}
            <button
              onClick={() => { setActiveSection('venues_agenda'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
                activeSection === 'venues_agenda'
                  ? 'bg-white text-black font-bold shadow-xs'
                  : 'text-[#D1D5DB] hover:bg-[#1F2937] hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4 shrink-0" />
              <span>4. Venue Sourcing & Agenda</span>
            </button>

            {/* 5. Engagement, Marketing and Analytics */}
            <button
              onClick={() => { setActiveSection('marketing_analytics'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
                activeSection === 'marketing_analytics'
                  ? 'bg-white text-black font-bold shadow-xs'
                  : 'text-[#D1D5DB] hover:bg-[#1F2937] hover:text-white'
              }`}
            >
              <Megaphone className="w-4 h-4 shrink-0" />
              <span>5. Engagement & Analytics</span>
            </button>

            {/* 6. Third-Party Integrations */}
            <button
              onClick={() => { setActiveSection('integrations'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
                activeSection === 'integrations'
                  ? 'bg-white text-black font-bold shadow-xs'
                  : 'text-[#D1D5DB] hover:bg-[#1F2937] hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4 shrink-0" />
              <div className="flex-1 flex items-center justify-between">
                <span>6. Platform Integrations</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-bold">
                  Connected
                </span>
              </div>
            </button>

            {/* 7. Organizer Profile */}
            <button
              onClick={() => { setActiveSection('profile'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
                activeSection === 'profile'
                  ? 'bg-white text-black font-bold shadow-xs'
                  : 'text-[#D1D5DB] hover:bg-[#1F2937] hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>7. Organizer Profile</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-[#1F2937] space-y-2 text-xs">
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="w-full py-2 bg-[#1F2937] hover:bg-[#374151] text-[#E5E7EB] font-semibold rounded-lg flex items-center justify-between px-3 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              {isDarkTheme ? <Moon className="w-3.5 h-3.5 text-white" /> : <Sun className="w-3.5 h-3.5 text-white" />}
              <span>{isDarkTheme ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <span className="text-[10px] text-[#9CA3AF] uppercase font-mono">Toggle</span>
          </button>

          <button
            onClick={onBackToMarketplace}
            className="w-full py-2 bg-[#1F2937] hover:bg-[#374151] text-[#E5E7EB] font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-white" />
            <span>Public Marketplace</span>
          </button>
          
          <button
            onClick={() => setShowStaffGatePage(true)}
            className="w-full py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Guest Ticket Scanner</span>
          </button>

          <div className="pt-2 text-[10px] text-[#6B7280] text-center font-mono">
            NEXORA Enterprise Suite v2.4
          </div>
        </div>

      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile menu trigger (header removed inside Nexora Platform) */}
        <div className="lg:hidden p-3 border-b border-[#1F2937] flex items-center justify-between bg-[#111827]">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 text-[#9CA3AF] hover:text-white cursor-pointer flex items-center gap-2 text-xs font-bold"
          >
            <Menu className="w-5 h-5 text-white" />
            <span>Open Navigation</span>
          </button>
          <span className="text-xs font-mono font-bold text-white">NEXORA ORGANIZER</span>
        </div>

        {/* DYNAMIC SECTION ROUTER */}
        <div className="p-4 sm:p-8 flex-1 overflow-y-auto space-y-8">
          
          {/* ========================================================= */}
          {/* 1. EXECUTIVE DASHBOARD                                    */}
          {/* ========================================================= */}
          {activeSection === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Primary Call to Action: Create-Event Entry Flow */}
              <div className={`p-6 rounded-2xl border shadow-lg space-y-4 ${
                isDarkTheme ? 'bg-[#111827] border-white/10' : 'bg-white border-[#E5E7EB]'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className={`text-[10px] font-mono tracking-widest uppercase font-bold block ${
                      isDarkTheme ? 'text-white' : 'text-neutral-900'
                    }`}>
                      CREATOR SUITE
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                      Publish a New Pan-African Event
                    </h2>
                    <p className={`text-xs ${isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>
                      End-to-end studio with live previews, multi-currency ticketing, and instant EFT/M-Pesa settlement.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setShowWaitlistDrawer(true)}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isDarkTheme ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20' : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                      }`}
                      title="Open Waitlist Reclamation & Priority Queue"
                    >
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>Waitlist Engine</span>
                    </button>

                    <button
                      onClick={() => setShowCashlessTerminal(true)}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isDarkTheme ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' : 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                      }`}
                      title="Open On-Site Cashless RFID Wristband Terminal"
                    >
                      <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span>Cashless RFID POS</span>
                    </button>

                    <button
                      onClick={() => {
                        setStudioTemplate(undefined);
                        setStudioDuplicateId(undefined);
                        setShowCreateStudio(true);
                      }}
                      className="px-4 py-2 bg-white text-black hover:bg-neutral-200 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create an Event</span>
                    </button>
                    <button
                      onClick={() => {
                        setStudioTemplate('conference');
                        setShowCreateStudio(true);
                      }}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                        isDarkTheme ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-black hover:bg-gray-100'
                      }`}
                    >
                      <span>Templates</span>
                    </button>
                    <button
                      onClick={() => {
                        if (allEvents[0]) {
                          setStudioDuplicateId(allEvents[0].id);
                          setShowCreateStudio(true);
                        } else {
                          setShowCreateStudio(true);
                        }
                      }}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                        isDarkTheme ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-black hover:bg-gray-100'
                      }`}
                    >
                      <span>Duplicate Past</span>
                    </button>
                  </div>
                </div>

                {/* 3 Quick Launch Presets */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5">
                  <div
                    onClick={() => {
                      setStudioTemplate(undefined);
                      setStudioDuplicateId(undefined);
                      setShowCreateStudio(true);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all hover:border-white ${
                      isDarkTheme ? 'bg-[#1F2937]/50 border-white/5' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className={`w-3.5 h-3.5 ${isDarkTheme ? 'text-white' : 'text-neutral-900'}`} />
                      <strong className="text-xs">Blank Event</strong>
                    </div>
                    <p className={`text-[11px] ${isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>
                      Start with a clean slate and custom parameters.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setStudioTemplate('conference');
                      setShowCreateStudio(true);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all hover:border-white ${
                      isDarkTheme ? 'bg-[#1F2937]/50 border-white/5' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className={`w-3.5 h-3.5 ${isDarkTheme ? 'text-white' : 'text-neutral-900'}`} />
                      <strong className="text-xs">Conference Template</strong>
                    </div>
                    <p className={`text-[11px] ${isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>
                      Pre-populated multi-tier passes, plenary agenda, and speakers.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setStudioTemplate('concert');
                      setShowCreateStudio(true);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all hover:border-white ${
                      isDarkTheme ? 'bg-[#1F2937]/50 border-white/5' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className={`w-3.5 h-3.5 ${isDarkTheme ? 'text-white' : 'text-neutral-900'}`} />
                      <strong className="text-xs">Concert & Festival</strong>
                    </div>
                    <p className={`text-[11px] ${isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>
                      Arena standing, Golden Circle VIP, and merchandise add-ons.
                    </p>
                  </div>
                </div>
              </div>

              {/* Registration & Revenue KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className={`p-5 rounded-xl border shadow-xs space-y-2 ${
                  isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
                }`}>
                  <div className="flex items-center justify-between text-xs text-[#6B7280]">
                    <span>Total Registrations</span>
                    <Users className={`w-4 h-4 ${isDarkTheme ? 'text-white' : 'text-neutral-900'}`} />
                  </div>
                  <div className="text-2xl font-extrabold font-mono">
                    {allTickets.length + 1158}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+18.4% vs last cycle</span>
                  </div>
                </div>

                <div className={`p-5 rounded-xl border shadow-xs space-y-2 ${
                  isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
                }`}>
                  <div className="flex items-center justify-between text-xs text-[#6B7280]">
                    <span>Gross Ticket Revenue</span>
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-extrabold font-mono">
                    {formatCurrency(orgBalance.grossMinor + 1250000, 'ZAR')}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+24.1% conversion velocity</span>
                  </div>
                </div>

                <div className={`p-5 rounded-xl border shadow-xs space-y-2 ${
                  isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
                }`}>
                  <div className="flex items-center justify-between text-xs text-[#6B7280]">
                    <span>Checked-In Admissions</span>
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-blue-500 font-mono">
                    {allTickets.filter(t => t.status === 'checked_in').length + 412}
                  </div>
                  <span className="text-[11px] text-[#6B7280] block font-mono">
                    Turnstile check-in rate: 38.2%
                  </span>
                </div>

                <div className={`p-5 rounded-xl border shadow-xs space-y-2 ${
                  isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
                }`}>
                  <div className="flex items-center justify-between text-xs text-[#6B7280]">
                    <span>Eligible Settlement Balance</span>
                    <CreditCard className={`w-4 h-4 ${isDarkTheme ? 'text-white' : 'text-neutral-900'}`} />
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-500 font-mono">
                    {formatCurrency(orgBalance.availablePayoutMinor + 450000, 'ZAR')}
                  </div>
                  <span className="text-[11px] text-[#6B7280] block font-mono">
                    Net proceeds ready for payout
                  </span>
                </div>

              </div>

              {/* Upcoming Events Row */}
              <div className={`p-6 rounded-2xl border shadow-xs space-y-4 ${
                isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold">Upcoming Scheduled Events</h3>
                    <p className={`text-xs ${isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>Real-time progress toward event capacity</p>
                  </div>
                  <button
                    onClick={() => setActiveSection('events')}
                    className={`text-xs hover:underline font-bold flex items-center gap-1 cursor-pointer ${
                      isDarkTheme ? 'text-white' : 'text-neutral-900'
                    }`}
                  >
                    <span>View All ({allEvents.length})</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {allEvents.slice(0, 3).map((evt) => {
                    const totalCap = evt.tickets.reduce((a, b) => a + b.capacity, 0);
                    const totalRem = evt.tickets.reduce((a, b) => a + b.remaining, 0);
                    const sold = totalCap - totalRem;
                    const pctSold = totalCap > 0 ? Math.round((sold / totalCap) * 100) : 0;

                    return (
                      <div
                        key={evt.id}
                        className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 cursor-pointer hover:border-white transition-colors ${
                          isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-[#F8F7F4] border-[#E5E7EB]'
                        }`}
                        onClick={() => setInspectEventModal(evt)}
                      >
                        <div>
                          <div className={`flex items-center justify-between text-[11px] font-mono font-bold pb-1 ${
                            isDarkTheme ? 'text-white' : 'text-neutral-900'
                          }`}>
                            <span>{evt.venue.city}</span>
                            <span className="text-emerald-500 font-bold uppercase">{evt.status}</span>
                          </div>
                          <h4 className="text-sm font-bold truncate">{evt.title}</h4>
                          <p className={`text-xs ${isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'} line-clamp-1`}>{evt.shortSummary}</p>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-[#374151]/30">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#6B7280]">Capacity Sold:</span>
                            <span className="font-mono font-bold">{pctSold}% ({sold}/{totalCap})</span>
                          </div>
                          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkTheme ? 'bg-[#374151]' : 'bg-[#E5E7EB]'}`}>
                            <div className="bg-white text-black h-1.5 rounded-full" style={{ width: `${pctSold}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Performance Charts & Period Selection */}
              <div className={`p-6 rounded-2xl border shadow-xs space-y-6 ${
                isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E7EB]/10 pb-4">
                  <div>
                    <h3 className="text-sm font-bold">Registration & Revenue Momentum</h3>
                    <p className={`text-xs ${isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>Aggregated velocity across active African events</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Metric picker */}
                    <div className={`flex items-center gap-1 p-1 rounded-lg border text-xs font-semibold ${
                      isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-[#F8F7F4] border-[#E5E7EB]'
                    }`}>
                      <button
                        onClick={() => setChartMetric('revenue')}
                        className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                          chartMetric === 'revenue' ? 'bg-white text-black font-bold' : 'text-[#6B7280]'
                        }`}
                      >
                        Revenue
                      </button>
                      <button
                        onClick={() => setChartMetric('registrations')}
                        className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                          chartMetric === 'registrations' ? 'bg-white text-black font-bold' : 'text-[#6B7280]'
                        }`}
                      >
                        Registrations
                      </button>
                    </div>

                    {/* Period picker */}
                    <div className={`flex items-center gap-1 p-1 rounded-lg border text-xs font-semibold ${
                      isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-[#F8F7F4] border-[#E5E7EB]'
                    }`}>
                      {(['7d', '30d', '90d'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => setChartPeriod(p)}
                          className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                            chartPeriod === p ? (isDarkTheme ? 'bg-white text-[#111827] font-bold' : 'bg-[#111827] text-white') : 'text-[#6B7280]'
                          }`}
                        >
                          {p.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SVG Visual Performance Bar Chart */}
                <div className="h-56 w-full flex items-end gap-2 pt-4 pb-2 px-2 border-b border-[#E5E7EB]/10">
                  {[
                    { label: 'Day 1', val: 35, revenue: 'R 12k', reg: '35 reg' },
                    { label: 'Day 3', val: 52, revenue: 'R 21k', reg: '52 reg' },
                    { label: 'Day 6', val: 45, revenue: 'R 18k', reg: '45 reg' },
                    { label: 'Day 9', val: 78, revenue: 'R 34k', reg: '78 reg' },
                    { label: 'Day 12', val: 62, revenue: 'R 28k', reg: '62 reg' },
                    { label: 'Day 15', val: 94, revenue: 'R 46k', reg: '94 reg' },
                    { label: 'Day 18', val: 82, revenue: 'R 39k', reg: '82 reg' },
                    { label: 'Day 21', val: 110, revenue: 'R 58k', reg: '110 reg' },
                    { label: 'Day 24', val: 98, revenue: 'R 49k', reg: '98 reg' },
                    { label: 'Day 27', val: 135, revenue: 'R 72k', reg: '135 reg' },
                    { label: 'Today', val: 160, revenue: 'R 89k', reg: '160 reg' },
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className={`opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-bold ${
                        isDarkTheme ? 'text-white' : 'text-neutral-900'
                      }`}>
                        {chartMetric === 'revenue' ? bar.revenue : bar.reg}
                      </div>
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 group-hover:opacity-80 ${
                          isDarkTheme ? 'bg-[#374151]' : 'bg-[#1F2937]'
                        }`}
                        style={{ height: `${(bar.val / 160) * 160}px` }}
                      />
                      <span className="text-[10px] text-[#9CA3AF] font-mono pt-1">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2-Column Split: Priority Tasks & Live Activity Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Priority Tasks (Action Center) */}
                <div className={`lg:col-span-6 p-6 rounded-2xl border shadow-xs space-y-4 ${
                  isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
                }`}>
                  <div className="flex items-center justify-between border-b border-[#E5E7EB]/10 pb-3">
                    <h3 className="text-sm font-bold">Priority Action Items</h3>
                    <span className="text-xs bg-red-500/20 text-red-500 font-bold px-2 py-0.5 rounded font-mono">
                      {priorityTasks.filter(t => !t.resolved).length} Pending
                    </span>
                  </div>

                  <div className="space-y-3">
                    {priorityTasks.map(task => (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                          task.resolved
                            ? (isDarkTheme ? 'bg-[#1F2937]/40 border-[#374151]/40 opacity-50' : 'bg-gray-50 border-gray-200 opacity-60')
                            : task.urgency === 'high'
                            ? (isDarkTheme ? 'bg-red-950/20 border-red-900/50 text-red-200' : 'bg-red-50/70 border-red-200 text-red-900')
                            : (isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-[#F8F7F4] border-[#E5E7EB]')
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                            task.urgency === 'high' ? 'text-red-500' : 'text-[#6B7280]'
                          }`}>
                            {task.category.toUpperCase()} · {task.urgency.toUpperCase()} PRIORITY
                          </span>
                          <h5 className="font-bold text-xs">{task.title}</h5>
                        </div>

                        {!task.resolved ? (
                          <button
                            onClick={() => handleResolveTask(task.id)}
                            className="px-3 py-1.5 bg-white text-black hover:bg-neutral-200 font-bold rounded-lg shrink-0 cursor-pointer text-xs"
                          >
                            {task.actionLabel}
                          </button>
                        ) : (
                          <span className="text-emerald-500 font-bold flex items-center gap-1 font-mono">
                            <Check className="w-3.5 h-3.5" />
                            Resolved
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Activity Feed */}
                <div className={`lg:col-span-6 p-6 rounded-2xl border shadow-xs space-y-4 ${
                  isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
                }`}>
                  <div className="flex items-center justify-between border-b border-[#E5E7EB]/10 pb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold">Real-Time Event Activity Stream</h3>
                      <button
                        onClick={handleSimulateLiveActivity}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                          isDarkTheme ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-neutral-900 hover:bg-black text-white'
                        }`}
                        title="Simulate incoming ticket sale or check-in"
                      >
                        + Simulate Event
                      </button>
                    </div>
                    <Clock className="w-4 h-4 text-[#9CA3AF]" />
                  </div>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {filteredActivity.map(act => (
                      <div
                        key={act.id}
                        className={`p-3 rounded-xl border flex items-start gap-3 text-xs ${
                          isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-[#F8F7F4] border-[#E5E7EB]'
                        }`}
                      >
                        <div className={`p-2 rounded-lg border shrink-0 ${
                          isDarkTheme ? 'bg-[#111827] border-[#374151]' : 'bg-white border-[#E5E7EB]'
                        }`}>
                          {act.type === 'purchase' && <DollarSign className="w-3.5 h-3.5 text-emerald-500" />}
                          {act.type === 'checkin' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
                          {act.type === 'refund' && <RotateCcw className="w-3.5 h-3.5 text-red-500" />}
                          {act.type === 'campaign' && <Megaphone className="w-3.5 h-3.5 text-purple-500" />}
                          {act.type === 'rfp' && <Building2 className="w-3.5 h-3.5 text-amber-500" />}
                          {act.type === 'session' && <Calendar className="w-3.5 h-3.5 text-indigo-500" />}
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex justify-between items-center">
                            <span className="font-bold">{act.title}</span>
                            <span className="text-[10px] text-[#9CA3AF] font-mono">
                              {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className={isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}>{act.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* 2. EVENT MANAGEMENT                                       */}
          {/* ========================================================= */}
          {activeSection === 'events' && (
            <div className="space-y-6 animate-fade-in">
              
              <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border shadow-xs ${
                isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
              }`}>
                <div>
                  <h3 className="text-base font-bold">Event Portfolio & Inventory Capacity</h3>
                  <p className={`text-xs ${isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>Manage draft, published and scheduled events across African venues</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={eventSearchQuery}
                      onChange={e => setEventSearchQuery(e.target.value)}
                      className={`pl-8 pr-3 py-1.5 text-xs rounded-lg border focus:outline-none ${
                        isDarkTheme ? 'bg-[#1F2937] border-[#374151] text-white' : 'bg-white border-[#D1D5DB]'
                      }`}
                    />
                  </div>

                  <div className={`flex items-center gap-1 p-1 rounded-lg border text-xs ${
                    isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-[#F8F7F4] border-[#E5E7EB]'
                  }`}>
                    {['all', 'published', 'draft', 'cancelled'].map(st => (
                      <button
                        key={st}
                        onClick={() => setEventFilterStatus(st)}
                        className={`px-3 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                          eventFilterStatus === st ? 'bg-white text-black font-bold' : 'text-[#6B7280]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setStudioTemplate(undefined);
                      setStudioDuplicateId(undefined);
                      setShowCreateStudio(true);
                    }}
                    className="px-4 py-2 bg-white text-black hover:bg-neutral-200 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Event Studio</span>
                  </button>
                </div>
              </div>

              {/* Event Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(evt => {
                  const totalCap = evt.tickets.reduce((a, b) => a + b.capacity, 0);
                  const totalRem = evt.tickets.reduce((a, b) => a + b.remaining, 0);
                  const sold = totalCap - totalRem;
                  const pctSold = totalCap > 0 ? Math.round((sold / totalCap) * 100) : 0;
                  const grossRevenue = evt.tickets.reduce((acc, t) => acc + ((t.capacity - t.remaining) * t.priceMinor), 0);

                  return (
                    <div
                      key={evt.id}
                      className={`rounded-2xl border overflow-hidden shadow-xs flex flex-col justify-between transition-all hover:border-white/60 ${
                        isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
                      }`}
                    >
                      <div>
                        <div className="relative aspect-[16/10] bg-gray-900">
                          <img src={evt.coverImage} alt={evt.title} className="w-full h-full object-cover" />
                          <div className={`absolute top-2.5 right-2.5 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase shadow-md ${
                            evt.status === 'published' ? 'bg-emerald-600 text-white' :
                            evt.status === 'cancelled' ? 'bg-red-600 text-white' :
                            'bg-amber-600 text-white'
                          }`}>
                            {evt.status}
                          </div>
                          <div className="absolute bottom-2.5 left-2.5 bg-[#111827]/85 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded">
                            {evt.venue.city} · {evt.category}
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <h4 className="text-base font-bold line-clamp-1">{evt.title}</h4>
                          <p className={`text-xs ${isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'} line-clamp-2`}>{evt.shortSummary}</p>
                          
                          <div className={`text-xs flex items-center justify-between ${isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>
                            <span className="flex items-center gap-1.5">
                              <Calendar className={`w-3.5 h-3.5 ${isDarkTheme ? 'text-white' : 'text-neutral-900'}`} />
                              <span>{formatEventDate(evt.startDate)}</span>
                            </span>
                            <span className={`font-mono font-bold ${isDarkTheme ? 'text-white' : 'text-neutral-900'}`}>
                              {formatCurrency(grossRevenue, evt.currency)} gross
                            </span>
                          </div>

                          {/* Capacity Progress Bar */}
                          <div className="space-y-1 pt-1 border-t border-[#374151]/30">
                            <div className="flex justify-between text-xs">
                              <span className={isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}>Capacity Sold:</span>
                              <span className="font-mono font-bold">{pctSold}% ({sold}/{totalCap})</span>
                            </div>
                            <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkTheme ? 'bg-[#374151]' : 'bg-[#E5E7EB]'}`}>
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  evt.status === 'cancelled' ? 'bg-red-500' : isDarkTheme ? 'bg-white' : 'bg-neutral-900'
                                }`}
                                style={{ width: `${pctSold}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tool Action Panel on Event Card */}
                      <div className={`p-3.5 border-t space-y-2 text-xs ${
                        isDarkTheme ? 'bg-[#1F2937]/50 border-[#1F2937]' : 'bg-[#F8F7F4] border-[#E5E7EB]'
                      }`}>
                        {/* Primary Performance button */}
                        <button
                          onClick={() => setEventForPerformance(evt)}
                          className={`w-full py-2 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors ${
                            isDarkTheme ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-black'
                          }`}
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span>View Statistics & Detailed Performance</span>
                        </button>

                        {/* Secondary Quick Action Tools */}
                        <div className="flex items-center justify-between pt-1 gap-1 text-[11px]">
                          <button
                            onClick={() => setEventToEdit(evt)}
                            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                              isDarkTheme ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-neutral-800 hover:text-black hover:bg-neutral-200'
                            }`}
                            title="Edit event settings and tickets"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => {
                              setStudioDuplicateId(evt.id);
                              setStudioTemplate(undefined);
                              setShowCreateStudio(true);
                            }}
                            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                              isDarkTheme ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-neutral-800 hover:text-black hover:bg-neutral-200'
                            }`}
                            title="Duplicate this event"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Duplicate</span>
                          </button>

                          {evt.status !== 'cancelled' ? (
                            <button
                              onClick={() => setEventToCancel(evt)}
                              className="px-2.5 py-1 text-amber-300 hover:text-amber-200 hover:bg-amber-500/20 rounded-lg font-medium flex items-center gap-1 cursor-pointer transition-colors"
                              title="Cancel event and halt ticket sales"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              <span>Cancel</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const updated = store.updateEvent(evt.id, { status: 'published' });
                                if (updated) {
                                  setOrganizers([...store.getOrganizers()]);
                                  showNotification(`Event "${evt.title}" re-published!`);
                                }
                              }}
                              className="px-2.5 py-1 text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/20 rounded-lg font-medium flex items-center gap-1 cursor-pointer transition-colors"
                              title="Resume event ticket sales"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Resume</span>
                            </button>
                          )}

                          <button
                            onClick={() => setEventToDelete(evt)}
                            className="px-2.5 py-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg font-medium flex items-center gap-1 cursor-pointer transition-colors"
                            title="Delete event permanently"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* 3. REGISTRATION AND ATTENDEES                             */}
          {/* ========================================================= */}
          {activeSection === 'attendees' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Registration Conversion Funnel */}
              <div className={`p-6 rounded-2xl border shadow-xs space-y-4 ${
                isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
              }`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold">Registration Conversion Funnel</h3>
                  <span className="text-xs text-emerald-500 font-semibold font-mono">Overall Conversion: 7.4%</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border space-y-1 ${
                    isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-[#F8F7F4] border-[#E5E7EB]'
                  }`}>
                    <span className="text-[#6B7280] block">1. Discovery Impressions</span>
                    <strong className="text-base font-extrabold font-mono">24,500</strong>
                    <span className="text-[10px] text-gray-400 block">100% Top of Funnel</span>
                  </div>
                  <div className={`p-3 rounded-xl border space-y-1 ${
                    isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-[#F8F7F4] border-[#E5E7EB]'
                  }`}>
                    <span className="text-[#6B7280] block">2. Event Page Views</span>
                    <strong className="text-base font-extrabold font-mono">8,120</strong>
                    <span className="text-[10px] text-emerald-500 block">33.1% Page Engagement</span>
                  </div>
                  <div className={`p-3 rounded-xl border space-y-1 ${
                    isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-[#F8F7F4] border-[#E5E7EB]'
                  }`}>
                    <span className="text-[#6B7280] block">3. Checkout Starts</span>
                    <strong className="text-base font-extrabold font-mono">2,490</strong>
                    <span className="text-[10px] text-emerald-500 block">30.6% Ticket Selection</span>
                  </div>
                  <div className={`p-3 rounded-xl border space-y-1 ${
                    isDarkTheme ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <span className="text-emerald-500 block">4. Paid Registrations</span>
                    <strong className="text-base font-extrabold text-emerald-500 font-mono">
                      {allTickets.length + 1820}
                    </strong>
                    <span className="text-[10px] text-emerald-600 block">73.1% Payment Success</span>
                  </div>
                </div>
              </div>

              {/* Attendee Directory & Controls */}
              <div className={`p-6 rounded-2xl border shadow-xs space-y-4 ${
                isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
              }`}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold">Attendee Directory & Guest List</h3>
                    <p className={`text-xs ${isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>Real-time ticketing records across your published African events</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setShowAddAttendeeModal(true)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                        isDarkTheme ? 'bg-[#1F2937] hover:bg-[#374151] border-[#374151]' : 'bg-[#F8F7F4] hover:bg-[#E5E7EB] border-[#D1D5DB]'
                      }`}
                    >
                      + Register Guest
                    </button>
                    <button
                      onClick={() => setShowBroadcastModal(true)}
                      className="px-3 py-1.5 bg-[#111827] text-white hover:bg-[#1F2937] text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer border border-[#374151]"
                    >
                      <Send className="w-3.5 h-3.5 text-white" />
                      <span>Broadcast to Attendees</span>
                    </button>
                    <button
                      onClick={() => handleExportCSV('attendees')}
                      className="px-3 py-1.5 bg-white text-black hover:bg-neutral-200 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={attendeeSearchQuery}
                      onChange={e => setAttendeeSearchQuery(e.target.value)}
                      placeholder="Search by attendee name, email, or ticket code..."
                      className={`w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:border-white ${
                        isDarkTheme ? 'bg-[#1F2937] border-[#374151] text-white' : 'bg-white border-[#D1D5DB]'
                      }`}
                    />
                  </div>

                  <select
                    value={attendeeStatusFilter}
                    onChange={e => setAttendeeStatusFilter(e.target.value)}
                    className={`px-3 py-2 text-xs border rounded-lg ${
                      isDarkTheme ? 'bg-[#1F2937] border-[#374151] text-white' : 'bg-white border-[#D1D5DB]'
                    }`}
                  >
                    <option value="all">All Admittance Statuses</option>
                    <option value="valid">Valid Passes Only</option>
                    <option value="checked_in">Checked In</option>
                    <option value="refunded">Refunded / Revoked</option>
                  </select>
                </div>

                {/* Attendee Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`border-b uppercase font-semibold ${
                      isDarkTheme ? 'bg-[#1F2937] text-[#9CA3AF] border-[#374151]' : 'bg-[#F8F7F4] text-[#6B7280] border-[#E5E7EB]'
                    }`}>
                      <tr>
                        <th className="p-3">Ticket Code</th>
                        <th className="p-3">Attendee Name</th>
                        <th className="p-3">Email & Phone</th>
                        <th className="p-3">Event & Tier</th>
                        <th className="p-3">Admittance</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkTheme ? 'divide-[#374151]' : 'divide-[#E5E7EB]'}`}>
                      {filteredAttendees.map(tkt => (
                        <tr key={tkt.id} className={isDarkTheme ? 'hover:bg-[#1F2937]/50' : 'hover:bg-[#F8F7F4]/60'}>
                          <td className="p-3 font-mono font-bold">{tkt.ticketCode}</td>
                          <td className="p-3 font-bold">{tkt.attendeeName}</td>
                          <td className="p-3 text-[#9CA3AF]">{tkt.attendeeEmail}</td>
                          <td className="p-3">
                            <div className="font-semibold truncate max-w-[180px]">{tkt.eventTitle}</div>
                            <div className={`text-[11px] ${isDarkTheme ? 'text-white/70' : 'text-neutral-600'}`}>{tkt.tierName}</div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                              tkt.status === 'checked_in'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                                : tkt.status === 'refunded'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            }`}>
                              {tkt.status === 'checked_in' ? 'Checked In' : tkt.status === 'refunded' ? 'Refunded' : 'Valid'}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => handleToggleAttendeeCheckIn(tkt)}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer ${
                                tkt.status === 'checked_in'
                                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-[#374151] dark:text-gray-300'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
                              }`}
                            >
                              {tkt.status === 'checked_in' ? 'Check Out' : 'Check In'}
                            </button>
                            <button
                              onClick={() => setEditAttendeeModal(tkt)}
                              className={`text-xs hover:underline font-semibold cursor-pointer ${
                                isDarkTheme ? 'text-white' : 'text-neutral-900'
                              }`}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* 4. VENUE SOURCING AND AGENDA                              */}
          {/* ========================================================= */}
          {activeSection === 'venues_agenda' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Venue Directory & RFP Actions */}
              <div className={`p-6 rounded-2xl border shadow-xs space-y-4 ${
                isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold">African Venue Directory & Sourcing</h3>
                    <p className={`text-xs ${isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>Browse verified conference arenas, amphitheatres, and convention spaces</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowRFPModal(true)}
                      className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Venue RFP</span>
                    </button>
                  </div>
                </div>

                {/* Search & City Filter for Venues */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search venues by name, city, or facilities..."
                      value={venueSearchQuery}
                      onChange={e => setVenueSearchQuery(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-none ${
                        isDarkTheme ? 'bg-[#1F2937] border-[#374151] text-white' : 'bg-white border-[#D1D5DB]'
                      }`}
                    />
                  </div>

                  <select
                    value={venueCityFilter}
                    onChange={e => setVenueCityFilter(e.target.value)}
                    className={`px-3 py-2 text-xs border rounded-lg ${
                      isDarkTheme ? 'bg-[#1F2937] border-[#374151] text-white' : 'bg-white border-[#D1D5DB]'
                    }`}
                  >
                    <option value="all">All Cities</option>
                    <option value="Cape Town">Cape Town</option>
                    <option value="Kigali">Kigali</option>
                    <option value="Lagos">Lagos</option>
                    <option value="Johannesburg">Johannesburg</option>
                    <option value="Nairobi">Nairobi</option>
                  </select>
                </div>

                {/* Sourcing Hubs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {filteredVenues.map((v, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border space-y-2 flex flex-col justify-between ${
                        isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-[#F8F7F4] border-[#E5E7EB]'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Building2 className={`w-4 h-4 ${isDarkTheme ? 'text-white' : 'text-neutral-700'}`} />
                          <h4 className="text-sm font-bold truncate">{v.name}</h4>
                        </div>
                        <p className={`text-xs ${isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>
                          {v.city}, {v.country} · {v.cap.toLocaleString()} Max Attendees
                        </p>
                        <div className={`text-xs font-mono font-bold ${isDarkTheme ? 'text-white' : 'text-neutral-900'}`}>
                          Est. Rate: {v.rate}
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {v.tags.map(t => (
                            <span
                              key={t}
                              className={`text-[10px] px-2 py-0.5 rounded border ${
                                isDarkTheme ? 'bg-[#111827] text-gray-300 border-[#374151]' : 'bg-white text-[#4B5563] border-[#E5E7EB]'
                              }`}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setRfpVenueName(v.name);
                            setShowRFPModal(true);
                          }}
                          className="w-full py-1.5 bg-[#111827] hover:bg-[#1F2937] text-white text-xs font-semibold rounded-lg border border-[#374151] cursor-pointer"
                        >
                          Request Proposal (RFP)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submitted RFPs Table */}
                <div className="pt-4 border-t border-[#374151]/30 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                    Submitted Venue Proposals & RFPs ({venueRFPs.length})
                  </h4>
                  <div className={`divide-y ${isDarkTheme ? 'divide-[#374151]' : 'divide-[#E5E7EB]'}`}>
                    {venueRFPs.map(rfp => (
                      <div key={rfp.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="font-bold">{rfp.venueName}</span>
                          <span className={isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}>
                            {' '}· Target Date: {rfp.targetDate} · {rfp.expectedAttendees} Expected Guests
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono">{rfp.budgetFormatted}</span>
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                            rfp.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {rfp.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Programme & Agenda Management */}
              <div className={`p-6 rounded-2xl border shadow-xs space-y-4 ${
                isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold">Session Scheduling & Agenda Builder</h3>
                    <p className={`text-xs ${isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>Configure daily run-downs, stages, speakers, and timing</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSessionModal(true)}
                      className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Schedule Session</span>
                    </button>
                  </div>
                </div>

                {/* Event Selector & Track Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <select
                    value={agendaEventFilter}
                    onChange={e => setAgendaEventFilter(e.target.value)}
                    className={`px-3 py-2 text-xs border rounded-lg ${
                      isDarkTheme ? 'bg-[#1F2937] border-[#374151] text-white' : 'bg-white border-[#D1D5DB]'
                    }`}
                  >
                    {allEvents.map(ev => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({ev.venue.city})
                      </option>
                    ))}
                  </select>

                  <div className="text-xs text-[#9CA3AF]">
                    {agendaSessions.length} total sessions scheduled
                  </div>
                </div>

                {/* Timetable View */}
                <div className="space-y-3">
                  {filteredAgendaSessions.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border flex items-start gap-4 text-xs ${
                        isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-[#F8F7F4] border-[#E5E7EB]'
                      }`}
                    >
                      <div className={`font-mono font-bold text-sm w-20 shrink-0 pt-0.5 ${isDarkTheme ? 'text-white' : 'text-neutral-900'}`}>
                        {item.time}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm">{item.title}</h5>
                          {item.stage && (
                            <span className={`text-[10px] px-2 py-0.5 rounded border ${
                              isDarkTheme ? 'bg-[#111827] text-gray-300 border-[#374151]' : 'bg-white text-[#4B5563] border-[#E5E7EB]'
                            }`}>
                              {item.stage}
                            </span>
                          )}
                        </div>
                        {item.speaker && (
                          <p className={`text-xs ${isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>
                            Speaker: <strong className={isDarkTheme ? 'text-white' : 'text-[#111827]'}>{item.speaker}</strong>
                          </p>
                        )}
                        {item.description && (
                          <p className={`text-xs ${isDarkTheme ? 'text-[#D1D5DB]' : 'text-[#4B5563]'}`}>{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* 5. ENGAGEMENT, MARKETING AND ANALYTICS                    */}
          {/* ========================================================= */}
          {activeSection === 'marketing_analytics' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Subtabs for Section 5 */}
              <div className={`p-1.5 rounded-xl border flex flex-wrap gap-1 ${
                isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
              }`}>
                {[
                  { id: 'hub', label: 'Attendee Hub & Badge Pass' },
                  { id: 'checkin', label: 'Gate Check-In & Scanner' },
                  { id: 'campaigns', label: 'Marketing Campaigns' },
                  { id: 'reports', label: 'Financial & Audit Reports' },
                  { id: 'settings', label: 'Integrations & Workspace' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setEngagementSubTab(tab.id as any)}
                    className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      engagementSubTab === tab.id
                        ? 'bg-white text-black'
                        : (isDarkTheme ? 'text-[#9CA3AF] hover:text-white' : 'text-[#6B7280] hover:text-[#111827]')
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* SUBTAB 1: ATTENDEE HUB PREVIEW */}
              {engagementSubTab === 'hub' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Mobile Preview Frame */}
                  <div className={`lg:col-span-5 p-6 rounded-2xl border shadow-xs space-y-4 ${
                    isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
                  }`}>
                    <div className="flex items-center justify-between border-b border-[#374151]/30 pb-3">
                      <div>
                        <h4 className="text-sm font-bold">Attendee Hub Digital Experience</h4>
                        <p className={`text-xs ${isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>Interactive attendee wallet and conference companion</p>
                      </div>
                      <Smartphone className={`w-5 h-5 ${isDarkTheme ? 'text-white' : 'text-neutral-700'}`} />
                    </div>

                    {/* Virtual Smartphone Card */}
                    <div className="bg-[#111827] text-white p-5 rounded-2xl border-2 border-[#374151] space-y-4 shadow-xl">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white font-mono">NEXORA PASS</span>
                        <span className="bg-emerald-500/20 text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded font-bold">VIP ACCESS</span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-lg font-extrabold">{allEvents[0]?.title}</h3>
                        <p className="text-xs text-[#9CA3AF]">{allEvents[0]?.venue.name}, {allEvents[0]?.venue.city}</p>
                      </div>

                      <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center text-[#111827] space-y-2">
                        <QrCode className="w-28 h-28 text-[#111827]" />
                        <span className="font-mono text-xs font-bold tracking-wider">NX-TKT-84920-VIP</span>
                        <span className="text-[10px] text-gray-500">Scan at any official turnstile gate</span>
                      </div>

                      <div className="text-xs text-center text-[#9CA3AF]">
                        Passholder: <strong className="text-white">Amina Mohamed (Managing Partner)</strong>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Live Poll & Q&A Simulation */}
                  <div className={`lg:col-span-7 p-6 rounded-2xl border shadow-xs space-y-6 ${
                    isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
                  }`}>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold">Live Plenary Poll & Q&A Stream</h4>
                      <p className={`text-xs ${isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>Simulate real-time attendee audience participation</p>
                    </div>

                    {/* Poll */}
                    <div className={`p-4 rounded-xl border space-y-3 ${
                      isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-[#F8F7F4] border-[#E5E7EB]'
                    }`}>
                      <span className={`text-[10px] font-mono uppercase font-bold ${isDarkTheme ? 'text-white' : 'text-neutral-700'}`}>Active Live Poll</span>
                      <h5 className="font-bold text-xs">Which keynote presentation are you most excited to attend?</h5>

                      <div className="space-y-2">
                        {[
                          { id: 1, title: 'Keynote: Cross-Border African Payment Rails', votes: pollVotes[1] },
                          { id: 2, title: 'Fireside: Music Festival Production at Scale', votes: pollVotes[2] },
                          { id: 3, title: 'Workshop: Digital Innovation in Stage Architecture', votes: pollVotes[3] },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setHubSelectedPoll(opt.id);
                              setPollVotes(prev => ({ ...prev, [opt.id]: (prev as any)[opt.id] + 1 }));
                              playAudioFeedback('success');
                              showNotification('Vote recorded!');
                            }}
                            className={`w-full p-2.5 rounded-lg border text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                              hubSelectedPoll === opt.id
                                ? (isDarkTheme ? 'bg-white/20 border-white font-bold text-white' : 'bg-neutral-900 border-black font-bold text-white')
                                : (isDarkTheme ? 'bg-[#111827] border-[#374151] hover:border-white text-white' : 'bg-white border-[#E5E7EB] hover:border-black text-neutral-900')
                            }`}
                          >
                            <span>{opt.title}</span>
                            <span className={`font-mono ${hubSelectedPoll === opt.id ? 'text-white' : (isDarkTheme ? 'text-white' : 'text-neutral-900')}`}>{opt.votes} votes</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Q&A */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Audience Q&A Stream</h5>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Submit a question for plenary speakers..."
                          value={qaInput}
                          onChange={e => setQaInput(e.target.value)}
                          className={`flex-1 px-3 py-2 text-xs border rounded-lg focus:outline-none ${
                            isDarkTheme ? 'bg-[#1F2937] border-[#374151] text-white' : 'bg-white border-[#D1D5DB]'
                          }`}
                        />
                        <button
                          onClick={() => {
                            if (!qaInput.trim()) return;
                            setQaQuestions(prev => [
                              { id: 'q-' + Date.now(), author: 'Audience Guest', text: qaInput.trim(), upvotes: 1, voted: true },
                              ...prev,
                            ]);
                            setQaInput('');
                            playAudioFeedback('success');
                            showNotification('Question submitted to plenary moderation queue.');
                          }}
                          className="px-4 py-2 bg-[#111827] hover:bg-[#1F2937] text-white font-bold text-xs rounded-lg cursor-pointer"
                        >
                          Ask
                        </button>
                      </div>

                      <div className="space-y-2">
                        {qaQuestions.map(q => (
                          <div
                            key={q.id}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                              isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-[#F8F7F4] border-[#E5E7EB]'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-[#9CA3AF]">{q.author}</span>
                              <p className="font-medium">{q.text}</p>
                            </div>
                            <button
                              onClick={() => {
                                setQaQuestions(prev => prev.map(item => item.id === q.id ? { ...item, upvotes: item.upvotes + 1 } : item));
                                playAudioFeedback('success');
                              }}
                              className={`px-2.5 py-1 font-bold rounded flex items-center gap-1 cursor-pointer transition-colors ${
                                isDarkTheme ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                              }`}
                            >
                              <span>▲</span>
                              <span className="font-mono">{q.upvotes}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* SUBTAB 2: GATE CHECK-IN OPERATIONS */}
              {engagementSubTab === 'checkin' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Fast Check-In Form */}
                  <div className={`lg:col-span-6 p-6 rounded-2xl border shadow-xs space-y-4 ${
                    isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
                  }`}>
                    <div className="flex justify-between items-center border-b border-[#374151]/30 pb-3">
                      <div>
                        <h4 className="text-sm font-bold">Fast Turnstile Gate Check-In</h4>
                        <p className={`text-xs ${isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>Lookup ticket code or attendee email for instant admittance</p>
                      </div>
                      <Volume2 className={`w-4 h-4 ${isDarkTheme ? 'text-white' : 'text-neutral-700'}`} />
                    </div>

                    <form onSubmit={handleFastManualCheckIn} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold mb-1">Enter Ticket Code, Name or Email</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={manualCheckInCode}
                            onChange={e => setManualCheckInCode(e.target.value)}
                            placeholder="e.g. NX-84920 or attendee@email.com"
                            className={`flex-1 px-3 py-2 text-xs font-mono border rounded-lg focus:outline-none focus:border-white ${
                              isDarkTheme ? 'bg-[#1F2937] border-[#374151] text-white' : 'bg-white border-[#D1D5DB]'
                            }`}
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-white text-black hover:bg-neutral-200 font-bold text-xs rounded-lg cursor-pointer"
                          >
                            Verify & Admit
                          </button>
                        </div>
                      </div>

                      {manualCheckInResult && (
                        <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                          manualCheckInResult.status === 'success'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {manualCheckInResult.status === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                          )}
                          <span>{manualCheckInResult.message}</span>
                        </div>
                      )}
                    </form>

                    {onLaunchScanner && (
                      <div className="pt-2">
                        <button
                          onClick={onLaunchScanner}
                          className="w-full py-2.5 bg-[#1F2937] hover:bg-[#374151] text-white font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer border border-[#374151]"
                        >
                          <QrCode className="w-4 h-4 text-white" />
                          <span>Launch Live Camera Barcode Scanner</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Gate Velocity & Audit Logs */}
                  <div className={`lg:col-span-6 p-6 rounded-2xl border shadow-xs space-y-4 ${
                    isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
                  }`}>
                    <div className="flex justify-between items-center border-b border-[#374151]/30 pb-3">
                      <div>
                        <h4 className="text-sm font-bold">Gate Velocity & Audit Logs</h4>
                        <p className={`text-xs ${isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>Real-time throughput across turnstiles</p>
                      </div>
                      <button
                        onClick={() => handleExportCSV('logs')}
                        className={`text-xs hover:underline font-bold ${
                          isDarkTheme ? 'text-white' : 'text-neutral-900'
                        }`}
                      >
                        Download CSV
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className={`p-3 rounded-xl border ${isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-[#F8F7F4] border-[#E5E7EB]'}`}>
                        <span className="text-[#6B7280] block text-[10px]">Gate 1 (Main)</span>
                        <strong className="text-base font-mono">248</strong>
                      </div>
                      <div className={`p-3 rounded-xl border ${isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-[#F8F7F4] border-[#E5E7EB]'}`}>
                        <span className="text-[#6B7280] block text-[10px]">Gate 2 (VIP)</span>
                        <strong className="text-base font-mono">94</strong>
                      </div>
                      <div className={`p-3 rounded-xl border ${isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-[#F8F7F4] border-[#E5E7EB]'}`}>
                        <span className="text-[#6B7280] block text-[10px]">Gate 3 (Staff)</span>
                        <strong className="text-base font-mono">70</strong>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {store.getCheckInLogs().slice(0, 5).map(log => (
                        <div
                          key={log.id}
                          className={`p-2.5 rounded-lg border flex items-center justify-between text-xs font-mono ${
                            isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-[#F8F7F4] border-[#E5E7EB]'
                          }`}
                        >
                          <div>
                            <span className="font-bold">{log.ticketCode}</span>
                            <span className="text-[10px] text-[#9CA3AF]"> · {log.gate}</span>
                          </div>
                          <span className={`text-[10px] font-bold ${
                            log.result === 'valid' ? 'text-emerald-500' : 'text-red-500'
                          }`}>
                            {log.result.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* SUBTAB 3: MARKETING CAMPAIGNS */}
              {engagementSubTab === 'campaigns' && (
                <div className={`p-6 rounded-2xl border shadow-xs space-y-4 ${
                  isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
                }`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold">Marketing Campaigns & Audience Growth</h3>
                      <p className={`text-xs ${isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>Track email broadcasts, promoter referrals, and conversion ROI</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowPromoModal(true)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                          isDarkTheme ? 'bg-[#1F2937] hover:bg-[#374151] border-[#374151]' : 'bg-[#F8F7F4] hover:bg-[#E59516] border-[#D1D5DB]'
                        }`}
                      >
                        + Promo Code
                      </button>
                      <button
                        onClick={() => setShowCampaignModal(true)}
                        className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Campaign</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className={`border-b uppercase font-semibold ${
                        isDarkTheme ? 'bg-[#1F2937] text-[#9CA3AF] border-[#374151]' : 'bg-[#F8F7F4] text-[#6B7280] border-[#E5E7EB]'
                      }`}>
                        <tr>
                          <th className="p-3">Campaign Name</th>
                          <th className="p-3">Channel</th>
                          <th className="p-3">Recipients</th>
                          <th className="p-3">Open Rate</th>
                          <th className="p-3">Conversion</th>
                          <th className="p-3 text-right">Revenue Generated</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDarkTheme ? 'divide-[#374151]' : 'divide-[#E5E7EB]'}`}>
                        {marketingCampaigns.map(camp => (
                          <tr key={camp.id} className={isDarkTheme ? 'hover:bg-[#1F2937]/50' : 'hover:bg-[#F8F7F4]/60'}>
                            <td className="p-3 font-bold">{camp.title}</td>
                            <td className="p-3 uppercase font-mono text-[10px] text-[#9CA3AF]">{camp.type}</td>
                            <td className="p-3 font-mono">{camp.sentCount.toLocaleString()}</td>
                            <td className="p-3 text-emerald-500 font-bold font-mono">{camp.openRate}%</td>
                            <td className="p-3 text-blue-500 font-bold font-mono">{camp.conversionRate}%</td>
                            <td className="p-3 text-right font-mono font-bold">
                              {formatCurrency(camp.revenueGeneratedMinor, camp.currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUBTAB 4: REPORTS */}
              {engagementSubTab === 'reports' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Financial & Audit Reports */}
                  <div className={`p-6 rounded-2xl border shadow-xs space-y-4 ${
                    isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
                  }`}>
                    <h3 className="text-sm font-bold">Export Financial & Audit Reports</h3>
                    <div className="space-y-2.5 text-xs">
                      <div className={`p-3 rounded-xl flex items-center justify-between ${
                        isDarkTheme ? 'bg-[#1F2937]' : 'bg-[#F8F7F4]'
                      }`}>
                        <div>
                          <strong className="block">Settlement Financial Ledger (.CSV)</strong>
                          <span className={isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}>Double-entry journal for bank reconciliation</span>
                        </div>
                        <button
                          onClick={() => handleExportCSV('ledger')}
                          className={`hover:underline font-bold ${isDarkTheme ? 'text-white' : 'text-neutral-900'}`}
                        >
                          Download
                        </button>
                      </div>

                      <div className={`p-3 rounded-xl flex items-center justify-between ${
                        isDarkTheme ? 'bg-[#1F2937]' : 'bg-[#F8F7F4]'
                      }`}>
                        <div>
                          <strong className="block">Attendance & Scanner Logs (.CSV)</strong>
                          <span className={isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}>Turnstile admissions and staff audit history</span>
                        </div>
                        <button
                          onClick={() => handleExportCSV('logs')}
                          className={`hover:underline font-bold ${isDarkTheme ? 'text-white' : 'text-neutral-900'}`}
                        >
                          Download
                        </button>
                      </div>

                      <div className={`p-3 rounded-xl flex items-center justify-between ${
                        isDarkTheme ? 'bg-[#1F2937]' : 'bg-[#F8F7F4]'
                      }`}>
                        <div>
                          <strong className="block">Attendee Directory Export (.CSV)</strong>
                          <span className={isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}>Complete registered attendee roster</span>
                        </div>
                        <button
                          onClick={() => handleExportCSV('attendees')}
                          className={`hover:underline font-bold ${isDarkTheme ? 'text-white' : 'text-neutral-900'}`}
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Embeddable Ticket Widget Preview */}
                  <div className={`p-6 rounded-2xl border shadow-xs space-y-4 ${
                    isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
                  }`}>
                    <h3 className="text-sm font-bold">Website Embed Ticket Widget</h3>
                    <p className={`text-xs ${isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>Embed NEXORA checkout directly into your artist or festival website</p>

                    <div className="p-3 bg-[#111827] text-[#9CA3AF] rounded-xl font-mono text-[11px] overflow-x-auto border border-[#374151]">
                      <code>
                        {`<iframe src="https://nexora.events/embed/${allEvents[0]?.slug}" width="100%" height="480" frameborder="0"></iframe>`}
                      </code>
                    </div>

                    <div className="text-[11px] text-[#9CA3AF]">
                      Supports direct Paystack, M-Pesa, and Ozow checkout within an isolated iFrame container.
                    </div>
                  </div>

                </div>
              )}

              {/* SUBTAB 5: INTEGRATIONS & WORKSPACE SETTINGS */}
              {engagementSubTab === 'settings' && (
                <div className={`p-6 rounded-2xl border shadow-xs space-y-6 ${
                  isDarkTheme ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold">Payment Rails & Third-Party Integrations</h3>
                      <p className={`text-xs ${isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>Connect your verified gateways and external automation tools</p>
                    </div>
                    <button
                      onClick={() => setActiveSection('integrations')}
                      className="px-3.5 py-1.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors cursor-pointer shadow-xs"
                    >
                      Open Integrations Suite →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {integrations.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                          isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-[#F8F7F4] border-[#E5E7EB]'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs">{item.name}</span>
                            <span className="text-[10px] text-[#9CA3AF] uppercase font-mono">{item.category}</span>
                          </div>
                          <p className={`text-xs ${isDarkTheme ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>{item.desc}</p>
                        </div>

                        <button
                          onClick={() => toggleIntegration(item.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                            item.status
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {item.status ? 'Connected' : 'Connect'}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Team Members & Roles */}
                  <div className="pt-4 border-t border-[#374151]/30 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Workspace Team Members ({teamMembers.length})</h4>
                    <div className="space-y-2">
                      {teamMembers.map(tm => (
                        <div
                          key={tm.id}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                            isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-[#F8F7F4] border-[#E5E7EB]'
                          }`}
                        >
                          <div>
                            <strong className="block">{tm.name}</strong>
                            <span className="text-[#9CA3AF]">{tm.email}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                            isDarkTheme ? 'bg-white/10 text-white' : 'bg-neutral-900 text-white'
                          }`}>
                            {tm.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* 6. THIRD-PARTY PLATFORM INTEGRATIONS                      */}
          {/* ========================================================= */}
          {activeSection === 'integrations' && (
            <IntegrationsManager
              organizer={currentOrg}
              theme={isDarkTheme ? 'dark' : 'light'}
              onNotification={showNotification}
            />
          )}

          {/* ========================================================= */}
          {/* 7. ORGANIZER PROFILE & BRANDING OVERVIEW                  */}
          {/* ========================================================= */}
          {activeSection === 'profile' && (
            <OrganizerProfilePage
              organizer={currentOrg}
              onBack={() => setActiveSection('dashboard')}
              onSaved={(updated) => {
                setOrganizers([...store.getOrganizers()]);
                playAudioFeedback('success');
                showNotification(`Profile for "${updated.name}" updated successfully.`);
              }}
              theme={isDarkTheme ? 'dark' : 'light'}
            />
          )}

        </div>

      </div>

      {/* ========================================================= */}
      {/* FULL-SUITE CREATE EVENT STUDIO                            */}
      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* FULL-WEBPAGE: EVENT PERFORMANCE & STATISTICS PAGE         */}
      {/* ========================================================= */}
      {(eventForPerformance || inspectEventModal) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black">
          <EventPerformancePage
            event={(eventForPerformance || inspectEventModal)!}
            onBack={() => {
              setEventForPerformance(null);
              setInspectEventModal(null);
            }}
            onEdit={(evt) => {
              setEventToEdit(evt);
            }}
            onLaunchScanner={onLaunchScanner}
            onViewPublic={(evt) => {
              setEventForPerformance(null);
              setInspectEventModal(null);
              onBackToMarketplace();
            }}
            onDuplicate={(evt) => {
              setEventForPerformance(null);
              setInspectEventModal(null);
              setStudioDuplicateId(evt.id);
              setStudioTemplate(undefined);
              setShowCreateStudio(true);
            }}
            onCancel={(evt) => {
              setEventToCancel(evt);
            }}
            onDelete={(evt) => {
              setEventToDelete(evt);
            }}
            theme={isDarkTheme ? "dark" : "light"}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* FULL-WEBPAGE: GUEST TICKET SCANNER COMMAND CENTRE         */}
      {/* ========================================================= */}
      {showStaffGatePage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black">
          <GuestTicketScannerPage
            onBack={() => setShowStaffGatePage(false)}
            onLaunchScannerModal={onLaunchScanner}
            theme={isDarkTheme ? "dark" : "light"}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* FULL-WEBPAGE: EDIT EVENT MANAGEMENT PAGE                 */}
      {/* ========================================================= */}
      {eventToEdit && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black">
          <EditEventPage
            event={eventToEdit}
            onBack={() => setEventToEdit(null)}
            onSave={handleSavedEditedEvent}
            theme={isDarkTheme ? 'dark' : 'light'}
          />
        </div>
      )}

      {(showCreateStudio || showCreateEventModal) && (
        <CreateEventStudio
          onClose={() => {
            setShowCreateStudio(false);
            setShowCreateEventModal(false);
            setStudioTemplate(undefined);
            setStudioDuplicateId(undefined);
          }}
          onEventCreated={(created) => {
            setShowCreateStudio(false);
            setShowCreateEventModal(false);
            setStudioTemplate(undefined);
            setStudioDuplicateId(undefined);
            setOrganizers([...store.getOrganizers()]);
            onEventCreated(created);
            playAudioFeedback('success');
            showNotification(`Event "${created.title}" successfully published!`);
          }}
          initialTemplate={studioTemplate}
          duplicateFromEventId={studioDuplicateId}
        />
      )}

      {/* MODAL 2: VENUE RFP CREATION */}
      {showRFPModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border ${
            isDarkTheme ? 'bg-[#111827] border-[#374151] text-white' : 'bg-white border-[#E5E7EB] text-[#111827]'
          }`}>
            <div className="flex justify-between items-center border-b border-[#374151]/30 pb-3">
              <h4 className="text-base font-bold">Submit Venue Proposal (RFP)</h4>
              <button onClick={() => setShowRFPModal(false)}><X className="w-5 h-5 text-[#9CA3AF] cursor-pointer" /></button>
            </div>
            <form onSubmit={handleSubmitRFP} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Target Venue</label>
                <input type="text" value={rfpVenueName} onChange={e => setRfpVenueName(e.target.value)} required className={`w-full px-3 py-2 border rounded-lg ${isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-white border-gray-300'}`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Target Date</label>
                  <input type="date" value={rfpTargetDate} onChange={e => setRfpTargetDate(e.target.value)} required className={`w-full px-3 py-2 border rounded-lg ${isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-white border-gray-300'}`} />
                </div>
                <div>
                  <label className="block font-bold mb-1">Expected Attendees</label>
                  <input type="number" value={rfpAttendees} onChange={e => setRfpAttendees(Number(e.target.value))} required className={`w-full px-3 py-2 border rounded-lg ${isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-white border-gray-300'}`} />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">Budget Allocation</label>
                <input type="text" value={rfpBudget} onChange={e => setRfpBudget(e.target.value)} required className={`w-full px-3 py-2 border rounded-lg ${isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-white border-gray-300'}`} />
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-[#374151]/30">
                <button type="button" onClick={() => setShowRFPModal(false)} className="px-3 py-1.5 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-white text-black font-bold rounded-lg cursor-pointer">Submit RFP</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: MARKETING CAMPAIGN CREATION */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border ${
            isDarkTheme ? 'bg-[#111827] border-[#374151] text-white' : 'bg-white border-[#E5E7EB] text-[#111827]'
          }`}>
            <div className="flex justify-between items-center border-b border-[#374151]/30 pb-3">
              <h4 className="text-base font-bold">Launch Marketing Campaign</h4>
              <button onClick={() => setShowCampaignModal(false)}><X className="w-5 h-5 text-[#9CA3AF] cursor-pointer" /></button>
            </div>
            <form onSubmit={handleCreateCampaign} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Campaign Headline</label>
                <input type="text" value={campaignTitle} onChange={e => setCampaignTitle(e.target.value)} required className={`w-full px-3 py-2 border rounded-lg ${isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-white border-gray-300'}`} />
              </div>
              <div>
                <label className="block font-bold mb-1">Channel</label>
                <select value={campaignType} onChange={e => setCampaignType(e.target.value as any)} className={`w-full px-3 py-2 border rounded-lg ${isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-white border-gray-300'}`}>
                  <option value="email">Email Broadcast</option>
                  <option value="promoter">Promoter Referral Link</option>
                  <option value="social">Social Media Integration</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Target Audience</label>
                <input type="text" value={campaignAudience} onChange={e => setCampaignAudience(e.target.value)} required className={`w-full px-3 py-2 border rounded-lg ${isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-white border-gray-300'}`} />
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-[#374151]/30">
                <button type="button" onClick={() => setShowCampaignModal(false)} className="px-3 py-1.5 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-white text-black font-bold rounded-lg cursor-pointer">Launch Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: SCHEDULE AGENDA SESSION */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border ${
            isDarkTheme ? 'bg-[#111827] border-[#374151] text-white' : 'bg-white border-[#E5E7EB] text-[#111827]'
          }`}>
            <div className="flex justify-between items-center border-b border-[#374151]/30 pb-3">
              <h4 className="text-base font-bold">Schedule Agenda Session</h4>
              <button onClick={() => setShowSessionModal(false)}><X className="w-5 h-5 text-[#9CA3AF] cursor-pointer" /></button>
            </div>
            <form onSubmit={handleAddSession} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Session Title</label>
                <input type="text" value={sessionTitle} onChange={e => setSessionTitle(e.target.value)} required className={`w-full px-3 py-2 border rounded-lg ${isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-white border-gray-300'}`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Time (e.g. 11:30 AM)</label>
                  <input type="text" value={sessionTime} onChange={e => setSessionTime(e.target.value)} required className={`w-full px-3 py-2 border rounded-lg ${isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-white border-gray-300'}`} />
                </div>
                <div>
                  <label className="block font-bold mb-1">Stage / Room</label>
                  <input type="text" value={sessionStage} onChange={e => setSessionStage(e.target.value)} required className={`w-full px-3 py-2 border rounded-lg ${isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-white border-gray-300'}`} />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">Speaker / Moderator</label>
                <input type="text" value={sessionSpeaker} onChange={e => setSessionSpeaker(e.target.value)} required className={`w-full px-3 py-2 border rounded-lg ${isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-white border-gray-300'}`} />
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-[#374151]/30">
                <button type="button" onClick={() => setShowSessionModal(false)} className="px-3 py-1.5 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-white text-black font-bold rounded-lg cursor-pointer">Add to Timetable</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ATTENDEE BROADCAST */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border ${
            isDarkTheme ? 'bg-[#111827] border-[#374151] text-white' : 'bg-white border-[#E5E7EB] text-[#111827]'
          }`}>
            <div className="flex justify-between items-center border-b border-[#374151]/30 pb-3">
              <h4 className="text-base font-bold">Broadcast Message to Attendees</h4>
              <button onClick={() => setShowBroadcastModal(false)}><X className="w-5 h-5 text-[#9CA3AF] cursor-pointer" /></button>
            </div>
            {broadcastSentAlert ? (
              <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2 border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Broadcast dispatched to confirmed attendees via Email & SMS.</span>
              </div>
            ) : (
              <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1">Message Content</label>
                  <textarea
                    rows={4}
                    value={broadcastMessage}
                    onChange={e => setBroadcastMessage(e.target.value)}
                    required
                    placeholder="Important update regarding gates, weather or parking..."
                    className={`w-full px-3 py-2 border rounded-lg ${isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="flex justify-end gap-2 border-t border-[#374151]/30 pt-2">
                  <button type="button" onClick={() => setShowBroadcastModal(false)} className="px-3 py-1.5 cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-white text-black font-bold rounded-lg cursor-pointer">Send Broadcast</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 6: MANUAL GUEST REGISTRATION */}
      {showAddAttendeeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border ${
            isDarkTheme ? 'bg-[#111827] border-[#374151] text-white' : 'bg-white border-[#E5E7EB] text-[#111827]'
          }`}>
            <div className="flex justify-between items-center border-b border-[#374151]/30 pb-3">
              <h4 className="text-base font-bold">Manual Guest Registration</h4>
              <button onClick={() => setShowAddAttendeeModal(false)}><X className="w-5 h-5 text-[#9CA3AF] cursor-pointer" /></button>
            </div>
            <form onSubmit={handleManualAttendeeRegister} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  value={newAttendeeName}
                  onChange={e => setNewAttendeeName(e.target.value)}
                  required
                  className={`w-full px-3 py-2 border rounded-lg ${isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  value={newAttendeeEmail}
                  onChange={e => setNewAttendeeEmail(e.target.value)}
                  required
                  className={`w-full px-3 py-2 border rounded-lg ${isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newAttendeePhone}
                  onChange={e => setNewAttendeePhone(e.target.value)}
                  required
                  className={`w-full px-3 py-2 border rounded-lg ${isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Select Event</label>
                <select
                  value={newAttendeeEventId}
                  onChange={e => setNewAttendeeEventId(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-white border-gray-300'}`}
                >
                  {allEvents.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 border-t border-[#374151]/30 pt-2">
                <button type="button" onClick={() => setShowAddAttendeeModal(false)} className="px-3 py-1.5 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-white text-black font-bold rounded-lg cursor-pointer">Issue Pass</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: EDIT ATTENDEE DETAILS */}
      {editAttendeeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border ${
            isDarkTheme ? 'bg-[#111827] border-[#374151] text-white' : 'bg-white border-[#E5E7EB] text-[#111827]'
          }`}>
            <div className="flex justify-between items-center border-b border-[#374151]/30 pb-3">
              <div>
                <h4 className="text-base font-bold">Attendee Management</h4>
                <p className="text-xs text-gray-400 font-mono">{editAttendeeModal.ticketCode}</p>
              </div>
              <button onClick={() => setEditAttendeeModal(null)}><X className="w-5 h-5 text-[#9CA3AF] cursor-pointer" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Attendee Name</label>
                <input
                  type="text"
                  value={editAttendeeModal.attendeeName}
                  onChange={e => setEditAttendeeModal({ ...editAttendeeModal, attendeeName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Email</label>
                <input
                  type="email"
                  value={editAttendeeModal.attendeeEmail}
                  onChange={e => setEditAttendeeModal({ ...editAttendeeModal, attendeeEmail: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-white border-gray-300'}`}
                />
              </div>

              <div className="p-3 bg-gray-500/10 rounded-xl space-y-1">
                <span className="text-[11px] text-gray-400">Assigned Tier:</span>
                <strong className="block text-sm">{editAttendeeModal.tierName}</strong>
                <span className="text-[11px] text-gray-400">{editAttendeeModal.eventTitle}</span>
              </div>

              <div className="pt-2 border-t border-[#374151]/30 flex flex-col gap-2">
                <button
                  onClick={() => {
                    handleToggleAttendeeCheckIn(editAttendeeModal);
                    setEditAttendeeModal(null);
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  {editAttendeeModal.status === 'checked_in' ? 'Check Out Guest' : 'Check In Guest Now'}
                </button>

                <button
                  onClick={() => {
                    handleIssueRefund(editAttendeeModal);
                    setEditAttendeeModal(null);
                  }}
                  className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-bold rounded-lg border border-red-500/30 cursor-pointer"
                >
                  Issue Refund & Revoke Pass
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      



      {/* MODAL: CONFIRM CANCEL EVENT */}
      {eventToCancel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-amber-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Cancel Event</h4>
                <p className="text-xs text-[#9CA3AF]">Are you sure you want to cancel ticket sales?</p>
              </div>
            </div>
            <p className="text-xs text-white/80 bg-white/5 p-3 rounded-xl border border-white/10 leading-relaxed">
              Cancelling <strong>"{eventToCancel.title}"</strong> will halt public ticket checkout and flag the event as Cancelled on the marketplace. Existing ticket holders can be credited or refunded.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEventToCancel(null)}
                className="px-4 py-2 rounded-xl border border-white/20 text-xs font-semibold text-white hover:bg-white/10 cursor-pointer"
              >
                Keep Active
              </button>
              <button
                onClick={() => handleConfirmCancelEvent(eventToCancel)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs cursor-pointer shadow-lg"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM DELETE EVENT */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-red-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Delete Event Permanently</h4>
                <p className="text-xs text-red-300">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-white/80 bg-white/5 p-3 rounded-xl border border-white/10 leading-relaxed">
              This will permanently remove <strong>"{eventToDelete.title}"</strong> and all its ticket tiers from your organizer portfolio.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEventToDelete(null)}
                className="px-4 py-2 rounded-xl border border-white/20 text-xs font-semibold text-white hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDeleteEvent(eventToDelete)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-lg"
              >
                Yes, Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 9: PROMO CODE */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border ${
            isDarkTheme ? 'bg-[#111827] border-[#374151] text-white' : 'bg-white border-[#E5E7EB] text-[#111827]'
          }`}>
            <div className="flex justify-between items-center border-b border-[#374151]/30 pb-3">
              <h4 className="text-base font-bold">Create Promo Discount</h4>
              <button onClick={() => setShowPromoModal(false)}><X className="w-5 h-5 text-[#9CA3AF] cursor-pointer" /></button>
            </div>
            <form onSubmit={handleCreatePromo} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  value={newPromoCode}
                  onChange={e => setNewPromoCode(e.target.value.toUpperCase())}
                  required
                  className={`w-full px-3 py-2 border rounded-lg font-mono uppercase ${isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Discount %</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={newPromoDiscount}
                  onChange={e => setNewPromoDiscount(Number(e.target.value))}
                  required
                  className={`w-full px-3 py-2 border rounded-lg font-mono ${isDarkTheme ? 'bg-[#1F2937] border-[#374151]' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-[#374151]/30 pt-2">
                <button type="button" onClick={() => setShowPromoModal(false)} className="px-3 py-1.5 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-white text-black font-bold rounded-lg cursor-pointer">Save Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FULL-WEBPAGE: EDIT ORGANIZER PROFILE PAGE                 */}
      {/* ========================================================= */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black">
          <OrganizerProfilePage
            organizer={currentOrg}
            onBack={() => setShowEditProfileModal(false)}
            onSaved={(updated) => {
              setOrganizers([...store.getOrganizers()]);
              playAudioFeedback('success');
              showNotification(`Profile for "${updated.name}" updated successfully.`);
            }}
            theme={isDarkTheme ? 'dark' : 'light'}
          />
        </div>
      )}

      {/* Waitlist Queue & Automated Reclamation Drawer */}
      {showWaitlistDrawer && (
        <WaitlistReclamationDrawer
          isOpen={showWaitlistDrawer}
          onClose={() => setShowWaitlistDrawer(false)}
          events={allEvents}
          theme={isDarkTheme ? 'dark' : 'light'}
        />
      )}

      {/* Cashless RFID Wristband & POS Terminal Modal */}
      {showCashlessTerminal && (
        <CashlessTerminalModal
          isOpen={showCashlessTerminal}
          onClose={() => setShowCashlessTerminal(false)}
          theme={isDarkTheme ? 'dark' : 'light'}
        />
      )}

    </div>
  );
};
