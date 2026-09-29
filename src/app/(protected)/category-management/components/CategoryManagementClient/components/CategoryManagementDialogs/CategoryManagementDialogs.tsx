'use client';

import { toast } from '@merit-incentives/ui';

import { adminCatalogAxiosMessage } from '@/app/(protected)/catalog-management/utils/adminCatalogAxiosMessage';
import { ConfirmationPopup } from '@/components/ConfirmationPopup';
import type {
  CategoryManagementRow,
  CategorySubcategoryRow,
} from '@/types/catalog';

import { AddSubcategoryDialog } from '../../../AddSubcategoryDialog';
import { EditCategoryDialog } from '../../../EditCategoryDialog';
import { EditSubcategoryDialog } from '../../../EditSubcategoryDialog';
import { NewCategoryDialog } from '../../../NewCategoryDialog';

interface SubcategoryTarget {
  parentId: string;
  subId: string;
}

interface SubcategoryWithParent {
  parent: CategoryManagementRow;
  sub: CategorySubcategoryRow;
}

interface CategoryManagementDialogsProps {
  translate: (key: string, values?: Record<string, string | number>) => string;
  newCategoryOpen: boolean;
  onCloseNewCategory: () => void;
  onCategoryCreated: (name: string) => Promise<void>;
  addSubcategoryParentId: string | null;
  onCloseAddSubcategory: () => void;
  onSubcategoryCreated: (payload: {
    name: string;
    parentCategoryId: string;
  }) => Promise<void>;
  deleteCategoryId: string | null;
  categoryPendingDelete: CategoryManagementRow | null;
  onCloseDeleteCategory: () => void;
  deleteCategorySubmitting: boolean;
  onConfirmDeleteCategory: () => void;
  deleteSubTarget: SubcategoryTarget | null;
  pendingDeleteSub: SubcategoryWithParent | null;
  onCloseDeleteSubcategory: () => void;
  deleteSubSubmitting: boolean;
  onConfirmDeleteSubcategory: () => void;
  editCategoryId: string | null;
  editCategoryRow: CategoryManagementRow | null;
  onCloseEditCategory: () => void;
  onSaveCategory: (payload: {
    categoryId: string;
    name: string;
  }) => Promise<void>;
  editSubTarget: SubcategoryTarget | null;
  pendingEditSub: SubcategoryWithParent | null;
  onCloseEditSubcategory: () => void;
  onSaveSubcategory: (payload: {
    parentCategoryId: string;
    subcategoryId: string;
    name: string;
  }) => Promise<void>;
}

export function CategoryManagementDialogs({
  translate,
  newCategoryOpen,
  onCloseNewCategory,
  onCategoryCreated,
  addSubcategoryParentId,
  onCloseAddSubcategory,
  onSubcategoryCreated,
  deleteCategoryId,
  categoryPendingDelete,
  onCloseDeleteCategory,
  deleteCategorySubmitting,
  onConfirmDeleteCategory,
  deleteSubTarget,
  pendingDeleteSub,
  onCloseDeleteSubcategory,
  deleteSubSubmitting,
  onConfirmDeleteSubcategory,
  editCategoryId,
  editCategoryRow,
  onCloseEditCategory,
  onSaveCategory,
  editSubTarget,
  pendingEditSub,
  onCloseEditSubcategory,
  onSaveSubcategory,
}: Readonly<CategoryManagementDialogsProps>) {
  return (
    <>
      <NewCategoryDialog
        isOpen={newCategoryOpen}
        onClose={onCloseNewCategory}
        onCreated={async (name) => {
          try {
            await onCategoryCreated(name);
            toast.success(
              translate('categoryManagement.dialog.createSuccessToast'),
            );
          } catch (e) {
            toast.error(adminCatalogAxiosMessage(e));
            throw e;
          }
        }}
      />

      <AddSubcategoryDialog
        isOpen={addSubcategoryParentId !== null}
        parentCategoryId={addSubcategoryParentId}
        onClose={onCloseAddSubcategory}
        onCreated={async (payload) => {
          try {
            await onSubcategoryCreated(payload);
            toast.success(
              translate(
                'categoryManagement.subcategoryDialog.createSuccessToast',
              ),
            );
          } catch (e) {
            toast.error(adminCatalogAxiosMessage(e));
            throw e;
          }
        }}
      />

      <ConfirmationPopup
        isOpen={deleteCategoryId !== null && !!categoryPendingDelete}
        onClose={onCloseDeleteCategory}
        type="warning"
        title={translate('categoryManagement.confirmDeleteCategory.title')}
        description={
          categoryPendingDelete ? (
            <>
              {translate('categoryManagement.confirmDeleteCategory.bodyPart1')}{' '}
              <strong className="font-semibold">
                {categoryPendingDelete.name}
              </strong>{' '}
              {translate('categoryManagement.confirmDeleteCategory.bodyPart2')}
            </>
          ) : (
            ''
          )
        }
        primaryButton={{
          text: translate(
            'categoryManagement.confirmDeleteCategory.deleteButton',
          ),
          variant: 'negative',
        }}
        secondaryButton={{
          text: translate('categoryManagement.dialog.cancel'),
          variant: 'secondary',
        }}
        closeOnPrimaryAction={false}
        primaryLoading={deleteCategorySubmitting}
        onPrimaryAction={onConfirmDeleteCategory}
      />

      <ConfirmationPopup
        isOpen={deleteSubTarget !== null && !!pendingDeleteSub}
        onClose={onCloseDeleteSubcategory}
        type="warning"
        title={translate('categoryManagement.confirmDeleteSubcategory.title')}
        description={
          pendingDeleteSub ? (
            <>
              <strong className="font-semibold">
                {pendingDeleteSub.sub.name}
              </strong>{' '}
              {translate(
                'categoryManagement.confirmDeleteSubcategory.afterBold',
                {
                  parentName: pendingDeleteSub.parent.name,
                },
              )}
            </>
          ) : (
            ''
          )
        }
        primaryButton={{
          text: translate(
            'categoryManagement.confirmDeleteSubcategory.deleteButton',
          ),
          variant: 'negative',
        }}
        secondaryButton={{
          text: translate('categoryManagement.dialog.cancel'),
          variant: 'secondary',
        }}
        closeOnPrimaryAction={false}
        primaryLoading={deleteSubSubmitting}
        onPrimaryAction={onConfirmDeleteSubcategory}
      />

      <EditCategoryDialog
        isOpen={editCategoryId !== null && !!editCategoryRow}
        onClose={onCloseEditCategory}
        categoryId={editCategoryId}
        initialName={editCategoryRow?.name ?? ''}
        onSave={async (p) => {
          try {
            await onSaveCategory(p);
            toast.success(
              translate(
                'categoryManagement.editCategoryDialog.saveSuccessToast',
              ),
            );
          } catch (e) {
            toast.error(adminCatalogAxiosMessage(e));
            throw e;
          }
        }}
      />

      <EditSubcategoryDialog
        isOpen={editSubTarget !== null && !!pendingEditSub}
        onClose={onCloseEditSubcategory}
        parentCategoryId={editSubTarget?.parentId ?? null}
        subcategoryId={editSubTarget?.subId ?? null}
        initialName={pendingEditSub?.sub.name ?? ''}
        onSave={async (p) => {
          try {
            await onSaveSubcategory(p);
            toast.success(
              translate(
                'categoryManagement.editSubcategoryDialog.saveSuccessToast',
              ),
            );
          } catch (e) {
            toast.error(adminCatalogAxiosMessage(e));
            throw e;
          }
        }}
      />
    </>
  );
}
