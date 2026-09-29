'use client';

import { LoadingSpinner } from '@merit-incentives/ui';
import { useQuery } from '@tanstack/react-query';
import { use } from 'react';

import { getSellerOrderById } from '@/services/sellerService';
import { TableStateDisplay } from '@/components/TableStateDisplay';
import { useLocalization } from '@/hooks/useLocalization';

import {
  OrderDetailPageFrame,
  OrderDetailHeader,
  OrderItems,
  ShippingInformation,
  TrackingDetails,
  Instructions,
  CustomerDetails,
  OrderTimeline,
} from './components';
import { useAdminOrderDetail } from './hooks/useAdminOrderDetail';
import { useAdminOrderActions } from './hooks/useAdminOrderActions';

interface PageProps {
  params: Promise<{ id: string; orderId: string }>;
}

export default function AdminSellerOrderDetailPage({
  params,
}: Readonly<PageProps>) {
  const { id: tenantId, orderId } = use(params);
  const { translate: translateSeller } = useLocalization('seller-details');

  const {
    data: orderDetail,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['seller-order', tenantId, orderId],
    queryFn: () => getSellerOrderById(tenantId, orderId),
    enabled: Boolean(tenantId && orderId),
  });

  const { orderData, isAwbGeneratingFromData, awbRequestedAt } =
    useAdminOrderDetail(orderDetail);

  const {
    isMarkingReceived,
    isRejectingQc,
    isRequestingAwb,
    handleMarkAsReceived,
    handleRejectQc,
    handleRequestAwbAndShip,
    handleViewSellerProof,
    handleViewQcProof,
    handleDownloadAwb,
  } = useAdminOrderActions({ tenantId, orderId, refetch });

  if (isLoading) {
    return (
      <OrderDetailPageFrame>
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </OrderDetailPageFrame>
    );
  }

  if (error || !orderData) {
    return (
      <OrderDetailPageFrame>
        <TableStateDisplay
          type="error"
          title={translateSeller('errors.loadOrders')}
          description={
            error instanceof Error ? error.message : 'Unable to load order'
          }
          showRetryButton
          onRetry={() => {
            refetch();
          }}
          retryButtonText={translateSeller('retry')}
        />
      </OrderDetailPageFrame>
    );
  }

  return (
    <OrderDetailPageFrame>
      <div className="flex w-full flex-col">
        <OrderDetailHeader
          orderNumber={orderData.orderNumber}
          fullOrderId={orderData.fullOrderId}
          referenceId={orderData.referenceId}
          status={orderData.status}
          placedDate={orderData.placedDate}
          shippingOption={orderData.shippingOption}
          awbUploaded={orderData.awbUploaded}
          isAwbGenerating={isAwbGeneratingFromData}
          hasProofUploaded={orderData.hasProofUploaded}
          hasQcProof={orderData.hasQcProof}
          isMarkingReceived={isMarkingReceived}
          isRejectingQc={isRejectingQc}
          isRequestingAwb={isRequestingAwb}
          awbRequestedAt={awbRequestedAt}
          awbNumber={orderData.awbNumber}
          onMarkAsReceived={handleMarkAsReceived}
          onRejectQc={handleRejectQc}
          onRequestAwbAndShip={handleRequestAwbAndShip}
          onViewSellerProof={handleViewSellerProof}
          onViewQcProof={handleViewQcProof}
          onDownloadAwb={handleDownloadAwb}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <OrderItems
              orderId={orderData.fullOrderId}
              items={orderData.items}
            />
            <ShippingInformation {...orderData.shipping} />
            <TrackingDetails
              shippingProvider={orderData.shippingOption}
              orderStatus={orderData.status}
              carrierName={orderData.shipping.carrierName}
              trackingId={orderData.shipping.trackingId}
              trackingUrl={orderData.shipping.trackingUrl}
            />
            <Instructions instructions={orderData.instructions || null} />
          </div>

          <div className="space-y-8">
            <CustomerDetails {...orderData.customer} />
            <OrderTimeline timelineItems={orderData.timeline} />
          </div>
        </div>
      </div>
    </OrderDetailPageFrame>
  );
}
