import { useQuery } from '@tanstack/react-query';

import { listPendingReviewWalletOperations } from '@/services/walletAdminService';

import { PENDING_REVIEW_STALE_TIME_MS } from './pendingReviewQueryOptions';
import { walletQueryKeys } from './walletQueryKeys';

export { PENDING_REVIEW_STALE_TIME_MS } from './pendingReviewQueryOptions';

export function usePendingReviewWalletOperations(tenantId: string) {
  return useQuery({
    queryKey: walletQueryKeys.pendingReview(tenantId),
    queryFn: () => listPendingReviewWalletOperations(tenantId),
    // enabled: Boolean(tenantId),
    enabled: false, // TODO: REVERT
    staleTime: PENDING_REVIEW_STALE_TIME_MS,
  });
}
