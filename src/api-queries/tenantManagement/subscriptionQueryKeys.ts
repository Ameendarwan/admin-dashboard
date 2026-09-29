export const subscriptionQueryKeys = {
  all: ['tenant-subscriptions'] as const,
  list: (tenantId: string) => [...subscriptionQueryKeys.all, tenantId] as const,
  subscribableProducts: ['subscribable-products'] as const,
};
