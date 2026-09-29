import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateIdentityTenant } from '@/services/tenantManagementService';
import type { UpdateIdentityTenantMutationVariables } from '@/types/tenantManagement';

export const useUpdateIdentityTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tenantId,
      payload,
    }: UpdateIdentityTenantMutationVariables) =>
      updateIdentityTenant(tenantId, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['tenants'] });
      await queryClient.invalidateQueries({ queryKey: ['tenant-profile'] });
      await queryClient.invalidateQueries({
        queryKey: ['identity-tenant', variables.tenantId],
      });
    },
  });
};
