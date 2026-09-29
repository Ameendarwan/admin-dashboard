'use client';

import React from 'react';
import { InputDropdown } from '@merit-incentives/ui';
import { X } from 'lucide-react';

import { CountrySearch } from '@/components';
import { useLocalization } from '@/hooks/useLocalization';

interface FilterOption {
  value: string;
  label: string;
}

interface TenantsTableFiltersProps {
  showFilters: boolean;
  countryFilter: string;
  productsFilter: string;
  statusFilter: string;
  accountManagerFilter: string;
  onCountryChange: (value: string) => void;
  onProductsChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAccountManagerChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  productsOptions: FilterOption[];
  statusOptions: FilterOption[];
  accountManagerOptions: FilterOption[];
}

export function TenantsTableFilters({
  showFilters,
  countryFilter,
  productsFilter,
  statusFilter,
  accountManagerFilter,
  onCountryChange,
  onProductsChange,
  onStatusChange,
  onAccountManagerChange,
  onClearFilters,
  hasActiveFilters,
  productsOptions,
  statusOptions,
  accountManagerOptions,
}: Readonly<TenantsTableFiltersProps>) {
  const { translate } = useLocalization('tenant-management');

  if (!showFilters) return null;

  const clearButtonBaseClass =
    'flex items-center gap-2 px-4 h-10 rounded-2xl transition-colors';
  const clearButtonStateClass = hasActiveFilters
    ? 'bg-mds-black-200 hover:bg-mds-black-300 cursor-pointer'
    : 'bg-mds-black-100 cursor-not-allowed';
  const clearButtonClass = `${clearButtonBaseClass} ${clearButtonStateClass}`;

  return (
    <div className="bg-white px-6 py-4 border-b border-mds-black-100 flex items-center gap-4">
      <CountrySearch
        label=""
        value={countryFilter}
        onChange={onCountryChange}
        placeholder="Country"
      />
      <div className="flex-1">
        <InputDropdown
          value={productsFilter}
          onChange={(value) => onProductsChange(value)}
          options={productsOptions}
          placeholder="Products"
        />
      </div>
      <div className="flex-1">
        <InputDropdown
          value={statusFilter}
          onChange={(value) => onStatusChange(value)}
          options={statusOptions}
          placeholder="Status"
        />
      </div>
      <div className="flex-1">
        <InputDropdown
          value={accountManagerFilter}
          onChange={(value) => onAccountManagerChange(value)}
          options={accountManagerOptions}
          placeholder="Account Manager"
        />
      </div>
      <button
        onClick={onClearFilters}
        disabled={!hasActiveFilters}
        className={clearButtonClass}
      >
        <X className="w-4 h-4 text-mds-black-400" />
        <span className="text-sm font-semibold text-mds-black-400">
          {translate('clearFilters')}
        </span>
      </button>
    </div>
  );
}
