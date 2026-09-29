/// <reference types="jest" />

import type {
  WalletOperation,
  WalletOperationStatus,
} from '@/types/walletAdminApi';

import {
  TOP_UP_DETAILS_EMPTY_VALUE,
  resolveTopUpProofFile,
  toTopUpDetailsView,
} from './walletTopUpDetails';
import { toTopUpHistoryEntry } from './walletTopUpMappers';
import type { TopUpHistoryEntry } from './walletTopUpTypes';

function operation(
  id: string,
  createdAt: string,
  status: WalletOperationStatus = 'APPROVED',
  overrides: Partial<WalletOperation> = {},
): WalletOperation {
  return {
    id,
    tenantId: 'tenant-1',
    targetWalletId: 'wallet-1',
    operationType: 'TOPUP',
    amountMinor: '5000000',
    currencyCode: 'SAR',
    status,
    createdAt,
    updatedAt: createdAt,
    ...overrides,
  };
}

const currencies = {
  SAR: { minorUnit: 2, name: 'Saudi Riyal', isEnabled: true },
};

const translate = (key: string) => {
  const labels: Record<string, string> = {
    'methods.BANK_TRANSFER': 'Bank',
    'statuses.approved': 'Approved',
    'statuses.pending_review': 'Pending Review',
    'detailsModal.fields.method': 'Method',
    'detailsModal.fields.status': 'Status',
    'detailsModal.fields.product': 'Product',
    'detailsModal.fields.requestedAmount': 'Requested Amount',
    'detailsModal.fields.currency': 'Currency',
    'detailsModal.fields.transactionReference': 'Transaction Reference',
    'detailsModal.fields.floatBeforeApproval': 'Float Before Approval',
    'detailsModal.fields.floatAfterApproval': 'Float After Approval',
    'detailsModal.fields.submittedOn': 'Submitted On',
    'detailsModal.fields.approvedOn': 'Approved On',
  };
  return labels[key] ?? key;
};

function fieldValue(
  view: ReturnType<typeof toTopUpDetailsView>,
  key: string,
): string {
  const field = view.fields.find((item) => item.key === key);
  if (!field) {
    throw new Error(`Missing field ${key}`);
  }
  return field.value;
}

function historyEntry(
  overrides: Partial<WalletOperation> = {},
): TopUpHistoryEntry {
  return toTopUpHistoryEntry(
    operation('op-1', '2026-06-26T09:27:00', 'APPROVED', overrides),
    currencies,
  );
}

describe('resolveTopUpProofFile', () => {
  it('returns null when metadata has no file', () => {
    expect(resolveTopUpProofFile(undefined)).toBeNull();
    expect(resolveTopUpProofFile({ product: 'rewards_portal' })).toBeNull();
  });

  it('reads nested proof of payment metadata', () => {
    expect(
      resolveTopUpProofFile({
        proofOfPayment: {
          fileName: 'Rewards Portal Topup Receipt.jpg',
          fileSize: 2.35 * 1024 * 1024,
          url: 'https://files.example/receipt.jpg',
        },
      }),
    ).toEqual({
      fileName: 'Rewards Portal Topup Receipt.jpg',
      fileSizeLabel: '2.35 MB',
      downloadUrl: 'https://files.example/receipt.jpg',
    });
  });
});

describe('toTopUpDetailsView', () => {
  it('uses dashes for missing optional fields', () => {
    const view = toTopUpDetailsView({
      entry: historyEntry({
        sourceType: undefined,
        amountMinor: undefined,
        currencyCode: undefined,
        reviewedAt: undefined,
        proofReference: undefined,
        sourceReferenceId: undefined,
        targetWallet: {
          id: 'wallet-1',
          name: 'Master',
          walletType: 'MASTER',
          productCode: null,
          subTenantId: null,
        },
      }),
      detail: null,
      currencies,
      translate,
      locale: 'en',
    });

    expect(fieldValue(view, 'method')).toBe(TOP_UP_DETAILS_EMPTY_VALUE);
    expect(fieldValue(view, 'product')).toBe(TOP_UP_DETAILS_EMPTY_VALUE);
    expect(fieldValue(view, 'requestedAmount')).toBe(
      TOP_UP_DETAILS_EMPTY_VALUE,
    );
    expect(fieldValue(view, 'currency')).toBe(TOP_UP_DETAILS_EMPTY_VALUE);
    expect(fieldValue(view, 'transactionReference')).toBe(
      TOP_UP_DETAILS_EMPTY_VALUE,
    );
    expect(fieldValue(view, 'floatBeforeApproval')).toBe(
      TOP_UP_DETAILS_EMPTY_VALUE,
    );
    expect(fieldValue(view, 'floatAfterApproval')).toBe(
      TOP_UP_DETAILS_EMPTY_VALUE,
    );
    expect(fieldValue(view, 'approvedOn')).toBe(TOP_UP_DETAILS_EMPTY_VALUE);
    expect(view.proofFile).toBeNull();
  });

  it('maps populated detail fields including balances and proof', () => {
    const entry = historyEntry({
      sourceType: 'BANK_TRANSFER',
      sourceReferenceId: 'TXN-2026-KSA-12931',
      reviewedAt: '2026-06-27T13:33:00',
      targetWallet: {
        id: 'wallet-1',
        name: 'Rewards',
        walletType: 'PRODUCT',
        productCode: 'rewards_portal',
        subTenantId: null,
      },
    });
    const detail = operation('op-1', '2026-06-26T09:27:00', 'APPROVED', {
      sourceType: 'BANK_TRANSFER',
      proofReference:
        'gs://develop-meritengage-rewards-document-uploads/receipts/t1/uuid-receipt.png',
      proofDownloadUrl:
        'https://storage.googleapis.com/bucket/receipts/t1/uuid-receipt.png?X-Goog-Signature=abc',
      sourceReferenceId: 'TXN-2026-KSA-12931',
      reviewedAt: '2026-06-27T13:33:00',
      balanceBeforeMinor: '1560000',
      balanceAfterMinor: '6560000',
      targetWallet: {
        id: 'wallet-1',
        name: 'Rewards',
        walletType: 'PRODUCT',
        productCode: 'rewards_portal',
        subTenantId: null,
      },
    });

    const view = toTopUpDetailsView({
      entry,
      detail,
      currencies,
      translate,
      locale: 'en',
    });

    expect(fieldValue(view, 'method')).toBe('Bank');
    expect(fieldValue(view, 'status')).toBe('Approved');
    expect(fieldValue(view, 'product')).toBe('Rewards Portal');
    expect(fieldValue(view, 'requestedAmount')).toBe('SAR 50,000.00');
    expect(fieldValue(view, 'currency')).toBe('SAR- Saudi Riyal');
    expect(fieldValue(view, 'transactionReference')).toBe('TXN-2026-KSA-12931');
    expect(fieldValue(view, 'floatBeforeApproval')).toBe('SAR 15,600.00');
    expect(fieldValue(view, 'floatAfterApproval')).toBe('SAR 65,600.00');
    expect(fieldValue(view, 'submittedOn')).toMatch(/^26\/06\/2026 - /);
    expect(fieldValue(view, 'approvedOn')).toMatch(/^27\/06\/2026 - /);
    expect(view.proofFile?.fileName).toBe('uuid-receipt.png');
    expect(view.proofFile?.downloadUrl).toContain('X-Goog-Signature=abc');
  });
});
