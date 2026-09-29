'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { catalogQueryKeys } from '@/api-queries/catalog/catalogQueryKeys';
import { sellerOptionFromBulkRow } from '@/app/(protected)/catalog-management/utils/sellerDetailsDisplay';
import useDebounce from '@/hooks/useDebounce';
import { bulkGetSellerDetails } from '@/services/sellerService';
import { TIME_5_MIN } from '@/utils/timeUtils';

const SEARCH_DEBOUNCE_MS = 300;
const DROPDOWN_LIMIT = 40;

export function useCatalogSellerSearchOptions(
  enabled: boolean,
  listEnabled: boolean,
  searchInput: string,
  selectedTenantId?: string,
) {
  const debouncedSearch = useDebounce(searchInput.trim(), SEARCH_DEBOUNCE_MS);

  const listQuery = useQuery({
    queryKey: catalogQueryKeys.sellerDetailsBulk(debouncedSearch),
    queryFn: () =>
      bulkGetSellerDetails({
        search: debouncedSearch || undefined,
        fullData: true,
        onboarded: true,
        limit: DROPDOWN_LIMIT,
      }),
    enabled: enabled && listEnabled,
    staleTime: TIME_5_MIN,
    gcTime: TIME_5_MIN,
  });

  const selectedQuery = useQuery({
    queryKey: catalogQueryKeys.sellerDetailsById(selectedTenantId ?? ''),
    queryFn: () =>
      bulkGetSellerDetails({
        sellerIds: [selectedTenantId!],
        fullData: true,
      }),
    enabled: Boolean(enabled && selectedTenantId),
    staleTime: TIME_5_MIN,
    gcTime: TIME_5_MIN,
  });

  const options = useMemo(() => {
    const mapped = (listQuery.data ?? [])
      .map(sellerOptionFromBulkRow)
      .filter((option) => option !== null)
      .sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }),
      );
    const selected = selectedQuery.data?.[0]
      ? sellerOptionFromBulkRow(selectedQuery.data[0])
      : null;
    if (selected && !mapped.some((option) => option.value === selected.value)) {
      mapped.unshift(selected);
    }
    return mapped;
  }, [listQuery.data, selectedQuery.data]);

  return {
    options,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
  };
}
