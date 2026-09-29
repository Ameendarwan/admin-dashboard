'use client';

import { Tabs } from '@merit-incentives/ui';
import type { ReactNode } from 'react';

type SubTabKey = 'active' | 'requests';

interface CatalogSubTabsProps {
  readonly active: SubTabKey;
  readonly onChange: (key: SubTabKey) => void;
  readonly labels: { active: string; requests: string };
  readonly activeContent: ReactNode;
  readonly requestsContent: ReactNode;
}

export function CatalogSubTabs({
  active,
  onChange,
  labels,
  activeContent,
  requestsContent,
}: Readonly<CatalogSubTabsProps>) {
  return (
    <div className="bg-white rounded-mds-md shadow overflow-hidden [&_[role=tablist]]:border-mds-primary-100">
      <Tabs
        showContent
        size="md"
        activeTab={active}
        onChange={(key: string) => onChange(key as SubTabKey)}
        tabs={[
          {
            key: 'active',
            label: labels.active,
            content: activeContent,
          },
          {
            key: 'requests',
            label: labels.requests,
            content: requestsContent,
          },
        ]}
      />
    </div>
  );
}
