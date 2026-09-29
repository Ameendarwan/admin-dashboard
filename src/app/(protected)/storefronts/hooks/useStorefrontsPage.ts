'use client';

import { useEffect, useMemo, useState } from 'react';

import { useGlobalStorefrontsList } from '@/api-queries/storefronts';
import useDebounce from '@/hooks/useDebounce';
import type { StorefrontListStatus } from '@/types/storefront';
import type { StorefrontStatus } from '@/types/storefrontAdminApi';

import { mapStorefrontListItemToRow } from '../lib/mapStorefrontListRow';

const PAGE_SIZE = 10;

function toApiStatus(
  status: StorefrontListStatus | 'all',
): StorefrontStatus | undefined {
  if (status === 'all') {
    return undefined;
  }
  return status;
}

export function useStorefrontsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    StorefrontListStatus | 'all'
  >('all');

  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const listParams = useMemo(
    () => ({
      storeName: debouncedSearch.trim() || undefined,
      status: toApiStatus(statusFilter),
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    [debouncedSearch, page, statusFilter],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGlobalStorefrontsList(listParams);

  const rows = useMemo(
    () => (data?.data ?? []).map(mapStorefrontListItemToRow),
    [data?.data],
  );

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return {
    page,
    setPage,
    pageSize: PAGE_SIZE,
    rows,
    total,
    totalPages,
    search: searchInput,
    setSearch: setSearchInput,
    statusFilter,
    setStatusFilter,
    loading: isLoading || isFetching,
    isError,
    refetch,
  };
}
