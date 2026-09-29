'use client';

import { useCallback, useEffect, useState } from 'react';

import { useTenants } from '@/api-queries/tenantManagement';
import { TenantJourney } from '@/lib/enums';
import type { TenantProfile } from '@/types/tenantManagement';

import useDebounce from './useDebounce';

export type CreateStorefrontTenantOption = {
  value: string;
  label: string;
  profileId: string;
  name: string;
};

const TENANT_PAGE_SIZE = 10;
const TENANT_SEARCH_DEBOUNCE_MS = 300;

function mapTenantProfileToOption(
  tenant: TenantProfile,
): CreateStorefrontTenantOption | null {
  const tenantId = tenant.tenantId?.trim() || tenant.id;
  const name = tenant.businessName?.trim() || tenant.name?.trim() || tenantId;

  if (!tenantId) {
    return null;
  }

  return {
    value: tenantId,
    label: name,
    profileId: tenant.id,
    name,
  };
}

export function useCreateStorefrontTenantOptions(enabled: boolean) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [options, setOptions] = useState<CreateStorefrontTenantOption[]>([]);
  const [committedSearch, setCommittedSearch] = useState('');

  const debouncedSearch = useDebounce(
    searchInput.trim(),
    TENANT_SEARCH_DEBOUNCE_MS,
  );
  const effectivePage = debouncedSearch === committedSearch ? page : 1;

  const { data, isLoading, isFetching, isError } = useTenants({
    page: effectivePage,
    pageSize: TENANT_PAGE_SIZE,
    search: debouncedSearch || undefined,
    journey: TenantJourney.ONBOARDED,
    sortOrder: 'desc',
    enabled,
  });

  useEffect(() => {
    if (debouncedSearch === committedSearch) {
      return;
    }

    setCommittedSearch(debouncedSearch);
    setPage(1);
    setOptions([]);
  }, [committedSearch, debouncedSearch]);

  useEffect(() => {
    if (!enabled) {
      setOptions([]);
      return;
    }

    const mapped = (data?.data ?? [])
      .map(mapTenantProfileToOption)
      .filter(
        (option): option is CreateStorefrontTenantOption => option !== null,
      );

    setOptions((current) => {
      if (effectivePage === 1) {
        return mapped;
      }

      const existingIds = new Set(current.map((option) => option.value));
      const appended = mapped.filter(
        (option) => !existingIds.has(option.value),
      );
      return [...current, ...appended];
    });
  }, [data?.data, effectivePage, enabled]);

  const totalPages = data?.totalPages ?? 1;
  const hasMore = effectivePage < totalPages;

  const loadMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setPage((current) => (effectivePage === current ? current + 1 : 2));
    }
  }, [effectivePage, hasMore, isFetching]);

  const findOptionByValue = useCallback(
    (tenantId: string) => options.find((option) => option.value === tenantId),
    [options],
  );

  return {
    options,
    searchInput,
    setSearchInput,
    loadMore,
    hasMore,
    findOptionByValue,
    isLoading: enabled && isLoading,
    isLoadingMore: enabled && isFetching && effectivePage > 1,
    isError,
    total: data?.total ?? 0,
  };
}
