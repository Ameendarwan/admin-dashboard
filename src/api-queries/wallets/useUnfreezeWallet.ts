import { useMutation, useQueryClient } from '@tanstack/react-query';

import { unfreezeWallet } from '@/services/walletAdminService';
import type { ChangeWalletFreezeStatusBody } from '@/types/walletAdminApi';

import { invalidateTenantWalletQueries } from './walletQueryKeys';

type UnfreezeWalletVariables = {
  tenantId: string;
  walletId: string;
  idempotencyKey: string;
} & ChangeWalletFreezeStatusBody;

export function useUnfreezeWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tenantId,
      walletId,
      reasonCode,
      notes,
      idempotencyKey,
    }: UnfreezeWalletVariables) =>
      unfreezeWallet(
        tenantId,
        walletId,
        {
          reasonCode,
          ...(notes ? { notes } : {}),
        },
        idempotencyKey,
      ),
    onSettled: (_data, _error, variables) => {
      invalidateTenantWalletQueries(queryClient, {
        tenantId: variables.tenantId,
      });
    },
  });
}
