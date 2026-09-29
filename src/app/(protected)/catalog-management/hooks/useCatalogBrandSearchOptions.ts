'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { catalogQueryKeys } from '@/api-queries/catalog/catalogQueryKeys';
import useDebounce from '@/hooks/useDebounce';
import { listCatalogBrands } from '@/services/catalogAdminService';
import { TIME_5_MIN } from '@/utils/timeUtils';

const SEARCH_DEBOUNCE_MS = 300;

export type CatalogBrandOption = { value: string; label: string };

export function useCatalogBrandSearchOptions(
  enabled: boolean,
  listEnabled: boolean,
  searchInput: string,
  selectedBrandId?: string,
) {
  const debouncedSearch = useDebounce(searchInput.trim(), SEARCH_DEBOUNCE_MS);

  const listQuery = useQuery({
    queryKey: catalogQueryKeys.catalogBrands(debouncedSearch),
    queryFn: () =>
      listCatalogBrands({
        search: debouncedSearch || undefined,
        limit: 40,
        offset: 0,
        sortBy: 'name',
        sortOrder: 'asc',
      }),
    enabled: enabled && (listEnabled || Boolean(selectedBrandId)),
    staleTime: TIME_5_MIN,
    gcTime: TIME_5_MIN,
  });

  const options = useMemo<CatalogBrandOption[]>(() => {
    const mapped = (listQuery.data?.rows ?? [])
      .map((row) => {
        const id = typeof row.id === 'string' ? row.id.trim() : '';
        const name = typeof row.name === 'string' ? row.name.trim() : '';
        if (!id) {
          return null;
        }
        return { value: id, label: name || id };
      })
      .filter((option): option is CatalogBrandOption => option !== null)
      .sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }),
      );
    if (
      selectedBrandId &&
      !mapped.some((option) => option.value === selectedBrandId)
    ) {
      mapped.unshift({ value: selectedBrandId, label: selectedBrandId });
    }
    return mapped;
  }, [listQuery.data?.rows, selectedBrandId]);

  return {
    options,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
  };
}
