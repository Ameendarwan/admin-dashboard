import { useMutation, useQueryClient } from '@tanstack/react-query';

import { freezeWallet } from '@/services/walletAdminService';
import type { ChangeWalletFreezeStatusBody } from '@/types/walletAdminApi';

import { invalidateTenantWalletQueries } from './walletQueryKeys';

type FreezeWalletVariables = {
  tenantId: string;
  walletId: string;
  idempotencyKey: string;
} & ChangeWalletFreezeStatusBody;

export function useFreezeWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tenantId,
      walletId,
      reasonCode,
      notes,
      idempotencyKey,
    }: FreezeWalletVariables) =>
      freezeWallet(
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
