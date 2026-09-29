import { useMutation, useQueryClient } from '@tanstack/react-query';

import { rejectWalletOperation } from '@/services/walletAdminService';
import type { WalletOperationRejectReasonCode } from '@/types/walletAdminApi';

import { invalidateTenantWalletQueries } from './walletQueryKeys';

type RejectWalletOperationVariables = {
  tenantId: string;
  operationId: string;
  reasonCode: WalletOperationRejectReasonCode;
  notes?: string;
  idempotencyKey: string;
};

export function useRejectWalletOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tenantId,
      operationId,
      reasonCode,
      notes,
      idempotencyKey,
    }: RejectWalletOperationVariables) =>
      rejectWalletOperation(
        tenantId,
        operationId,
        {
          reasonCode,
          ...(notes ? { notes } : {}),
        },
        idempotencyKey,
      ),
    onSettled: (_data, _error, variables) => {
      invalidateTenantWalletQueries(queryClient, variables);
    },
  });
}
