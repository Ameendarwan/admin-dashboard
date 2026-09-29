import { adminApiClient } from '@/lib/apiClient';
import type {
  ChangeWalletFreezeStatusBody,
  ListTenantTopupsParams,
  ListWalletOperationsParams,
  PaginatedWalletOperations,
  RejectWalletOperationBody,
  Wallet,
  WalletOperation,
  WalletSummary,
} from '@/types/walletAdminApi';

/** Admin-be proxies to merit-wallet-service for LiveOps wallet tab. */
const tenantWalletsBase = (tenantId: string) =>
  `/admin/tenants/${encodeURIComponent(tenantId)}`;

const idempotencyHeaders = (idempotencyKey: string) => ({
  'Idempotency-Key': idempotencyKey,
});

export async function getWalletSummary(
  tenantId: string,
): Promise<WalletSummary> {
  const { data } = await adminApiClient.get<WalletSummary>(
    `${tenantWalletsBase(tenantId)}/wallets/summary`,
  );
  return data;
}

export async function listWalletOperations(
  tenantId: string,
  params?: ListWalletOperationsParams,
): Promise<WalletOperation[]> {
  const { data } = await adminApiClient.get<WalletOperation[]>(
    `${tenantWalletsBase(tenantId)}/wallet-operations`,
    { params },
  );
  return Array.isArray(data) ? data : [];
}

export async function listTenantTopups(
  tenantId: string,
  params?: ListTenantTopupsParams,
): Promise<PaginatedWalletOperations> {
  const { data } = await adminApiClient.get<PaginatedWalletOperations>(
    `${tenantWalletsBase(tenantId)}/topups`,
    { params },
  );
  const rows = Array.isArray(data?.data) ? data.data : [];
  const pagination = data?.pagination;
  const page = pagination?.page ?? params?.page ?? 1;
  const limit = pagination?.limit ?? params?.limit ?? 10;
  const total = pagination?.total ?? rows.length;
  const computedTotalPages = Math.ceil(total / limit) || 1;
  const totalPages = Math.max(1, pagination?.totalPages ?? computedTotalPages);

  return {
    data: rows,
    pagination: { page, limit, total, totalPages },
  };
}

export async function listPendingReviewWalletOperations(
  tenantId: string,
  params?: Omit<ListWalletOperationsParams, 'status'>,
): Promise<WalletOperation[]> {
  const { data } = await adminApiClient.get<WalletOperation[]>(
    `${tenantWalletsBase(tenantId)}/wallet-operations/pending-review`,
    { params },
  );
  return Array.isArray(data) ? data : [];
}

export async function getWalletOperation(
  tenantId: string,
  operationId: string,
): Promise<WalletOperation> {
  const { data } = await adminApiClient.get<WalletOperation>(
    `${tenantWalletsBase(tenantId)}/wallet-operations/${encodeURIComponent(operationId)}`,
  );
  return data;
}

/** Approval uses an empty request body. Caller owns Idempotency-Key for the attempt. */
export async function approveWalletOperation(
  tenantId: string,
  operationId: string,
  idempotencyKey: string,
): Promise<WalletOperation> {
  const { data } = await adminApiClient.post<WalletOperation>(
    `${tenantWalletsBase(tenantId)}/wallet-operations/${encodeURIComponent(operationId)}/approve`,
    undefined,
    { headers: idempotencyHeaders(idempotencyKey) },
  );
  if (data.status !== 'APPROVED') {
    throw new Error(
      `Wallet approval returned unexpected status: ${String(data.status)}`,
    );
  }
  return data;
}

/** BE injects reviewer identity; the optional notes are operator-provided. */
export async function rejectWalletOperation(
  tenantId: string,
  operationId: string,
  body: RejectWalletOperationBody,
  idempotencyKey: string,
): Promise<WalletOperation> {
  const { data } = await adminApiClient.post<WalletOperation>(
    `${tenantWalletsBase(tenantId)}/wallet-operations/${encodeURIComponent(operationId)}/reject`,
    body,
    { headers: idempotencyHeaders(idempotencyKey) },
  );
  return data;
}

/** BE injects created_by; client sends Idempotency-Key + allowlisted reason. */
export async function freezeWallet(
  tenantId: string,
  walletId: string,
  body: ChangeWalletFreezeStatusBody,
  idempotencyKey: string,
): Promise<Wallet> {
  const { data } = await adminApiClient.post<Wallet>(
    `${tenantWalletsBase(tenantId)}/wallets/${encodeURIComponent(walletId)}/freeze`,
    body,
    { headers: idempotencyHeaders(idempotencyKey) },
  );
  return data;
}

/** BE injects reviewed_by; client sends Idempotency-Key + allowlisted reason. */
export async function unfreezeWallet(
  tenantId: string,
  walletId: string,
  body: ChangeWalletFreezeStatusBody,
  idempotencyKey: string,
): Promise<Wallet> {
  const { data } = await adminApiClient.post<Wallet>(
    `${tenantWalletsBase(tenantId)}/wallets/${encodeURIComponent(walletId)}/unfreeze`,
    body,
    { headers: idempotencyHeaders(idempotencyKey) },
  );
  return data;
}
