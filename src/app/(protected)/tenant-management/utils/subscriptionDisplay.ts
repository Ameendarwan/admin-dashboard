import type {
  SubscribableProduct,
  TenantSubscription,
} from '@/types/subscriptionsAdminApi';

import { formatSubscriptionDisplayDate } from '../components/AddPaidSubscriptionDialog/addPaidSubscriptionForm';
import {
  formatSubscriptionProductDisplayName,
  resolveSubscriptionProductName,
} from './subscriptionProductResolver';

export type TenantSubscriptionCardDisplay = {
  title: string;
  isActive: boolean;
  isFreeTrial: boolean;
  trialDays?: number;
  subscriptionStart: string;
  subscriptionEnd: string;
  agreedPrice: string;
  billingFrequency: string;
};

function isAdminFreeTrialSubscription(
  subscription: TenantSubscription,
): boolean {
  const metadata = subscription.metadata;
  const trialDays = metadata?.trialDays;
  if (typeof trialDays === 'number' && trialDays >= 1) {
    return true;
  }
  return Boolean(subscription.trialEndsAt);
}

function readMetadataString(
  metadata: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const value = metadata?.[key];
  return typeof value === 'string' ? value : undefined;
}

function formatAgreedPrice(
  subscription: TenantSubscription,
  isFreeTrial: boolean,
): string {
  if (isFreeTrial) {
    return '';
  }

  const metadata = subscription.metadata;
  const currency = readMetadataString(metadata, 'agreedCurrency') ?? 'SAR';
  const agreedAmount = metadata?.agreedAmount;
  if (typeof agreedAmount === 'number' && Number.isFinite(agreedAmount)) {
    return `${agreedAmount.toLocaleString()} ${currency}`;
  }
  if (typeof agreedAmount === 'string' && agreedAmount.trim()) {
    return `${agreedAmount} ${currency}`;
  }
  return '—';
}

function formatBillingFrequency(subscription: TenantSubscription): string {
  const metadata = subscription.metadata;
  const interval =
    readMetadataString(metadata, 'billingInterval') ??
    readMetadataString(metadata, 'billingFrequency');

  if (interval === 'yearly') {
    return 'Yearly';
  }
  if (interval === 'monthly') {
    return 'Monthly';
  }
  if (interval === 'months') {
    const months = metadata?.billingMonths ?? metadata?.customFrequencyValue;
    if (typeof months === 'number' && months >= 1) {
      return `Every ${months} months`;
    }
    return 'Monthly';
  }
  if (interval === 'custom') {
    const value = metadata?.customFrequencyValue;
    const unit = readMetadataString(metadata, 'customFrequencyUnit');
    if (typeof value === 'number' && unit === 'months') {
      return `Every ${value} months`;
    }
    if (typeof value === 'number' && unit) {
      return `Every ${value} ${unit}`;
    }
    return 'Custom';
  }

  const tierType = readMetadataString(metadata, 'productTierType');
  if (tierType?.includes('yearly')) {
    return 'Yearly';
  }
  if (tierType?.includes('monthly')) {
    return 'Monthly';
  }

  return interval ?? subscription.productTier?.type ?? '—';
}

function resolveSubscriptionTitle(
  subscription: TenantSubscription,
  options?: {
    subscribableProducts?: SubscribableProduct[];
    productLabel?: string;
  },
): string {
  if (options?.productLabel?.trim()) {
    return options.productLabel;
  }

  const catalogProduct = options?.subscribableProducts?.find(
    (product) => product.id === subscription.productId,
  );

  const rawName =
    catalogProduct?.name?.trim() ||
    subscription.product?.name?.trim() ||
    resolveSubscriptionProductName(
      subscription,
      options?.subscribableProducts ?? [],
    );

  if (rawName) {
    return formatSubscriptionProductDisplayName(rawName);
  }

  return '—';
}

export function getTenantSubscriptionCardDisplay(
  subscription: TenantSubscription,
  options?: {
    subscribableProducts?: SubscribableProduct[];
    productLabel?: string;
  },
): TenantSubscriptionCardDisplay {
  const isFreeTrial = isAdminFreeTrialSubscription(subscription);
  const metadata = subscription.metadata;
  const trialDays =
    typeof metadata?.trialDays === 'number' && metadata.trialDays >= 1
      ? metadata.trialDays
      : undefined;

  const startRaw = subscription.startAt;
  const endRaw = subscription.endsAt ?? subscription.trialEndsAt;

  return {
    title: resolveSubscriptionTitle(subscription, options),
    isActive: subscription.status === 'active',
    isFreeTrial,
    trialDays,
    subscriptionStart: formatSubscriptionDisplayDate(startRaw.slice(0, 10)),
    subscriptionEnd: endRaw
      ? formatSubscriptionDisplayDate(endRaw.slice(0, 10))
      : '—',
    agreedPrice: formatAgreedPrice(subscription, isFreeTrial),
    billingFrequency: formatBillingFrequency(subscription),
  };
}
