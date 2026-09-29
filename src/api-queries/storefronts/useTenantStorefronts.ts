import { useQuery } from '@tanstack/react-query';

import { listTenantStorefronts } from '@/services/storefrontAdminService';
import type { ListStorefrontsParams } from '@/types/storefrontAdminApi';
import { TIME_5_MIN } from '@/utils/timeUtils';

import { storefrontQueryKeys } from './storefrontQueryKeys';

type UseTenantStorefrontsOptions = Readonly<{
  enabled?: boolean;
  filters?: Pick<ListStorefrontsParams, 'storeName' | 'status'>;
}>;

export function useTenantStorefronts(
  tenantId: string,
  options?: UseTenantStorefrontsOptions,
) {
  const filters = options?.filters;

  return useQuery({
    queryKey: storefrontQueryKeys.tenantList(tenantId, filters),
    queryFn: () => listTenantStorefronts(tenantId, filters),
    enabled: (options?.enabled ?? true) && Boolean(tenantId),
    staleTime: TIME_5_MIN,
    gcTime: TIME_5_MIN,
  });
}
