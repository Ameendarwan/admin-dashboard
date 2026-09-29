'use client';

import type { ReactNode } from 'react';

interface CatalogOffersTabSectionProps {
  sectionTitle: string;
  sectionSubtitle: string;
  content: ReactNode;
}

export function CatalogOffersTabSection({
  sectionTitle,
  sectionSubtitle,
  content,
}: Readonly<CatalogOffersTabSectionProps>) {
  return (
    <div className="space-y-5 pt-1">
      <div className="min-w-0">
        <h2 className="text-xl font-semibold tracking-tight text-mds-black-900">
          {sectionTitle}
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-mds-black-600">
          {sectionSubtitle}
        </p>
      </div>
      {content}
    </div>
  );
}
