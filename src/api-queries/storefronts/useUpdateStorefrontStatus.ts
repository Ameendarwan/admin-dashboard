import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateStorefrontStatus } from '@/services/storefrontAdminService';
import type { UpdateStorefrontStatusBody } from '@/types/storefrontAdminApi';

import { storefrontQueryKeys } from './storefrontQueryKeys';

type UpdateStorefrontStatusVariables = UpdateStorefrontStatusBody & {
  storefrontId: string;
};

export function useUpdateStorefrontStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      storefrontId,
      ...body
    }: UpdateStorefrontStatusVariables) => {
      const result = await updateStorefrontStatus(storefrontId, body);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...storefrontQueryKeys.all, 'global-list'],
        }),
        queryClient.invalidateQueries({
          queryKey: [...storefrontQueryKeys.all, 'list'],
        }),
        queryClient.invalidateQueries({
          queryKey: storefrontQueryKeys.tenantList(result.tenantId),
        }),
      ]);

      return result;
    },
  });
}
