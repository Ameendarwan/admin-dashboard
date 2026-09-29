import { useMutation, useQueryClient } from '@tanstack/react-query';

import { uploadTenantContracts } from '@/services/tenantManagementService';

type UploadTenantContractsParams = {
  tenantId: string;
  customerProfileDataId: string;
  files: File[];
};

export const useUploadTenantContracts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tenantId,
      customerProfileDataId,
      files,
    }: UploadTenantContractsParams) =>
      uploadTenantContracts(tenantId, customerProfileDataId, files),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tenant-profile'],
      });
    },
  });
};
