'use client';

import { Button } from '@merit-incentives/ui';
import { CirclePlus } from 'lucide-react';

import { PageHeader } from '@/components/PageHeader';
import { Spinner } from '@/components';
import { TableStateDisplay } from '@/components/TableStateDisplay';

import { CategoryManagementCategoryList } from '../CategoryManagementCategoryList';
import {
  CategoryManagementDialogs,
  CategoryManagementEmptyState,
} from './components';
import { useCategoryManagement } from './hooks';

export function CategoryManagementClient() {
  const {
    translate,
    categories,
    loading,
    loadError,
    hasCategories,
    refetchCategories,
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
  } = useCategoryManagement();

  if (loading && !hasCategories) {
    return <Spinner fullHeight />;
  }

  if (loadError && !hasCategories) {
    return (
      <div className="min-h-screen" id="catalog-category-management-page">
        <TableStateDisplay
          type="error"
          title={loadError}
          description=""
          showRetryButton
          onRetry={() => {
            void refetchCategories();
          }}
          retryButtonText={translate('retry') || 'Retry'}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen" id="catalog-category-management-page">
      <div className="space-y-1">
        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mds-black-500">
              {translate('categoryManagement.eyebrow')}
            </p>
            <PageHeader title={translate('categoryManagement.pageTitle')}>
              <Button
                variant="primary"
                type="button"
                onClick={() => setNewCategoryOpen(true)}
                leftIcon={<CirclePlus className="h-5 w-5" aria-hidden />}
              >
                {translate('categoryManagement.newCategory')}
              </Button>
            </PageHeader>
          </div>

          {hasCategories ? (
            <CategoryManagementCategoryList
              rows={categories}
              translate={translate}
              expandedIds={expandedIds}
              onToggleExpand={toggleExpand}
              onAddSubcategory={setAddSubcategoryParentId}
              onEditCategory={setEditCategoryId}
              onDeleteCategory={setDeleteCategoryId}
              onEditSubcategory={(parentId, subId) =>
                setEditSubTarget({ parentId, subId })
              }
              onDeleteSubcategory={(parentId, subId) =>
                setDeleteSubTarget({ parentId, subId })
              }
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-mds-black-100 bg-white shadow-sm">
              <CategoryManagementEmptyState translate={translate} />
            </div>
          )}
        </div>
      </div>

      <CategoryManagementDialogs
        translate={translate}
        newCategoryOpen={newCategoryOpen}
        onCloseNewCategory={() => setNewCategoryOpen(false)}
        onCategoryCreated={handleCategoryCreated}
        addSubcategoryParentId={addSubcategoryParentId}
        onCloseAddSubcategory={() => setAddSubcategoryParentId(null)}
        onSubcategoryCreated={handleSubcategoryCreated}
        deleteCategoryId={deleteCategoryId}
        categoryPendingDelete={categoryPendingDelete}
        onCloseDeleteCategory={() => setDeleteCategoryId(null)}
        deleteCategorySubmitting={deleteCategorySubmitting}
        onConfirmDeleteCategory={() => void handleConfirmDeleteCategory()}
        deleteSubTarget={deleteSubTarget}
        pendingDeleteSub={pendingDeleteSub}
        onCloseDeleteSubcategory={() => setDeleteSubTarget(null)}
        deleteSubSubmitting={deleteSubSubmitting}
        onConfirmDeleteSubcategory={() => void handleConfirmDeleteSubcategory()}
        editCategoryId={editCategoryId}
        editCategoryRow={editCategoryRow}
        onCloseEditCategory={() => setEditCategoryId(null)}
        onSaveCategory={handleSaveCategory}
        editSubTarget={editSubTarget}
        pendingEditSub={pendingEditSub}
        onCloseEditSubcategory={() => setEditSubTarget(null)}
        onSaveSubcategory={handleSaveSubcategory}
      />
    </div>
  );
}
