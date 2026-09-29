import type { OrdersByStatus } from '@/types/seller';

export type OrdersOverviewStatusKey = Extract<
  keyof OrdersByStatus,
  'IN_PROCESS' | 'CONFIRMED' | 'READY_TO_SHIP' | 'SHIPPED' | 'DELIVERED'
>;

export type OrdersOverviewTitleKey =
  | 'orderStatus.new'
  | 'orderStatus.accepted'
  | 'orderStatus.readyToShip'
  | 'orderStatus.shipped'
  | 'orderStatus.delivered';

export const ORDERS_OVERVIEW_METRICS: ReadonlyArray<{
  readonly statusKey: OrdersOverviewStatusKey;
  readonly titleKey: OrdersOverviewTitleKey;
}> = [
  { statusKey: 'IN_PROCESS', titleKey: 'orderStatus.new' },
  { statusKey: 'CONFIRMED', titleKey: 'orderStatus.accepted' },
  { statusKey: 'READY_TO_SHIP', titleKey: 'orderStatus.readyToShip' },
  { statusKey: 'SHIPPED', titleKey: 'orderStatus.shipped' },
  { statusKey: 'DELIVERED', titleKey: 'orderStatus.delivered' },
];

export const ORDER_TABLE_STATUSES: string[] = [
  'IN_PROCESS',
  'CONFIRMED',
  'SHIPPED_TO_MERIT_PENDING,SHIPPED_TO_MERIT_COMPLETE',
  'READY_TO_SHIP',
  'SHIPPED',
  'DELIVERED',
  'RETURN_PENDING,RETURN_COMPLETE',
  'CANCELED',
];
