'use client';

import { Button } from '@merit-incentives/ui';
import {
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';

import type { CategoryManagementRow } from '@/types/catalog';

interface CategoryManagementCategoryListProps {
  rows: readonly CategoryManagementRow[];
  translate: (key: string, values?: Record<string, string | number>) => string;
  expandedIds: ReadonlySet<string>;
  onToggleExpand: (categoryId: string) => void;
  onAddSubcategory: (categoryId: string) => void;
  onEditCategory: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onEditSubcategory: (parentCategoryId: string, subcategoryId: string) => void;
  onDeleteSubcategory: (
    parentCategoryId: string,
    subcategoryId: string,
  ) => void;
}

export function CategoryManagementCategoryList({
  rows,
  translate,
  expandedIds,
  onToggleExpand,
  onAddSubcategory,
  onEditCategory,
  onDeleteCategory,
  onEditSubcategory,
  onDeleteSubcategory,
}: Readonly<CategoryManagementCategoryListProps>) {
  return (
    <ul className="list-none space-y-3">
      {rows.map((row) => {
        const isExpanded = expandedIds.has(row.id);
        const subCount = row.subcategories.length;

        return (
          <li
            key={row.id}
            className="overflow-hidden rounded-xl border border-mds-black-100 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-4 bg-[#F4F7FF] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
              <div className="flex min-w-0 items-start gap-3">
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-label={
                    isExpanded
                      ? translate('categoryManagement.row.collapseAria')
                      : translate('categoryManagement.row.expandAria')
                  }
                  className="-ms-1 mt-0.5 shrink-0 rounded-md p-1.5 text-mds-black-500 transition-colors hover:bg-mds-primary-100/80 hover:text-mds-black-800"
                  onClick={() => onToggleExpand(row.id)}
                >
                  {isExpanded ? (
                    <ChevronDown
                      className="h-5 w-5"
                      aria-hidden
                      strokeWidth={2}
                    />
                  ) : (
                    <ChevronRight
                      className="h-5 w-5 rtl:rotate-180"
                      aria-hidden
                      strokeWidth={2}
                    />
                  )}
                </button>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold leading-snug text-mds-black-900 sm:text-base">
                    {row.name}
                  </p>
                  <p className="mt-1 text-sm text-mds-black-600">
                    {translate('categoryManagement.subCategoriesLine', {
                      count: subCount,
                    })}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3 sm:ps-2">
                <button
                  type="button"
                  aria-label={translate('categoryManagement.row.deleteAria')}
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-mds-error-500 text-white shadow-sm transition-colors hover:bg-mds-error-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mds-error-500"
                  onClick={() => onDeleteCategory(row.id)}
                >
                  <Trash2 className="size-[18px]" aria-hidden strokeWidth={2} />
                </button>

                <button
                  type="button"
                  aria-label={translate('categoryManagement.row.editAria')}
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-mds-black-200 bg-white text-mds-black-700 shadow-sm transition-colors hover:border-mds-black-300 hover:bg-mds-black-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mds-primary-500"
                  onClick={() => onEditCategory(row.id)}
                >
                  <Pencil className="size-4" aria-hidden strokeWidth={2} />
                </button>

                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0 rounded-full border-0 bg-[#dce7ff] px-4 py-2.5 text-sm font-semibold !text-mds-primary-700 shadow-none hover:bg-[#cae0fc] hover:!text-mds-primary-800 [&_svg]:text-mds-primary-700"
                  leftIcon={
                    <Plus
                      className="size-4 shrink-0"
                      aria-hidden
                      strokeWidth={2.5}
                    />
                  }
                  onClick={() => onAddSubcategory(row.id)}
                >
                  {translate('categoryManagement.row.addSubcategory')}
                </Button>
              </div>
            </div>

            {isExpanded && row.subcategories.length > 0 ? (
              <ul className="list-none space-y-2 border-t border-mds-black-100/70 bg-[#f8f9fc] p-3">
                {row.subcategories.map((sub) => (
                  <li key={sub.id}>
                    <div className="flex items-center gap-3 rounded-xl border border-mds-black-100/90 bg-white px-4 py-3 shadow-sm">
                      <CornerDownRight
                        className="mt-px size-5 shrink-0 text-mds-black-300"
                        aria-hidden
                        strokeWidth={2}
                      />
                      <span className="min-w-0 flex-1 text-[15px] font-medium text-mds-black-900">
                        {sub.name}
                      </span>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          aria-label={translate(
                            'categoryManagement.row.subDeleteAria',
                          )}
                          className="rounded-md p-2 text-mds-error-600 transition-colors hover:bg-mds-error-50 hover:text-mds-error-700"
                          onClick={() => onDeleteSubcategory(row.id, sub.id)}
                        >
                          <Trash2
                            className="size-[18px]"
                            aria-hidden
                            strokeWidth={2}
                          />
                        </button>
                        <button
                          type="button"
                          aria-label={translate(
                            'categoryManagement.row.subEditAria',
                          )}
                          className="rounded-md p-2 text-mds-black-500 transition-colors hover:bg-mds-black-50 hover:text-mds-black-800"
                          onClick={() => onEditSubcategory(row.id, sub.id)}
                        >
                          <Pencil
                            className="size-[18px]"
                            aria-hidden
                            strokeWidth={2}
                          />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
            {isExpanded && row.subcategories.length === 0 ? (
              <div className="border-t border-mds-black-100/70 bg-[#f8f9fc] px-4 py-6 text-center text-sm text-mds-black-500">
                {translate('categoryManagement.emptySubcategories')}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
