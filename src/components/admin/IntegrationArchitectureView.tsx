import React, { useState, useMemo } from 'react';
import {
  Layers,
  Network,
  Cpu,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Globe,
  MessageSquare,
  CreditCard,
  MapPin,
  Video,
  BarChart3,
  Bot,
  RefreshCw,
  Send,
  Check,
  Play,
  RotateCcw,
  ExternalLink,
  Sliders,
  Server,
  Database,
  Key,
  Radio,
  Terminal,
  FileCode,
  Search,
  Filter,
  Lock,
  ChevronRight,
  Activity,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { formatCurrency } from '../../lib/currencies';

interface IntegrationArchitectureViewProps {
  isDark: boolean;
  onShowNotification: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export type IntegrationPriority = 'P1' | 'P2' | 'P3';
export type IntegrationCategory = 
  | 'payments'
  | 'messaging'
  | 'maps_venues'
  | 'virtual_hybrid'
  | 'marketing_crm'
  | 'ai_automation';

export interface ThirdPartyProvider {
  id: string;
  name: string;
  category: IntegrationCategory;
  priority: IntegrationPriority;
  status: 'operational' | 'degraded' | 'active_sandbox' | 'standby';
  description: string;
  capabilities: string[];
  supportedRegions: string[];
  supportedCurrencies: string[];
  latencyMs: number;
  circuitBreaker: 'closed' | 'half-open' | 'open';
  webhookSupported: boolean;
  mcpEnabled?: boolean;
  integrationFlowSummary: string;
  authType: 'API Key / Secret' | 'OAuth 2.0 PKCE' | 'HMAC Webhook' | 'mTLS / Signed Tokens';
  rateLimitPerMin: number;
  monthlyVolume: string;
}

export const IntegrationArchitectureView: React.FC<IntegrationArchitectureViewProps> = ({
  isDark,
  onShowNotification
}) => {
  // Navigation tabs inside Architecture View
  const [activeTab, setActiveTab] = useState<'catalog' | 'master_flow' | 'workflows' | 'mcp_sandbox' | 'circuit_breakers'>('master_flow');

  // Filters for Catalog
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('paystack');

  // Interactive End-to-End Workflow Simulator State
  const [selectedWorkflow, setSelectedWorkflow] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [workflowStepIndex, setWorkflowStepIndex] = useState<number>(0);
  const [workflowAutoPlaying, setWorkflowAutoPlaying] = useState<boolean>(false);

  // Architecture Diagram Layer Inspector
  const [inspectedLayer, setInspectedLayer] = useState<string>('integration_layer');

  // Live MCP & Sandbox Test State
  const [sandboxProvider, setSandboxProvider] = useState<string>('paystack');
  const [sandboxAction, setSandboxAction] = useState<string>('verify_payment_intent');
  const [sandboxRunning, setSandboxRunning] = useState<boolean>(false);
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([
    '[SYSTEM] Nexora Hybrid Integration Layer bootstrapped.',
    '[CIRCUIT-BREAKER] All 6 Category upstream circuits in CLOSED (healthy) state.',
    '[MCP] Model Context Protocol Tool Provider initialized with 6 tools.'
  ]);

  // Circuit Breakers state that can be toggled
  const [circuitBreakers, setCircuitBreakers] = useState<Record<string, 'closed' | 'half-open' | 'open'>>({
    stripe: 'closed',
    paystack: 'closed',
    flutterwave: 'closed',
    sendgrid: 'closed',
    twilio: 'closed',
    whatsapp: 'closed',
    google_maps: 'closed',
    zoom: 'closed',
    hubspot: 'closed',
    openai_mcp: 'closed'
  });

  // Providers database with all specifications from user brief
  const providers: ThirdPartyProvider[] = useMemo(() => [
    // 1. Payments and ticket checkout (P1)
    {
      id: 'paystack',
      name: 'Paystack (Stripe Company)',
      category: 'payments',
      priority: 'P1',
      status: 'operational',
      description: 'Primary African payment gateway handling credit/debit cards, bank EFTs, QR, and local mobile money with automated instant settlement.',
      capabilities: ['Card Payments', '3D Secure 2.0', 'Split Payments', 'Signed Webhooks', 'Mobile Money', 'Refund API'],
      supportedRegions: ['South Africa', 'Nigeria', 'Ghana', 'Kenya'],
      supportedCurrencies: ['ZAR', 'NGN', 'GHS', 'KES', 'USD'],
      latencyMs: 142,
      circuitBreaker: circuitBreakers.paystack || 'closed',
      webhookSupported: true,
      authType: 'API Key / Secret',
      rateLimitPerMin: 1200,
      monthlyVolume: '48,290 Transactions',
      integrationFlowSummary: 'Nexora checkout → Paystack Pop / API → Signed HMAC Webhook → Nexora verify_payment → Issue cryptographic ticket → Send confirmation'
    },
    {
      id: 'stripe',
      name: 'Stripe International',
      category: 'payments',
      priority: 'P1',
      status: 'operational',
      description: 'Global payment processing engine powering diaspora card purchases, Payment Intents, multi-currency conversion, and organizer marketplace payouts.',
      capabilities: ['Payment Intents', 'Radar Fraud Screening', 'Apple Pay / Google Pay', 'Marketplace Connect Payouts', 'Automated Dispute Handling'],
      supportedRegions: ['South Africa', 'Global / International Diaspora', 'UK', 'EU', 'US'],
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'ZAR'],
      latencyMs: 185,
      circuitBreaker: circuitBreakers.stripe || 'closed',
      webhookSupported: true,
      authType: 'API Key / Secret',
      rateLimitPerMin: 1800,
      monthlyVolume: '26,400 Transactions',
      integrationFlowSummary: 'Nexora checkout → Stripe PaymentIntent → 3D Secure → Webhook payment_intent.succeeded → Escrow ledger credit → Ticket release'
    },
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      category: 'payments',
      priority: 'P1',
      status: 'operational',
      description: 'Cross-border Pan-African payment infrastructure covering 30+ African countries with localized USSD, Barter, M-Pesa, and bank transfer options.',
      capabilities: ['Cross-Border Clearing', 'USSD Payments', 'Mobile Money Rails', 'Virtual Cards', 'Direct Bank Transfers'],
      supportedRegions: ['Nigeria', 'Kenya', 'Ghana', 'Rwanda', 'Uganda', 'South Africa'],
      supportedCurrencies: ['NGN', 'KES', 'GHS', 'RWF', 'UGX', 'ZAR', 'USD'],
      latencyMs: 210,
      circuitBreaker: circuitBreakers.flutterwave || 'closed',
      webhookSupported: true,
      authType: 'HMAC Webhook',
      rateLimitPerMin: 900,
      monthlyVolume: '19,820 Transactions',
      integrationFlowSummary: 'Nexora checkout → Flutterwave standard redirect → Webhook verification → Currency conversion hedge → Ticket release'
    },
    {
      id: 'paypal',
      name: 'PayPal Commerce',
      category: 'payments',
      priority: 'P1',
      status: 'operational',
      description: 'International wallet checkout option enabling diaspora attendees across Europe, North America, and Asia to purchase African event tickets.',
      capabilities: ['PayPal Wallet', 'Pay Later', 'Automated Currency Conversion', 'Buyer & Seller Protection'],
      supportedRegions: ['Global Diaspora', 'South Africa', 'Kenya (Select)'],
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      latencyMs: 310,
      circuitBreaker: 'closed',
      webhookSupported: true,
      authType: 'OAuth 2.0 PKCE',
      rateLimitPerMin: 600,
      monthlyVolume: '6,150 Transactions',
      integrationFlowSummary: 'Nexora checkout → PayPal capture endpoint → Webhook IPN / REST → Ledger allocation → Ticket release'
    },
    {
      id: 'mpesa_daraja',
      name: 'M-Pesa Daraja 2.0 (Safaricom)',
      category: 'payments',
      priority: 'P1',
      status: 'operational',
      description: 'Direct STK Push mobile money rail in East Africa, enabling sub-second PIN prompt on attendee phones with instant settlement confirmation.',
      capabilities: ['Lipa Na M-Pesa Online (STK Push)', 'C2B Instant Notifications', 'Reversal API', 'Account Balance Query'],
      supportedRegions: ['Kenya', 'Tanzania', 'Regional Roaming'],
      supportedCurrencies: ['KES'],
      latencyMs: 98,
      circuitBreaker: 'closed',
      webhookSupported: true,
      authType: 'OAuth 2.0 PKCE',
      rateLimitPerMin: 3000,
      monthlyVolume: '31,400 Transactions',
      integrationFlowSummary: 'Attendee enters Safaricom number → STK Push modal on handset → User enters PIN → Daraja Callback Webhook → Ticket issuance'
    },
    {
      id: 'ozow_eft',
      name: 'Ozow Instant EFT',
      category: 'payments',
      priority: 'P1',
      status: 'operational',
      description: 'Zero-chargeback direct automated bank debit in South Africa with instant settlement clearing across all major domestic commercial banks.',
      capabilities: ['Instant EFT', 'Zero Chargeback Risk', 'Automated Bank Reconciliation', 'Real-Time Clearing'],
      supportedRegions: ['South Africa'],
      supportedCurrencies: ['ZAR'],
      latencyMs: 115,
      circuitBreaker: 'closed',
      webhookSupported: true,
      authType: 'API Key / Secret',
      rateLimitPerMin: 800,
      monthlyVolume: '14,200 Transactions',
      integrationFlowSummary: 'Attendee selects bank → Bank biometric / MFA confirmation → Instant EFT notification → Nexora Account 1010 debit → Ticket release'
    },

    // 2. Email, SMS and messaging (P1)
    {
      id: 'sendgrid',
      name: 'Twilio SendGrid',
      category: 'messaging',
      priority: 'P1',
      status: 'operational',
      description: 'High-reputation transactional email infrastructure delivering responsive HTML ticket passes, PDF attachments, and calendar invites.',
      capabilities: ['Dynamic HTML Templates', 'Attachment Generation', 'DKIM/SPF Signing', 'Delivery Telemetry & Webhooks', 'Unsubscribe Management'],
      supportedRegions: ['Pan-African', 'Global'],
      supportedCurrencies: ['All'],
      latencyMs: 78,
      circuitBreaker: circuitBreakers.sendgrid || 'closed',
      webhookSupported: true,
      authType: 'API Key / Secret',
      rateLimitPerMin: 3000,
      monthlyVolume: '142,000 Emails',
      integrationFlowSummary: 'Order status marked "paid" → Job Queue dispatches SendGrid template → Attendee receives PDF ticket with cryptographic barcode'
    },
    {
      id: 'amazon_ses',
      name: 'Amazon SES (Simple Email Service)',
      category: 'messaging',
      priority: 'P1',
      status: 'standby',
      description: 'Cost-optimized secondary email fallback and high-volume broadcast engine for festival-wide announcements and post-event survey drops.',
      capabilities: ['High-Throughput SMTP', 'Dedicated IP Pools', 'Bounce & Complaint Queues', 'S3 Event Logging'],
      supportedRegions: ['Cape Town af-south-1', 'Global'],
      supportedCurrencies: ['All'],
      latencyMs: 95,
      circuitBreaker: 'closed',
      webhookSupported: true,
      authType: 'API Key / Secret',
      rateLimitPerMin: 5000,
      monthlyVolume: '88,000 Emails',
      integrationFlowSummary: 'Broadcast trigger → SES batch dispatch via Cape Town region → SQS bounce processing → Delivery status recorded in DB'
    },
    {
      id: 'twilio',
      name: 'Twilio Programmable SMS & Voice',
      category: 'messaging',
      priority: 'P1',
      status: 'operational',
      description: 'Global SMS and emergency communication gateway providing 2FA login codes, gate access PINs, and time-sensitive schedule change alerts.',
      capabilities: ['Alphanumeric Sender ID', 'Shortcode Delivery', 'Delivery Receipts', '2FA OTP Generation', 'Local Operator Bindings'],
      supportedRegions: ['South Africa', 'Nigeria', 'Kenya', 'Ghana', 'Rwanda', 'Global'],
      supportedCurrencies: ['All'],
      latencyMs: 160,
      circuitBreaker: circuitBreakers.twilio || 'closed',
      webhookSupported: true,
      authType: 'API Key / Secret',
      rateLimitPerMin: 1200,
      monthlyVolume: '54,000 SMS',
      integrationFlowSummary: 'Emergency schedule modification or gate delay → Twilio SMS queue → SMS dispatches with localized sender ID → Delivery receipt logged'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business Cloud Platform',
      category: 'messaging',
      priority: 'P1',
      status: 'operational',
      description: 'Direct conversational WhatsApp pipeline delivering rich interactive QR ticket cards, parking directions, and automated 24/7 attendee support.',
      capabilities: ['Rich Interactive Cards', 'Media Template Messages', 'Conversational Chatbot Hooks', 'Session Messaging', 'Location Pins'],
      supportedRegions: ['South Africa', 'Nigeria', 'Kenya', 'Ghana', 'Pan-African Primary'],
      supportedCurrencies: ['All'],
      latencyMs: 124,
      circuitBreaker: circuitBreakers.whatsapp || 'closed',
      webhookSupported: true,
      authType: 'OAuth 2.0 PKCE',
      rateLimitPerMin: 2000,
      monthlyVolume: '112,000 Messages',
      integrationFlowSummary: 'Order confirmed → Meta Cloud API dispatches ticket message with QR image attachment → Attendee saves to phone photos'
    },
    {
      id: 'fcm',
      name: 'Firebase Cloud Messaging (FCM)',
      category: 'messaging',
      priority: 'P1',
      status: 'operational',
      description: 'Low-latency push notification pipeline targeting organizer dashboard apps, gate scanner Android handhelds, and attendee PWA wallets.',
      capabilities: ['Topic Messaging', 'Silent Data Payloads', 'Device Grouping', 'Offline Message Queuing', 'Turnstile Sync Alerts'],
      supportedRegions: ['Pan-African', 'Global'],
      supportedCurrencies: ['All'],
      latencyMs: 65,
      circuitBreaker: 'closed',
      webhookSupported: false,
      authType: 'API Key / Secret',
      rateLimitPerMin: 10000,
      monthlyVolume: '320,000 Pushes',
      integrationFlowSummary: 'Turnstile check-in event → FCM data packet sent to Organizer dashboard → Real-time capacity counter updates instantaneously'
    },

    // 3. Maps, venues and travel (P1–P2)
    {
      id: 'google_maps',
      name: 'Google Maps Platform',
      category: 'maps_venues',
      priority: 'P1',
      status: 'operational',
      description: 'Authoritative mapping and location services powering venue address geocoding, attendee transit directions, and interactive festival maps.',
      capabilities: ['Geocoding API', 'Places Autocomplete', 'Directions & Distance Matrix', 'Dynamic Maps JavaScript API', 'Static Street Maps'],
      supportedRegions: ['Pan-African', 'Global'],
      supportedCurrencies: ['All'],
      latencyMs: 110,
      circuitBreaker: circuitBreakers.google_maps || 'closed',
      webhookSupported: false,
      authType: 'API Key / Secret',
      rateLimitPerMin: 4000,
      monthlyVolume: '185,000 Map Views',
      integrationFlowSummary: 'Organizer types venue name → Google Places suggests address → Geocoding validates coordinates → Interactive venue map rendered'
    },
    {
      id: 'mapbox',
      name: 'Mapbox Navigation & Studio',
      category: 'maps_venues',
      priority: 'P2',
      status: 'operational',
      description: 'Custom vector tile maps for outdoor multi-stage festival layouts, attendee crowd heatmaps, and custom branded 3D stage navigation.',
      capabilities: ['Custom Map Styles', '3D Terrain & Building Extrusions', 'Indoor Floorplans', 'Isochrone Travel Times'],
      supportedRegions: ['Pan-African', 'Global'],
      supportedCurrencies: ['All'],
      latencyMs: 130,
      circuitBreaker: 'closed',
      webhookSupported: false,
      authType: 'API Key / Secret',
      rateLimitPerMin: 2500,
      monthlyVolume: '62,000 Map Views',
      integrationFlowSummary: 'Festival blueprint uploaded → Mapbox Studio custom tileset generated → Attendee interactive stage locator rendered'
    },
    {
      id: 'google_calendar',
      name: 'Google Calendar & CalDAV Sync',
      category: 'maps_venues',
      priority: 'P1',
      status: 'operational',
      description: 'One-click calendar synchronization generating dynamic .ics feeds and Google Calendar entries with automatic time-zone synchronization.',
      capabilities: ['Event Creation', 'iCal / ICS Feed', 'Time Zone Translation', 'Location & Ticket Link Embedding', 'Reminder Scheduling'],
      supportedRegions: ['Pan-African', 'Global'],
      supportedCurrencies: ['All'],
      latencyMs: 85,
      circuitBreaker: 'closed',
      webhookSupported: false,
      authType: 'OAuth 2.0 PKCE',
      rateLimitPerMin: 1500,
      monthlyVolume: '45,000 Calendar Adds',
      integrationFlowSummary: 'Ticket checkout completes → "Add to Google Calendar" link generated → Event stored in attendee calendar with venue address & gate link'
    },
    {
      id: 'travel_transit_apis',
      name: 'Venue, Transit & Ride APIs (Uber / Bolt)',
      category: 'maps_venues',
      priority: 'P2',
      status: 'operational',
      description: 'Deep-linking and transit estimation allowing attendees to request rides directly to the designated venue pickup zone.',
      capabilities: ['Deep Linking with Lat/Long', 'Fare & ETA Estimation', 'Designated Drop-Off Geofencing', 'Nearby Accommodation Widgets'],
      supportedRegions: ['South Africa', 'Nigeria', 'Kenya', 'Ghana'],
      supportedCurrencies: ['ZAR', 'NGN', 'KES', 'GHS'],
      latencyMs: 175,
      circuitBreaker: 'closed',
      webhookSupported: false,
      authType: 'API Key / Secret',
      rateLimitPerMin: 1000,
      monthlyVolume: '18,500 Rides Requested',
      integrationFlowSummary: 'Attendee views ticket pass 2 hours before gates open → "Request Uber to Venue" button activates with pre-filled gate coordinates'
    },

    // 4. Virtual and hybrid events (P2)
    {
      id: 'zoom',
      name: 'Zoom Video Communications',
      category: 'virtual_hybrid',
      priority: 'P2',
      status: 'operational',
      description: 'Meeting and webinar automation provisioning secure unique join links with server-to-server OAuth and attendee attendance tracking.',
      capabilities: ['Server-to-Server OAuth', 'Webinar Provisioning', 'Unique Registrant Tokens', 'Attendance Webhooks', 'Cloud Recording Sync'],
      supportedRegions: ['Pan-African', 'Global'],
      supportedCurrencies: ['All'],
      latencyMs: 190,
      circuitBreaker: circuitBreakers.zoom || 'closed',
      webhookSupported: true,
      authType: 'OAuth 2.0 PKCE',
      rateLimitPerMin: 600,
      monthlyVolume: '24 Hosted Webinars',
      integrationFlowSummary: 'Hybrid event created → Nexora server-to-server OAuth creates Zoom Webinar → Attendee receives authorized join URL tied to ticket ID'
    },
    {
      id: 'ms_teams',
      name: 'Microsoft Teams API (Graph)',
      category: 'virtual_hybrid',
      priority: 'P2',
      status: 'operational',
      description: 'Enterprise virtual meeting connector for corporate conferences, board symposia, and university webinars using Azure AD authentication.',
      capabilities: ['Azure Graph API', 'Online Meeting Provisioning', 'Enterprise SSO Integration', 'Meeting Attendance Reports'],
      supportedRegions: ['Pan-African', 'Global'],
      supportedCurrencies: ['All'],
      latencyMs: 230,
      circuitBreaker: 'closed',
      webhookSupported: true,
      authType: 'OAuth 2.0 PKCE',
      rateLimitPerMin: 500,
      monthlyVolume: '12 Corporate Streams',
      integrationFlowSummary: 'Enterprise organizer connects Azure tenant → Teams meeting provisioned → Corporate attendees join through single-sign-on'
    },
    {
      id: 'youtube_live',
      name: 'YouTube Live & Vimeo Enterprise',
      category: 'virtual_hybrid',
      priority: 'P2',
      status: 'operational',
      description: 'Scalable HLS livestreaming delivery and DRM video-on-demand playback for multi-thousand concurrent viewer keynotes and festivals.',
      capabilities: ['Low-Latency HLS Streaming', 'Domain-Restricted Embeds', 'Live Chat Synchronization', 'DRM Access Control'],
      supportedRegions: ['Pan-African', 'Global'],
      supportedCurrencies: ['All'],
      latencyMs: 120,
      circuitBreaker: 'closed',
      webhookSupported: false,
      authType: 'API Key / Secret',
      rateLimitPerMin: 1200,
      monthlyVolume: '8 Festival Livestreams',
      integrationFlowSummary: 'Organizer provides RTMP stream → Nexora embeds secure player in Attendee Portal restricted to validated ticket holders'
    },

    // 5. Marketing, CRM and analytics (P2)
    {
      id: 'hubspot',
      name: 'HubSpot CRM Platform',
      category: 'marketing_crm',
      priority: 'P2',
      status: 'operational',
      description: 'Enterprise lead and contact management synchronizing event attendee profiles, company names, and ticket spend histories.',
      capabilities: ['Contact & Company Sync', 'Deal Pipeline Updates', 'Custom Event Properties', 'Lifecycle Stage Tagging'],
      supportedRegions: ['Pan-African', 'Global'],
      supportedCurrencies: ['All'],
      latencyMs: 245,
      circuitBreaker: circuitBreakers.hubspot || 'closed',
      webhookSupported: true,
      authType: 'OAuth 2.0 PKCE',
      rateLimitPerMin: 600,
      monthlyVolume: '38,000 Contacts Synced',
      integrationFlowSummary: 'Attendee purchases VIP conference pass → Nexora Integration Layer pushes Contact record to HubSpot with "VIP Attendee" tag'
    },
    {
      id: 'salesforce',
      name: 'Salesforce Enterprise CRM',
      category: 'marketing_crm',
      priority: 'P2',
      status: 'standby',
      description: 'High-tier sponsor and enterprise ticket management with custom object synchronization and dedicated account owner routing.',
      capabilities: ['Custom Object Sync', 'Apex REST Integration', 'Opportunity Tracking', 'Enterprise Security'],
      supportedRegions: ['Pan-African', 'Global'],
      supportedCurrencies: ['All'],
      latencyMs: 290,
      circuitBreaker: 'closed',
      webhookSupported: true,
      authType: 'OAuth 2.0 PKCE',
      rateLimitPerMin: 400,
      monthlyVolume: '5,200 Enterprise Records',
      integrationFlowSummary: 'Corporate invoice order approved → Salesforce Opportunity marked "Closed Won" → Account manager notified automatically'
    },
    {
      id: 'ga4',
      name: 'Google Analytics 4 & Measurement Protocol',
      category: 'marketing_crm',
      priority: 'P2',
      status: 'operational',
      description: 'Consent-aware client and server-side ecommerce tracking capturing ticket views, cart additions, checkout steps, and purchase revenue.',
      capabilities: ['Server-Side Measurement Protocol', 'Consent Mode v2', 'E-commerce Purchase Funnels', 'Attribution Modeling'],
      supportedRegions: ['Pan-African', 'Global'],
      supportedCurrencies: ['ZAR', 'USD', 'NGN', 'KES', 'GHS'],
      latencyMs: 60,
      circuitBreaker: 'closed',
      webhookSupported: false,
      authType: 'API Key / Secret',
      rateLimitPerMin: 6000,
      monthlyVolume: '890,000 Analytics Hits',
      integrationFlowSummary: 'Purchase confirmed → Nexora backend sends server-to-server purchase event to GA4 Measurement Protocol with true net revenue'
    },
    {
      id: 'meta_capi',
      name: 'Meta Conversions API (CAPI)',
      category: 'marketing_crm',
      priority: 'P2',
      status: 'operational',
      description: 'Direct server-to-server advertising conversion telemetry for Facebook and Instagram ticket sales without ad-blocker signal loss.',
      capabilities: ['Server-Side Event Deduplication', 'SHA-256 PII Hashing', 'Event Quality Score 9.4/10', 'Ad Attribution'],
      supportedRegions: ['Pan-African', 'Global'],
      supportedCurrencies: ['All'],
      latencyMs: 140,
      circuitBreaker: 'closed',
      webhookSupported: false,
      authType: 'API Key / Secret',
      rateLimitPerMin: 2000,
      monthlyVolume: '78,000 Server Events',
      integrationFlowSummary: 'Ticket checkout completes → Server sends SHA-256 hashed email/phone + purchase value to Meta CAPI → Ad ROAS recorded'
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp Audience Sync',
      category: 'marketing_crm',
      priority: 'P2',
      status: 'operational',
      description: 'Automated newsletter and marketing audience synchronization with GDPR / POPIA consent-aware list segmentation.',
      capabilities: ['List Syncing', 'Merge Tag Fields', 'Automated Drip Series', 'Segment Creation by City & Music Genre'],
      supportedRegions: ['Pan-African', 'Global'],
      supportedCurrencies: ['All'],
      latencyMs: 180,
      circuitBreaker: 'closed',
      webhookSupported: true,
      authType: 'API Key / Secret',
      rateLimitPerMin: 900,
      monthlyVolume: '62,000 Sync Operations',
      integrationFlowSummary: 'Attendee opts into newsletter during checkout → Mailchimp API subscribes contact with custom tags for event category'
    },

    // 6. AI and automation (P2)
    {
      id: 'openai_mcp',
      name: 'OpenAI API & Model Context Protocol (MCP)',
      category: 'ai_automation',
      priority: 'P2',
      status: 'operational',
      description: 'Next-generation AI orchestration supporting OpenAI GPT-4o, function calling, and standardized Model Context Protocol (MCP) server endpoints.',
      capabilities: ['Model Context Protocol (MCP)', 'Function Calling / Tool Use', 'Automated Event Descriptions', 'Support Agent Assistant', 'Risk & Fraud Forensics'],
      supportedRegions: ['Pan-African', 'Global'],
      supportedCurrencies: ['All'],
      latencyMs: 380,
      circuitBreaker: circuitBreakers.openai_mcp || 'closed',
      webhookSupported: true,
      mcpEnabled: true,
      authType: 'API Key / Secret',
      rateLimitPerMin: 1500,
      monthlyVolume: '14,800 AI Agent Tool Invocations',
      integrationFlowSummary: 'Nexora event data → Authorized AI or automation workflow → Recommendation or proposed action → Validation and approval → Execution'
    },
    {
      id: 'zapier_make',
      name: 'Zapier & Make.com Connectors',
      category: 'ai_automation',
      priority: 'P2',
      status: 'operational',
      description: 'Zero-code integration pipelines empowering organizers to bridge Nexora ticket sales with Google Sheets, Airtable, Notion, and Discord.',
      capabilities: ['Instant Webhook Triggers', 'Polling REST Endpoints', 'Multi-Step Zaps', 'Custom Field Mappings'],
      supportedRegions: ['Pan-African', 'Global'],
      supportedCurrencies: ['All'],
      latencyMs: 190,
      circuitBreaker: 'closed',
      webhookSupported: true,
      authType: 'OAuth 2.0 PKCE',
      rateLimitPerMin: 1200,
      monthlyVolume: '41,000 Zap Triggers',
      integrationFlowSummary: 'New order created in Nexora → Webhook fires to Zapier → Organizer’s private Airtable attendee roster updates automatically'
    },
    {
      id: 'n8n_orchestration',
      name: 'n8n Sovereign Workflow Orchestration',
      category: 'ai_automation',
      priority: 'P2',
      status: 'operational',
      description: 'Self-hosted and managed workflow automation engine running complex business rules, escrow release pipelines, and compliance audits.',
      capabilities: ['Self-Hosted Data Sovereignty', 'Custom Node Development', 'Multi-Branch Conditional Logic', 'Automated Escrow Releases'],
      supportedRegions: ['Pan-African', 'Sovereign On-Premise / Cloud'],
      supportedCurrencies: ['All'],
      latencyMs: 85,
      circuitBreaker: 'closed',
      webhookSupported: true,
      authType: 'API Key / Secret',
      rateLimitPerMin: 3500,
      monthlyVolume: '96,000 Workflow Steps',
      integrationFlowSummary: 'Event finishes + 24 hours → n8n workflow queries Nexora double-entry ledger → Validates zero active disputes → Queues organizer payout'
    }
  ], [circuitBreakers]);

  const activeProvider = useMemo(() => {
    return providers.find(p => p.id === selectedProviderId) || providers[0];
  }, [providers, selectedProviderId]);

  // Filtered providers list
  const filteredProviders = useMemo(() => {
    return providers.filter(p => {
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesPrio = selectedPriority === 'all' || p.priority === selectedPriority;
      const matchesSearch = 
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.supportedRegions.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesPrio && matchesSearch;
    });
  }, [providers, selectedCategory, selectedPriority, searchQuery]);

  // Handle Circuit Breaker toggle
  const handleToggleCircuitBreaker = (providerId: string) => {
    const currentState = circuitBreakers[providerId] || 'closed';
    const nextState: 'closed' | 'half-open' | 'open' = 
      currentState === 'closed' ? 'open' : currentState === 'open' ? 'half-open' : 'closed';
    
    setCircuitBreakers(prev => ({
      ...prev,
      [providerId]: nextState
    }));

    onShowNotification(
      nextState === 'open' ? 'warning' : nextState === 'half-open' ? 'info' : 'success',
      `Circuit Breaker Modified: ${providerId}`,
      `State shifted to [${nextState.toUpperCase()}]. Requests will ${nextState === 'open' ? 'fail-fast to fallback adapter' : 'route to live provider'}.`
    );
  };

  // Run Sandbox Simulation
  const handleRunSandbox = () => {
    setSandboxRunning(true);
    const timestamp = new Date().toLocaleTimeString();
    
    setTimeout(() => {
      setSandboxLogs(prev => [
        `[${timestamp}] Initiating ${sandboxAction} on adapter [${sandboxProvider.toUpperCase()}]...`,
        `[${timestamp}] Resolving API route: POST /api/integrations/${sandboxProvider}/${sandboxAction}`,
        `[${timestamp}] Signed with HMAC SHA-256; Nonce: nex_req_${Math.floor(Math.random() * 900000 + 100000)}`,
        `[${timestamp}] Upstream response: 200 OK (Latency: 124ms) - Status: COMPLETED`,
        `[${timestamp}] Nexora Event Bus: Emitted event "integration.adapter.success" to audit ledger.`,
        ...prev.slice(0, 8)
      ]);
      setSandboxRunning(false);
      onShowNotification('success', 'Sandbox Test Succeeded', `Adapter ${sandboxProvider} returned 200 OK with verified payload.`);
    }, 700);
  };

  // Workflow definitions for End-to-End Simulation
  const workflowDefinitions = [
    {
      id: 'A' as const,
      title: 'A. Ticket Purchase and Payment',
      subtitle: 'Attendee selects tier → payment gateway → signed webhook → double-entry ledger → ticket issuance',
      steps: [
        {
          step: 1,
          name: 'Tier Selection & Inventory Reserve',
          actor: 'Attendee & Nexora Core',
          desc: 'Attendee selects ticket tier on event page. Nexora verifies stock lock in PostgreSQL and reserves inventory for 10 minutes.',
          payload: {
            action: 'inventory.reserve',
            eventId: 'evt-cape-town-vibes-2026',
            tierId: 'tier-ct-early',
            quantity: 2,
            lockDurationSec: 600
          }
        },
        {
          step: 2,
          name: 'Smart Payment Provider Routing',
          actor: 'Nexora Integration Router',
          desc: 'Nexora inspects attendee IP, country (South Africa), and currency (ZAR). Selects Paystack as primary rail with Ozow Instant EFT fallback.',
          payload: {
            routingEngine: 'Nexora Smart Gateway Dispatcher',
            selectedProvider: 'Paystack',
            fallbackProvider: 'Ozow Instant EFT',
            orderAmountMinor: 90000,
            currency: 'ZAR'
          }
        },
        {
          step: 3,
          name: 'Payment Authorization & 3D Secure',
          actor: 'Paystack / Card Network',
          desc: 'Attendee completes card biometric / 3D Secure challenge. Paystack returns payment intent status: "processing".',
          payload: {
            paymentIntentId: 'pi_paystack_9812491',
            status: 'processing',
            channel: 'card_3ds2',
            interchangeRate: '1.9% + R1.50'
          }
        },
        {
          step: 4,
          name: 'Signed HMAC Webhook Ingestion',
          actor: 'Paystack → Nexora Integration Layer',
          desc: 'Paystack dispatches signed webhook "charge.success". Nexora verifies HMAC-SHA512 signature and checks idempotency key against duplicate replays.',
          payload: {
            event: 'charge.success',
            signature: 'sha512=9f82ab...c124',
            verified: true,
            idempotencyKey: 'idemp_txn_481920',
            replayDefensePassed: true
          }
        },
        {
          step: 5,
          name: 'Double-Entry Ledger & Ticket Issuance',
          actor: 'Nexora Core & Communication Engine',
          desc: 'Nexora balances GAAP journal (Account 1010 debit, Account 2020 credit, Account 4010 commission), mints cryptographic QR ticket, and dispatches WhatsApp & SendGrid pass.',
          payload: {
            journalEntryId: 'ledg-771829',
            debit: '1010 Customer Clearing (R900.00)',
            credit: '2020 Organizer Payable (R810.00) + 4010 Commission (R900.00)',
            ticketIssued: 'tkt-z491-qr-active',
            notificationsSent: ['SendGrid PDF Ticket', 'WhatsApp Interactive Pass']
          }
        }
      ]
    },
    {
      id: 'B' as const,
      title: 'B. Event Creation and Publication',
      subtitle: 'Organizer details → Google Maps geocode → Zoom/Teams virtual meeting → catalog indexing → Zapier broadcast',
      steps: [
        {
          step: 1,
          name: 'Organizer Submission',
          actor: 'Organizer Portal',
          desc: 'Organizer enters event metadata, date, physical venue name ("Kirstenbosch Botanical Gardens"), and hybrid streaming option.',
          payload: {
            title: 'Cape Town Symphony & Sunset Vibes',
            venueInput: 'Kirstenbosch National Botanical Garden, Cape Town',
            isHybrid: true,
            capacity: 2500
          }
        },
        {
          step: 2,
          name: 'Geocoding & Venue Mapping',
          actor: 'Google Maps Platform Adapter',
          desc: 'Nexora Integration Layer queries Google Maps Geocoding API to resolve coordinates (-33.9875, 18.4326), fetch Place ID, and generate static preview.',
          payload: {
            placeId: 'ChIJG8...e0Q',
            formattedAddress: 'Rhodes Dr, Newlands, Cape Town, 7735',
            lat: -33.9875,
            lng: 18.4326,
            accuracy: 'ROOFTOP'
          }
        },
        {
          step: 3,
          name: 'Virtual Venue Provisioning',
          actor: 'Zoom Video Communications Adapter',
          desc: 'Because event is hybrid, Nexora calls Zoom Server-to-Server OAuth API to provision authenticated Webinar room with restricted attendee join tokens.',
          payload: {
            zoomWebinarId: '984 2109 4410',
            passcode: 'nx_8912',
            securityType: 'Restricted Token OAuth',
            streamMode: 'HD 1080p'
          }
        },
        {
          step: 4,
          name: 'Search Catalog & Growth Indexing',
          actor: 'Nexora Search & GA4 Engine',
          desc: 'Event is published to marketplace catalog, vector embeddings generated for AI search recommendations, and Google Analytics 4 item feed updated.',
          payload: {
            status: 'published',
            embeddingGenerated: true,
            ga4ItemLogged: true,
            seoStructuredData: 'Schema.org Event JSON-LD'
          }
        },
        {
          step: 5,
          name: 'Multi-Channel Automation Broadcast',
          actor: 'Zapier / n8n / Make Connector',
          desc: 'Publication event triggers webhook to organizer’s connected Zapier/n8n pipelines, updating their Google Calendar and Mailchimp audience announcement.',
          payload: {
            webhooksDispatched: 3,
            targets: ['Zapier (Airtable Sync)', 'Google Calendar Sync', 'Mailchimp Newsletter Queue']
          }
        }
      ]
    },
    {
      id: 'C' as const,
      title: 'C. QR Ticket Validation and Gate Check-In',
      subtitle: 'Dynamic QR scan → offline-capable signature verification → turnstile relay → FCM sync → real-time capacity',
      steps: [
        {
          step: 1,
          name: 'Dynamic QR Presentation',
          actor: 'Attendee Mobile Wallet / Pass',
          desc: 'Attendee presents dynamic QR code on phone screen. QR payload contains ticket ID, encrypted timestamp, and Ed25519 digital signature.',
          payload: {
            ticketId: 'tkt-z491-qr-active',
            nonce: 'f8a92b',
            signature: 'ed25519_8192a...',
            generatedAt: '2026-10-15T14:30:00Z'
          }
        },
        {
          step: 2,
          name: 'Edge Gate Scanner Decryption',
          actor: 'Nexora Gate Turnstile / Android Device',
          desc: 'Scanner scans QR code. Scanner verifies Ed25519 public key in 40ms without requiring internet connection for zero-lag entry.',
          payload: {
            scanDurationMs: 38,
            signatureValid: true,
            offlineVerification: 'Passed'
          }
        },
        {
          step: 3,
          name: 'Core Authorization & Anti-Passback',
          actor: 'Nexora Core Access Engine',
          desc: 'Scanner pings local mesh gate controller. Checks against anti-passback rule to ensure ticket was not already scanned at another turnstile.',
          payload: {
            ticketStatus: 'valid',
            antiPassbackCheck: 'OK (No prior scan logged)',
            gateAssigned: 'Gate 02 - North Turnstile'
          }
        },
        {
          step: 4,
          name: 'Hardware Turnstile Relay Release',
          actor: 'IoT Turnstile Hardware',
          desc: 'Gate sends 12V dry contact impulse to physical turnstile; green LED illuminates; attendee passes through.',
          payload: {
            relayTriggered: true,
            pulseDurationMs: 1500,
            gateLed: 'GREEN'
          }
        },
        {
          step: 5,
          name: 'Real-Time Capacity & Telemetry Broadcast',
          actor: 'Firebase Cloud Messaging (FCM) & CRM',
          desc: 'Nexora updates ticket state to "checked_in", logs exact timestamp, sends FCM push to organizer dashboard counter, and tags contact in HubSpot.',
          payload: {
            ticketState: 'checked_in',
            checkInTimestamp: new Date().toISOString(),
            fcmBroadcasted: true,
            hubspotTag: 'Attended: Cape Town Symphony 2026'
          }
        }
      ]
    },
    {
      id: 'D' as const,
      title: 'D. Refund and Cancellation Life Cycle',
      subtitle: 'Refund request → escrow reserve check → payment gateway reversal → ledger debit → QR revocation',
      steps: [
        {
          step: 1,
          name: 'Refund Request Submission',
          actor: 'Super Admin or Organizer Portal',
          desc: 'Admin initiates partial or full refund for an order due to weather cancellation or customer dispute.',
          payload: {
            orderId: 'ord-seed-3',
            refundAmountMinor: 140000,
            currency: 'ZAR',
            reason: 'Outdoor event rainout'
          }
        },
        {
          step: 2,
          name: 'Escrow Reserve & Policy Validation',
          actor: 'Nexora Financial Rule Engine',
          desc: 'Nexora verifies that organizer has sufficient reserve in Account 2010 (Escrow Refund Reserve) and that refund falls within refund window.',
          payload: {
            escrowAccount: '2010 Escrow Refund Reserve',
            availableBalanceMinor: 4850000,
            policyPermitted: true
          }
        },
        {
          step: 3,
          name: 'Provider Reversal API Call',
          actor: 'Nexora Integration Layer → Stripe/Paystack',
          desc: 'Nexora issues POST /refunds with idempotent header. Upstream payment provider authorizes reversal to original card / mobile money wallet.',
          payload: {
            provider: 'Stripe',
            refundId: 're_stripe_918204',
            status: 'succeeded',
            settlementTime: 'Instant / 3-5 business days'
          }
        },
        {
          step: 4,
          name: 'Double-Entry Invariant Adjustment',
          actor: 'Nexora GAAP Ledger Engine',
          desc: 'Reversal creates balancing journal entry: debits Account 2010 Escrow Reserve and credits Account 1010 Customer Clearing Wallet.',
          payload: {
            journalEntry: 'ledg-refund-8821',
            debitAccount: '2010 Escrow Refund Reserve (R1,400.00)',
            creditAccount: '1010 Customer Clearing Wallet (R1,400.00)',
            invariantPreserved: true
          }
        },
        {
          step: 5,
          name: 'Ticket Invalidation & Notification',
          actor: 'Nexora Core & Messaging Engine',
          desc: 'Associated QR ticket code is permanently revoked in gate mesh. SendGrid and WhatsApp dispatch refund receipt with bank reference number.',
          payload: {
            ticketStatus: 'revoked',
            gateMeshUpdated: true,
            notificationDispatched: 'WhatsApp & Email Refund Confirmation'
          }
        }
      ]
    },
    {
      id: 'E' as const,
      title: 'E. Marketing and Attendee Engagement',
      subtitle: 'Visitor lands → GA4 tracking → purchase event → Meta CAPI → HubSpot CRM → WhatsApp day-of reminder',
      steps: [
        {
          step: 1,
          name: 'Consent-Aware Discovery & Analytics',
          actor: 'Attendee & Google Analytics 4',
          desc: 'Visitor arrives at event page via Instagram campaign. GA4 records view_item event respecting Consent Mode v2 preferences.',
          payload: {
            source: 'instagram_ads',
            campaign: 'safari_afrobeats_2026',
            consentGranted: true,
            ga4Event: 'view_item'
          }
        },
        {
          step: 2,
          name: 'Server-Side Meta Conversions API (CAPI)',
          actor: 'Nexora Integration Layer → Meta',
          desc: 'On ticket checkout, Nexora fires server-to-server Purchase event to Meta CAPI with SHA-256 hashed customer identifiers for 100% ad attribution.',
          payload: {
            event_name: 'Purchase',
            event_source_url: 'https://nexora.events/checkout/success',
            user_data: { em: 'sha256(user@domain.com)', ph: 'sha256(+2782...)' },
            custom_data: { currency: 'ZAR', value: 900.00 }
          }
        },
        {
          step: 3,
          name: 'CRM Audience Segmentation',
          actor: 'HubSpot & Mailchimp Connector',
          desc: 'Attendee record is synchronized to organizer’s HubSpot CRM. Automatically tagged with "Purchased: VIP Afrobeats" and added to post-event drip list.',
          payload: {
            crmProvider: 'HubSpot',
            contactId: 'hs_usr_99182',
            lifecycleStage: 'customer',
            customTags: ['Cape Town', 'Afrobeats', 'VIP Tier']
          }
        },
        {
          step: 4,
          name: 'Automated Calendar & Travel Deep Links',
          actor: 'Google Calendar & Uber API Adapter',
          desc: 'Nexora sends calendar sync file and prepares Uber deep-link button with pre-configured event drop-off gate geofence.',
          payload: {
            calendarSynced: true,
            uberDeepLink: 'uber://?action=setPickup&dropoff[latitude]=-33.9875&dropoff[longitude]=18.4326',
            parkingPermitAttached: true
          }
        },
        {
          step: 5,
          name: 'Day-of Event WhatsApp Concierge',
          actor: 'WhatsApp Business Platform',
          desc: '2 hours before doors open, WhatsApp Cloud API sends reminder notification containing gate entrance instructions, parking pass, and emergency venue contact.',
          payload: {
            template: 'day_of_event_reminders_v2',
            deliveryStatus: 'read',
            interactiveButtons: ['Show Ticket QR', 'Directions to Venue', 'Support']
          }
        }
      ]
    }
  ];

  const currentWorkflowDef = workflowDefinitions.find(w => w.id === selectedWorkflow) || workflowDefinitions[0];

  return (
    <div className="space-y-6">

      {/* ========================================================= */}
      {/* HEADER BANNER WITH KEY ARCHITECTURAL PRINCIPLES           */}
      {/* ========================================================= */}
      <div className={`p-6 rounded-3xl border transition-all relative overflow-hidden ${
        isDark 
          ? 'bg-gradient-to-br from-[#0B0F19] via-[#0E1322] to-[#0A0D16] border-white/10 shadow-2xl'
          : 'bg-white border-black/10 shadow-sm'
      }`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5" />
                CENTRAL HYBRID INTEGRATION ENGINE
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Nexora Authoritative Source of Truth
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black font-mono tracking-tight">
              Third-Party Integration Architecture
            </h1>

            <p className="text-sm opacity-80 leading-relaxed">
              Connect ticketing, payments, event discovery, messaging, venue mapping, marketing, and AI through one unified integration layer.
              Nexora governs all business rules, immutable event states, double-entry ledgers, and attendee records—while specialized external vendors provide payment clearing, delivery channels, and model inference.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-black/40 border border-white/5 font-mono text-xs flex items-center justify-between gap-4">
              <span className="text-white/60">P1 Essential Adapters:</span>
              <span className="font-bold text-amber-400">8 Connected</span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-black/40 border border-white/5 font-mono text-xs flex items-center justify-between gap-4">
              <span className="text-white/60">P2 Growth Adapters:</span>
              <span className="font-bold text-blue-400">10 Connected</span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-black/40 border border-white/5 font-mono text-xs flex items-center justify-between gap-4">
              <span className="text-white/60">Circuit Breakers:</span>
              <span className="font-bold text-emerald-400">10/10 Healthy</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-white/10">
          <button
            onClick={() => setActiveTab('master_flow')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'master_flow'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'hover:bg-white/5 opacity-70 hover:opacity-100 border border-transparent'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Master Integration Architecture Flow</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'catalog'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'hover:bg-white/5 opacity-70 hover:opacity-100 border border-transparent'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>6 Category Provider Catalog ({providers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('workflows')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'workflows'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'hover:bg-white/5 opacity-70 hover:opacity-100 border border-transparent'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>End-to-End Execution Sequences (A–E)</span>
          </button>

          <button
            onClick={() => setActiveTab('mcp_sandbox')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'mcp_sandbox'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'hover:bg-white/5 opacity-70 hover:opacity-100 border border-transparent'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Model Context Protocol (MCP) & Sandbox</span>
          </button>

          <button
            onClick={() => setActiveTab('circuit_breakers')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'circuit_breakers'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'hover:bg-white/5 opacity-70 hover:opacity-100 border border-transparent'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Circuit Breakers & Fault Tolerance</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW TAB 1: MASTER INTEGRATION ARCHITECTURE FLOW          */}
      {/* ========================================================= */}
      {activeTab === 'master_flow' && (
        <div className="space-y-6">

          <div className={`p-6 rounded-3xl border ${
            isDark ? 'bg-[#0E121B] border-white/10' : 'bg-white border-black/10'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-black font-mono flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  Nexora Master Integration Architecture
                </h2>
                <p className="text-xs opacity-60 font-mono mt-0.5">
                  Decoupled Hub-and-Spoke Topology with Event Bus, Gateway Validation & Standardized Adapters
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-bold">Event Bus Active (Zero Single-Point-of-Failure)</span>
              </div>
            </div>

            {/* Visual Interactive Architectural Flow */}
            <div className="space-y-4">

              {/* LAYER 1: ACTORS */}
              <div 
                onClick={() => setInspectedLayer('actors')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  inspectedLayer === 'actors'
                    ? 'border-amber-500/80 bg-amber-500/10'
                    : 'border-white/5 hover:border-white/20 bg-black/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                    Layer 1: External Platform Actors & Channels
                  </span>
                  <span className="text-[10px] font-mono opacity-50">Click to inspect</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 font-bold">Attendees</div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 font-bold">Organizers</div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 font-bold">Sponsors</div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 font-bold">Vendors</div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 font-bold text-amber-400">Administrators</div>
                </div>
              </div>

              {/* DOWN ARROW */}
              <div className="flex justify-center -my-2 text-white/30">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </div>

              {/* LAYER 2: API GATEWAY & IDENTITY */}
              <div 
                onClick={() => setInspectedLayer('api_gateway')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  inspectedLayer === 'api_gateway'
                    ? 'border-blue-500/80 bg-blue-500/10'
                    : 'border-white/5 hover:border-white/20 bg-black/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
                    Layer 2: API Gateway & Identity Mesh
                  </span>
                  <span className="text-[10px] font-mono opacity-50">Click to inspect</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">Authentication (JWT / 2FA)</div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">Role-Based Access Control (RBAC)</div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">Token Bucket Rate Limiting</div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">Multi-Tenant Isolation</div>
                </div>
              </div>

              {/* DOWN ARROW */}
              <div className="flex justify-center -my-2 text-white/30">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </div>

              {/* LAYER 3: NEXORA INTEGRATION LAYER (CENTRAL ENGINE) */}
              <div 
                onClick={() => setInspectedLayer('integration_layer')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  inspectedLayer === 'integration_layer'
                    ? 'border-amber-400 ring-2 ring-amber-400/30 bg-amber-500/10'
                    : 'border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                      Layer 3: Nexora Hybrid Integration Layer (Central Hub)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">Authoritative Bridge</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <div className="font-bold text-amber-400 mb-1">Provider Adapters</div>
                    <div className="text-[11px] opacity-70">Unified REST & gRPC abstraction over Stripe, Paystack, SendGrid, Twilio, etc.</div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <div className="font-bold text-purple-400 mb-1">Webhook Processing</div>
                    <div className="text-[11px] opacity-70">HMAC-SHA256 signature verification & 7-day replay idempotency check.</div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <div className="font-bold text-blue-400 mb-1">Distributed Job Queues</div>
                    <div className="text-[11px] opacity-70">BullMQ + Redis workers with Dead-Letter Queues (DLQ) for asynchronous workloads.</div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <div className="font-bold text-emerald-400 mb-1">Circuit Breakers & Retries</div>
                    <div className="text-[11px] opacity-70">Exponential backoff with jitter and automated fail-fast graceful degradation.</div>
                  </div>
                </div>
              </div>

              {/* DOWN ARROW */}
              <div className="flex justify-center -my-2 text-white/30">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </div>

              {/* LAYER 4: 4 HYBRID FUNCTIONAL DOMAINS */}
              <div 
                onClick={() => setInspectedLayer('subsystems')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  inspectedLayer === 'subsystems'
                    ? 'border-purple-500/80 bg-purple-500/10'
                    : 'border-white/5 hover:border-white/20 bg-black/20'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">
                    Layer 4: Functional Subsystems & Specialized Adapters
                  </span>
                  <span className="text-[10px] font-mono opacity-50">Click to inspect</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                  
                  {/* Subsystem 1: Commerce */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4" />
                        Commerce
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">P1 Priority</span>
                    </div>
                    <p className="text-[11px] opacity-60">Payments, Orders, Inventory, Dynamic Tiers, Escrow & Refunds</p>
                    <div className="text-[10px] text-white/50 pt-1 border-t border-white/5">
                      Stripe • Paystack • Flutterwave • PayPal • M-Pesa • Ozow
                    </div>
                  </div>

                  {/* Subsystem 2: Communication */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-400 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4" />
                        Communication
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">P1 Priority</span>
                    </div>
                    <p className="text-[11px] opacity-60">Transactional Email, SMS 2FA, WhatsApp QR Passes & Mobile Push</p>
                    <div className="text-[10px] text-white/50 pt-1 border-t border-white/5">
                      SendGrid • Amazon SES • Twilio • WhatsApp Cloud • FCM
                    </div>
                  </div>

                  {/* Subsystem 3: Event Services */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        Event Services
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">P1–P2</span>
                    </div>
                    <p className="text-[11px] opacity-60">Venue Geocoding, 3D Amphitheatres, Calendar Sync & Hybrid Livestreams</p>
                    <div className="text-[10px] text-white/50 pt-1 border-t border-white/5">
                      Google Maps • Mapbox • Google Calendar • Zoom • Teams
                    </div>
                  </div>

                  {/* Subsystem 4: AI and Growth */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        AI and Growth
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">P2 Growth</span>
                    </div>
                    <p className="text-[11px] opacity-60">AI Forensics, MCP Tool Calling, CRM Lead Nurturing & GA4 / Meta CAPI</p>
                    <div className="text-[10px] text-white/50 pt-1 border-t border-white/5">
                      OpenAI / Gemini MCP • Zapier • n8n • HubSpot • GA4 • Meta CAPI
                    </div>
                  </div>

                </div>
              </div>

              {/* DOWN ARROW */}
              <div className="flex justify-center -my-2 text-white/30">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </div>

              {/* LAYER 5: NEXORA CORE DATABASE AND EVENT BUS */}
              <div 
                onClick={() => setInspectedLayer('core_db')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  inspectedLayer === 'core_db'
                    ? 'border-emerald-500/80 bg-emerald-500/10'
                    : 'border-emerald-500/30 bg-emerald-950/20'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                      Layer 5: Nexora Core Database & Immutable Event Bus
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                    Primary Sovereign Authority
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 font-bold">Events Catalog</div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 font-bold">Orders & Invoices</div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 font-bold">Payments Ledger</div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 font-bold">Tickets & Badges</div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 font-bold">Attendees Roster</div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 font-bold text-emerald-400">Audit & Ledger Logs</div>
                </div>
              </div>

            </div>

            {/* Inspector Details for Selected Layer */}
            <div className="mt-6 p-4 rounded-2xl bg-black/40 border border-white/10 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <span className="text-amber-400 font-bold flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Layer Architecture Blueprint Inspection: [{inspectedLayer.toUpperCase()}]
                </span>
                <span className="text-white/50 text-[11px]">Enforcing Source-of-Truth Sovereignty</span>
              </div>

              {inspectedLayer === 'integration_layer' && (
                <div className="space-y-2 opacity-90 leading-relaxed">
                  <p>
                    <strong className="text-white">Core Principle:</strong> External vendors provide commodity services (telecom SMS pipes, card acquiring, vector tiles), but <strong>Nexora controls 100% of the business logic</strong>.
                  </p>
                  <p>
                    • <strong>Idempotency Engine:</strong> All incoming webhooks are validated with an HMAC key, salted with timestamp nonces, and deduplicated against a 7-day memory store to prevent duplicate ticket minting.
                  </p>
                  <p>
                    • <strong>Circuit Breakers:</strong> If an upstream API returns consecutive 5xx errors or exceeds 2500ms latency, the breaker trips to OPEN, instantly redirecting requests to the fallback adapter (e.g. from Paystack to Ozow or SendGrid to Amazon SES).
                  </p>
                </div>
              )}

              {inspectedLayer === 'actors' && (
                <div className="space-y-2 opacity-90 leading-relaxed">
                  <p>
                    All human and external automated participants interface with the Nexora system exclusively through hardened TLS 1.3 endpoints. Role-Based Access Controls (Super Admin, Organizer Owner, Finance Controller, Gate Supervisor, Attendee) dictate data visibility and API scope boundaries.
                  </p>
                </div>
              )}

              {inspectedLayer === 'api_gateway' && (
                <div className="space-y-2 opacity-90 leading-relaxed">
                  <p>
                    Protects the core platform from distributed denial-of-service, brute force, and credential stuffing. Enforces token bucket rate limits (60 req/min for public marketplace visitors, 1200 req/min for authorized gate handheld scanners). Performs JWT signing and verifies tenant domain isolation.
                  </p>
                </div>
              )}

              {inspectedLayer === 'subsystems' && (
                <div className="space-y-2 opacity-90 leading-relaxed">
                  <p>
                    Four functional subsystems bridge domain-specific logic. The Commerce subsystem handles currency conversion hedging and escrow holdback; Communication handles templated multilingual dispatches; Event Services coordinates venue geofencing and hybrid livestreams; AI and Growth manages Model Context Protocol tool execution.
                  </p>
                </div>
              )}

              {inspectedLayer === 'core_db' && (
                <div className="space-y-2 opacity-90 leading-relaxed">
                  <p>
                    The immutable core ledger operates on GAAP double-entry principles (total debits strictly equal total credits). No third-party provider is permitted direct write access to this database—all state mutations occur via verified, signed internal domain events.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW TAB 2: 6 CATEGORY PROVIDER CATALOG                   */}
      {/* ========================================================= */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">

          {/* Filter Bar */}
          <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
            isDark ? 'bg-[#0E121B] border-white/10' : 'bg-white border-black/10'
          }`}>
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Category selector */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs font-mono border cursor-pointer outline-none ${
                  isDark ? 'bg-black/60 border-white/10 text-white' : 'bg-white border-black/10 text-black'
                }`}
              >
                <option value="all">All 6 Categories</option>
                <option value="payments">1. Payments & Checkout (P1)</option>
                <option value="messaging">2. Email, SMS & WhatsApp (P1)</option>
                <option value="maps_venues">3. Maps, Venues & Travel (P1–P2)</option>
                <option value="virtual_hybrid">4. Virtual & Hybrid Events (P2)</option>
                <option value="marketing_crm">5. Marketing, CRM & Analytics (P2)</option>
                <option value="ai_automation">6. AI & Automation (P2)</option>
              </select>

              {/* Priority filter */}
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs font-mono border cursor-pointer outline-none ${
                  isDark ? 'bg-black/60 border-white/10 text-white' : 'bg-white border-black/10 text-black'
                }`}
              >
                <option value="all">All Priorities</option>
                <option value="P1">P1 — Essential for Launch</option>
                <option value="P2">P2 — Important Growth Feature</option>
                <option value="P3">P3 — Advanced Capability</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
              <input
                type="text"
                placeholder="Search provider, rail, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-mono border outline-none ${
                  isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-black/10 text-black'
                }`}
              />
            </div>
          </div>

          {/* Provider Grid + Active Provider Dossier */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Providers List (5 Cols) */}
            <div className="lg:col-span-5 space-y-3">
              {filteredProviders.map(provider => {
                const isSelected = provider.id === selectedProviderId;

                return (
                  <div
                    key={provider.id}
                    onClick={() => setSelectedProviderId(provider.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? (isDark ? 'bg-amber-500/10 border-amber-500/80 shadow-md shadow-amber-500/10' : 'bg-amber-50 border-amber-400')
                        : (isDark ? 'bg-[#0E121B] border-white/10 hover:border-white/30' : 'bg-white border-black/10 hover:border-black/30')
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm">{provider.name}</span>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                            provider.priority === 'P1'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {provider.priority}
                          </span>
                        </div>
                        <div className="text-[11px] opacity-60 font-mono capitalize">
                          {provider.category.replace('_', ' ')}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          provider.status === 'operational'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {provider.latencyMs}ms
                        </span>
                      </div>
                    </div>

                    <p className="text-xs opacity-70 line-clamp-2 leading-relaxed">
                      {provider.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-inherit/40 text-[10px] font-mono">
                      <span className="opacity-50">Regions:</span>
                      {provider.supportedRegions.slice(0, 3).map((r, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                          {r}
                        </span>
                      ))}
                      {provider.supportedRegions.length > 3 && (
                        <span className="opacity-50">+{provider.supportedRegions.length - 3}</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredProviders.length === 0 && (
                <div className="p-8 text-center text-xs font-mono opacity-50 border border-dashed rounded-2xl">
                  No providers match selected category and search query.
                </div>
              )}
            </div>

            {/* Active Provider Technical Dossier (7 Cols) */}
            <div className="lg:col-span-7">
              <div className={`p-6 rounded-3xl border sticky top-24 space-y-6 ${
                isDark ? 'bg-[#0E121B] border-white/10' : 'bg-white border-black/10'
              }`}>
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-xl font-black font-mono">{activeProvider.name}</h3>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        activeProvider.priority === 'P1'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        {activeProvider.priority} Core Adapter
                      </span>
                    </div>
                    <div className="text-xs opacity-60 font-mono mt-1 capitalize">
                      Category: {activeProvider.category.replace('_', ' ')} • Auth: {activeProvider.authType}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleCircuitBreaker(activeProvider.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeProvider.circuitBreaker === 'closed'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        : activeProvider.circuitBreaker === 'open'
                        ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Breaker: {activeProvider.circuitBreaker.toUpperCase()}</span>
                  </button>
                </div>

                {/* Description */}
                <p className="text-sm opacity-80 leading-relaxed font-mono">
                  {activeProvider.description}
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 font-mono">
                    <div className="text-[10px] opacity-60">Avg Upstream Latency</div>
                    <div className="text-lg font-bold text-emerald-400 mt-1">{activeProvider.latencyMs} ms</div>
                    <div className="text-[9px] opacity-40">P99 SLA: 450ms</div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 font-mono">
                    <div className="text-[10px] opacity-60">Rate Limit Quota</div>
                    <div className="text-lg font-bold text-blue-400 mt-1">{activeProvider.rateLimitPerMin}/m</div>
                    <div className="text-[9px] opacity-40">Token bucket burst</div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 font-mono">
                    <div className="text-[10px] opacity-60">Volume Handled</div>
                    <div className="text-sm font-bold text-amber-400 mt-1.5 truncate">{activeProvider.monthlyVolume}</div>
                    <div className="text-[9px] opacity-40">Past 30 days</div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 font-mono">
                    <div className="text-[10px] opacity-60">Webhook Support</div>
                    <div className="text-base font-bold text-purple-400 mt-1">
                      {activeProvider.webhookSupported ? 'HMAC Signed' : 'Polling REST'}
                    </div>
                    <div className="text-[9px] opacity-40">Replay defended</div>
                  </div>
                </div>

                {/* Integration Flow Spec */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 font-mono">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    Authoritative Integration Flow:
                  </div>
                  <div className="text-xs opacity-90 leading-relaxed bg-black/60 p-3 rounded-xl border border-white/5 text-amber-200">
                    {activeProvider.integrationFlowSummary}
                  </div>
                </div>

                {/* Capabilities */}
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider opacity-60">
                    Supported Adapter Capabilities
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeProvider.capabilities.map((cap, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono bg-white/5 border border-white/10 text-white/90 flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Country & Currency Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <div className="text-xs font-mono font-bold uppercase tracking-wider opacity-60">
                      African & Global Market Coverage
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeProvider.supportedRegions.map((region, i) => (
                        <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/30 border border-white/10">
                          {region}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-mono font-bold uppercase tracking-wider opacity-60">
                      Settlement Currencies
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeProvider.supportedCurrencies.map((curr, i) => (
                        <span key={i} className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {curr}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Sandbox Quick Ping Button */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-mono text-white/50">
                    Upstream Endpoint Status: Active & Encrypted
                  </span>
                  <button
                    onClick={() => {
                      setSandboxProvider(activeProvider.id);
                      setActiveTab('mcp_sandbox');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-mono font-bold cursor-pointer hover:bg-amber-400 transition-colors flex items-center gap-2"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Open in Sandbox / MCP Tester →</span>
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW TAB 3: END-TO-END LIFECYCLE SIMULATOR (A through E)  */}
      {/* ========================================================= */}
      {activeTab === 'workflows' && (
        <div className="space-y-6">

          {/* Workflow Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {workflowDefinitions.map(w => {
              const isSelected = selectedWorkflow === w.id;

              return (
                <button
                  key={w.id}
                  onClick={() => {
                    setSelectedWorkflow(w.id);
                    setWorkflowStepIndex(0);
                    setWorkflowAutoPlaying(false);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? (isDark ? 'bg-amber-500/15 border-amber-500/80 shadow-md shadow-amber-500/10' : 'bg-amber-50 border-amber-500')
                      : (isDark ? 'bg-[#0E121B] border-white/10 hover:border-white/30' : 'bg-white border-black/10 hover:border-black/30')
                  }`}
                >
                  <div className="text-xs font-mono font-black text-amber-400 mb-1">
                    Workflow {w.id}
                  </div>
                  <div className="text-xs font-bold font-mono tracking-tight line-clamp-1">
                    {w.title.replace(/^[A-E]\.\s*/, '')}
                  </div>
                  <div className="text-[10px] opacity-60 font-mono mt-1">
                    {w.steps.length} Lifecycle Steps
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Workflow Interactive Stage Card */}
          <div className={`p-6 rounded-3xl border space-y-6 ${
            isDark ? 'bg-[#0E121B] border-white/10' : 'bg-white border-black/10'
          }`}>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-inherit/40 pb-5">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  End-to-End Integration Flow Architecture
                </span>
                <h3 className="text-xl font-black font-mono mt-0.5">{currentWorkflowDef.title}</h3>
                <p className="text-xs opacity-60 font-mono mt-1">{currentWorkflowDef.subtitle}</p>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWorkflowStepIndex(Math.max(0, workflowStepIndex - 1))}
                  disabled={workflowStepIndex === 0}
                  className="px-3 py-1.5 rounded-xl border border-inherit text-xs font-mono disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed hover:bg-white/5"
                >
                  ← Previous Step
                </button>

                <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono font-bold text-amber-400">
                  Step {workflowStepIndex + 1} of {currentWorkflowDef.steps.length}
                </div>

                <button
                  onClick={() => setWorkflowStepIndex(Math.min(currentWorkflowDef.steps.length - 1, workflowStepIndex + 1))}
                  disabled={workflowStepIndex === currentWorkflowDef.steps.length - 1}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-black text-xs font-mono font-bold disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed hover:bg-amber-400"
                >
                  Next Step →
                </button>

                <button
                  onClick={() => setWorkflowStepIndex(0)}
                  className="p-2 rounded-xl border border-inherit hover:bg-white/5 text-xs font-mono cursor-pointer"
                  title="Reset to Step 1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Step Progress Tracker */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {currentWorkflowDef.steps.map((st, idx) => {
                const isPassed = idx < workflowStepIndex;
                const isCurrent = idx === workflowStepIndex;

                return (
                  <div
                    key={idx}
                    onClick={() => setWorkflowStepIndex(idx)}
                    className={`p-3 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                      isCurrent
                        ? 'border-amber-400 bg-amber-500/20 text-white font-bold'
                        : isPassed
                        ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                        : 'border-white/5 bg-black/20 opacity-40 hover:opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span>Step {st.step}</span>
                      {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      {isCurrent && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                    </div>
                    <div className="text-[11px] truncate font-bold">{st.name}</div>
                  </div>
                );
              })}
            </div>

            {/* Current Step Active Inspector */}
            {(() => {
              const currentStep = currentWorkflowDef.steps[workflowStepIndex];
              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                  
                  {/* Step Description & Actor */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                          Active Actor & Responsibility
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10">
                          {currentStep.actor}
                        </span>
                      </div>
                      <h4 className="text-lg font-black font-mono">{currentStep.name}</h4>
                      <p className="text-xs opacity-80 font-mono leading-relaxed">
                        {currentStep.desc}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/30 border border-white/5 font-mono text-xs space-y-2">
                      <div className="text-[10px] font-bold text-white/50 uppercase">Architecture Safeguards:</div>
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Signed webhook replay defense enabled
                      </div>
                      <div className="text-[11px] text-blue-400 flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5" />
                        Nexora Core DB remains source of truth
                      </div>
                    </div>
                  </div>

                  {/* Wire Payload Inspector */}
                  <div className="lg:col-span-7">
                    <div className="p-4 rounded-2xl bg-black/60 border border-white/10 font-mono space-y-3">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5" />
                          Wire Protocol & Payload Specification
                        </span>
                        <span className="text-[10px] text-white/40">JSON-RPC / Webhook</span>
                      </div>

                      <pre className="text-xs text-emerald-300 font-mono overflow-x-auto p-3 rounded-xl bg-black/80 border border-white/5 max-h-72">
                        {JSON.stringify(currentStep.payload, null, 2)}
                      </pre>
                    </div>
                  </div>

                </div>
              );
            })()}

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW TAB 4: AI MODEL CONTEXT PROTOCOL (MCP) & SANDBOX     */}
      {/* ========================================================= */}
      {activeTab === 'mcp_sandbox' && (
        <div className="space-y-6">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left: Test Controls */}
            <div className="lg:col-span-5 space-y-5">
              
              <div className={`p-6 rounded-3xl border space-y-4 ${
                isDark ? 'bg-[#0E121B] border-white/10' : 'bg-white border-black/10'
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-400" />
                    <h3 className="text-base font-black font-mono">Model Context Protocol (MCP)</h3>
                  </div>
                  <p className="text-xs opacity-60 font-mono mt-1">
                    Controlled LLM tool-calling endpoints allowing authorized AI assistants to safely query Nexora.
                  </p>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="text-[10px] opacity-60 uppercase font-bold block mb-1">Target Adapter</label>
                    <select
                      value={sandboxProvider}
                      onChange={(e) => setSandboxProvider(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border outline-none font-mono text-xs ${
                        isDark ? 'bg-black/60 border-white/10 text-white' : 'bg-white border-black/10 text-black'
                      }`}
                    >
                      <option value="paystack">Paystack Payments Adapter</option>
                      <option value="stripe">Stripe Connect Adapter</option>
                      <option value="sendgrid">SendGrid Email Adapter</option>
                      <option value="twilio">Twilio SMS Adapter</option>
                      <option value="whatsapp">WhatsApp Business Platform</option>
                      <option value="google_maps">Google Maps Geocoding</option>
                      <option value="zoom">Zoom Webinar Provisioner</option>
                      <option value="openai_mcp">OpenAI / Gemini MCP Server</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] opacity-60 uppercase font-bold block mb-1">Adapter Function / MCP Tool</label>
                    <select
                      value={sandboxAction}
                      onChange={(e) => setSandboxAction(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border outline-none font-mono text-xs ${
                        isDark ? 'bg-black/60 border-white/10 text-white' : 'bg-white border-black/10 text-black'
                      }`}
                    >
                      <option value="verify_payment_intent">verify_payment_intent (HMAC check)</option>
                      <option value="dispatch_ticket_qr">dispatch_ticket_qr (SendGrid/WhatsApp)</option>
                      <option value="geocode_venue">geocode_venue (Google Maps Place ID)</option>
                      <option value="nexora_get_event">nexora_get_event (MCP Read Event Metadata)</option>
                      <option value="nexora_verify_qr">nexora_verify_qr (MCP Gate Turnstile Check)</option>
                      <option value="simulate_circuit_trip">simulate_circuit_trip (Failover test)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleRunSandbox}
                    disabled={sandboxRunning}
                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold cursor-pointer transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                  >
                    {sandboxRunning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Executing Tool Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Dispatch Test Request (Ping Upstream)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* MCP Tool Registry Summary */}
              <div className={`p-5 rounded-2xl border space-y-3 font-mono text-xs ${
                isDark ? 'bg-[#0E121B] border-white/10' : 'bg-white border-black/10'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400">Active MCP Tool Registry</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">4 Tools Exported</span>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="font-bold text-purple-300">nexora_get_event(id)</span>
                    <p className="opacity-60 text-[10px]">Retrieves verified event metadata, ticket tiers, and venue coordinates.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="font-bold text-purple-300">nexora_verify_qr(hash, gateId)</span>
                    <p className="opacity-60 text-[10px]">Performs Ed25519 cryptographic ticket audit for gate handhelds.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="font-bold text-purple-300">nexora_check_ledger_balance()</span>
                    <p className="opacity-60 text-[10px]">Verifies debits = credits invariant for Account 1010 vs 2010.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="font-bold text-purple-300">nexora_ai_executive_brief()</span>
                    <p className="opacity-60 text-[10px]">Synthesizes multi-country GMV and dispute telemetry.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right: Live Telemetry Terminal */}
            <div className="lg:col-span-7">
              <div className={`p-6 rounded-3xl border h-full flex flex-col ${
                isDark ? 'bg-[#090C13] border-white/10' : 'bg-[#0B0F19] text-white border-black/10'
              }`}>
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono font-bold text-xs text-emerald-400">Nexora Integration Bus Real-time Terminal</span>
                  </div>
                  <span className="text-[10px] font-mono opacity-50">STDOUT / JSON-RPC</span>
                </div>

                <div className="flex-1 font-mono text-xs space-y-2 overflow-y-auto max-h-[460px] p-3 rounded-2xl bg-black/80 border border-white/5">
                  {sandboxLogs.map((log, i) => (
                    <div 
                      key={i} 
                      className={`leading-relaxed ${
                        log.includes('SUCCESS') || log.includes('COMPLETED')
                          ? 'text-emerald-300'
                          : log.includes('SYSTEM') || log.includes('CIRCUIT')
                          ? 'text-amber-300'
                          : 'text-white/80'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/50">
                  <span>Transport: WebSocket + TLS 1.3</span>
                  <button
                    onClick={() => setSandboxLogs([`[${new Date().toLocaleTimeString()}] Logs cleared by admin.`])}
                    className="hover:text-white cursor-pointer"
                  >
                    Clear Terminal
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW TAB 5: CIRCUIT BREAKERS & FAULT TOLERANCE            */}
      {/* ========================================================= */}
      {activeTab === 'circuit_breakers' && (
        <div className="space-y-6">

          <div className={`p-6 rounded-3xl border space-y-4 ${
            isDark ? 'bg-[#0E121B] border-white/10' : 'bg-white border-black/10'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black font-mono flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-400" />
                  Circuit Breaker & Graceful Degradation Matrix
                </h3>
                <p className="text-xs opacity-60 font-mono mt-1">
                  Protects Nexora from cascading upstream vendor outages. Automatically trips if failure rate &gt; 35% or latency &gt; 2500ms.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300">CLOSED: Normal Traffic</span>
                <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300">HALF-OPEN: Canary Ping</span>
                <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-300">OPEN: Fail-Fast Fallback</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {providers.map(p => {
                const breakerState = p.circuitBreaker;

                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      breakerState === 'closed'
                        ? 'border-emerald-500/30 bg-emerald-950/10'
                        : breakerState === 'half-open'
                        ? 'border-amber-500/40 bg-amber-950/20'
                        : 'border-red-500/50 bg-red-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-sm">{p.name}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        breakerState === 'closed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : breakerState === 'half-open'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {breakerState}
                      </span>
                    </div>

                    <div className="text-xs opacity-60 font-mono mb-3 capitalize">
                      Category: {p.category.replace('_', ' ')}
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono border-t border-inherit/40 pt-3">
                      <span className="text-[11px] opacity-70">SLA Latency: {p.latencyMs}ms</span>
                      <button
                        onClick={() => handleToggleCircuitBreaker(p.id)}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-mono font-bold cursor-pointer transition-colors"
                      >
                        Cycle State ⟳
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
