import { useQuery } from '@tanstack/react-query';

import { listTenantSubscriptions } from '@/services/subscriptionsAdminService';
import type { ListTenantSubscriptionsParams } from '@/types/subscriptionsAdminApi';
import { TIME_5_MIN } from '@/utils/timeUtils';

import { subscriptionQueryKeys } from './subscriptionQueryKeys';

export function useTenantSubscriptions(
  tenantId: string,
  params?: ListTenantSubscriptionsParams,
) {
  return useQuery({
    queryKey: [...subscriptionQueryKeys.list(tenantId), params ?? {}],
    queryFn: () => listTenantSubscriptions(tenantId, params),
    enabled: Boolean(tenantId),
    staleTime: TIME_5_MIN,
    gcTime: TIME_5_MIN,
  });
}
