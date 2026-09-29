'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { catalogQueryKeys } from '@/api-queries/catalog/catalogQueryKeys';
import { categoryFlatRowsToManagementRows } from '@/app/(protected)/category-management/utils/categoryManagementTree';
import { listAllCatalogCategories } from '@/services/catalogAdminService';
import { TIME_5_MIN } from '@/utils/timeUtils';

export type CatalogFilterOption = { value: string; label: string };

const ALL_VALUE = 'all';

function byLabelAz(a: CatalogFilterOption, b: CatalogFilterOption): number {
  return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' });
}

type UseCatalogCategoryFilterOptionsArgs = {
  enabled: boolean;
  parentCategoryId?: string;
  allCategoriesLabel: string;
  allSubcategoriesLabel: string;
  isGiftcardCategory?: boolean;
};

export function useCatalogCategoryFilterOptions({
  enabled,
  parentCategoryId,
  allCategoriesLabel,
  allSubcategoriesLabel,
  isGiftcardCategory,
}: UseCatalogCategoryFilterOptionsArgs) {
  const query = useQuery({
    queryKey: [
      ...catalogQueryKeys.categoryManagementList,
      isGiftcardCategory ?? 'all',
    ],
    queryFn: () =>
      listAllCatalogCategories(
        isGiftcardCategory === undefined ? {} : { isGiftcardCategory },
      ),
    enabled,
    staleTime: TIME_5_MIN,
    gcTime: TIME_5_MIN,
  });

  const tree = useMemo(
    () => categoryFlatRowsToManagementRows(query.data ?? []),
    [query.data],
  );

  const categoryOptions = useMemo<CatalogFilterOption[]>(
    () => [
      { value: ALL_VALUE, label: allCategoriesLabel },
      ...tree
        .map((row) => ({ value: row.id, label: row.name }))
        .sort(byLabelAz),
    ],
    [allCategoriesLabel, tree],
  );

  const subcategories = useMemo(() => {
    if (!parentCategoryId) {
      return [];
    }
    return tree.find((row) => row.id === parentCategoryId)?.subcategories ?? [];
  }, [parentCategoryId, tree]);

  const subcategoryOptions = useMemo<CatalogFilterOption[]>(
    () => [
      { value: ALL_VALUE, label: allSubcategoriesLabel },
      ...subcategories
        .map((row) => ({ value: row.id, label: row.name }))
        .sort(byLabelAz),
    ],
    [allSubcategoriesLabel, subcategories],
  );

  const productListCategoryIds = useMemo(() => {
    if (!parentCategoryId) {
      return undefined;
    }
    return [parentCategoryId, ...subcategories.map((row) => row.id)];
  }, [parentCategoryId, subcategories]);

  return {
    categoryOptions,
    subcategoryOptions,
    showSubcategory: Boolean(parentCategoryId) && subcategories.length > 0,
    productListCategoryIds,
  };
}
