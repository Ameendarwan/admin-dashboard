import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createStorefront } from '@/services/storefrontAdminService';
import type { CreateStorefrontBody } from '@/types/storefrontAdminApi';

import { storefrontQueryKeys } from './storefrontQueryKeys';

export function useCreateStorefront() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateStorefrontBody) => createStorefront(body),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({
        queryKey: [...storefrontQueryKeys.all, 'global-list'],
      });
      void queryClient.invalidateQueries({
        queryKey: [...storefrontQueryKeys.all, 'list'],
      });
      void queryClient.invalidateQueries({
        queryKey: storefrontQueryKeys.tenantList(result.tenantId),
      });
    },
  });
}
