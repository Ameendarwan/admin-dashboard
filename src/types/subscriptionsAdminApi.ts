export type SubscriptionStatus = 'active' | 'pending' | 'cancelled' | 'hold';

export type BillingInterval = 'monthly' | 'yearly';

/** Product available for admin subscription creation. */
export type SubscribableProduct = {
  id: string;
  name: string;
  title: string;
  description?: string;
  platformId?: string;
  isActive?: boolean;
};

/** Nested product summary on a tenant subscription. */
export type SubscribableProductSummary = {
  id: string;
  name: string;
  title: string;
  description?: string;
  platformId?: string;
};

/** Nested product tier on a tenant subscription. */
export type SubscribableProductTierSummary = {
  id: string;
  productId: string;
  type: string;
  name: string;
  description?: string;
};

/** Tenant subscription from admin-be subscription APIs. */
export type TenantSubscription = {
  id: string;
  tenantId: string;
  userId?: string;
  productId: string;
  product?: SubscribableProductSummary;
  productTierId: string;
  productTier?: SubscribableProductTierSummary;
  paymentGatewayId: string;
  paymentMethodId?: string;
  referenceId?: string;
  status: SubscriptionStatus;
  startAt: string;
  endsAt?: string;
  trialEndsAt?: string;
  gracePeriod: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type ListTenantSubscriptionsParams = {
  userId?: string;
  productId?: string;
  status?: SubscriptionStatus;
};

export type CreatePaidSubscriptionBody = {
  /** Identity user id from the tenant customer profile. */
  userId: string;
  productId: string;
  startsAt: string;
  endsAt: string;
  currency: string;
  countryCode: string;
  /** Tenant contact email (HubSpot subscription-created events). */
  email: string;
  /** Required for paid subscriptions; optional with `trialDays` (stored as agreed amount, no trial invoice). */
  amount?: number;
  billingInterval: BillingInterval;
  gracePeriod: number;
  /** When set (≥1), creates a free trial without an initial wire-transfer payment. */
  trialDays?: number;
  metadata?: Record<string, unknown>;
};
