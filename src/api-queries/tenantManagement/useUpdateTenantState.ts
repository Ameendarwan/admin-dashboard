import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateClientProfileState } from '@/services/tenantManagementService';
import { ReviewStatus } from '@/lib/enums';

export const useUpdateTenantState = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tenantId,
      customerProfileDataId,
      state,
    }: {
      tenantId: string;
      customerProfileDataId: string;
      state: ReviewStatus;
    }) => updateClientProfileState(tenantId, customerProfileDataId, state),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({
        queryKey: ['tenant-profile'],
      });
    },
  });
};
