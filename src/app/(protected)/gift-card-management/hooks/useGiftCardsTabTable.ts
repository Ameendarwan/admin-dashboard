'use client';

import { useCallback, useMemo, useState } from 'react';

interface UseGiftCardsTabTableProps {
  onSearchChange?: (value: string) => void;
  onCategoryFilterChange?: (value: string) => void;
  onStatusFilterChange?: (value: string) => void;
  categoryFilter: string;
  statusFilter: string;
  categoryOptions: Array<{ value: string; label: string }>;
  statusOptions: Array<{ value: string; label: string }>;
  translate: (key: string, values?: Record<string, string | number>) => string;
}

export function useGiftCardsTabTable({
  onSearchChange,
  onCategoryFilterChange,
  onStatusFilterChange,
  categoryFilter,
  statusFilter,
  categoryOptions,
  statusOptions,
  translate,
}: UseGiftCardsTabTableProps) {
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
      if (filterKey === 'category') {
        onCategoryFilterChange?.(value);
      }
      if (filterKey === 'status') {
        onStatusFilterChange?.(value);
      }
    },
    [onCategoryFilterChange, onStatusFilterChange],
  );

  const filtersConfig = useMemo(
    () => [
      {
        key: 'category',
        label: translate('giftCardManagement.table.category'),
        type: 'dropdown' as const,
        options: categoryOptions,
        value: categoryFilter,
        placeholder: translate('allCategories'),
      },
      {
        key: 'status',
        label: translate('giftCardManagement.table.status'),
        type: 'dropdown' as const,
        options: statusOptions,
        value: statusFilter,
        placeholder: translate('allStatuses'),
      },
    ],
    [categoryFilter, categoryOptions, statusFilter, statusOptions, translate],
  );

  return {
    searchValue,
    handleSearchChange,
    filtersConfig,
    handleFilterChange,
  };
}
