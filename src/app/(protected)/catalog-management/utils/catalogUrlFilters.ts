import {
  CATALOG_AL_FILTER,
  CATALOG_AL_STATUS_FILTERS,
  CATALOG_AL_TYPE_FILTERS,
  CATALOG_CREATED_AT_SORT_ORDERS,
  CATALOG_LR_FILTER,
  CATALOG_OF_FILTER,
  CATALOG_OF_STATUS_FILTERS,
  DEFAULT_CREATED_AT_SORT,
  LISTING_REQUEST_MATCH_FILTERS,
  LISTING_REQUEST_STATUS_FILTERS,
  type CatalogActiveListingStatusFilter,
  type CatalogActiveListingTypeFilter,
  type CatalogCreatedAtSortOrder,
  type CatalogOfferStatusFilter,
  type ListingRequestMatchFilter,
  type ListingRequestStatusFilter,
} from '../constants/catalogListFilterKeys';

const FILTER_ALL = 'all';

export function readOptionalQueryValue(
  searchParams: Pick<URLSearchParams, 'get'>,
  key: string,
): string | undefined {
  const value = searchParams.get(key)?.trim();
  return value && value !== FILTER_ALL ? value : undefined;
}

function readAllowed<T extends string>(
  searchParams: Pick<URLSearchParams, 'get'>,
  key: string,
  allowed: readonly T[],
): T | undefined {
  const value = readOptionalQueryValue(searchParams, key);
  return value && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}

export type ListingRequestUrlFilters = {
  search: string;
  tenantId?: string;
  status?: ListingRequestStatusFilter;
  matchResult?: ListingRequestMatchFilter;
  parentCategoryId?: string;
  subCategoryId?: string;
  sortOrder: CatalogCreatedAtSortOrder;
};

/** API `categoryId` is the subcategory when set, otherwise the parent. */
export function listingRequestApiCategoryId(
  filters: Pick<ListingRequestUrlFilters, 'parentCategoryId' | 'subCategoryId'>,
): string | undefined {
  return filters.subCategoryId ?? filters.parentCategoryId;
}

export function readListingRequestUrlFilters(
  searchParams: Pick<URLSearchParams, 'get'>,
): ListingRequestUrlFilters {
  const parentCategoryId = readOptionalQueryValue(
    searchParams,
    CATALOG_LR_FILTER.category,
  );
  const subCategoryId = readOptionalQueryValue(
    searchParams,
    CATALOG_LR_FILTER.subcategory,
  );
  return {
    search: searchParams.get(CATALOG_LR_FILTER.search)?.trim() ?? '',
    tenantId: readOptionalQueryValue(searchParams, CATALOG_LR_FILTER.seller),
    status: readAllowed(
      searchParams,
      CATALOG_LR_FILTER.status,
      LISTING_REQUEST_STATUS_FILTERS,
    ),
    matchResult: readAllowed(
      searchParams,
      CATALOG_LR_FILTER.match,
      LISTING_REQUEST_MATCH_FILTERS,
    ),
    parentCategoryId,
    subCategoryId:
      parentCategoryId && subCategoryId ? subCategoryId : undefined,
    sortOrder:
      readAllowed(
        searchParams,
        CATALOG_LR_FILTER.sort,
        CATALOG_CREATED_AT_SORT_ORDERS,
      ) ?? DEFAULT_CREATED_AT_SORT,
  };
}

export function writeOrDeleteQueryParam(
  params: URLSearchParams,
  key: string,
  value: string | undefined,
): void {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === FILTER_ALL) {
    params.delete(key);
    return;
  }
  params.set(key, trimmed);
}

export type ActiveListingUrlFilters = {
  search: string;
  status?: CatalogActiveListingStatusFilter;
  parentCategoryId?: string;
  subCategoryId?: string;
  brandId?: string;
  type?: CatalogActiveListingTypeFilter;
  sortOrder: CatalogCreatedAtSortOrder;
};

export function readActiveListingUrlFilters(
  searchParams: Pick<URLSearchParams, 'get'>,
): ActiveListingUrlFilters {
  const parentCategoryId = readOptionalQueryValue(
    searchParams,
    CATALOG_AL_FILTER.category,
  );
  const subCategoryId = readOptionalQueryValue(
    searchParams,
    CATALOG_AL_FILTER.subcategory,
  );
  return {
    search: searchParams.get(CATALOG_AL_FILTER.search)?.trim() ?? '',
    status: readAllowed(
      searchParams,
      CATALOG_AL_FILTER.status,
      CATALOG_AL_STATUS_FILTERS,
    ),
    parentCategoryId,
    subCategoryId:
      parentCategoryId && subCategoryId ? subCategoryId : undefined,
    brandId: readOptionalQueryValue(searchParams, CATALOG_AL_FILTER.brand),
    type: readAllowed(
      searchParams,
      CATALOG_AL_FILTER.type,
      CATALOG_AL_TYPE_FILTERS,
    ),
    sortOrder:
      readAllowed(
        searchParams,
        CATALOG_AL_FILTER.sort,
        CATALOG_CREATED_AT_SORT_ORDERS,
      ) ?? DEFAULT_CREATED_AT_SORT,
  };
}

export function activeListingApiStatus(
  status?: CatalogActiveListingStatusFilter,
): 'published' | 'draft' | 'rejected' | undefined {
  if (status === 'active') {
    return 'published';
  }
  if (status === 'draft') {
    return 'draft';
  }
  if (status === 'archived') {
    return 'rejected';
  }
  return undefined;
}

export type OfferUrlFilters = {
  search: string;
  sellerId?: string;
  status?: CatalogOfferStatusFilter;
  parentCategoryId?: string;
  subCategoryId?: string;
};

export function readOfferUrlFilters(
  searchParams: Pick<URLSearchParams, 'get'>,
): OfferUrlFilters {
  const parentCategoryId = readOptionalQueryValue(
    searchParams,
    CATALOG_OF_FILTER.category,
  );
  const subCategoryId = readOptionalQueryValue(
    searchParams,
    CATALOG_OF_FILTER.subcategory,
  );
  return {
    search: searchParams.get(CATALOG_OF_FILTER.search)?.trim() ?? '',
    sellerId: readOptionalQueryValue(searchParams, CATALOG_OF_FILTER.seller),
    status: readAllowed(
      searchParams,
      CATALOG_OF_FILTER.status,
      CATALOG_OF_STATUS_FILTERS,
    ),
    parentCategoryId,
    subCategoryId:
      parentCategoryId && subCategoryId ? subCategoryId : undefined,
  };
}

export function offerApiCategoryId(
  filters: Pick<OfferUrlFilters, 'parentCategoryId' | 'subCategoryId'>,
): string | undefined {
  return filters.subCategoryId ?? filters.parentCategoryId;
}
