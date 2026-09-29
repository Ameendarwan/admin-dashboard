'use client';

import React, { ReactNode, useRef, useState } from 'react';
import { SearchIcon } from '@merit-incentives/ui';

import { useClickOutside } from '@/hooks/useClickOutside';
import { useLocalization } from '@/hooks/useLocalization';

interface BaseTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchInputId: string;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  statusOptions: Array<{ value: string; label: string }>;
  translationNamespace: string;
  additionalActions?: ReactNode;
}

export function BaseTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchInputId,
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  translationNamespace,
  additionalActions,
}: Readonly<BaseTableToolbarProps>) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isRTL } = useLocalization(translationNamespace);

  const selectedOption =
    statusOptions.find((option) => option.value === statusFilter) ||
    statusOptions[0];

  // Close dropdown when clicking outside
  useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  const handleOptionSelect = (value: string) => {
    onStatusFilterChange(value);
    setIsDropdownOpen(false);
  };

  return (
    <div className="p-4 rounded-tl-lg rounded-tr-lg bg-white">
      <div className="flex items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-60">
          <span
            className={`absolute inset-y-0 flex items-center text-mds-gray-600 ${
              isRTL ? 'right-3' : 'left-3'
            } w-8`}
          >
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className={`w-full h-12 rounded-mds-sm bg-white border-[1.5px] py-2 text-base font-medium leading-[140%] text-mds-black-900 placeholder:font-medium placeholder:text-mds-gray-400 focus:outline-none focus:ring-1 focus:ring-mds-primary-500 focus:border-transparent ${
              isRTL ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'
            }`}
            id={searchInputId}
          />
        </div>

        {/* Additional Actions (optional) */}
        {additionalActions}

        {/* Status Filter */}
        <div className="min-w-50" ref={dropdownRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="relative min-w-50 h-12 rounded-mds-sm border-[1.5px] border-cloudGray bg-white px-4 py-2 flex items-center justify-between gap-2 cursor-pointer hover:bg-mds-gray-50 focus:outline-none focus:ring-1 focus:ring-mds-primary-500 focus:border-transparent"
            >
              <span className="font-medium text-base text-mds-gray-700 truncate text-left">
                {selectedOption.label}
              </span>
              <span className="shrink-0">
                <svg
                  className={`w-4 h-4 text-mds-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </button>

            {/* Dropdown Options */}
            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border-[1.5px] border-cloudGray rounded-mds-sm shadow-lg max-h-60 overflow-y-auto">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-mds-primary-50 text-base font-medium text-mds-gray-700 first:rounded-t-mds-sm last:rounded-b-mds-sm w-full text-left"
                    onClick={() => handleOptionSelect(option.value)}
                    aria-label={`Select ${option.label}`}
                  >
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
