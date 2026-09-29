'use client';

import { CalendarDays, Clock, SaudiRiyal } from 'lucide-react';
import { useMemo } from 'react';

import { useLocalization } from '@/hooks';
import type {
  SubscribableProduct,
  TenantSubscription,
} from '@/types/subscriptionsAdminApi';

import { getTenantSubscriptionCardDisplay } from '../../utils/subscriptionDisplay';
import {
  isStorefrontSubscriptionProductName,
  resolveSubscriptionProductName,
} from '../../utils/subscriptionProductResolver';
import { StorefrontSubscriptionCardMenu } from './StorefrontSubscriptionCardMenu';
import { SubscriptionDetailCard } from './SubscriptionDetailCard';

type TenantSubscriptionCardProps = {
  subscription: TenantSubscription;
  subscribableProducts?: SubscribableProduct[];
  tenantId: string;
  tenantName: string;
  onViewStorefronts: () => void;
};

export function TenantSubscriptionCard({
  subscription,
  subscribableProducts = [],
  tenantId,
  tenantName,
  onViewStorefronts,
}: Readonly<TenantSubscriptionCardProps>) {
  const { translate } = useLocalization('tenant-details');

  const details = getTenantSubscriptionCardDisplay(subscription, {
    subscribableProducts,
  });

  const isStorefrontSubscription = useMemo(() => {
    const productName = resolveSubscriptionProductName(
      subscription,
      subscribableProducts,
    );
    return isStorefrontSubscriptionProductName(productName);
  }, [subscription, subscribableProducts]);

  return (
    <div className="rounded-xl border border-mds-black-100 bg-white p-mds-lg shadow-sm md:p-mds-xl">
      <div className="flex min-w-0 items-start justify-between gap-mds-sm">
        <div className="flex min-w-0 flex-wrap items-center gap-mds-sm">
          <span className="text-base font-semibold text-mds-black-900">
            {details.title}
          </span>
          <span
            className={
              details.isActive
                ? 'inline-flex items-center rounded-full bg-emerald-50 px-mds-md py-mds-2xs text-xs font-medium text-emerald-700'
                : 'inline-flex items-center rounded-full bg-red-50 px-mds-md py-mds-2xs text-xs font-medium text-red-700'
            }
          >
            {details.isActive
              ? translate('subscriptions.statusActive')
              : translate('subscriptions.statusInactive')}
          </span>
        </div>
        {isStorefrontSubscription ? (
          <StorefrontSubscriptionCardMenu
            tenantId={tenantId}
            tenantName={tenantName}
            onViewStorefronts={onViewStorefronts}
          />
        ) : null}
      </div>

      <div className="mt-mds-lg grid grid-cols-1 gap-mds-md md:grid-cols-3">
        <SubscriptionDetailCard
          icon={<CalendarDays className="h-4 w-4 text-mds-primary-600" />}
          label={translate('subscriptions.subscriptionPeriodLabel')}
        >
          {details.subscriptionStart} – {details.subscriptionEnd}
        </SubscriptionDetailCard>
        <SubscriptionDetailCard
          icon={<SaudiRiyal className="h-4 w-4 text-mds-primary-600" />}
          label={
            details.isFreeTrial
              ? translate('subscriptions.trialLabel')
              : translate('subscriptions.agreedPrice')
          }
        >
          {details.isFreeTrial
            ? translate('subscriptions.freeTrialPrice', {
                days: details.trialDays ?? '—',
              })
            : details.agreedPrice}
        </SubscriptionDetailCard>
        <SubscriptionDetailCard
          icon={<Clock className="h-4 w-4 text-mds-primary-600" />}
          label={translate('subscriptions.billingFrequency')}
        >
          {details.billingFrequency}
        </SubscriptionDetailCard>
      </div>
    </div>
  );
}
