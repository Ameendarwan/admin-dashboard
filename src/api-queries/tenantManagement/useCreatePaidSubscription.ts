import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createPaidSubscription } from '@/services/subscriptionsAdminService';
import type { CreatePaidSubscriptionBody } from '@/types/subscriptionsAdminApi';

import { subscriptionQueryKeys } from './subscriptionQueryKeys';

type CreatePaidSubscriptionVariables = {
  tenantId: string;
  body: CreatePaidSubscriptionBody;
};

export function useCreatePaidSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, body }: CreatePaidSubscriptionVariables) =>
      createPaidSubscription(tenantId, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: subscriptionQueryKeys.list(variables.tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: ['tenant-platforms', variables.tenantId],
      });
    },
  });
}
