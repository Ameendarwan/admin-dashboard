'use client';

import { useCallback, useMemo, useState } from 'react';

interface UseActivationRequestsTabTableProps {
  onSearchChange?: (value: string) => void;
  onStatusFilterChange?: (value: string) => void;
  statusFilter: string;
  statusOptions: Array<{ value: string; label: string }>;
  translate: (key: string, values?: Record<string, string | number>) => string;
}

export function useActivationRequestsTabTable({
  onSearchChange,
  onStatusFilterChange,
  statusFilter,
  statusOptions,
  translate,
}: UseActivationRequestsTabTableProps) {
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
        onStatusFilterChange?.(value);
      }
    },
    [onStatusFilterChange],
  );

  const filtersConfig = useMemo(
    () => [
      {
        key: 'status',
        label: translate('activationRequests.allStatuses'),
        type: 'dropdown' as const,
        options: statusOptions,
        value: statusFilter,
        placeholder: translate('activationRequests.allStatuses'),
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
