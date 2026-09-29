import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  decideProductionIps,
  listPendingProductionIps,
} from '@/services/rewards-portal/certificationService';
import type {
  CertificationStatus,
  DecideProductionIpsBody,
} from '@/types/rewards-portal/certificationApi';
import { TIME_5_MIN } from '@/utils/timeUtils';

import { certificationQueryKeys } from './certificationQueryKeys';

export function usePendingProductionIpsQuery(
  tenantId: string,
  options?: { enabled?: boolean; status?: CertificationStatus },
) {
  const trimmed = tenantId.trim();
  const status = options?.status ?? 'IN_REVIEW';

  return useQuery({
    queryKey: certificationQueryKeys.pendingProductionIps(trimmed, status),
    queryFn: () =>
      listPendingProductionIps({
        tenantId: trimmed,
        status,
      }),
    enabled: (options?.enabled ?? true) && Boolean(trimmed),
    staleTime: TIME_5_MIN,
    gcTime: TIME_5_MIN,
  });
}

function useInvalidateCertificationQueries() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({
      queryKey: certificationQueryKeys.all,
    });
  };
}

export function useDecideProductionIpsMutation() {
  const invalidate = useInvalidateCertificationQueries();

  return useMutation({
    mutationFn: ({
      requestId,
      body,
    }: {
      requestId: string;
      body: DecideProductionIpsBody;
    }) => decideProductionIps(requestId, body),
    onSuccess: invalidate,
  });
}
