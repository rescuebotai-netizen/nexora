import { 
  Event, 
  Order, 
  Ticket, 
  CheckInLog, 
  LedgerEntry, 
  PromoCode, 
  OrganizerProfile, 
  PayoutRequest,
  RefundRequest,
  TeamMember,
  CountryLaunchGate,
  WebhookLog,
  VenueRFP,
  MarketingCampaign,
  PriorityTask,
  ActivityFeedItem,
  AuthUser,
  ThirdPartyIntegration,
  CustomWebhookEndpoint,
  WebhookDeliveryLog,
  PlatformCircuitBreakers,
  PlatformSettings,
  SuperAdminAuditEntry,
  WaitlistEntry,
  CommunityHighlight,
  CashlessWristband
} from '../types';

import heroFestivalImg from '../assets/images/hero_afro_festival_1791591623547.jpg';
import techSummitImg from '../assets/images/event_tech_summit_1791591635169.jpg';
import culinaryWineImg from '../assets/images/event_culinary_wine_1791591643928.jpg';
import artExhibitImg from '../assets/images/event_art_exhibit_1791591654774.jpg';
import festivalGuideImg from '../assets/images/festival-guide-1920x1080-1.jpg';
import rockingDaisiesImg from '../assets/images/Rocking-the-Daisies-558x400.jpg';
import capeTownEtcImg from '../assets/images/CapeTownETC_1280x720-1024x576.png';
import tourCrowdImg from '../assets/images/S003_Tour_SC_6604.jpg';
import unsplashAudienceImg from '../assets/images/unsplash-image-uf2nnANWa8Q.webp';

const STORAGE_KEY_PREFIX = 'nexora_db_v3_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error('Storage error for', key, err);
  }
}

const INITIAL_ORGANIZERS: OrganizerProfile[] = [
  {
    id: 'org-cape-vibes',
    name: 'Cape Town Vibes Live Ltd',
    legalEntityName: 'Cape Town Entertainment Group (Pty) Ltd',
    email: 'info@capetownvibes.co.za',
    phone: '+27 21 555 0192',
    country: 'ZA',
    city: 'Cape Town',
    address: 'Suite 402, The Boulevard Office Park, Searle Street, Woodstock, Cape Town, 7925',
    bio: 'Premier live music, festival production, and cultural summit house curating world-class stadium and amphitheatre experiences across Southern Africa.',
    website: 'https://capetownvibes.co.za',
    logoUrl: heroFestivalImg,
    bannerUrl: heroFestivalImg,
    taxNumber: 'ZA-VAT-4910294821',
    socialLinks: {
      instagram: '@capetownvibes',
      twitter: '@cptvibeslive',
      linkedin: 'cape-town-vibes-live',
      youtube: '@capetownvibeslive',
    },
    verified: true,
    verificationStatus: 'verified',
    verificationDocName: 'CIPC_Registration_2024_09214.pdf',
    subscriptionPlan: 'business',
    commissionRate: 0.035,
    bankDetails: {
      bankName: 'First National Bank (FNB)',
      accountNumber: '62891048291',
      accountHolder: 'Cape Town Entertainment Group (Pty) Ltd',
      branchCode: '250655',
      accountType: 'Business Cheque',
    },
  },
  {
    id: 'org-tech-africa',
    name: 'Africa Tech Vanguard',
    legalEntityName: 'Silicon Savannah Summits Kenya Ltd',
    email: 'connect@africatechsummit.io',
    phone: '+254 700 812 901',
    country: 'KE',
    city: 'Nairobi',
    verified: true,
    verificationStatus: 'verified',
    verificationDocName: 'KRA_Tax_Compliance_Cert_2025.pdf',
    subscriptionPlan: 'growth',
    commissionRate: 0.045,
    bankDetails: {
      bankName: 'Equity Bank Kenya',
      accountNumber: '018029381029',
      accountHolder: 'Silicon Savannah Summits Kenya Ltd',
      branchCode: '68001',
    },
  },
  {
    id: 'org-lagos-epicure',
    name: 'Eko Epicurean Guild',
    legalEntityName: 'Eko Gastronomy Enterprises Ltd',
    email: 'curator@ekoepicure.ng',
    phone: '+234 803 291 8472',
    country: 'NG',
    city: 'Lagos',
    verified: true,
    verificationStatus: 'verified',
    verificationDocName: 'CAC_Certificate_RC_1948201.pdf',
    subscriptionPlan: 'growth',
    commissionRate: 0.045,
    bankDetails: {
      bankName: 'Guaranty Trust Bank (GTBank)',
      accountNumber: '0239182940',
      accountHolder: 'Eko Gastronomy Enterprises Ltd',
    },
  },
  {
    id: 'org-joburg-arts',
    name: 'Rosebank Art Pavilion',
    legalEntityName: 'Gauteng Arts & Heritage Trust',
    email: 'gallery@rosebankarts.org.za',
    phone: '+27 11 884 9201',
    country: 'ZA',
    city: 'Johannesburg',
    verified: true,
    verificationStatus: 'verified',
    verificationDocName: 'NPO_Cert_984_392.pdf',
    subscriptionPlan: 'starter',
    commissionRate: 0.05,
    bankDetails: {
      bankName: 'Standard Bank South Africa',
      accountNumber: '10192837461',
      accountHolder: 'Gauteng Arts & Heritage Trust',
      branchCode: '051001',
    },
  },
];

const INITIAL_EVENTS: Event[] = [
  {
    id: 'evt-cape-town-vibes-2026',
    slug: 'cape-town-vibes-festival-2026',
    title: 'Cape Town Vibes Festival 2026',
    category: 'Concerts & Music',
    format: 'in_person',
    description: `Cape Town Vibes returns for its flagship spring edition at the iconic Green Point Track, framed by the majestic silhouette of Table Mountain.\n\nExperience two stages of cutting-edge Amapiano, Afro House, Neo-Soul, and live brass bands with international headline acts and premier South African talent. Featuring artisanal food markets, craft cocktail gardens, and interactive creative installations.`,
    shortSummary: 'The premier open-air festival celebrating African electronic and live music under Table Mountain.',
    coverImage: heroFestivalImg,
    gallery: [heroFestivalImg, artExhibitImg],
    startDate: '2026-11-14T14:00:00Z',
    endDate: '2026-11-15T02:00:00Z',
    timezone: 'Africa/Johannesburg',
    venue: {
      name: 'Green Point Amphitheatre & Track',
      address: '11 Fritz Sonnenberg Road, Green Point',
      city: 'Cape Town',
      country: 'South Africa',
      postalCode: '8051',
      coordinates: { lat: -33.9056, lng: 18.4116 },
    },
    organizer: {
      id: 'org-cape-vibes',
      name: 'Cape Town Vibes Live Ltd',
      verified: true,
      rating: 4.9,
      bio: 'Leading premier live music and festival curator in Southern Africa.',
    },
    tickets: [
      {
        id: 'tier-ct-early',
        eventId: 'evt-cape-town-vibes-2026',
        name: 'General Admission — Phase 1',
        description: 'Full festival access to Main Stage and Beats Garden. Cashless wristband included.',
        priceMinor: 35000, // R350.00
        currency: 'ZAR',
        capacity: 1500,
        remaining: 342,
        minPerOrder: 1,
        maxPerOrder: 6,
        salesStart: '2026-08-01T00:00:00Z',
        salesEnd: '2026-11-14T12:00:00Z',
        status: 'active',
      },
      {
        id: 'tier-ct-vip',
        eventId: 'evt-cape-town-vibes-2026',
        name: 'VIP Terrace Deck',
        description: 'Elevated viewing deck, private lounge bar, dedicated express gate entry, and luxury restrooms.',
        priceMinor: 85000, // R850.00
        currency: 'ZAR',
        capacity: 350,
        remaining: 68,
        minPerOrder: 1,
        maxPerOrder: 4,
        salesStart: '2026-08-01T00:00:00Z',
        salesEnd: '2026-11-14T12:00:00Z',
        status: 'active',
      },
      {
        id: 'tier-ct-backstage',
        eventId: 'evt-cape-town-vibes-2026',
        name: 'Backstage Artist Lounge',
        description: 'Exclusive backstage pass, complimentary gourmet food station, and artist hospitality lounge access.',
        priceMinor: 175000, // R1,750.00
        currency: 'ZAR',
        capacity: 50,
        remaining: 7,
        minPerOrder: 1,
        maxPerOrder: 2,
        salesStart: '2026-08-01T00:00:00Z',
        salesEnd: '2026-11-14T12:00:00Z',
        status: 'active',
      },
    ],
    status: 'published',
    featured: true,
    ageRestriction: '18+ ID required at gate',
    refundPolicy: 'Full refund available up to 7 days before the event. Booking fee is non-refundable.',
    tags: ['Amapiano', 'Live Music', 'Outdoor', 'Cape Town', 'Afro House'],
    currency: 'ZAR',
    minPriceMinor: 35000,
    agenda: [
      { time: '14:00', title: 'Gates Open & Sunken Garden Acoustic Sessions', stage: 'Stage B (Garden)' },
      { time: '16:30', title: 'Sunset Deep House Showcase', stage: 'Main Stage' },
      { time: '19:00', title: 'Mainstage Amapiano Symphony Live', stage: 'Main Stage' },
      { time: '22:00', title: 'International Headline B2B Performance', stage: 'Main Stage' },
      { time: '01:30', title: 'Closing Fireworks & Outro Set', stage: 'Main Stage' },
    ],
    performers: [
      { name: 'Kabza De Small & Friends', role: 'Mainstage Headliner' },
      { name: 'Sio & Sun-El Musician', role: 'Live Vocal Showcase' },
      { name: 'Karyendasoul', role: 'Afro-Tech Masterclass' },
    ],
  },
  {
    id: 'evt-africa-tech-summit-2026',
    slug: 'africa-tech-innovation-summit-nairobi-2026',
    title: 'Africa Tech Innovation Summit 2026',
    category: 'Tech & Innovation',
    format: 'hybrid',
    description: `The Silicon Savannah welcomes 3,000 global founders, corporate venture leaders, and engineers to Nairobi for the 8th annual Africa Tech Innovation Summit.\n\nKey themes include FinTech infrastructure, Artificial Intelligence for agriculture & health, cross-border African commerce, and venture capital syndicates across Kenya, Nigeria, and South Africa.`,
    shortSummary: 'East Africa’s foremost enterprise technology and investment summit at Radisson Arboretum.',
    coverImage: techSummitImg,
    gallery: [techSummitImg],
    startDate: '2026-10-22T08:00:00Z',
    endDate: '2026-10-24T18:00:00Z',
    timezone: 'Africa/Nairobi',
    venue: {
      name: 'Radisson Blu & Arboretum Convention Center',
      address: 'Elgon Road, Upper Hill',
      city: 'Nairobi',
      country: 'Kenya',
      coordinates: { lat: -1.2991, lng: 36.8182 },
    },
    virtualUrl: 'https://stream.nexora.events/nairobi-tech-summit-2026',
    organizer: {
      id: 'org-tech-africa',
      name: 'Africa Tech Vanguard',
      verified: true,
      rating: 4.8,
      bio: 'Premier technology convening platform bridging African tech to global capital.',
    },
    tickets: [
      {
        id: 'tier-ke-standard',
        eventId: 'evt-africa-tech-summit-2026',
        name: 'Delegate Pass (In-Person)',
        description: 'Access to 3-day keynotes, expo hall, startup demo day, and networking lunches.',
        priceMinor: 1500000,
        currency: 'KES',
        capacity: 1200,
        remaining: 410,
        minPerOrder: 1,
        maxPerOrder: 10,
        salesStart: '2026-07-01T00:00:00Z',
        salesEnd: '2026-10-22T08:00:00Z',
        status: 'active',
      },
      {
        id: 'tier-ke-investor',
        eventId: 'evt-africa-tech-summit-2026',
        name: 'Investor & VIP Pass',
        description: 'Exclusive 1-on-1 founder deal lounge, closed-door LP/GP breakfast, and gala dinner.',
        priceMinor: 4500000,
        currency: 'KES',
        capacity: 250,
        remaining: 43,
        minPerOrder: 1,
        maxPerOrder: 5,
        salesStart: '2026-07-01T00:00:00Z',
        salesEnd: '2026-10-22T08:00:00Z',
        status: 'active',
      },
      {
        id: 'tier-ke-virtual',
        eventId: 'evt-africa-tech-summit-2026',
        name: 'Virtual Global Pass',
        description: 'Live interactive streaming of all stages, digital slide deck downloads, and online chat.',
        priceMinor: 350000,
        currency: 'KES',
        capacity: 5000,
        remaining: 3820,
        minPerOrder: 1,
        maxPerOrder: 10,
        salesStart: '2026-07-01T00:00:00Z',
        salesEnd: '2026-10-24T12:00:00Z',
        status: 'active',
      },
    ],
    status: 'published',
    featured: true,
    ageRestriction: 'Professional conference. All attendees welcome.',
    refundPolicy: 'Refunds permitted up to 14 days prior to conference opening.',
    tags: ['Tech', 'Venture Capital', 'Cloud', 'Fintech', 'Nairobi'],
    currency: 'KES',
    minPriceMinor: 350000,
    agenda: [
      { time: '08:30', title: 'Registration & Barista Networking', speaker: 'Welcome Desk', stage: 'Plenary A' },
      { time: '09:30', title: 'Keynote: Africa’s Digital Sovereign Infrastructure', speaker: 'Amina Mohamed', stage: 'Plenary A' },
      { time: '11:15', title: 'Cross-Border Real-Time Settlement Panel', speaker: 'Fintech Leaders', stage: 'Hall 2' },
      { time: '14:00', title: 'Pitch Arena: Top 15 Seed Startups', speaker: 'Founders', stage: 'Pitch Stage' },
    ],
  },
  {
    id: 'evt-lagos-gastronomy-2026',
    slug: 'lagos-epicurean-wine-pairing-soiree-2026',
    title: 'Lagos Waterfront Gastronomy & Wine Soirée',
    category: 'Food & Wine',
    format: 'in_person',
    description: `An unforgettable evening celebrating contemporary West African Haute Cuisine paired with award-winning wines on the Victoria Island waterfront.`,
    shortSummary: '7-course Pan-African fine dining tasting experience over Victoria Island lagoon.',
    coverImage: culinaryWineImg,
    gallery: [culinaryWineImg],
    startDate: '2026-12-05T18:30:00Z',
    endDate: '2026-12-05T23:30:00Z',
    timezone: 'Africa/Lagos',
    venue: {
      name: 'The Lighthouse Lagoon Terrace',
      address: 'Plot 14B Ozumba Mbadiwe Ave, Victoria Island',
      city: 'Lagos',
      country: 'Nigeria',
      coordinates: { lat: 6.4281, lng: 3.4219 },
    },
    organizer: {
      id: 'org-lagos-epicure',
      name: 'Eko Epicurean Guild',
      verified: true,
      rating: 5.0,
      bio: 'Pioneers of upscale modern African culinary arts and private wine salons.',
    },
    tickets: [
      {
        id: 'tier-ng-single',
        eventId: 'evt-lagos-gastronomy-2026',
        name: 'Single Guest Experience',
        description: 'Full 7-course chef tasting menu, sommelier wine pairing, and welcome champagne.',
        priceMinor: 6500000,
        currency: 'NGN',
        capacity: 120,
        remaining: 28,
        minPerOrder: 1,
        maxPerOrder: 4,
        salesStart: '2026-09-01T00:00:00Z',
        salesEnd: '2026-12-05T14:00:00Z',
        status: 'active',
      },
    ],
    status: 'published',
    featured: true,
    ageRestriction: '21+ Only. Smart Elegant Dress Code.',
    refundPolicy: 'Non-refundable due to fresh chef preparation. Ticket transfers permitted.',
    tags: ['Fine Dining', 'Wine Tasting', 'Lagos', 'Culinary'],
    currency: 'NGN',
    minPriceMinor: 6500000,
  },
  {
    id: 'evt-joburg-art-biennale-2026',
    slug: 'rosebank-contemporary-african-art-vernissage-2026',
    title: 'Johannesburg Contemporary Art Vernissage',
    category: 'Arts & Culture',
    format: 'in_person',
    description: `Opening vernissage for the 2026 Pan-African Contemporary Art survey in Rosebank.`,
    shortSummary: 'Private gallery opening showcasing monumental contemporary African visual artists.',
    coverImage: artExhibitImg,
    gallery: [artExhibitImg],
    startDate: '2026-11-28T17:00:00Z',
    endDate: '2026-11-28T22:00:00Z',
    timezone: 'Africa/Johannesburg',
    venue: {
      name: 'The Keyes Art Mile Pavilion',
      address: '19 Keyes Avenue, Rosebank',
      city: 'Johannesburg',
      country: 'South Africa',
      postalCode: '2196',
      coordinates: { lat: -26.1482, lng: 28.0384 },
    },
    organizer: {
      id: 'org-joburg-arts',
      name: 'Rosebank Art Pavilion',
      verified: true,
      rating: 4.9,
    },
    tickets: [
      {
        id: 'tier-jb-standard',
        eventId: 'evt-joburg-art-biennale-2026',
        name: 'Opening Night Vernissage Pass',
        description: 'Exhibition entry, curator talk, MCC sparkling wine reception, and catalog.',
        priceMinor: 25000,
        currency: 'ZAR',
        capacity: 400,
        remaining: 112,
        minPerOrder: 1,
        maxPerOrder: 4,
        salesStart: '2026-09-01T00:00:00Z',
        salesEnd: '2026-11-28T16:00:00Z',
        status: 'active',
      },
    ],
    status: 'published',
    featured: true,
    refundPolicy: 'Full refund up to 48 hours prior to exhibition opening.',
    tags: ['Art Gallery', 'Johannesburg', 'Culture'],
    currency: 'ZAR',
    minPriceMinor: 25000,
  },
  {
    id: 'evt-kirstenbosch-amapiano-gala-2026',
    slug: 'kirstenbosch-sunset-amapiano-orchestra-2026',
    title: 'Kirstenbosch Sunset Amapiano Orchestral Gala',
    category: 'Concerts & Music',
    format: 'in_person',
    description: `A sold-out monumental collaboration between the Cape Town Philharmonic Orchestra and premier African electronic producers at the world-famous Kirstenbosch Botanical Gardens.\n\nPerforming reimagined symphonic arrangements of iconic Amapiano compositions at golden hour against the eastern slopes of Table Mountain. Every tier has reached strict venue fire capacity. Join the waitlist to be automatically alerted if production holds or refunded tickets are released.`,
    shortSummary: 'SOLD OUT: 60-piece symphony orchestra meets modern African electronic beats.',
    coverImage: festivalGuideImg,
    gallery: [festivalGuideImg, heroFestivalImg],
    startDate: '2026-11-21T16:00:00Z',
    endDate: '2026-11-21T21:30:00Z',
    timezone: 'Africa/Johannesburg',
    venue: {
      name: 'Kirstenbosch National Botanical Gardens Amphitheatre',
      address: 'Rhodes Drive, Newlands',
      city: 'Cape Town',
      country: 'South Africa',
      postalCode: '7735',
      coordinates: { lat: -33.9875, lng: 18.4326 },
    },
    organizer: {
      id: 'org-cape-vibes',
      name: 'Cape Town Vibes Live Ltd',
      verified: true,
      rating: 5.0,
      bio: 'Leading premier live music and festival curator in Southern Africa.',
    },
    tickets: [
      {
        id: 'tier-kb-lawn',
        eventId: 'evt-kirstenbosch-amapiano-gala-2026',
        name: 'Botanical Lawn General Admission',
        description: 'Open lawn picnic seating with full acoustic amphitheatre sightlines.',
        priceMinor: 48000, // R480.00
        currency: 'ZAR',
        capacity: 2200,
        remaining: 0,
        minPerOrder: 1,
        maxPerOrder: 4,
        salesStart: '2026-07-01T00:00:00Z',
        salesEnd: '2026-11-21T14:00:00Z',
        status: 'sold_out',
      },
      {
        id: 'tier-kb-golden',
        eventId: 'evt-kirstenbosch-amapiano-gala-2026',
        name: 'Golden Circle Terrace & Wine Reserve',
        description: 'Prime front terrace tier, estate wine tasting box, and dedicated gate hospitality lane.',
        priceMinor: 95000, // R950.00
        currency: 'ZAR',
        capacity: 400,
        remaining: 0,
        minPerOrder: 1,
        maxPerOrder: 2,
        salesStart: '2026-07-01T00:00:00Z',
        salesEnd: '2026-11-21T14:00:00Z',
        status: 'sold_out',
      },
    ],
    status: 'published',
    featured: true,
    ageRestriction: 'All ages welcome. Children under 6 free on lap.',
    refundPolicy: 'Non-refundable within 14 days of performance.',
    tags: ['Amapiano', 'Symphony', 'Sold Out', 'Cape Town', 'Outdoor'],
    currency: 'ZAR',
    minPriceMinor: 48000,
    capacityCap: 2600,
  },
];

const INITIAL_WAITLIST_ENTRIES: WaitlistEntry[] = [
  {
    id: 'wait-1',
    eventId: 'evt-kirstenbosch-amapiano-gala-2026',
    eventTitle: 'Kirstenbosch Sunset Amapiano Orchestral Gala',
    email: 'siphesihle.khumalo@gmail.com',
    name: 'Siphesihle Khumalo',
    tierId: 'tier-kb-golden',
    tierName: 'Golden Circle Terrace & Wine Reserve',
    joinedAt: '2026-10-18T10:14:00Z',
    status: 'waiting',
    position: 1,
    phone: '+27 82 555 1928'
  },
  {
    id: 'wait-2',
    eventId: 'evt-kirstenbosch-amapiano-gala-2026',
    eventTitle: 'Kirstenbosch Sunset Amapiano Orchestral Gala',
    email: 'tariq.ben@outlook.com',
    name: 'Tariq Ben-Youssef',
    tierId: 'tier-kb-lawn',
    tierName: 'Botanical Lawn General Admission',
    joinedAt: '2026-10-18T11:30:00Z',
    status: 'waiting',
    position: 2,
    phone: '+27 83 400 9912'
  },
  {
    id: 'wait-3',
    eventId: 'evt-kirstenbosch-amapiano-gala-2026',
    eventTitle: 'Kirstenbosch Sunset Amapiano Orchestral Gala',
    email: 'amara.okafor@lagostech.ng',
    name: 'Amara Okafor',
    tierId: 'tier-kb-lawn',
    tierName: 'Botanical Lawn General Admission',
    joinedAt: '2026-10-18T13:45:00Z',
    status: 'waiting',
    position: 3,
    phone: '+234 803 111 2233'
  },
  {
    id: 'wait-4',
    eventId: 'evt-lagos-gastronomy-2026',
    eventTitle: 'Lagos Waterfront Gastronomy & Wine Soirée',
    email: 'kofi.mensah@accraventures.gh',
    name: 'Kofi Mensah',
    tierId: 'tier-ng-single',
    tierName: 'Single Guest Experience',
    joinedAt: '2026-10-19T02:15:00Z',
    status: 'waiting',
    position: 1,
    phone: '+233 24 555 8899'
  }
];

const INITIAL_WRISTBANDS: CashlessWristband[] = [
  {
    id: 'wb-1',
    uid: 'NFC-4A:9B:C2:11',
    attendeeEmail: 'nomvula.dlamini@example.com',
    attendeeName: 'Nomvula Dlamini',
    eventId: 'evt-cape-town-vibes-2026',
    eventTitle: 'Cape Town Vibes Festival 2026',
    balanceMinor: 75000,
    currency: 'ZAR',
    status: 'active',
    pinRequired: false,
    lastTappedAt: '2026-10-19T05:20:00Z',
    transactions: [
      {
        id: 'wtx-1',
        type: 'topup',
        amountMinor: 100000,
        vendorName: 'M-Pesa / Card Gateway',
        timestamp: '2026-10-19T04:10:00Z',
        balanceAfterMinor: 100000
      },
      {
        id: 'wtx-2',
        type: 'purchase',
        amountMinor: 25000,
        vendorName: 'Garden Stage Craft Bar',
        timestamp: '2026-10-19T05:20:00Z',
        balanceAfterMinor: 75000
      }
    ]
  },
  {
    id: 'wb-2',
    uid: 'NFC-8D:1C:5E:77',
    attendeeEmail: 'kofi.mensah@accraventures.gh',
    attendeeName: 'Kofi Mensah',
    eventId: 'evt-africa-tech-summit-2026',
    eventTitle: 'Africa Tech Innovation Summit 2026',
    balanceMinor: 120000,
    currency: 'KES',
    status: 'active',
    pinRequired: true,
    lastTappedAt: '2026-10-19T04:45:00Z',
    transactions: [
      {
        id: 'wtx-3',
        type: 'topup',
        amountMinor: 150000,
        vendorName: 'M-Pesa Express (Daraja)',
        timestamp: '2026-10-19T03:30:00Z',
        balanceAfterMinor: 150000
      },
      {
        id: 'wtx-4',
        type: 'purchase',
        amountMinor: 30000,
        vendorName: 'Vanguard VIP Barista Lounge',
        timestamp: '2026-10-19T04:45:00Z',
        balanceAfterMinor: 120000
      }
    ]
  }
];

const INITIAL_COMMUNITY_HIGHLIGHTS: CommunityHighlight[] = [
  {
    id: 'pulse-1',
    eventId: 'evt-cape-town-vibes-2026',
    eventTitle: 'Cape Town Vibes Festival 2026',
    authorName: 'Nomvula Dlamini',
    authorHandle: '@nomvula_vibes',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    roleBadge: 'VIP Deck Passholder',
    platform: 'instagram',
    imageUrl: heroFestivalImg,
    aspectRatio: 'portrait',
    quote: 'Unbelievable energy under Table Mountain! Entering with the offline Ed25519 QR pass took literally 2 seconds at Gate 2. Amapiano live symphony is something else. ✨🇿🇦',
    rating: 5,
    likesCount: 184,
    userLiked: true,
    timestamp: '2 hours ago',
    city: 'Cape Town'
  },
  {
    id: 'pulse-2',
    eventId: 'evt-africa-tech-summit-2026',
    eventTitle: 'Africa Tech Innovation Summit 2026',
    authorName: 'Kofi Mensah',
    authorHandle: '@kofi_fintech',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    roleBadge: 'Keynote Delegate',
    platform: 'x',
    imageUrl: techSummitImg,
    aspectRatio: 'square',
    quote: 'The energy in Nairobi this week is unmatched. Closed two venture syndicate talks before lunch. Seamless badge check-in with NFC tap on my phone.',
    rating: 5,
    likesCount: 98,
    userLiked: false,
    timestamp: '5 hours ago',
    city: 'Nairobi'
  },
  {
    id: 'pulse-3',
    eventId: 'evt-lagos-gastronomy-2026',
    eventTitle: 'Lagos Waterfront Gastronomy & Wine Soirée',
    authorName: 'Amina Bello',
    authorHandle: '@amina_eats',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    roleBadge: "Chef's Table Guest",
    platform: 'instagram',
    imageUrl: culinaryWineImg,
    aspectRatio: 'tall',
    quote: '7-course tasting on the Victoria Island lagoon. The suya-crusted wagyu paired with Stellenbosch Pinotage was pure poetry. Flawless ticketing experience!',
    rating: 5,
    likesCount: 245,
    userLiked: false,
    timestamp: 'Yesterday',
    city: 'Lagos'
  },
  {
    id: 'pulse-4',
    eventId: 'evt-joburg-art-biennale-2026',
    eventTitle: 'Johannesburg Contemporary Art Vernissage',
    authorName: 'Lerato Khumalo',
    authorHandle: '@lerato_contemporary',
    authorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    roleBadge: 'Art Collector Pass',
    platform: 'instagram',
    imageUrl: artExhibitImg,
    aspectRatio: 'square',
    quote: 'Keyes Art Mile alive with Pan-African visionaries. Curators gave an intimate walkthrough before doors opened. Super proud of Southern African talent!',
    rating: 5,
    likesCount: 76,
    userLiked: false,
    timestamp: '1 day ago',
    city: 'Johannesburg'
  },
  {
    id: 'pulse-5',
    eventId: 'evt-kirstenbosch-amapiano-gala-2026',
    eventTitle: 'Kirstenbosch Sunset Amapiano Gala',
    authorName: 'Tariq Ben-Youssef',
    authorHandle: '@tariq_tunes',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    roleBadge: 'Waitlist Wave 1 Claimed',
    platform: 'tiktok',
    imageUrl: festivalGuideImg,
    aspectRatio: 'tall',
    quote: 'I was #12 on the Nexora waitlist when extra tickets dropped at 10am. Got instant alert and secured two front-row passes. Best night of 2026!',
    rating: 5,
    likesCount: 312,
    userLiked: true,
    timestamp: '2 days ago',
    city: 'Cape Town'
  },
  {
    id: 'pulse-6',
    eventId: 'evt-cape-town-vibes-2026',
    eventTitle: 'Cape Town Vibes Festival 2026',
    authorName: 'Zanele Sithole',
    authorHandle: '@zanele_sound',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    roleBadge: 'Verified Passholder',
    platform: 'instagram',
    imageUrl: rockingDaisiesImg,
    aspectRatio: 'portrait',
    quote: 'The sound engineering on the Garden Stage was immaculate. Cashless wristband integration worked without a hitch all night long.',
    rating: 5,
    likesCount: 184,
    userLiked: false,
    timestamp: '3 days ago',
    city: 'Cape Town'
  },
  {
    id: 'pulse-7',
    eventId: 'evt-africa-tech-summit-2026',
    eventTitle: 'Africa Tech Innovation Summit 2026',
    authorName: 'David Mwangi',
    authorHandle: '@david_founder',
    authorAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    roleBadge: 'Founder Pass',
    platform: 'x',
    imageUrl: unsplashAudienceImg,
    aspectRatio: 'square',
    quote: 'Met 40+ founders across East & West Africa. The hybrid livestream also let our London engineering team participate in real-time.',
    rating: 5,
    likesCount: 129,
    userLiked: false,
    timestamp: '3 days ago',
    city: 'Nairobi'
  },
  {
    id: 'pulse-8',
    eventId: 'evt-lagos-gastronomy-2026',
    eventTitle: 'Lagos Waterfront Gastronomy & Wine Soirée',
    authorName: 'Chinedu Okafor',
    authorHandle: '@chinedu_lifestyle',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    roleBadge: 'VIP Patron',
    platform: 'instagram',
    imageUrl: capeTownEtcImg,
    aspectRatio: 'portrait',
    quote: 'Lagos nightlife perfected. The waterfront terrace views + live saxophone accompaniment created an atmosphere like no other.',
    rating: 5,
    likesCount: 167,
    userLiked: false,
    timestamp: '4 days ago',
    city: 'Lagos'
  }
];

const INITIAL_PROMO_CODES: PromoCode[] = [
  { id: 'promo-1', code: 'NEXORA10', discountPercentage: 10, maxUses: 500, timesUsed: 42, active: true },
  { id: 'promo-2', code: 'AFRICAVIP', discountPercentage: 20, maxUses: 100, timesUsed: 19, active: true },
  { id: 'promo-3', code: 'WELCOME', discountPercentage: 15, maxUses: 1000, timesUsed: 135, active: true },
];

const INITIAL_VENUE_RFPS: VenueRFP[] = [
  {
    id: 'rfp-1',
    venueName: 'Green Point Amphitheatre & Track',
    city: 'Cape Town',
    country: 'South Africa',
    contactPerson: 'City of Cape Town Events Bureau',
    targetDate: '2026-11-14',
    expectedAttendees: 2000,
    budgetFormatted: 'R 85,000 / day',
    requirements: ['Main outdoor stage power 120kVA', 'Dedicated gate scanner turnstiles', 'VIP artist hospitality area'],
    status: 'accepted',
    submittedAt: '2026-02-10T10:00:00Z',
  },
  {
    id: 'rfp-2',
    venueName: 'Radisson Blu & Arboretum Convention Center',
    city: 'Nairobi',
    country: 'Kenya',
    contactPerson: 'Conferencing & Banqueting Manager',
    targetDate: '2026-10-22',
    expectedAttendees: 1500,
    budgetFormatted: 'KSh 1,200,000 package',
    requirements: ['Dual breakout rooms', 'High-speed gigabit stream line', 'Catering for 1,200 delegates'],
    status: 'under_review',
    submittedAt: '2026-03-01T14:30:00Z',
  },
  {
    id: 'rfp-3',
    venueName: 'Kigali Convention Centre',
    city: 'Kigali',
    country: 'Rwanda',
    contactPerson: 'Rwanda Convention Bureau',
    targetDate: '2027-01-20',
    expectedAttendees: 800,
    budgetFormatted: 'USD 12,000',
    requirements: ['Dome auditorium', 'Simultaneous interpretation booths'],
    status: 'submitted',
    submittedAt: '2026-03-25T09:15:00Z',
  },
];

const INITIAL_MARKETING_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: 'camp-1',
    title: 'Cape Town Vibes 2026 Phase 1 Drop',
    type: 'email',
    audience: 'Previous Festival Attendees (Cape Town & Joburg)',
    sentCount: 4200,
    openRate: 46.8,
    conversionRate: 8.2,
    revenueGeneratedMinor: 38500000,
    currency: 'ZAR',
    status: 'active',
    scheduledDate: '2026-08-01',
  },
  {
    id: 'camp-2',
    title: 'East Africa Founders & Angel Network VIP Blast',
    type: 'promoter',
    audience: 'Nairobi Tech Ecosystem & VC Syndicate',
    sentCount: 1850,
    openRate: 58.2,
    conversionRate: 14.5,
    revenueGeneratedMinor: 65000000,
    currency: 'KES',
    status: 'active',
    scheduledDate: '2026-08-15',
  },
  {
    id: 'camp-3',
    title: 'Amapiano Sunset Sessions Early Bird Promo',
    type: 'social',
    audience: 'Instagram & TikTok Pan-African Diaspora',
    sentCount: 12000,
    openRate: 31.4,
    conversionRate: 4.1,
    revenueGeneratedMinor: 14200000,
    currency: 'ZAR',
    status: 'completed',
    scheduledDate: '2026-07-10',
  },
];

const INITIAL_PRIORITY_TASKS: PriorityTask[] = [
  {
    id: 'task-1',
    title: '1 Pending Attendee Refund Request Requires Review',
    category: 'refund',
    urgency: 'high',
    actionLabel: 'Review Request',
    resolved: false,
  },
  {
    id: 'task-2',
    title: 'VIP Terrace Deck Capacity Reached 92% (68 seats remaining)',
    category: 'capacity',
    urgency: 'high',
    actionLabel: 'Adjust Tier Limit',
    resolved: false,
  },
  {
    id: 'task-3',
    title: 'Submit KRA Tax Compliance Certificate for Nairobi Payouts',
    category: 'kyc',
    urgency: 'medium',
    actionLabel: 'Upload Document',
    resolved: false,
  },
  {
    id: 'task-4',
    title: 'Assign Stage & Moderator for FinTech Infrastructure Keynote',
    category: 'agenda',
    urgency: 'low',
    actionLabel: 'Schedule Session',
    resolved: false,
  },
];

const INITIAL_ACTIVITY_FEED: ActivityFeedItem[] = [
  {
    id: 'act-1',
    type: 'purchase',
    title: 'VIP Terrace Pass Booked',
    description: 'Dr. Adaora Okafor purchased 2x VIP Terrace Passes (R 1,700.00)',
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    actor: 'Dr. Adaora Okafor',
  },
  {
    id: 'act-2',
    type: 'checkin',
    title: 'Admitted Pass at Gate 1',
    description: 'Kwame Mensah scanned #NX-TKT-94821 for Nomvula Dlamini',
    timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    actor: 'Kwame Mensah',
  },
  {
    id: 'act-3',
    type: 'campaign',
    title: 'Marketing Email Delivered',
    description: 'Campaign "Phase 1 Drop" sent to 4,200 contacts with 46.8% open rate',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    actor: 'Automated Campaign Engine',
  },
  {
    id: 'act-4',
    type: 'rfp',
    title: 'Venue Proposal Accepted',
    description: 'Green Point Amphitheatre accepted terms for Cape Town Vibes 2026',
    timestamp: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
    actor: 'City of Cape Town',
  },
];

const INITIAL_LAUNCH_GATES: CountryLaunchGate[] = [
  {
    countryCode: 'ZA',
    countryName: 'South Africa (Wave 1 — Operational Anchor)',
    flag: 'ZA',
    wave: 1,
    legalEntityApproved: true,
    paymentProviderLive: true,
    settlementCurrencyConfirmed: true,
    compliantFundsFlowModel: true,
    refundProceduresDocumented: true,
    taxInvoicingReviewed: true,
    privacyPOPIAReady: true,
    supportEscalationTested: true,
    e2eTestPassed: true,
    paidSalesAuthorized: true,
  },
  {
    countryCode: 'KE',
    countryName: 'Kenya (Wave 2 — East Africa Hub)',
    flag: 'KE',
    wave: 2,
    legalEntityApproved: true,
    paymentProviderLive: true,
    settlementCurrencyConfirmed: true,
    compliantFundsFlowModel: true,
    refundProceduresDocumented: true,
    taxInvoicingReviewed: true,
    privacyPOPIAReady: true,
    supportEscalationTested: true,
    e2eTestPassed: true,
    paidSalesAuthorized: true,
  },
  {
    countryCode: 'NG',
    countryName: 'Nigeria (Wave 3 — West Africa Expansion)',
    flag: 'NG',
    wave: 3,
    legalEntityApproved: true,
    paymentProviderLive: true,
    settlementCurrencyConfirmed: true,
    compliantFundsFlowModel: true,
    refundProceduresDocumented: true,
    taxInvoicingReviewed: true,
    privacyPOPIAReady: true,
    supportEscalationTested: true,
    e2eTestPassed: true,
    paidSalesAuthorized: true,
  },
  {
    countryCode: 'GH',
    countryName: 'Ghana (Wave 4 — Gold Coast Expansion)',
    flag: 'GH',
    wave: 4,
    legalEntityApproved: true,
    paymentProviderLive: true,
    settlementCurrencyConfirmed: true,
    compliantFundsFlowModel: false,
    refundProceduresDocumented: true,
    taxInvoicingReviewed: false,
    privacyPOPIAReady: true,
    supportEscalationTested: false,
    e2eTestPassed: false,
    paidSalesAuthorized: false,
  },
  {
    countryCode: 'RW',
    countryName: 'Rwanda (Wave 4 — Kigali Innovation Hub)',
    flag: 'RW',
    wave: 4,
    legalEntityApproved: true,
    paymentProviderLive: false,
    settlementCurrencyConfirmed: true,
    compliantFundsFlowModel: false,
    refundProceduresDocumented: false,
    taxInvoicingReviewed: false,
    privacyPOPIAReady: true,
    supportEscalationTested: false,
    e2eTestPassed: false,
    paidSalesAuthorized: false,
  },
];

const INITIAL_THIRD_PARTY_INTEGRATIONS: ThirdPartyIntegration[] = [
  {
    id: 'paystack',
    name: 'Paystack Payment Rails',
    category: 'payment',
    categoryLabel: 'Payment Gateway',
    iconName: 'credit-card',
    description: 'Accept credit/debit cards, bank transfers, Apple Pay & USSD in Nigeria, Ghana, Kenya, and South Africa with instant settlement.',
    status: 'connected',
    badge: 'Pan-African Verified',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    docsUrl: 'https://paystack.com/docs',
    config: {
      mode: 'live',
      apiKey: 'pk_live_89481948201840294821',
      apiSecret: 'sk_live_94820184029482018402',
      webhookUrl: 'https://api.nexora.events/v1/integrations/paystack/webhook',
      accountId: 'ACT_9948201',
      autoSync: true,
      features: {
        instantSettlement: true,
        applePay: true,
        ussdSupport: true,
      },
    },
    metrics: {
      syncedRecords: 4892,
      uptime: '99.99%',
      lastPingStatus: 'healthy',
      latencyMs: 38,
    },
  },
  {
    id: 'mpesa',
    name: 'Safaricom M-Pesa Express',
    category: 'payment',
    categoryLabel: 'Mobile Money',
    iconName: 'smartphone',
    description: 'Direct STK push prompt for mobile money checkout across Kenya and Tanzania with instant phone-number authorization.',
    status: 'connected',
    badge: 'Direct Carrier Billing',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    docsUrl: 'https://developer.safaricom.co.ke',
    config: {
      mode: 'live',
      apiKey: 'MPESA_SHORTCODE_600982',
      apiSecret: 'passkey_prod_94820184021',
      senderIdOrChannel: '600982',
      autoSync: true,
      features: {
        stkPushPrompt: true,
        instantB2CReversal: true,
      },
    },
    metrics: {
      syncedRecords: 2740,
      uptime: '99.95%',
      lastPingStatus: 'healthy',
      latencyMs: 52,
    },
  },
  {
    id: 'ozow',
    name: 'Ozow Instant EFT',
    category: 'payment',
    categoryLabel: 'Open Banking',
    iconName: 'zap',
    description: 'Zero-chargeback real-time bank clearance across Capitec, FNB, Standard Bank, Absa, and Nedbank in South Africa.',
    status: 'connected',
    badge: 'Instant Bank Clearance',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    docsUrl: 'https://ozow.com',
    config: {
      mode: 'live',
      apiKey: 'OZOW_SITE_CPT_9948',
      apiSecret: 'private_key_ozow_994820',
      autoSync: true,
      features: {
        zeroChargeback: true,
        automatedRecon: true,
      },
    },
    metrics: {
      syncedRecords: 3820,
      uptime: '100%',
      lastPingStatus: 'healthy',
      latencyMs: 44,
    },
  },
  {
    id: 'stripe',
    name: 'Stripe Global Card Payments',
    category: 'payment',
    categoryLabel: 'Payment Gateway',
    iconName: 'credit-card',
    description: 'International card checkout supporting Visa, Mastercard, AMEX in USD, EUR, and GBP for global diaspora festival attendees.',
    status: 'connected',
    badge: 'Global Diaspora',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    docsUrl: 'https://stripe.com/docs',
    config: {
      mode: 'live',
      apiKey: 'pk_live_51Ozow948291048201',
      apiSecret: 'sk_live_51Ozow948291048201sec',
      autoSync: true,
      features: {
        card3DSecure: true,
        radarFraudPrevention: true,
      },
    },
    metrics: {
      syncedRecords: 1980,
      uptime: '99.99%',
      lastPingStatus: 'healthy',
      latencyMs: 65,
    },
  },
  {
    id: 'flutterwave',
    name: 'Flutterwave Enterprise',
    category: 'payment',
    categoryLabel: 'Payment Gateway',
    iconName: 'globe',
    description: 'Pan-African collection network connecting cards, Barter, mobile money wallets, and local bank transfers across 34 countries.',
    status: 'disconnected',
    badge: 'Pan-African Multi-Territory',
    docsUrl: 'https://developer.flutterwave.com',
    config: {
      mode: 'sandbox',
      apiKey: 'FLWPUBK_TEST-e0294819-X',
      autoSync: false,
    },
  },
  {
    id: 'paypal',
    name: 'PayPal Commerce Platform',
    category: 'payment',
    categoryLabel: 'Digital Wallet',
    iconName: 'credit-card',
    description: 'Global digital wallet checkout supporting PayPal balances and Pay in 4 installment options for international ticket purchasers.',
    status: 'disconnected',
    badge: 'Global Wallet',
    docsUrl: 'https://developer.paypal.com',
    config: {
      mode: 'sandbox',
      apiKey: 'client_id_paypal_9482',
      autoSync: false,
    },
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp Audience Sync',
    category: 'marketing',
    categoryLabel: 'Email & CRM',
    iconName: 'mail',
    description: 'Automatically segment ticket buyers into Mailchimp lists, tag attendees by VIP tier, and trigger post-event drip sequences.',
    status: 'connected',
    badge: 'Auto-Sync Active',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    docsUrl: 'https://mailchimp.com/developer',
    config: {
      mode: 'live',
      apiKey: 'mc_live_849201948201-us14',
      accountId: 'list_cptvibes_vip_2026',
      autoSync: true,
      features: {
        autoSyncBuyers: true,
        tierTagging: true,
        welcomeDrip: true,
      },
    },
    metrics: {
      syncedRecords: 5120,
      uptime: '100%',
      lastPingStatus: 'healthy',
      latencyMs: 82,
    },
  },
  {
    id: 'klaviyo',
    name: 'Klaviyo Event Marketing',
    category: 'marketing',
    categoryLabel: 'Retention CRM',
    iconName: 'send',
    description: 'Predictive customer analytics, SMS flash drops, dynamic buyer segmentation, and automated personalized ticket promo flows.',
    status: 'disconnected',
    docsUrl: 'https://developers.klaviyo.com',
    config: {
      mode: 'sandbox',
      autoSync: false,
    },
  },
  {
    id: 'hubspot',
    name: 'HubSpot Enterprise CRM',
    category: 'marketing',
    categoryLabel: 'B2B CRM',
    iconName: 'users',
    description: 'Enterprise pipeline management for high-net-worth VIPs, corporate brand sponsors, festival vendors, and media delegates.',
    status: 'disconnected',
    docsUrl: 'https://developers.hubspot.com',
    config: {
      mode: 'sandbox',
      autoSync: false,
    },
  },
  {
    id: 'meta-pixel',
    name: 'Meta Conversions API & Pixel',
    category: 'marketing',
    categoryLabel: 'Ad Attribution',
    iconName: 'share-2',
    description: 'Server-side tracking for Instagram and Facebook ticket campaigns to bypass ad-blockers and maximize ticket ROAS.',
    status: 'connected',
    badge: 'Server-Side CAPI',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    docsUrl: 'https://developers.facebook.com/docs/marketing-api/conversions-api',
    config: {
      mode: 'live',
      apiKey: 'EAAX98420184029482',
      accountId: 'pixel_9482019482',
      autoSync: true,
      features: {
        serverSideEvents: true,
        advancedMatching: true,
      },
    },
    metrics: {
      syncedRecords: 8930,
      uptime: '99.98%',
      lastPingStatus: 'healthy',
      latencyMs: 29,
    },
  },
  {
    id: 'ga4',
    name: 'Google Analytics 4 & Tag Manager',
    category: 'marketing',
    categoryLabel: 'Web Analytics',
    iconName: 'activity',
    description: 'Real-time e-commerce revenue attribution, checkout funnel drop-off analysis, and marketing UTM campaign tracking.',
    status: 'connected',
    badge: 'Enhanced E-commerce',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    docsUrl: 'https://analytics.google.com',
    config: {
      mode: 'live',
      accountId: 'G-NX77948201',
      autoSync: true,
      features: {
        enhancedEcommerce: true,
        crossDomainTracking: true,
      },
    },
    metrics: {
      syncedRecords: 14200,
      uptime: '100%',
      lastPingStatus: 'healthy',
      latencyMs: 19,
    },
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business Cloud API',
    category: 'messaging',
    categoryLabel: 'Messaging & Passes',
    iconName: 'message-circle',
    description: 'Instant WhatsApp delivery of PDF tickets with scannable QR passes, automated gate reminder messages, and attendee support.',
    status: 'connected',
    badge: 'Instant QR Drops',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    docsUrl: 'https://developers.facebook.com/docs/whatsapp',
    config: {
      mode: 'live',
      apiKey: 'WABA_TOKEN_8948201948',
      senderIdOrChannel: '+27 21 555 0192',
      autoSync: true,
      features: {
        ticketPdfDispatch: true,
        gateReminderNotification: true,
        aiSupportConcierge: true,
      },
    },
    metrics: {
      syncedRecords: 3840,
      uptime: '99.99%',
      lastPingStatus: 'healthy',
      latencyMs: 41,
    },
  },
  {
    id: 'twilio',
    name: 'Twilio Programmable SMS',
    category: 'messaging',
    categoryLabel: 'SMS Gateway',
    iconName: 'smartphone',
    description: 'Global SMS fallback dispatch for urgent gate notices, lost ticket recovery, flash parking alerts, and staff security broadcasts.',
    status: 'connected',
    badge: 'SMS Fallback',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    docsUrl: 'https://twilio.com/docs',
    config: {
      mode: 'live',
      apiKey: 'AC94820184029482019482',
      apiSecret: 'tw_sec_9482018402948201',
      senderIdOrChannel: 'NEXORA-PASS',
      autoSync: true,
      features: {
        smsBroadcast: true,
        instantOtp: true,
      },
    },
    metrics: {
      syncedRecords: 1240,
      uptime: '100%',
      lastPingStatus: 'healthy',
      latencyMs: 78,
    },
  },
  {
    id: 'slack',
    name: 'Slack Gate & VIP Alerts',
    category: 'messaging',
    categoryLabel: 'Team Operations',
    iconName: 'hash',
    description: 'Real-time team notification into #event-operations when high-profile VIPs check in at the gate or hourly ticket milestones are hit.',
    status: 'connected',
    badge: 'Ops Channel Sync',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    docsUrl: 'https://api.slack.com',
    config: {
      mode: 'live',
      webhookUrl: 'https://hooks.slack.com/services/T9948/B0021/948201948',
      senderIdOrChannel: '#cpt-vibes-ops',
      autoSync: true,
      features: {
        vipArrivalPings: true,
        hourlyMilestones: true,
        gateCapacityAlerts: true,
      },
    },
    metrics: {
      syncedRecords: 840,
      uptime: '100%',
      lastPingStatus: 'healthy',
      latencyMs: 34,
    },
  },
  {
    id: 'discord',
    name: 'Discord Community Bot',
    category: 'messaging',
    categoryLabel: 'Community Pass',
    iconName: 'bot',
    description: 'Token-gated role provisioning for music festival and conference communities on Discord upon verified ticket order.',
    status: 'disconnected',
    docsUrl: 'https://discord.com/developers',
    config: {
      mode: 'sandbox',
      autoSync: false,
    },
  },
  {
    id: 'zoom',
    name: 'Zoom Webinars & Live Stage',
    category: 'streaming',
    categoryLabel: 'Virtual Stage',
    iconName: 'video',
    description: 'Automatically creates webinar attendee credentials, unique personalized join links, and syncs hybrid conference tracks.',
    status: 'connected',
    badge: 'Virtual Stage Active',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    docsUrl: 'https://marketplace.zoom.us/docs',
    config: {
      mode: 'live',
      apiKey: 'zoom_client_id_948201',
      apiSecret: 'zoom_secret_9948201948',
      autoSync: true,
      features: {
        uniqueJoinLinks: true,
        cloudRecordingSync: true,
      },
    },
    metrics: {
      syncedRecords: 1420,
      uptime: '99.9%',
      lastPingStatus: 'healthy',
      latencyMs: 95,
    },
  },
  {
    id: 'youtube-live',
    name: 'YouTube Live & Vimeo OTT',
    category: 'streaming',
    categoryLabel: 'Broadcast Video',
    iconName: 'tv',
    description: 'Secure, unlisted high-definition live stream embedding directly into attendee portal with digital ticket gatekeeper verification.',
    status: 'disconnected',
    docsUrl: 'https://developers.google.com/youtube',
    config: {
      mode: 'sandbox',
      autoSync: false,
    },
  },
  {
    id: 'zapier',
    name: 'Zapier Automation Hub',
    category: 'accounting',
    categoryLabel: 'No-Code Automation',
    iconName: 'zap',
    description: 'Connect Nexora to 5,000+ business applications; trigger Google Sheets, Notion databases, Airtable, and Asana on ticket purchase.',
    status: 'connected',
    badge: '5,000+ App Bridge',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    docsUrl: 'https://zapier.com/apps/nexora',
    config: {
      mode: 'live',
      webhookUrl: 'https://hooks.zapier.com/hooks/catch/948201/994820/',
      autoSync: true,
      features: {
        triggerOnOrder: true,
        triggerOnCheckIn: true,
        triggerOnRefund: true,
      },
    },
    metrics: {
      syncedRecords: 6420,
      uptime: '100%',
      lastPingStatus: 'healthy',
      latencyMs: 58,
    },
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks Online',
    category: 'accounting',
    categoryLabel: 'Enterprise ERP',
    iconName: 'file-spreadsheet',
    description: 'Automatic synchronization of ticket sales receipts, platform commission expenses, payout reconciliations, and VAT reports.',
    status: 'disconnected',
    docsUrl: 'https://developer.intuit.com',
    config: {
      mode: 'sandbox',
      autoSync: false,
    },
  },
  {
    id: 'xero',
    name: 'Xero Cloud Accounting',
    category: 'accounting',
    categoryLabel: 'Cloud Accounting',
    iconName: 'file-text',
    description: 'Automated bank feed reconciliation for multi-currency organizer payouts and tax invoice generation for ticket purchasers.',
    status: 'connected',
    badge: 'Bank Feed Synced',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    docsUrl: 'https://developer.xero.com',
    config: {
      mode: 'live',
      apiKey: 'xero_client_prod_9948',
      accountId: 'ACC_REVENUE_EVENT_2026',
      autoSync: true,
      features: {
        autoInvoiceCreation: true,
        reconcilePayouts: true,
      },
    },
    metrics: {
      syncedRecords: 1890,
      uptime: '100%',
      lastPingStatus: 'healthy',
      latencyMs: 72,
    },
  },
];

const INITIAL_CUSTOM_WEBHOOKS: CustomWebhookEndpoint[] = [
  {
    id: 'wh-prod-main',
    name: 'Cape Vibes Production API Webhook',
    url: 'https://api.capetownvibes.co.za/v1/nexora-events',
    secret: 'whsec_9a8f27b140cd582e71d34e9081a293',
    events: ['ticket.purchased', 'attendee.checked_in', 'refund.processed', 'event.published'],
    active: true,
    createdAt: '2026-02-10T10:00:00Z',
    lastTriggeredAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    lastResponseCode: 200,
    lastLatencyMs: 42,
  },
  {
    id: 'wh-backup-crm',
    name: 'Analytics Data Warehouse Ingestion',
    url: 'https://ingest.datawarehouse.internal/webhooks/tickets',
    secret: 'whsec_884029194029184920194820194829',
    events: ['ticket.purchased', 'order.completed'],
    active: true,
    createdAt: '2026-03-01T14:20:00Z',
    lastTriggeredAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    lastResponseCode: 200,
    lastLatencyMs: 65,
  },
];

const INITIAL_WEBHOOK_DELIVERY_LOGS: WebhookDeliveryLog[] = [
  {
    id: 'log-1',
    endpointId: 'wh-prod-main',
    endpointName: 'Cape Vibes Production API Webhook',
    event: 'ticket.purchased',
    timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    statusCode: 200,
    latencyMs: 42,
    payloadSnippet: '{"event":"ticket.purchased","orderId":"ORD-9482","ticketCode":"NX-TKT-94821","tier":"VIP Terrace"}',
    success: true,
  },
  {
    id: 'log-2',
    endpointId: 'wh-prod-main',
    endpointName: 'Cape Vibes Production API Webhook',
    event: 'attendee.checked_in',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    statusCode: 200,
    latencyMs: 38,
    payloadSnippet: '{"event":"attendee.checked_in","ticketId":"tkt-1","gate":"Main Gate A","scannerStaff":"Sipho Zulu"}',
    success: true,
  },
  {
    id: 'log-3',
    endpointId: 'wh-backup-crm',
    endpointName: 'Analytics Data Warehouse Ingestion',
    event: 'order.completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    statusCode: 200,
    latencyMs: 65,
    payloadSnippet: '{"event":"order.completed","amountMinor":190000,"currency":"ZAR","paymentMethod":"ozow"}',
    success: true,
  },
  {
    id: 'log-4',
    endpointId: 'wh-prod-main',
    endpointName: 'Cape Vibes Production API Webhook',
    event: 'event.published',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    statusCode: 200,
    latencyMs: 51,
    payloadSnippet: '{"event":"event.published","eventId":"evt-1","title":"Rocking the Daisies 2026","status":"published"}',
    success: true,
  },
];

const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  { id: 'tm-1', organizationId: 'org-cape-vibes', name: 'Thabo Mokoena', email: 'thabo@capetownvibes.co.za', role: 'Organization Owner', invitedAt: '2026-01-15T09:00:00Z', status: 'active' },
  { id: 'tm-2', organizationId: 'org-cape-vibes', name: 'Sipho Zulu', email: 'sipho.gate@capetownvibes.co.za', role: 'Check-In Staff', invitedAt: '2026-03-10T14:30:00Z', status: 'active' },
  { id: 'tm-3', organizationId: 'org-cape-vibes', name: 'Lerato Pillay', email: 'lerato@capetownvibes.co.za', role: 'Finance Manager', invitedAt: '2026-02-01T11:00:00Z', status: 'active' },
];

export const INITIAL_PLATFORM_USERS: AuthUser[] = [
  {
    id: 'usr-nomvula-dlamini',
    name: 'Nomvula Dlamini',
    email: 'nomvula.dlamini@example.com',
    role: 'attendee',
    status: 'active',
    phone: '+27 82 491 0293',
    country: 'ZA',
    city: 'Cape Town',
    provider: 'google',
    registeredAt: '2026-02-10T14:20:00Z',
    lastLoginAt: '2026-10-14T08:15:00Z',
    twoFactorEnabled: true,
    riskScore: 8,
    notes: 'Verified VIP festival patron. High lifetime value buyer with verified mobile and Google OAuth credentials.',
  },
  {
    id: 'usr-thabo-mokoena',
    name: 'Thabo Mokoena',
    email: 'thabo@capetownvibes.co.za',
    role: 'organizer',
    status: 'active',
    organizationId: 'org-cape-vibes',
    phone: '+27 21 555 0192',
    country: 'ZA',
    city: 'Cape Town',
    provider: 'password',
    registeredAt: '2026-01-15T09:00:00Z',
    lastLoginAt: '2026-10-14T11:45:00Z',
    twoFactorEnabled: true,
    riskScore: 12,
    notes: 'Authorized executive for Cape Town Entertainment Group (Pty) Ltd. KYB certified with verified FNB business cheque account.',
  },
  {
    id: 'usr-aisha-kamau',
    name: 'Aisha Kamau',
    email: 'connect@africatechsummit.io',
    role: 'organizer',
    status: 'active',
    organizationId: 'org-tech-africa',
    phone: '+254 700 812 901',
    country: 'KE',
    city: 'Nairobi',
    provider: 'google',
    registeredAt: '2026-01-20T10:00:00Z',
    lastLoginAt: '2026-10-13T16:20:00Z',
    twoFactorEnabled: true,
    riskScore: 6,
    notes: 'Silicon Savannah conference director. Regular high-volume disbursements via Equity Bank Kenya & M-Pesa STK.',
  },
  {
    id: 'usr-chidi-okafor',
    name: 'Chidi Okafor',
    email: 'chidi.okafor@lagostechhub.ng',
    role: 'attendee',
    status: 'active',
    phone: '+234 803 291 8402',
    country: 'NG',
    city: 'Lagos',
    provider: 'magic_link',
    registeredAt: '2026-03-05T12:00:00Z',
    lastLoginAt: '2026-10-12T19:30:00Z',
    twoFactorEnabled: false,
    riskScore: 18,
    notes: 'Lagos tech ecosystem delegate. Frequent buyer for gastronomy exhibitions and summits across West Africa.',
  },
  {
    id: 'usr-kevin-odhiambo',
    name: 'Kevin Odhiambo',
    email: 'k.odhiambo@gatesecure.co.ke',
    role: 'gate_supervisor',
    status: 'active',
    phone: '+254 722 401 928',
    country: 'KE',
    city: 'Nairobi',
    provider: 'password',
    registeredAt: '2026-02-28T08:30:00Z',
    lastLoginAt: '2026-10-14T06:10:00Z',
    twoFactorEnabled: true,
    riskScore: 4,
    notes: 'Field hardware access officer. Superintends Turnstile Alpha & Bravo turnstile devices at Sarit Expo Centre.',
  },
  {
    id: 'usr-lerato-khumalo',
    name: 'Lerato Khumalo',
    email: 'lerato.k@nexora.africa',
    role: 'support_lead',
    status: 'active',
    phone: '+27 11 902 4810',
    country: 'ZA',
    city: 'Johannesburg',
    provider: 'google',
    registeredAt: '2026-01-05T08:00:00Z',
    lastLoginAt: '2026-10-14T12:00:00Z',
    twoFactorEnabled: true,
    riskScore: 2,
    notes: 'Senior customer experience lead. Authorized for Tier-2 refunds, dispute reversals, and attendee triage.',
  },
  {
    id: 'usr-tariq-benyoussef',
    name: 'Tariq Ben-Youssef',
    email: 'tariq.passback@darkproxy.net',
    role: 'attendee',
    status: 'suspended',
    phone: '+27 76 892 1049',
    country: 'ZA',
    city: 'Durban',
    provider: 'password',
    registeredAt: '2026-08-14T23:12:00Z',
    lastLoginAt: '2026-09-12T03:45:00Z',
    twoFactorEnabled: false,
    riskScore: 89,
    suspensionReason: 'Card velocity abuse, VPN exit node clustering, and 3 chargeback disputes lodged with ABSA gateway.',
    notes: 'Account suspended by automated fraud engine. 4 chargebacks initiated. Manual re-verification required.',
  },
  {
    id: 'usr-kofi-mensah',
    name: 'Kofi Mensah',
    email: 'kofi.mensah@accraaccords.com',
    role: 'attendee',
    status: 'active',
    phone: '+233 24 551 0928',
    country: 'GH',
    city: 'Accra',
    provider: 'google',
    registeredAt: '2026-04-18T15:20:00Z',
    lastLoginAt: '2026-10-10T14:40:00Z',
    twoFactorEnabled: true,
    riskScore: 11,
    notes: 'Cultural diplomat and arts promoter in Ghana. Regular attendee of bilateral creative symposiums.',
  },
  {
    id: 'usr-marie-uwase',
    name: 'Dr. Marie Claire Uwase',
    email: 'director@kigalitechsummit.rw',
    role: 'organizer',
    status: 'active',
    organizationId: 'org-kigali-innovate',
    phone: '+250 788 392 104',
    country: 'RW',
    city: 'Kigali',
    provider: 'magic_link',
    registeredAt: '2026-03-22T09:15:00Z',
    lastLoginAt: '2026-10-11T17:05:00Z',
    twoFactorEnabled: true,
    riskScore: 7,
    notes: 'Rwanda Innovation Hub executive. Active MoMo Pay merchant settlement integration.',
  },
  {
    id: 'usr-johannes-vanwyk',
    name: 'Johannes Van Wyk',
    email: 'johannes.vw@nexora.africa',
    role: 'admin',
    status: 'active',
    phone: '+27 12 849 2019',
    country: 'ZA',
    city: 'Pretoria',
    provider: 'password',
    registeredAt: '2026-01-02T07:30:00Z',
    lastLoginAt: '2026-10-14T12:28:00Z',
    twoFactorEnabled: true,
    riskScore: 1,
    notes: 'Nexora Platform Operations Director with Root governance clearance and African central bank reporting privileges.',
  },
];

export const INITIAL_SAMPLE_ORDERS: Order[] = [];
export const INITIAL_SAMPLE_TICKETS: Ticket[] = [];
export const INITIAL_SAMPLE_LEDGER: LedgerEntry[] = [];

class NexoraStore {
  private events: Event[] = [];
  private orders: Order[] = [];
  private tickets: Ticket[] = [];
  private checkIns: CheckInLog[] = [];
  private ledger: LedgerEntry[] = [];
  private organizers: OrganizerProfile[] = [];
  private promoCodes: PromoCode[] = [];
  private payouts: PayoutRequest[] = [];
  private refundRequests: RefundRequest[] = [];
  private teamMembers: TeamMember[] = [];
  private launchGates: CountryLaunchGate[] = [];
  private webhookLogs: WebhookLog[] = [];
  private venueRFPs: VenueRFP[] = [];
  private marketingCampaigns: MarketingCampaign[] = [];
  private priorityTasks: PriorityTask[] = [];
  private activityFeed: ActivityFeedItem[] = [];
  private platformUsers: AuthUser[] = [];
  private integrations: Record<string, ThirdPartyIntegration[]> = {};
  private customWebhooks: Record<string, CustomWebhookEndpoint[]> = {};
  private webhookDeliveryLogs: Record<string, WebhookDeliveryLog[]> = {};
  private waitlist: WaitlistEntry[] = [];
  private communityHighlights: CommunityHighlight[] = [];
  private wristbands: CashlessWristband[] = [];
  private userRole: 'attendee' | 'organizer' | 'scanner' | 'admin' = 'organizer';
  private selectedCurrency = 'ZAR';
  private currentUser: AuthUser | null = null;

  constructor() {
    this.init();
  }

  private init() {
    this.events = loadFromStorage('events', INITIAL_EVENTS);
    // Ensure sold out event is included for testing
    if (!this.events.some(e => e.id === 'evt-kirstenbosch-amapiano-gala-2026')) {
      const soldOutEvent = INITIAL_EVENTS.find(e => e.id === 'evt-kirstenbosch-amapiano-gala-2026');
      if (soldOutEvent) {
        this.events = [soldOutEvent, ...this.events];
        saveToStorage('events', this.events);
      }
    }

    this.organizers = loadFromStorage('organizers', INITIAL_ORGANIZERS);
    this.promoCodes = loadFromStorage('promos', INITIAL_PROMO_CODES);
    // Purge mock telemetry and transaction data to clean zero baseline
    if (typeof window !== 'undefined') {
      try {
        if (localStorage.getItem('nexora_zero_baseline_purged_v3') !== 'true') {
          localStorage.removeItem('orders');
          localStorage.removeItem('tickets');
          localStorage.removeItem('ledger');
          localStorage.removeItem('webhooks');
          localStorage.removeItem('checkins');
          localStorage.removeItem('payouts');
          localStorage.removeItem('refunds');
          localStorage.setItem('nexora_zero_baseline_purged_v3', 'true');
        }
      } catch {
        // Ignore
      }
    }

    this.orders = loadFromStorage('orders', []);
    this.tickets = loadFromStorage('tickets', []);
    this.checkIns = loadFromStorage('checkins', []);
    this.ledger = loadFromStorage('ledger', []);
    this.platformUsers = loadFromStorage('platform_users', INITIAL_PLATFORM_USERS);
    if (!this.platformUsers || this.platformUsers.length === 0) {
      this.platformUsers = INITIAL_PLATFORM_USERS;
      saveToStorage('platform_users', this.platformUsers);
    }
    this.payouts = loadFromStorage('payouts', []);
    this.refundRequests = loadFromStorage('refunds', []);
    this.teamMembers = loadFromStorage('team', INITIAL_TEAM_MEMBERS);
    this.launchGates = loadFromStorage('launch_gates', INITIAL_LAUNCH_GATES);
    this.webhookLogs = loadFromStorage('webhooks', []);
    this.venueRFPs = loadFromStorage('venue_rfps', INITIAL_VENUE_RFPS);
    this.marketingCampaigns = loadFromStorage('campaigns', INITIAL_MARKETING_CAMPAIGNS);
    this.priorityTasks = loadFromStorage('tasks', INITIAL_PRIORITY_TASKS);
    this.activityFeed = loadFromStorage('activity', INITIAL_ACTIVITY_FEED);
    this.selectedCurrency = loadFromStorage('currency', 'ZAR');
    this.waitlist = loadFromStorage('waitlist', INITIAL_WAITLIST_ENTRIES);
    this.communityHighlights = loadFromStorage('community_highlights', INITIAL_COMMUNITY_HIGHLIGHTS);
    this.wristbands = loadFromStorage('wristbands', INITIAL_WRISTBANDS);
    this.currentUser = loadFromStorage<AuthUser | null>('auth_user', {
      id: 'usr-thabo',
      name: 'Thabo Mokoena',
      email: 'thabo@capetownvibes.co.za',
      role: 'organizer',
      organizationId: 'org-cape-vibes',
    });

    this.integrations = loadFromStorage('integrations_map', {
      'org-cape-vibes': INITIAL_THIRD_PARTY_INTEGRATIONS,
    });
    this.customWebhooks = loadFromStorage('custom_webhooks_map', {
      'org-cape-vibes': INITIAL_CUSTOM_WEBHOOKS,
    });
    this.webhookDeliveryLogs = loadFromStorage('webhook_delivery_logs_map', {
      'org-cape-vibes': INITIAL_WEBHOOK_DELIVERY_LOGS,
    });

    if (this.tickets.length === 0) {
      this.seedSampleTicket();
    }
  }

  private seedSampleTicket() {
    const sampleTicketCode = 'NX-TKT-94821';
    const sampleToken = 'auth_token_' + Math.random().toString(36).substring(2, 12);
    const sampleTicket: Ticket = {
      id: 'tkt-seed-1',
      ticketCode: sampleTicketCode,
      token: sampleToken,
      orderId: 'ord-seed-1',
      eventId: 'evt-cape-town-vibes-2026',
      eventTitle: 'Cape Town Vibes Festival 2026',
      eventDate: '2026-11-14T14:00:00Z',
      eventVenue: 'Green Point Amphitheatre, Cape Town',
      tierId: 'tier-ct-early',
      tierName: 'General Admission — Phase 1',
      attendeeName: 'Nomvula Dlamini',
      attendeeEmail: 'nomvula.dlamini@example.com',
      attendeePhone: '+27 82 491 0293',
      priceMinor: 35000,
      currency: 'ZAR',
      status: 'valid',
      qrPayload: JSON.stringify({
        code: sampleTicketCode,
        eventId: 'evt-cape-town-vibes-2026',
        token: sampleToken,
        tier: 'General Admission — Phase 1',
        attendee: 'Nomvula Dlamini',
      }),
    };

    this.tickets = [sampleTicket];
    saveToStorage('tickets', this.tickets);
  }

  // Currency
  public getSelectedCurrency(): string {
    return this.selectedCurrency;
  }

  public setSelectedCurrency(curr: string): void {
    this.selectedCurrency = curr;
    saveToStorage('currency', curr);
  }

  // Role
  public getUserRole(): 'attendee' | 'organizer' | 'scanner' | 'admin' {
    return this.userRole;
  }

  public setUserRole(role: 'attendee' | 'organizer' | 'scanner' | 'admin'): void {
    this.userRole = role;
  }

  // Events
  public getEvents(): Event[] {
    return [...this.events];
  }

  public getEventById(id: string): Event | undefined {
    return this.events.find(e => e.id === id || e.slug === id);
  }

  public createEvent(newEvent: Omit<Event, 'id' | 'minPriceMinor'>): Event {
    const id = 'evt-' + Date.now();
    const minPriceMinor = newEvent.tickets.length > 0 
      ? Math.min(...newEvent.tickets.map(t => t.priceMinor))
      : 0;

    const created: Event = {
      ...newEvent,
      id,
      minPriceMinor,
    };

    this.events.unshift(created);
    saveToStorage('events', this.events);

    this.logActivity({
      type: 'session',
      title: 'New Event Published',
      description: `Event "${created.title}" published with ${created.tickets.length} ticket tiers`,
      actor: created.organizer.name,
    });

    return created;
  }

  public updateEvent(eventId: string, updates: Partial<Event>): Event | null {
    const idx = this.events.findIndex(e => e.id === eventId);
    if (idx === -1) return null;

    const existing = this.events[idx];
    const updatedTickets = updates.tickets || existing.tickets;
    const minPriceMinor = updatedTickets.length > 0 
      ? Math.min(...updatedTickets.map(t => t.priceMinor))
      : 0;

    const updated: Event = {
      ...existing,
      ...updates,
      minPriceMinor,
    };

    this.events[idx] = updated;
    saveToStorage('events', this.events);

    this.logActivity({
      type: 'session',
      title: 'Event Updated',
      description: `Event "${updated.title}" settings and parameters updated`,
      actor: updated.organizer.name,
    });

    return updated;
  }

  public deleteEvent(eventId: string): boolean {
    const idx = this.events.findIndex(e => e.id === eventId);
    if (idx === -1) return false;
    const deleted = this.events[idx];
    this.events = this.events.filter(e => e.id !== eventId);
    saveToStorage('events', this.events);

    this.logActivity({
      type: 'session',
      title: 'Event Deleted',
      description: `Event "${deleted.title}" was permanently removed from portfolio`,
      actor: deleted.organizer.name,
    });

    return true;
  }

  public cancelEvent(eventId: string, reason?: string): Event | null {
    return this.updateEvent(eventId, { 
      status: 'cancelled'
    });
  }

  // Promo Codes
  public validatePromoCode(code: string, eventId?: string): PromoCode | null {
    const promo = this.promoCodes.find(
      p => p.code.toUpperCase() === code.trim().toUpperCase() && p.active
    );
    if (!promo) return null;
    if (promo.timesUsed >= promo.maxUses) return null;
    if (promo.eventId && eventId && promo.eventId !== eventId) return null;
    return promo;
  }

  public applyPromoCode(code: string): void {
    const promo = this.promoCodes.find(p => p.code.toUpperCase() === code.trim().toUpperCase());
    if (promo) {
      promo.timesUsed += 1;
      saveToStorage('promos', this.promoCodes);
    }
  }

  // Inventory & Orders
  public createOrder(orderInput: {
    eventId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    items: Array<{ tierId: string; quantity: number }>;
    promoCode?: string;
  }): { order: Order; success: boolean; error?: string } {
    const event = this.getEventById(orderInput.eventId);
    if (!event) return { order: null as any, success: false, error: 'Event not found' };

    for (const item of orderInput.items) {
      const tier = event.tickets.find(t => t.id === item.tierId);
      if (!tier) return { order: null as any, success: false, error: `Invalid ticket tier` };
      if (tier.remaining < item.quantity) {
        return { order: null as any, success: false, error: `Only ${tier.remaining} tickets left for ${tier.name}` };
      }
    }

    let subtotalMinor = 0;
    const orderItems = orderInput.items.map(item => {
      const tier = event.tickets.find(t => t.id === item.tierId)!;
      const unitPrice = tier.priceMinor;
      const totalPrice = unitPrice * item.quantity;
      subtotalMinor += totalPrice;
      return {
        tierId: tier.id,
        tierName: tier.name,
        quantity: item.quantity,
        unitPriceMinor: unitPrice,
        totalPriceMinor: totalPrice,
      };
    });

    let discountMinor = 0;
    if (orderInput.promoCode) {
      const promo = this.validatePromoCode(orderInput.promoCode, event.id);
      if (promo) {
        discountMinor = Math.round((subtotalMinor * promo.discountPercentage) / 100);
      }
    }

    const feeMinor = subtotalMinor > 0 ? Math.round((subtotalMinor - discountMinor) * 0.035) : 0;
    const totalMinor = Math.max(0, subtotalMinor - discountMinor + feeMinor);

    const orderId = 'ord-' + Date.now();
    const orderReference = 'NX-' + Math.floor(100000 + Math.random() * 900000);

    const order: Order = {
      id: orderId,
      orderReference,
      customerName: orderInput.customerName,
      customerEmail: orderInput.customerEmail,
      customerPhone: orderInput.customerPhone,
      eventId: event.id,
      eventTitle: event.title,
      items: orderItems,
      subtotalMinor,
      feeMinor,
      discountMinor,
      taxMinor: 0,
      totalMinor,
      currency: event.currency,
      paymentStatus: 'created',
      paymentMethod: 'sandbox',
      paymentProvider: 'sandbox',
      transactionReference: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      promoCodeApplied: orderInput.promoCode,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };

    this.orders.unshift(order);
    saveToStorage('orders', this.orders);

    return { order, success: true };
  }

  public finalizeOrderPayment(
    orderId: string,
    paymentProvider: Order['paymentProvider'],
    paymentMethod: string
  ): { success: boolean; tickets: Ticket[]; order?: Order; error?: string } {
    const orderIndex = this.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return { success: false, tickets: [], error: 'Order not found' };

    const order = this.orders[orderIndex];
    if (order.paymentStatus === 'succeeded') {
      const existingTickets = this.tickets.filter(t => t.orderId === orderId);
      return { success: true, tickets: existingTickets, order };
    }

    const event = this.getEventById(order.eventId);
    if (!event) return { success: false, tickets: [], error: 'Associated event not found' };

    for (const item of order.items) {
      const tier = event.tickets.find(t => t.id === item.tierId);
      if (tier) {
        tier.remaining = Math.max(0, tier.remaining - item.quantity);
        if (tier.remaining === 0) tier.status = 'sold_out';
      }
    }
    saveToStorage('events', this.events);

    order.paymentStatus = 'succeeded';
    order.paymentProvider = paymentProvider;
    order.paymentMethod = paymentMethod;
    this.orders[orderIndex] = order;
    saveToStorage('orders', this.orders);

    if (order.promoCodeApplied) {
      this.applyPromoCode(order.promoCodeApplied);
    }

    const generatedTickets: Ticket[] = [];
    let ticketCounter = 1;

    for (const item of order.items) {
      for (let i = 0; i < item.quantity; i++) {
        const ticketCode = `NX-${Math.floor(100000 + Math.random() * 900000)}-${ticketCounter++}`;
        const token = 'nx_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const newTicket: Ticket = {
          id: 'tkt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          ticketCode,
          token,
          orderId: order.id,
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.startDate,
          eventVenue: `${event.venue.name}, ${event.venue.city}`,
          tierId: item.tierId,
          tierName: item.tierName,
          attendeeName: order.customerName,
          attendeeEmail: order.customerEmail,
          attendeePhone: order.customerPhone,
          priceMinor: item.unitPriceMinor,
          currency: order.currency,
          status: 'valid',
          qrPayload: JSON.stringify({
            code: ticketCode,
            eventId: event.id,
            token,
            tier: item.tierName,
            attendee: order.customerName,
            issuedAt: new Date().toISOString(),
          }),
        };

        generatedTickets.push(newTicket);
        this.tickets.unshift(newTicket);
      }
    }
    saveToStorage('tickets', this.tickets);

    const organizerProceeds = Math.max(0, order.subtotalMinor - order.discountMinor);
    const platformCommission = order.feeMinor;
    const gatewayFee = Math.round(order.totalMinor * 0.015);

    const timestamp = new Date().toISOString();
    const ledgerBatch: LedgerEntry[] = [
      {
        id: 'ledg-' + Date.now() + '-1',
        orderId: order.id,
        eventId: event.id,
        organizerId: event.organizer.id,
        type: 'customer_clearing',
        debitMinor: order.totalMinor,
        creditMinor: 0,
        currency: order.currency,
        description: `Customer payment received for Order #${order.orderReference}`,
        timestamp,
      },
      {
        id: 'ledg-' + Date.now() + '-2',
        orderId: order.id,
        eventId: event.id,
        organizerId: event.organizer.id,
        type: 'organizer_payable',
        debitMinor: 0,
        creditMinor: organizerProceeds,
        currency: order.currency,
        description: `Net ticket revenue allocated to organizer for Order #${order.orderReference}`,
        timestamp,
      },
      {
        id: 'ledg-' + Date.now() + '-3',
        orderId: order.id,
        eventId: event.id,
        organizerId: event.organizer.id,
        type: 'platform_commission',
        debitMinor: 0,
        creditMinor: platformCommission,
        currency: order.currency,
        description: `NEXORA platform commission for Order #${order.orderReference}`,
        timestamp,
      },
      {
        id: 'ledg-' + Date.now() + '-4',
        orderId: order.id,
        eventId: event.id,
        organizerId: event.organizer.id,
        type: 'processing_fee',
        debitMinor: gatewayFee,
        creditMinor: 0,
        currency: order.currency,
        description: `Interchange settlement fee for Order #${order.orderReference}`,
        timestamp,
      },
    ];

    this.ledger.unshift(...ledgerBatch);
    saveToStorage('ledger', this.ledger);

    this.logActivity({
      type: 'purchase',
      title: 'Ticket Order Completed',
      description: `${order.customerName} purchased ${generatedTickets.length}x tickets for Order #${order.orderReference}`,
      actor: order.customerName,
    });

    return { success: true, tickets: generatedTickets, order };
  }

  // Tickets
  public getTickets(): Ticket[] {
    return [...this.tickets];
  }

  public getTicketByCode(code: string): Ticket | undefined {
    const cleanCode = code.trim().toUpperCase();
    return this.tickets.find(t => t.ticketCode.toUpperCase() === cleanCode);
  }

  public updateTicketAttendee(ticketId: string, name: string, email: string, phone: string): void {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.attendeeName = name;
      ticket.attendeeEmail = email;
      ticket.attendeePhone = phone;
      saveToStorage('tickets', this.tickets);
    }
  }

  // Check-In
  public validateAndCheckIn(params: {
    scannedPayload: string;
    eventId?: string;
    staffName: string;
    gate?: string;
    isOffline?: boolean;
  }): CheckInLog {
    const { scannedPayload, eventId, staffName, gate = 'Gate A - Main', isOffline = false } = params;

    let parsedCode = scannedPayload.trim();
    try {
      if (scannedPayload.startsWith('{')) {
        const obj = JSON.parse(scannedPayload);
        if (obj.code) parsedCode = obj.code;
      }
    } catch {}

    const ticket = this.getTicketByCode(parsedCode);
    const timestamp = new Date().toISOString();

    if (!ticket) {
      const log: CheckInLog = {
        id: 'chk-' + Date.now(),
        ticketId: 'unknown',
        ticketCode: parsedCode,
        eventId: eventId || 'all',
        timestamp,
        staffName,
        gate,
        result: 'invalid',
        message: 'No record found for this ticket code. Please refer to supervisor support.',
        offlineSync: isOffline,
      };
      this.checkIns.unshift(log);
      saveToStorage('checkins', this.checkIns);
      return log;
    }

    if (eventId && ticket.eventId !== eventId) {
      const log: CheckInLog = {
        id: 'chk-' + Date.now(),
        ticketId: ticket.id,
        ticketCode: ticket.ticketCode,
        eventId: ticket.eventId,
        timestamp,
        staffName,
        gate,
        result: 'wrong_event',
        message: `Ticket is for a different event: "${ticket.eventTitle}". Entry denied.`,
        offlineSync: isOffline,
      };
      this.checkIns.unshift(log);
      saveToStorage('checkins', this.checkIns);
      return log;
    }

    if (ticket.status === 'refunded' || ticket.status === 'cancelled') {
      const log: CheckInLog = {
        id: 'chk-' + Date.now(),
        ticketId: ticket.id,
        ticketCode: ticket.ticketCode,
        eventId: ticket.eventId,
        timestamp,
        staffName,
        gate,
        result: 'refunded',
        message: 'REVOKED: This pass was refunded or cancelled and is invalid for entry.',
        offlineSync: isOffline,
      };
      this.checkIns.unshift(log);
      saveToStorage('checkins', this.checkIns);
      return log;
    }

    if (ticket.status === 'checked_in') {
      const prevCheckIn = this.checkIns.find(c => c.ticketId === ticket.id && c.result === 'valid');
      const prevTime = prevCheckIn ? new Date(prevCheckIn.timestamp).toLocaleTimeString() : 'earlier';
      const prevGate = prevCheckIn ? prevCheckIn.gate : 'main gate';

      const log: CheckInLog = {
        id: 'chk-' + Date.now(),
        ticketId: ticket.id,
        ticketCode: ticket.ticketCode,
        eventId: ticket.eventId,
        timestamp,
        staffName,
        gate,
        result: 'already_checked_in',
        message: `PASSBACK / DUPLICATE: Already admitted at ${prevTime} at ${prevGate}.`,
        offlineSync: isOffline,
      };
      this.checkIns.unshift(log);
      saveToStorage('checkins', this.checkIns);
      return log;
    }

    ticket.status = 'checked_in';
    ticket.checkedInAt = timestamp;
    ticket.checkedInBy = staffName;
    ticket.gate = gate;

    const ticketIndex = this.tickets.findIndex(t => t.id === ticket.id);
    if (ticketIndex !== -1) {
      this.tickets[ticketIndex] = ticket;
      saveToStorage('tickets', this.tickets);
    }

    const log: CheckInLog = {
      id: 'chk-' + Date.now(),
      ticketId: ticket.id,
      ticketCode: ticket.ticketCode,
      eventId: ticket.eventId,
      timestamp,
      staffName,
      gate,
      result: 'valid',
      message: `VERIFIED: Welcome ${ticket.attendeeName}! (${ticket.tierName})`,
      offlineSync: isOffline,
    };

    this.checkIns.unshift(log);
    saveToStorage('checkins', this.checkIns);

    this.logActivity({
      type: 'checkin',
      title: 'Attendee Admitted at Gate',
      description: `${ticket.attendeeName} checked in for ${ticket.tierName} at ${gate}`,
      actor: staffName,
    });

    return log;
  }

  public cacheEventTicketsForOffline(eventId: string) {
    return this.tickets
      .filter(t => t.eventId === eventId)
      .map(t => ({
        code: t.ticketCode,
        token: t.token,
        tier: t.tierName,
        name: t.attendeeName,
        status: t.status,
      }));
  }

  public syncOfflineScans(scans: Array<{ scannedPayload: string; eventId: string; staffName: string; gate: string }>) {
    let conflicts = 0;
    const results: CheckInLog[] = [];

    for (const scan of scans) {
      const res = this.validateAndCheckIn({
        scannedPayload: scan.scannedPayload,
        eventId: scan.eventId,
        staffName: scan.staffName + ' (Offline Sync)',
        gate: scan.gate,
        isOffline: true,
      });
      if (res.result === 'already_checked_in' || res.result === 'refunded') {
        conflicts++;
      }
      results.push(res);
    }

    return { processed: scans.length, conflicts, results };
  }

  public getCheckInLogs(eventId?: string): CheckInLog[] {
    if (!eventId) return [...this.checkIns];
    return this.checkIns.filter(c => c.eventId === eventId);
  }

  // Refunds
  public requestRefund(ticketId: string, reason: string): { success: boolean; request?: RefundRequest; error?: string } {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found' };

    if (ticket.status === 'refunded') return { success: false, error: 'Already refunded' };
    if (ticket.status === 'checked_in') return { success: false, error: 'Cannot refund checked-in pass' };

    const newReq: RefundRequest = {
      id: 'ref-' + Date.now(),
      ticketId: ticket.id,
      ticketCode: ticket.ticketCode,
      orderId: ticket.orderId,
      eventId: ticket.eventId,
      eventTitle: ticket.eventTitle,
      attendeeEmail: ticket.attendeeEmail,
      attendeeName: ticket.attendeeName,
      reason,
      amountMinor: ticket.priceMinor,
      currency: ticket.currency,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    this.refundRequests.unshift(newReq);
    saveToStorage('refunds', this.refundRequests);

    this.logActivity({
      type: 'refund',
      title: 'Refund Requested',
      description: `${ticket.attendeeName} requested refund for pass #${ticket.ticketCode} (${reason})`,
      actor: ticket.attendeeName,
    });

    return { success: true, request: newReq };
  }

  public getRefundRequests(organizerId?: string): RefundRequest[] {
    if (!organizerId) return [...this.refundRequests];
    const orgEvents = this.events.filter(e => e.organizer.id === organizerId).map(e => e.id);
    return this.refundRequests.filter(r => orgEvents.includes(r.eventId));
  }

  public reviewRefundRequest(requestId: string, approve: boolean, reviewerName: string, rejectionReason?: string) {
    const reqIndex = this.refundRequests.findIndex(r => r.id === requestId);
    if (reqIndex === -1) return { success: false, error: 'Request not found' };

    const req = this.refundRequests[reqIndex];
    const ticket = this.tickets.find(t => t.id === req.ticketId);

    if (approve) {
      req.status = 'approved';
      req.reviewedAt = new Date().toISOString();
      req.reviewedBy = reviewerName;

      if (ticket) {
        ticket.status = 'refunded';
        ticket.refundReason = req.reason;

        const event = this.getEventById(ticket.eventId);
        if (event) {
          const tier = event.tickets.find(t => t.id === ticket.tierId);
          if (tier) {
            tier.remaining = Math.min(tier.capacity, tier.remaining + 1);
            if (tier.status === 'sold_out' && tier.remaining > 0) tier.status = 'active';
          }
          saveToStorage('events', this.events);
        }

        const timestamp = new Date().toISOString();
        const organizer = this.organizers.find(o => o.id === event?.organizer.id) || this.organizers[0];

        const reversalEntries: LedgerEntry[] = [
          {
            id: 'ledg-rev-' + Date.now() + '-1',
            orderId: ticket.orderId,
            eventId: ticket.eventId,
            organizerId: organizer.id,
            type: 'refund_reversal',
            debitMinor: ticket.priceMinor,
            creditMinor: 0,
            currency: ticket.currency,
            description: `Refund reversal for Ticket #${ticket.ticketCode}`,
            timestamp,
          },
          {
            id: 'ledg-rev-' + Date.now() + '-2',
            orderId: ticket.orderId,
            eventId: ticket.eventId,
            organizerId: organizer.id,
            type: 'refund_reserve',
            debitMinor: 0,
            creditMinor: ticket.priceMinor,
            currency: ticket.currency,
            description: `Customer refund settlement for Ticket #${ticket.ticketCode}`,
            timestamp,
          },
        ];

        this.ledger.unshift(...reversalEntries);
        saveToStorage('ledger', this.ledger);
      }
    } else {
      req.status = 'rejected';
      req.reviewedAt = new Date().toISOString();
      req.reviewedBy = reviewerName;
      req.rejectionReason = rejectionReason || 'Outside policy window';
    }

    this.refundRequests[reqIndex] = req;
    saveToStorage('refunds', this.refundRequests);
    saveToStorage('tickets', this.tickets);
    return { success: true };
  }

  // Financial Ledger & Payouts
  public getLedgerEntries(organizerId?: string): LedgerEntry[] {
    if (!organizerId) return [...this.ledger];
    return this.ledger.filter(l => l.organizerId === organizerId);
  }

  public getOrganizerBalance(organizerId: string) {
    const entries = this.getLedgerEntries(organizerId);
    let grossMinor = 0;
    let platformFeeMinor = 0;
    let payoutsCompletedMinor = 0;
    let refundsReversedMinor = 0;

    for (const entry of entries) {
      if (entry.type === 'organizer_payable') {
        grossMinor += entry.creditMinor;
      } else if (entry.type === 'platform_commission') {
        platformFeeMinor += entry.creditMinor;
      } else if (entry.type === 'payout_transfer') {
        payoutsCompletedMinor += entry.debitMinor;
      } else if (entry.type === 'refund_reversal') {
        refundsReversedMinor += entry.debitMinor;
      }
    }

    const availablePayoutMinor = Math.max(0, grossMinor - refundsReversedMinor - payoutsCompletedMinor);
    return {
      grossMinor,
      platformFeeMinor,
      payoutsCompletedMinor,
      refundsReversedMinor,
      availablePayoutMinor,
    };
  }

  public getPayouts(organizerId?: string): PayoutRequest[] {
    if (!organizerId) return [...this.payouts];
    return this.payouts.filter(p => p.organizerId === organizerId);
  }

  public requestPayout(organizerId: string, amountMinor: number, currency = 'ZAR'): PayoutRequest {
    const organizer = this.organizers.find(o => o.id === organizerId);
    const destination = organizer?.bankDetails 
      ? `${organizer.bankDetails.bankName} ••••${organizer.bankDetails.accountNumber.slice(-4)}`
      : 'Primary Verified Account';

    const req: PayoutRequest = {
      id: 'pay-' + Date.now(),
      organizerId,
      amountMinor,
      currency,
      status: 'approved',
      requestedAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      destinationAccount: destination,
    };

    this.payouts.unshift(req);
    saveToStorage('payouts', this.payouts);

    const payoutLedgerEntry: LedgerEntry = {
      id: 'ledg-' + Date.now() + '-payout',
      organizerId,
      type: 'payout_transfer',
      debitMinor: amountMinor,
      creditMinor: 0,
      currency,
      description: `Settled payout transfer to ${destination}`,
      timestamp: new Date().toISOString(),
    };
    this.ledger.unshift(payoutLedgerEntry);
    saveToStorage('ledger', this.ledger);

    return req;
  }

  // Team Management
  public getTeamMembers(organizationId: string): TeamMember[] {
    return this.teamMembers.filter(m => m.organizationId === organizationId);
  }

  public addTeamMember(organizationId: string, name: string, email: string, role: TeamMember['role']): TeamMember {
    const member: TeamMember = {
      id: 'tm-' + Date.now(),
      organizationId,
      name,
      email,
      role,
      invitedAt: new Date().toISOString(),
      status: 'active',
    };
    this.teamMembers.push(member);
    saveToStorage('team', this.teamMembers);
    return member;
  }

  public removeTeamMember(memberId: string): void {
    this.teamMembers = this.teamMembers.filter(m => m.id !== memberId);
    saveToStorage('team', this.teamMembers);
  }

  // Subscriptions
  public updateOrganizerSubscription(organizerId: string, plan: 'starter' | 'growth' | 'business'): void {
    const org = this.organizers.find(o => o.id === organizerId);
    if (org) {
      org.subscriptionPlan = plan;
      if (plan === 'starter') org.commissionRate = 0.05;
      else if (plan === 'growth') org.commissionRate = 0.045;
      else if (plan === 'business') org.commissionRate = 0.035;
      saveToStorage('organizers', this.organizers);
    }
  }

  // Launch Gates
  public getLaunchGates(): CountryLaunchGate[] {
    return [...this.launchGates];
  }

  public toggleLaunchGateCheck(countryCode: string, field: keyof CountryLaunchGate): void {
    const gate = this.launchGates.find(g => g.countryCode === countryCode);
    if (gate && typeof gate[field] === 'boolean') {
      (gate[field] as any) = !(gate[field] as boolean);
      saveToStorage('launch_gates', this.launchGates);
    }
  }

  public authorizeCountryPaidSales(countryCode: string, authorized: boolean): void {
    const gate = this.launchGates.find(g => g.countryCode === countryCode);
    if (gate) {
      gate.paidSalesAuthorized = authorized;
      saveToStorage('launch_gates', this.launchGates);
    }
  }

  // Webhook Logs
  public simulateIncomingWebhook(
    provider: WebhookLog['provider'],
    eventId: string,
    signatureValid: boolean,
    amountMinor: number,
    currency: string
  ): { success: boolean; message: string; log: WebhookLog } {
    const isDuplicate = this.webhookLogs.some(w => w.eventId === eventId && w.status === 'processed');

    let status: WebhookLog['status'] = 'processed';
    let message = 'Webhook verified and processed idempotently.';

    if (!signatureValid) {
      status = 'signature_mismatch';
      message = 'REJECTED: HMAC signature mismatch. Security alarm triggered.';
    } else if (isDuplicate) {
      status = 'replayed_duplicate';
      message = 'IDEMPOTENT SKIP: Event ID previously processed. Duplicate ticket issuance prevented.';
    }

    const log: WebhookLog = {
      id: 'wh-' + Date.now(),
      provider,
      eventId,
      eventSignature: 'hmac_sha256_' + Math.random().toString(36).substring(2, 12),
      status,
      receivedAt: new Date().toISOString(),
      payloadSummary: `Charge authorization notification for ${currency} ${(amountMinor / 100).toFixed(2)}`,
      amountMinor,
      currency,
    };

    this.webhookLogs.unshift(log);
    saveToStorage('webhooks', this.webhookLogs);

    return { success: status === 'processed', message, log };
  }

  public getWebhookLogs(): WebhookLog[] {
    return [...this.webhookLogs];
  }

  // Organizers
  public getOrganizers(): OrganizerProfile[] {
    return [...this.organizers];
  }

  public updateOrganizerVerification(organizerId: string, status: 'verified' | 'rejected' | 'pending_kyc'): void {
    const org = this.organizers.find(o => o.id === organizerId);
    if (org) {
      org.verificationStatus = status;
      org.verified = status === 'verified';
      saveToStorage('organizers', this.organizers);
    }
  }

  public getOrganizer(organizerId: string): OrganizerProfile | undefined {
    return this.organizers.find(o => o.id === organizerId);
  }

  public updateOrganizerProfile(organizerId: string, updates: Partial<OrganizerProfile>): OrganizerProfile | null {
    const idx = this.organizers.findIndex(o => o.id === organizerId);
    if (idx === -1) return null;
    
    const existing = this.organizers[idx];
    const updated: OrganizerProfile = {
      ...existing,
      ...updates,
      bankDetails: {
        ...existing.bankDetails,
        ...(updates.bankDetails || {})
      },
      socialLinks: {
        ...(existing.socialLinks || {}),
        ...(updates.socialLinks || {})
      }
    };
    
    this.organizers[idx] = updated;
    saveToStorage('organizers', this.organizers);

    // If name changed, update the events where this organizer is assigned so events display the new name
    if (updates.name && updates.name !== existing.name) {
      this.events = this.events.map(ev => {
        if (ev.organizer.id === organizerId) {
          return {
            ...ev,
            organizer: {
              ...ev.organizer,
              name: updates.name!
            }
          };
        }
        return ev;
      });
      saveToStorage('events', this.events);
    }

    this.logActivity({
      type: 'profile',
      title: 'Organizer Profile Updated',
      description: `Updated business branding, contacts, and bank settlement details for ${updated.name}`,
      actor: updated.name,
    });

    return updated;
  }

  // Third-Party Integrations
  public getOrganizerIntegrations(organizerId: string): ThirdPartyIntegration[] {
    if (!this.integrations[organizerId]) {
      this.integrations[organizerId] = JSON.parse(JSON.stringify(INITIAL_THIRD_PARTY_INTEGRATIONS));
      saveToStorage('integrations_map', this.integrations);
    }
    return [...this.integrations[organizerId]];
  }

  public updateOrganizerIntegration(organizerId: string, integrationId: string, updates: Partial<ThirdPartyIntegration>): ThirdPartyIntegration | null {
    const list = this.getOrganizerIntegrations(organizerId);
    const idx = list.findIndex(i => i.id === integrationId);
    if (idx === -1) return null;

    const existing = list[idx];
    const updated: ThirdPartyIntegration = {
      ...existing,
      ...updates,
      config: {
        ...existing.config,
        ...(updates.config || {})
      },
      lastSyncedAt: new Date().toISOString()
    };

    list[idx] = updated;
    this.integrations[organizerId] = list;
    saveToStorage('integrations_map', this.integrations);

    this.logActivity({
      type: 'integration',
      title: `Integration Configured: ${updated.name}`,
      description: `Updated credentials and automated sync settings (${updated.status})`,
      actor: this.getOrganizer(organizerId)?.name || 'Organizer',
    });

    return updated;
  }

  public toggleIntegrationStatus(organizerId: string, integrationId: string): ThirdPartyIntegration | null {
    const list = this.getOrganizerIntegrations(organizerId);
    const item = list.find(i => i.id === integrationId);
    if (!item) return null;

    const newStatus = item.status === 'connected' ? 'disconnected' : 'connected';
    return this.updateOrganizerIntegration(organizerId, integrationId, {
      status: newStatus,
      lastSyncedAt: newStatus === 'connected' ? new Date().toISOString() : item.lastSyncedAt
    });
  }

  // Custom Webhook Management
  public getCustomWebhooks(organizerId: string): CustomWebhookEndpoint[] {
    if (!this.customWebhooks[organizerId]) {
      this.customWebhooks[organizerId] = JSON.parse(JSON.stringify(INITIAL_CUSTOM_WEBHOOKS));
      saveToStorage('custom_webhooks_map', this.customWebhooks);
    }
    return [...this.customWebhooks[organizerId]];
  }

  public createCustomWebhook(organizerId: string, webhook: Omit<CustomWebhookEndpoint, 'id' | 'createdAt'>): CustomWebhookEndpoint {
    const list = this.getCustomWebhooks(organizerId);
    const created: CustomWebhookEndpoint = {
      ...webhook,
      id: 'wh-' + Date.now(),
      createdAt: new Date().toISOString(),
      lastResponseCode: 200,
      lastLatencyMs: Math.floor(Math.random() * 40) + 25,
      lastTriggeredAt: new Date().toISOString()
    };

    list.unshift(created);
    this.customWebhooks[organizerId] = list;
    saveToStorage('custom_webhooks_map', this.customWebhooks);

    this.logActivity({
      type: 'webhook',
      title: `Webhook Endpoint Created: ${created.name}`,
      description: `Subscribed to ${created.events.length} event types at ${created.url}`,
      actor: this.getOrganizer(organizerId)?.name || 'Organizer',
    });

    return created;
  }

  public deleteCustomWebhook(organizerId: string, webhookId: string): boolean {
    const list = this.getCustomWebhooks(organizerId);
    const filtered = list.filter(w => w.id !== webhookId);
    this.customWebhooks[organizerId] = filtered;
    saveToStorage('custom_webhooks_map', this.customWebhooks);
    return true;
  }

  public toggleCustomWebhook(organizerId: string, webhookId: string): boolean {
    const list = this.getCustomWebhooks(organizerId);
    const item = list.find(w => w.id === webhookId);
    if (!item) return false;
    item.active = !item.active;
    this.customWebhooks[organizerId] = list;
    saveToStorage('custom_webhooks_map', this.customWebhooks);
    return true;
  }

  public getWebhookDeliveryLogs(organizerId: string): WebhookDeliveryLog[] {
    if (!this.webhookDeliveryLogs[organizerId]) {
      this.webhookDeliveryLogs[organizerId] = JSON.parse(JSON.stringify(INITIAL_WEBHOOK_DELIVERY_LOGS));
      saveToStorage('webhook_delivery_logs_map', this.webhookDeliveryLogs);
    }
    return [...this.webhookDeliveryLogs[organizerId]];
  }

  public triggerWebhookTestPing(organizerId: string, webhookId: string): { success: boolean; statusCode: number; latencyMs: number; message: string; responseBody: string } {
    const webhooks = this.getCustomWebhooks(organizerId);
    const target = webhooks.find(w => w.id === webhookId) || webhooks[0];
    const latencyMs = Math.floor(Math.random() * 45) + 22;
    const testEvent = target?.events[0] || 'ticket.purchased';

    const samplePayload = {
      event: testEvent,
      timestamp: new Date().toISOString(),
      environment: 'production',
      organizer: {
        id: organizerId,
        name: this.getOrganizer(organizerId)?.name || 'Cape Vibes Live'
      },
      data: {
        ticketReference: 'NX-TEST-' + Math.floor(10000 + Math.random() * 90000),
        eventTitle: 'Amapiano Sunsets Arena 2026',
        tier: 'VIP Gold Terrace',
        amountMinor: 65000,
        currency: 'ZAR',
        attendeeName: 'Nomvula Dlamini',
        attendeeEmail: 'nomvula.d@example.co.za'
      }
    };

    const newLog: WebhookDeliveryLog = {
      id: 'log-' + Date.now(),
      endpointId: target ? target.id : 'unknown',
      endpointName: target ? target.name : 'Simulated Endpoint',
      event: testEvent,
      timestamp: new Date().toISOString(),
      statusCode: 200,
      latencyMs,
      payloadSnippet: JSON.stringify(samplePayload),
      success: true,
    };

    const logs = this.getWebhookDeliveryLogs(organizerId);
    logs.unshift(newLog);
    if (logs.length > 50) logs.pop();
    this.webhookDeliveryLogs[organizerId] = logs;
    saveToStorage('webhook_delivery_logs_map', this.webhookDeliveryLogs);

    if (target) {
      target.lastTriggeredAt = new Date().toISOString();
      target.lastResponseCode = 200;
      target.lastLatencyMs = latencyMs;
      saveToStorage('custom_webhooks_map', this.customWebhooks);
    }

    return {
      success: true,
      statusCode: 200,
      latencyMs,
      message: `HTTP 200 OK — Handshake acknowledged in ${latencyMs}ms`,
      responseBody: JSON.stringify({ received: true, event: testEvent, processedAt: new Date().toISOString() }, null, 2)
    };
  }

  // Orders
  public getOrders(): Order[] {
    return [...this.orders];
  }

  // Venue RFPs
  public getVenueRFPs(): VenueRFP[] {
    return [...this.venueRFPs];
  }

  public createVenueRFP(rfp: Omit<VenueRFP, 'id' | 'submittedAt'>): VenueRFP {
    const created: VenueRFP = {
      ...rfp,
      id: 'rfp-' + Date.now(),
      submittedAt: new Date().toISOString(),
    };
    this.venueRFPs.unshift(created);
    saveToStorage('venue_rfps', this.venueRFPs);

    this.logActivity({
      type: 'rfp',
      title: 'New Venue RFP Submitted',
      description: `RFP submitted to ${created.venueName} for ${created.expectedAttendees} attendees`,
      actor: created.contactPerson || 'Event Organizer',
    });

    return created;
  }

  // Marketing Campaigns
  public getMarketingCampaigns(): MarketingCampaign[] {
    return [...this.marketingCampaigns];
  }

  public createMarketingCampaign(camp: Omit<MarketingCampaign, 'id'>): MarketingCampaign {
    const created: MarketingCampaign = {
      ...camp,
      id: 'camp-' + Date.now(),
    };
    this.marketingCampaigns.unshift(created);
    saveToStorage('campaigns', this.marketingCampaigns);

    this.logActivity({
      type: 'campaign',
      title: 'Marketing Campaign Launched',
      description: `Campaign "${created.title}" launched to ${created.audience}`,
      actor: 'Marketing Team',
    });

    return created;
  }

  // Priority Tasks
  public getPriorityTasks(): PriorityTask[] {
    return [...this.priorityTasks];
  }

  public resolvePriorityTask(taskId: string): void {
    const task = this.priorityTasks.find(t => t.id === taskId);
    if (task) {
      task.resolved = true;
      saveToStorage('tasks', this.priorityTasks);
    }
  }

  // Activity Feed
  public getActivityFeed(): ActivityFeedItem[] {
    return [...this.activityFeed];
  }

  public logActivity(item: Omit<ActivityFeedItem, 'id' | 'timestamp'>): void {
    const created: ActivityFeedItem = {
      ...item,
      id: 'act-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    this.activityFeed.unshift(created);
    if (this.activityFeed.length > 50) this.activityFeed.pop();
    saveToStorage('activity', this.activityFeed);
  }

  // Add agenda session
  public addAgendaSession(eventId: string, session: { time: string; title: string; description?: string; speaker?: string; stage?: string }): void {
    const evt = this.getEventById(eventId);
    if (evt) {
      if (!evt.agenda) evt.agenda = [];
      evt.agenda.push(session);
      saveToStorage('events', this.events);

      this.logActivity({
        type: 'session',
        title: 'Programme Session Added',
        description: `Session "${session.title}" scheduled for ${evt.title} (${session.time})`,
        actor: session.speaker || 'Event Manager',
      });
    }
  }

  // Create sample attendee for testability
  public createSampleAttendee(eventId: string, tierId?: string): Ticket {
    const evt = this.getEventById(eventId) || this.events[0];
    const tier = evt.tickets.find(t => t.id === tierId) || evt.tickets[0];
    const ticketCode = `NX-${Math.floor(100000 + Math.random() * 900000)}-S`;
    const token = 'token_' + Math.random().toString(36).substring(2, 10);

    const names = ['Tendai Chiwenga', 'Amina Hassan', 'Kofi Mensah', 'Babatunde Alabi', 'Zola Ndlovu', 'Wanjiku Kamau'];
    const chosenName = names[Math.floor(Math.random() * names.length)];

    const ticket: Ticket = {
      id: 'tkt-' + Date.now(),
      ticketCode,
      token,
      orderId: 'ord-sample-' + Date.now(),
      eventId: evt.id,
      eventTitle: evt.title,
      eventDate: evt.startDate,
      eventVenue: `${evt.venue.name}, ${evt.venue.city}`,
      tierId: tier.id,
      tierName: tier.name,
      attendeeName: chosenName,
      attendeeEmail: chosenName.toLowerCase().replace(' ', '.') + '@example.com',
      attendeePhone: '+27 82 ' + Math.floor(1000000 + Math.random() * 9000000),
      priceMinor: tier.priceMinor,
      currency: tier.currency,
      status: 'valid',
      qrPayload: JSON.stringify({
        code: ticketCode,
        eventId: evt.id,
        token,
        tier: tier.name,
        attendee: chosenName,
      }),
    };

    this.tickets.unshift(ticket);
    saveToStorage('tickets', this.tickets);

    this.logActivity({
      type: 'purchase',
      title: 'Sample Attendee Registered',
      description: `${chosenName} registered for ${evt.title} (${tier.name})`,
      actor: chosenName,
    });

    return ticket;
  }

  // Authentication & Session
  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  public setCurrentUser(user: AuthUser | null): void {
    this.currentUser = user;
    saveToStorage('auth_user', this.currentUser);
    if (user) {
      this.logActivity({
        type: 'checkin',
        title: 'User Authenticated',
        description: `${user.name} logged in as ${user.role}`,
        actor: user.name,
      });
    }
  }

  public logout(): void {
    this.currentUser = null;
    saveToStorage('auth_user', null);
  }

  // =========================================================================
  // User Management & Security Operations
  // =========================================================================
  public getUsers(): AuthUser[] {
    return [...this.platformUsers];
  }

  public getUserById(id: string): AuthUser | undefined {
    return this.platformUsers.find(
      u => u.id === id || u.email.toLowerCase() === id.toLowerCase()
    );
  }

  public updateUser(id: string, updates: Partial<AuthUser>): AuthUser | null {
    const idx = this.platformUsers.findIndex(
      u => u.id === id || u.email.toLowerCase() === id.toLowerCase()
    );
    if (idx === -1) return null;

    const existing = this.platformUsers[idx];
    const updated: AuthUser = {
      ...existing,
      ...updates,
    };

    this.platformUsers[idx] = updated;
    saveToStorage('platform_users', this.platformUsers);

    return updated;
  }

  public suspendUser(id: string, reason: string): boolean {
    const user = this.getUserById(id);
    if (!user) return false;

    this.updateUser(user.id, {
      status: 'suspended',
      suspensionReason: reason,
      riskScore: Math.max(user.riskScore || 0, 80),
    });

    this.logActivity({
      type: 'profile',
      title: 'User Account Suspended',
      description: `Account for ${user.name} (${user.email}) suspended by Super Admin. Reason: ${reason}`,
      actor: 'Super Admin',
    });

    return true;
  }

  public unsuspendUser(id: string): boolean {
    const user = this.getUserById(id);
    if (!user) return false;

    this.updateUser(user.id, {
      status: 'active',
      suspensionReason: undefined,
      riskScore: Math.min(user.riskScore || 20, 20),
    });

    this.logActivity({
      type: 'profile',
      title: 'User Account Reinstated',
      description: `Account suspension lifted for ${user.name} (${user.email}) by Super Admin.`,
      actor: 'Super Admin',
    });

    return true;
  }

  public resetUserRole(id: string, newRole: AuthUser['role']): boolean {
    const user = this.getUserById(id);
    if (!user) return false;

    const oldRole = user.role;
    this.updateUser(user.id, { role: newRole });

    this.logActivity({
      type: 'profile',
      title: 'User Role Reset',
      description: `Role for ${user.name} updated from ${oldRole} to ${newRole} by Super Admin.`,
      actor: 'Super Admin',
    });

    return true;
  }

  public getUserOrders(userEmailOrId: string): Order[] {
    const target = userEmailOrId.toLowerCase();
    const user = this.getUserById(userEmailOrId);
    const userEmail = user?.email.toLowerCase() || target;
    const userName = user?.name.toLowerCase() || '';

    return this.orders.filter(o => 
      o.customerEmail.toLowerCase() === userEmail ||
      (userName && o.customerName.toLowerCase() === userName) ||
      o.id.toLowerCase() === target
    );
  }

  public getUserTickets(userEmailOrId: string): Ticket[] {
    const target = userEmailOrId.toLowerCase();
    const user = this.getUserById(userEmailOrId);
    const userEmail = user?.email.toLowerCase() || target;
    const userName = user?.name.toLowerCase() || '';

    return this.tickets.filter(t => 
      t.attendeeEmail.toLowerCase() === userEmail ||
      (userName && t.attendeeName.toLowerCase().includes(userName)) ||
      t.id.toLowerCase() === target
    );
  }

  public getUserLedgerEntries(userEmailOrId: string): LedgerEntry[] {
    const userOrders = this.getUserOrders(userEmailOrId);
    const orderIds = new Set(userOrders.map(o => o.id));
    return this.ledger.filter(l => (l.orderId && orderIds.has(l.orderId)));
  }

  // ==========================================
  // WAITLIST MANAGEMENT
  // ==========================================
  public getWaitlist(): WaitlistEntry[] {
    return [...this.waitlist];
  }

  public getWaitlistForEvent(eventId: string): WaitlistEntry[] {
    return this.waitlist.filter(w => w.eventId === eventId);
  }

  public isOnWaitlist(eventId: string, email: string): boolean {
    if (!email) return false;
    const lower = email.trim().toLowerCase();
    return this.waitlist.some(w => w.eventId === eventId && w.email.trim().toLowerCase() === lower);
  }

  public joinWaitlist(params: {
    eventId: string;
    eventTitle: string;
    email: string;
    name?: string;
    tierId?: string;
    tierName?: string;
    phone?: string;
  }): { success: boolean; entry: WaitlistEntry; message: string; isNew: boolean } {
    const cleanEmail = params.email.trim().toLowerCase();
    
    // Check if already registered on waitlist for this event
    const existing = this.waitlist.find(
      w => w.eventId === params.eventId && w.email.trim().toLowerCase() === cleanEmail
    );

    if (existing) {
      return {
        success: true,
        entry: existing,
        message: `You are already registered on the waitlist at position #${existing.position}.`,
        isNew: false
      };
    }

    const eventWaitlist = this.waitlist.filter(w => w.eventId === params.eventId);
    const nextPosition = eventWaitlist.length + 1;

    const newEntry: WaitlistEntry = {
      id: 'wait-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      eventId: params.eventId,
      eventTitle: params.eventTitle,
      email: cleanEmail,
      name: params.name?.trim() || cleanEmail.split('@')[0],
      tierId: params.tierId,
      tierName: params.tierName,
      phone: params.phone,
      joinedAt: new Date().toISOString(),
      status: 'waiting',
      position: nextPosition
    };

    this.waitlist = [newEntry, ...this.waitlist];
    saveToStorage('waitlist', this.waitlist);

    this.logActivity({
      type: 'purchase',
      title: 'Attendee Joined Waitlist',
      description: `${newEntry.name} (${cleanEmail}) joined waitlist for ${params.eventTitle} (Position #${nextPosition})`,
      actor: newEntry.name || 'Attendee'
    });

    return {
      success: true,
      entry: newEntry,
      message: `You've joined the waitlist at position #${nextPosition}! We'll email you immediately if tickets become available.`,
      isNew: true
    };
  }

  // ==========================================
  // COMMUNITY PULSE HIGHLIGHTS
  // ==========================================
  public getCommunityHighlights(): CommunityHighlight[] {
    return [...this.communityHighlights];
  }

  public likeCommunityHighlight(id: string): CommunityHighlight | null {
    const item = this.communityHighlights.find(h => h.id === id);
    if (!item) return null;

    const userLiked = !item.userLiked;
    const likesCount = userLiked ? item.likesCount + 1 : Math.max(0, item.likesCount - 1);

    item.userLiked = userLiked;
    item.likesCount = likesCount;

    saveToStorage('community_highlights', this.communityHighlights);
    return { ...item };
  }

  // ==========================================
  // WAITLIST RECLAMATION AUTOMATION ENGINE
  // ==========================================
  public triggerWaitlistReclamation(eventId: string, ticketCount: number = 1): {
    reclaimed: WaitlistEntry[];
    message: string;
  } {
    const event = this.getEventById(eventId);
    const waitingEntries = this.waitlist
      .filter(w => w.eventId === eventId && w.status === 'waiting')
      .sort((a, b) => a.position - b.position);

    if (waitingEntries.length === 0) {
      return {
        reclaimed: [],
        message: 'No attendees currently waiting in queue for this event.'
      };
    }

    const toNotify = waitingEntries.slice(0, ticketCount);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours

    toNotify.forEach(entry => {
      const claimToken = 'CLAIM-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString(36).slice(-3).toUpperCase();
      entry.status = 'notified';
      entry.claimToken = claimToken;
      entry.notifiedAt = now.toISOString();
      entry.claimExpiresAt = expiresAt.toISOString();
      entry.notificationDispatchLog = {
        emailSent: true,
        smsSent: Boolean(entry.phone),
        provider: 'SendGrid',
        messageId: 'sg-msg-' + Math.random().toString(36).substring(2, 9)
      };

      this.logActivity({
        type: 'purchase',
        title: 'Waitlist Allocation Released',
        description: `Exclusive 2-hour claim token issued to ${entry.name} (${entry.email}) for ${event?.title || entry.eventTitle}. Token: ${claimToken}`,
        actor: 'Waitlist Engine'
      });
    });

    saveToStorage('waitlist', this.waitlist);

    return {
      reclaimed: toNotify,
      message: `Released ${toNotify.length} exclusive ticket reservation(s) via automated SendGrid/Twilio notification! 2-hour claim window started.`
    };
  }

  public claimWaitlistTicket(claimToken: string): {
    success: boolean;
    entry?: WaitlistEntry;
    event?: Event;
    message: string;
  } {
    const entry = this.waitlist.find(w => w.claimToken === claimToken);
    if (!entry) {
      return { success: false, message: 'Invalid or expired waitlist claim token.' };
    }

    if (entry.status === 'claimed') {
      return { success: false, entry, message: 'This waitlist ticket allocation has already been claimed.' };
    }

    if (entry.claimExpiresAt && new Date(entry.claimExpiresAt).getTime() < Date.now()) {
      entry.status = 'expired';
      saveToStorage('waitlist', this.waitlist);
      return { success: false, entry, message: 'Your 2-hour waitlist claim window has expired. The ticket rolled over to the next attendee in line.' };
    }

    const event = this.getEventById(entry.eventId);
    return {
      success: true,
      entry,
      event,
      message: 'Waitlist ticket allocation verified! Complete checkout before the countdown timer expires.'
    };
  }

  public markWaitlistClaimed(claimToken: string): boolean {
    const entry = this.waitlist.find(w => w.claimToken === claimToken);
    if (!entry) return false;
    entry.status = 'claimed';
    entry.claimedAt = new Date().toISOString();
    saveToStorage('waitlist', this.waitlist);
    return true;
  }

  public getActiveClaimForUser(email?: string): WaitlistEntry | undefined {
    if (!email) return undefined;
    const lower = email.trim().toLowerCase();
    const now = Date.now();
    return this.waitlist.find(w => 
      w.email.trim().toLowerCase() === lower &&
      w.status === 'notified' &&
      w.claimExpiresAt &&
      new Date(w.claimExpiresAt).getTime() > now
    );
  }

  // ==========================================
  // CASHLESS RFID WRISTBAND MANAGEMENT
  // ==========================================
  public getCashlessWristbands(): CashlessWristband[] {
    return [...this.wristbands];
  }

  public getWristbandByUid(uid: string): CashlessWristband | undefined {
    return this.wristbands.find(w => w.uid.toLowerCase() === uid.trim().toLowerCase());
  }

  public getWristbandForAttendee(email: string): CashlessWristband | undefined {
    const lower = email.trim().toLowerCase();
    return this.wristbands.find(w => w.attendeeEmail.trim().toLowerCase() === lower);
  }

  public pairWristband(params: {
    uid: string;
    attendeeEmail: string;
    attendeeName: string;
    eventId: string;
    eventTitle: string;
    initialBalanceMinor?: number;
    currency?: string;
  }): CashlessWristband {
    const existing = this.getWristbandByUid(params.uid);
    if (existing) {
      existing.attendeeEmail = params.attendeeEmail;
      existing.attendeeName = params.attendeeName;
      existing.eventId = params.eventId;
      existing.eventTitle = params.eventTitle;
      saveToStorage('wristbands', this.wristbands);
      return existing;
    }

    const newWristband: CashlessWristband = {
      id: 'wb-' + Date.now().toString(36),
      uid: params.uid.toUpperCase(),
      attendeeEmail: params.attendeeEmail,
      attendeeName: params.attendeeName,
      eventId: params.eventId,
      eventTitle: params.eventTitle,
      balanceMinor: params.initialBalanceMinor || 0,
      currency: params.currency || 'ZAR',
      status: 'active',
      pinRequired: false,
      lastTappedAt: new Date().toISOString(),
      transactions: params.initialBalanceMinor ? [{
        id: 'wtx-' + Date.now().toString(36),
        type: 'topup',
        amountMinor: params.initialBalanceMinor,
        vendorName: 'Initial Cashless Top-up',
        timestamp: new Date().toISOString(),
        balanceAfterMinor: params.initialBalanceMinor
      }] : []
    };

    this.wristbands = [newWristband, ...this.wristbands];
    saveToStorage('wristbands', this.wristbands);
    return newWristband;
  }

  public topUpWristband(uid: string, amountMinor: number, paymentMethod: string): {
    success: boolean;
    wristband?: CashlessWristband;
    message: string;
  } {
    const wb = this.getWristbandByUid(uid);
    if (!wb) return { success: false, message: 'Wristband UID not recognized.' };

    wb.balanceMinor += amountMinor;
    wb.lastTappedAt = new Date().toISOString();
    wb.transactions.unshift({
      id: 'wtx-' + Date.now().toString(36),
      type: 'topup',
      amountMinor,
      vendorName: `Top-up via ${paymentMethod}`,
      timestamp: new Date().toISOString(),
      balanceAfterMinor: wb.balanceMinor
    });

    saveToStorage('wristbands', this.wristbands);

    this.recordTransaction({
      type: 'payment',
      amountMinor,
      currency: wb.currency,
      description: `Cashless RFID Wristband Top-up [${wb.uid}] - ${wb.attendeeName} via ${paymentMethod}`,
      reference: `NFC-TOPUP-${wb.uid}`
    });

    return {
      success: true,
      wristband: { ...wb },
      message: `Loaded funds onto wristband ${wb.uid} successfully! New balance: ${wb.currency} ${(wb.balanceMinor / 100).toFixed(2)}.`
    };
  }

  public chargeWristband(uid: string, amountMinor: number, vendorName: string): {
    success: boolean;
    wristband?: CashlessWristband;
    message: string;
  } {
    const wb = this.getWristbandByUid(uid);
    if (!wb) return { success: false, message: 'Wristband not paired.' };
    if (wb.status !== 'active') return { success: false, message: `Wristband is ${wb.status}.` };
    if (wb.balanceMinor < amountMinor) {
      return { 
        success: false, 
        wristband: wb, 
        message: `Insufficient funds. Balance: ${wb.currency} ${(wb.balanceMinor / 100).toFixed(2)}, Required: ${wb.currency} ${(amountMinor / 100).toFixed(2)}.` 
      };
    }

    wb.balanceMinor -= amountMinor;
    wb.lastTappedAt = new Date().toISOString();
    wb.transactions.unshift({
      id: 'wtx-' + Date.now().toString(36),
      type: 'purchase',
      amountMinor,
      vendorName,
      timestamp: new Date().toISOString(),
      balanceAfterMinor: wb.balanceMinor
    });

    saveToStorage('wristbands', this.wristbands);

    this.recordTransaction({
      type: 'payment',
      amountMinor,
      currency: wb.currency,
      description: `POS Tap Payment at ${vendorName} [${wb.uid}] - ${wb.attendeeName}`,
      reference: `POS-${wb.uid}-${Date.now().toString(36).slice(-4)}`
    });

    return {
      success: true,
      wristband: { ...wb },
      message: `Approved! ${wb.currency} ${(amountMinor / 100).toFixed(2)} deducted. New balance: ${wb.currency} ${(wb.balanceMinor / 100).toFixed(2)}.`
    };
  }

  public recordTransaction(entry: {
    type?: string;
    amountMinor: number;
    currency: string;
    description: string;
    reference: string;
    organizerId?: string;
    eventId?: string;
  }): void {
    const ledgerItem: LedgerEntry = {
      id: `led-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      organizerId: entry.organizerId || 'org-afrofuture',
      eventId: entry.eventId || 'evt-afro-future-fest-2026',
      type: 'customer_clearing',
      debitMinor: entry.amountMinor,
      creditMinor: 0,
      currency: entry.currency,
      description: `${entry.description} (Ref: ${entry.reference})`,
      timestamp: new Date().toISOString()
    };
    this.ledger.unshift(ledgerItem);
    saveToStorage('ledger', this.ledger);
  }

  public clearPlatformMockData(): void {
    this.orders = [];
    this.tickets = [];
    this.ledger = [];
    this.webhookLogs = [];
    this.checkIns = [];
    this.payouts = [];
    this.refundRequests = [];
    saveToStorage('orders', this.orders);
    saveToStorage('tickets', this.tickets);
    saveToStorage('ledger', this.ledger);
    saveToStorage('webhooks', this.webhookLogs);
    saveToStorage('checkins', this.checkIns);
    saveToStorage('payouts', this.payouts);
    saveToStorage('refunds', this.refundRequests);
  }
}

export const store = new NexoraStore();


