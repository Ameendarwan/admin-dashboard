'use client';

import { Button } from '@merit-incentives/ui';
import { PlusCircleIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import type { CatalogListingsSubTab } from '@/app/(protected)/catalog-management/utils/catalogListingsRoute';

import { CatalogSubTabs } from '../../../CatalogSubTabs';

interface CatalogListingsTabSectionProps {
  sectionTitle: string;
  sectionSubtitle: string;
  createLabel: string;
  onCreate: () => void;
  sub: CatalogListingsSubTab;
  onSubTabChange: (key: CatalogListingsSubTab) => void;
  subTabLabels: { active: string; requests: string };
  activeContent: ReactNode;
  requestsContent: ReactNode;
}

export function CatalogListingsTabSection({
  sectionTitle,
  sectionSubtitle,
  createLabel,
  onCreate,
  sub,
  onSubTabChange,
  subTabLabels,
  activeContent,
  requestsContent,
}: Readonly<CatalogListingsTabSectionProps>) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-mds-black-900">
            {sectionTitle}
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-mds-black-600">
            {sectionSubtitle}
          </p>
        </div>
        <div className="shrink-0 sm:ps-4">
          <Button
            variant="primary"
            onClick={onCreate}
            leftIcon={<PlusCircleIcon className="h-5 w-5" aria-hidden />}
            className="w-full sm:w-auto"
            type="button"
          >
            {createLabel}
          </Button>
        </div>
      </div>

      <CatalogSubTabs
        active={sub}
        onChange={onSubTabChange}
        labels={subTabLabels}
        activeContent={activeContent}
        requestsContent={requestsContent}
      />
    </div>
  );
}
