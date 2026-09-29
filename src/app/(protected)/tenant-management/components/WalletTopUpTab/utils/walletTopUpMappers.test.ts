/// <reference types="jest" />

import type {
  WalletOperation,
  WalletOperationStatus,
  WalletSummary,
} from '@/types/walletAdminApi';

import {
  isWalletDetailReadyForApproval,
  mapOperationStatusToDisplay,
  mapSourceTypeToMethod,
  resolveOperationReference,
  selectOldestPendingOperation,
  toPendingReviewTransfer,
  toTopUpHistoryEntry,
} from './walletTopUpMappers';
import {
  WALLET_OPERATION_SOURCE_TYPE_FILTER_OPTIONS,
  WALLET_OPERATION_STATUS_FILTER_OPTIONS,
} from './walletTopUpFilterOptions';

function operation(
  id: string,
  createdAt: string,
  status: WalletOperationStatus = 'PENDING_APPROVAL',
  overrides: Partial<WalletOperation> = {},
): WalletOperation {
  return {
    id,
    tenantId: 'tenant-1',
    targetWalletId: 'wallet-1',
    operationType: 'TOPUP',
    amountMinor: '5000',
    currencyCode: 'SAR',
    status,
    createdAt,
    updatedAt: createdAt,
    ...overrides,
  };
}

const summary: WalletSummary = {
  tenantId: 'tenant-1',
  primaryCurrencyCode: 'SAR',
  totalBalanceMinor: '999',
  totalBalanceMinorUnit: 2,
  masterWallets: [
    {
      id: 'wallet-1',
      walletType: 'MASTER',
      currencyCode: 'SAR',
      minorUnit: 2,
      balanceMinor: '999',
      status: 'ACTIVE',
    },
  ],
  productWallets: [],
  tenantWallets: [
    {
      id: 'wallet-1',
      walletType: 'MASTER',
      currencyCode: 'SAR',
      minorUnit: 2,
      balanceMinor: '999',
      status: 'ACTIVE',
    },
  ],
  currencies: {
    SAR: { minorUnit: 2, name: 'Saudi Riyal', isEnabled: true },
  },
};

describe('wallet top-up mappers', () => {
  it('maps an unknown future status to the explicit unknown state', () => {
    expect(mapOperationStatusToDisplay('FUTURE_STATUS')).toBe('unknown');
  });

  it('passes through backend source types for method display/filters', () => {
    expect(mapSourceTypeToMethod('BANK_TRANSFER')).toBe('BANK_TRANSFER');
    expect(mapSourceTypeToMethod('PAYMENT_SERVICE')).toBe('PAYMENT_SERVICE');
    expect(mapSourceTypeToMethod('MANUAL')).toBe('MANUAL');
    expect(mapSourceTypeToMethod(undefined)).toBeNull();
  });

  it('exposes only backend enum values as history filter options', () => {
    expect([...WALLET_OPERATION_STATUS_FILTER_OPTIONS]).toEqual([
      'PENDING_APPROVAL',
      'APPROVED',
      'CONFIRMED',
      'REJECTED',
      'FAILED',
      'CANCELLED',
      'EXPIRED',
    ]);
    expect([...WALLET_OPERATION_SOURCE_TYPE_FILTER_OPTIONS]).toEqual([
      'BANK_TRANSFER',
      'PAYMENT_SERVICE',
      'TENANT_CONFIRMED',
      'WALLET_TRANSFER',
      'MANUAL',
    ]);
  });

  it('selects the oldest pending operation without mutating the response', () => {
    const operations = [
      operation('newest', '2026-07-23T12:00:00.000Z'),
      operation('completed', '2026-07-20T12:00:00.000Z', 'CONFIRMED'),
      operation('oldest', '2026-07-21T12:00:00.000Z'),
    ];

    expect(selectOldestPendingOperation(operations)?.id).toBe('oldest');
    expect(operations.map(({ id }) => id)).toEqual([
      'newest',
      'completed',
      'oldest',
    ]);
  });

  it('uses the matching detail snapshot for current and projected balances', () => {
    const pending = operation('op-1', '2026-07-21T12:00:00.000Z');
    const detail = operation(
      'op-1',
      '2026-07-21T12:00:00.000Z',
      'PENDING_APPROVAL',
      {
        currentBalanceMinor: '100000',
        balanceAfterApprovalMinor: '105000',
      },
    );

    const mapped = toPendingReviewTransfer({
      operations: [pending],
      summary,
      detail,
    });

    expect(mapped?.currentBalanceMinor).toBe('100000');
    expect(mapped?.balanceAfterApprovalMinor).toBe('105000');
  });

  it('requires both balance fields before approval detail is ready', () => {
    expect(
      isWalletDetailReadyForApproval(
        operation('op-1', '2026-07-21T12:00:00.000Z', 'PENDING_APPROVAL', {
          balanceAfterApprovalMinor: '105000',
        }),
        'op-1',
      ),
    ).toBe(false);

    expect(
      isWalletDetailReadyForApproval(
        operation('op-1', '2026-07-21T12:00:00.000Z', 'PENDING_APPROVAL', {
          currentBalanceMinor: '100000',
          balanceAfterApprovalMinor: '105000',
        }),
        'op-1',
      ),
    ).toBe(true);
  });

  it('does not coerce missing amounts to zero in history entries', () => {
    const mapped = toTopUpHistoryEntry(
      operation('op-1', '2026-07-21T12:00:00.000Z', 'CONFIRMED', {
        amountMinor: undefined,
      }),
      summary.currencies,
      summary,
    );

    expect(mapped.amountMinor).toBeNull();
  });

  it('resolves history product from the target wallet when metadata is absent', () => {
    const mapped = toTopUpHistoryEntry(
      operation('op-1', '2026-07-21T12:00:00.000Z', 'CONFIRMED', {
        targetWalletId: 'wallet-product',
      }),
      summary.currencies,
      {
        ...summary,
        tenantWallets: [
          {
            id: 'wallet-product',
            walletType: 'PRODUCT',
            productCode: 'GIFTCARD_A',
            currencyCode: 'SAR',
            minorUnit: 2,
            balanceMinor: '1000',
            status: 'ACTIVE',
          },
        ],
      },
    );

    expect(mapped.productCode).toBe('GIFTCARD_A');
    expect(mapped.walletType).toBe('PRODUCT');
    expect(mapped.targetWalletName).toBeNull();
  });

  it('prefers embedded targetWallet name and productCode for history entries', () => {
    const mapped = toTopUpHistoryEntry(
      operation('op-1', '2026-07-21T12:00:00.000Z', 'CONFIRMED', {
        targetWalletId: 'wallet-1',
        targetWallet: {
          id: 'wallet-1',
          name: 'Rewards Wallet',
          walletType: 'PRODUCT',
          productCode: 'REWARDS',
          subTenantId: null,
        },
      }),
      summary.currencies,
      summary,
    );

    expect(mapped.productCode).toBe('REWARDS');
    expect(mapped.walletType).toBe('PRODUCT');
    expect(mapped.targetWalletName).toBe('Rewards Wallet');
    expect(mapped.targetWalletId).toBe('wallet-1');
  });

  it('maps reviewedAt and bank reference onto history entries', () => {
    const mapped = toTopUpHistoryEntry(
      operation('op-1', '2026-06-26T09:27:00.000Z', 'APPROVED', {
        reviewedAt: '2026-06-27T13:33:00.000Z',
        sourceReferenceId: 'TXN-2026-KSA-12931',
      }),
      summary.currencies,
      summary,
    );

    expect(mapped.reviewedAt).toBe('2026-06-27T13:33:00.000Z');
    expect(mapped.reference).toBe('TXN-2026-KSA-12931');
  });

  it('omits a fake zero balance when the target wallet is not in the summary cache', () => {
    const pending = operation(
      'op-1',
      '2026-07-21T12:00:00.000Z',
      'PENDING_APPROVAL',
      {
        targetWalletId: 'missing-wallet',
      },
    );

    const mapped = toPendingReviewTransfer({
      operations: [pending],
      summary,
    });

    expect(mapped?.currentBalanceMinor).toBeUndefined();
  });

  it('uses only bank/payment references and never the internal operation id', () => {
    const pending = operation('op-1', '2026-07-21T12:00:00.000Z');

    expect(resolveOperationReference(pending)).toBeNull();

    expect(
      resolveOperationReference({
        ...pending,
        sourceReferenceId: ' BANK-123 ',
      }),
    ).toBe('BANK-123');

    expect(
      resolveOperationReference({
        ...pending,
        proofReference: 'gs://bucket/receipts/file.png',
      }),
    ).toBeNull();

    const mapped = toPendingReviewTransfer({
      operations: [pending],
      summary,
    });

    expect(mapped?.reference).toBeNull();
  });
});
