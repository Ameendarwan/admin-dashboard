import { useQuery } from '@tanstack/react-query';

import { fetchTenantPlatforms } from '@/services/tenantManagementService';
import type { Platform } from '@/types/tenantManagement';

export const useTenantPlatforms = (tenantId: string) => {
  return useQuery({
    queryKey: ['tenant-platforms', tenantId],
    queryFn: () => fetchTenantPlatforms(tenantId),
    enabled: !!tenantId,
    gcTime: 10 * 60 * 1000,
    select: (response: Platform[]) => response || [],
  });
};
