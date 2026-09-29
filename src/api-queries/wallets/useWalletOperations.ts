import { useQuery } from '@tanstack/react-query';

import { listWalletOperations } from '@/services/walletAdminService';
import type { ListWalletOperationsParams } from '@/types/walletAdminApi';
import { TIME_5_MIN } from '@/utils/timeUtils';

import { walletQueryKeys } from './walletQueryKeys';

export function useWalletOperations(
  tenantId: string,
  params?: ListWalletOperationsParams,
) {
  return useQuery({
    queryKey: walletQueryKeys.operations(tenantId, params),
    queryFn: () => listWalletOperations(tenantId, params),
    enabled: Boolean(tenantId),
    staleTime: TIME_5_MIN,
    gcTime: TIME_5_MIN,
  });
}
