import { CountryConfig } from '../types';

export const SUPPORTED_COUNTRIES: Record<string, CountryConfig> = {
  ZA: {
    code: 'ZA',
    name: 'South Africa',
    currency: 'ZAR',
    currencySymbol: 'R',
    flag: 'ZA',
    enabled: true,
    supportedGateways: ['paystack', 'ozow', 'stripe_card'],
    defaultCommissionRate: 0.05, // 5%
  },
  KE: {
    code: 'KE',
    name: 'Kenya',
    currency: 'KES',
    currencySymbol: 'KSh',
    flag: 'KE',
    enabled: true,
    supportedGateways: ['mpesa', 'flutterwave', 'stripe_card'],
    defaultCommissionRate: 0.05,
  },
  NG: {
    code: 'NG',
    name: 'Nigeria',
    currency: 'NGN',
    currencySymbol: '₦',
    flag: 'NG',
    enabled: true,
    supportedGateways: ['paystack', 'flutterwave', 'stripe_card'],
    defaultCommissionRate: 0.05,
  },
  GH: {
    code: 'GH',
    name: 'Ghana',
    currency: 'GHS',
    currencySymbol: 'GH₵',
    flag: 'GH',
    enabled: true,
    supportedGateways: ['flutterwave', 'paystack', 'stripe_card'],
    defaultCommissionRate: 0.05,
  },
  RW: {
    code: 'RW',
    name: 'Rwanda',
    currency: 'RWF',
    currencySymbol: 'FRw',
    flag: 'RW',
    enabled: true,
    supportedGateways: ['flutterwave', 'stripe_card'],
    defaultCommissionRate: 0.05,
  },
  US: {
    code: 'US',
    name: 'Global / USD',
    currency: 'USD',
    currencySymbol: '$',
    flag: 'US',
    enabled: true,
    supportedGateways: ['stripe_card'],
    defaultCommissionRate: 0.06,
  },
};

/**
 * Formats minor units (e.g., cents) into human-readable currency with correct symbol.
 */
export function formatCurrency(amountMinor: number, currency = 'ZAR'): string {
  const isZeroDecimal = currency === 'RWF';
  const majorValue = isZeroDecimal ? amountMinor : amountMinor / 100;

  const symbolMap: Record<string, string> = {
    ZAR: 'R ',
    KES: 'KSh ',
    NGN: '₦',
    GHS: 'GH₵ ',
    RWF: 'FRw ',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };

  const symbol = symbolMap[currency] || `${currency} `;

  // Number format with localized thousands separators
  const formattedNumber = new Intl.NumberFormat('en-ZA', {
    minimumFractionDigits: isZeroDecimal ? 0 : (majorValue % 1 === 0 ? 0 : 2),
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
  }).format(majorValue);

  return `${symbol}${formattedNumber}`;
}

/**
 * Calculates platform fee (e.g. 3.5% + fixed base fee)
 */
export function calculatePlatformFee(subtotalMinor: number, commissionRate = 0.05): number {
  if (subtotalMinor <= 0) return 0;
  // 5% standard commission
  return Math.round(subtotalMinor * commissionRate);
}

/**
 * Formats ISO dates into clean editorial date format
 */
export function formatEventDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return isoDate;
  }
}

export function formatEventTime(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return '';
  }
}
