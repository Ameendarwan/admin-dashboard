'use client';

import { Info } from 'lucide-react';

interface ActivationDialogInfoCalloutProps {
  title: string;
  items: string[];
}

export function ActivationDialogInfoCallout({
  title,
  items,
}: Readonly<ActivationDialogInfoCalloutProps>) {
  return (
    <div className="rounded-xl border border-mds-casablanca-200 bg-mds-casablanca-50 px-4 py-3.5">
      <div className="flex gap-3">
        <Info
          className="mt-0.5 h-5 w-5 shrink-0 text-mds-casablanca-700"
          aria-hidden
        />
        <div className="min-w-0 space-y-2 text-sm text-mds-black-800">
          <p className="font-semibold text-mds-black-900">{title}</p>
          <ul className="list-disc space-y-1 ps-4">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
