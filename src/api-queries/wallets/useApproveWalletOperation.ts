import { useMutation, useQueryClient } from '@tanstack/react-query';

import { approveWalletOperation } from '@/services/walletAdminService';

import { invalidateTenantWalletQueries } from './walletQueryKeys';

type ApproveWalletOperationVariables = {
  tenantId: string;
  operationId: string;
  idempotencyKey: string;
};

export function useApproveWalletOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tenantId,
      operationId,
      idempotencyKey,
    }: ApproveWalletOperationVariables) =>
      approveWalletOperation(tenantId, operationId, idempotencyKey),
    onSettled: (_data, _error, variables) => {
      invalidateTenantWalletQueries(queryClient, variables);
    },
  });
}
