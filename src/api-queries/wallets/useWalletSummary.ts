import { useQuery } from '@tanstack/react-query';

import { getWalletSummary } from '@/services/walletAdminService';
import { TIME_5_MIN } from '@/utils/timeUtils';

import { walletQueryKeys } from './walletQueryKeys';

export function useWalletSummary(tenantId: string) {
  return useQuery({
    queryKey: walletQueryKeys.summary(tenantId),
    queryFn: () => getWalletSummary(tenantId),
    enabled: Boolean(tenantId),
    staleTime: TIME_5_MIN,
    gcTime: TIME_5_MIN,
  });
}
