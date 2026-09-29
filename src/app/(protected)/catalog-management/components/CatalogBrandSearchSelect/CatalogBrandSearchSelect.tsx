'use client';

import { InputDropdown, SearchIcon } from '@merit-incentives/ui';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useCatalogBrandSearchOptions } from '@/app/(protected)/catalog-management/hooks/useCatalogBrandSearchOptions';
import { useClickOutside, useLocalization } from '@/hooks';
import { cn } from '@/lib/utils';
import { keepSpaceInTextControl } from '@/utils/keepSpaceInTextControl';

type CatalogBrandSearchSelectProps = Readonly<{
  value: string;
  onChange: (brandId: string) => void;
  enabled: boolean;
  allBrandsLabel: string;
  searchPlaceholder: string;
  loadingLabel: string;
  noResultsLabel: string;
}>;

export function CatalogBrandSearchSelect({
  value,
  onChange,
  enabled,
  allBrandsLabel,
  searchPlaceholder,
  loadingLabel,
  noResultsLabel,
}: CatalogBrandSearchSelectProps) {
  const { isRTL } = useLocalization('common');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const { options, isLoading, isError } = useCatalogBrandSearchOptions(
    enabled,
    isOpen,
    searchInput,
    value || undefined,
  );

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchInput('');
  };

  useClickOutside(containerRef, closeDropdown, isOpen);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  const displayOptions = useMemo(
    () => [
      { value: '', label: allBrandsLabel, checked: !value },
      ...options.map((option) => ({
        value: option.value,
        label: option.label,
        checked: option.value === value,
      })),
    ],
    [allBrandsLabel, options, value],
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <InputDropdown
        placeholder={allBrandsLabel}
        value={value || undefined}
        options={displayOptions}
        onChange={() => undefined}
        onClick={() => {
          if (!enabled) {
            return;
          }
          setIsOpen((open) => {
            if (open) {
              setSearchInput('');
            }
            return !open;
          });
        }}
        size="md"
        className={cn(
          '[&>div:nth-child(2)]:hidden',
          isOpen && '[&_button_svg]:text-mds-primary-600',
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={allBrandsLabel}
      />

      {isOpen ? (
        <div className="absolute start-0 end-0 top-[calc(100%+4px)] z-30 overflow-hidden rounded-xl border border-mds-black-100 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
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
            aria-label={allBrandsLabel}
          >
            {isError ? (
              <li className="px-4 py-3 text-sm text-mds-error-500">
                {noResultsLabel}
              </li>
            ) : isLoading && options.length === 0 ? (
              <li className="px-4 py-3 text-sm text-mds-black-500">
                {loadingLabel}
              </li>
            ) : (
              <>
                <li>
                  <button
                    type="button"
                    className={cn(
                      'w-full px-4 py-3 text-left text-sm transition-colors hover:bg-mds-black-50',
                      !value
                        ? 'bg-mds-primary-50 font-medium text-mds-primary-700'
                        : 'text-mds-black-900',
                    )}
                    onClick={() => {
                      onChange('');
                      closeDropdown();
                    }}
                  >
                    {allBrandsLabel}
                  </button>
                </li>
                {options.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-mds-black-500">
                    {noResultsLabel}
                  </li>
                ) : (
                  options.map((option) => {
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
                          onClick={() => {
                            onChange(option.value);
                            closeDropdown();
                          }}
                        >
                          {option.label}
                        </button>
                      </li>
                    );
                  })
                )}
              </>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
