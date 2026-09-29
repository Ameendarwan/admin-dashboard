'use client';

import { Copy, Download, FileText } from 'lucide-react';
import { Badge } from '@merit-incentives/ui';

import type { HeaderUiModel, TranslateFn } from '../../deriveHeaderUiModel';

interface OrderDetailBadgesRowProps {
  orderNumber: string;
  copied: boolean;
  onCopyOrderId: () => void;
  model: HeaderUiModel;
  translate: TranslateFn;
}

export function OrderDetailBadgesRow({
  orderNumber,
  copied,
  onCopyOrderId,
  model,
  translate,
}: Readonly<OrderDetailBadgesRowProps>) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <h1 className="text-[28px] font-medium text-mds-black-900">
          {orderNumber}
        </h1>
        <button
          type="button"
          onClick={onCopyOrderId}
          className="cursor-pointer rounded-md p-1.5 transition-colors hover:bg-mds-gray-100"
          aria-label="Copy order ID"
          title={copied ? 'Copied!' : 'Copy full order ID'}
        >
          <Copy
            className={`h-4 w-4 ${copied ? 'text-mds-success-500' : 'text-mds-gray-500'}`}
          />
        </button>
      </div>
      <Badge
        color={model.mainBadgeColor}
        leftIcon
        size="lg"
        className="capitalize"
      >
        {model.statusLabel}
      </Badge>
      {model.showDetailBadge && model.detailLabel && model.detailBadgeColor ? (
        <Badge color={model.detailBadgeColor} leftIcon size="lg">
          {model.detailLabel}
        </Badge>
      ) : null}
      {model.showAwbUploadedPill ? (
        <div className="inline-flex items-center gap-2 rounded-full bg-mds-success-50 px-4 py-2 text-sm font-medium text-mds-success-500">
          <FileText className="h-4 w-4" />
          {translate('awbUploaded')}
        </div>
      ) : null}
      {model.showMeritLogisticsAwbReadyPill ? (
        <div className="inline-flex items-center gap-2 rounded-full bg-mds-success-50 px-4 py-2 text-sm font-medium text-mds-success-500">
          <Download className="h-4 w-4" />
          {translate('actions.awbReady')}
        </div>
      ) : null}
    </div>
  );
}
