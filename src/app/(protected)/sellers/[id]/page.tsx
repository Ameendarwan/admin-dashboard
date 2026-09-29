/* eslint-disable import/order */

'use client';

import React, { use } from 'react';

import { SellerDetailsPageShell } from '@/app/(protected)/sellers/components/SellerDetailsPageShell/SellerDetailsPageShell';
import { SellerDetailsTabs } from '@/app/(protected)/sellers/components/SellerDetailsTabs';
import { SellerInfo } from '@/app/(protected)/sellers/components/SellerInfo';
import { Spinner } from '@/components/Spinner';
import { TableStateDisplay } from '@/components/TableStateDisplay';
import { getSellerAccountStatusForUi } from '@/app/(protected)/sellers/utils/sellerAccountStatusForUi';
import { getSellerAccountType } from '@/utils/sellerAccountType';
import { getSellerDetailEmailFromSearchParams } from '@/utils/sellerTenantRoute';
import { useLocalization } from '@/hooks/useLocalization';
import { useRouteProtection } from '@/hooks/useRouteProtection';
import { useSearchParams } from 'next/navigation';
import { useSellerDetailsPageOrdersState } from '@/app/(protected)/sellers/hooks/useSellerDetailsPageOrdersState';
import { useSellerDetailsPageQueries } from '@/app/(protected)/sellers/hooks/useSellerDetailsPageQueries';

function sellerDetailsLoadErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Unknown error occurred';
}

interface SellerDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function SellerDetailsPage({
  params,
}: Readonly<SellerDetailsPageProps>) {
  const { id: tenantId } = use(params);
  const searchParams = useSearchParams();
  const { shouldShowLoading } = useRouteProtection();
  const { translate } = useLocalization('seller-details');

  const emailFromUrl = getSellerDetailEmailFromSearchParams(searchParams);

  const {
    ordersPage,
    setOrdersPage,
    ordersPageSize,
    orderSearchInput,
    setOrderSearchInput,
    orderStatusFilter,
    setOrderStatusFilter,
    orderShippingFilter,
    setOrderShippingFilter,
    orderDateRange,
    setOrderDateRange,
    orderListFilters,
  } = useSellerDetailsPageOrdersState();

  const { detailsQuery, ordersQuery, ordersByStatusQuery } =
    useSellerDetailsPageQueries(
      tenantId,
      ordersPage,
      ordersPageSize,
      orderListFilters,
    );

  const {
    data: sellerDetails,
    isLoading: detailsLoading,
    error: detailsError,
    refetch: refetchSellerDetails,
  } = detailsQuery;

  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = ordersQuery;

  const {
    data: ordersByStatus,
    isLoading: statusLoading,
    error: ordersByStatusError,
    refetch: refetchOrdersByStatus,
  } = ordersByStatusQuery;

  if (shouldShowLoading) {
    return <Spinner fullHeight />;
  }

  const showDetailsError = Boolean(detailsError) && !detailsLoading;

  if (showDetailsError) {
    const detailsErrorMessage = sellerDetailsLoadErrorMessage(detailsError);
    return (
      <SellerDetailsPageShell>
        <div className="flex flex-col items-center py-8">
          <TableStateDisplay
            type="error"
            title={translate('errors.loadSellerDetails')}
            description={detailsErrorMessage}
            showRetryButton
            onRetry={refetchSellerDetails}
            retryButtonText={translate('retry')}
          />
        </div>
      </SellerDetailsPageShell>
    );
  }

  if (detailsLoading) {
    return (
      <SellerDetailsPageShell>
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      </SellerDetailsPageShell>
    );
  }

  const accountType = getSellerAccountType(sellerDetails);

  const shopDisplayName = (
    sellerDetails?.tenantName ??
    sellerDetails?.companyName ??
    ''
  ).trim();

  const accountStatusForUi = getSellerAccountStatusForUi(sellerDetails);

  const emailFromApi = sellerDetails?.primaryContactEmail?.trim() ?? '';
  const sellerEmailForCard = emailFromApi || emailFromUrl;

  return (
    <SellerDetailsPageShell>
      <div className="flex flex-col gap-5 md:gap-6">
        <SellerInfo
          sellerId={sellerDetails?.supplierId || ''}
          email={sellerEmailForCard}
          shopName={shopDisplayName}
          sellerDetails={sellerDetails}
          inviteStatus={accountStatusForUi}
          accountType={accountType}
        />

        <SellerDetailsTabs
          ordersData={ordersData}
          ordersByStatus={ordersByStatus}
          isLoading={ordersLoading}
          isStatusLoading={statusLoading}
          ordersError={ordersError}
          refetchOrders={() => {
            refetchOrders();
          }}
          ordersByStatusError={ordersByStatusError}
          refetchOrdersByStatus={() => {
            refetchOrdersByStatus();
          }}
          onPageChange={setOrdersPage}
          tenantId={tenantId}
          storeDisplayName={shopDisplayName}
          sellerDetails={sellerDetails}
          ordersSearchValue={orderSearchInput}
          onOrdersSearchChange={setOrderSearchInput}
          orderShippingFilter={orderShippingFilter}
          onOrderShippingFilterChange={setOrderShippingFilter}
          orderStatusFilter={orderStatusFilter}
          onOrderStatusFilterChange={setOrderStatusFilter}
          orderDateRange={orderDateRange}
          onOrderDateRangeChange={setOrderDateRange}
        />
      </div>
    </SellerDetailsPageShell>
  );
}
