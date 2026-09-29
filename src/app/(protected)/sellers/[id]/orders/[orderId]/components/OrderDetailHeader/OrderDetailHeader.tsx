/* eslint-disable import/order */

'use client';

import { useState } from 'react';

import { useLocalization } from '@/hooks/useLocalization';
import { BackButton } from '@/components/BackButton';
import { formatDateTimeInTimeZone, SAUDI_TZ_LABEL } from '@/utils/dateHelpers';

import { RejectQcPopup } from '../RejectQcPopup';
import { RequestAwbConfirmPopup } from '../RequestAwbConfirmPopup';
import {
  SplAwbStatusPopup,
  type SplAwbPopupStatus,
} from '../SplAwbStatusPopup';
import { formatOrderId } from '@/app/(protected)/sellers/components/SellerDetailsTabs/sellerOrderHelpers';
import { CopyClipboardButton } from '@/components/CopyClipboardButton';

import { OrderDetailBadgesRow } from './components/OrderDetailBadgesRow';
import { OrderDetailHeaderActions } from './components/OrderDetailHeaderActions';
import { deriveHeaderUiModel } from './deriveHeaderUiModel';

interface OrderDetailHeaderProps {
  orderNumber: string;
  fullOrderId: string;
  referenceId?: string | null;
  status: string;
  placedDate: string;
  shippingOption: string;
  awbUploaded?: boolean;
  isAwbGenerating?: boolean;
  hasProofUploaded?: boolean;
  hasQcProof?: boolean;
  isMarkingReceived?: boolean;
  isRejectingQc?: boolean;
  isRequestingAwb?: boolean;
  awbRequestedAt?: string;
  awbNumber?: string;
  onMarkAsReceived?: () => void;
  onRejectQc?: (file: File) => Promise<boolean>;
  onRequestAwbAndShip?: () => Promise<boolean>;
  onViewSellerProof?: () => void;
  onViewQcProof?: () => void;
  onDownloadAwb?: () => void;
}

export function OrderDetailHeader({
  orderNumber,
  fullOrderId,
  referenceId,
  status,
  placedDate,
  shippingOption,
  awbUploaded = false,
  isAwbGenerating = false,
  hasProofUploaded = false,
  hasQcProof = false,
  isMarkingReceived = false,
  isRejectingQc = false,
  isRequestingAwb = false,
  awbRequestedAt,
  awbNumber = '',
  onMarkAsReceived,
  onRejectQc,
  onRequestAwbAndShip,
  onViewSellerProof,
  onViewQcProof,
  onDownloadAwb,
}: Readonly<OrderDetailHeaderProps>) {
  const { translate, dir } = useLocalization('order-details');
  const displayOrderId = formatOrderId(fullOrderId);
  const [copied, setCopied] = useState(false);
  const [rejectQcOpen, setRejectQcOpen] = useState(false);
  const [requestAwbOpen, setRequestAwbOpen] = useState(false);
  const [splPopupOpen, setSplPopupOpen] = useState(false);
  const [splPopupStatus, setSplPopupStatus] =
    useState<SplAwbPopupStatus>('generating');

  const openSplAwbPopup = (next: SplAwbPopupStatus) => {
    setSplPopupStatus(next);
    setSplPopupOpen(true);
  };

  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(fullOrderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      return;
    }
  };

  const model = deriveHeaderUiModel(
    status,
    shippingOption,
    awbUploaded,
    isAwbGenerating,
    hasProofUploaded,
    hasQcProof,
    translate,
  );

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-4">
            <BackButton id="order-header-back-button" />
          </div>
          <OrderDetailBadgesRow
            orderNumber={orderNumber}
            copied={copied}
            onCopyOrderId={handleCopyOrderId}
            model={model}
            translate={translate}
          />
          <div className="flex items-center gap-2 mt-2">
            <span
              className="text-base font-medium uppercase text-mds-black-900"
              title={
                (referenceId?.trim().toUpperCase().length ?? 0) > 24
                  ? referenceId!.trim().toUpperCase()
                  : undefined
              }
            >
              {(() => {
                const upper = referenceId?.trim().toUpperCase();
                if (!upper) return '—';
                return upper.length > 24 ? `${upper.slice(0, 24)}...` : upper;
              })()}
            </span>
            <CopyClipboardButton
              textToCopy={referenceId?.trim() ?? ''}
              hideIfEmpty
              ariaLabel={translate('copyReferenceId')}
              title={translate('copyReferenceId')}
              copiedTitle={translate('copied')}
            />
          </div>
          <p className="mt-2 text-base font-medium text-mds-black-900">
            {translate('placedOn')} {formatDateTimeInTimeZone(placedDate)}{' '}
            <span className="text-xs">{SAUDI_TZ_LABEL}</span>
          </p>
        </div>

        {model.hasHeaderActionsColumn ? (
          <OrderDetailHeaderActions
            model={model}
            dir={dir}
            isRejectingQc={isRejectingQc}
            isMarkingReceived={isMarkingReceived}
            isRequestingAwb={isRequestingAwb}
            onMarkAsReceived={onMarkAsReceived}
            onViewSellerProof={onViewSellerProof}
            onViewQcProof={onViewQcProof}
            onDownloadAwb={onDownloadAwb}
            openRejectQc={() => setRejectQcOpen(true)}
            openRequestAwb={() => setRequestAwbOpen(true)}
            openSplAwbPopup={openSplAwbPopup}
            translate={translate}
          />
        ) : null}
      </div>

      <RejectQcPopup
        isOpen={rejectQcOpen}
        isLoading={isRejectingQc}
        onClose={() => setRejectQcOpen(false)}
        onConfirm={async (file) => {
          const ok = (await onRejectQc?.(file)) ?? false;
          if (ok) setRejectQcOpen(false);
        }}
      />

      <RequestAwbConfirmPopup
        isOpen={requestAwbOpen}
        isLoading={isRequestingAwb}
        onClose={() => setRequestAwbOpen(false)}
        onConfirm={async () => {
          if (!onRequestAwbAndShip) return;
          const ok = await onRequestAwbAndShip();
          if (ok) setRequestAwbOpen(false);
        }}
      />

      <SplAwbStatusPopup
        isOpen={splPopupOpen}
        onClose={() => setSplPopupOpen(false)}
        status={splPopupStatus}
        onStatusChange={setSplPopupStatus}
        awbRequestedAt={awbRequestedAt}
        orderId={displayOrderId}
        awbNumber={awbNumber || undefined}
        onDownload={() => {
          setSplPopupOpen(false);
          onDownloadAwb?.();
        }}
      />
    </div>
  );
}
