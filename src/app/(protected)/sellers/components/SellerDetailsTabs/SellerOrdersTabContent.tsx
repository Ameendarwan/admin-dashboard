/* eslint-disable import/order */

'use client';

import { Badge, Table } from '@merit-incentives/ui';
import {
  ORDERS_OVERVIEW_METRICS,
  ORDER_TABLE_STATUSES,
} from './sellerOrdersConstants';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  formatOrderId,
  formatOrderTotal,
  getOrderCustomerDisplayName,
  getOrderShippingColumnLabel,
  getOrderStatusTranslationKey,
  orderStatusBadgeColor,
  shippingProviderBadgeColor,
} from './sellerOrderHelpers';

import { MarkAsReceivedToolbar } from './MarkAsReceivedToolbar';
import type { Order } from '@/types/seller';
import { OrderItemsPopup } from '../OrderItemsPopup';
import { OrderTrackingCell } from './OrderTrackingCell';
import { SELLER_INVITE_SHIPPING_PROVIDERS } from '@/lib/enums';
import { SellerOrdersTabErrorDisplay } from './SellerOrdersTabErrorDisplay';
import type { SellerOrdersTabSharedProps } from './sellerOrdersTabSharedProps';
import { StatusCard } from '../StatusCard';
import { executeAdminBulkOrderAction } from '@/services/sellerService';
import { formatRelativeTimeAgo } from '@/utils/dateHelpers';
import { logError } from '@/utils/errorLogger';
import { useLocalization } from '@/hooks/useLocalization';
import { useRouter } from 'next/navigation';

interface SellerOrdersTabContentProps extends SellerOrdersTabSharedProps {
  readonly sellerShippingProvider?: Order['shippingProvider'] | null;
}

export function SellerOrdersTabContent({
  ordersData,
  ordersByStatus,
  isLoading = false,
  isStatusLoading = false,
  ordersError,
  refetchOrders,
  ordersByStatusError,
  refetchOrdersByStatus,
  onPageChange,
  tenantId,
  sellerShippingProvider,
  ordersSearchValue,
  onOrdersSearchChange,
  orderShippingFilter,
  onOrderShippingFilterChange,
  orderStatusFilter,
  onOrderStatusFilterChange,
  orderDateRange,
  onOrderDateRangeChange,
}: SellerOrdersTabContentProps) {
  const { translate } = useLocalization('seller-details');
  const router = useRouter();
  const [selectedOrderForPopup, setSelectedOrderForPopup] =
    useState<Order | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isMarkingReceived, setIsMarkingReceived] = useState(false);

  useEffect(() => {
    if (ordersError) {
      logError('Seller orders list load failed', ordersError);
    }
  }, [ordersError]);

  useEffect(() => {
    if (ordersByStatusError) {
      logError('Seller orders-by-status load failed', ordersByStatusError);
    }
  }, [ordersByStatusError]);

  const showOrdersOverviewError =
    Boolean(ordersByStatusError) && !isStatusLoading;
  const showOrdersTableError = Boolean(ordersError) && !isLoading;
  const canShowMarkAsReceived = sellerShippingProvider === 'ship_to_merit';

  const handleOrdersFilterChange = useCallback(
    (key: string, value: string) => {
      if (key === 'shipping') {
        onOrderShippingFilterChange(value === 'all' ? '' : value);
        return;
      }
      if (key === 'status') {
        onOrderStatusFilterChange(value === 'all' ? '' : value);
        return;
      }
      if (key === 'dateRange') {
        onOrderDateRangeChange(value);
      }
    },
    [
      onOrderDateRangeChange,
      onOrderShippingFilterChange,
      onOrderStatusFilterChange,
    ],
  );

  const ordersFiltersConfig = useMemo(
    () => [
      {
        key: 'shipping',
        label: '',
        type: 'dropdown' as const,
        placeholder: translate('orders.filterShippingDefault'),
        value: orderShippingFilter || 'all',
        options: [
          {
            value: 'all',
            label: translate('orders.filterShippingDefault'),
          },
          ...SELLER_INVITE_SHIPPING_PROVIDERS,
        ],
      },
      {
        key: 'status',
        label: '',
        type: 'dropdown' as const,
        placeholder: translate('orders.filterAllStatusesDefault'),
        value: orderStatusFilter || 'all',
        options: [
          {
            value: 'all',
            label: translate('orders.filterAllStatusesDefault'),
          },
          ...ORDER_TABLE_STATUSES.map((s) => ({
            value: s,
            label: translate(getOrderStatusTranslationKey(s)),
          })),
        ],
      },
      {
        key: 'dateRange',
        label: '',
        type: 'dropdown' as const,
        placeholder: translate('orders.filterDateRangeDefault'),
        value: orderDateRange,
        options: [
          {
            value: 'all',
            label: translate('orders.filterDateRangeDefault'),
          },
          { value: '7d', label: translate('orders.dateRangeLast7Days') },
          { value: '30d', label: translate('orders.dateRangeLast30Days') },
        ],
      },
    ],
    [orderDateRange, orderShippingFilter, orderStatusFilter, translate],
  );

  const rowMenuOptions = useMemo(
    () => [
      { value: 'view', label: translate('orders.view') },
      { value: 'download', label: translate('orders.download') },
    ],
    [translate],
  );

  const navigateToOrderDetail = useCallback(
    (row: Order) => {
      if (!tenantId) return;
      router.push(`/sellers/${tenantId}/orders/${row.id}`);
    },
    [router, tenantId],
  );

  const handleRowMenuSelect = useCallback(
    (optionValue: string, row: Order) => {
      if (optionValue === 'view') {
        navigateToOrderDetail(row);
      }
    },
    [navigateToOrderDetail],
  );

  const notProvidedText = translate('info.notProvided');

  const ordersColumns = useMemo(
    () => [
      {
        key: 'merchandizeOrderId' as keyof Order,
        label: translate('orders.orderId'),
        render: (row: Order) => (
          <div className="text-sm font-medium text-mds-black-900">
            {formatOrderId(row.merchandizeOrderId)}
          </div>
        ),
        showOnMobile: true,
      },
      {
        key: 'referenceId' as keyof Order,
        label: translate('table.referenceId'),
        render: (row: Order) => {
          const raw = row.referenceId?.trim();
          if (!raw) {
            return <div className="text-mds-gray-900">—</div>;
          }
          const upper = raw.toUpperCase();
          const display =
            upper.length > 16 ? `${upper.slice(0, 16)}...` : upper;
          return (
            <div
              className="text-sm font-medium text-mds-black-900"
              title={upper.length > 16 ? upper : undefined}
            >
              {display}
            </div>
          );
        },
        showOnMobile: true,
      },
      {
        key: 'orderTenantName' as keyof Order,
        label: translate('orders.tenant'),
        render: (row: Order) => (
          <div className="text-sm text-mds-black-600">
            {row.orderTenantName || notProvidedText}
          </div>
        ),
        showOnMobile: true,
      },
      {
        key: 'customer' as keyof Order,
        label: translate('orders.customer'),
        render: (row: Order) => (
          <div className="text-sm font-medium text-mds-black-900">
            {getOrderCustomerDisplayName(row, notProvidedText)}
          </div>
        ),
        showOnMobile: true,
      },
      {
        key: 'itemsCount' as keyof Order,
        label: translate('orders.items'),
        render: (row: Order) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrderForPopup(row);
            }}
            className="cursor-pointer border-0 bg-transparent p-0 text-left text-sm font-inherit text-mds-primary-600 underline hover:text-mds-primary-700 focus:underline focus:outline-none"
          >
            {String(row.itemsCount ?? 0).padStart(2, '0')}
          </button>
        ),
        showOnMobile: true,
      },
      {
        key: 'totalAmount' as keyof Order,
        label: translate('orders.total'),
        render: (row: Order) => (
          <div className="text-sm font-semibold text-mds-black-900">
            {formatOrderTotal(row.currency, row.totalAmount)}
          </div>
        ),
        showOnMobile: true,
      },
      {
        key: 'status' as keyof Order,
        label: translate('orders.status'),
        render: (row: Order) => (
          <Badge leftIcon color={orderStatusBadgeColor(row.status)} size="lg">
            {translate(getOrderStatusTranslationKey(row.status))}
          </Badge>
        ),
        align: 'center' as const,
        showOnMobile: true,
      },
      {
        key: 'shippingProvider' as keyof Order,
        label: translate('orders.shipping'),
        render: (row: Order) => {
          const provider = row.shippingProvider;
          return (
            <Badge
              leftIcon
              color={shippingProviderBadgeColor(provider)}
              size="lg"
            >
              {getOrderShippingColumnLabel(provider, translate)}
            </Badge>
          );
        },
        align: 'center' as const,
        showOnMobile: true,
      },
      {
        key: 'placedAt' as keyof Order,
        label: translate('orders.dateTime'),
        render: (row: Order) => (
          <div className="whitespace-nowrap text-sm text-mds-black-600">
            {formatRelativeTimeAgo(row.placedAt)}
          </div>
        ),
        showOnMobile: true,
      },
      {
        key: 'trackingId' as keyof Order,
        label: translate('orders.carrierTracking'),
        render: (row: Order) => (
          <OrderTrackingCell row={row} translate={translate} />
        ),
        showOnMobile: true,
      },
    ],
    [translate, notProvidedText],
  );

  const eligibleIdsOnPage = useMemo(() => {
    const rows = ordersData?.data ?? [];
    return rows
      .filter(
        (o) =>
          o.shippingProvider === 'ship_to_merit' &&
          o.status === 'SHIPPED_TO_MERIT_PENDING',
      )
      .map((o) => o.id);
  }, [ordersData?.data]);

  const selectedEligibleIds = useMemo(
    () => selectedRows.filter((id) => eligibleIdsOnPage.includes(id)),
    [eligibleIdsOnPage, selectedRows],
  );

  const selectedRowsOnCurrentPage = useMemo(() => {
    const currentPageIds = new Set((ordersData?.data ?? []).map((o) => o.id));
    return selectedRows.filter((id) => currentPageIds.has(id));
  }, [ordersData?.data, selectedRows]);

  const selectedOrdersOnCurrentPage = useMemo(() => {
    const rows = ordersData?.data ?? [];
    const selectedSet = new Set(selectedRowsOnCurrentPage);
    return rows.filter((o) => selectedSet.has(o.id));
  }, [ordersData?.data, selectedRowsOnCurrentPage]);

  const markAsReceivedTooltipText = useMemo(() => {
    if (selectedOrdersOnCurrentPage.length === 0) return null;

    const hasNonStm = selectedOrdersOnCurrentPage.some(
      (o) => o.shippingProvider !== 'ship_to_merit',
    );
    if (hasNonStm) {
      return 'Only Ship to Merit (STM) orders can be marked as received.';
    }

    const hasAnyArrivalPending = selectedOrdersOnCurrentPage.some(
      (o) => o.status === 'SHIPPED_TO_MERIT_PENDING',
    );
    if (!hasAnyArrivalPending) {
      return 'Select orders with status "Arrival Pending" to enable this action.';
    }

    return null;
  }, [selectedOrdersOnCurrentPage]);

  const orderIdsOnCurrentPage = useMemo(
    () => (ordersData?.data ?? []).map((o) => o.id),
    [ordersData?.data],
  );

  const handleRowSelect = useCallback(
    (rowId: string | number, isSelected: boolean) => {
      const id = String(rowId);
      setSelectedRows((prev) =>
        isSelected ? [...prev, id] : prev.filter((x) => x !== id),
      );
    },
    [],
  );

  const handleSelectAll = useCallback(
    (orderIds: string[], isSelected: boolean) => {
      setSelectedRows((prev) => {
        if (isSelected) {
          const merged = new Set([...prev, ...orderIds]);
          return Array.from(merged);
        }
        const removeSet = new Set(orderIds);
        return prev.filter((id) => !removeSet.has(id));
      });
    },
    [],
  );

  const handleOrdersRowClick = useCallback(
    (row: Order) => {
      navigateToOrderDetail(row);
    },
    [navigateToOrderDetail],
  );

  const handleMarkAsReceived = useCallback(async () => {
    if (!tenantId || isMarkingReceived || selectedEligibleIds.length === 0)
      return;
    setIsMarkingReceived(true);
    try {
      await executeAdminBulkOrderAction(
        tenantId,
        'stm-receive',
        selectedEligibleIds,
      );
      setSelectedRows([]);
      refetchOrders?.();
      refetchOrdersByStatus?.();
    } finally {
      setIsMarkingReceived(false);
    }
  }, [
    isMarkingReceived,
    refetchOrders,
    refetchOrdersByStatus,
    selectedEligibleIds,
    tenantId,
  ]);

  const pagination = ordersData
    ? {
        currentPage: ordersData.pagination.page,
        totalPages: ordersData.pagination.totalPages,
        totalRecords: ordersData.pagination.total,
        itemsPerPage: ordersData.pagination.limit,
      }
    : undefined;

  return (
    <>
      <div className="space-y-6">
        <section>
          <h3 className="mb-4 text-[20px] font-medium leading-[120%] text-mds-black-900">
            {translate('orders.ordersOverview')}
          </h3>
          {showOrdersOverviewError ? (
            <SellerOrdersTabErrorDisplay
              title={translate('errors.loadOrdersOverview')}
              error={ordersByStatusError}
              onRetry={() => {
                refetchOrdersByStatus?.();
              }}
              retryButtonText={translate('retry')}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 md:gap-4">
              {ORDERS_OVERVIEW_METRICS.map(({ statusKey, titleKey }) => (
                <StatusCard
                  key={statusKey}
                  title={translate(titleKey)}
                  value={ordersByStatus?.[statusKey] ?? 0}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-[20px] font-medium leading-[120%] text-mds-black-900">
              {translate('orders.recentOrders')}
            </h3>
            {canShowMarkAsReceived ? (
              <MarkAsReceivedToolbar
                selectionSuffix={
                  selectedEligibleIds.length > 0
                    ? ` (${selectedEligibleIds.length})`
                    : ''
                }
                isDisabled={
                  selectedEligibleIds.length === 0 || isMarkingReceived
                }
                isMarkingReceived={isMarkingReceived}
                tooltipText={markAsReceivedTooltipText}
                onMark={handleMarkAsReceived}
              />
            ) : null}
          </div>
          {showOrdersTableError ? (
            <SellerOrdersTabErrorDisplay
              title={translate('errors.loadOrders')}
              error={ordersError}
              onRetry={() => {
                refetchOrders?.();
              }}
              retryButtonText={translate('retry')}
            />
          ) : (
            <div className="rounded-xl border border-mds-black-100 bg-white shadow-sm">
              <Table
                columns={ordersColumns}
                data={ordersData?.data ?? []}
                showSearch
                searchValue={ordersSearchValue}
                onSearchChange={onOrdersSearchChange}
                filtersConfig={ordersFiltersConfig}
                onFilterChange={handleOrdersFilterChange}
                showPagination
                pagination={pagination}
                onPageChange={onPageChange}
                size="md"
                background="white"
                rounded={false}
                shadow={false}
                getRowId={(row: Order) => row.id}
                emptyText={translate('orders.noOrders')}
                className="w-full overflow-visible rounded-none shadow-none! [&_thead_tr]:bg-mds-black-50 [&_th]:text-sm [&_th]:font-medium [&_th]:text-mds-black-500"
                showRowMenu
                rowMenuOptions={rowMenuOptions}
                onRowMenuSelect={handleRowMenuSelect}
                onRowClick={handleOrdersRowClick}
                showCheckboxes={true}
                selectedRows={selectedRowsOnCurrentPage}
                onRowSelect={handleRowSelect}
                onSelectAll={(isSelected) =>
                  handleSelectAll(orderIdsOnCurrentPage, isSelected)
                }
                loading={isLoading}
              />
            </div>
          )}
        </section>
      </div>
      <OrderItemsPopup
        isOpen={Boolean(selectedOrderForPopup)}
        order={selectedOrderForPopup}
        onClose={() => setSelectedOrderForPopup(null)}
        translate={translate}
      />
    </>
  );
}
