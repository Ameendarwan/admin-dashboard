/** Admin-be wallet LiveOps DTOs (camelCase, minor-unit strings). */

export type WalletType = 'MASTER' | 'PRODUCT' | 'SUB_TENANT';

export type WalletStatus = 'ACTIVE' | 'FROZEN';

export type WalletOperationSourceType =
  | 'PAYMENT_SERVICE'
  | 'BANK_TRANSFER'
  | 'TENANT_CONFIRMED'
  | 'WALLET_TRANSFER'
  | 'MANUAL';

export type WalletOperationRequestType =
  | 'TOPUP'
  | 'MASTER_TO_SUB'
  | 'SUB_TO_MASTER'
  | 'PRODUCT_DEBIT'
  | 'MANUAL_CREDIT'
  | 'MANUAL_DEBIT'
  | 'REFUND'
  | 'COMPENSATING_REVERSAL'
  | 'CONFIG_CHANGE'
  | 'FREEZE'
  | 'UNFREEZE'
  | 'BLOCKED_ATTEMPT';

export type WalletOperationStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CONFIRMED'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED';

/** Allowlisted reject reasons — must match admin-be exactly. */
export type WalletOperationRejectReasonCode =
  | 'transfer_not_received'
  | 'amount_does_not_match'
  | 'invalid_proof_of_payment'
  | 'reference_number_mismatch'
  | 'compliance_hold';

export type WalletSummaryItem = {
  id: string;
  walletType: WalletType;
  currencyCode: string;
  minorUnit: number;
  balanceMinor: string;
  status: WalletStatus;
  productCode?: string;
};

export type WalletSummaryProductGroup = {
  productCode: string;
  wallets: WalletSummaryItem[];
};

export type WalletCurrencyMetadata = {
  minorUnit: number;
  name: string;
  isEnabled: boolean;
};

export type WalletSummary = {
  tenantId: string;
  primaryCurrencyCode: string | null;
  totalBalanceMinor: string;
  totalBalanceMinorUnit: number | null;
  masterWallets: WalletSummaryItem[];
  productWallets: WalletSummaryProductGroup[];
  tenantWallets: WalletSummaryItem[];
  currencies: Record<string, WalletCurrencyMetadata>;
};

export type WalletOperationTargetWallet = {
  id: string;
  name: string;
  walletType: WalletType;
  productCode?: string | null;
  subTenantId?: string | null;
};

export type WalletOperation = {
  id: string;
  tenantId: string;
  sourceType?: WalletOperationSourceType;
  sourceReferenceId?: string;
  targetWalletId: string;
  /** Present when wallet-service embeds target_wallet (e.g. topups list). */
  targetWallet?: WalletOperationTargetWallet;
  operationType: WalletOperationRequestType;
  amountMinor?: string;
  currencyCode?: string;
  balanceBeforeMinor?: string;
  balanceAfterMinor?: string;
  status: WalletOperationStatus;
  proofReference?: string;
  createdBy?: string;
  reviewedBy?: string;
  requestReasonCode?: string;
  requestJustification?: string;
  reviewerReasonCode?: string;
  reviewerJustification?: string;
  referenceOperationId?: string;
  reviewedAt?: string;
  expiresAt?: string;
  blockedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  /** Only on GET by id — never on list/pending-review. */
  currentBalanceMinor?: string;
  balanceAfterApprovalMinor?: string;
  /** Signed HTTPS URL for proofReference when it is a gs:// path (GET by id). */
  proofDownloadUrl?: string;
};

export type ListWalletOperationsParams = {
  walletId?: string;
  status?: WalletOperationStatus;
  currencyCode?: string;
  createdFrom?: string;
  createdTo?: string;
};

export type ListTenantTopupsParams = {
  page?: number;
  limit?: number;
  sourceType?: WalletOperationSourceType;
  currencyCode?: string;
  status?: WalletOperationStatus;
  search?: string;
  sortOrder?: 'ASC' | 'DESC';
  startDatetime?: string;
  endDatetime?: string;
};

export type WalletOperationsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedWalletOperations = {
  data: WalletOperation[];
  pagination: WalletOperationsPagination;
};

export type RejectWalletOperationBody = {
  reasonCode: WalletOperationRejectReasonCode;
  notes?: string;
};

/** Allowlisted freeze/unfreeze reason — must match admin-be exactly. */
export type WalletFreezeReasonCode = 'COMPLIANCE_REVIEW';

export type ChangeWalletFreezeStatusBody = {
  reasonCode: WalletFreezeReasonCode;
  notes?: string;
};

/** Single wallet row returned after freeze/unfreeze. */
export type Wallet = {
  id: string;
  tenantId: string;
  walletType: WalletType;
  currencyCode: string;
  balanceMinor: string;
  status: WalletStatus;
  productCode?: string;
  subTenantId?: string | null;
  parentWalletId?: string;
  frozenAt?: string;
  frozenBy?: string;
  freezeReasonCode?: string;
  freezeJustification?: string;
  createdAt: string;
  updatedAt: string;
};
