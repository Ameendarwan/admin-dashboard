import { useQuery } from '@tanstack/react-query';

import { TenantJourney } from '@/lib/enums';
import {
  fetchOnboardedSellers,
  fetchSellerInvites,
  type SellerJourney,
} from '@/services/sellerService';
import { InvitesResponse } from '@/types/invite';
import { TIME_10_MIN } from '@/utils/timeUtils';

export const useSellerInvites = (
  page: number = 1,
  pageSize: number = 10,
  status?: string,
  search?: string,
  sort?: string,
  journey?: SellerJourney,
) => {
  return useQuery({
    queryKey: ['seller-invites', page, pageSize, status, search, sort, journey],
    queryFn: () => {
      if (journey === TenantJourney.ONBOARDED) {
        return fetchOnboardedSellers(page, pageSize, search, sort);
      }
      return fetchSellerInvites(page, pageSize, status, search, sort);
    },
    gcTime: TIME_10_MIN,
    select: (response: InvitesResponse) =>
      response || { data: [], page: 1, totalPages: 1, total: 0 },
  });
};
