import { useMutation, useQueryClient } from '@tanstack/react-query';

import { batchBannerConfigs } from '@/services/superAppService';
import { BatchRequest, BannerConfigListItem } from '@/types/superApp';

/**
 * Hook for batch operations on banner configs (create, update, revert, delete)
 * Automatically invalidates banner-configs queries on success
 */
export const useBatchBannerConfigs = () => {
  const queryClient = useQueryClient();

  return useMutation<BannerConfigListItem[], Error, BatchRequest>({
    mutationFn: batchBannerConfigs,
    onSuccess: () => {
      // Invalidate all banner-configs queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['banner-configs'] });
    },
  });
};
