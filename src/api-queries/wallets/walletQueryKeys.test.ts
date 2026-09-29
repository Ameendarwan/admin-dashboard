/// <reference types="jest" />

import type { QueryClient } from '@tanstack/react-query';

import { PENDING_REVIEW_STALE_TIME_MS } from './pendingReviewQueryOptions';
import {
  invalidateTenantWalletQueries,
  walletQueryKeys,
} from './walletQueryKeys';

describe('wallet query contracts', () => {
  it('keeps pending-review data briefly fresh without polling', () => {
    expect(PENDING_REVIEW_STALE_TIME_MS).toBe(10_000);
  });

  it('invalidates only the mutated tenant wallet query family', () => {
    const invalidateQueries = jest.fn();
    const queryClient = { invalidateQueries } as unknown as QueryClient;

    invalidateTenantWalletQueries(queryClient, {
      tenantId: 'tenant-1',
      operationId: 'op-1',
    });

    expect(invalidateQueries).toHaveBeenCalledTimes(5);
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: walletQueryKeys.summary('tenant-1'),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: walletQueryKeys.operationsRoot('tenant-1'),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: walletQueryKeys.topupsRoot('tenant-1'),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: walletQueryKeys.pendingReview('tenant-1'),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: walletQueryKeys.operation('tenant-1', 'op-1'),
    });
    expect(invalidateQueries).not.toHaveBeenCalledWith({
      queryKey: walletQueryKeys.all,
    });
  });
});
