'use client';

import { toast } from '@merit-incentives/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { catalogQueryKeys } from '@/api-queries/catalog/catalogQueryKeys';
import { adminCatalogAxiosMessage } from '@/app/(protected)/catalog-management/utils/adminCatalogAxiosMessage';
import { categoryFlatRowsToManagementRows } from '@/app/(protected)/category-management/utils/categoryManagementTree';
import { useLocalization } from '@/hooks/useLocalization';
import {
  createCatalogCategory,
  listAllCatalogCategories,
  updateCatalogCategory,
} from '@/services/catalogAdminService';
import type { CategoryManagementRow } from '@/types/catalog';
import { TIME_5_MIN } from '@/utils/timeUtils';

interface SubcategoryTarget {
  parentId: string;
  subId: string;
}

export function useCategoryManagement() {
  const { translate } = useLocalization('catalog');
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [addSubcategoryParentId, setAddSubcategoryParentId] = useState<
    string | null
  >(null);
  const [expandedIds, setExpandedIds] = useState(() => new Set<string>());
  const didInitExpand = useRef(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [deleteSubTarget, setDeleteSubTarget] =
    useState<SubcategoryTarget | null>(null);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [editSubTarget, setEditSubTarget] = useState<SubcategoryTarget | null>(
    null,
  );
  const [deleteCategorySubmitting, setDeleteCategorySubmitting] =
    useState(false);
  const [deleteSubSubmitting, setDeleteSubSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const categoriesQuery = useQuery({
    queryKey: catalogQueryKeys.categoryManagementList,
    queryFn: async (): Promise<CategoryManagementRow[]> => {
      const rows = await listAllCatalogCategories();
      return categoryFlatRowsToManagementRows(rows);
    },
    staleTime: TIME_5_MIN,
    gcTime: TIME_5_MIN,
  });

  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  );
  const loading = categoriesQuery.isLoading;
  const loadError = categoriesQuery.isError
    ? adminCatalogAxiosMessage(categoriesQuery.error)
    : null;

  const refreshCategories = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: catalogQueryKeys.categoryManagementList,
    });
  }, [queryClient]);

  useEffect(() => {
    if (
      loading ||
      categories.length === 0 ||
      didInitExpand.current ||
      expandedIds.size > 0
    ) {
      return;
    }
    setExpandedIds(new Set([categories[0].id]));
    didInitExpand.current = true;
  }, [loading, categories, expandedIds.size]);

  const toggleExpand = useCallback((categoryId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const categoryPendingDelete = useMemo(() => {
    if (!deleteCategoryId) return null;
    return categories.find((c) => c.id === deleteCategoryId) ?? null;
  }, [categories, deleteCategoryId]);

  const pendingDeleteSub = useMemo(() => {
    if (!deleteSubTarget) return null;
    const parent = categories.find((c) => c.id === deleteSubTarget.parentId);
    const sub =
      parent?.subcategories.find((s) => s.id === deleteSubTarget.subId) ?? null;
    return parent && sub ? { parent, sub } : null;
  }, [categories, deleteSubTarget]);

  const editCategoryRow = useMemo(() => {
    if (!editCategoryId) return null;
    return categories.find((c) => c.id === editCategoryId) ?? null;
  }, [categories, editCategoryId]);

  const pendingEditSub = useMemo(() => {
    if (!editSubTarget) return null;
    const parent = categories.find((c) => c.id === editSubTarget.parentId);
    const sub =
      parent?.subcategories.find((s) => s.id === editSubTarget.subId) ?? null;
    return parent && sub ? { parent, sub } : null;
  }, [categories, editSubTarget]);

  const handleCategoryCreated = async (name: string) => {
    await createCatalogCategory({ name, isActive: true });
    await refreshCategories();
  };

  const handleSubcategoryCreated = async ({
    parentCategoryId: id,
    name,
  }: {
    name: string;
    parentCategoryId: string;
  }) => {
    await createCatalogCategory({
      name,
      parentCategoryId: id,
      isActive: true,
    });
    await refreshCategories();
  };

  /** No DELETE endpoint — deactivate in PIM via `isActive: false`, then refresh the tree. */
  const handleConfirmDeleteCategory = async () => {
    const id = deleteCategoryId;
    if (!id || deleteCategorySubmitting) return;
    setDeleteCategorySubmitting(true);
    try {
      await updateCatalogCategory(id, { isActive: false });
      setDeleteCategoryId(null);
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success(
        translate(
          'categoryManagement.confirmDeleteCategory.deleteSuccessToast',
        ),
      );
      await refreshCategories();
    } catch (e) {
      toast.error(adminCatalogAxiosMessage(e));
    } finally {
      setDeleteCategorySubmitting(false);
    }
  };

  /** Same soft-delete as parent categories (POST update with `isActive: false`). */
  const handleConfirmDeleteSubcategory = async () => {
    if (!deleteSubTarget || deleteSubSubmitting) return;
    const { subId } = deleteSubTarget;
    setDeleteSubSubmitting(true);
    try {
      await updateCatalogCategory(subId, { isActive: false });
      setDeleteSubTarget(null);
      toast.success(
        translate(
          'categoryManagement.confirmDeleteSubcategory.deleteSuccessToast',
        ),
      );
      await refreshCategories();
    } catch (e) {
      toast.error(adminCatalogAxiosMessage(e));
    } finally {
      setDeleteSubSubmitting(false);
    }
  };

  const handleSaveCategory = async ({
    categoryId,
    name,
  }: {
    categoryId: string;
    name: string;
  }) => {
    await updateCatalogCategory(categoryId, { name });
    await refreshCategories();
  };

  const handleSaveSubcategory = async (payload: {
    parentCategoryId: string;
    subcategoryId: string;
    name: string;
  }) => {
    const { subcategoryId, name } = payload;
    await updateCatalogCategory(subcategoryId, { name });
    await refreshCategories();
  };

  const hasCategories = categories.length > 0;

  return {
    translate,
    categories,
    loading,
    loadError,
    hasCategories,
    refetchCategories: categoriesQuery.refetch,
    expandedIds,
    toggleExpand,
    newCategoryOpen,
    setNewCategoryOpen,
    addSubcategoryParentId,
    setAddSubcategoryParentId,
    deleteCategoryId,
    setDeleteCategoryId,
    deleteSubTarget,
    setDeleteSubTarget,
    editCategoryId,
    setEditCategoryId,
    editSubTarget,
    setEditSubTarget,
    deleteCategorySubmitting,
    deleteSubSubmitting,
    categoryPendingDelete,
    pendingDeleteSub,
    editCategoryRow,
    pendingEditSub,
    handleCategoryCreated,
    handleSubcategoryCreated,
    handleConfirmDeleteCategory,
    handleConfirmDeleteSubcategory,
    handleSaveCategory,
    handleSaveSubcategory,
  };
}
