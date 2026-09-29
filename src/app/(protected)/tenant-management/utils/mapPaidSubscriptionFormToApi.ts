import type {
  BillingInterval,
  CreatePaidSubscriptionBody,
  SubscribableProduct,
  TenantSubscription,
} from '@/types/subscriptionsAdminApi';

import {
  isFreeTrialSubscriptionValues,
  MAX_ENTERPRISE_TRIAL_DAYS,
  parseOptionalAgreedPrice,
  resolveSubscriptionEndDate,
  SUBSCRIPTION_CURRENCY,
  type AddPaidSubscriptionFormValues,
} from '../components/AddPaidSubscriptionDialog/addPaidSubscriptionForm';
import { filterSubscribableProductsForAdmin } from './subscriptionProductResolver';

function toIsoDateTime(date: string): string {
  return new Date(`${date}T00:00:00.000Z`).toISOString();
}

function mapBillingInterval(
  values: AddPaidSubscriptionFormValues,
): BillingInterval {
  return values.billingFrequency === 'yearly' ? 'yearly' : 'monthly';
}

/** Billing/tax country for admin-created subscriptions (Saudi-only). */
export const SUBSCRIPTION_COUNTRY_CODE = 'SA' as const;

export function resolveTenantSubscriptionEmail(
  tenantEmailFromUrl: string | undefined,
  tenantProfileEmail: string | undefined,
): string {
  const email = (tenantEmailFromUrl || tenantProfileEmail || '').trim();
  if (!email) {
    throw new Error('MISSING_TENANT_EMAIL');
  }
  return email;
}

export function resolveTenantSubscriptionUserId(
  tenantProfileUserId: string | undefined,
): string {
  const userId = (tenantProfileUserId || '').trim();
  if (!userId) {
    throw new Error('MISSING_TENANT_USER_ID');
  }
  return userId;
}

export function mapPaidSubscriptionFormToCreateBody(
  values: AddPaidSubscriptionFormValues,
  options: {
    subscriptions: TenantSubscription[];
    subscribableProducts?: SubscribableProduct[];
    tenantEmailFromUrl?: string;
    tenantProfileEmail?: string;
    tenantProfileUserId?: string;
  },
): CreatePaidSubscriptionBody {
  const email = resolveTenantSubscriptionEmail(
    options.tenantEmailFromUrl,
    options.tenantProfileEmail,
  );
  const userId = resolveTenantSubscriptionUserId(options.tenantProfileUserId);
  const catalog = options.subscribableProducts ?? [];
  const selectedProduct = filterSubscribableProductsForAdmin(catalog).find(
    (product) => product.id === values.productId,
  );
  if (!selectedProduct) {
    throw new Error('PAYMENT_PRODUCT_NOT_CONFIGURED');
  }

  const isFreeTrial = isFreeTrialSubscriptionValues(values);
  const endDate = resolveSubscriptionEndDate(values);
  const sharedMetadata = {
    source: 'merit-admin-portal',
    paymentProductName: selectedProduct.name,
    billingFrequency: values.billingFrequency,
    ...(values.billingFrequency === 'months'
      ? { billingMonths: values.billingMonths }
      : {}),
  };

  const sharedBody = {
    userId,
    productId: selectedProduct.id,
    startsAt: toIsoDateTime(values.startDate),
    endsAt: toIsoDateTime(endDate),
    currency: SUBSCRIPTION_CURRENCY,
    countryCode: SUBSCRIPTION_COUNTRY_CODE,
    email,
    billingInterval: mapBillingInterval(values),
    gracePeriod: values.gracePeriodDays,
    metadata: sharedMetadata,
  };

  if (isFreeTrial) {
    if (
      !Number.isInteger(values.trialDays) ||
      values.trialDays < 1 ||
      values.trialDays > MAX_ENTERPRISE_TRIAL_DAYS
    ) {
      throw new Error('INVALID_TRIAL_DAYS');
    }

    const optionalAmount = parseOptionalAgreedPrice(values.agreedPrice);
    if (values.agreedPrice.trim() && optionalAmount === undefined) {
      throw new Error('INVALID_AGREED_PRICE');
    }

    return {
      ...sharedBody,
      trialDays: values.trialDays,
      ...(optionalAmount !== undefined ? { amount: optionalAmount } : {}),
      metadata: {
        ...sharedMetadata,
        subscriptionKind: 'free-trial',
      },
    };
  }

  const amount = parseOptionalAgreedPrice(values.agreedPrice);
  if (amount === undefined) {
    throw new Error('INVALID_AGREED_PRICE');
  }

  return {
    ...sharedBody,
    amount,
    metadata: {
      ...sharedMetadata,
      subscriptionKind: 'paid',
    },
  };
}
