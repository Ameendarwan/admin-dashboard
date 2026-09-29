'use client';

import type { ReactNode } from 'react';

interface GiftCardDetailFieldProps {
  label: string;
  value: ReactNode;
  valueClassName?: string;
  className?: string;
  /** When false, value text is not truncated (e.g. multi-line lists). Default true. */
  truncateValue?: boolean;
}

export function GiftCardDetailField({
  label,
  value,
  valueClassName,
  className,
  truncateValue = true,
}: Readonly<GiftCardDetailFieldProps>) {
  const title =
    typeof value === 'string' || typeof value === 'number'
      ? String(value)
      : undefined;

  return (
    <div
      className={`flex min-w-0 shrink-0 flex-col gap-1 ${
        truncateValue ? 'overflow-hidden' : 'overflow-visible'
      } ${className ?? 'w-37.5'}`}
    >
      <p
        className="truncate text-sm font-medium leading-[1.2] text-mds-black-500"
        title={label}
      >
        {label}
      </p>
      <div
        className={`min-w-0 text-base font-medium leading-[1.4] text-mds-black-800 ${
          truncateValue ? 'truncate' : ''
        } ${valueClassName ?? ''}`}
        title={title}
      >
        {value}
      </div>
    </div>
  );
}
