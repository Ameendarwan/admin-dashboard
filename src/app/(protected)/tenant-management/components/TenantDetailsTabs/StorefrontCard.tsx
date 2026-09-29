'use client';

import type { ReactNode } from 'react';
import {
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  ClipboardList,
  ShoppingCart,
} from 'lucide-react';

import { StorefrontDraftLiveBadge } from '@/components/storefront/StorefrontDraftLiveBadge';
import { StorefrontStatusMenu } from '@/components/storefront/StorefrontStatusMenu';
import {
  buildStorefrontPublicUrl,
  formatStorefrontPublicHost,
} from '@/lib/storefrontUtils';
import { readStorefrontSetupChecklistCounts } from '@/lib/storefrontSetupChecklist';
import type { StorefrontListItem } from '@/types/storefrontAdminApi';
import { parsePositiveAmount } from '@/utils/createStorefrontFormHelpers';
import { openUrlInNewTab } from '@/utils/urlUtils';

type StorefrontCardProps = Readonly<{
  storefront: StorefrontListItem;
  translate: (key: string, values?: Record<string, string | number>) => string;
}>;

function StatTile({
  icon,
  label,
  value,
}: Readonly<{
  icon: ReactNode;
  label: string;
  value: string;
}>) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-white px-4 py-3.5 sm:px-5 sm:py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mds-primary-100 text-mds-primary-700">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-mds-black-600">{label}</p>
        <p className="truncate text-base font-semibold text-mds-black-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function formatFloatBalanceDisplay(floatBalance: string): string {
  const parsed = parsePositiveAmount(floatBalance);
  if (parsed === null) {
    return '0';
  }
  return parsed.toLocaleString();
}

function readStatusLabelKey(
  status: StorefrontListItem['status'],
): 'card.statusDraft' | 'card.statusActive' | 'card.statusSuspended' {
  if (status === 'live') {
    return 'card.statusActive';
  }
  if (status === 'suspended') {
    return 'card.statusSuspended';
  }
  return 'card.statusDraft';
}

export function StorefrontCard({ storefront, translate }: StorefrontCardProps) {
  const isLive = storefront.status === 'live';
  const statusLabel = translate(readStatusLabelKey(storefront.status));
  const storefrontUrl = buildStorefrontPublicUrl(storefront.urlSlug);
  const { completedCount, requiredCount } = readStorefrontSetupChecklistCounts(
    storefront.setupConfig,
  );
  const setupChecklistProgress = translate('card.setupChecklistProgress', {
    completed: completedCount,
    required: requiredCount,
  });

  return (
    <article className="rounded-2xl bg-mds-primary-50 px-4 py-5 sm:px-8 sm:py-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-mds-black-900 sm:text-xl">
              {storefront.storeName}
            </h3>
            <StorefrontDraftLiveBadge
              status={storefront.status}
              label={statusLabel}
              size="sm"
            />
          </div>
          <p className="mt-1.5 text-sm text-mds-black-500">
            {formatStorefrontPublicHost(storefront.urlSlug)}
          </p>
        </div>
        <div className="flex w-full shrink-0 items-center justify-between gap-2 sm:w-auto sm:justify-end">
          <button
            type="button"
            disabled={!isLive}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-mds-primary-700 transition-colors enabled:hover:bg-mds-primary-100/60 enabled:hover:text-mds-primary-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:justify-start sm:py-0 sm:enabled:hover:bg-transparent"
            onClick={() => {
              if (isLive && storefrontUrl) {
                openUrlInNewTab(storefrontUrl);
              }
            }}
          >
            {translate('card.goToStorefront')}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </button>
          <StorefrontStatusMenu
            storefrontId={storefront.id}
            tenantId={storefront.tenantId}
            status={storefront.status}
            setupConfig={storefront.setupConfig}
            tableId={`storefront-card-${storefront.id}`}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        <StatTile
          icon={<Banknote className="h-5 w-5" strokeWidth={1.75} />}
          label={translate('card.floatBalance')}
          value={formatFloatBalanceDisplay(storefront.floatBalance)}
        />
        <StatTile
          icon={<ShoppingCart className="h-5 w-5" strokeWidth={1.75} />}
          label={translate('card.totalOrders')}
          value={storefront.totalOrders.toLocaleString()}
        />
        <StatTile
          icon={<BadgeCheck className="h-5 w-5" strokeWidth={1.75} />}
          label={translate('card.ordersFulfilled')}
          value={storefront.ordersFulfilled.toLocaleString()}
        />
        <StatTile
          icon={<ClipboardList className="h-5 w-5" strokeWidth={1.75} />}
          label={translate('card.setupChecklist')}
          value={setupChecklistProgress}
        />
      </div>
    </article>
  );
}
