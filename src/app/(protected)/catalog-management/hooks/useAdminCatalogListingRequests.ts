'use client';

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';

import { catalogQueryKeys } from '@/api-queries/catalog/catalogQueryKeys';
import { buildListingRequestsListQuery } from '@/app/(protected)/catalog-management/constants/listingRequestsTableSort';
import { listingRequestRowFromListItem } from '@/app/(protected)/catalog-management/lib/listingRequestMappers';
import { normalizedListingRequestsTotalPages } from '@/app/(protected)/catalog-management/lib/normalizeListingRequestsPagination';
import { adminCatalogAxiosMessage } from '@/app/(protected)/catalog-management/utils/adminCatalogAxiosMessage';
import type { ListingRequestUrlFilters } from '@/app/(protected)/catalog-management/utils/catalogUrlFilters';
import { listingRequestApiCategoryId } from '@/app/(protected)/catalog-management/utils/catalogUrlFilters';
import { listCatalogListingRequests } from '@/services/catalogAdminService';
import type { ListingRequestRow } from '@/types/catalog';
import { TIME_5_MIN } from '@/utils/timeUtils';

const PAGE_SIZE = 10;

type ListingRequestsQueryData = {
  rows: ListingRequestRow[];
  total: number;
  totalPages: number;
};

type UseAdminCatalogListingRequestsOptions = {
  page: number;
  setPage: (page: number) => void;
  filters: ListingRequestUrlFilters;
};

/** Paginated listing requests (all statuses; seller-portal excludes processing `invalid_entry`). */
export function useAdminCatalogListingRequests(
  enabled: boolean,
  { page, setPage, filters }: UseAdminCatalogListingRequestsOptions,
) {
  const queryClient = useQueryClient();
  const listQuery = useMemo(
    () => buildListingRequestsListQuery(page, PAGE_SIZE, filters),
    [filters, page],
  );
  const categoryId = listingRequestApiCategoryId(filters);
  const listFilters = useMemo(
    () => ({
      tenantId: filters.tenantId,
      status: filters.status,
      matchResult: filters.matchResult,
      categoryId,
    }),
    [categoryId, filters.matchResult, filters.status, filters.tenantId],
  );

  const query = useQuery({
    queryKey: catalogQueryKeys.listingRequests(
      listQuery.page ?? page,
      listQuery.limit ?? PAGE_SIZE,
      filters.search,
      listQuery.sortColumn ?? 'createdAt',
      listQuery.sortOrder ?? 'desc',
      listFilters,
    ),
    queryFn: async (): Promise<ListingRequestsQueryData> => {
      const res = await listCatalogListingRequests(listQuery);
      const rawRows = Array.isArray(res.data) ? res.data : [];
      const mapped = rawRows
        .map((r) => listingRequestRowFromListItem(r as Record<string, unknown>))
        .filter(Boolean) as ListingRequestRow[];
      const p = res.pagination;
      const total = typeof p?.total === 'number' ? p.total : mapped.length;
      const totalPages = normalizedListingRequestsTotalPages(
        total,
        p?.totalPages,
        PAGE_SIZE,
      );
      return { rows: mapped, total, totalPages };
    },
    enabled,
    placeholderData: keepPreviousData,
    gcTime: TIME_5_MIN,
    staleTime: TIME_5_MIN,
  });

  const rows = query.data?.rows ?? [];
  const total = query.data?.total ?? 0;
  const apiTotalPages = query.data?.totalPages ?? 1;
  const totalKnown = enabled && query.isSuccess && total > 0;
  const totalPages = totalKnown ? apiTotalPages : 1;
  const displayPage = totalKnown ? Math.min(page, totalPages) : page;
  const loading = enabled && query.isFetching;
  const error = query.isError ? adminCatalogAxiosMessage(query.error) : null;

  useEffect(() => {
    if (!totalKnown || page <= totalPages) {
      return;
    }
    setPage(totalPages);
  }, [page, setPage, totalKnown, totalPages]);

  const refetch = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: catalogQueryKeys.listingRequests(
        page,
        PAGE_SIZE,
        filters.search,
        listQuery.sortColumn ?? 'createdAt',
        listQuery.sortOrder ?? 'desc',
        listFilters,
      ),
    });
  }, [
    filters.search,
    listFilters,
    listQuery.sortColumn,
    listQuery.sortOrder,
    page,
    queryClient,
  ]);

  return {
    page: displayPage,
    setPage,
    pageSize: PAGE_SIZE,
    rows,
    total,
    totalPages: totalKnown ? totalPages : Math.max(page, 1),
    loading,
    error,
    refetch,
  };
}
