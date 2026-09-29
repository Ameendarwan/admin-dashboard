import { useQuery } from '@tanstack/react-query';

import { listSubscribableProducts } from '@/services/subscriptionsAdminService';

import { subscriptionQueryKeys } from './subscriptionQueryKeys';

export function useSubscribableProducts(enabled = true) {
  return useQuery({
    queryKey: subscriptionQueryKeys.subscribableProducts,
    queryFn: () => listSubscribableProducts(),
    enabled,
  });
}
