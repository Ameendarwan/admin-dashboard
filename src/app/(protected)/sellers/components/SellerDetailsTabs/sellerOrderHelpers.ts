import type { BadgeColor } from '@merit-incentives/ui';

import type { Order } from '@/types/seller';
import { getOrderStatusBadgeColor } from '@/utils/orderDetailStatus';
import { formatCurrency } from '@/lib/utils';

export function formatOrderId(
  merchandizeOrderId: string | undefined | null,
): string {
  if (!merchandizeOrderId) return '';
  const id = merchandizeOrderId.startsWith('ORD-')
    ? merchandizeOrderId.slice(4)
    : merchandizeOrderId;
  const truncatedId = id.slice(0, 8);
  return `ORD-${truncatedId}`;
}

export function formatOrderTotal(currency: string, amount: number): string {
  return formatCurrency(amount ?? 0, currency || 'USD');
}

export function orderStatusBadgeColor(status: string): BadgeColor {
  return getOrderStatusBadgeColor(status) as BadgeColor;
}

/** Short label for the orders table shipping column (aligned with filter option wording). */
export function getOrderShippingColumnLabel(
  provider: Order['shippingProvider'],
  translate: (key: string) => string,
): string {
  if (provider === 'merit_logistics') return translate('orders.shippingSpl');
  if (provider === 'self_managed') return translate('orders.shippingSelf');
  if (provider === 'ship_to_merit') return 'STM';
  return '-';
}

export function shippingProviderBadgeColor(
  provider: Order['shippingProvider'],
): BadgeColor {
  if (!provider) return 'gray';
  if (provider === 'merit_logistics') return 'primary';
  if (provider === 'self_managed') return 'gray';
  if (provider === 'ship_to_merit') return 'electricBlue';
  return 'primary';
}

export function getOrderStatusTranslationKey(status: string): string {
  switch (status) {
    case 'SHIPPED_TO_MERIT_PENDING,SHIPPED_TO_MERIT_COMPLETE':
      return 'orderStatus.shippedToMerit';
    case 'IN_PROCESS':
      return 'orderStatus.new';
    case 'CONFIRMED':
      return 'orderStatus.accepted';
    case 'READY_TO_SHIP':
      return 'orderStatus.readyToShip';
    case 'SHIPPED':
      return 'orderStatus.shipped';
    case 'DELIVERED':
      return 'orderStatus.delivered';
    case 'CANCELED':
      return 'orderStatus.canceled';
    case 'SHIPPED_TO_MERIT_PENDING':
      return 'orderStatus.arrivalPending';
    case 'SHIPPED_TO_MERIT_COMPLETE':
      return 'orderStatus.receivedByMerit';
    case 'RETURN_PENDING,RETURN_COMPLETE':
      return 'orderStatus.qcFailed';
    case 'RETURN_PENDING':
    case 'RETURN_COMPLETE':
      return 'orderStatus.qcFailed';
    default:
      return 'orderStatus.unknown';
  }
}

export function getOrderCustomerDisplayName(
  order: Order,
  fallback: string,
): string {
  const fullName = [order.customerFirstName, order.customerLastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  if (fullName) return fullName;
  if (order.orderTenantName) return order.orderTenantName;
  if (order.customerEmail) return order.customerEmail;
  return fallback;
}
