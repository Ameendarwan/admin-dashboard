'use client';

import { Badge } from '@merit-incentives/ui';

import type {
  ActivationRequestItemStatus,
  ActivationRequestStatus,
} from '@/constants/rewards-portal/activationRequestStatus';
import { useLocalization } from '@/hooks/useLocalization';
import type { GiftCardStatus } from '@/types/catalog';

const giftCardStatusColor: Record<GiftCardStatus, 'success' | 'error'> = {
  active: 'success',
  inactive: 'error',
};

const activationRequestStatusColor: Record<
  ActivationRequestStatus,
  'gray' | 'primary' | 'success' | 'error'
> = {
  PENDING: 'gray',
  PROCESSING: 'gray',
  PARTIALLY_APPROVED: 'primary',
  APPROVED: 'success',
  REJECTED: 'error',
};

const activationItemStatusColor: Record<
  ActivationRequestItemStatus,
  'gray' | 'success' | 'error'
> = {
  PENDING: 'gray',
  APPROVED: 'success',
  REJECTED: 'error',
};

interface GiftCardStatusBadgeProps {
  readonly kind: 'gift-card';
  readonly status: GiftCardStatus;
}

interface ActivationRequestStatusBadgeProps {
  readonly kind: 'activation-request';
  readonly status: ActivationRequestStatus;
}

interface ActivationItemStatusBadgeProps {
  readonly kind: 'activation-item';
  readonly status: ActivationRequestItemStatus;
}

type Props =
  | GiftCardStatusBadgeProps
  | ActivationRequestStatusBadgeProps
  | ActivationItemStatusBadgeProps;

export function GiftCardManagementStatusBadge(props: Readonly<Props>) {
  const { translate } = useLocalization('catalog');

  if (props.kind === 'gift-card') {
    return (
      <Badge
        className="whitespace-nowrap"
        color={giftCardStatusColor[props.status]}
        leftIcon
        size="lg"
      >
        {translate(`giftCardManagement.status.giftCard.${props.status}`)}
      </Badge>
    );
  }

  if (props.kind === 'activation-item') {
    return (
      <Badge
        className="whitespace-nowrap"
        color={activationItemStatusColor[props.status]}
        leftIcon
        size="lg"
      >
        {translate(`giftCardManagement.status.item.${props.status}`)}
      </Badge>
    );
  }

  return (
    <Badge
      className="whitespace-nowrap"
      color={activationRequestStatusColor[props.status]}
      leftIcon
      size="lg"
    >
      {translate(`giftCardManagement.status.request.${props.status}`)}
    </Badge>
  );
}
