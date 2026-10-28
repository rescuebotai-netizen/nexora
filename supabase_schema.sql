-- ============================================================================
-- NEXORA EVENT COMMERCE PLATFORM — FULL SUPABASE POSTGRESQL BACKEND SCHEMA
-- ============================================================================
-- Complete schema covering all roles (Attendee, Organizer, Scanner, Super Admin),
-- cryptographic ticketing, double-entry GAAP financial ledger, waitlist engine,
-- cashless RFID POS system, country launch gates, webhooks, and Row-Level Security (RLS).
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. ENUM TYPES
-- ============================================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'attendee',
    'organizer',
    'scanner',
    'admin',
    'support_lead',
    'gate_supervisor'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE kyb_status AS ENUM (
    'unverified',
    'pending_kyc',
    'verified',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE event_format AS ENUM (
    'in_person',
    'online',
    'hybrid'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE event_status AS ENUM (
    'draft',
    'published',
    'sold_out',
    'cancelled',
    'ended'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'created',
    'pending',
    'processing',
    'succeeded',
    'failed',
    'refunded'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_provider AS ENUM (
    'paystack',
    'flutterwave',
    'mpesa',
    'ozow',
    'stripe_card',
    'sandbox'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM (
    'valid',
    'checked_in',
    'transferred',
    'cancelled',
    'refunded',
    'revoked'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE ledger_entry_type AS ENUM (
    'customer_clearing',      -- Gross customer payment
    'organizer_payable',      -- Net amount credited to organizer escrow
    'platform_commission',    -- Platform take-rate (e.g. 5%)
    'processing_fee',         -- Gateway interchange pass-through
    'payout_transfer',        -- Settlement paid out to bank
    'refund_reserve',         -- Reserve allocated for chargebacks
    'refund_reversal'         -- Customer clearing reversal
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payout_status AS ENUM (
    'pending',
    'approved',
    'processing',
    'completed',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE waitlist_status AS ENUM (
    'waiting',
    'notified',
    'claimed',
    'expired',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE wristband_status AS ENUM (
    'active',
    'blocked',
    'paired'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE wristband_tx_type AS ENUM (
    'topup',
    'purchase',
    'refund'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE webhook_status AS ENUM (
    'received',
    'verified',
    'processed',
    'signature_mismatch',
    'replayed_duplicate',
    'failed'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE announcement_urgency AS ENUM (
    'info',
    'warning',
    'critical'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE announcement_audience AS ENUM (
    'all',
    'organizers',
    'attendees'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 3. CORE TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 PROFILES (Extends auth.users in Supabase)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'attendee',
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  country TEXT DEFAULT 'ZA',
  city TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending_verification')),
  two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
  risk_score INTEGER NOT NULL DEFAULT 5 CHECK (risk_score >= 0 AND risk_score <= 100),
  suspension_reason TEXT,
  notes TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 3.2 ORGANIZER PROFILES (Promoters, Event Companies, Collectives)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  legal_entity_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'ZA',
  city TEXT NOT NULL,
  address TEXT,
  bio TEXT,
  website TEXT,
  logo_url TEXT,
  banner_url TEXT,
  tax_number TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  verified BOOLEAN NOT NULL DEFAULT false,
  verification_status kyb_status NOT NULL DEFAULT 'unverified',
  verification_doc_name TEXT,
  verified_at TIMESTAMPTZ,
  subscription_plan TEXT NOT NULL DEFAULT 'growth' CHECK (subscription_plan IN ('starter', 'growth', 'business')),
  commission_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.0500, -- 5.0% flat default
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_holder TEXT,
  bank_branch_code TEXT,
  bank_account_type TEXT DEFAULT 'Current/Checking',
  total_revenue_minor BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 3.3 TEAM MEMBERS (Organization Delegation & Multi-user Access)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizer_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN (
    'Organization Owner',
    'Administrator',
    'Event Manager',
    'Finance Manager',
    'Check-In Staff',
    'Read-Only Analyst'
  )),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'deactivated')),
  permissions JSONB NOT NULL DEFAULT '{"events": true, "scanners": true, "finance": false}'::jsonb,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  joined_at TIMESTAMPTZ,
  CONSTRAINT unique_org_email UNIQUE(organization_id, email)
);

-- ----------------------------------------------------------------------------
-- 3.4 EVENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES public.organizer_profiles(id) ON DELETE RESTRICT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'Concerts & Music',
    'Tech & Innovation',
    'Food & Wine',
    'Arts & Culture',
    'Business & Summits',
    'Sports & Wellness',
    'Nightlife & Parties',
    'Faith & Community'
  )),
  format event_format NOT NULL DEFAULT 'in_person',
  description TEXT NOT NULL,
  short_summary TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  banner_image TEXT,
  gallery TEXT[] DEFAULT ARRAY[]::TEXT[],
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Africa/Johannesburg',
  
  -- Venue JSON & Spatial Metadata
  venue_name TEXT NOT NULL,
  venue_address TEXT NOT NULL,
  venue_city TEXT NOT NULL,
  venue_country TEXT NOT NULL,
  venue_postal_code TEXT,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  virtual_url TEXT,
  
  status event_status NOT NULL DEFAULT 'published',
  featured BOOLEAN NOT NULL DEFAULT false,
  age_restriction TEXT,
  refund_policy TEXT NOT NULL DEFAULT 'Refunds permitted up to 7 days prior to event commencement.',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  currency TEXT NOT NULL DEFAULT 'ZAR',
  min_price_minor BIGINT NOT NULL DEFAULT 0,
  capacity_cap INTEGER,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'private', 'invitation')),
  
  -- Extended structured metadata
  agenda JSONB DEFAULT '[]'::jsonb,
  performers JSONB DEFAULT '[]'::jsonb,
  sponsors JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  custom_questions JSONB DEFAULT '[]'::jsonb,
  theme_preset TEXT DEFAULT 'onyx_gold',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 3.5 TICKET TIERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ticket_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_minor BIGINT NOT NULL CHECK (price_minor >= 0),
  currency TEXT NOT NULL DEFAULT 'ZAR',
  capacity INTEGER NOT NULL CHECK (capacity >= 0),
  sold_count INTEGER NOT NULL DEFAULT 0 CHECK (sold_count >= 0),
  reserved_count INTEGER NOT NULL DEFAULT 0 CHECK (reserved_count >= 0),
  min_per_order INTEGER NOT NULL DEFAULT 1,
  max_per_order INTEGER NOT NULL DEFAULT 10,
  sales_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  sales_end TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold_out', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT check_capacity_bounds CHECK (sold_count + reserved_count <= capacity)
);

-- ----------------------------------------------------------------------------
-- 3.6 PROMO CODES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  organizer_id UUID REFERENCES public.organizer_profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage >= 1 AND discount_percentage <= 100),
  max_uses INTEGER NOT NULL DEFAULT 100,
  times_used INTEGER NOT NULL DEFAULT 0 CHECK (times_used <= max_uses),
  valid_from TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  valid_to TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 3.7 ORDERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_reference TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  event_title TEXT NOT NULL,
  
  -- Minor unit financial values
  subtotal_minor BIGINT NOT NULL CHECK (subtotal_minor >= 0),
  fee_minor BIGINT NOT NULL DEFAULT 0 CHECK (fee_minor >= 0),
  discount_minor BIGINT NOT NULL DEFAULT 0 CHECK (discount_minor >= 0),
  tax_minor BIGINT NOT NULL DEFAULT 0 CHECK (tax_minor >= 0),
  total_minor BIGINT NOT NULL CHECK (total_minor >= 0),
  currency TEXT NOT NULL DEFAULT 'ZAR',
  
  payment_status order_status NOT NULL DEFAULT 'created',
  payment_method TEXT NOT NULL,
  payment_provider payment_provider NOT NULL DEFAULT 'paystack',
  transaction_reference TEXT NOT NULL,
  promo_code_applied TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 3.8 ORDER ITEMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES public.ticket_tiers(id) ON DELETE RESTRICT,
  tier_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_minor BIGINT NOT NULL CHECK (unit_price_minor >= 0),
  total_price_minor BIGINT NOT NULL CHECK (total_price_minor >= 0),
  currency TEXT NOT NULL DEFAULT 'ZAR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 3.9 TICKETS (Cryptographic Passports & Tamper-Evident Passes)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_code TEXT NOT NULL UNIQUE,          -- e.g. NX-TKT-84920
  token TEXT NOT NULL UNIQUE,                -- Random high-entropy validation token
  security_hash TEXT NOT NULL,               -- SHA-256 HMAC anti-counterfeit hash
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  tier_id UUID NOT NULL REFERENCES public.ticket_tiers(id) ON DELETE RESTRICT,
  attendee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  attendee_phone TEXT,
  price_minor BIGINT NOT NULL,
  currency TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'valid',
  checked_in_at TIMESTAMPTZ,
  checked_in_by TEXT,
  gate TEXT,
  qr_payload TEXT NOT NULL,
  refund_reason TEXT,
  custom_answers JSONB DEFAULT '{}'::jsonb,
  transfer_allowed BOOLEAN NOT NULL DEFAULT true,
  resale_allowed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 3.10 CHECK-IN LOGS (Fleet Gate Scanners & Anti-Passback Telemetry)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  ticket_code TEXT NOT NULL,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  staff_name TEXT NOT NULL,
  scanner_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  gate TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN (
    'valid',
    'already_checked_in',
    'invalid',
    'refunded',
    'wrong_event'
  )),
  message TEXT NOT NULL,
  offline_sync BOOLEAN NOT NULL DEFAULT false,
  device_info JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 3.11 DOUBLE-ENTRY GENERAL LEDGER (Immutable GAAP Journal)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  organizer_id UUID REFERENCES public.organizer_profiles(id) ON DELETE RESTRICT,
  type ledger_entry_type NOT NULL,
  account_code TEXT NOT NULL DEFAULT '2010', -- GAAP Chart of Accounts Code
  account_name TEXT NOT NULL DEFAULT 'Customer Clearing',
  debit_minor BIGINT NOT NULL DEFAULT 0 CHECK (debit_minor >= 0),
  credit_minor BIGINT NOT NULL DEFAULT 0 CHECK (credit_minor >= 0),
  currency TEXT NOT NULL DEFAULT 'ZAR',
  description TEXT NOT NULL,
  reference TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT check_at_least_one_amount CHECK (debit_minor > 0 OR credit_minor > 0),
  CONSTRAINT check_cannot_have_both CHECK (NOT (debit_minor > 0 AND credit_minor > 0))
);

-- ----------------------------------------------------------------------------
-- 3.12 PAYOUT REQUESTS (Milestone & Post-Event Bank Transfers)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES public.organizer_profiles(id) ON DELETE RESTRICT,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  currency TEXT NOT NULL DEFAULT 'ZAR',
  status payout_status NOT NULL DEFAULT 'pending',
  destination_bank_name TEXT NOT NULL,
  destination_account_number TEXT NOT NULL,
  destination_account_holder TEXT NOT NULL,
  transaction_reference TEXT,
  notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 3.13 REFUND REQUESTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.refund_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  currency TEXT NOT NULL DEFAULT 'ZAR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 3.14 WAITLIST ENTRIES (Queue & 2-Hour Automated Reclamation Engine)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.waitlist_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES public.ticket_tiers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  phone TEXT,
  name TEXT,
  position INTEGER NOT NULL CHECK (position > 0),
  status waitlist_status NOT NULL DEFAULT 'waiting',
  claim_token TEXT UNIQUE,
  claim_expires_at TIMESTAMPTZ,
  notified_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  dispatch_log JSONB DEFAULT '{}'::jsonb,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_event_waitlist_email UNIQUE(event_id, email)
);

-- ----------------------------------------------------------------------------
-- 3.15 CASHLESS RFID WRISTBANDS & POS TRANSACTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cashless_wristbands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uid TEXT NOT NULL UNIQUE,                   -- NFC Hardware UID (e.g. 04:A2:3B:18:9C)
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  linked_ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  attendee_phone TEXT,
  balance_minor BIGINT NOT NULL DEFAULT 0 CHECK (balance_minor >= 0),
  currency TEXT NOT NULL DEFAULT 'ZAR',
  status wristband_status NOT NULL DEFAULT 'active',
  pin_hash TEXT,
  paired_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  last_tapped_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.wristband_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wristband_id UUID NOT NULL REFERENCES public.cashless_wristbands(id) ON DELETE CASCADE,
  wristband_uid TEXT NOT NULL,
  type wristband_tx_type NOT NULL,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  balance_after_minor BIGINT NOT NULL CHECK (balance_after_minor >= 0),
  currency TEXT NOT NULL DEFAULT 'ZAR',
  vendor_name TEXT NOT NULL,
  vendor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reference TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 3.16 COUNTRY LAUNCH GATES (Pan-African Compliance & Gateway Routing)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.country_launch_gates (
  country_code TEXT PRIMARY KEY,               -- ZA, KE, NG, GH, RW, EG
  country_name TEXT NOT NULL,
  flag TEXT NOT NULL,
  currency TEXT NOT NULL,
  wave INTEGER NOT NULL DEFAULT 1,
  legal_entity_approved BOOLEAN NOT NULL DEFAULT true,
  payment_provider_live BOOLEAN NOT NULL DEFAULT true,
  settlement_currency_confirmed BOOLEAN NOT NULL DEFAULT true,
  compliant_funds_flow_model BOOLEAN NOT NULL DEFAULT true,
  refund_procedures_documented BOOLEAN NOT NULL DEFAULT true,
  tax_invoicing_reviewed BOOLEAN NOT NULL DEFAULT true,
  privacy_popia_ready BOOLEAN NOT NULL DEFAULT true,
  support_escalation_tested BOOLEAN NOT NULL DEFAULT true,
  e2e_test_passed BOOLEAN NOT NULL DEFAULT true,
  paid_sales_authorized BOOLEAN NOT NULL DEFAULT true,
  supported_gateways payment_provider[] DEFAULT ARRAY['paystack', 'stripe_card']::payment_provider[],
  default_commission_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.0500,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 3.17 WEBHOOK INGESTION LOGS (Cryptographic HMAC Audit Trail)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider payment_provider NOT NULL,
  event_id TEXT NOT NULL,
  event_signature TEXT NOT NULL,
  status webhook_status NOT NULL DEFAULT 'received',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  payload_summary TEXT NOT NULL,
  response_code INTEGER DEFAULT 200,
  amount_minor BIGINT,
  currency TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_provider_event UNIQUE(provider, event_id)
);

-- ----------------------------------------------------------------------------
-- 3.18 PLATFORM ANNOUNCEMENTS (Global Broadcasts)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  urgency announcement_urgency NOT NULL DEFAULT 'info',
  target_audience announcement_audience NOT NULL DEFAULT 'all',
  active BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- 3.19 COMMUNITY PULSE & HIGHLIGHTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  event_title TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_handle TEXT NOT NULL,
  author_avatar TEXT NOT NULL,
  role_badge TEXT NOT NULL DEFAULT 'Festival Attendee',
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'x', 'tiktok')),
  image_url TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL DEFAULT 'portrait' CHECK (aspect_ratio IN ('square', 'portrait', 'tall')),
  quote TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  likes_count INTEGER NOT NULL DEFAULT 0,
  city TEXT NOT NULL DEFAULT 'Cape Town',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 3.20 IMMUTABLE AUDIT LOGS (Super Admin Governance)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_email TEXT NOT NULL,
  actor_role user_role NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_state JSONB,
  new_state JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 4. PERFORMANCE & SEARCH INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_status_date ON public.events(status, start_date);
CREATE INDEX IF NOT EXISTS idx_events_city ON public.events(venue_city);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);

CREATE INDEX IF NOT EXISTS idx_ticket_tiers_event ON public.ticket_tiers(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_reference ON public.orders(order_reference);
CREATE INDEX IF NOT EXISTS idx_orders_event ON public.orders(event_id);

CREATE INDEX IF NOT EXISTS idx_tickets_code ON public.tickets(ticket_code);
CREATE INDEX IF NOT EXISTS idx_tickets_token ON public.tickets(token);
CREATE INDEX IF NOT EXISTS idx_tickets_order ON public.tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON public.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_attendee ON public.tickets(attendee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_email ON public.tickets(attendee_email);

CREATE INDEX IF NOT EXISTS idx_checkins_ticket ON public.check_ins(ticket_id);
CREATE INDEX IF NOT EXISTS idx_checkins_event ON public.check_ins(event_id);
CREATE INDEX IF NOT EXISTS idx_checkins_timestamp ON public.check_ins(timestamp);

CREATE INDEX IF NOT EXISTS idx_ledger_order ON public.ledger_entries(order_id);
CREATE INDEX IF NOT EXISTS idx_ledger_organizer ON public.ledger_entries(organizer_id);
CREATE INDEX IF NOT EXISTS idx_ledger_currency ON public.ledger_entries(currency);
CREATE INDEX IF NOT EXISTS idx_ledger_created_at ON public.ledger_entries(created_at);

CREATE INDEX IF NOT EXISTS idx_waitlist_event_pos ON public.waitlist_entries(event_id, position);
CREATE INDEX IF NOT EXISTS idx_waitlist_claim_token ON public.waitlist_entries(claim_token);

CREATE INDEX IF NOT EXISTS idx_wristbands_uid ON public.cashless_wristbands(uid);
CREATE INDEX IF NOT EXISTS idx_wristbands_event ON public.cashless_wristbands(event_id);
CREATE INDEX IF NOT EXISTS idx_wristband_tx_wristband ON public.wristband_transactions(wristband_id);

CREATE INDEX IF NOT EXISTS idx_webhooks_provider_event ON public.webhook_logs(provider, event_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit_logs(created_at);

-- ============================================================================
-- 5. BUSINESS LOGIC FUNCTIONS & VIEWS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5.1 USER PROFILE AUTOMATION TRIGGER (Supabase auth.users -> public.profiles)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    name,
    email,
    role,
    avatar_url,
    country,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'attendee'::user_role),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'country', 'ZA'),
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    updated_at = timezone('utc'::text, now());
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 5.2 ANTI-PASSBACK TURNSTILE CHECK-IN PROCEDURE
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_ticket_scan(
  p_ticket_code TEXT,
  p_staff_name TEXT,
  p_gate TEXT,
  p_scanner_user_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_ticket RECORD;
  v_result TEXT;
  v_msg TEXT;
BEGIN
  -- Locate ticket by ticket_code
  SELECT * INTO v_ticket 
  FROM public.tickets 
  WHERE ticket_code = p_ticket_code;

  IF NOT FOUND THEN
    INSERT INTO public.check_ins (
      ticket_id, ticket_code, event_id, staff_name, scanner_user_id, gate, result, message
    ) VALUES (
      uuid_nil(), p_ticket_code, uuid_nil(), p_staff_name, p_scanner_user_id, p_gate, 'invalid', 'Ticket code not found in registry.'
    );
    RETURN jsonb_build_object('success', false, 'result', 'invalid', 'message', 'Invalid Ticket Code.');
  END IF;

  -- Check status
  IF v_ticket.status = 'checked_in' THEN
    v_result := 'already_checked_in';
    v_msg := 'PASSBACK REJECTED: Ticket was already checked in at ' || to_char(v_ticket.checked_in_at, 'HH24:MI:SS') || ' at ' || COALESCE(v_ticket.gate, 'Gate Alpha');
    
    INSERT INTO public.check_ins (
      ticket_id, ticket_code, event_id, staff_name, scanner_user_id, gate, result, message
    ) VALUES (
      v_ticket.id, v_ticket.ticket_code, v_ticket.event_id, p_staff_name, p_scanner_user_id, p_gate, v_result, v_msg
    );
    
    RETURN jsonb_build_object('success', false, 'result', v_result, 'message', v_msg, 'ticket', row_to_json(v_ticket));
  ELSIF v_ticket.status = 'refunded' OR v_ticket.status = 'cancelled' OR v_ticket.status = 'revoked' THEN
    v_result := 'refunded';
    v_msg := 'ADMISSION DENIED: Ticket has been ' || v_ticket.status || '.';
    
    INSERT INTO public.check_ins (
      ticket_id, ticket_code, event_id, staff_name, scanner_user_id, gate, result, message
    ) VALUES (
      v_ticket.id, v_ticket.ticket_code, v_ticket.event_id, p_staff_name, p_scanner_user_id, p_gate, v_result, v_msg
    );
    
    RETURN jsonb_build_object('success', false, 'result', v_result, 'message', v_msg);
  END IF;

  -- Mark ticket valid & checked in
  UPDATE public.tickets
  SET status = 'checked_in',
      checked_in_at = timezone('utc'::text, now()),
      checked_in_by = p_staff_name,
      gate = p_gate,
      updated_at = timezone('utc'::text, now())
  WHERE id = v_ticket.id;

  INSERT INTO public.check_ins (
    ticket_id, ticket_code, event_id, staff_name, scanner_user_id, gate, result, message
  ) VALUES (
    v_ticket.id, v_ticket.ticket_code, v_ticket.event_id, p_staff_name, p_scanner_user_id, p_gate, 'valid', 'Access Granted: Verified Attendee Pass.'
  );

  RETURN jsonb_build_object(
    'success', true, 
    'result', 'valid', 
    'message', 'Approved: Welcome ' || v_ticket.attendee_name || '!',
    'attendeeName', v_ticket.attendee_name,
    'tierName', (SELECT name FROM public.ticket_tiers WHERE id = v_ticket.tier_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 5.3 CASHLESS RFID POS DEDUCTION FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.process_wristband_charge(
  p_uid TEXT,
  p_amount_minor BIGINT,
  p_vendor_name TEXT,
  p_vendor_user_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_wb RECORD;
  v_new_bal BIGINT;
  v_ref TEXT;
BEGIN
  SELECT * INTO v_wb 
  FROM public.cashless_wristbands 
  WHERE uid = p_uid FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Wristband not paired.');
  END IF;

  IF v_wb.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Wristband is ' || v_wb.status || '.');
  END IF;

  IF v_wb.balance_minor < p_amount_minor THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Insufficient Funds. Current Balance: ' || v_wb.currency || ' ' || (v_wb.balance_minor::numeric / 100)::text
    );
  END IF;

  v_new_bal := v_wb.balance_minor - p_amount_minor;
  v_ref := 'POS-' || p_uid || '-' || substring(gen_random_uuid()::text, 1, 6);

  UPDATE public.cashless_wristbands
  SET balance_minor = v_new_bal,
      last_tapped_at = timezone('utc'::text, now())
  WHERE id = v_wb.id;

  INSERT INTO public.wristband_transactions (
    wristband_id, wristband_uid, type, amount_minor, balance_after_minor, currency, vendor_name, vendor_user_id, reference
  ) VALUES (
    v_wb.id, v_wb.uid, 'purchase', p_amount_minor, v_new_bal, v_wb.currency, p_vendor_name, p_vendor_user_id, v_ref
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Payment Approved: ' || v_wb.currency || ' ' || (p_amount_minor::numeric / 100)::text || ' deducted.',
    'newBalanceMinor', v_new_bal,
    'currency', v_wb.currency,
    'reference', v_ref
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 5.4 DOUBLE-ENTRY LEDGER RECONCILIATION AUDIT VIEW
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_ledger_reconciliation AS
SELECT 
  currency,
  SUM(debit_minor) AS total_debits_minor,
  SUM(credit_minor) AS total_credits_minor,
  (SUM(debit_minor) - SUM(credit_minor)) AS drift_minor,
  CASE 
    WHEN SUM(debit_minor) = SUM(credit_minor) THEN true 
    ELSE false 
  END AS is_balanced,
  COUNT(*) AS total_entries
FROM public.ledger_entries
GROUP BY currency;

-- ============================================================================
-- 6. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashless_wristbands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wristband_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_launch_gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Helper Functions for RLS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- RLS: PROFILES
-- ----------------------------------------------------------------------------
CREATE POLICY "Profiles readable by owner or admins"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- RLS: EVENTS
-- ----------------------------------------------------------------------------
CREATE POLICY "Public events readable by everyone"
  ON public.events FOR SELECT
  USING (status = 'published' OR public.is_admin() OR organizer_id IN (
    SELECT id FROM public.organizer_profiles WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Organizers can create events"
  ON public.events FOR INSERT
  WITH CHECK (
    public.is_admin() OR 
    organizer_id IN (SELECT id FROM public.organizer_profiles WHERE owner_id = auth.uid())
  );

CREATE POLICY "Organizers can update their own events"
  ON public.events FOR UPDATE
  USING (
    public.is_admin() OR 
    organizer_id IN (SELECT id FROM public.organizer_profiles WHERE owner_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- RLS: TICKET TIERS
-- ----------------------------------------------------------------------------
CREATE POLICY "Tiers readable by everyone"
  ON public.ticket_tiers FOR SELECT
  USING (true);

CREATE POLICY "Organizers manage their event tiers"
  ON public.ticket_tiers FOR ALL
  USING (
    public.is_admin() OR 
    event_id IN (
      SELECT e.id FROM public.events e 
      JOIN public.organizer_profiles o ON e.organizer_id = o.id 
      WHERE o.owner_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- RLS: ORDERS & ORDER ITEMS
-- ----------------------------------------------------------------------------
CREATE POLICY "Customers view their own orders"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = customer_id OR 
    public.is_admin() OR
    event_id IN (
      SELECT e.id FROM public.events e 
      JOIN public.organizer_profiles o ON e.organizer_id = o.id 
      WHERE o.owner_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id OR customer_id IS NULL);

CREATE POLICY "Order items readable with order"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.customer_id = auth.uid() OR public.is_admin()))
  );

-- ----------------------------------------------------------------------------
-- RLS: TICKETS
-- ----------------------------------------------------------------------------
CREATE POLICY "Attendees view their own tickets"
  ON public.tickets FOR SELECT
  USING (
    auth.uid() = attendee_id OR
    attendee_email = (SELECT email FROM public.profiles WHERE id = auth.uid()) OR
    public.is_admin() OR
    event_id IN (
      SELECT e.id FROM public.events e 
      JOIN public.organizer_profiles o ON e.organizer_id = o.id 
      WHERE o.owner_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- RLS: CHECK-INS
-- ----------------------------------------------------------------------------
CREATE POLICY "Check-in logs viewable by organizers, staff, and admins"
  ON public.check_ins FOR SELECT
  USING (
    public.is_admin() OR
    event_id IN (
      SELECT e.id FROM public.events e 
      JOIN public.organizer_profiles o ON e.organizer_id = o.id 
      WHERE o.owner_id = auth.uid()
    )
  );

CREATE POLICY "Gate staff can insert check-in records"
  ON public.check_ins FOR INSERT
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- RLS: GENERAL LEDGER
-- ----------------------------------------------------------------------------
CREATE POLICY "Only Super Admins and owning Organizers can view ledger"
  ON public.ledger_entries FOR SELECT
  USING (
    public.is_admin() OR
    organizer_id IN (SELECT id FROM public.organizer_profiles WHERE owner_id = auth.uid())
  );

CREATE POLICY "Ledger entries can only be written by system or admin"
  ON public.ledger_entries FOR INSERT
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- RLS: CASHLESS WRISTBANDS
-- ----------------------------------------------------------------------------
CREATE POLICY "Wristbands viewable by owner or admin"
  ON public.cashless_wristbands FOR SELECT
  USING (
    auth.uid() = user_id OR
    attendee_email = (SELECT email FROM public.profiles WHERE id = auth.uid()) OR
    public.is_admin()
  );

CREATE POLICY "Wristband transactions viewable by owner or admin"
  ON public.wristband_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cashless_wristbands w 
      WHERE w.id = wristband_id AND (w.user_id = auth.uid() OR public.is_admin())
    )
  );

-- ----------------------------------------------------------------------------
-- RLS: LAUNCH GATES & ANNOUNCEMENTS
-- ----------------------------------------------------------------------------
CREATE POLICY "Launch gates readable by all"
  ON public.country_launch_gates FOR SELECT
  USING (true);

CREATE POLICY "Announcements readable by all"
  ON public.platform_announcements FOR SELECT
  USING (active = true OR public.is_admin());

CREATE POLICY "Community pulse readable by all"
  ON public.community_highlights FOR SELECT
  USING (true);

-- ============================================================================
-- 7. INITIAL PAN-AFRICAN LAUNCH GATES SEEDING
-- ============================================================================
INSERT INTO public.country_launch_gates (
  country_code, country_name, flag, currency, wave, legal_entity_approved, 
  payment_provider_live, settlement_currency_confirmed, compliant_funds_flow_model,
  refund_procedures_documented, tax_invoicing_reviewed, privacy_popia_ready,
  support_escalation_tested, e2e_test_passed, paid_sales_authorized, supported_gateways
) VALUES 
('ZA', 'South Africa', '🇿🇦', 'ZAR', 1, true, true, true, true, true, true, true, true, true, true, ARRAY['paystack', 'ozow', 'stripe_card']::payment_provider[]),
('KE', 'Kenya', '🇰🇪', 'KES', 1, true, true, true, true, true, true, true, true, true, true, ARRAY['mpesa', 'flutterwave', 'paystack']::payment_provider[]),
('NG', 'Nigeria', '🇳🇬', 'NGN', 1, true, true, true, true, true, true, true, true, true, true, ARRAY['paystack', 'flutterwave']::payment_provider[]),
('GH', 'Ghana', '🇬🇭', 'GHS', 2, true, true, true, true, true, true, true, true, true, true, ARRAY['flutterwave', 'paystack']::payment_provider[]),
('RW', 'Rwanda', '🇷🇼', 'RWF', 2, true, true, true, true, true, true, true, true, true, true, ARRAY['flutterwave']::payment_provider[]),
('EG', 'Egypt', '🇪🇬', 'USD', 3, true, true, true, true, true, true, true, true, true, true, ARRAY['stripe_card', 'paystack']::payment_provider[])
ON CONFLICT (country_code) DO NOTHING;

-- ============================================================================
-- END OF NEXORA SUPABASE SCHEMA
-- ============================================================================
