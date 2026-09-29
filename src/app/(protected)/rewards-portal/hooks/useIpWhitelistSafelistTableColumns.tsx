'use client';

import { useMemo } from 'react';
import { Badge } from '@merit-incentives/ui';

import { formatDateForDisplay } from '@/hooks';
import type { PendingProductionIpRowApi } from '@/types/rewards-portal/certificationApi';

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

interface UseIpWhitelistSafelistTableColumnsParams {
  translate: TranslateFn;
}

export function useIpWhitelistSafelistTableColumns({
  translate,
}: UseIpWhitelistSafelistTableColumnsParams) {
  return useMemo(
    () => [
      {
        key: 'ipAddress' as const,
        label: translate('ipWhitelist.safelist.table.ipAddress'),
        render: (row: PendingProductionIpRowApi) => (
          <span className="text-base font-medium leading-[1.4] text-mds-black-900">
            {row.ipAddress}
          </span>
        ),
        showOnMobile: true,
      },
      {
        key: 'environment' as const,
        label: translate('ipWhitelist.safelist.table.environment'),
        render: (row: PendingProductionIpRowApi) => (
          <span className="text-base font-medium leading-[1.4] text-mds-black-900">
            {row.environment}
          </span>
        ),
      },
      {
        key: 'addedOn' as const,
        label: translate('ipWhitelist.safelist.table.addedOn'),
        render: (row: PendingProductionIpRowApi) => (
          <span className="text-base font-medium leading-[1.4] text-mds-black-900">
            {formatDateForDisplay(row.requestedOn)}
          </span>
        ),
      },
      {
        key: 'status' as const,
        label: translate('ipWhitelist.safelist.table.status'),
        render: () => (
          <Badge
            className="whitespace-nowrap"
            color="success"
            leftIcon
            size="lg"
          >
            {translate('ipWhitelist.safelist.status.whitelisted')}
          </Badge>
        ),
      },
    ],
    [translate],
  );
}
