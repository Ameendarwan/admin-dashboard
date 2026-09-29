/** Wire types aligned with admin-be storefront proxy (storefront-be contract). */

export type StorefrontStatus = 'draft' | 'live' | 'suspended';

export const STOREFRONT_STATUSES = [
  'draft',
  'live',
  'suspended',
] as const satisfies ReadonlyArray<StorefrontStatus>;

export type StorefrontCategoryType = 'MERCHANDISE' | 'GIFTCARD';

export type ProductSelectionMode = 'all' | 'specific';

export type StorefrontSetupConfig = {
  isSetupComplete: boolean;
  hasUnpublishedChanges: boolean;
  completedChecklistsCount: number;
  requiredChecklistsCount: number;
};

export type StorefrontListItem = {
  id: string;
  tenantId: string;
  storeName: string;
  urlSlug: string;
  currency: string;
  region: string | null;
  status: StorefrontStatus;
  floatBalance: string;
  lowFloatThreshold: string | null;
  enabledLocales: string[];
  defaultLocale: string;
  metadata: Record<string, unknown>;
  salesChannelId: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt?: string;
  updatedAt?: string;
  setupConfig: StorefrontSetupConfig;
  businessName: string | null;
  adminName: string | null;
  adminEmail: string | null;
  totalOrders: number;
  ordersFulfilled: number;
};

export type PaginatedStorefrontList = {
  data: StorefrontListItem[];
  total: number;
  limit: number;
  offset: number;
};

export type ListStorefrontsParams = {
  tenantId?: string;
  storeName?: string;
  status?: StorefrontStatus;
  limit?: number;
  offset?: number;
};

export type ListGlobalStorefrontsParams = {
  tenantId?: string;
  storeName?: string;
  status?: StorefrontStatus;
  limit: number;
  offset: number;
};

export type CreateStorefrontCategoryBody = {
  categoryId: string;
  name?: string;
  type: StorefrontCategoryType;
  productSelectionMode: ProductSelectionMode;
  productIds?: string[];
  productCount?: number;
  sortOrder?: number;
};

export type CreateStorefrontBody = {
  tenantId: string;
  storeName: string;
  urlSlug: string;
  region: string;
  currency?: string;
  floatBalance: number;
  lowFloatThreshold: number;
  categories: CreateStorefrontCategoryBody[];
};

export type CreateStorefrontResult = {
  storefrontId: string;
  storeName: string;
  urlSlug: string;
  tenantId: string;
  salesChannelId: string;
  status: StorefrontStatus;
  categoriesCreated: number;
  productsAllowlisted: number;
};

export type UpdateStorefrontStatusBody = {
  tenantId: string;
  status: StorefrontStatus;
};
