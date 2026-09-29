'use client';

import { Button } from '@merit-incentives/ui';
import { ArrowRight } from 'lucide-react';

import { useLocalization } from '@/hooks';

import {
  formatTopUpSubmittedAt,
  formatWalletAmountMinorOrUnknown,
  hasWalletAmountMinor,
} from '../../utils/walletTopUpFormatters';
import type { PendingReviewTransfer } from '../../utils/walletTopUpTypes';

interface PendingReviewBannerProps {
  pendingReview: PendingReviewTransfer;
  onReviewRequest?: () => void;
}

export function PendingReviewBanner({
  pendingReview,
  onReviewRequest,
}: Readonly<PendingReviewBannerProps>) {
  const { locale, translate } = useLocalization('tenant-details.walletTopUp');
  const formattedAmount = formatWalletAmountMinorOrUnknown(
    pendingReview.amountMinor,
    pendingReview.minorUnit,
    translate('display.unknownAmount'),
  );
  const amountDisplay = hasWalletAmountMinor(pendingReview.amountMinor)
    ? `${pendingReview.currencyCode} ${formattedAmount}`
    : formattedAmount;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-mds-casablanca-100 bg-white/70 px-4 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-mds-black-900">
            {translate('pendingReview.title', {
              count: String(pendingReview.count),
            })}
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-mds-casablanca-50 px-2.5 py-0.5 text-xs font-medium text-mds-casablanca-700">
            <span
              className="h-1.5 w-1.5 rounded-full bg-mds-casablanca-500"
              aria-hidden
            />
            {translate('pendingReview.badge')}
          </span>
        </div>
        <p className="text-sm text-mds-black-700">
          {amountDisplay} -{' '}
          {formatTopUpSubmittedAt(
            pendingReview.submittedAt,
            translate('today'),
            locale,
          )}
        </p>
        {pendingReview.count > 1 ? (
          <p className="text-xs text-mds-black-500">
            {translate('pendingReview.nextInQueue')}
          </p>
        ) : null}
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="shrink-0 self-start border border-mds-black-200 bg-white px-4 text-mds-black-900 hover:bg-mds-black-50 sm:self-center"
        rightIcon={<ArrowRight className="h-4 w-4" />}
        onClick={onReviewRequest}
      >
        {translate('pendingReview.reviewRequest')}
      </Button>
    </div>
  );
}
