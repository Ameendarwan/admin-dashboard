'use client';

import { Info } from 'lucide-react';

interface WhatHappensNextCalloutProps {
  title: string;
  items: string[];
}

export function WhatHappensNextCallout({
  title,
  items,
}: Readonly<WhatHappensNextCalloutProps>) {
  return (
    <div className="flex gap-3 rounded-lg border border-mds-casablanca-100 bg-mds-casablanca-50/40 p-4">
      <Info
        className="mt-0.5 h-5 w-5 shrink-0 text-mds-casablanca-500"
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-mds-black-900">{title}</p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-mds-black-700">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
