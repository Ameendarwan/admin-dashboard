'use client';

import { StorefrontDraftLiveBadge } from '@/components/storefront/StorefrontDraftLiveBadge';
import { useLocalization } from '@/hooks/useLocalization';
import type { StorefrontListStatus } from '@/types/storefront';

type StorefrontListStatusBadgeProps = Readonly<{
  status: StorefrontListStatus;
}>;

export function StorefrontListStatusBadge({
  status,
}: StorefrontListStatusBadgeProps) {
  const { translate } = useLocalization('storefronts');

  return (
    <StorefrontDraftLiveBadge
      status={status}
      label={translate(`status.${status}`)}
    />
  );
}
