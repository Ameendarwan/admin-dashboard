'use client';

import { Filter } from 'lucide-react';
import { Button } from '@merit-incentives/ui';
import React from 'react';

interface FilterButtonProps {
  isActive?: boolean;
  onToggle: () => void;
  ariaLabel?: string;
  title?: string;
}

export function FilterButton({
  isActive = false,
  onToggle,
  ariaLabel = 'Toggle filters',
  title = 'Show/hide filters',
}: Readonly<FilterButtonProps>) {
  return (
    <Button
      className={`flex items-center justify-center w-10 h-10 rounded-lg border-[1.5px] bg-transparent! hover:bg-mds-black-50 px-0! min-w-0! transition-colors ${
        isActive
          ? 'bg-mds-primary-50 border-mds-primary-500'
          : 'border-mds-black-300'
      }`}
      onClick={onToggle}
      aria-label={ariaLabel}
      title={title}
      aria-expanded={isActive}
    >
      <Filter
        className={`w-5 h-5 transition-colors ${
          isActive ? 'text-mds-primary-600' : 'text-mds-black-900'
        }`}
      />
    </Button>
  );
}
