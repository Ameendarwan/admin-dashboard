'use client';

import { InputDropdown, SearchIcon } from '@merit-incentives/ui';
import { X } from 'lucide-react';
import { type ReactNode, useState } from 'react';

import { FilterButton } from '@/components/FilterButton';
import { SortButton } from '@/components/SortButton';
import { useLocalization } from '@/hooks/useLocalization';

type FilterOption = { value: string; label: string };

type CatalogListToolbarProps = {
  readonly searchValue: string;
  readonly onSearchChange: (v: string) => void;
  readonly searchPlaceholder: string;
  readonly categoryValue: string;
  readonly onCategoryChange: (v: string) => void;
  readonly categoryOptions: FilterOption[];
  readonly dateValue: string;
  readonly onDateChange: (v: string) => void;
  readonly dateOptions: FilterOption[];
  readonly showCategoryFilter?: boolean;
  readonly showSubcategoryFilter?: boolean;
  readonly subcategoryValue?: string;
  readonly onSubcategoryChange?: (v: string) => void;
  readonly subcategoryOptions?: FilterOption[];
  readonly showDateFilter?: boolean;
  readonly showStatus?: boolean;
  readonly statusValue?: string;
  readonly onStatusChange?: (v: string) => void;
  readonly statusOptions?: FilterOption[];
  readonly showMatchResult?: boolean;
  readonly matchResultValue?: string;
  readonly onMatchResultChange?: (v: string) => void;
  readonly matchResultOptions?: FilterOption[];
  readonly extraFilters?: ReactNode;
  readonly hasActiveFilters?: boolean;
  readonly onClearFilters?: () => void;
  readonly showCreatedAtSort?: boolean;
  readonly createdAtSortOrder?: 'asc' | 'desc';
  readonly onCreatedAtSortToggle?: () => void;
};

function ToolbarDropdown({
  value,
  onChange,
  options,
  placeholder,
}: Readonly<{
  value: string;
  onChange: (v: string) => void;
  options: FilterOption[];
  placeholder: string;
}>) {
  return (
    <div className="min-w-[10.5rem] flex-1">
      <InputDropdown
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
      />
    </div>
  );
}

export function CatalogListToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  categoryValue,
  onCategoryChange,
  categoryOptions,
  dateValue,
  onDateChange,
  dateOptions,
  showCategoryFilter = true,
  showSubcategoryFilter = false,
  subcategoryValue = 'all',
  onSubcategoryChange,
  subcategoryOptions = [],
  showDateFilter = true,
  showStatus = false,
  statusValue = 'all',
  onStatusChange,
  statusOptions = [],
  showMatchResult = false,
  matchResultValue = 'all',
  onMatchResultChange,
  matchResultOptions = [],
  extraFilters,
  hasActiveFilters = false,
  onClearFilters,
  showCreatedAtSort = false,
  createdAtSortOrder = 'desc',
  onCreatedAtSortToggle,
}: Readonly<CatalogListToolbarProps>) {
  const { translate, isRTL } = useLocalization('catalog');
  const [showFilters, setShowFilters] = useState(false);

  const hasFilterControls = Boolean(
    extraFilters ||
    showStatus ||
    showMatchResult ||
    showCategoryFilter ||
    showSubcategoryFilter ||
    showDateFilter,
  );

  const clearButtonClass = `flex shrink-0 items-center gap-2 px-4 h-10 rounded-2xl transition-colors ${
    hasActiveFilters
      ? 'cursor-pointer bg-mds-primary-50 text-mds-primary-700 hover:bg-mds-primary-100'
      : 'cursor-not-allowed bg-mds-black-100 text-mds-black-400'
  }`;

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-mds-black-100 bg-white px-4 py-3 sm:px-5 sm:py-3.5">
        <div className="relative min-w-0 flex-1">
          <span
            className={`pointer-events-none absolute inset-y-0 z-[1] flex w-10 items-center justify-center text-mds-black-500 ${isRTL ? 'right-2' : 'left-2'}`}
          >
            <SearchIcon />
          </span>
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-12 w-full rounded-xl border border-mds-black-200 bg-mds-white py-2 text-sm leading-5 text-mds-black-900 shadow-sm transition-colors placeholder:text-mds-black-400 focus:border-mds-primary-500 focus:outline-none focus:ring-2 focus:ring-mds-primary-100 ltr:pl-12 ltr:pr-3 rtl:pl-3 rtl:pr-12"
            aria-label={searchPlaceholder}
          />
        </div>
        {hasFilterControls ? (
          <div className="shrink-0">
            <FilterButton
              isActive={showFilters || hasActiveFilters}
              onToggle={() => setShowFilters((open) => !open)}
              ariaLabel={translate('filters.toggleFilters')}
              title={translate('filters.toggleFilters')}
            />
          </div>
        ) : null}
        {showCreatedAtSort && onCreatedAtSortToggle ? (
          <div className="shrink-0">
            <SortButton
              sortOrder={createdAtSortOrder}
              onSortToggle={onCreatedAtSortToggle}
              ariaLabel={translate('filters.sortByCreatedAt')}
              title={translate('filters.sortByCreatedAt')}
            />
          </div>
        ) : null}
      </div>
      {showFilters && hasFilterControls ? (
        <div className="flex flex-wrap items-center gap-4 border-b border-mds-black-100 bg-white px-4 py-4 sm:px-6">
          {extraFilters}
          {showStatus && onStatusChange && (
            <ToolbarDropdown
              value={statusValue}
              onChange={onStatusChange}
              options={statusOptions}
              placeholder={translate('allStatuses')}
            />
          )}
          {showMatchResult && onMatchResultChange && (
            <ToolbarDropdown
              value={matchResultValue}
              onChange={onMatchResultChange}
              options={matchResultOptions}
              placeholder={translate('filters.allMatchResults')}
            />
          )}
          {showCategoryFilter && (
            <ToolbarDropdown
              value={categoryValue}
              onChange={onCategoryChange}
              options={categoryOptions}
              placeholder={translate('allCategories')}
            />
          )}
          {showSubcategoryFilter && onSubcategoryChange && (
            <ToolbarDropdown
              value={subcategoryValue}
              onChange={onSubcategoryChange}
              options={subcategoryOptions}
              placeholder={translate('filters.allSubcategories')}
            />
          )}
          {showDateFilter && (
            <ToolbarDropdown
              value={dateValue}
              onChange={onDateChange}
              options={dateOptions}
              placeholder={translate('dateFilter')}
            />
          )}
          {onClearFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              disabled={!hasActiveFilters}
              className={`${clearButtonClass} ms-auto`}
            >
              <X className="h-4 w-4" />
              <span className="text-sm font-semibold">
                {translate('filters.clearFilters')}
              </span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
