'use client';

import { Copy, ExternalLink, LocateFixed } from 'lucide-react';
import { Button, ContentCard } from '@merit-incentives/ui';
import { useState } from 'react';

import { LabelValue } from '@/components';
import { useLocalization } from '@/hooks/useLocalization';
import { ShippingProvider } from '@/lib/enums';
import { isMeritShipping } from '@/utils/orderDetailStatus';

function normalizeExternalUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

interface TrackingDetailsProps {
  shippingProvider?: ShippingProvider | null;
  orderStatus?: string | null;
  carrierName?: string;
  trackingId?: string;
  trackingUrl?: string;
}

export function TrackingDetails({
  shippingProvider,
  carrierName,
  trackingId,
  trackingUrl,
}: Readonly<TrackingDetailsProps>) {
  const { translate } = useLocalization('order-details');
  const [copied, setCopied] = useState(false);

  const hasTrackingId = Boolean(trackingId?.trim());
  if (!hasTrackingId) return null;

  const hasTrackingUrl = Boolean(trackingUrl?.trim());
  const disabled = !hasTrackingUrl;

  const isSpl = isMeritShipping(shippingProvider ?? undefined);
  const hasCarrierForNonSpl = Boolean(carrierName?.trim());
  if (!isSpl && !hasCarrierForNonSpl) return null;

  const normalizedTrackingId = trackingId?.trim() || '';

  const trackingIdNode = (
    <div className="flex items-center gap-2">
      <span>{normalizedTrackingId || '-'}</span>
      {normalizedTrackingId ? (
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(normalizedTrackingId);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              // ignore
            }
          }}
          className={
            copied
              ? 'cursor-pointer rounded-md p-1 transition-colors bg-mds-success-50 hover:bg-mds-success-100'
              : 'cursor-pointer rounded-md p-1 transition-colors hover:bg-mds-gray-100'
          }
          aria-label="Copy tracking ID"
          title={copied ? 'Copied!' : 'Copy tracking ID'}
        >
          <Copy
            className={`h-3.5 w-3.5 ${copied ? 'text-mds-success-500' : 'text-mds-gray-500'}`}
          />
        </button>
      ) : null}
    </div>
  );

  return (
    <ContentCard className="p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <LocateFixed className="h-6 w-6 text-mds-black-700" />
        <h2 className="text-lg font-medium text-mds-black-900">
          {translate('trackingDetails')}
        </h2>
      </div>

      {isSpl ? (
        <div className="grid grid-cols-1 gap-y-6">
          <LabelValue
            label={translate('awbNumberOrTrackingId')}
            value={trackingIdNode}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <LabelValue
            label={translate('carrier')}
            value={carrierName?.trim() ? carrierName.trim() : '-'}
          />
          <LabelValue label={translate('trackingId')} value={trackingIdNode} />
        </div>
      )}

      <div className="mt-6">
        <Button
          disabled={disabled}
          onClick={() => {
            if (!trackingUrl?.trim()) return;
            globalThis.open(normalizeExternalUrl(trackingUrl), '_blank');
          }}
          className={
            disabled
              ? 'w-full cursor-not-allowed bg-mds-black-100 py-6 text-base font-medium text-mds-black-400'
              : 'w-full bg-mds-primary-100 py-6 text-base font-medium text-mds-primary-700 hover:bg-mds-primary-200'
          }
          leftIcon={<ExternalLink className="h-5 w-5" />}
        >
          {isSpl ? translate('trackPackageSpl') : translate('trackPackage')}
        </Button>
      </div>
    </ContentCard>
  );
}
