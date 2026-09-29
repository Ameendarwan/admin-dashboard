/// <reference types="jest" />

import { adminApiClient } from '@/lib/apiClient';
import type { WalletOperation } from '@/types/walletAdminApi';

import {
  approveWalletOperation,
  freezeWallet,
  rejectWalletOperation,
  unfreezeWallet,
} from './walletAdminService';

jest.mock('@/lib/apiClient', () => ({
  adminApiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const postMock = adminApiClient.post as jest.Mock;
const IDEMPOTENCY_KEY = '11111111-1111-1111-1111-111111111111';

function operation(status: WalletOperation['status']): WalletOperation {
  return {
    id: 'operation-1',
    tenantId: 'tenant-1',
    targetWalletId: 'wallet-1',
    operationType: 'TOPUP',
    status,
    createdAt: '2026-07-23T10:00:00.000Z',
    updatedAt: '2026-07-23T10:00:00.000Z',
  };
}

describe('walletAdminService mutations', () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it('returns the APPROVED operation on success', async () => {
    postMock.mockResolvedValue({ data: operation('APPROVED') });

    await expect(
      approveWalletOperation('tenant-1', 'operation-1', IDEMPOTENCY_KEY),
    ).resolves.toEqual(operation('APPROVED'));

    expect(postMock).toHaveBeenCalledWith(
      '/admin/tenants/tenant-1/wallet-operations/operation-1/approve',
      undefined,
      { headers: { 'Idempotency-Key': IDEMPOTENCY_KEY } },
    );
  });

  it('rejects an approve response that is not APPROVED', async () => {
    postMock.mockResolvedValue({ data: operation('FAILED') });

    await expect(
      approveWalletOperation('tenant-1', 'operation-1', IDEMPOTENCY_KEY),
    ).rejects.toThrow('unexpected status: FAILED');
  });

  it('sends optional rejection notes using the admin-be contract', async () => {
    postMock.mockResolvedValue({ data: operation('REJECTED') });

    await rejectWalletOperation(
      'tenant-1',
      'operation-1',
      {
        reasonCode: 'compliance_hold',
        notes: 'Manual compliance review required.',
      },
      IDEMPOTENCY_KEY,
    );

    expect(postMock).toHaveBeenCalledWith(
      '/admin/tenants/tenant-1/wallet-operations/operation-1/reject',
      {
        reasonCode: 'compliance_hold',
        notes: 'Manual compliance review required.',
      },
      { headers: { 'Idempotency-Key': IDEMPOTENCY_KEY } },
    );
  });

  it('forwards the caller Idempotency-Key on freeze and unfreeze', async () => {
    postMock.mockResolvedValue({
      data: { id: 'wallet-1', status: 'FROZEN' },
    });

    await freezeWallet(
      'tenant-1',
      'wallet-1',
      { reasonCode: 'COMPLIANCE_REVIEW', notes: 'Hold funds' },
      IDEMPOTENCY_KEY,
    );
    await unfreezeWallet(
      'tenant-1',
      'wallet-1',
      { reasonCode: 'COMPLIANCE_REVIEW' },
      IDEMPOTENCY_KEY,
    );

    expect(postMock).toHaveBeenNthCalledWith(
      1,
      '/admin/tenants/tenant-1/wallets/wallet-1/freeze',
      { reasonCode: 'COMPLIANCE_REVIEW', notes: 'Hold funds' },
      { headers: { 'Idempotency-Key': IDEMPOTENCY_KEY } },
    );
    expect(postMock).toHaveBeenNthCalledWith(
      2,
      '/admin/tenants/tenant-1/wallets/wallet-1/unfreeze',
      { reasonCode: 'COMPLIANCE_REVIEW' },
      { headers: { 'Idempotency-Key': IDEMPOTENCY_KEY } },
    );
  });
});
