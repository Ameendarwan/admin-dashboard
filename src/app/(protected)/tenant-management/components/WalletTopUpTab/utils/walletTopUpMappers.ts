import type {
  WalletCurrencyMetadata,
  WalletOperation,
  WalletOperationSourceType,
  WalletSummary,
  WalletSummaryItem,
} from '@/types/walletAdminApi';
import { getProductLabel } from '@/constants/platform';

import { currencyCodeToFlagCountry } from './walletTopUpFormatters';
import type {
  PendingReviewTransfer,
  ProductWalletGroupModel,
  TenantWalletCardModel,
  TenantWalletTableEntry,
  TopUpDisplayStatus,
  TopUpHistoryEntry,
  TopUpMethodDisplay,
} from './walletTopUpTypes';

export function mapOperationStatusToDisplay(
  status: string,
): TopUpDisplayStatus {
  switch (status) {
    case 'PENDING_APPROVAL':
      return 'pending_review';
    case 'APPROVED':
      return 'approved';
    case 'CONFIRMED':
      return 'completed';
    case 'REJECTED':
      return 'rejected';
    case 'FAILED':
      return 'failed';
    case 'CANCELLED':
      return 'cancelled';
    case 'EXPIRED':
      return 'expired';
    default:
      // Display-only fallback — never offered as a filter option.
      return 'unknown';
  }
}

/** Pass-through: method filters use wallet-service source_type values as-is. */
export function mapSourceTypeToMethod(
  sourceType?: WalletOperationSourceType,
): TopUpMethodDisplay | null {
  return sourceType ?? null;
}

function resolveMinorUnit(
  currencyCode: string | undefined,
  currencies: Record<string, WalletCurrencyMetadata>,
  fallback = 2,
): number {
  if (!currencyCode) {
    return fallback;
  }
  return currencies[currencyCode]?.minorUnit ?? fallback;
}

export function resolveCurrencyLabel(
  currencyCode: string,
  currencies: Record<string, WalletCurrencyMetadata>,
): string {
  const name = currencies[currencyCode]?.name?.trim();
  if (!name || name.toUpperCase() === currencyCode.toUpperCase()) {
    return currencyCode;
  }
  return `${name} (${currencyCode})`;
}

function productCodeFromMetadata(
  metadata?: Record<string, unknown>,
): string | null {
  const raw = metadata?.product ?? metadata?.productCode;
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null;
}

function collectSummaryWallets(
  summary: WalletSummary | undefined,
): WalletSummaryItem[] {
  return [
    ...(summary?.masterWallets ?? []),
    ...(summary?.tenantWallets ?? []),
    ...(summary?.productWallets.flatMap((group) => group.wallets) ?? []),
  ];
}

function findSummaryWallet(
  summary: WalletSummary | undefined,
  walletId: string,
): WalletSummaryItem | undefined {
  return collectSummaryWallets(summary).find((item) => item.id === walletId);
}

export function toTenantWalletCard(
  wallet: WalletSummaryItem,
  options?: {
    isDefault?: boolean;
    currencyMetadata?: WalletCurrencyMetadata;
  },
): TenantWalletCardModel {
  const currencies = options?.currencyMetadata
    ? { [wallet.currencyCode]: options.currencyMetadata }
    : {};
  return {
    id: wallet.id,
    currencyCode: wallet.currencyCode,
    currencyLabel: resolveCurrencyLabel(wallet.currencyCode, currencies),
    amountMinor: wallet.balanceMinor,
    minorUnit: wallet.minorUnit,
    isCurrencyEnabled: options?.currencyMetadata?.isEnabled ?? true,
    status: wallet.status,
    isDefault: options?.isDefault,
    countryCode: currencyCodeToFlagCountry(wallet.currencyCode),
  };
}

export function toProductWalletGroups(
  summary: WalletSummary,
): ProductWalletGroupModel[] {
  return summary.productWallets.map((group) => ({
    productCode: group.productCode,
    wallets: group.wallets.map((wallet) =>
      toTenantWalletCard(wallet, {
        currencyMetadata: summary.currencies[wallet.currencyCode],
      }),
    ),
  }));
}

export function toTenantWalletTableEntries(
  summary: WalletSummary,
): TenantWalletTableEntry[] {
  return summary.tenantWallets.map((wallet) => ({
    id: wallet.id,
    label: wallet.productCode
      ? `${wallet.walletType} · ${wallet.productCode}`
      : wallet.walletType,
    walletType: wallet.walletType,
    productCode: wallet.productCode,
    balanceMinor: wallet.balanceMinor,
    currencyCode: wallet.currencyCode,
    currencyLabel: resolveCurrencyLabel(
      wallet.currencyCode,
      summary.currencies,
    ),
    isCurrencyEnabled:
      summary.currencies[wallet.currencyCode]?.isEnabled ?? true,
    minorUnit: wallet.minorUnit,
    status: wallet.status,
  }));
}

export function toTopUpHistoryEntry(
  operation: WalletOperation,
  currencies: Record<string, WalletCurrencyMetadata>,
  summary?: WalletSummary,
): TopUpHistoryEntry {
  const currencyCode = operation.currencyCode ?? '';
  const currencyMetadata = currencies[currencyCode];
  const wallet = findSummaryWallet(summary, operation.targetWalletId);
  const embeddedProductCode = operation.targetWallet?.productCode?.trim();
  return {
    id: operation.id,
    productCode:
      (embeddedProductCode || null) ??
      productCodeFromMetadata(operation.metadata) ??
      wallet?.productCode ??
      null,
    walletType:
      operation.targetWallet?.walletType ?? wallet?.walletType ?? null,
    targetWalletName: operation.targetWallet?.name?.trim() || null,
    targetWalletId: operation.targetWalletId,
    method: mapSourceTypeToMethod(operation.sourceType),
    sourceType: operation.sourceType,
    amountMinor: operation.amountMinor ?? null,
    currencyCode,
    currencyLabel: resolveCurrencyLabel(currencyCode, currencies),
    isCurrencyEnabled: currencyMetadata?.isEnabled ?? true,
    minorUnit: resolveMinorUnit(currencyCode, currencies),
    submittedAt: operation.createdAt,
    reviewedAt: operation.reviewedAt?.trim() || null,
    reference: resolveOperationReference(operation),
    metadata: operation.metadata,
    status: mapOperationStatusToDisplay(operation.status),
    rawStatus: operation.status,
  };
}

function findWalletBalance(
  summary: WalletSummary | undefined,
  walletId: string,
): {
  balanceMinor?: string;
  minorUnit?: number;
  productCode?: string;
  walletType?: WalletSummaryItem['walletType'];
} {
  const wallet = findSummaryWallet(summary, walletId);
  if (!wallet) {
    return {};
  }
  return {
    balanceMinor: wallet.balanceMinor,
    minorUnit: wallet.minorUnit,
    productCode: wallet.productCode,
    walletType: wallet.walletType,
  };
}

export function resolveOperationReference(
  operation: Pick<WalletOperation, 'proofReference' | 'sourceReferenceId'>,
): string | null {
  // Bank/payment ref lives on sourceReferenceId. proofReference is a GCS path.
  const reference =
    operation.sourceReferenceId?.trim() ||
    (operation.proofReference?.trim().startsWith('gs://')
      ? null
      : operation.proofReference?.trim());
  return reference || null;
}

export function selectOldestPendingOperation(
  operations: WalletOperation[],
): WalletOperation | null {
  const pending = operations.filter(
    (operation) => operation.status === 'PENDING_APPROVAL',
  );
  if (pending.length === 0) {
    return null;
  }

  return [...pending].sort((left, right) => {
    const leftTime = Date.parse(left.createdAt);
    const rightTime = Date.parse(right.createdAt);
    const safeLeftTime = Number.isNaN(leftTime)
      ? Number.POSITIVE_INFINITY
      : leftTime;
    const safeRightTime = Number.isNaN(rightTime)
      ? Number.POSITIVE_INFINITY
      : rightTime;
    return safeLeftTime - safeRightTime || left.id.localeCompare(right.id);
  })[0];
}

/** True when the detail response can safely drive approve UI balances. */
export function isWalletDetailReadyForApproval(
  detail: WalletOperation | null | undefined,
  operationId: string | null,
): boolean {
  return (
    Boolean(operationId) &&
    detail?.id === operationId &&
    detail.status === 'PENDING_APPROVAL' &&
    detail.currentBalanceMinor !== undefined &&
    detail.balanceAfterApprovalMinor !== undefined
  );
}

export function toPendingReviewTransfer(options: {
  operations: WalletOperation[];
  summary?: WalletSummary;
  detail?: WalletOperation | null;
}): PendingReviewTransfer | null {
  const { operations, summary, detail } = options;
  const spotlight = selectOldestPendingOperation(operations);
  if (!spotlight) {
    return null;
  }

  const matchingDetail = detail?.id === spotlight.id ? detail : null;
  const operation = matchingDetail ?? spotlight;
  const currencyCode = operation.currencyCode ?? '';
  const walletInfo = findWalletBalance(summary, operation.targetWalletId);
  const currencyMetadata = summary?.currencies[currencyCode];
  const minorUnit =
    summary?.currencies[currencyCode]?.minorUnit ??
    walletInfo.minorUnit ??
    resolveMinorUnit(currencyCode, summary?.currencies ?? {});

  return {
    operationId: operation.id,
    count: operations.filter(
      (candidate) => candidate.status === 'PENDING_APPROVAL',
    ).length,
    amountMinor: operation.amountMinor ?? null,
    currencyCode,
    currencyLabel: resolveCurrencyLabel(
      currencyCode,
      summary?.currencies ?? {},
    ),
    isCurrencyEnabled: currencyMetadata?.isEnabled ?? true,
    minorUnit,
    submittedAt: operation.createdAt,
    productCode:
      walletInfo.productCode ??
      productCodeFromMetadata(operation.metadata) ??
      undefined,
    walletType: walletInfo.walletType,
    reference: resolveOperationReference(operation),
    ...resolvePendingReviewBalances(matchingDetail, walletInfo.balanceMinor),
  };
}

function resolvePendingReviewBalances(
  matchingDetail: WalletOperation | null,
  summaryBalanceMinor: string | undefined,
): Pick<
  PendingReviewTransfer,
  'currentBalanceMinor' | 'balanceAfterApprovalMinor'
> {
  if (matchingDetail) {
    return {
      currentBalanceMinor: matchingDetail.currentBalanceMinor,
      balanceAfterApprovalMinor: matchingDetail.balanceAfterApprovalMinor,
    };
  }
  if (summaryBalanceMinor !== undefined) {
    return { currentBalanceMinor: summaryBalanceMinor };
  }
  return {};
}

export function resolveWalletTableLabel(
  entry: Pick<TenantWalletTableEntry, 'walletType' | 'productCode'>,
  translate: (key: string, values?: Record<string, string | number>) => string,
): string {
  const walletTypeLabel = translate(`walletTypes.${entry.walletType}`);

  if (!entry.productCode) {
    return walletTypeLabel;
  }

  return translate('tenantFloatWallets.walletLabel', {
    walletType: walletTypeLabel,
    product: getProductLabel(entry.productCode),
  });
}

export function resolveReviewTargetLabel(
  pendingReview: {
    productCode?: string;
    walletType?: string;
  },
  translate: (key: string) => string,
): string {
  if (pendingReview.productCode) {
    return getProductLabel(pendingReview.productCode);
  }
  if (pendingReview.walletType) {
    return translate(`walletTypes.${pendingReview.walletType}`);
  }
  return translate('walletTypes.unknown');
}
