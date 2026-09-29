'use client';

import { Info } from 'lucide-react';

interface WalletFreezeInfoCalloutProps {
  message: string;
  variant?: 'warning' | 'error';
  title?: string;
}

export function WalletFreezeInfoCallout({
  message,
  variant = 'warning',
  title,
}: Readonly<WalletFreezeInfoCalloutProps>) {
  const isError = variant === 'error';

  return (
    <div
      className={`flex items-start overflow-hidden rounded-lg border ${
        isError
          ? 'border-mds-error-500 bg-mds-error-50'
          : 'border-mds-casablanca-300 bg-mds-casablanca-50'
      }`}
    >
      <div className="flex shrink-0 items-start px-3 py-4">
        <Info
          className={`h-6 w-6 ${
            isError ? 'text-mds-error-500' : 'text-mds-casablanca-500'
          }`}
          aria-hidden
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 px-1.5 py-4">
        {title ? (
          <p className="text-base font-medium leading-[1.4] text-mds-black-900">
            {title}
          </p>
        ) : null}
        <p className="text-sm font-medium leading-[1.2] text-mds-black-800">
          {message}
        </p>
      </div>
    </div>
  );
}
