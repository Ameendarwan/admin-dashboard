import { adminApiClient, identityApiClient } from '@/lib/apiClient';
import {
  TenantProfile,
  DetailedTenantProfile,
  Platform,
  IdentityTenant,
  UpdateIdentityTenantPayload,
} from '@/types/tenantManagement';
import {
  ReviewStatus,
  SortOrder,
  TenantInviteStatus,
  TenantJourney,
} from '@/lib/enums';
import type { CreateInviteResponse, InvitesResponse } from '@/types/invite';
import type { PaginatedResponse } from '@/types/pagination';
import { sortByUpdatedOrCreated } from '@/utils/dateHelpers';
import { appendParam } from '@/utils/urlParamsUtils';

export { TenantJourney } from '@/lib/enums';

type InviteMetadata = Record<string, unknown>;

type FetchTenantsParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  sortOrder?: SortOrder;
  country?: string;
  accountManager?: string;
  platforms?: string[];
  journey?: TenantJourney;
  statusQueryKey?: 'customerProfileState' | 'status';
};

type FetchTenantsFromIdentityParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  country?: string;
  accountManager?: string;
  platforms?: string[];
  sortOrder?: SortOrder;
  status?: string;
  /** Defaults to customerProfileState (tenant-management). Use `status` for identity active/inactive. */
  statusQueryKey?: 'customerProfileState' | 'status';
};

function getInviteMetadata(
  metadata?: CreateInviteResponse['metadata'],
): InviteMetadata {
  return metadata && typeof metadata === 'object'
    ? (metadata as InviteMetadata)
    : {};
}

function normalizeTenant(tenant: TenantProfile): TenantProfile {
  const rawState = tenant.customerProfileState || tenant.status;

  let normalizedState: ReviewStatus | string | undefined;
  if (
    rawState === ReviewStatus.APPROVED ||
    rawState === ReviewStatus.REJECTED ||
    rawState === ReviewStatus.REVISION_REQUESTED ||
    rawState === ReviewStatus.PENDING_REVIEW ||
    rawState === ReviewStatus.REVIEW_IN_PROGRESS ||
    rawState === ReviewStatus.ONBOARDING
  ) {
    normalizedState = rawState;
  } else if (
    rawState === TenantInviteStatus.ACCEPTED ||
    rawState === 'active'
  ) {
    normalizedState = ReviewStatus.APPROVED;
  } else {
    normalizedState = rawState;
  }

  return {
    ...tenant,
    email: tenant.metadata?.businessOwnerEmail || tenant.key,
    tenantId: tenant.id,
    state: tenant.status,
    customerProfileState: normalizedState as ReviewStatus,
  };
}

function mapAndNormalizeTenants(
  rawData: TenantProfile[] | undefined,
): TenantProfile[] {
  return (rawData || []).map((t) => normalizeTenant(t));
}

function applySortIfNeeded<
  T extends { updatedAt?: string | null; createdAt?: string | null },
>(data: T[], sortOrder: SortOrder | undefined): void {
  if (sortOrder === SortOrder.ASC || sortOrder === SortOrder.DESC) {
    sortByUpdatedOrCreated(data, sortOrder);
  }
}

async function fetchTenantsFromIdentity({
  page = 1,
  pageSize = 10,
  search,
  country,
  accountManager,
  platforms,
  sortOrder,
  status,
  statusQueryKey = 'customerProfileState',
}: FetchTenantsFromIdentityParams = {}): Promise<
  PaginatedResponse<TenantProfile>
> {
  const params = new URLSearchParams();
  appendParam(params, 'page', page);
  appendParam(params, 'limit', pageSize);
  appendParam(params, 'search', search, { trim: true });
  appendParam(params, 'country', country, { trim: true });
  appendParam(params, 'accountManager', accountManager, { trim: true });
  appendParam(params, 'platformName', platforms);
  appendParam(params, statusQueryKey, status, { trim: true });
  const url = `/tenants?${params.toString()}`;
  const response = await identityApiClient.get(url);
  const data = mapAndNormalizeTenants(response.data?.data);
  applySortIfNeeded(data, sortOrder);

  return {
    data,
    page: response.data?.page ?? 1,
    totalPages: response.data?.totalPages ?? 1,
    total: response.data?.total ?? 0,
  };
}

export const fetchInvitedTenants = async (
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  status?: string,
  sort?: string,
): Promise<InvitesResponse> => {
  const params = new URLSearchParams();
  appendParam(params, 'inviteType', 'tenant');
  appendParam(params, 'page', page);
  appendParam(params, 'limit', pageSize);
  appendParam(params, 'status', status, { trim: true });
  appendParam(params, 'search', search, { trim: true });
  let inviteListSort: string | undefined;
  if (sort === SortOrder.ASC || sort === SortOrder.DESC) {
    inviteListSort = sort;
  }
  appendParam(params, 'sort', inviteListSort, { trim: true });
  const url = `/invites?${params.toString()}`;
  const response = await adminApiClient.get(url);
  return response.data;
};

export const fetchTenants = async ({
  page = 1,
  pageSize = 10,
  search,
  status,
  sortOrder,
  country,
  accountManager,
  platforms,
  journey,
  statusQueryKey,
}: FetchTenantsParams = {}) => {
  if (journey === TenantJourney.ONBOARDED) {
    return fetchTenantsFromIdentity({
      page,
      pageSize,
      search,
      country,
      accountManager,
      platforms,
      sortOrder,
      status,
      statusQueryKey,
    });
  }

  if (journey === TenantJourney.INVITED) {
    const invitesResponse = await fetchInvitedTenants(
      page,
      pageSize,
      search,
      TenantInviteStatus.PENDING,
      sortOrder,
    );

    const mappedTenants: TenantProfile[] = invitesResponse.data.map(
      (invite: CreateInviteResponse) => {
        const inviteMetadata = getInviteMetadata(invite.metadata);

        return {
          id: invite.id,
          key: invite.email,
          name: invite.tenantName,
          businessName: invite.tenantName,
          metadata: {
            businessOwnerEmail: invite.email,
            ...inviteMetadata,
          },
          subDomain: null,
          country:
            typeof inviteMetadata.country === 'string'
              ? inviteMetadata.country
              : null,
          accountManager:
            typeof inviteMetadata.accountManager === 'string'
              ? inviteMetadata.accountManager
              : null,
          status: invite.status,
          customerProfileState: ReviewStatus.ONBOARDING,
          createdAt: invite.createdAt || '',
          updatedAt: invite.updatedAt || '',
          deletedAt: null,
          platforms: (invite.platforms || []).map((name) => ({
            id: name,
            name,
            metadata: {},
            createdAt: '',
            updatedAt: '',
            deletedAt: null,
            TenantPlatform: {
              settings: {},
              metadata: {},
            },
          })),
          email: invite.email,
          tenantId:
            typeof inviteMetadata.tenantId === 'string'
              ? inviteMetadata.tenantId
              : undefined,
          state: invite.status,
        };
      },
    );

    return {
      data: mappedTenants,
      page: invitesResponse.page,
      totalPages: invitesResponse.totalPages,
      total: invitesResponse.total,
    };
  }

  const params = new URLSearchParams();
  appendParam(params, 'page', page);
  appendParam(params, 'limit', pageSize);
  appendParam(params, 'search', search, { trim: true });
  appendParam(params, 'country', country, { trim: true });
  appendParam(params, 'accountManager', accountManager, { trim: true });
  appendParam(params, 'platformName', platforms);
  appendParam(params, 'customerProfileState', status, { trim: true });
  const url = `/tenants?${params.toString()}`;
  const response = await identityApiClient.get(url);
  const data = mapAndNormalizeTenants(response.data?.data);
  applySortIfNeeded(data, sortOrder);
  return {
    data,
    page: response.data?.page ?? 1,
    totalPages: response.data?.totalPages ?? 1,
    total: response.data?.total ?? 0,
  };
};

/** Loads the tenant-scoped customer profile; `tenantProfileId` is unused but kept for call-site and cache-key consistency. */
export const fetchTenantProfileById = async (
  _tenantProfileId: string,
  tenantId: string,
): Promise<DetailedTenantProfile> => {
  const response = await adminApiClient.get(
    `/profiles-review/tenants/${tenantId}/customer-profile`,
  );
  return response.data.customerProfile;
};

export const uploadTenantContracts = async (
  tenantId: string,
  customerProfileDataId: string,
  files: File[],
) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await adminApiClient.post(
    `/profiles-review/tenants/${tenantId}/customer-profile-data/${customerProfileDataId}/contracts`,
    formData,
    {
      timeout: 120_000,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data;
};

export const updateClientProfileState = async (
  tenantId: string,
  customerProfileDataId: string,
  state: ReviewStatus,
) => {
  const response = await adminApiClient.patch(
    `/profiles-review/tenants/${tenantId}/customer-profile-data/${customerProfileDataId}/state`,
    { state },
    { timeout: 60_000 },
  );
  return response.data;
};

export const fetchTenantPlatforms = async (
  tenantId: string,
): Promise<Platform[]> => {
  const response = await identityApiClient.get<Platform[]>(
    `/tenants/${tenantId}/platforms`,
  );
  return response.data;
};

export const fetchIdentityTenantById = async (
  tenantId: string,
): Promise<IdentityTenant> => {
  const response = await identityApiClient.get<IdentityTenant>(
    `/tenants/${tenantId}`,
  );
  return response.data;
};

export const updateIdentityTenant = async (
  tenantId: string,
  payload: UpdateIdentityTenantPayload,
): Promise<IdentityTenant> => {
  const response = await identityApiClient.patch<IdentityTenant>(
    `/tenants/${tenantId}`,
    payload,
  );
  return response.data;
};
