'use client';

import { Checkbox, cn, Tabs } from '@merit-incentives/ui';
import { useMemo } from 'react';

import {
  buildStorefrontBundleTabItems,
  bundleMatchesTab,
  isTabSelectAllChecked,
  mergeTabCategorySelections,
} from '@/utils/createStorefrontFormHelpers';
import type {
  CreateStorefrontFormValues,
  StorefrontBundleTabKey,
  StorefrontCategoryBundle,
} from '@/types/createStorefrontForm';

import {
  CategoryBundleGridSkeleton,
  CategoryBundlesToolbarSkeleton,
} from '../CategoryBundleCardSkeleton';

const CATEGORY_GRID_CLASS =
  'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3';
const CATEGORY_LIST_SCROLL_CLASS =
  'max-h-[min(42vh,360px)] min-h-[220px] overflow-y-auto overscroll-contain pr-1 sm:max-h-[min(52vh,520px)] sm:min-h-[280px]';

type CreateStorefrontCategoryBundlesStepProps = Readonly<{
  values: CreateStorefrontFormValues;
  bundles: StorefrontCategoryBundle[];
  availableTabs: StorefrontBundleTabKey[];
  loading: boolean;
  onChange: (next: Partial<CreateStorefrontFormValues>) => void;
  translate: (key: string, values?: Record<string, string | number>) => string;
}>;

export function CreateStorefrontCategoryBundlesStep({
  values,
  bundles,
  availableTabs,
  loading,
  onChange,
  translate,
}: CreateStorefrontCategoryBundlesStepProps) {
  const visibleBundles = useMemo(
    () =>
      bundles.filter((bundle) => bundleMatchesTab(bundle, values.bundleTab)),
    [bundles, values.bundleTab],
  );

  const selectAllChecked = isTabSelectAllChecked(
    bundles,
    values.selectedCategoryIds,
    values.bundleTab,
  );

  const toggleBundle = (bundleId: string, checked: boolean) => {
    const currentTabIds = values.selectedCategoryIds.filter((id) =>
      visibleBundles.some((bundle) => bundle.id === id),
    );
    const nextTabIds = checked
      ? [...new Set([...currentTabIds, bundleId])]
      : currentTabIds.filter((id) => id !== bundleId);
    onChange({
      selectedCategoryIds: mergeTabCategorySelections(
        bundles,
        values.selectedCategoryIds,
        values.bundleTab,
        nextTabIds,
      ),
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    const nextVisibleIds = checked
      ? visibleBundles.map((bundle) => bundle.id)
      : [];
    onChange({
      selectedCategoryIds: mergeTabCategorySelections(
        bundles,
        values.selectedCategoryIds,
        values.bundleTab,
        nextVisibleIds,
      ),
    });
  };

  const tabItems = buildStorefrontBundleTabItems(
    translate('create.steps.categoryBundles.tabs.merchandise'),
    translate('create.steps.categoryBundles.tabs.giftCards'),
    availableTabs,
  );

  const showTabs = tabItems.length > 1;
  const showToolbar = loading || visibleBundles.length > 0;
  const showEmptyTabState = !loading && visibleBundles.length === 0;

  return (
    <div className="flex w-full min-w-0 flex-col">
      <header className="mb-5 w-full shrink-0 space-y-2 sm:mb-6 md:mb-8">
        <h2 className="text-lg font-semibold leading-tight tracking-tight text-mds-black-900 sm:text-xl md:text-2xl">
          {translate('create.steps.categoryBundles.sectionTitle')}
        </h2>
        <p className="w-full text-sm leading-relaxed text-mds-black-600">
          {translate('create.steps.categoryBundles.sectionSubtitle')}
        </p>
      </header>

      {showTabs ? (
        <Tabs
          tabs={tabItems}
          activeTab={values.bundleTab}
          onChange={(tab) =>
            onChange({ bundleTab: tab as StorefrontBundleTabKey })
          }
          showContent={false}
          size="md"
          className="mb-5 shrink-0"
        />
      ) : null}

      {loading ? <CategoryBundlesToolbarSkeleton /> : null}

      {!loading && showToolbar ? (
        <div className="mb-4 flex shrink-0">
          {visibleBundles.length > 0 ? (
            <Checkbox
              checked={selectAllChecked}
              onCheckedChange={(checked) => toggleSelectAll(checked === true)}
              label={translate('create.steps.categoryBundles.selectAll')}
              labelClassName="text-sm font-medium text-mds-black-800"
            />
          ) : null}
        </div>
      ) : null}

      <div className={cn(CATEGORY_LIST_SCROLL_CLASS, 'shrink-0')}>
        {loading ? (
          <div className={CATEGORY_GRID_CLASS}>
            <CategoryBundleGridSkeleton />
          </div>
        ) : null}

        {showEmptyTabState ? (
          <p className="rounded-xl border border-dashed border-mds-black-200 bg-mds-black-50 px-4 py-8 text-center text-sm text-mds-black-600">
            {translate('create.steps.categoryBundles.empty')}
          </p>
        ) : null}

        {!loading && visibleBundles.length > 0 ? (
          <div className={CATEGORY_GRID_CLASS}>
            {visibleBundles.map((bundle) => {
              const checked = values.selectedCategoryIds.includes(bundle.id);
              return (
                <div
                  key={bundle.id}
                  className={cn(
                    'rounded-xl border px-4 py-4 transition-colors',
                    checked
                      ? 'border-mds-primary-200 bg-mds-primary-50'
                      : 'border-mds-black-100 bg-mds-primary-50/40',
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(nextChecked) =>
                      toggleBundle(bundle.id, Boolean(nextChecked))
                    }
                    label={bundle.name}
                    labelClassName="text-sm font-semibold text-mds-black-900"
                    className="items-start"
                  />
                  <p className="ms-6 text-sm font-normal">
                    <span className="text-mds-black-500">
                      {translate(
                        'create.steps.categoryBundles.productCountPrefix',
                      )}
                    </span>{' '}
                    <span className="text-mds-black-900">
                      {bundle.productCount.toLocaleString()}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
