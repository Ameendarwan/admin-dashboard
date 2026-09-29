import type {
  EcommerceCategoryDto,
  CategoryManagementRow,
} from '@/types/catalog';

/**
 * Builds parent → subcategory rows for the management UI from a flat category list.
 */
export function categoryFlatRowsToManagementRows(
  rows: readonly EcommerceCategoryDto[],
): CategoryManagementRow[] {
  const active = rows.filter((r) => r.isActive !== false);
  const roots = active.filter((r) => !r.parentCategoryId);
  const childrenOf = (parentId: string) =>
    active.filter((r) => r.parentCategoryId === parentId);
  return roots.map((r) => ({
    id: r.id,
    name: r.name,
    handle: r.handle,
    isActive: r.isActive,
    subcategories: childrenOf(r.id).map((s) => ({
      id: s.id,
      name: s.name,
      handle: s.handle,
      isActive: s.isActive,
    })),
  }));
}
