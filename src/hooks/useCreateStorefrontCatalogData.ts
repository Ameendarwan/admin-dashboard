'use client';

import { toast } from '@merit-incentives/ui';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, type Dispatch, type SetStateAction } from 'react';

import { createStorefrontCatalogQueryKeys } from '@/api-queries/storefronts/createStorefrontCatalogQueryKeys';
import {
  loadStorefrontCategoryBundles,
  loadStorefrontProducts,
} from '@/lib/createStorefrontCatalogData';
import type {
  CreateStorefrontFormValues,
  CreateStorefrontStepIndex,
} from '@/types/createStorefrontForm';
import {
  buildProductsQueryScopeKey,
  getAvailableStorefrontBundleTabs,
  getSelectedStorefrontBundleTabs,
  getSelectedTabBundles,
  patchProductsCategoryFilterForTab,
  resolveActiveCategoryBundleId,
  resolveProductCategoryIds,
  resolveStorefrontBundleTab,
} from '@/utils/createStorefrontFormHelpers';
import { TIME_5_MIN } from '@/utils/timeUtils';

const PRODUCTS_PAGE_SIZE = 10;

type UseCreateStorefrontCatalogDataParams = Readonly<{
  step: CreateStorefrontStepIndex;
  values: CreateStorefrontFormValues;
  setValues: Dispatch<SetStateAction<CreateStorefrontFormValues>>;
  debouncedProductSearch: string;
  effectiveProductsPage: number;
  translate: (key: string) => string;
  /** While creating or showing success, keep the step-3 products query idle. */
  keepProductsQueryIdle?: boolean;
}>;

export function useCreateStorefrontCatalogData({
  step,
  values,
  setValues,
  debouncedProductSearch,
  effectiveProductsPage,
  translate,
  keepProductsQueryIdle = false,
}: UseCreateStorefrontCatalogDataParams) {
  const isCategoryStep = step === 1;
  const isProductsStep = step === 2;
  const hasSelectedCategories = values.selectedCategoryIds.length > 0;

  const bundlesQuery = useQuery({
    queryKey: createStorefrontCatalogQueryKeys.categoryBundles,
    queryFn: loadStorefrontCategoryBundles,
    enabled: isCategoryStep || isProductsStep,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const catalogBundles = useMemo(
    () => bundlesQuery.data ?? [],
    [bundlesQuery.data],
  );

  const availableBundleTabs = useMemo(
    () => getAvailableStorefrontBundleTabs(catalogBundles),
    [catalogBundles],
  );

  const selectedBundleTabs = useMemo(
    () =>
      getSelectedStorefrontBundleTabs(
        catalogBundles,
        values.selectedCategoryIds,
      ),
    [catalogBundles, values.selectedCategoryIds],
  );

  useEffect(() => {
    if (!isCategoryStep && !isProductsStep) {
      return;
    }

    const nextBundleTab = resolveStorefrontBundleTab(
      values.bundleTab,
      availableBundleTabs,
    );
    const nextProductsTab = resolveStorefrontBundleTab(
      values.productsTab,
      isProductsStep ? selectedBundleTabs : availableBundleTabs,
    );

    if (
      nextBundleTab !== values.bundleTab ||
      nextProductsTab !== values.productsTab
    ) {
      setValues((current) => ({
        ...current,
        bundleTab: nextBundleTab,
        productsTab: nextProductsTab,
      }));
    }
  }, [
    availableBundleTabs,
    isCategoryStep,
    isProductsStep,
    selectedBundleTabs,
    setValues,
    values.bundleTab,
    values.productsTab,
  ]);

  const selectedTabBundles = useMemo(
    () =>
      getSelectedTabBundles(
        catalogBundles,
        values.selectedCategoryIds,
        values.productsTab,
      ),
    [catalogBundles, values.productsTab, values.selectedCategoryIds],
  );

  const productsQueryScopeKey = useMemo(
    () =>
      buildProductsQueryScopeKey(
        values.selectedCategoryIds,
        values.productsTab,
        values.activeCategoryFilterId,
      ),
    [
      values.activeCategoryFilterId,
      values.productsTab,
      values.selectedCategoryIds,
    ],
  );

  const activeCategoryIds = useMemo(
    () =>
      resolveProductCategoryIds(
        values.activeCategoryFilterId,
        selectedTabBundles,
      ),
    [selectedTabBundles, values.activeCategoryFilterId],
  );

  const activeIsGiftcard = values.productsTab === 'giftCards';

  useEffect(() => {
    if (!isProductsStep || selectedTabBundles.length === 0) {
      return;
    }

    const resolvedActiveBundleId = resolveActiveCategoryBundleId(
      catalogBundles,
      values.selectedCategoryIds,
      values.productsTab,
      values.activeCategoryFilterId,
    );

    if (resolvedActiveBundleId !== values.activeCategoryFilterId) {
      setValues((current) => ({
        ...current,
        activeCategoryFilterId: resolvedActiveBundleId,
        productsCategoryFilterByTab: patchProductsCategoryFilterForTab(
          current.productsCategoryFilterByTab,
          current.productsTab,
          resolvedActiveBundleId,
        ),
      }));
    }
  }, [
    catalogBundles,
    isProductsStep,
    selectedTabBundles.length,
    setValues,
    values.activeCategoryFilterId,
    values.productsTab,
    values.selectedCategoryIds,
  ]);

  useEffect(() => {
    if (bundlesQuery.isError) {
      toast.error(translate('create.loadCategoriesError'));
    }
  }, [bundlesQuery.isError, translate]);

  const productsQuery = useQuery({
    queryKey: createStorefrontCatalogQueryKeys.products(
      productsQueryScopeKey,
      activeCategoryIds,
      activeIsGiftcard,
      debouncedProductSearch,
      effectiveProductsPage,
      PRODUCTS_PAGE_SIZE,
    ),
    queryFn: () =>
      loadStorefrontProducts({
        categoryIds: activeCategoryIds,
        isGiftcard: activeIsGiftcard,
        search: debouncedProductSearch,
        page: effectiveProductsPage,
        pageSize: PRODUCTS_PAGE_SIZE,
      }),
    enabled:
      isProductsStep &&
      hasSelectedCategories &&
      activeCategoryIds.length > 0 &&
      !keepProductsQueryIdle,
    staleTime: TIME_5_MIN,
    gcTime: TIME_5_MIN,
    placeholderData: (previousData, previousQuery) => {
      const previousParams = previousQuery?.queryKey[2] as
        | { isGiftcard?: boolean }
        | undefined;
      if (previousParams?.isGiftcard !== activeIsGiftcard) {
        return undefined;
      }
      return previousData;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (productsQuery.isError) {
      toast.error(translate('create.loadProductsError'));
    }
  }, [productsQuery.isError, translate]);

  const emptyProductsResult = useMemo(
    () => ({ rows: [] as never[], total: 0 }),
    [],
  );

  const productsQueryForUi = useMemo(() => {
    if (isProductsStep && activeCategoryIds.length === 0) {
      return {
        ...productsQuery,
        data: emptyProductsResult,
        isPlaceholderData: false,
        isFetching: false,
      };
    }
    return productsQuery;
  }, [
    activeCategoryIds.length,
    emptyProductsResult,
    isProductsStep,
    productsQuery,
  ]);

  return {
    catalogBundles,
    availableBundleTabs,
    selectedBundleTabs,
    bundlesQuery,
    productsQuery: productsQueryForUi,
    productsPageSize: PRODUCTS_PAGE_SIZE,
  };
}
