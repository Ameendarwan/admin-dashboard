'use client';

import type { ReactNode } from 'react';

interface TenantDetailFieldProps {
  label: string;
  value: ReactNode;
  valueClassName?: string;
  /** When false, value text is not truncated. Default true. */
  truncateValue?: boolean;
}

export function TenantDetailField({
  label,
  value,
  valueClassName,
  truncateValue = true,
}: Readonly<TenantDetailFieldProps>) {
  const title =
    typeof value === 'string' || typeof value === 'number'
      ? String(value)
      : undefined;

  return (
    <div className="min-w-0 space-y-2">
      <p className="truncate text-[14px] font-medium leading-[1.4] text-mds-black-500">
        {label}
      </p>
      <div
        className={`min-w-0 text-[18px] font-medium leading-[1.2] text-mds-black-900 ${
          truncateValue ? 'truncate' : ''
        } ${valueClassName ?? ''}`}
        title={title}
      >
        {value}
      </div>
    </div>
  );
}
