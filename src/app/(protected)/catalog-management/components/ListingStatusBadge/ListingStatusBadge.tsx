'use client';

import { Badge } from '@merit-incentives/ui';

import { useLocalization } from '@/hooks/useLocalization';
import type {
  CatalogListingStatus,
  ListingRequestStatus,
  EcommerceOfferStatus,
} from '@/types/catalog';

import {
  ecommerceOfferLifecycleToColor,
  listingStatusBadgeListingLabel,
  listingStatusBadgeOfferLabel,
  listingStatusBadgeRequestLabel,
  listingStatusToColor,
  requestStatusToColor,
} from '../../utils/listingStatusBadgeHelpers';

interface ListingStatusBadgeProps {
  readonly kind: 'listing';
  readonly status: CatalogListingStatus;
}

interface RequestStatusBadgeProps {
  readonly kind: 'request';
  readonly status: ListingRequestStatus;
}

interface OfferStatusBadgeProps {
  readonly kind: 'offer';
  readonly status: EcommerceOfferStatus;
}

type Props =
  | ListingStatusBadgeProps
  | RequestStatusBadgeProps
  | OfferStatusBadgeProps;

export function ListingStatusBadge(props: Readonly<Props>) {
  const { translate } = useLocalization('catalog');

  if (props.kind === 'offer') {
    return (
      <Badge
        className="whitespace-nowrap"
        color={ecommerceOfferLifecycleToColor[props.status]}
        leftIcon
        size="lg"
      >
        {listingStatusBadgeOfferLabel(props.status, translate)}
      </Badge>
    );
  }

  if (props.kind === 'listing') {
    return (
      <Badge
        className="whitespace-nowrap"
        color={listingStatusToColor[props.status]}
        leftIcon
        size="lg"
      >
        {listingStatusBadgeListingLabel(props.status, translate)}
      </Badge>
    );
  }

  return (
    <Badge
      className="whitespace-nowrap"
      color={requestStatusToColor[props.status]}
      leftIcon
      size="lg"
    >
      {listingStatusBadgeRequestLabel(props.status, translate)}
    </Badge>
  );
}
