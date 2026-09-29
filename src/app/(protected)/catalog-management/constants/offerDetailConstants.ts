import type { EcommerceOfferStatus } from '@/types/catalog';

export const OFFER_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const OFFER_DETAIL_INLINE_STATUSES = [
  'ACTIVE',
  'INACTIVE',
  'EXPIRED',
] as const satisfies readonly EcommerceOfferStatus[];

/** Scrollable product description on catalog detail pages (≈8 lines). */
export const DESCRIPTION_SCROLL_AREA_CLASS =
  'mt-1 max-h-48 overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words text-base leading-relaxed text-mds-black-800 scrollbar-thin scrollbar-thumb-mds-black-200 scrollbar-track-transparent';
