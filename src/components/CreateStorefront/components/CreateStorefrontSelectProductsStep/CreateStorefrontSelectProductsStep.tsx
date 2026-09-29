'use client';

import {
  cn,
  InputDropdown,
  InputField,
  SearchIcon,
  Table,
  Tabs,
} from '@merit-incentives/ui';
import Image from 'next/image';
import { useEffect, useMemo, useRef } from 'react';

import {
  ALL_STOREFRONT_PRODUCTS_CATEGORY_FILTER,
  applyCreateStorefrontProductToggle,
  applyCreateStorefrontSelectAllToggle,
  buildCreateStorefrontTableSelectedRows,
  buildStorefrontBundleTabItems,
  getProductSelectAllScopeBundleIds,
  getSelectedTabBundleIds,
  getSelectedTabBundles,
  getTabProductSelectionTotals,
  patchProductsCategoryFilterForTab,
  resolveActiveCategoryBundleId,
} from '@/utils/createStorefrontFormHelpers';
import { keepSpaceInTextControl } from '@/utils/keepSpaceInTextControl';
import type {
  CreateStorefrontFormValues,
  StorefrontBundleTabKey,
  StorefrontCategoryBundle,
  StorefrontProductRow,
} from '@/types/createStorefrontForm';

type CreateStorefrontSelectProductsStepProps = Readonly<{
  values: CreateStorefrontFormValues;
  bundles: StorefrontCategoryBundle[];
  availableTabs: StorefrontBundleTabKey[];
  products: StorefrontProductRow[];
  totalProducts: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  /** True while products are refetching (including placeholder phase). */
  isProductsFetching: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onChange: (next: Partial<CreateStorefrontFormValues>) => void;
  translate: (key: string, values?: Record<string, string | number>) => string;
}>;

export function CreateStorefrontSelectProductsStep({
  values,
  bundles,
  availableTabs,
  products,
  totalProducts,
  page,
  pageSize,
  totalPages,
  loading,
  isProductsFetching,
  search,
  onSearchChange,
  onPageChange,
  onChange,
  translate,
}: CreateStorefrontSelectProductsStepProps) {
  const ignoreTableSelectionEventsRef = useRef(false);
  const tableContextRef = useRef({
    page,
    search,
    activeCategoryFilterId: values.activeCategoryFilterId,
    productsTab: values.productsTab,
  });

  useEffect(() => {
    const previous = tableContextRef.current;
    const tableContextChanged =
      previous.page !== page ||
      previous.search !== search ||
      previous.activeCategoryFilterId !== values.activeCategoryFilterId ||
      previous.productsTab !== values.productsTab;

    if (tableContextChanged) {
      ignoreTableSelectionEventsRef.current = true;
      tableContextRef.current = {
        page,
        search,
        activeCategoryFilterId: values.activeCategoryFilterId,
        productsTab: values.productsTab,
      };
    }
  }, [page, search, values.activeCategoryFilterId, values.productsTab]);

  useEffect(() => {
    if (loading || isProductsFetching) {
      return;
    }

    let innerFrameId = 0;
    const outerFrameId = requestAnimationFrame(() => {
      innerFrameId = requestAnimationFrame(() => {
        ignoreTableSelectionEventsRef.current = false;
      });
    });

    return () => {
      cancelAnimationFrame(outerFrameId);
      cancelAnimationFrame(innerFrameId);
    };
  }, [
    loading,
    isProductsFetching,
    values.activeCategoryFilterId,
    values.productsTab,
    page,
    search,
    products,
  ]);

  const currentTabBundleIds = useMemo(
    () =>
      getSelectedTabBundleIds(
        bundles,
        values.selectedCategoryIds,
        values.productsTab,
      ),
    [bundles, values.productsTab, values.selectedCategoryIds],
  );

  const setCategoryFilter = (filterId: string | null) => {
    ignoreTableSelectionEventsRef.current = true;
    onChange({
      activeCategoryFilterId: filterId,
      productsCategoryFilterByTab: patchProductsCategoryFilterForTab(
        values.productsCategoryFilterByTab,
        values.productsTab,
        filterId,
      ),
    });
  };

  const selectedBundles = useMemo(
    () =>
      getSelectedTabBundles(
        bundles,
        values.selectedCategoryIds,
        values.productsTab,
      ),
    [bundles, values.productsTab, values.selectedCategoryIds],
  );

  const isAllCategoriesActive =
    values.activeCategoryFilterId === ALL_STOREFRONT_PRODUCTS_CATEGORY_FILTER;
  const activeBundleId =
    !isAllCategoriesActive &&
    values.activeCategoryFilterId &&
    selectedBundles.some(
      (bundle) => bundle.id === values.activeCategoryFilterId,
    )
      ? values.activeCategoryFilterId
      : null;

  const selectAllScopeBundleIds = getProductSelectAllScopeBundleIds(
    selectedBundles,
    isAllCategoriesActive,
    activeBundleId,
  );

  const isEntireScopeAllMode =
    selectAllScopeBundleIds.length > 0 &&
    selectAllScopeBundleIds.every((bundleId) =>
      values.allProductsBundleIds.includes(bundleId),
    );

  const { allProductsBundleIds, productBundleById, selectedProductIds } =
    values;
  const { selected: tabSelectedCount, total: tabTotalProducts } = useMemo(
    () =>
      getTabProductSelectionTotals(selectedBundles, {
        allProductsBundleIds,
        productBundleById,
        selectedProductIds,
      }),
    [
      selectedBundles,
      allProductsBundleIds,
      productBundleById,
      selectedProductIds,
    ],
  );

  const isProductRowSelected = (product: StorefrontProductRow) =>
    values.allProductsBundleIds.includes(product.bundleId) ||
    values.selectedProductIds.includes(product.id);

  const toggleProduct = (
    productId: string,
    bundleId: string,
    checked: boolean,
  ) => {
    if (ignoreTableSelectionEventsRef.current) {
      return;
    }

    const patch = applyCreateStorefrontProductToggle(
      values,
      productId,
      bundleId,
      checked,
    );
    if (!patch) {
      return;
    }

    onChange(patch);
  };

  const toggleAllVisible = (checked: boolean) => {
    if (ignoreTableSelectionEventsRef.current) {
      return;
    }

    const patch = applyCreateStorefrontSelectAllToggle(
      values,
      selectAllScopeBundleIds,
      currentTabBundleIds,
      checked,
    );
    if (!patch) {
      return;
    }

    onChange(patch);
  };

  const categoryFilterOptions = [
    {
      value: ALL_STOREFRONT_PRODUCTS_CATEGORY_FILTER,
      label: translate('create.steps.selectProducts.allCategories'),
    },
    ...selectedBundles.map((bundle) => ({
      value: bundle.id,
      label: bundle.name,
    })),
  ];

  const categoryFilterValue = isAllCategoriesActive
    ? ALL_STOREFRONT_PRODUCTS_CATEGORY_FILTER
    : (activeBundleId ?? selectedBundles[0]?.id ?? '');

  const selectedRowsOnPage = buildCreateStorefrontTableSelectedRows(
    products,
    values,
    isEntireScopeAllMode,
    isProductRowSelected,
  );

  const columns = [
    {
      key: 'product',
      label: translate('create.steps.selectProducts.table.product'),
      render: (row: StorefrontProductRow) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-mds-black-100 bg-mds-black-50">
            <Image
              src={row.imageUrl}
              alt={row.name}
              fill
              unoptimized
              className="object-cover"
              sizes="40px"
            />
          </div>
          <span className="truncate text-sm font-medium text-mds-black-900">
            {row.name}
          </span>
        </div>
      ),
    },
    {
      key: 'category',
      label: translate('create.steps.selectProducts.table.category'),
      render: (row: StorefrontProductRow) => (
        <span className="text-sm text-mds-black-700">{row.category}</span>
      ),
    },
    {
      key: 'price',
      label: translate('create.steps.selectProducts.table.lowestPrice'),
      render: (row: StorefrontProductRow) => (
        <span className="text-sm font-medium text-mds-black-900">
          {row.lowestPrice !== null
            ? `${row.lowestPrice.toLocaleString()} ${row.currency}`
            : '—'}
        </span>
      ),
    },
  ];

  const tabItems = buildStorefrontBundleTabItems(
    translate('create.steps.selectProducts.tabs.merchandise'),
    translate('create.steps.selectProducts.tabs.giftCards'),
    availableTabs,
  );

  const showTabs = tabItems.length > 1;
  const showCategoryPicker = selectedBundles.length > 1;

  const from = totalProducts === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalProducts);

  const handleProductsTabChange = (tab: string) => {
    ignoreTableSelectionEventsRef.current = true;
    const nextTab = tab as StorefrontBundleTabKey;
    const updatedFilters = patchProductsCategoryFilterForTab(
      values.productsCategoryFilterByTab,
      values.productsTab,
      values.activeCategoryFilterId,
    );

    onChange({
      productsTab: nextTab,
      productsCategoryFilterByTab: updatedFilters,
      activeCategoryFilterId: resolveActiveCategoryBundleId(
        bundles,
        values.selectedCategoryIds,
        nextTab,
        updatedFilters[nextTab],
      ),
    });
  };

  return (
    <div className="w-full min-w-0">
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 md:mb-8 md:flex-row md:items-start md:justify-between md:gap-4">
        <header className="min-w-0 space-y-2">
          <h2 className="text-lg font-semibold leading-tight tracking-tight text-mds-black-900 sm:text-xl md:text-2xl">
            {translate('create.steps.selectProducts.sectionTitle')}
          </h2>
          <p className="text-sm leading-relaxed text-mds-black-600">
            {translate('create.steps.selectProducts.sectionSubtitle')}
          </p>
        </header>
        <p className="shrink-0 text-sm font-medium text-mds-black-700 md:text-end">
          {translate('create.steps.selectProducts.totalProducts', {
            selected: String(tabSelectedCount),
            total: String(tabTotalProducts),
          })}
        </p>
      </div>

      {showTabs ? (
        <Tabs
          tabs={tabItems}
          activeTab={values.productsTab}
          onChange={handleProductsTabChange}
          showContent={false}
          size="md"
          className="mb-5"
        />
      ) : null}

      {showCategoryPicker ? (
        <div className="mb-5 hidden flex-nowrap gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:flex [&::-webkit-scrollbar]:hidden">
          {selectedBundles.map((bundle) => {
            const isActive =
              !isAllCategoriesActive && bundle.id === activeBundleId;
            const selectedInBundle = values.allProductsBundleIds.includes(
              bundle.id,
            )
              ? bundle.productCount
              : values.selectedProductIds.filter(
                  (productId) =>
                    values.productBundleById[productId] === bundle.id,
                ).length;
            const totalInBundle = bundle.productCount;

            return (
              <button
                key={bundle.id}
                type="button"
                onClick={() => setCategoryFilter(bundle.id)}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-mds-primary-50'
                    : 'bg-mds-primary-50/40 hover:bg-mds-primary-50',
                )}
              >
                <span className="text-mds-black-500">{bundle.name}:</span>{' '}
                <span className="text-mds-black-900">
                  {selectedInBundle.toLocaleString()}/
                  {totalInBundle.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div
        className={cn(
          'mb-5 grid grid-cols-1 gap-4',
          showCategoryPicker && 'md:grid-cols-[220px_minmax(0,1fr)]',
        )}
      >
        {showCategoryPicker ? (
          <InputDropdown
            options={categoryFilterOptions}
            value={categoryFilterValue}
            onChange={(value) =>
              setCategoryFilter(
                value === ALL_STOREFRONT_PRODUCTS_CATEGORY_FILTER
                  ? ALL_STOREFRONT_PRODUCTS_CATEGORY_FILTER
                  : value,
              )
            }
          />
        ) : null}
        <InputField
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={keepSpaceInTextControl}
          placeholder={translate(
            'create.steps.selectProducts.searchPlaceholder',
          )}
          leftIcon={<SearchIcon className="h-4 w-4 text-mds-black-500" />}
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-mds-black-100 bg-white">
        <div className="overflow-x-auto">
          <Table
            className="!min-h-[32vh] min-w-[520px] w-full !shadow-none sm:!min-h-[36vh] [&_tbody_tr]:border-mds-black-100 [&_td]:px-3 [&_td]:py-3 sm:[&_td]:px-4 sm:[&_td]:py-3.5 [&_th]:whitespace-nowrap [&_th]:px-3 [&_th]:py-3 sm:[&_th]:px-4 [&_th]:text-[11px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-mds-black-500 [&_thead_tr]:bg-mds-black-50"
            columns={columns}
            data={products}
            showSearch={false}
            showPagination
            onPageChange={onPageChange}
            pagination={{
              currentPage: page,
              totalPages,
              totalRecords: totalProducts,
              itemsPerPage: pageSize,
            }}
            getRowId={(row: StorefrontProductRow) => row.id}
            size="md"
            background="white"
            rounded={false}
            shadow={false}
            emptyText={translate('create.steps.selectProducts.empty')}
            loading={loading}
            showCheckboxes
            selectedRows={selectedRowsOnPage}
            onRowSelect={(rowId, isSelected) => {
              const product = products.find((row) => row.id === String(rowId));
              if (!product) {
                return;
              }
              toggleProduct(product.id, product.bundleId, isSelected);
            }}
            onSelectAll={(isSelected) => toggleAllVisible(isSelected)}
          />
        </div>
        {totalProducts > 0 ? (
          <p
            className="border-t border-mds-black-100 px-4 py-3 text-sm text-mds-black-600 sm:px-5"
            aria-live="polite"
          >
            {translate('create.steps.selectProducts.showingResults', {
              from: String(from),
              to: String(to),
              total: String(totalProducts),
            })}
          </p>
        ) : null}
      </div>
    </div>
  );
}
