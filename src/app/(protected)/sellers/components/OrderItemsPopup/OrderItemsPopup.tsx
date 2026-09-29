'use client';

import React from 'react';
import { Button, Popup } from '@merit-incentives/ui';
import { Package } from 'lucide-react';

import type { Order } from '@/types/seller';

import { formatOrderId } from '../SellerDetailsTabs/sellerOrderHelpers';

interface OrderItemsPopupProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  translate: (key: string) => string;
}

export function OrderItemsPopup({
  isOpen,
  order,
  onClose,
  translate,
}: Readonly<OrderItemsPopupProps>) {
  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      className="w-[612px] max-w-[calc(100%-2rem)]"
      aria-label={
        order
          ? formatOrderId(order.merchandizeOrderId)
          : translate('orders.orderItems')
      }
    >
      <Popup.Header
        onClose={onClose}
        className="px-6 py-3 border-b flex items-center border-mds-black-100"
      >
        <h2 className="text-xl font-medium text-mds-black-900">
          {order
            ? `${translate('orders.orderId')}: ${formatOrderId(order.merchandizeOrderId)}`
            : ''}
        </h2>
      </Popup.Header>
      <Popup.Content className="px-6 py-5">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-mds-black-900" />
            <h3 className="text-lg font-medium text-mds-black-900">
              {translate('orders.orderItems')}
            </h3>
          </div>
          <div className="rounded-lg bg-mds-primary-50/60 overflow-hidden">
            <ul>
              {(order?.items ?? []).map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="text-base font-normal text-mds-neutral-900">
                    {item.name}
                  </span>
                  <span className="text-base font-normal text-mds-neutral-700">
                    {translate('orders.qty')}: {item.qty}
                  </span>
                </li>
              ))}
            </ul>
            {(order?.items?.length ?? 0) === 0 && (
              <p className="px-4 py-3 text-sm text-mds-neutral-600">
                {translate('orders.noItems')}
              </p>
            )}
          </div>
        </div>
      </Popup.Content>
      <Popup.Footer className="px-6 py-5">
        <div className="flex w-full gap-4">
          <Button
            variant="tertiary"
            onClick={onClose}
            className="w-full border-2 border-mds-black-300 py-6 text-base font-medium text-mds-black-700 hover:bg-mds-black-50 bg-transparent"
          >
            {translate('orders.close')}
          </Button>
        </div>
      </Popup.Footer>
    </Popup>
  );
}
