'use client';

import { useRef } from 'react';
import { Package, Printer, ShoppingBag } from 'lucide-react';
import { ContentCard } from '@merit-incentives/ui';

import { useLocalization } from '@/hooks/useLocalization';

import { buildOrderItemsPrintHtml } from './orderItemsPrint';

interface OrderItem {
  name: string;
  sku: string;
  quantity: number;
  price: string;
}

interface OrderItemsProps {
  orderId?: string;
  items: OrderItem[];
}

export function OrderItems({ orderId, items }: Readonly<OrderItemsProps>) {
  const { translate } = useLocalization('order-details');
  const printFrameRef = useRef<HTMLIFrameElement>(null);

  const handlePrintItems = () => {
    const html = buildOrderItemsPrintHtml(
      orderId ?? '',
      items.map((i) => ({ name: i.name, sku: i.sku, quantity: i.quantity })),
      {
        title: translate('printOrderItemsTitle'),
        no: translate('no'),
        name: translate('itemName'),
        sku: translate('skuId'),
        quantity: translate('qty'),
      },
    );
    const iframe = printFrameRef.current;
    if (!iframe) return;
    iframe.srcdoc = html;
    iframe.onload = () => {
      iframe.contentWindow?.print();
      iframe.onload = null;
    };
  };

  return (
    <ContentCard className="flex flex-col gap-5 p-4 sm:p-6">
      <iframe
        ref={printFrameRef}
        title="Print order items"
        className="hidden"
        aria-hidden
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-mds-neutral-700" />
          <h2 className="text-lg font-medium text-mds-black-900">
            {translate('orderItems')}
          </h2>
        </div>
        <button
          type="button"
          onClick={handlePrintItems}
          className="flex cursor-pointer items-center gap-2 rounded text-base font-medium text-mds-primary-700 hover:text-mds-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-mds-primary-500 focus-visible:ring-offset-2"
        >
          <Printer className="h-5 w-5 text-mds-primary-700" />
          <span>{translate('printItems')}</span>
        </button>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.sku} className="rounded-lg bg-mds-neutral-100">
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-mds-bg-light-50 p-4 sm:flex-row">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mds-primary-100">
                  <ShoppingBag className="h-6 w-6 text-mds-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-normal text-mds-neutral-900">
                    {item.name}
                  </h3>
                  <p className="text-sm font-medium text-mds-black-500">
                    {translate('sku')}: {item.sku}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-lg font-normal text-mds-neutral-900">
                  {translate('qty')}: {item.quantity}
                </p>
                <p className="text-lg font-normal text-mds-neutral-900">
                  {item.price}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ContentCard>
  );
}
