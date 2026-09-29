import { useQuery } from '@tanstack/react-query';

import { fetchBannerConfigs } from '@/services/superAppService';
import { BannerConfigListItem } from '@/types/superApp';

/**
 * Hook to fetch all banner configs with their current published log data
 * @returns Query result with banner configs array
 */
export const useBannerConfigs = () => {
  return useQuery<BannerConfigListItem[]>({
    queryKey: ['banner-configs'],
    queryFn: fetchBannerConfigs,
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    staleTime: 10 * 60 * 1000, // 10 minutes stale time
  });
};
