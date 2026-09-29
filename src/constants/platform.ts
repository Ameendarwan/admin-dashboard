/**
 * Platform identifiers used with Identity and related APIs
 * (`platformName` body fields, `x-platform-name` headers, query params).
 * Add other shared platform-related constants here as needed.
 */
export const PLATFORM_NAME = {
  ADMIN_DASHBOARD: 'admin-dashboard',
  SELLER_PORTAL: 'seller-portal',
  LMS: 'lms',
  INNOVATION: 'innovation',
  SUPER_PLATFORM: 'super-platform',
  TRAVELX: 'travelx',
  MERIT_TRAVEL_HUB: 'Merit Travel Hub',
  POINTS_EXCHANGE_PARTNERSHIP: 'points-exchange-partnership',
  B2C_APP: 'b2c-app',
  STOREFRONT: 'storefront',
  PAYMENT_GATEWAY: 'payment-gateway',
  REWARDS_PORTAL: 'rewards-portal',
  WALLETS: 'wallets',
} as const;

export type PlatformName = (typeof PLATFORM_NAME)[keyof typeof PLATFORM_NAME];

/** Default platform for LiveOps / admin portal Identity calls */
export const DEFAULT_PLATFORM_NAME = PLATFORM_NAME.ADMIN_DASHBOARD;

/**
 * Display labels for product / platform codes (no i18n).
 * Keys accept underscore form; normalize hyphens → underscores before lookup.
 */
export const PRODUCT_LABELS: Record<string, string> = {
  storefront: 'Storefront',
  innovation: 'Innovation',
  travelx: 'TravelX',
  rewards_portal: 'Rewards Portal',
  points_exchange: 'Points Exchange',
  lms: 'LMS',
};

/** Resolve a product/platform slug (`rewards-portal` or `rewards_portal`) to its display label. */
export function getProductLabel(code: string | null | undefined): string {
  const trimmed = code?.trim();
  if (!trimmed) {
    return '';
  }
  const normalized = trimmed.replaceAll('-', '_');
  return PRODUCT_LABELS[normalized] ?? trimmed;
}
