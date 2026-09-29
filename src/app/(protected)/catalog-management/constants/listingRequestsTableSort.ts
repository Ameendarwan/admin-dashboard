import type {
  ListCatalogListingRequestsParams,
  ListingRequestSortColumn,
} from '@/types/catalog';

import type { ListingRequestUrlFilters } from '../utils/catalogUrlFilters';
import { listingRequestApiCategoryId } from '../utils/catalogUrlFilters';

/** Default listing-requests table sort (newest submissions first). */
export const LISTING_REQUESTS_TABLE_SORT = {
  sortColumn: 'createdAt',
  sortOrder: 'desc',
} as const satisfies {
  sortColumn: ListingRequestSortColumn;
  sortOrder: 'asc' | 'desc';
};

export function buildListingRequestsListQuery(
  page: number,
  limit: number,
  filters: ListingRequestUrlFilters,
): ListCatalogListingRequestsParams {
  const categoryId = listingRequestApiCategoryId(filters);
  return {
    page,
    limit,
    sortColumn: LISTING_REQUESTS_TABLE_SORT.sortColumn,
    sortOrder: filters.sortOrder,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.tenantId ? { tenantId: filters.tenantId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.matchResult ? { matchResult: filters.matchResult } : {}),
    ...(categoryId ? { categoryId } : {}),
  };
}
