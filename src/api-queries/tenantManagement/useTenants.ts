import { useQuery } from '@tanstack/react-query';

import {
  fetchTenants,
  type TenantJourney,
} from '@/services/tenantManagementService';
import { TenantProfile } from '@/types/tenantManagement';
import { PaginatedResponse } from '@/types/pagination';
import { toSortOrder } from '@/utils/sortUtils';
import { TIME_10_MIN } from '@/utils/timeUtils';

type TenantsResponse = PaginatedResponse<TenantProfile>;

type TenantsQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  sortOrder?: 'asc' | 'desc';
  country?: string;
  accountManager?: string;
  platforms?: string[];
  journey?: TenantJourney;
  statusQueryKey?: 'customerProfileState' | 'status';
  enabled?: boolean;
};

export const useTenants = (params: TenantsQueryParams = {}) => {
  const {
    page = 1,
    pageSize = 10,
    search,
    status,
    sortOrder,
    country,
    accountManager,
    platforms,
    journey,
    statusQueryKey,
    enabled = true,
  } = params;

  return useQuery({
    queryKey: [
      'tenants',
      page,
      pageSize,
      search,
      status,
      sortOrder,
      country,
      accountManager,
      platforms,
      journey,
      statusQueryKey,
    ],
    queryFn: () =>
      fetchTenants({
        page,
        pageSize,
        search,
        status,
        sortOrder: toSortOrder(sortOrder),
        country,
        accountManager,
        platforms,
        journey,
        statusQueryKey,
      }),
    enabled,
    gcTime: TIME_10_MIN,
    select: (response: TenantsResponse) =>
      response || { data: [], page: 1, totalPages: 1, total: 0 },
  });
};
