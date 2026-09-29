import { useQuery } from '@tanstack/react-query';

import {
  getSellerDetailsByTenantId,
  getSellerOrders,
  getSellerOrdersByStatus,
} from '@/services/sellerService';
import type { SellerOrdersQueryParams } from '@/types/sellerOrders';
import { TIME_10_MIN, TIME_5_MIN } from '@/utils/timeUtils';

export const useSellerDetails = (tenantId: string | undefined) => {
  return useQuery({
    queryKey: ['seller-details', tenantId],
    queryFn: () => getSellerDetailsByTenantId(tenantId!),
    enabled: !!tenantId,
    gcTime: TIME_10_MIN,
  });
};

export const useSellerOrders = (
  tenantId: string | undefined,
  page: number = 1,
  limit: number = 4,
  filters?: SellerOrdersQueryParams,
) => {
  return useQuery({
    queryKey: ['seller-orders', tenantId, page, limit, filters],
    queryFn: () => getSellerOrders(tenantId!, page, limit, filters),
    enabled: !!tenantId,
    gcTime: TIME_5_MIN,
  });
};

export const useSellerOrdersByStatus = (tenantId: string | undefined) => {
  return useQuery({
    queryKey: ['seller-orders-by-status', tenantId],
    queryFn: () => getSellerOrdersByStatus(tenantId!),
    enabled: !!tenantId,
    gcTime: TIME_5_MIN,
  });
};
