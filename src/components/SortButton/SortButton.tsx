import { ArrowUpDown } from 'lucide-react';
import { Button } from '@merit-incentives/ui';
import React from 'react';

interface SortButtonProps {
  sortOrder?: 'asc' | 'desc' | null;
  onSortToggle: () => void;
  ariaLabel?: string;
  title?: string;
}

export function SortButton({
  sortOrder,
  onSortToggle,
  ariaLabel = 'Toggle sorting',
  title = 'Toggle sorting order',
}: Readonly<SortButtonProps>) {
  const getArrowIconClasses = () => {
    const isActive = sortOrder === 'asc' || sortOrder === 'desc';
    return `w-5 h-5 transition-transform ${
      isActive ? 'text-mds-primary-600' : 'text-mds-black-900'
    } ${sortOrder === 'asc' ? 'rotate-180' : ''}`;
  };

  return (
    <Button
      className={`flex items-center justify-center w-10 h-10 rounded-lg border-[1.5px] bg-transparent! hover:bg-mds-black-50 px-0! min-w-0! transition-colors ${
        sortOrder
          ? 'bg-mds-primary-50 border-mds-primary-500'
          : 'border-mds-black-300'
      }`}
      onClick={onSortToggle}
      aria-label={ariaLabel}
      title={title}
    >
      <ArrowUpDown className={getArrowIconClasses()} />
    </Button>
  );
}
