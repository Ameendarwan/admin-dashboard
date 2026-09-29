import type { OrdersByStatus, OrdersResponse } from '@/types/seller';

/** Props shared by `SellerDetailsTabs` and `SellerOrdersTabContent` for the orders tab. */
export interface SellerOrdersTabSharedProps {
  readonly ordersData?: OrdersResponse;
  readonly ordersByStatus?: OrdersByStatus;
  readonly isLoading?: boolean;
  readonly isStatusLoading?: boolean;
  readonly ordersError?: unknown;
  readonly refetchOrders?: () => void;
  readonly ordersByStatusError?: unknown;
  readonly refetchOrdersByStatus?: () => void;
  readonly onPageChange?: (page: number) => void;
  readonly tenantId?: string;
  readonly ordersSearchValue: string;
  readonly onOrdersSearchChange: (value: string) => void;
  readonly orderShippingFilter: string;
  readonly onOrderShippingFilterChange: (value: string) => void;
  readonly orderStatusFilter: string;
  readonly onOrderStatusFilterChange: (value: string) => void;
  readonly orderDateRange: string;
  readonly onOrderDateRangeChange: (value: string) => void;
}
