'use client';

import * as RadixTooltip from '@radix-ui/react-tooltip';
import { Copy, ExternalLink } from 'lucide-react';
import React from 'react';

import type { Order } from '@/types/seller';
import { ensureHttpOrHttpsUrl } from '@/utils/urlUtils';

interface OrderTrackingCellProps {
  readonly row: Order;
  readonly translate: (key: string) => string;
}

export function OrderTrackingCell({ row, translate }: OrderTrackingCellProps) {
  const [copied, setCopied] = React.useState(false);
  const hasTracking = Boolean(row.trackingId);
  if (!hasTracking) {
    return (
      <RadixTooltip.Root delayDuration={0}>
        <RadixTooltip.Trigger asChild>
          <button
            type="button"
            className="inline-block cursor-default border-0 bg-transparent p-0 font-inherit text-mds-gray-400"
            onClick={(e) => e.stopPropagation()}
          >
            {translate('table.carrierTrackingPending')}
          </button>
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side='bottom'
            className="z-9999 max-w-xs rounded-md bg-mds-black-900 p-mds-sm text-xs text-mds-white-50 shadow-md"
          >
            {translate('table.carrierTrackingPendingTooltip')}
            <RadixTooltip.Arrow className="fill-mds-black-900" height={6} width={12} />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    );
  }

  const isSpl = row.shippingProvider === 'merit_logistics';
  const baseName = row.carrierName?.trim();
  let carrierLabel = 'Self';
  if (isSpl) {
    carrierLabel = 'SPL';
  } else if (baseName) {
    carrierLabel = baseName;
  }
  const tracking = row.trackingId ?? '';
  const truncated =
    tracking.length > 12 ? `${tracking.slice(0, 12)}...` : tracking;
  const hasUrl = Boolean(row.trackingUrl?.trim());

  const copyTrackingId = async (event: React.MouseEvent) => {
    event.stopPropagation();
    const value = tracking.trim();
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const openTrackingUrl = (event: React.MouseEvent) => {
    event.stopPropagation();
    const raw = row.trackingUrl?.trim();
    if (!raw) return;
    const href = ensureHttpOrHttpsUrl(raw);
    globalThis.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center justify-between gap-2 whitespace-nowrap">
      <div className="flex flex-col">
        <span className="whitespace-nowrap font-medium">{carrierLabel}</span>
        <span className="flex items-center gap-1.5 whitespace-nowrap text-sm text-mds-gray-700">
          <span>{truncated}</span>
          <button
            type="button"
            onClick={copyTrackingId}
            className={
              copied
                ? 'cursor-pointer rounded-md p-1 transition-colors bg-mds-success-50 hover:bg-mds-success-100'
                : 'cursor-pointer rounded-md p-1 transition-colors hover:bg-mds-gray-100'
            }
            aria-label={translate('orders.copyTrackingId')}
            title={copied ? 'Copied!' : translate('orders.copyTrackingId')}
          >
            <Copy
              className={`h-3.5 w-3.5 ${copied ? 'text-mds-success-500' : 'text-mds-gray-500'}`}
            />
          </button>
        </span>
      </div>
      <button
        type="button"
        disabled={!hasUrl}
        onClick={openTrackingUrl}
        className="rounded p-1 enabled:cursor-pointer enabled:hover:bg-mds-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={translate('orders.carrierTrackingOpenLink')}
      >
        <ExternalLink className="h-5 w-5 text-mds-primary-600" />
      </button>
    </div>
  );
}
