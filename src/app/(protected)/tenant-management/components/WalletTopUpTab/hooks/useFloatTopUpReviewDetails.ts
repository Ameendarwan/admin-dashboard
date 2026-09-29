'use client';

import { useLocalization } from '@/hooks';

import type { FloatTopUpDetailRow } from '../components/FloatTopUpDetailRows';
import {
  formatWalletAmountMinor,
  formatWalletAmountMinorOrUnknown,
  hasWalletAmountMinor,
} from '../utils/walletTopUpFormatters';
import { resolveReviewTargetLabel } from '../utils/walletTopUpMappers';
import type { PendingReviewTransfer } from '../utils/walletTopUpTypes';

function formatCurrencyAmount(
  amountMinor: string | null | undefined,
  currencyCode: string,
  minorUnit: number,
  unknownLabel: string,
): string {
  if (!hasWalletAmountMinor(amountMinor)) {
    return unknownLabel;
  }
  return `${currencyCode} ${formatWalletAmountMinor(amountMinor, minorUnit)}`;
}

export function useFloatTopUpReviewDetails(
  tenantName: string,
  pendingReview: PendingReviewTransfer,
  options?: { includeBalances?: boolean },
) {
  const { translate } = useLocalization('tenant-details.walletTopUp');
  const targetLabel = resolveReviewTargetLabel(pendingReview, translate);
  const currencyLabel = pendingReview.isCurrencyEnabled
    ? pendingReview.currencyLabel
    : `${pendingReview.currencyLabel} · ${translate('currency.disabled')}`;
  const formattedAmount = formatWalletAmountMinorOrUnknown(
    pendingReview.amountMinor,
    pendingReview.minorUnit,
    translate('display.unknownAmount'),
  );
  const amountDisplay = hasWalletAmountMinor(pendingReview.amountMinor)
    ? `${pendingReview.currencyCode} ${formattedAmount}`
    : formattedAmount;

  const rows: FloatTopUpDetailRow[] = [
    {
      label: translate('reviewModals.fields.tenant'),
      value: tenantName,
    },
    {
      label: translate('reviewModals.fields.targetWallet'),
      value: targetLabel,
    },
    {
      label: translate('reviewModals.fields.amount'),
      value: amountDisplay,
    },
    {
      label: translate('reviewModals.fields.currency'),
      value: currencyLabel,
    },
    {
      label: translate('reviewModals.fields.reference'),
      value: pendingReview.reference ?? translate('display.noReference'),
    },
  ];

  if (options?.includeBalances) {
    const unknownBalanceLabel = translate('display.unknownBalance');
    rows.push(
      {
        label: translate('reviewModals.fields.currentBalance'),
        value: formatCurrencyAmount(
          pendingReview.currentBalanceMinor,
          pendingReview.currencyCode,
          pendingReview.minorUnit,
          unknownBalanceLabel,
        ),
        emphasized: true,
      },
      {
        label: translate('reviewModals.fields.balanceAfterApproval'),
        value: formatCurrencyAmount(
          pendingReview.balanceAfterApprovalMinor,
          pendingReview.currencyCode,
          pendingReview.minorUnit,
          unknownBalanceLabel,
        ),
        emphasized: true,
      },
    );
  }

  return { translate, targetLabel, formattedAmount, rows };
}
