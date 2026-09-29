/** Listing-requests tab URL keys. */
export const CATALOG_LR_FILTER = {
  search: 'lrQ',
  seller: 'lrSeller',
  status: 'lrStatus',
  match: 'lrMatch',
  category: 'lrCat',
  subcategory: 'lrSub',
  sort: 'lrSort',
} as const;

/** Active listings tab URL keys. */
export const CATALOG_AL_FILTER = {
  search: 'alQ',
  status: 'alStatus',
  category: 'alCat',
  subcategory: 'alSub',
  brand: 'alBrand',
  type: 'alType',
  sort: 'alSort',
} as const;

/** Offers tab URL keys. */
export const CATALOG_OF_FILTER = {
  search: 'ofQ',
  seller: 'ofSeller',
  status: 'ofStatus',
  category: 'ofCat',
  subcategory: 'ofSub',
} as const;

export const CATALOG_FILTER_URL_KEYS = [
  ...Object.values(CATALOG_LR_FILTER),
  ...Object.values(CATALOG_AL_FILTER),
  ...Object.values(CATALOG_OF_FILTER),
] as const;

export const LISTING_REQUEST_STATUS_FILTERS = [
  'under_review',
  'live',
  'rejected',
] as const;

export const LISTING_REQUEST_MATCH_FILTERS = [
  'match_found',
  'possible_match',
  'no_match_found',
] as const;

export type ListingRequestStatusFilter =
  (typeof LISTING_REQUEST_STATUS_FILTERS)[number];
export type ListingRequestMatchFilter =
  (typeof LISTING_REQUEST_MATCH_FILTERS)[number];

export const CATALOG_AL_STATUS_FILTERS = [
  'active',
  'draft',
  'archived',
] as const;

export const CATALOG_AL_TYPE_FILTERS = ['merchandise', 'giftcard'] as const;

export const CATALOG_OF_STATUS_FILTERS = [
  'ACTIVE',
  'INACTIVE',
  'EXPIRED',
] as const;

export type CatalogActiveListingStatusFilter =
  (typeof CATALOG_AL_STATUS_FILTERS)[number];
export type CatalogActiveListingTypeFilter =
  (typeof CATALOG_AL_TYPE_FILTERS)[number];
export type CatalogOfferStatusFilter =
  (typeof CATALOG_OF_STATUS_FILTERS)[number];

export const CATALOG_CREATED_AT_SORT_ORDERS = ['asc', 'desc'] as const;
export type CatalogCreatedAtSortOrder =
  (typeof CATALOG_CREATED_AT_SORT_ORDERS)[number];
export const DEFAULT_CREATED_AT_SORT: CatalogCreatedAtSortOrder = 'desc';

export function toggleCreatedAtSort(
  current: CatalogCreatedAtSortOrder,
): CatalogCreatedAtSortOrder {
  return current === 'desc' ? 'asc' : 'desc';
}

/** Keep default (newest first) out of the URL. */
export function createdAtSortUrlValue(
  next: CatalogCreatedAtSortOrder,
): string | undefined {
  return next === DEFAULT_CREATED_AT_SORT ? undefined : next;
}
