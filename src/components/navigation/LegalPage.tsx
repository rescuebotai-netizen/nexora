import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  type: 'terms' | 'privacy' | 'security';
  onBack: () => void;
  theme?: 'light' | 'dark';
}

export const LegalPage: React.FC<LegalPageProps> = ({ type, onBack, theme = 'dark' }) => {
  const isDark = theme === 'dark';

  const contentMap = {
    terms: {
      title: 'Terms of Service',
      subtitle: 'Effective Date: October 2026 · NEXORA Pan-African Event Commerce Platform',
      sections: [
        {
          heading: '1. Introduction and Agreement',
          body: `Welcome to NEXORA. These Terms of Service constitute a legally binding agreement between you and NEXORA governing your access to and use of our event discovery marketplace, ticketing infrastructure, organizer consoles, mobile validation apps, and payment processing rails. By registering an account, purchasing an admission pass, or listing an event on NEXORA, you expressly agree to these terms in full.`
        },
        {
          heading: '2. User Accounts and Verification',
          body: `To access event creation tools or store digital tickets, you must create a verified account. You agree to provide accurate, truthful, and updated contact information. You are solely responsible for maintaining the confidentiality of your credentials. Any activity conducted under your account is your legal responsibility. NEXORA reserves the right to suspend or terminate accounts that breach platform integrity.`
        },
        {
          heading: '3. Ticket Purchases and Issuance',
          body: `All tickets purchased via NEXORA are issued as cryptographically signed digital tokens with unique verifiable barcodes. Tickets are valid solely for the designated event, session, date, and tier specified during checkout. Prices are displayed in the specified regional currency (ZAR, KES, NGN, GHS, RWF, or USD) and include applicable booking fees and platform service levies.`
        },
        {
          heading: '4. Refund and Cancellation Policy',
          body: `Refund policies are defined per event by the accredited event organizer and clearly stated prior to ticket selection. In the event of event cancellation or indefinite postponement by an organizer, purchasers are entitled to a full refund of face-value ticket amounts processed back to the original payment method through our double-entry clearing system.`
        },
        {
          heading: '5. Organizer Responsibilities and Conduct',
          body: `Organizers using NEXORA warrant that they possess all required legal permits, venue licenses, intellectual property clearances, and local governmental approvals to execute scheduled experiences. Organizers must honor all valid passes presented at gate check-in and comply with anti-fraud guidelines.`
        },
        {
          heading: '6. Limitation of Liability',
          body: `NEXORA acts as an authoritative technological intermediary and ticketing software provider. Except where prohibited by regional law, NEXORA shall not be liable for indirect, incidental, punitive, or consequential damages arising from event scheduling alterations, venue conditions, or force majeure occurrences.`
        }
      ]
    },
    privacy: {
      title: 'Privacy Policy',
      subtitle: 'Last Updated: October 2026 · Data Protection and Regional Compliance Standards',
      sections: [
        {
          heading: '1. Information We Collect',
          body: `We collect essential data required to facilitate ticket issuance, gate validation, fraud prevention, and customer support. This includes personal identifiers (full name, email address, phone number), transaction identifiers, regional preference settings, and gate check-in timestamps. We do not store raw payment card data on our servers; card operations are tokenized directly with PCI-DSS compliant regional gateways.`
        },
        {
          heading: '2. How We Utilize Your Data',
          body: `Your information is utilized solely to: generate secure tamper-proof admission passes; deliver transactional order confirmations and event change bulletins; credit referral points and applied discounts; enable organizers to manage attendee manifests; and audit financial clearing ledgers for fraud prevention.`
        },
        {
          heading: '3. Data Sharing and Organizer Access',
          body: `When you purchase a ticket for an experience, the designated verified organizer receives attendee details (name, email, tier selected) strictly for event administration and door management. Organizers are bound by confidentiality obligations and cannot sell attendee manifests to external marketing networks.`
        },
        {
          heading: '4. Pan-African and Global Privacy Protections',
          body: `NEXORA complies with the Protection of Personal Information Act (POPIA) in South Africa, the Nigeria Data Protection Act (NDPA), the Kenya Data Protection Act, and international standards including GDPR. Attendees have full statutory rights to access, rectify, download, or request the deletion of their personal profiles at any time.`
        },
        {
          heading: '5. Retention and Security Standards',
          body: `Account information is retained while your account remains active. Transactional records and cryptographic double-entry ledger audits are retained for the statutory duration required by regional financial regulations before secure archival.`
        }
      ]
    },
    security: {
      title: 'Security Architecture',
      subtitle: 'Technical Whitepaper · Cryptographic Passports, Resilient Infrastructure & Zero-Trust Governance',
      sections: [
        {
          heading: '1. Cryptographic Admission Passports',
          body: `Every ticket generated by NEXORA incorporates a digitally signed hash generated using high-entropy secret salts and asymmetric keys. The gate validation scanner validates token authenticity, preventing barcode cloning, pass-backs, and screenshot duplication with sub-second response times.`
        },
        {
          heading: '2. Double-Entry Authoritative Ledger',
          body: `NEXORA implements a strict double-entry accounting ledger for all financial movements across Africa. Every ticket reservation, merchant fee calculation, refund execution, and payout batch creates immutable matching debits and credits, eliminating reconciliation drift and unauthorized balance modifications.`
        },
        {
          heading: '3. Payment Rail Isolation and PCI-DSS',
          body: `All credit card, mobile money (M-Pesa), and instant EFT integrations run via dedicated tokenized endpoints. NEXORA operates under PCI-DSS Level 1 compliant standards, ensuring sensitive cardholder numbers never touch unencrypted storage.`
        },
        {
          heading: '4. Zero-Trust Access Control (RBAC)',
          body: `Platform infrastructure enforces strict role-based access control. Staff scanner devices operate with limited operational tokens valid only during door hours. Administrative consoles require multi-step verification and record tamper-evident audit logs for every system action.`
        },
        {
          heading: '5. Resilient Distributed Edge Infrastructure',
          body: `NEXORA runs across geo-redundant African and global cloud clusters with automated failover. Gate scanners maintain encrypted offline verification caches, ensuring uninterrupted attendee admittance even during temporary venue network outages.`
        }
      ]
    }
  };

  const activeContent = contentMap[type];

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      <div className="w-full max-w-7xl mx-auto space-y-10">
        
        {/* Navigation Back Header */}
        <div className="flex items-center justify-between">
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
            NEXORA Official Documentation
          </span>
        </div>

        {/* Page Title & Header */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {activeContent.title}
          </h1>
          <p className="text-sm font-mono opacity-60">
            {activeContent.subtitle}
          </p>
        </div>

        {/* Sections Content */}
        <div className="space-y-8 leading-relaxed">
          {activeContent.sections.map((section, idx) => (
            <div 
              key={idx} 
              className={`p-6 sm:p-8 rounded-2xl ${
                isDark ? 'bg-[#0B0B0D]' : 'bg-neutral-50'
              }`}
            >
              <h2 className="text-lg sm:text-xl font-bold mb-3 tracking-tight">
                {section.heading}
              </h2>
              <p className="text-sm sm:text-base opacity-80 leading-relaxed font-sans">
                {section.body}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Back Button */}
        <div className="pt-6">
          <button
            onClick={onBack}
            className={`w-full py-4 font-bold text-sm rounded-xl cursor-pointer transition-all ${
              isDark 
                ? 'bg-white text-black hover:bg-neutral-200' 
                : 'bg-black text-white hover:bg-neutral-800'
            }`}
          >
            Return to Marketplace
          </button>
        </div>

      </div>
    </div>
  );
};
