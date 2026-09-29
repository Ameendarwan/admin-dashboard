import { useQuery } from '@tanstack/react-query';

import { listGlobalStorefronts } from '@/services/storefrontAdminService';
import type { ListGlobalStorefrontsParams } from '@/types/storefrontAdminApi';
import { TIME_5_MIN } from '@/utils/timeUtils';

import { storefrontQueryKeys } from './storefrontQueryKeys';

export function useGlobalStorefrontsList(params: ListGlobalStorefrontsParams) {
  return useQuery({
    queryKey: storefrontQueryKeys.globalList(params),
    queryFn: () => listGlobalStorefronts(params),
    staleTime: TIME_5_MIN,
    gcTime: TIME_5_MIN,
  });
}
