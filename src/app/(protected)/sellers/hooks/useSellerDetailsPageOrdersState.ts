import { useEffect, useMemo, useState } from 'react';

import type { SellerOrdersQueryParams } from '@/types/sellerOrders';

const ORDERS_PAGE_SIZE = 10;
const ORDER_SEARCH_DEBOUNCE_MS = 400;

export function useSellerDetailsPageOrdersState() {
  const [ordersPage, setOrdersPage] = useState(1);
  const [orderSearchInput, setOrderSearchInput] = useState('');
  const [debouncedOrderSearch, setDebouncedOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [orderShippingFilter, setOrderShippingFilter] = useState('');
  const [orderDateRange, setOrderDateRange] = useState('all');

  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedOrderSearch(orderSearchInput.trim()),
      ORDER_SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(t);
  }, [orderSearchInput]);

  const orderListFilters = useMemo((): SellerOrdersQueryParams => {
    const f: SellerOrdersQueryParams = {};
    if (debouncedOrderSearch) f.search = debouncedOrderSearch;
    if (orderStatusFilter) f.status = orderStatusFilter;
    if (orderShippingFilter) f.shippingProvider = orderShippingFilter;
    if (orderDateRange === '7d' || orderDateRange === '30d') {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - (orderDateRange === '7d' ? 7 : 30));
      f.dateFrom = from.toISOString().slice(0, 10);
      f.dateTo = to.toISOString().slice(0, 10);
    }
    return f;
  }, [
    debouncedOrderSearch,
    orderDateRange,
    orderShippingFilter,
    orderStatusFilter,
  ]);

  useEffect(() => {
    setOrdersPage(1);
  }, [
    debouncedOrderSearch,
    orderDateRange,
    orderShippingFilter,
    orderStatusFilter,
  ]);

  return {
    ordersPage,
    setOrdersPage,
    ordersPageSize: ORDERS_PAGE_SIZE,
    orderSearchInput,
    setOrderSearchInput,
    orderStatusFilter,
    setOrderStatusFilter,
    orderShippingFilter,
    setOrderShippingFilter,
    orderDateRange,
    setOrderDateRange,
    orderListFilters,
  };
}
