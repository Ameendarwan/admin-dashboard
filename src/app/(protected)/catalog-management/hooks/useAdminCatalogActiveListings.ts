'use client';

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';

import { catalogQueryKeys } from '@/api-queries/catalog/catalogQueryKeys';
import { invalidateCatalogActiveListings } from '@/api-queries/catalog/invalidateCatalogActiveListings';
import { activeListingRowFromApiResponse } from '@/app/(protected)/catalog-management/lib/productCatalogPayload';
import { adminCatalogAxiosMessage } from '@/app/(protected)/catalog-management/utils/adminCatalogAxiosMessage';
import { listCatalogProducts } from '@/services/catalogAdminService';
import type { ActiveListingRow } from '@/types/catalog';
import { TIME_5_MIN } from '@/utils/timeUtils';

const PAGE_SIZE = 10;

type ActiveListingsQueryData = {
  rows: ActiveListingRow[];
  count: number;
};

export type ActiveListingsApiFilters = {
  search: string;
  status?: 'published' | 'draft' | 'rejected';
  categoryIds?: string[];
  brandId?: string;
  isGiftcard?: boolean;
  sortOrder: 'asc' | 'desc';
};

type UseAdminCatalogActiveListingsOptions = {
  page: number;
  setPage: (page: number) => void;
  filters: ActiveListingsApiFilters;
};

/** Paginated catalog products (active listings tab). */
export function useAdminCatalogActiveListings(
  enabled: boolean,
  { page, setPage, filters }: UseAdminCatalogActiveListingsOptions,
) {
  const queryClient = useQueryClient();
  const queryFilters = useMemo(
    () => ({
      status: filters.status,
      categoryIds: filters.categoryIds,
      brandId: filters.brandId,
      isGiftcard: filters.isGiftcard,
      sortOrder: filters.sortOrder,
    }),
    [
      filters.brandId,
      filters.categoryIds,
      filters.isGiftcard,
      filters.sortOrder,
      filters.status,
    ],
  );

  const query = useQuery({
    queryKey: catalogQueryKeys.activeListings(
      page,
      PAGE_SIZE,
      filters.search,
      queryFilters,
    ),
    queryFn: async (): Promise<ActiveListingsQueryData> => {
      const offset = (page - 1) * PAGE_SIZE;
      const res = await listCatalogProducts({
        limit: PAGE_SIZE,
        offset,
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.categoryIds?.length
          ? { categoryIds: filters.categoryIds }
          : {}),
        ...(filters.brandId ? { brandIds: [filters.brandId] } : {}),
        ...(typeof filters.isGiftcard === 'boolean'
          ? { isGiftcard: filters.isGiftcard }
          : {}),
        sortOrder: filters.sortOrder,
      });
      const mapped = res.rows
        .map(activeListingRowFromApiResponse)
        .filter(Boolean) as ActiveListingRow[];
      return {
        rows: mapped,
        count: typeof res.count === 'number' ? res.count : mapped.length,
      };
    },
    enabled,
    placeholderData: keepPreviousData,
    gcTime: TIME_5_MIN,
    staleTime: TIME_5_MIN,
  });

  const rows = query.data?.rows ?? [];
  const total = query.data?.count ?? 0;
  const totalKnown = enabled && query.isSuccess && total > 0;
  const totalPages = useMemo(
    () => (totalKnown ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : 1),
    [total, totalKnown],
  );
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
    invalidateCatalogActiveListings(queryClient);
  }, [queryClient]);

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
