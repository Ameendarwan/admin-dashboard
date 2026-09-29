'use client';

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { catalogQueryKeys } from '@/api-queries/catalog/catalogQueryKeys';
import {
  GIFT_CARD_PAGE_SIZE,
  GIFT_CARD_STATUS_FILTER_ALL,
} from '@/app/(protected)/gift-card-management/constants/giftCardManagementConstants';
import { giftCardRowFromApi } from '@/app/(protected)/gift-card-management/lib/giftCardRowFromApi';
import {
  buildGiftCardCategoryFilterOptions,
  resolveGiftCardCategoryFilterIds,
} from '@/app/(protected)/gift-card-management/utils/giftCardCategoryFilterOptions';
import type { GiftCardRow } from '@/types/catalog';
import { adminCatalogAxiosMessage } from '@/app/(protected)/catalog-management/utils/adminCatalogAxiosMessage';
import {
  listAllCatalogCategories,
  listCatalogProducts,
} from '@/services/catalogAdminService';
import { TIME_5_MIN } from '@/utils/timeUtils';

const SEARCH_DEBOUNCE_MS = 350;

type GiftCardsQueryData = {
  rows: GiftCardRow[];
  count: number;
};

type UseAdminGiftCardsOptions = Readonly<{
  page: number;
  setPage: (page: number) => void;
  categoryFilter: string;
  statusFilter: string;
}>;

/** Paginated gift-card products via admin-be GET /catalog/products?isGiftcard=true. */
export function useAdminGiftCards(
  enabled: boolean,
  { page, setPage, categoryFilter, statusFilter }: UseAdminGiftCardsOptions,
) {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const prevDebouncedSearchRef = useRef(debouncedSearch);
  const prevCategoryFilterRef = useRef(categoryFilter);
  const prevStatusFilterRef = useRef(statusFilter);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(searchInput.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (prevDebouncedSearchRef.current === debouncedSearch) {
      return;
    }
    prevDebouncedSearchRef.current = debouncedSearch;
    setPage(1);
  }, [debouncedSearch, setPage]);

  useEffect(() => {
    if (prevCategoryFilterRef.current === categoryFilter) {
      return;
    }
    prevCategoryFilterRef.current = categoryFilter;
    setPage(1);
  }, [categoryFilter, setPage]);

  useEffect(() => {
    if (prevStatusFilterRef.current === statusFilter) {
      return;
    }
    prevStatusFilterRef.current = statusFilter;
    setPage(1);
  }, [setPage, statusFilter]);

  const categoryId = categoryFilter !== 'all' ? categoryFilter : undefined;
  const status =
    statusFilter !== GIFT_CARD_STATUS_FILTER_ALL ? statusFilter : undefined;

  const categoriesQuery = useQuery({
    queryKey: catalogQueryKeys.giftCardCategories(),
    queryFn: () => listAllCatalogCategories({ isGiftcardCategory: true }),
    enabled,
    staleTime: TIME_5_MIN,
    gcTime: TIME_5_MIN,
  });

  const categoryIds = useMemo(() => {
    if (!categoryId) {
      return undefined;
    }
    return resolveGiftCardCategoryFilterIds(
      categoryId,
      categoriesQuery.data ?? [],
    );
  }, [categoryId, categoriesQuery.data]);

  const query = useQuery({
    queryKey: catalogQueryKeys.giftCards(
      page,
      GIFT_CARD_PAGE_SIZE,
      debouncedSearch,
      categoryId ?? 'all',
      status ?? GIFT_CARD_STATUS_FILTER_ALL,
    ),
    queryFn: async (): Promise<GiftCardsQueryData> => {
      const offset = (page - 1) * GIFT_CARD_PAGE_SIZE;
      const res = await listCatalogProducts({
        isGiftcard: true,
        limit: GIFT_CARD_PAGE_SIZE,
        offset,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(categoryIds?.length ? { categoryIds } : {}),
        ...(status ? { status } : {}),
      });
      const mapped = res.rows
        .map(giftCardRowFromApi)
        .filter((row): row is GiftCardRow => row !== null);
      return {
        rows: mapped,
        count: typeof res.count === 'number' ? res.count : mapped.length,
      };
    },
    // Wait for categories when filtering so parent → child id expansion is ready.
    enabled: enabled && (!categoryId || categoriesQuery.isSuccess),
    placeholderData: keepPreviousData,
    gcTime: TIME_5_MIN,
    staleTime: TIME_5_MIN,
  });

  const rows = query.data?.rows ?? [];
  const total = query.data?.count ?? 0;
  const totalKnown = enabled && query.isSuccess && total > 0;
  const totalPages = useMemo(
    () =>
      totalKnown ? Math.max(1, Math.ceil(total / GIFT_CARD_PAGE_SIZE)) : 1,
    [total, totalKnown],
  );
  const displayPage = totalKnown ? Math.min(page, totalPages) : page;
  const loading = enabled && (query.isFetching || categoriesQuery.isFetching);
  const error = query.isError ? adminCatalogAxiosMessage(query.error) : null;

  useEffect(() => {
    if (!totalKnown || page <= totalPages) {
      return;
    }
    setPage(totalPages);
  }, [page, setPage, totalKnown, totalPages]);

  const refetch = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: [...catalogQueryKeys.all, 'gift-cards'],
    });
  }, [queryClient]);

  const categoryOptions = useMemo(
    () => buildGiftCardCategoryFilterOptions(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  );

  return {
    search: searchInput,
    setSearch: setSearchInput,
    page: displayPage,
    setPage,
    pageSize: GIFT_CARD_PAGE_SIZE,
    rows,
    total,
    totalPages: totalKnown ? totalPages : Math.max(page, 1),
    loading,
    error,
    refetch,
    categoryOptions,
  };
}
