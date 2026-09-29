import type {
  WalletOperationRejectReasonCode,
  WalletOperationSourceType,
  WalletOperationStatus,
  WalletStatus,
  WalletType,
} from '@/types/walletAdminApi';

/**
 * Friendly badge/label keys derived from BE WalletOperationStatus.
 * `unknown` is display-only for unexpected future values — never a filter option.
 */
export type TopUpDisplayStatus =
  | 'approved'
  | 'completed'
  | 'rejected'
  | 'pending_review'
  | 'cancelled'
  | 'expired'
  | 'failed'
  | 'unknown';

/** Method filter/display keys = backend source types (no FE-invented buckets). */
export type TopUpMethodDisplay = WalletOperationSourceType;

export type FloatTopUpRejectionReason = WalletOperationRejectReasonCode;

export type TenantWalletCardModel = {
  id: string;
  currencyCode: string;
  currencyLabel: string;
  amountMinor: string;
  minorUnit: number;
  isCurrencyEnabled: boolean;
  status: WalletStatus;
  isDefault?: boolean;
  countryCode?: string;
};

export type ProductWalletGroupModel = {
  productCode: string;
  wallets: TenantWalletCardModel[];
};

export type TenantWalletTableEntry = {
  id: string;
  label: string;
  walletType: WalletType;
  productCode?: string;
  balanceMinor: string;
  currencyCode: string;
  currencyLabel: string;
  isCurrencyEnabled: boolean;
  minorUnit: number;
  status: WalletStatus;
};

export type TopUpHistoryEntry = {
  id: string;
  productCode: string | null;
  walletType: WalletType | null;
  /** Display name from embedded target wallet when available. */
  targetWalletName: string | null;
  targetWalletId: string;
  /** Backend source_type; null only when upstream omitted it. */
  method: TopUpMethodDisplay | null;
  sourceType?: WalletOperationSourceType;
  /** Null when upstream omitted amount — never coerced to zero. */
  amountMinor: string | null;
  currencyCode: string;
  currencyLabel: string;
  isCurrencyEnabled: boolean;
  minorUnit: number;
  submittedAt: string;
  reviewedAt: string | null;
  /** Bank/payment reference only — null when neither proof nor source ref exists. */
  reference: string | null;
  metadata?: Record<string, unknown>;
  status: TopUpDisplayStatus;
  /** Backend WalletOperationStatus. */
  rawStatus: WalletOperationStatus;
};

export type PendingReviewTransfer = {
  operationId: string;
  count: number;
  /** Null when upstream omitted amount — never coerced to zero. */
  amountMinor: string | null;
  currencyCode: string;
  currencyLabel: string;
  isCurrencyEnabled: boolean;
  minorUnit: number;
  submittedAt: string;
  /** MASTER top-ups often have no product — optional. */
  productCode?: string;
  walletType?: WalletType;
  /** Bank/payment reference only — null when neither proof nor source ref exists. */
  reference: string | null;
  currentBalanceMinor?: string;
  balanceAfterApprovalMinor?: string;
};

export type FloatTopUpReviewContext = {
  tenantName: string;
  pendingReview: PendingReviewTransfer;
};

export type { WalletSummaryItem } from '@/types/walletAdminApi';
