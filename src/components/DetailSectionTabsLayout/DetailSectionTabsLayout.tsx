'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type DetailSectionTabItem<K extends string = string> = {
  readonly key: K;
  readonly label: string;
  readonly icon: ReactNode;
  readonly content: ReactNode;
};

/** Single place for tab icon sizing/decoration — keeps seller/tenant tab configs deduplicated for Sonar. */
export function createDetailSectionTabItem<K extends string>(
  key: K,
  label: string,
  Icon: LucideIcon,
  content: ReactNode,
): DetailSectionTabItem<K> {
  return {
    key,
    label,
    icon: <Icon className="h-4 w-4 shrink-0" aria-hidden />,
    content,
  };
}

type DetailSectionTabsLayoutProps<K extends string> = {
  readonly tabs: readonly DetailSectionTabItem<K>[];
  readonly activeTab: K;
  readonly onTabChange: (key: K) => void;
  /** Tab strip outer container corner radius (seller vs tenant detail pages). */
  readonly tabStripCorners?: 'xl' | 'full';
  /** Merged with default tab panel classes (`mt-4 w-full min-w-0`). */
  readonly tabPanelClassName?: string;
};

const TAB_STRIP_BASE =
  'flex w-full flex-wrap gap-1 border border-mds-black-100 bg-white p-2 shadow-sm';

const TAB_STRIP_ROUNDED: Record<'xl' | 'full', string> = {
  xl: 'rounded-xl',
  full: 'rounded-full',
};

const TAB_PANEL_BASE = 'mt-4 w-full min-w-0';

export function DetailSectionTabsLayout<K extends string>({
  tabs,
  activeTab,
  onTabChange,
  tabStripCorners = 'xl',
  tabPanelClassName,
}: Readonly<DetailSectionTabsLayoutProps<K>>) {
  const activeContent = tabs.find((t) => t.key === activeTab)?.content;

  return (
    <div className="w-full">
      <div
        className={cn(TAB_STRIP_BASE, TAB_STRIP_ROUNDED[tabStripCorners])}
        role="tablist"
        aria-label="Detail sections"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.key}`}
              id={`tab-${tab.key}`}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-mds-primary-50 text-mds-primary-700'
                  : 'text-mds-black-800 hover:bg-mds-black-50 hover:text-mds-black-900',
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className={cn(TAB_PANEL_BASE, tabPanelClassName)}
      >
        {activeContent}
      </div>
    </div>
  );
}
