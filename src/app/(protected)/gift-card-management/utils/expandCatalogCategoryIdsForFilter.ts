/**
 * Ecommerce `categoryIds` matches product assignment ids exactly.
 * Products are usually on leaf categories, while the filter may be a parent —
 * include direct children so parent selection still returns those products.
 */
export function expandCatalogCategoryIdsForFilter(
  selectedId: string,
  categories: ReadonlyArray<{
    id: string;
    parentCategoryId?: string | null;
  }>,
): string[] {
  const childIds = categories
    .filter((category) => category.parentCategoryId === selectedId)
    .map((category) => category.id)
    .filter(Boolean);
  if (childIds.length === 0) {
    return [selectedId];
  }
  return [selectedId, ...childIds];
}
