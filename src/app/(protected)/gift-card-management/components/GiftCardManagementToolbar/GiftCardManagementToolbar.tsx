'use client';

import { InputDropdown, SearchIcon } from '@merit-incentives/ui';

import { useLocalization } from '@/hooks/useLocalization';

interface GiftCardManagementToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters: ReadonlyArray<{
    key: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
    className?: string;
  }>;
}

export function GiftCardManagementToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
}: Readonly<GiftCardManagementToolbarProps>) {
  const { isRTL } = useLocalization('catalog');
  const showSearch =
    searchValue !== undefined &&
    onSearchChange !== undefined &&
    searchPlaceholder !== undefined;

  return (
    <div className="flex flex-wrap items-stretch gap-3 border-b border-mds-black-100 bg-white px-4 py-3 sm:flex-nowrap sm:px-5 sm:py-3.5">
      {showSearch ? (
        <div className="relative min-w-[13rem] flex-1">
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
      ) : null}
      {filters.map((filter) => (
        <div
          key={filter.key}
          className={
            filter.className ?? 'w-full min-w-[10.5rem] sm:w-44 sm:shrink-0'
          }
        >
          <InputDropdown
            value={filter.value}
            onChange={filter.onChange}
            options={filter.options}
            placeholder={filter.placeholder}
          />
        </div>
      ))}
    </div>
  );
}
