import type { QueryClient } from '@tanstack/react-query';

import type {
  ListTenantTopupsParams,
  ListWalletOperationsParams,
} from '@/types/walletAdminApi';

export const walletQueryKeys = {
  all: ['wallets'] as const,
  tenant: (tenantId: string) =>
    [...walletQueryKeys.all, 'tenant', tenantId] as const,
  summary: (tenantId: string) =>
    [...walletQueryKeys.tenant(tenantId), 'summary'] as const,
  operationsRoot: (tenantId: string) =>
    [...walletQueryKeys.tenant(tenantId), 'operations'] as const,
  operations: (tenantId: string, params?: ListWalletOperationsParams) =>
    [...walletQueryKeys.operationsRoot(tenantId), params ?? {}] as const,
  topupsRoot: (tenantId: string) =>
    [...walletQueryKeys.tenant(tenantId), 'topups'] as const,
  topups: (tenantId: string, params?: ListTenantTopupsParams) =>
    [...walletQueryKeys.topupsRoot(tenantId), params ?? {}] as const,
  pendingReview: (tenantId: string) =>
    [...walletQueryKeys.tenant(tenantId), 'pending-review'] as const,
  operationRoot: (tenantId: string) =>
    [...walletQueryKeys.tenant(tenantId), 'operation'] as const,
  operation: (tenantId: string, operationId: string) =>
    [...walletQueryKeys.operationRoot(tenantId), operationId] as const,
};

/** Invalidate only the affected tenant's wallet query family after a mutation. */
export function invalidateTenantWalletQueries(
  queryClient: QueryClient,
  variables: { tenantId: string; operationId?: string },
): void {
  void queryClient.invalidateQueries({
    queryKey: walletQueryKeys.summary(variables.tenantId),
  });
  void queryClient.invalidateQueries({
    queryKey: walletQueryKeys.operationsRoot(variables.tenantId),
  });
  void queryClient.invalidateQueries({
    queryKey: walletQueryKeys.topupsRoot(variables.tenantId),
  });
  void queryClient.invalidateQueries({
    queryKey: walletQueryKeys.pendingReview(variables.tenantId),
  });
  if (variables.operationId) {
    void queryClient.invalidateQueries({
      queryKey: walletQueryKeys.operation(
        variables.tenantId,
        variables.operationId,
      ),
    });
  }
}
