import { useQuery } from '@tanstack/react-query';

import { fetchIdentityTenantById } from '@/services/tenantManagementService';

export const useIdentityTenant = (tenantId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ['identity-tenant', tenantId],
    queryFn: () => fetchIdentityTenantById(tenantId),
    enabled: Boolean(tenantId) && enabled,
    staleTime: 60 * 1000,
  });
};
