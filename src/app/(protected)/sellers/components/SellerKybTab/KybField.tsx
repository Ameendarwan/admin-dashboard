'use client';

import React from 'react';

interface KybFieldProps {
  readonly label: string;
  readonly value: string;
}

export function KybField({ label, value }: KybFieldProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-sm font-medium text-mds-black-500">{label}</span>
      <span className="text-base font-medium text-mds-black-900 wrap-break-word">
        {value}
      </span>
    </div>
  );
}
