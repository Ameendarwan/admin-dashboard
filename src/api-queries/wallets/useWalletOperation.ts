import { useQuery } from '@tanstack/react-query';

import { getWalletOperation } from '@/services/walletAdminService';
import { TIME_5_MIN } from '@/utils/timeUtils';

import { walletQueryKeys } from './walletQueryKeys';

export function useWalletOperation(
  tenantId: string,
  operationId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: walletQueryKeys.operation(tenantId, operationId ?? ''),
    queryFn: () => {
      if (!operationId) {
        throw new Error('Wallet operation ID is required');
      }
      return getWalletOperation(tenantId, operationId);
    },
    enabled: Boolean(tenantId && operationId) && enabled,
    staleTime: 0,
    gcTime: TIME_5_MIN,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}
