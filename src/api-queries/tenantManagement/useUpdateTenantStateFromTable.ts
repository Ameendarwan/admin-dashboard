import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ReviewStatus } from '@/lib/enums';
import {
  updateClientProfileState,
  fetchTenantProfileById,
} from '@/services/tenantManagementService';

export const useUpdateTenantStateFromTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientProfileId,
      tenantId,
      state,
    }: {
      clientProfileId: string;
      tenantId: string;
      state: ReviewStatus;
    }) => {
      // Get the full tenant profile to extract customerProfileDataId
      const tenantProfile = await fetchTenantProfileById(
        clientProfileId,
        tenantId,
      );

      const customerProfileDataId = tenantProfile.customerProfileData[0]?.id;

      if (!customerProfileDataId) {
        throw new Error('No customer profile data ID found');
      }

      // Call the state API
      return updateClientProfileState(tenantId, customerProfileDataId, state);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({
        queryKey: ['tenant-profile'],
      });
    },
  });
};
