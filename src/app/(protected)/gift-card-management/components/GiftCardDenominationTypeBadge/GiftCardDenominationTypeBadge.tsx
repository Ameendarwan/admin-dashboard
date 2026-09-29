'use client';

import { Badge } from '@merit-incentives/ui';

import { useLocalization } from '@/hooks/useLocalization';
import type { GiftCardRow } from '@/types/catalog';

const denominationBadgeColor: Record<
  GiftCardRow['denominationType'],
  'electricBlue' | 'success'
> = {
  open: 'electricBlue',
  fixed: 'success',
};

interface GiftCardDenominationTypeBadgeProps {
  denominationType: GiftCardRow['denominationType'];
}

export function GiftCardDenominationTypeBadge({
  denominationType,
}: Readonly<GiftCardDenominationTypeBadgeProps>) {
  const { translate } = useLocalization('catalog');

  return (
    <Badge
      className="whitespace-nowrap"
      color={denominationBadgeColor[denominationType]}
      size="lg"
    >
      {translate(`giftCardManagement.denominationType.${denominationType}`)}
    </Badge>
  );
}
