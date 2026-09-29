import { useQuery } from '@tanstack/react-query';

import { fetchBannerConfigLogs } from '@/services/superAppService';
import { BannerConfigListItem } from '@/types/superApp';

/**
 * Hook to fetch banner configs with their one-version-older log (for revert functionality)
 * @param startDate - Optional start date filter (YYYY-MM-DD)
 * @param endDate - Optional end date filter (YYYY-MM-DD)
 * @param enabled - Whether the query should run
 * @returns Query result with banner config logs array
 */
export const useBannerConfigLogs = (
  startDate?: string,
  endDate?: string,
  enabled: boolean = true,
) => {
  return useQuery<BannerConfigListItem[]>({
    queryKey: ['banner-configs', 'logs', startDate, endDate],
    queryFn: () => fetchBannerConfigLogs(startDate, endDate),
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    staleTime: 2 * 60 * 1000, // 2 minutes stale time
    enabled,
  });
};
