import type {
  WalletOperationSourceType,
  WalletOperationStatus,
  WalletStatus,
} from '@/types/walletAdminApi';

/**
 * Client-side history/wallet filter options — must stay 1:1 with admin-be /
 * wallet-service enums. Do not invent UI-only values here.
 */

export const WALLET_STATUS_FILTER_OPTIONS: readonly WalletStatus[] = [
  'ACTIVE',
  'FROZEN',
] as const;

/** All wallet-operation statuses the BFF/upstream can return. */
export const WALLET_OPERATION_STATUS_FILTER_OPTIONS: readonly WalletOperationStatus[] =
  [
    'PENDING_APPROVAL',
    'APPROVED',
    'CONFIRMED',
    'REJECTED',
    'FAILED',
    'CANCELLED',
    'EXPIRED',
  ] as const;

/**
 * Method filter options shown on top-up history.
 * Subset of wallet-service source_type — only Bank / Payment / Manual.
 */
export const WALLET_OPERATION_SOURCE_TYPE_FILTER_OPTIONS: readonly WalletOperationSourceType[] =
  ['BANK_TRANSFER', 'PAYMENT_SERVICE', 'WALLET_TRANSFER'] as const;
