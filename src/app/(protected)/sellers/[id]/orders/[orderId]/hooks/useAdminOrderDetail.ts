import React, { useMemo } from 'react';

import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency } from '@/lib/utils';
import {
  OrderStatus,
  ShippingProvider,
  SHIP_TO_MERIT_TIMELINE_CYCLE_STATUSES,
} from '@/lib/enums';
import type { OrderDetail } from '@/types/orderDetail';
import { formatOrderId } from '@/app/(protected)/sellers/components/SellerDetailsTabs/sellerOrderHelpers';

function getShippingPartnerLabel(provider: string | null): string {
  if (provider === ShippingProvider.MERIT_LOGISTICS) return 'Merit Logistics';
  if (provider === ShippingProvider.SHIP_TO_MERIT) return 'Ship to Merit';
  return 'Self Managed';
}

function buildShipToMeritTimeline(
  orderDetail: OrderDetail,
  translate: (key: string) => string,
) {
  const statusHistory = orderDetail.statusHistory ?? [];
  const placedAt = orderDetail.placedAt || new Date().toISOString();

  const items: { label: React.ReactNode; date: string; completed: boolean }[] =
    [];

  items.push({
    label: translate('timeline.orderPlaced'),
    date: placedAt,
    completed: true,
  });

  const acceptedEntry = statusHistory.find((h) =>
    ['confirmed', 'accepted'].includes(h.status.toLowerCase()),
  );
  items.push({
    label: acceptedEntry
      ? translate('timeline.accepted')
      : translate('timeline.awaitingAcceptance'),
    date: acceptedEntry?.createdAt || '-',
    completed: Boolean(acceptedEntry),
  });

  const stmHistoryEntries = statusHistory
    .filter((h) =>
      SHIP_TO_MERIT_TIMELINE_CYCLE_STATUSES.includes(h.status as OrderStatus),
    )
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

  const stmLabel = (suffix: 'Pending' | 'Received') =>
    React.createElement(
      'span',
      null,
      translate('timeline.shippedToMerit'),
      ' ',
      React.createElement(
        'span',
        { className: 'text-sm font-normal text-mds-gray-600' },
        `(${suffix})`,
      ),
    );

  const qcLabel = (suffix: 'Return pending' | 'Return complete') =>
    React.createElement(
      'span',
      null,
      'QC Failed',
      ' ',
      React.createElement(
        'span',
        { className: 'text-sm font-normal text-mds-gray-600' },
        `(${suffix})`,
      ),
    );

  if (stmHistoryEntries.length === 0) {
    items.push({
      label: stmLabel('Pending'),
      date: '-',
      completed: false,
    });
  } else {
    for (const h of stmHistoryEntries) {
      switch (h.status) {
        case OrderStatus.SHIPPED_TO_MERIT_PENDING:
          items.push({
            label: stmLabel('Pending'),
            date: h.createdAt,
            completed: true,
          });
          break;
        case OrderStatus.SHIPPED_TO_MERIT_COMPLETE:
          items.push({
            label: stmLabel('Received'),
            date: h.createdAt,
            completed: true,
          });
          break;
        case OrderStatus.RETURN_PENDING:
          items.push({
            label: qcLabel('Return pending'),
            date: h.createdAt,
            completed: true,
          });
          break;
        case OrderStatus.RETURN_COMPLETE:
          items.push({
            label: qcLabel('Return complete'),
            date: h.createdAt,
            completed: true,
          });
          break;
        default:
          break;
      }
    }
  }

  const readyToShipEntry = statusHistory.find(
    (h) => h.status.toLowerCase() === 'ready_to_ship',
  );
  items.push({
    label: translate('timeline.readyToShip'),
    date: readyToShipEntry?.createdAt || '-',
    completed: Boolean(readyToShipEntry),
  });

  const shippedEntry = statusHistory.find(
    (h) => h.status.toLowerCase() === 'shipped',
  );
  items.push({
    label: translate('timeline.shipped'),
    date: shippedEntry?.createdAt || '-',
    completed: Boolean(shippedEntry),
  });

  const deliveredEntry = statusHistory.find(
    (h) => h.status.toLowerCase() === 'delivered',
  );
  items.push({
    label: translate('timeline.delivered'),
    date: deliveredEntry?.createdAt || '-',
    completed: Boolean(deliveredEntry),
  });

  return items;
}

function buildTimeline(
  orderDetail: OrderDetail,
  translate: (key: string) => string,
) {
  if (orderDetail.shippingProvider === ShippingProvider.SHIP_TO_MERIT) {
    return buildShipToMeritTimeline(orderDetail, translate);
  }

  const statusHistory = orderDetail.statusHistory ?? [];

  const findFirstDateForStatuses = (statuses: string[]) => {
    const match = statusHistory.find((h) =>
      statuses.includes(h.status.toLowerCase()),
    );
    return match?.createdAt || '';
  };

  const placedAt = orderDetail.placedAt || new Date().toISOString();
  const acceptedAt = findFirstDateForStatuses(['confirmed', 'accepted']);
  const readyToShipAt = findFirstDateForStatuses(['ready_to_ship']);
  const shippedAt = findFirstDateForStatuses(['shipped']);
  const deliveredAt = findFirstDateForStatuses(['delivered']);

  return [
    {
      label: translate('timeline.orderPlaced'),
      date: placedAt,
      completed: true,
    },
    {
      label: acceptedAt
        ? translate('timeline.accepted')
        : translate('timeline.awaitingAcceptance'),
      date: acceptedAt || '-',
      completed: Boolean(acceptedAt),
    },
    {
      label: translate('timeline.readyToShip'),
      date: readyToShipAt || '-',
      completed: Boolean(readyToShipAt),
    },
    {
      label: translate('timeline.shipped'),
      date: shippedAt || '-',
      completed: Boolean(shippedAt),
    },
    {
      label: translate('timeline.delivered'),
      date: deliveredAt || '-',
      completed: Boolean(deliveredAt),
    },
  ];
}

export function useAdminOrderDetail(orderDetail: OrderDetail | undefined) {
  const { translate } = useLocalization('order-details');

  const orderData = useMemo(() => {
    if (!orderDetail) return null;

    const shipment = orderDetail.shipmentDetails?.[0];

    return {
      orderNumber: formatOrderId(orderDetail.merchandizeOrderId),
      fullOrderId: orderDetail.merchandizeOrderId || orderDetail.id,
      status: orderDetail.status,
      placedDate: orderDetail.placedAt || new Date().toISOString(),
      shippingOption:
        (orderDetail.shippingProvider as ShippingProvider) ||
        ShippingProvider.SELF_MANAGED,
      items: orderDetail.items.map((item) => ({
        name: item.name || item.sku,
        sku: item.sku,
        quantity: item.qty,
        price: formatCurrency(item.unitPrice, orderDetail.currency),
      })),
      shipping: {
        address: shipment?.addressLine || '',
        shortAddress: shipment?.shortAddress || 'N/A',
        city: shipment?.city || '',
        state: shipment?.state || '',
        country: shipment?.country || '',
        postalCode: shipment?.postalCode || '',
        shippingPartner: getShippingPartnerLabel(orderDetail.shippingProvider),
        trackingId: shipment?.trackingId || '',
        trackingUrl: shipment?.trackingUrl || '',
        carrierName: shipment?.carrierName || '',
      },
      referenceId: orderDetail.referenceId ?? null,
      instructions: orderDetail.instructions || '',
      customer: {
        firstName: orderDetail.customer?.firstName || '',
        lastName: orderDetail.customer?.lastName || '',
        email: orderDetail.customer?.email || '',
        phoneNumber: orderDetail.customer?.phone || '',
      },
      awbUploaded: orderDetail.shipmentDetails?.some((s) =>
        Boolean(s.awbFilePath),
      ),
      awbNumber: shipment?.trackingId || '',
      hasProofUploaded: Boolean(shipment?.proofFilePath),
      hasQcProof: Boolean(shipment?.qcProofFilePath),
      timeline: buildTimeline(orderDetail, translate),
    };
  }, [orderDetail, translate]);

  const { isAwbGeneratingFromData, awbRequestedAt } = useMemo(() => {
    if (!orderDetail) {
      return { isAwbGeneratingFromData: false, awbRequestedAt: undefined };
    }

    const isSplPhaseProvider =
      orderDetail.shippingProvider === ShippingProvider.MERIT_LOGISTICS ||
      orderDetail.shippingProvider === ShippingProvider.SHIP_TO_MERIT;
    const isReadyToShip = orderDetail.status === OrderStatus.READY_TO_SHIP;
    const hasAwbReady = orderDetail.shipmentDetails?.some((s) =>
      Boolean(s.awbFilePath),
    );

    const isGenerating = isSplPhaseProvider && isReadyToShip && !hasAwbReady;

    const readyToShipEntry = orderDetail.statusHistory?.find(
      (h) => h.status.toUpperCase() === 'READY_TO_SHIP',
    );

    return {
      isAwbGeneratingFromData: isGenerating,
      awbRequestedAt: readyToShipEntry?.createdAt,
    };
  }, [orderDetail]);

  return { orderData, isAwbGeneratingFromData, awbRequestedAt };
}
