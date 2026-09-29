'use client';

import { Badge } from '@merit-incentives/ui';
import { ExternalLink } from 'lucide-react';
import { useMemo } from 'react';

import {
  formatStorefrontFloatBalance,
  formatStorefrontPublicHost,
} from '@/lib/storefrontUtils';
import { StorefrontStatusMenu } from '@/components/storefront/StorefrontStatusMenu';
import { StorefrontSetupChecklistProgress } from '@/components/storefront/StorefrontSetupChecklistProgress';
import type { StorefrontListRow } from '@/types/storefront';

import { StorefrontListStatusBadge } from '../components/StorefrontListStatusBadge';

const EMPTY_CELL = '—';

export function useStorefrontsTableColumns(
  translate: (key: string, values?: Record<string, string | number>) => string,
  onOpenStorefront: (row: StorefrontListRow) => void,
) {
  return useMemo(
    () => [
      {
        key: 'storefront' as const,
        label: translate('table.storefront'),
        render: (row: StorefrontListRow) => (
          <div className="min-w-0">
            <p className="truncate font-semibold text-mds-black-900">
              {row.storefrontName}
            </p>
            <p className="mt-0.5 truncate text-sm text-mds-black-500">
              {formatStorefrontPublicHost(row.urlSlug)}
            </p>
          </div>
        ),
        showOnMobile: true,
      },
      {
        key: 'tenantBusiness' as const,
        label: translate('table.tenantBusiness'),
        render: (row: StorefrontListRow) => (
          <span className="text-mds-black-900">{row.tenantName}</span>
        ),
        showOnMobile: true,
      },
      {
        key: 'tier' as const,
        label: translate('table.tier'),
        render: () => (
          <Badge color="primary" size="lg">
            {translate('tier.medium')}
          </Badge>
        ),
        showOnMobile: true,
      },
      {
        key: 'status' as const,
        label: translate('table.status'),
        render: (row: StorefrontListRow) => (
          <StorefrontListStatusBadge status={row.status} />
        ),
        showOnMobile: true,
      },
      {
        key: 'setupChecklist' as const,
        label: translate('table.setupChecklist'),
        render: (row: StorefrontListRow) => (
          <StorefrontSetupChecklistProgress
            completedCount={row.completedSetupSteps}
            requiredCount={row.requiredSetupSteps}
            formatProgress={({ completed, required }) =>
              translate('setupChecklist.completedOfRequired', {
                completed,
                required,
              })
            }
          />
        ),
      },
      {
        key: 'storeAdmin' as const,
        label: translate('table.storeAdmin'),
        render: (row: StorefrontListRow) => (
          <div className="min-w-0">
            <p className="truncate font-semibold text-mds-black-900">
              {row.storeAdminName ?? EMPTY_CELL}
            </p>
            <p className="mt-0.5 truncate text-sm text-mds-black-500">
              {row.storeAdminEmail ?? EMPTY_CELL}
            </p>
          </div>
        ),
      },
      {
        key: 'floatBalance' as const,
        label: translate('table.floatBalance'),
        render: (row: StorefrontListRow) => (
          <span className="tabular-nums text-mds-black-900">
            {formatStorefrontFloatBalance(row.currency, row.floatBalance)}
          </span>
        ),
      },
      {
        key: 'actions' as const,
        label: translate('table.actions'),
        align: 'center' as const,
        showOnMobile: true,
        render: (row: StorefrontListRow) => {
          const canOpen = row.status === 'live';

          return (
            <div className="flex items-center justify-center gap-1">
              <button
                type="button"
                disabled={!canOpen}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-mds-primary-700 transition-colors enabled:hover:bg-mds-primary-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={translate('actions.openStorefront')}
                onClick={(event) => {
                  event.stopPropagation();
                  if (canOpen) {
                    onOpenStorefront(row);
                  }
                }}
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
              </button>
              <StorefrontStatusMenu
                storefrontId={row.id}
                tenantId={row.tenantId}
                status={row.status}
                setupConfig={row.setupConfig}
                tableId={`storefronts-global-table-${row.id}`}
              />
            </div>
          );
        },
      },
    ],
    [translate, onOpenStorefront],
  );
}
