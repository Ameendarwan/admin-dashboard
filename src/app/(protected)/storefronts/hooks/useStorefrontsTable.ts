'use client';

import { useCallback, useMemo, useState } from 'react';

import type { StorefrontListStatus } from '@/types/storefront';

interface UseStorefrontsTableProps {
  onSearchChange?: (value: string) => void;
  onStatusFilterChange?: (value: StorefrontListStatus | 'all') => void;
  statusFilter: StorefrontListStatus | 'all';
  statusOptions: Array<{ value: string; label: string }>;
  translate: (key: string, values?: Record<string, string | number>) => string;
}

export function useStorefrontsTable({
  onSearchChange,
  onStatusFilterChange,
  statusFilter,
  statusOptions,
  translate,
}: UseStorefrontsTableProps) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      onSearchChange?.(value);
    },
    [onSearchChange],
  );

  const handleFilterChange = useCallback(
    (filterKey: string, value: string) => {
      if (filterKey === 'status') {
        onStatusFilterChange?.(value as StorefrontListStatus | 'all');
      }
    },
    [onStatusFilterChange],
  );

  const filtersConfig = useMemo(
    () => [
      {
        key: 'status',
        label: translate('table.status'),
        type: 'dropdown' as const,
        options: statusOptions,
        value: statusFilter,
        placeholder: translate('allStatuses'),
      },
    ],
    [statusFilter, statusOptions, translate],
  );

  return {
    searchValue,
    handleSearchChange,
    filtersConfig,
    handleFilterChange,
  };
}
