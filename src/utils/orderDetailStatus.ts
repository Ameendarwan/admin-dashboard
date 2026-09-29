import {
  OrderStatus,
  ORDER_STATUS_LABELS,
  ShippingProvider,
} from '@/lib/enums';

export type BadgeColor =
  | 'primary'
  | 'electricBlue'
  | 'success'
  | 'warning'
  | 'error'
  | 'gray';

export function getOrderStatusBadgeColor(status: string): BadgeColor {
  switch (status) {
    case OrderStatus.ACCEPTED:
    case OrderStatus.CONFIRMED:
      return 'primary';
    case OrderStatus.SHIPPED:
      return 'electricBlue';
    case OrderStatus.DELIVERED:
      return 'success';
    case OrderStatus.READY_TO_SHIP:
      return 'warning';
    case OrderStatus.CANCELLED:
    case OrderStatus.CANCELED:
      return 'error';
    case OrderStatus.SHIPPED_TO_MERIT_PENDING:
      return 'warning';
    case OrderStatus.SHIPPED_TO_MERIT_COMPLETE:
      return 'electricBlue';
    case OrderStatus.RETURN_PENDING:
    case OrderStatus.RETURN_COMPLETE:
      return 'error';
    default:
      return 'gray';
  }
}

export function getShipToMeritDetailBadgeColor(status: string): BadgeColor {
  switch (status) {
    case OrderStatus.SHIPPED_TO_MERIT_PENDING:
      return 'warning';
    case OrderStatus.SHIPPED_TO_MERIT_COMPLETE:
      return 'success';
    case OrderStatus.RETURN_PENDING:
      return 'warning';
    case OrderStatus.RETURN_COMPLETE:
      return 'success';
    default:
      return 'gray';
  }
}

export function getOrderHeaderStatusLabel(status: string): string {
  switch (status) {
    case OrderStatus.NEW:
    case OrderStatus.IN_PROCESS:
      return ORDER_STATUS_LABELS[OrderStatus.NEW];
    case OrderStatus.ACCEPTED:
    case OrderStatus.CONFIRMED:
      return 'Accepted';
    case OrderStatus.SHIPPED_TO_MERIT_PENDING:
    case OrderStatus.SHIPPED_TO_MERIT_COMPLETE:
      return 'Shipped to Merit';
    case OrderStatus.RETURN_PENDING:
    case OrderStatus.RETURN_COMPLETE:
      return 'QC Failed - Awaiting replacement';
    case OrderStatus.READY_TO_SHIP:
    case OrderStatus.SHIPPED:
    case OrderStatus.DELIVERED:
      return ORDER_STATUS_LABELS[status as OrderStatus] || status;
    default:
      return ORDER_STATUS_LABELS[status as OrderStatus] || status;
  }
}

export function isMeritShipping(provider: string | null | undefined): boolean {
  return (
    provider === ShippingProvider.MERIT_LOGISTICS ||
    provider === ShippingProvider.BY_MERIT
  );
}

export function isShipToMeritShipping(
  provider: string | null | undefined,
): boolean {
  return provider === ShippingProvider.SHIP_TO_MERIT;
}

export function isShipToMeritStatus(status: string): boolean {
  return (
    status === OrderStatus.SHIPPED_TO_MERIT_PENDING ||
    status === OrderStatus.SHIPPED_TO_MERIT_COMPLETE ||
    status === OrderStatus.RETURN_PENDING ||
    status === OrderStatus.RETURN_COMPLETE
  );
}
