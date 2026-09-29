'use client';

import { InputDropdown, SearchIcon } from '@merit-incentives/ui';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useClickOutside, useLocalization } from '@/hooks';
import {
  type CreateStorefrontTenantOption,
  useCreateStorefrontTenantOptions,
} from '@/hooks/useCreateStorefrontTenantOptions';
import { cn } from '@/lib/utils';
import { keepSpaceInTextControl } from '@/utils/keepSpaceInTextControl';

function ignoreInputDropdownChange(): void {
  // Selection is handled by the custom listbox below.
}

type TenantOptionsListProps = Readonly<{
  isError: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  options: CreateStorefrontTenantOption[];
  value: string;
  hasMore: boolean;
  loadingLabel: string;
  noResultsLabel: string;
  moreLabel: string;
  onSelect: (option: CreateStorefrontTenantOption) => void;
  onLoadMore: () => void;
}>;

function TenantOptionsList({
  isError,
  isLoading,
  isLoadingMore,
  options,
  value,
  hasMore,
  loadingLabel,
  noResultsLabel,
  moreLabel,
  onSelect,
  onLoadMore,
}: TenantOptionsListProps) {
  if (isError) {
    return (
      <li className="px-4 py-3 text-sm text-mds-error-500">{noResultsLabel}</li>
    );
  }

  if (isLoading && options.length === 0) {
    return (
      <li className="px-4 py-3 text-sm text-mds-black-500">{loadingLabel}</li>
    );
  }

  if (options.length === 0) {
    return (
      <li className="px-4 py-3 text-sm text-mds-black-500">{noResultsLabel}</li>
    );
  }

  return (
    <>
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <li key={option.value}>
            <button
              type="button"
              className={cn(
                'w-full px-4 py-3 text-left text-sm transition-colors hover:bg-mds-black-50',
                isSelected
                  ? 'bg-mds-primary-50 font-medium text-mds-primary-700'
                  : 'text-mds-black-900',
              )}
              onClick={() => onSelect(option)}
            >
              {option.label}
            </button>
          </li>
        );
      })}

      {hasMore ? (
        <li className="border-t border-mds-black-100 px-3 py-2">
          <button
            type="button"
            disabled={isLoadingMore}
            onClick={onLoadMore}
            className="w-full rounded-lg px-3 py-2 text-sm font-semibold text-mds-primary-700 transition-colors hover:bg-mds-primary-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingMore ? `${moreLabel}...` : moreLabel}
          </button>
        </li>
      ) : null}
    </>
  );
}

type TenantDropdownSelectProps = Readonly<{
  value: string;
  selectedOption?: CreateStorefrontTenantOption | null;
  onChange: (
    tenantId: string,
    option: CreateStorefrontTenantOption | null,
  ) => void;
  placeholder: string;
  searchPlaceholder: string;
  moreLabel: string;
  loadingLabel: string;
  noResultsLabel: string;
  enabled: boolean;
  hasError?: boolean;
  controlClassName?: string;
}>;

export function TenantDropdownSelect({
  value,
  selectedOption = null,
  onChange,
  placeholder,
  searchPlaceholder,
  moreLabel,
  loadingLabel,
  noResultsLabel,
  enabled,
  hasError = false,
  controlClassName,
}: TenantDropdownSelectProps) {
  const { isRTL } = useLocalization('common');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');

  const {
    options,
    searchInput,
    setSearchInput,
    loadMore,
    hasMore,
    findOptionByValue,
    isLoading,
    isLoadingMore,
    isError,
  } = useCreateStorefrontTenantOptions(enabled);

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchInput('');
  };

  useClickOutside(containerRef, closeDropdown, isOpen);

  useEffect(() => {
    if (!value) {
      setSelectedLabel('');
      return;
    }

    if (selectedOption?.value === value && selectedOption.label.trim()) {
      setSelectedLabel(selectedOption.label);
      return;
    }

    const selected = findOptionByValue(value);
    if (selected) {
      setSelectedLabel(selected.label);
    }
  }, [findOptionByValue, selectedOption, value]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  const displayOptions = useMemo(() => {
    const mapped = options.map((option) => ({
      value: option.value,
      label: option.label,
      checked: option.value === value,
    }));

    if (
      value &&
      selectedLabel &&
      !mapped.some((option) => option.value === value)
    ) {
      mapped.unshift({
        value,
        label: selectedLabel,
        checked: true,
      });
    }

    return mapped;
  }, [options, selectedLabel, value]);

  const handleSelect = (option: CreateStorefrontTenantOption) => {
    onChange(option.value, option);
    setSelectedLabel(option.label);
    closeDropdown();
  };

  const toggleOpen = () => {
    if (!enabled) {
      return;
    }

    setIsOpen((open) => {
      if (open) {
        setSearchInput('');
      }
      return !open;
    });
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <InputDropdown
        id="create-storefront-tenant"
        placeholder={placeholder}
        value={value || undefined}
        options={displayOptions}
        onChange={ignoreInputDropdownChange}
        onClick={toggleOpen}
        size="md"
        error={hasError ? ' ' : undefined}
        className={cn(
          controlClassName,
          '[&>div:nth-child(2)]:hidden',
          isOpen && '[&_button_svg]:text-mds-primary-600',
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      />

      {isOpen ? (
        <div className="absolute start-0 end-0 top-[calc(100%+4px)] z-30 max-h-[min(70vh,320px)] overflow-hidden rounded-xl border border-mds-black-100 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:max-h-none">
          <div className="p-3">
            <div className="relative">
              <span
                className={cn(
                  'pointer-events-none absolute inset-y-0 z-[1] flex w-10 items-center justify-center text-mds-black-400',
                  isRTL ? 'right-0' : 'left-0',
                )}
              >
                <SearchIcon />
              </span>
              <input
                ref={searchInputRef}
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={keepSpaceInTextControl}
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-lg border border-mds-black-200 bg-white py-2 text-sm leading-5 text-mds-black-900 placeholder:text-mds-black-400 focus:border-mds-primary-500 focus:outline-none focus:ring-2 focus:ring-mds-primary-100 ltr:pl-12 ltr:pr-3 rtl:pl-3 rtl:pr-12"
                aria-label={searchPlaceholder}
                onClick={(event) => event.stopPropagation()}
              />
            </div>
          </div>

          <ul
            className="max-h-[min(50vh,240px)] overflow-y-auto sm:max-h-60"
            aria-label={placeholder}
          >
            <TenantOptionsList
              isError={isError}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              options={options}
              value={value}
              hasMore={hasMore}
              loadingLabel={loadingLabel}
              noResultsLabel={noResultsLabel}
              moreLabel={moreLabel}
              onSelect={handleSelect}
              onLoadMore={loadMore}
            />
          </ul>
        </div>
      ) : null}
    </div>
  );
}
