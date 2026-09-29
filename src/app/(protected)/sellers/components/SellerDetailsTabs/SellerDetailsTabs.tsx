'use client';

import { ShoppingCart, Store } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import {
  createDetailSectionTabItem,
  DetailSectionTabsLayout,
} from '@/components/DetailSectionTabsLayout';
import { useLocalization } from '@/hooks/useLocalization';
import type { SellerDetails } from '@/types/seller';

// import { SellerKybTab } from '../SellerKybTab/SellerKybTab';
import { StoreDetailsTab } from '../StoreDetailsTab/StoreDetailsTab';
import { SellerOrdersTabContent } from './SellerOrdersTabContent';
import type { SellerOrdersTabSharedProps } from './sellerOrdersTabSharedProps';

type SellerTabKey = 'orders' | 'kyb-details' | 'store-details';

export interface SellerDetailsTabsProps extends SellerOrdersTabSharedProps {
  readonly storeDisplayName: string;
  readonly sellerDetails?: SellerDetails;
}

export function SellerDetailsTabs({
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
  storeDisplayName,
  sellerDetails,
  ordersSearchValue,
  onOrdersSearchChange,
  orderShippingFilter,
  onOrderShippingFilterChange,
  orderStatusFilter,
  onOrderStatusFilterChange,
  orderDateRange,
  onOrderDateRangeChange,
}: SellerDetailsTabsProps) {
  const { translate } = useLocalization('seller-details');

  const tabConfig = useMemo(
    () =>
      [
        createDetailSectionTabItem(
          'orders',
          translate('tabs.orders'),
          ShoppingCart,
          <SellerOrdersTabContent
            ordersData={ordersData}
            ordersByStatus={ordersByStatus}
            isLoading={isLoading}
            isStatusLoading={isStatusLoading}
            ordersError={ordersError}
            refetchOrders={refetchOrders}
            ordersByStatusError={ordersByStatusError}
            refetchOrdersByStatus={refetchOrdersByStatus}
            onPageChange={onPageChange}
            tenantId={tenantId}
            sellerShippingProvider={sellerDetails?.shippingProvider ?? null}
            ordersSearchValue={ordersSearchValue}
            onOrdersSearchChange={onOrdersSearchChange}
            orderShippingFilter={orderShippingFilter}
            onOrderShippingFilterChange={onOrderShippingFilterChange}
            orderStatusFilter={orderStatusFilter}
            onOrderStatusFilterChange={onOrderStatusFilterChange}
            orderDateRange={orderDateRange}
            onOrderDateRangeChange={onOrderDateRangeChange}
          />,
        ),
        // createDetailSectionTabItem(
        //   'kyb-details',
        //   translate('tabs.kybDetails'),
        //   Building2,
        //   <SellerKybTab
        //     sellerTenantId={tenantId}
        //     sellerDetails={sellerDetails}
        //   />,
        // ),
        createDetailSectionTabItem(
          'store-details',
          translate('tabs.storeDetails'),
          Store,
          <StoreDetailsTab
            tenantId={tenantId}
            storeDisplayName={storeDisplayName}
            sellerDetails={sellerDetails}
          />,
        ),
      ] as const,
    [
      ordersData,
      ordersByStatus,
      isLoading,
      isStatusLoading,
      ordersError,
      refetchOrders,
      ordersByStatusError,
      refetchOrdersByStatus,
      onPageChange,
      tenantId,
      storeDisplayName,
      sellerDetails,
      ordersSearchValue,
      onOrdersSearchChange,
      orderShippingFilter,
      onOrderShippingFilterChange,
      orderStatusFilter,
      onOrderStatusFilterChange,
      orderDateRange,
      onOrderDateRangeChange,
      translate,
    ],
  );

  const [activeTab, setActiveTab] = useState<SellerTabKey>('orders');

  return (
    <DetailSectionTabsLayout
      tabs={tabConfig}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}
