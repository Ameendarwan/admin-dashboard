'use client';

import { useMemo } from 'react';
import { Badge } from '@merit-incentives/ui';
import { Ban, CircleCheck } from 'lucide-react';

import { formatDateForDisplay } from '@/hooks';
import type { PendingProductionIpRowApi } from '@/types/rewards-portal/certificationApi';

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

interface UseIpWhitelistPendingTableColumnsParams {
  translate: TranslateFn;
  onApprove: (row: PendingProductionIpRowApi) => void;
  onReject: (row: PendingProductionIpRowApi) => void;
  decidingRequestId: string | null;
}

export function useIpWhitelistPendingTableColumns({
  translate,
  onApprove,
  onReject,
  decidingRequestId,
}: UseIpWhitelistPendingTableColumnsParams) {
  return useMemo(
    () => [
      {
        key: 'ipAddress' as const,
        label: translate('ipWhitelist.pending.table.ipAddress'),
        render: (row: PendingProductionIpRowApi) => (
          <span className="text-base font-medium leading-[1.4] text-mds-black-900">
            {row.ipAddress}
          </span>
        ),
        showOnMobile: true,
      },
      {
        key: 'environment' as const,
        label: translate('ipWhitelist.pending.table.environment'),
        render: (row: PendingProductionIpRowApi) => (
          <span className="text-base font-medium leading-[1.4] text-mds-black-900">
            {row.environment}
          </span>
        ),
      },
      {
        key: 'reason' as const,
        label: translate('ipWhitelist.pending.table.reason'),
        render: (row: PendingProductionIpRowApi) => (
          <span className="text-base font-medium leading-[1.4] text-mds-black-900">
            {row.reason?.trim() || '—'}
          </span>
        ),
      },
      {
        key: 'requestedOn' as const,
        label: translate('ipWhitelist.pending.table.requestedOn'),
        render: (row: PendingProductionIpRowApi) => (
          <span className="text-base font-medium leading-[1.4] text-mds-black-900">
            {formatDateForDisplay(row.requestedOn)}
          </span>
        ),
      },
      {
        key: 'status' as const,
        label: translate('ipWhitelist.pending.table.status'),
        render: () => (
          <Badge
            className="whitespace-nowrap"
            color="warning"
            leftIcon
            size="lg"
          >
            {translate('ipWhitelist.pending.status.pending')}
          </Badge>
        ),
      },
      {
        key: 'actions' as const,
        label: translate('ipWhitelist.pending.table.actions'),
        render: (row: PendingProductionIpRowApi) => {
          const isBusy = decidingRequestId === row.requestId;

          return (
            <div
              className="flex flex-wrap items-center gap-3"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              role="presentation"
            >
              <button
                type="button"
                disabled={isBusy}
                onClick={() => onReject(row)}
                className="inline-flex items-center gap-1 text-sm font-semibold text-mds-error-500 hover:text-mds-error-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Ban
                  className="h-4 w-4 shrink-0"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span>{translate('ipWhitelist.pending.actions.reject')}</span>
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => onApprove(row)}
                className="inline-flex items-center gap-1 text-sm font-semibold text-mds-primary-700 hover:text-mds-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CircleCheck
                  className="h-4 w-4 shrink-0"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span>{translate('ipWhitelist.pending.actions.approve')}</span>
              </button>
            </div>
          );
        },
      },
    ],
    [decidingRequestId, onApprove, onReject, translate],
  );
}
