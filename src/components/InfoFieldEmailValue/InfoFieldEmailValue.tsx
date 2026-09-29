'use client';

import React from 'react';

interface InfoFieldEmailValueProps {
  readonly value: string;
}

export function InfoFieldEmailValue({ value }: InfoFieldEmailValueProps) {
  const at = value.indexOf('@');
  if (at === -1) {
    return <span className="min-w-0 break-words">{value}</span>;
  }
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  return (
    <span className="inline-block min-w-0 max-w-full overflow-x-auto align-top [scrollbar-width:thin]">
      <span className="inline min-w-0 break-words align-baseline [overflow-wrap:anywhere]">
        {local}
      </span>
      <span className="inline align-baseline">@</span>
      <span className="inline whitespace-nowrap align-baseline">{domain}</span>
    </span>
  );
}
