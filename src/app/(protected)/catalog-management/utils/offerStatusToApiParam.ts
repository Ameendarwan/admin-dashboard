import type { EcommerceOfferStatus } from '@/types/catalog';

const ECOMMERCE_OFFER_FILTERS = new Set<EcommerceOfferStatus>([
  'ACTIVE',
  'INACTIVE',
  'EXPIRED',
]);

/**
 * Toolbar value (`all` → no API filter). Must match ecommerce `OfferStatus` only.
 */
export function offerStatusToApiParam(
  ui: string,
): EcommerceOfferStatus | undefined {
  const v = ui.trim().toUpperCase();
  if (v === '' || v === 'ALL') {
    return undefined;
  }
  if (ECOMMERCE_OFFER_FILTERS.has(v as EcommerceOfferStatus)) {
    return v as EcommerceOfferStatus;
  }
  return undefined;
}
