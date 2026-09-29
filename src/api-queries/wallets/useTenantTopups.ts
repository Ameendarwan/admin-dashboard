import { useQuery } from '@tanstack/react-query';

import { listTenantTopups } from '@/services/walletAdminService';
import type { ListTenantTopupsParams } from '@/types/walletAdminApi';
import { TIME_5_MIN } from '@/utils/timeUtils';

import { walletQueryKeys } from './walletQueryKeys';

export function useTenantTopups(
  tenantId: string,
  params?: ListTenantTopupsParams,
  enabled = true,
) {
  return useQuery({
    queryKey: walletQueryKeys.topups(tenantId, params),
    queryFn: () => listTenantTopups(tenantId, params),
    enabled: Boolean(tenantId) && enabled,
    staleTime: TIME_5_MIN,
    gcTime: TIME_5_MIN,
  });
}
