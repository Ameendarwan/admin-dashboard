import { adminApiClient } from '@/lib/apiClient';
import type {
  ActivationRequestDetailApi,
  ActivationRequestStatsApi,
  ActivationRequestStatsParams,
  CloseActivationRequestBody,
  ListActivationRequestsParams,
  PaginatedActivationRequestsApi,
  RejectActivationRequestItemBody,
} from '@/types/rewards-portal/activationRequestsApi';

const ACTIVATION_REQUESTS_PATH = '/admin/rewards-portal/activation-requests';

/** Close/approve/reject can exceed the default 10s client timeout via admin-be → rewards-portal. */
const ACTIVATION_REQUEST_WRITE_TIMEOUT_MS = 60_000;

export async function listActivationRequests(
  params: ListActivationRequestsParams,
): Promise<PaginatedActivationRequestsApi> {
  const { data } = await adminApiClient.get<PaginatedActivationRequestsApi>(
    ACTIVATION_REQUESTS_PATH,
    { params },
  );
  return data;
}

export async function getActivationRequestStats(
  params: ActivationRequestStatsParams = {},
): Promise<ActivationRequestStatsApi> {
  const { data } = await adminApiClient.get<ActivationRequestStatsApi>(
    `${ACTIVATION_REQUESTS_PATH}/stats`,
    { params },
  );
  return data;
}

export async function getActivationRequest(
  requestId: string,
): Promise<ActivationRequestDetailApi> {
  const { data } = await adminApiClient.get<ActivationRequestDetailApi>(
    `${ACTIVATION_REQUESTS_PATH}/${encodeURIComponent(requestId)}`,
  );
  return data;
}

export async function closeActivationRequest(
  requestId: string,
  body: CloseActivationRequestBody,
): Promise<void> {
  await adminApiClient.patch(
    `${ACTIVATION_REQUESTS_PATH}/${encodeURIComponent(requestId)}/close`,
    body,
    { timeout: ACTIVATION_REQUEST_WRITE_TIMEOUT_MS },
  );
}

export async function approveActivationRequestItem(
  requestId: string,
  itemId: string,
): Promise<void> {
  await adminApiClient.patch(
    `${ACTIVATION_REQUESTS_PATH}/${encodeURIComponent(requestId)}/items/${encodeURIComponent(itemId)}/approve`,
    undefined,
    { timeout: ACTIVATION_REQUEST_WRITE_TIMEOUT_MS },
  );
}

export async function rejectActivationRequestItem(
  requestId: string,
  itemId: string,
  body: RejectActivationRequestItemBody,
): Promise<void> {
  await adminApiClient.patch(
    `${ACTIVATION_REQUESTS_PATH}/${encodeURIComponent(requestId)}/items/${encodeURIComponent(itemId)}/reject`,
    body,
    { timeout: ACTIVATION_REQUEST_WRITE_TIMEOUT_MS },
  );
}
