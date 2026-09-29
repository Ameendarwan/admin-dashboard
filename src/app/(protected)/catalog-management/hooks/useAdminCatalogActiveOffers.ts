'use client';

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';

import { catalogQueryKeys } from '@/api-queries/catalog/catalogQueryKeys';
import { invalidateCatalogActiveOffers } from '@/api-queries/catalog/invalidateCatalogActiveOffers';
import {
  offerListRowFromApiResponse,
  sortOfferDtosByCreatedAtDesc,
} from '@/app/(protected)/catalog-management/lib/offerCatalogPayload';
import { adminCatalogAxiosMessage } from '@/app/(protected)/catalog-management/utils/adminCatalogAxiosMessage';
import { listCatalogOffers } from '@/services/catalogAdminService';
import type { CatalogOfferListRow } from '@/types/catalog';
import { TIME_5_MIN } from '@/utils/timeUtils';

const PAGE_SIZE = 10;

type ActiveOffersQueryData = {
  rows: CatalogOfferListRow[];
  count: number;
};

export type ActiveOffersApiFilters = {
  search: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  sellerId?: string;
  categoryId?: string;
};

type UseAdminCatalogActiveOffersOptions = {
  page: number;
  setPage: (page: number) => void;
  filters: ActiveOffersApiFilters;
};

/** Paginated seller offers (active offers tab). */
export function useAdminCatalogActiveOffers(
  enabled: boolean,
  { page, setPage, filters }: UseAdminCatalogActiveOffersOptions,
) {
  const queryClient = useQueryClient();
  const queryFilters = useMemo(
    () => ({
      status: filters.status,
      sellerId: filters.sellerId,
      categoryId: filters.categoryId,
    }),
    [filters.categoryId, filters.sellerId, filters.status],
  );

  const query = useQuery({
    queryKey: catalogQueryKeys.activeOffers(
      page,
      PAGE_SIZE,
      filters.search,
      queryFilters,
    ),
    queryFn: async (): Promise<ActiveOffersQueryData> => {
      const offset = (page - 1) * PAGE_SIZE;
      const res = await listCatalogOffers({
        limit: PAGE_SIZE,
        offset,
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.sellerId ? { sellerId: filters.sellerId } : {}),
        ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      });
      const mapped = sortOfferDtosByCreatedAtDesc(res.rows)
        .map(offerListRowFromApiResponse)
        .filter(Boolean) as CatalogOfferListRow[];
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
    invalidateCatalogActiveOffers(queryClient);
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
