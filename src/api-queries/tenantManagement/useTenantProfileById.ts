import { useQuery } from '@tanstack/react-query';

import { fetchTenantProfileById } from '@/services/tenantManagementService';

export const useTenantProfileById = (
  tenantProfileId: string,
  tenantId: string,
) => {
  return useQuery({
    queryKey: ['tenant-profile', tenantProfileId, tenantId],
    queryFn: () => fetchTenantProfileById(tenantProfileId, tenantId),
    enabled: !!tenantProfileId && !!tenantId,
    gcTime: 10 * 60 * 1000,
  });
};
