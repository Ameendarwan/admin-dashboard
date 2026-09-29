import type { ActivationRequestStatus } from '@/constants/rewards-portal/activationRequestStatus';

const activationRequestsRoot = ['activation-requests'] as const;

export const activationRequestQueryKeys = {
  all: activationRequestsRoot,
  list: (params: {
    tenantId?: string;
    status?: ActivationRequestStatus;
    search?: string;
    limit: number;
    offset: number;
    includeItemCounts?: boolean;
  }) => [...activationRequestsRoot, 'list', params] as const,
  stats: (params: { tenantId?: string } = {}) =>
    [...activationRequestsRoot, 'stats', params] as const,
  detail: (requestId: string) =>
    [...activationRequestsRoot, 'detail', requestId] as const,
};
