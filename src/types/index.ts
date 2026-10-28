export type EventFormat = 'in_person' | 'online' | 'hybrid';
export type EventCategory = 
  | 'Concerts & Music'
  | 'Tech & Innovation'
  | 'Food & Wine'
  | 'Arts & Culture'
  | 'Business & Summits'
  | 'Sports & Wellness'
  | 'Nightlife & Parties'
  | 'Faith & Community';

export interface AgendaItem {
  id?: string;
  time: string;
  title: string;
  description?: string;
  speaker?: string;
  stage?: string;
  track?: string;
}

export interface Performer {
  name: string;
  role: string;
  avatar?: string;
}

export interface TicketTier {
  id: string;
  eventId: string;
  name: string;
  description: string;
  priceMinor: number; // in integer cents/minor units (e.g., 25000 = 250.00)
  currency: string;
  capacity: number;
  remaining: number;
  minPerOrder: number;
  maxPerOrder: number;
  salesStart: string;
  salesEnd: string;
  status: 'active' | 'sold_out' | 'paused';
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  category: EventCategory;
  format: EventFormat;
  description: string;
  shortSummary: string;
  coverImage: string;
  bannerImage?: string;
  gallery?: string[];
  startDate: string; // ISO
  endDate: string; // ISO
  timezone: string;
  venue: {
    name: string;
    address: string;
    city: string;
    country: string;
    postalCode?: string;
    coordinates?: { lat: number; lng: number };
  };
  virtualUrl?: string;
  organizer: {
    id: string;
    name: string;
    verified: boolean;
    rating: number;
    avatar?: string;
    bio?: string;
  };
  tickets: TicketTier[];
  status: 'published' | 'draft' | 'cancelled' | 'ended';
  featured: boolean;
  ageRestriction?: string;
  refundPolicy: string;
  tags: string[];
  agenda?: AgendaItem[];
  performers?: Performer[];
  currency: string;
  minPriceMinor: number;
  capacityCap?: number;
  visibility?: 'public' | 'unlisted' | 'private' | 'invitation';
  sponsors?: { id: string; name: string; tier: string; logo?: string; url?: string }[];
  faqs?: { id: string; question: string; answer: string }[];
  customQuestions?: { id: string; label: string; type: 'text' | 'dropdown' | 'checkbox'; required: boolean; options?: string[] }[];
  themePreset?: string;
  seoMetadata?: { title: string; description: string; slug: string };
  payoutSettings?: { bankName: string; accountNumber: string; currency: string; accountHolder?: string };
}

export interface OrderItem {
  tierId: string;
  tierName: string;
  quantity: number;
  unitPriceMinor: number;
  totalPriceMinor: number;
}

export interface Order {
  id: string;
  orderReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventId: string;
  eventTitle: string;
  items: OrderItem[];
  subtotalMinor: number;
  feeMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
  currency: string;
  paymentStatus: 'created' | 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  paymentMethod: string;
  paymentProvider: 'paystack' | 'flutterwave' | 'mpesa' | 'ozow' | 'stripe_card' | 'sandbox';
  transactionReference: string;
  promoCodeApplied?: string;
  createdAt: string;
  expiresAt: string;
}

export interface Ticket {
  id: string;
  ticketCode: string; // e.g. NX-TKT-84920
  token: string; // cryptographic validation token
  orderId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  tierId: string;
  tierName: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  priceMinor: number;
  currency: string;
  status: 'valid' | 'checked_in' | 'cancelled' | 'refunded';
  checkedInAt?: string;
  checkedInBy?: string;
  gate?: string;
  qrPayload: string;
  refundReason?: string;
  customAnswers?: Record<string, string>;
}

export interface CheckInLog {
  id: string;
  ticketId: string;
  ticketCode: string;
  eventId: string;
  timestamp: string;
  staffName: string;
  gate: string;
  result: 'valid' | 'already_checked_in' | 'invalid' | 'refunded' | 'wrong_event';
  message: string;
  offlineSync?: boolean;
}

export interface LedgerEntry {
  id: string;
  orderId?: string;
  eventId?: string;
  organizerId: string;
  type: 'customer_clearing' | 'organizer_payable' | 'platform_commission' | 'processing_fee' | 'payout_transfer' | 'refund_reserve' | 'refund_reversal';
  debitMinor: number;
  creditMinor: number;
  currency: string;
  description: string;
  timestamp: string;
}

export interface RefundRequest {
  id: string;
  ticketId: string;
  ticketCode: string;
  orderId: string;
  eventId: string;
  eventTitle: string;
  attendeeEmail: string;
  attendeeName: string;
  reason: string;
  amountMinor: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercentage: number;
  maxUses: number;
  timesUsed: number;
  eventId?: string; // all events if undefined
  active: boolean;
}

export interface TeamMember {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: 'Organization Owner' | 'Administrator' | 'Event Manager' | 'Finance Manager' | 'Check-In Staff' | 'Read-Only Analyst';
  invitedAt: string;
  status: 'active' | 'invited';
}

export interface ThirdPartyIntegration {
  id: string;
  name: string;
  category: 'payment' | 'marketing' | 'messaging' | 'streaming' | 'accounting' | 'developer';
  categoryLabel: string;
  iconName: string;
  description: string;
  status: 'connected' | 'disconnected' | 'needs_setup';
  badge?: string;
  lastSyncedAt?: string;
  docsUrl?: string;
  config: {
    apiKey?: string;
    apiSecret?: string;
    webhookUrl?: string;
    accountId?: string;
    senderIdOrChannel?: string;
    mode?: 'live' | 'sandbox';
    autoSync?: boolean;
    features?: Record<string, boolean>;
    customMetadata?: Record<string, string>;
  };
  metrics?: {
    syncedRecords?: number;
    uptime?: string;
    lastPingStatus?: 'healthy' | 'warning' | 'error';
    latencyMs?: number;
  };
}

export interface CustomWebhookEndpoint {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
  lastResponseCode?: number;
  lastLatencyMs?: number;
}

export interface WebhookDeliveryLog {
  id: string;
  endpointId: string;
  endpointName: string;
  event: string;
  timestamp: string;
  statusCode: number;
  latencyMs: number;
  payloadSnippet: string;
  success: boolean;
}

export interface OrganizerProfile {
  id: string;
  name: string;
  legalEntityName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address?: string;
  bio?: string;
  website?: string;
  logoUrl?: string;
  bannerUrl?: string;
  taxNumber?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  verified: boolean;
  verificationStatus: 'unverified' | 'pending_kyc' | 'verified' | 'rejected';
  verificationDocName?: string;
  subscriptionPlan: 'starter' | 'growth' | 'business';
  commissionRate: number; // e.g. 0.05 for 5%
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    branchCode?: string;
    accountType?: string;
  };
  integrations?: ThirdPartyIntegration[];
  customWebhooks?: CustomWebhookEndpoint[];
}

export interface PayoutRequest {
  id: string;
  organizerId: string;
  amountMinor: number;
  currency: string;
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  destinationAccount: string;
}

export interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  enabled: boolean;
  supportedGateways: Array<'paystack' | 'flutterwave' | 'mpesa' | 'ozow' | 'stripe_card'>;
  defaultCommissionRate: number;
}

export interface CountryLaunchGate {
  countryCode: string;
  countryName: string;
  flag: string;
  wave: number;
  legalEntityApproved: boolean;
  paymentProviderLive: boolean;
  settlementCurrencyConfirmed: boolean;
  compliantFundsFlowModel: boolean;
  refundProceduresDocumented: boolean;
  taxInvoicingReviewed: boolean;
  privacyPOPIAReady: boolean;
  supportEscalationTested: boolean;
  e2eTestPassed: boolean;
  paidSalesAuthorized: boolean;
}

export interface WebhookLog {
  id: string;
  provider: 'paystack' | 'flutterwave' | 'mpesa' | 'ozow' | 'stripe_card';
  eventId: string;
  eventSignature: string;
  status: 'verified' | 'signature_mismatch' | 'replayed_duplicate' | 'processed';
  receivedAt: string;
  payloadSummary: string;
  amountMinor?: number;
  currency?: string;
}

export interface VenueRFP {
  id: string;
  venueName: string;
  city: string;
  country: string;
  contactPerson: string;
  targetDate: string;
  expectedAttendees: number;
  budgetFormatted: string;
  requirements: string[];
  status: 'draft' | 'submitted' | 'under_review' | 'accepted';
  submittedAt: string;
}

export interface MarketingCampaign {
  id: string;
  title: string;
  type: 'email' | 'promoter' | 'social';
  audience: string;
  sentCount: number;
  openRate: number;
  conversionRate: number;
  revenueGeneratedMinor: number;
  currency: string;
  status: 'draft' | 'active' | 'completed';
  scheduledDate: string;
}

export interface PriorityTask {
  id: string;
  title: string;
  category: 'capacity' | 'refund' | 'kyc' | 'agenda' | 'marketing';
  urgency: 'high' | 'medium' | 'low';
  actionLabel: string;
  resolved: boolean;
}

export interface ActivityFeedItem {
  id: string;
  type: 'purchase' | 'checkin' | 'refund' | 'campaign' | 'rfp' | 'session' | 'integration' | 'profile' | 'webhook';
  title: string;
  description: string;
  timestamp: string;
  actor: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'attendee' | 'organizer' | 'admin' | 'support_lead' | 'gate_supervisor';
  avatar?: string;
  provider?: 'password' | 'google' | 'apple' | 'magic_link' | 'supabase';
  organizationId?: string;
  status?: 'active' | 'suspended' | 'pending_verification';
  phone?: string;
  country?: string;
  city?: string;
  registeredAt?: string;
  lastLoginAt?: string;
  twoFactorEnabled?: boolean;
  riskScore?: number;
  suspensionReason?: string;
  notes?: string;
}

export interface PlatformCircuitBreakers {
  maintenanceMode: boolean;
  payoutsKillSwitch: boolean;
  checkoutFreeze: boolean;
  strictKycEnforced: boolean;
  webhookIdempotencyStrict: boolean;
  debugTelemetry: boolean;
}

export interface PlatformSettings {
  platformCommissionRate: number; // e.g. 0.035 (3.5%)
  fixedBookingFeeMinor: number; // e.g. 300 ($0.30 in minor)
  treasurySettlementReserveRate: number; // e.g. 0.05 (5% dispute reserve)
  disputeWindowDays: number;
  emergencyHotline: string;
  treasuryClearingAccount: string;
  enforceDoubleEntryCheck: boolean;
  defaultPayoutSchedule: 'instant' | 'daily' | 'weekly' | 'post_event';
}

export interface SuperAdminAuditEntry {
  id: string;
  action: string;
  category: 'event_moderation' | 'kyb_approval' | 'payout_settlement' | 'refund_override' | 'circuit_breaker' | 'config_change';
  target: string;
  actor: string;
  details: string;
  timestamp: string;
}

// =========================================================================
// Third-Party Hybrid Integration Architecture Types
// =========================================================================

export type IntegrationPillar = 
  | 'payments'
  | 'communication'
  | 'maps_venues'
  | 'virtual_events'
  | 'marketing_crm'
  | 'ai_automation';

export type IntegrationPriority = 'P1' | 'P2' | 'P3';

export interface IntegrationConnection {
  id: string;
  name: string;
  provider: string;
  pillar: IntegrationPillar;
  pillarLabel: string;
  priority: IntegrationPriority;
  priorityGuide: string;
  status: 'connected' | 'disconnected' | 'degraded' | 'sandbox' | 'pending_auth';
  badge: string;
  description: string;
  supportedRegions: string[];
  authType: 'oauth2' | 'api_key' | 'webhook_hmac' | 'jwt' | 'mcp_token';
  webhookSecretConfigured: boolean;
  vaultSecretRef: string;
  latencyMs: number;
  uptime: string;
  lastPingStatus: 'healthy' | 'warning' | 'error';
  lastSyncedAt: string;
  syncedRecordsCount: number;
  features: Record<string, boolean>;
  idempotencyStrict: boolean;
  failedQueueCount: number;
  docsUrl: string;
  endpointUrl?: string;
}

export type IntegrationFlowId = 
  | 'ticket_purchase'
  | 'event_creation'
  | 'ticket_checkin'
  | 'refund_cancellation'
  | 'marketing_engagement';

export interface IntegrationFlowStep {
  stepNumber: number;
  title: string;
  subsystem: 'Nexora Platform' | 'API Gateway' | 'Integration Layer' | 'External Provider' | 'Event Bus' | 'Core Database';
  providerName?: string;
  action: string;
  payloadSnippet: string;
  idempotencyKey?: string;
  signatureVerified?: boolean;
  status: 'completed' | 'active' | 'pending';
  ruleEnforced: string;
}

export interface NotificationJobRecord {
  id: string;
  orderId?: string;
  ticketId?: string;
  recipient: string;
  channel: 'email_ses' | 'sms_twilio' | 'whatsapp_meta' | 'fcm_push';
  channelLabel: string;
  template: 'ticket_confirmation' | 'gate_reminder' | 'refund_notice' | 'security_alert' | 'vip_arrival';
  status: 'delivered' | 'queued' | 'retrying' | 'failed' | 'dead_letter';
  attempts: number;
  maxAttempts: number;
  lastAttemptAt: string;
  providerResponse: string;
  errorDetails?: string;
}

export interface DeadLetterQueueItem {
  id: string;
  eventId: string;
  provider: string;
  eventType: string;
  payload: string;
  signatureHeader: string;
  receivedAt: string;
  failedAttempts: number;
  lastError: string;
  status: 'quarantined' | 'replaying' | 'resolved' | 'dismissed';
  resolvedAt?: string;
}

export interface NexoraCoreEntity {
  name: 'events' | 'ticket_types' | 'orders' | 'payments' | 'tickets' | 'attendees' | 'integration_connections' | 'webhook_events' | 'notification_jobs' | 'audit_logs';
  label: string;
  description: string;
  primaryKey: string;
  fields: Array<{ name: string; type: string; nullable: boolean; description: string }>;
  sampleRecordCount: number;
  lastMutatedAt: string;
}

export interface WaitlistEntry {
  id: string;
  eventId: string;
  eventTitle: string;
  email: string;
  name?: string;
  tierId?: string;
  tierName?: string;
  joinedAt: string;
  status: 'waiting' | 'notified' | 'claimed' | 'expired';
  position: number;
  phone?: string;
  claimToken?: string;
  notifiedAt?: string;
  claimExpiresAt?: string;
  claimedAt?: string;
  notificationDispatchLog?: {
    emailSent: boolean;
    smsSent: boolean;
    provider: 'SendGrid' | 'Amazon SES' | 'Twilio';
    messageId: string;
  };
}

export interface CashlessWristband {
  id: string;
  uid: string;
  attendeeEmail: string;
  attendeeName: string;
  eventId: string;
  eventTitle: string;
  balanceMinor: number;
  currency: string;
  status: 'active' | 'blocked' | 'paired';
  linkedTicketId?: string;
  pinRequired: boolean;
  lastTappedAt: string;
  transactions: Array<{
    id: string;
    type: 'topup' | 'purchase' | 'refund';
    amountMinor: number;
    vendorName: string;
    timestamp: string;
    balanceAfterMinor: number;
  }>;
}


export interface CommunityHighlight {
  id: string;
  eventId: string;
  eventTitle: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  roleBadge: string;
  platform: 'instagram' | 'x' | 'tiktok';
  imageUrl: string;
  aspectRatio: 'square' | 'portrait' | 'tall';
  quote: string;
  rating?: number;
  likesCount: number;
  userLiked?: boolean;
  timestamp: string;
  city: string;
}


