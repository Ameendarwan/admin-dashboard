import { adminApiClient } from '@/lib/apiClient';
import type {
  CreateStorefrontBody,
  CreateStorefrontResult,
  ListGlobalStorefrontsParams,
  ListStorefrontsParams,
  PaginatedStorefrontList,
  StorefrontListItem,
  StorefrontSetupConfig,
  UpdateStorefrontStatusBody,
} from '@/types/storefrontAdminApi';

const STOREFRONTS_PATH = '/admin/storefronts';

type LegacyStorefrontListItem = StorefrontListItem & {
  isSetupComplete?: boolean;
  hasUnpublishedChanges?: boolean;
  setupConfig?: StorefrontSetupConfig;
  OrdersFulfilled?: number;
};

function readStorefrontOrderCount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  return 0;
}

function normalizeStorefrontSetupConfig(
  item: LegacyStorefrontListItem,
): StorefrontSetupConfig {
  if (item.setupConfig) {
    return item.setupConfig;
  }

  return {
    isSetupComplete: item.isSetupComplete ?? false,
    hasUnpublishedChanges: item.hasUnpublishedChanges ?? false,
    completedChecklistsCount: 0,
    requiredChecklistsCount: 0,
  };
}

function normalizeStorefrontListItem(
  item: LegacyStorefrontListItem,
): StorefrontListItem {
  const setupConfig = normalizeStorefrontSetupConfig(item);

  return {
    id: item.id,
    tenantId: item.tenantId,
    storeName: item.storeName,
    urlSlug: item.urlSlug,
    currency: item.currency,
    region: item.region,
    status: item.status,
    floatBalance: item.floatBalance,
    lowFloatThreshold: item.lowFloatThreshold,
    enabledLocales: item.enabledLocales,
    defaultLocale: item.defaultLocale,
    metadata: item.metadata,
    salesChannelId: item.salesChannelId,
    createdBy: item.createdBy,
    updatedBy: item.updatedBy,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    businessName: item.businessName,
    adminName: item.adminName,
    adminEmail: item.adminEmail,
    totalOrders: readStorefrontOrderCount(item.totalOrders),
    ordersFulfilled: readStorefrontOrderCount(
      item.ordersFulfilled ?? item.OrdersFulfilled,
    ),
    setupConfig,
  };
}

function normalizeStorefrontList(
  items: LegacyStorefrontListItem[],
): StorefrontListItem[] {
  return items.map(normalizeStorefrontListItem);
}

function isPaginatedStorefrontList(
  payload: StorefrontListItem[] | PaginatedStorefrontList,
): payload is PaginatedStorefrontList {
  return (
    payload !== null &&
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    Array.isArray(payload.data)
  );
}

function normalizePaginatedList(
  payload: StorefrontListItem[] | PaginatedStorefrontList,
  params: Pick<ListGlobalStorefrontsParams, 'limit' | 'offset'>,
): PaginatedStorefrontList {
  if (isPaginatedStorefrontList(payload)) {
    return {
      ...payload,
      data: normalizeStorefrontList(payload.data),
    };
  }

  const rows = Array.isArray(payload) ? payload : [];
  return {
    data: normalizeStorefrontList(rows),
    total: rows.length,
    limit: params.limit ?? rows.length,
    offset: params.offset ?? 0,
  };
}

function buildStorefrontListQuery(
  params: Pick<ListStorefrontsParams, 'tenantId' | 'storeName' | 'status'>,
): Record<string, string> {
  const query: Record<string, string> = {};

  if (params.tenantId?.trim()) {
    query.tenantId = params.tenantId.trim();
  }

  if (params.storeName?.trim()) {
    query.storeName = params.storeName.trim();
  }

  if (params.status) {
    query.status = params.status;
  }

  return query;
}

/**
 * Global storefront list for `/storefronts`.
 * Omits `tenantId` so admin-be returns every storefront across tenants.
 */
export async function listGlobalStorefronts(
  params: ListGlobalStorefrontsParams,
): Promise<PaginatedStorefrontList> {
  const query: Record<string, string | number> = {
    limit: params.limit,
    offset: params.offset,
    ...buildStorefrontListQuery(params),
  };

  const { data } = await adminApiClient.get<
    StorefrontListItem[] | PaginatedStorefrontList
  >(STOREFRONTS_PATH, { params: query });

  return normalizePaginatedList(data, params);
}

/** Tenant-scoped list for tenant detail tab (all storefronts for one tenant). */
export async function listTenantStorefronts(
  tenantId: string,
  filters: Pick<ListStorefrontsParams, 'storeName' | 'status'> = {},
): Promise<StorefrontListItem[]> {
  const { data } = await adminApiClient.get<
    StorefrontListItem[] | PaginatedStorefrontList
  >(STOREFRONTS_PATH, {
    params: {
      ...buildStorefrontListQuery({ tenantId, ...filters }),
    },
  });

  if (isPaginatedStorefrontList(data)) {
    return normalizeStorefrontList(data.data);
  }

  return normalizeStorefrontList(Array.isArray(data) ? data : []);
}

/** Admin-be proxies storefront-be PATCH /admin/storefronts/:storefrontId. */
export async function updateStorefrontStatus(
  storefrontId: string,
  body: UpdateStorefrontStatusBody,
): Promise<CreateStorefrontResult> {
  const { data } = await adminApiClient.patch<CreateStorefrontResult>(
    `${STOREFRONTS_PATH}/${storefrontId}`,
    body,
  );
  return data;
}

/** Admin-be proxies storefront-be POST /admin/storefronts. */
export async function createStorefront(
  body: CreateStorefrontBody,
): Promise<CreateStorefrontResult> {
  const { data } = await adminApiClient.post<CreateStorefrontResult>(
    STOREFRONTS_PATH,
    body,
    { timeout: 120_000 },
  );
  return data;
}
