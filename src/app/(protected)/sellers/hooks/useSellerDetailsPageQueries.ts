import { useEffect } from 'react';

import {
  useSellerDetails,
  useSellerOrders,
  useSellerOrdersByStatus,
} from '@/api-queries/seller/useSellerDetails';
import type { SellerOrdersQueryParams } from '@/types/sellerOrders';
import { logError } from '@/utils/errorLogger';

export function useSellerDetailsPageQueries(
  tenantId: string,
  ordersPage: number,
  ordersPageSize: number,
  orderListFilters: SellerOrdersQueryParams,
) {
  const detailsQuery = useSellerDetails(tenantId);
  const ordersQuery = useSellerOrders(
    tenantId,
    ordersPage,
    ordersPageSize,
    orderListFilters,
  );
  const ordersByStatusQuery = useSellerOrdersByStatus(tenantId);

  useEffect(() => {
    if (detailsQuery.error) {
      logError('Seller details load failed', detailsQuery.error);
    }
  }, [detailsQuery.error]);

  return {
    detailsQuery,
    ordersQuery,
    ordersByStatusQuery,
  };
}
