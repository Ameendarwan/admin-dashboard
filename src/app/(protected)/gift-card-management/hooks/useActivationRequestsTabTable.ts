'use client';

import { useCallback, useMemo, useState } from 'react';

interface UseActivationRequestsTabTableProps {
  onSearchChange?: (value: string) => void;
  onTenantFilterChange?: (value: string) => void;
  onStatusFilterChange?: (value: string) => void;
  tenantFilter: string;
  statusFilter: string;
  tenantOptions: Array<{ value: string; label: string }>;
  statusOptions: Array<{ value: string; label: string }>;
  translate: (key: string, values?: Record<string, string | number>) => string;
}

export function useActivationRequestsTabTable({
  onSearchChange,
  // onTenantFilterChange,
  onStatusFilterChange,
  // tenantFilter,
  statusFilter,
  // tenantOptions,
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
      // if (filterKey === 'tenant') {
      //   onTenantFilterChange?.(value);
      // }
      if (filterKey === 'status') {
        onStatusFilterChange?.(value);
      }
    },
    [onStatusFilterChange],
  );

  const filtersConfig = useMemo(
    () => [
      // {
      //   key: 'tenant',
      //   label: translate('giftCardManagement.filters.allTenants'),
      //   type: 'dropdown' as const,
      //   options: tenantOptions,
      //   value: tenantFilter,
      //   placeholder: translate('giftCardManagement.filters.allTenants'),
      // },
      {
        key: 'status',
        label: translate('allStatuses'),
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
