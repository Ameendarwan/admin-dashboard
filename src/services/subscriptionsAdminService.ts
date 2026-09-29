import { adminApiClient } from '@/lib/apiClient';
import type {
  CreatePaidSubscriptionBody,
  ListTenantSubscriptionsParams,
  SubscribableProduct,
  TenantSubscription,
} from '@/types/subscriptionsAdminApi';

/** Admin-be proxies to merit-payment-service subscription APIs. */
const tenantSubscriptionsPath = (tenantId: string) =>
  `/tenants/${encodeURIComponent(tenantId)}/subscriptions`;

const adminPaidSubscriptionPath = (tenantId: string) =>
  `/admin/tenants/${encodeURIComponent(tenantId)}/subscriptions`;

export async function listSubscribableProducts(): Promise<
  SubscribableProduct[]
> {
  const { data } = await adminApiClient.get<SubscribableProduct[]>(
    '/subscribable-products',
  );
  return Array.isArray(data) ? data : [];
}

export async function listTenantSubscriptions(
  tenantId: string,
  params?: ListTenantSubscriptionsParams,
): Promise<TenantSubscription[]> {
  const { data } = await adminApiClient.get<TenantSubscription[]>(
    tenantSubscriptionsPath(tenantId),
    { params },
  );
  return Array.isArray(data) ? data : [];
}

export async function createPaidSubscription(
  tenantId: string,
  body: CreatePaidSubscriptionBody,
): Promise<TenantSubscription> {
  const { data } = await adminApiClient.post<TenantSubscription>(
    adminPaidSubscriptionPath(tenantId),
    body,
  );
  return data;
}
