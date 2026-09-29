import { expandCatalogCategoryIdsForFilter } from '@/app/(protected)/gift-card-management/utils/expandCatalogCategoryIdsForFilter';
import { stripGiftCardCategoryDenominationSuffix } from '@/app/(protected)/gift-card-management/utils/stripGiftCardCategoryDenominationSuffix';

type GiftCardCategoryForFilter = {
  id: string;
  name: string;
  parentCategoryId?: string | null;
};

function isDenominationOnlyCategoryName(name: string): boolean {
  return /^(fixed|open)$/i.test(name.trim());
}

function categoryLabelKey(name: string): string {
  return stripGiftCardCategoryDenominationSuffix(name).toLowerCase();
}

/**
 * Unique dropdown options: strips Fixed/Open suffixes and merges duplicates
 * that only differ by denomination. Value is a stable representative category id.
 */
export function buildGiftCardCategoryFilterOptions(
  categories: ReadonlyArray<GiftCardCategoryForFilter>,
): Array<{ value: string; label: string }> {
  const groups = new Map<string, { label: string; ids: string[] }>();

  for (const category of categories) {
    if (!category.id || !category.name) {
      continue;
    }
    if (isDenominationOnlyCategoryName(category.name)) {
      continue;
    }

    const label = stripGiftCardCategoryDenominationSuffix(category.name);
    const key = label.toLowerCase();
    const existing = groups.get(key);
    if (existing) {
      existing.ids.push(category.id);
      continue;
    }
    groups.set(key, { label, ids: [category.id] });
  }

  return [...groups.values()]
    .map(({ label, ids }) => ({
      value: [...ids].sort((a, b) => a.localeCompare(b))[0]!,
      label,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Resolves a selected filter option to all related catalog category ids
 * (same display label including Fixed/Open variants, plus direct children).
 */
export function resolveGiftCardCategoryFilterIds(
  selectedId: string,
  categories: ReadonlyArray<GiftCardCategoryForFilter>,
): string[] {
  const selected = categories.find((category) => category.id === selectedId);
  if (!selected?.name) {
    return expandCatalogCategoryIdsForFilter(selectedId, categories);
  }

  const selectedKey = categoryLabelKey(selected.name);
  const matchingIds = categories
    .filter(
      (category) =>
        Boolean(category.id && category.name) &&
        !isDenominationOnlyCategoryName(category.name) &&
        categoryLabelKey(category.name) === selectedKey,
    )
    .map((category) => category.id);

  const ids = new Set<string>();
  for (const id of matchingIds.length > 0 ? matchingIds : [selectedId]) {
    for (const expandedId of expandCatalogCategoryIdsForFilter(
      id,
      categories,
    )) {
      ids.add(expandedId);
    }
  }
  return [...ids];
}
