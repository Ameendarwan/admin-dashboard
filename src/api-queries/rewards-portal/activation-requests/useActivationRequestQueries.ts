import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  activationRequestDetailFromApi,
  activationRequestRowFromApi,
  parseActivationRequestTenantFilter,
  readActivationRequestSummaryFromSession,
} from '@/lib/rewards-portal/activationRequestUtils';
import type { ActivationRequestDetail } from '@/types/catalog';
import {
  approveActivationRequestItem,
  closeActivationRequest,
  getActivationRequest,
  getActivationRequestStats,
  listActivationRequests,
  rejectActivationRequestItem,
} from '@/services/rewards-portal/activationRequestsService';
import type {
  CloseActivationRequestBody,
  ListActivationRequestsParams,
  RejectActivationRequestItemBody,
} from '@/types/rewards-portal/activationRequestsApi';
import { TIME_5_MIN } from '@/utils/timeUtils';

import { activationRequestQueryKeys } from './activationRequestQueryKeys';

export function useActivationRequestsListQuery(
  params: ListActivationRequestsParams & { enabled?: boolean },
) {
  const tenantId = parseActivationRequestTenantFilter(params.tenantId);
  const status = params.status;
  const search = params.search?.trim() || undefined;

  return useQuery({
    queryKey: activationRequestQueryKeys.list({
      tenantId,
      status,
      search,
      limit: params.limit,
      offset: params.offset,
      includeItemCounts: params.includeItemCounts,
    }),
    queryFn: async () => {
      const page = await listActivationRequests({
        tenantId,
        status,
        search,
        limit: params.limit,
        offset: params.offset,
        includeItemCounts: params.includeItemCounts,
      });
      return {
        ...page,
        data: page.data.map(activationRequestRowFromApi),
      };
    },
    enabled: params.enabled ?? true,
    staleTime: TIME_5_MIN,
    gcTime: TIME_5_MIN,
  });
}

export function useActivationRequestStatsQuery(
  tenantId?: string,
  options?: { enabled?: boolean },
) {
  const scopedTenantId = parseActivationRequestTenantFilter(tenantId);

  return useQuery({
    queryKey: activationRequestQueryKeys.stats({ tenantId: scopedTenantId }),
    queryFn: () =>
      getActivationRequestStats(
        scopedTenantId ? { tenantId: scopedTenantId } : {},
      ),
    enabled: options?.enabled ?? true,
    staleTime: TIME_5_MIN,
    gcTime: TIME_5_MIN,
  });
}

export function useActivationRequestDetailQuery(requestId: string) {
  const trimmed = requestId.trim();

  return useQuery({
    queryKey: activationRequestQueryKeys.detail(trimmed),
    queryFn: async (): Promise<ActivationRequestDetail> => {
      const apiDetail = await getActivationRequest(trimmed);
      const cached = readActivationRequestSummaryFromSession(trimmed);
      return activationRequestDetailFromApi(apiDetail, cached);
    },
    enabled: Boolean(trimmed),
    staleTime: TIME_5_MIN,
    gcTime: TIME_5_MIN,
  });
}

function useInvalidateActivationRequests() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({
      queryKey: activationRequestQueryKeys.all,
    });
  };
}

export function useCloseActivationRequestMutation() {
  const invalidate = useInvalidateActivationRequests();

  return useMutation({
    mutationFn: ({
      requestId,
      body,
    }: {
      requestId: string;
      body: CloseActivationRequestBody;
    }) => closeActivationRequest(requestId, body),
    onSuccess: invalidate,
  });
}

export function useApproveActivationRequestItemMutation() {
  const invalidate = useInvalidateActivationRequests();

  return useMutation({
    mutationFn: ({
      requestId,
      itemId,
    }: {
      requestId: string;
      itemId: string;
    }) => approveActivationRequestItem(requestId, itemId),
    onSuccess: invalidate,
  });
}

export function useRejectActivationRequestItemMutation() {
  const invalidate = useInvalidateActivationRequests();

  return useMutation({
    mutationFn: ({
      requestId,
      itemId,
      body,
    }: {
      requestId: string;
      itemId: string;
      body: RejectActivationRequestItemBody;
    }) => rejectActivationRequestItem(requestId, itemId, body),
    onSuccess: invalidate,
  });
}
