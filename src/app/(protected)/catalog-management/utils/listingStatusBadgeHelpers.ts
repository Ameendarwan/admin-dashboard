import type { BadgeColor } from '@merit-incentives/ui';

import type {
  CatalogListingStatus,
  ListingRequestStatus,
  EcommerceOfferStatus,
} from '@/types/catalog';

export const listingStatusToColor: Record<CatalogListingStatus, BadgeColor> = {
  active: 'success',
  draft: 'gray',
  archived: 'error',
};

export const requestStatusToColor: Record<ListingRequestStatus, BadgeColor> = {
  pending_review: 'warning',
  approved: 'success',
  rejected: 'error',
};

export const matchResultToColor: Record<
  'match_found' | 'possible_match' | 'no_match_found',
  BadgeColor
> = {
  match_found: 'success',
  possible_match: 'warning',
  no_match_found: 'gray',
};

export function listingRequestMatchResultLabel(
  result: 'match_found' | 'possible_match' | 'no_match_found',
  translate: (k: string) => string,
) {
  if (result === 'match_found') {
    return translate('matchResult.matchFound');
  }
  if (result === 'possible_match') {
    return translate('matchResult.possibleMatch');
  }
  return translate('matchResult.noMatchFound');
}

export const ecommerceOfferLifecycleToColor: Record<
  EcommerceOfferStatus,
  BadgeColor
> = {
  ACTIVE: 'success',
  INACTIVE: 'gray',
  EXPIRED: 'warning',
};

/** catalog namespace: `offerLifecycle.active` etc. (lowercase leaves, same style as `status.active`). */
export function catalogOfferLifecycleMessageKey(
  status: EcommerceOfferStatus,
):
  | 'offerLifecycle.active'
  | 'offerLifecycle.inactive'
  | 'offerLifecycle.expired' {
  switch (status) {
    case 'ACTIVE':
      return 'offerLifecycle.active';
    case 'INACTIVE':
      return 'offerLifecycle.inactive';
    case 'EXPIRED':
      return 'offerLifecycle.expired';
  }
}

export function listingStatusBadgeListingLabel(
  status: CatalogListingStatus,
  translate: (k: string) => string,
) {
  if (status === 'active') {
    return translate('status.active');
  }
  if (status === 'draft') {
    return translate('status.draft');
  }
  return translate('status.archived');
}

export function listingStatusBadgeRequestLabel(
  status: ListingRequestStatus,
  translate: (k: string) => string,
) {
  if (status === 'pending_review') {
    return translate('status.pendingReview');
  }
  if (status === 'approved') {
    return translate('status.approved');
  }
  return translate('status.rejected');
}

/** Labels for ecommerce offer lifecycle badges (toolbar uses same keys). */
export function listingStatusBadgeOfferLabel(
  status: EcommerceOfferStatus,
  translate: (k: string) => string,
) {
  return translate(catalogOfferLifecycleMessageKey(status));
}
