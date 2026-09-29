'use client';

import { Settings } from 'lucide-react';
import { Button, Checkbox } from '@merit-incentives/ui';
import React, { useRef, useState } from 'react';

import { useClickOutside } from '@/hooks/useClickOutside';
import { useLocalization } from '@/hooks/useLocalization';

interface ColumnOption {
  key: string;
  label: string;
}

interface ColumnSettingsButtonProps {
  columnOptions: ColumnOption[];
  visibleColumns: Record<string, boolean>;
  toggleColumnVisibility: (key: string) => void;
}

export function ColumnSettingsButton({
  columnOptions,
  visibleColumns,
  toggleColumnVisibility,
}: Readonly<ColumnSettingsButtonProps>) {
  const { translate } = useLocalization('common');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useClickOutside(buttonRef, () => setIsDropdownOpen(false), isDropdownOpen);

  return (
    <div ref={buttonRef} className="relative">
      <Button
        className="flex items-center justify-center w-10! h-10! rounded-lg border-[1.5px] border-mds-black-300 bg-transparent! px-0! min-w-0!"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-label="Column settings"
        aria-expanded={isDropdownOpen}
        title="Show/hide columns"
      >
        <Settings className="w-5 h-5 text-mds-black-900" />
      </Button>
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 z-50">
          <div className="bg-mds-white rounded-lg shadow-lg border border-mds-black-200 p-4 min-w-62.5">
            <div className="mb-3 text-sm font-semibold text-mds-black-700">
              {translate('showHideColumns')}
            </div>
            <div className="space-y-2">
              {columnOptions.map((column) => (
                <div key={column.key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={visibleColumns[column.key]}
                    onCheckedChange={() => toggleColumnVisibility(column.key)}
                    id={`column-${column.key}`}
                  />
                  <label
                    htmlFor={`column-${column.key}`}
                    className="text-sm text-mds-black-700 cursor-pointer"
                  >
                    {column.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
