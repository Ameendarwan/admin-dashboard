import { adminApiClient, identityApiClient } from '@/lib/apiClient';
import { InvitesResponse, type CreateInviteResponse } from '@/types/invite';
import type {
  AdminCarriersResponse,
  AdminShippingControlPayload,
} from '@/types/sellerAdminShipping';
import type {
  OrdersByStatus,
  OrdersResponse,
  SellerDetails,
} from '@/types/seller';
import type { OrderDetail } from '@/types/orderDetail';
import type { SellerOrdersQueryParams } from '@/types/sellerOrders';
import type {
  DetailedTenantProfile,
  TenantProfile,
} from '@/types/tenantManagement';
import { TenantInviteStatus, TenantJourney } from '@/lib/enums';
import { compareByUpdatedOrCreated } from '@/utils/dateHelpers';
import type {
  BulkSellerDetailsParams,
  SellerDetailsBulkRow,
} from '@/types/sellerDetailsBulk';

export type SellerJourney = 'invited' | 'onboarded';

const JOURNEY_STATUS: Record<SellerJourney, string> = {
  [TenantJourney.ONBOARDED]: TenantInviteStatus.ACCEPTED,
  [TenantJourney.INVITED]: TenantInviteStatus.PENDING,
};

export const fetchSellerInvites = async (
  page: number = 1,
  pageSize: number = 10,
  status?: string,
  search?: string,
  sort?: string,
): Promise<InvitesResponse> => {
  const params = new URLSearchParams();

  params.append('inviteType', 'seller');
  params.append('page', page.toString());
  params.append('limit', pageSize.toString());

  const effectiveStatus =
    status?.trim() || JOURNEY_STATUS[TenantJourney.INVITED];
  if (effectiveStatus) {
    params.append('status', effectiveStatus);
  }

  if (search?.trim()) {
    params.append('search', search.trim());
  }

  if (sort?.trim()) {
    params.append('sort', sort.trim());
  }

  const url = `/invites?${params.toString()}`;
  const response = await adminApiClient.get(url);

  return response.data;
};

export const fetchOnboardedSellers = async (
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  sort?: string,
): Promise<InvitesResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', pageSize.toString());
  params.append('platformName', 'seller-portal');
  if (search?.trim()) params.append('search', search.trim());

  const url = `/tenants?${params.toString()}`;
  const response = await identityApiClient.get(url);

  const tenants: TenantProfile[] = response.data?.data || [];

  const mapped: CreateInviteResponse[] = tenants.map((tenant) => ({
    id: tenant.id,
    invitedBy: '',
    email: tenant.metadata?.businessOwnerEmail || tenant.key || '',
    tenantName: tenant.name || tenant.businessName,
    platforms: ['seller-portal'],
    status: tenant.status,
    metadata: {
      tenantId: tenant.id,
      customerProfileState: tenant.customerProfileState,
    },
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
  }));

  if (sort === 'asc' || sort === 'desc') {
    mapped.sort((a, b) => compareByUpdatedOrCreated(a, b, sort));
  }

  return {
    data: mapped,
    page: response.data?.page ?? page,
    totalPages: response.data?.totalPages ?? 1,
    total: response.data?.total ?? mapped.length,
  };
};

export const getSellerDetailsByTenantId = async (
  tenantId: string,
): Promise<SellerDetails> => {
  const response = await adminApiClient.get('/sellers/details', {
    params: { tenantId },
  });
  return response.data;
};

export async function bulkGetSellerDetails(
  body: BulkSellerDetailsParams = {},
): Promise<SellerDetailsBulkRow[]> {
  const { data } = await adminApiClient.post<SellerDetailsBulkRow[]>(
    '/sellers/details/bulk',
    body,
  );
  return Array.isArray(data) ? data : [];
}

export const fetchSellerCustomerProfile = async (
  sellerTenantId: string | undefined,
): Promise<DetailedTenantProfile> => {
  if (!sellerTenantId) {
    throw new Error('Seller tenant ID is required');
  }

  const response = await adminApiClient.get<{
    customerProfile: DetailedTenantProfile;
  }>(`/profiles-review/tenants/${sellerTenantId}/customer-profile`);
  return response.data.customerProfile;
};

export const getSellerOrders = async (
  tenantId: string,
  page: number = 1,
  limit: number = 4,
  filters?: SellerOrdersQueryParams,
): Promise<OrdersResponse> => {
  const params: Record<string, string | number> = { tenantId, page, limit };
  if (filters?.search?.trim()) params.search = filters.search.trim();
  if (filters?.status?.trim()) params.status = filters.status.trim();
  if (filters?.shippingProvider?.trim()) {
    params.shippingProvider = filters.shippingProvider.trim();
  }
  if (filters?.dateFrom?.trim()) params.dateFrom = filters.dateFrom.trim();
  if (filters?.dateTo?.trim()) params.dateTo = filters.dateTo.trim();

  const response = await adminApiClient.get('/sellers/orders', {
    params,
  });
  return response.data;
};

export const getSellerOrdersByStatus = async (
  tenantId: string,
): Promise<OrdersByStatus> => {
  const response = await adminApiClient.get('/sellers/orders/statuses', {
    params: { tenantId },
  });
  return response.data;
};

export const getSellerOrderById = async (
  tenantId: string,
  orderId: string,
): Promise<OrderDetail> => {
  const response = await adminApiClient.get<OrderDetail>(
    `/sellers/orders/${encodeURIComponent(orderId)}`,
    { params: { tenantId } },
  );
  return response.data;
};

export const getCarriers = async (): Promise<AdminCarriersResponse> => {
  const response = await adminApiClient.get('/sellers/carriers');
  return response.data;
};

export const updateSellerShippingControl = async (
  payload: AdminShippingControlPayload,
): Promise<unknown> => {
  const response = await adminApiClient.patch(
    '/sellers/shipping-control',
    payload,
  );
  return response.data;
};

export const executeAdminOrderAction = async (
  tenantId: string,
  orderId: string,
  action: string,
  file?: File,
): Promise<{ message: string; status?: string }> => {
  const formData = new FormData();
  formData.append('action', action);
  formData.append('tenantId', tenantId);
  if (file) {
    formData.append('file', file);
  }
  const response = await adminApiClient.post(
    `/sellers/orders/${encodeURIComponent(orderId)}/actions?tenantId=${encodeURIComponent(tenantId)}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
};

export const getProofDownloadUrl = async (
  tenantId: string,
  orderId: string,
  type: 'seller' | 'admin',
): Promise<{
  downloadUrl: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
}> => {
  const response = await adminApiClient.get(
    `/sellers/orders/${encodeURIComponent(orderId)}/proof-url`,
    { params: { tenantId, type } },
  );
  return response.data;
};

export const getAwbDownloadUrl = async (
  tenantId: string,
  orderId: string,
): Promise<{
  downloadUrl: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
}> => {
  const response = await adminApiClient.get(
    `/sellers/orders/${encodeURIComponent(orderId)}/awb-url`,
    { params: { tenantId } },
  );
  return response.data;
};

export const executeAdminBulkOrderAction = async (
  tenantId: string,
  action: string,
  orderIds: string[],
): Promise<unknown> => {
  const response = await adminApiClient.post(
    `/sellers/orders/bulk-actions`,
    { action, orderIds },
    { params: { tenantId } },
  );
  return response.data;
};
