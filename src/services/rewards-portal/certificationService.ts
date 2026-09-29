import { adminApiClient } from '@/lib/apiClient';
import type {
  DecideProductionIpsBody,
  ListPendingProductionIpsParams,
  PaginatedPendingProductionIpsApi,
} from '@/types/rewards-portal/certificationApi';

const CERTIFICATION_PATH = '/admin/rewards-portal/certification';

const CERTIFICATION_WRITE_TIMEOUT_MS = 60_000;

export async function listPendingProductionIps(
  params: ListPendingProductionIpsParams,
): Promise<PaginatedPendingProductionIpsApi> {
  const { tenantId, status } = params;
  const { data } = await adminApiClient.get<PaginatedPendingProductionIpsApi>(
    `${CERTIFICATION_PATH}/pending-production-ips`,
    {
      params: {
        tenantId,
        ...(status ? { status } : {}),
      },
    },
  );
  return data;
}

export async function decideProductionIps(
  requestId: string,
  body: DecideProductionIpsBody,
): Promise<void> {
  await adminApiClient.patch(
    `${CERTIFICATION_PATH}/production-ips/${encodeURIComponent(requestId)}`,
    body,
    { timeout: CERTIFICATION_WRITE_TIMEOUT_MS },
  );
}
