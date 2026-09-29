import type {
  CreateStorefrontFormValues,
  CreateStorefrontStepIndex,
  StorefrontBundleTabKey,
  StorefrontCategoryBundle,
  StorefrontCurrency,
  StorefrontProductRow,
} from '@/types/createStorefrontForm';

export const STOREFRONT_REGION_OPTIONS = [
  { value: 'saudi-arabia', label: 'Saudi Arabia' },
  { value: 'uae', label: 'United Arab Emirates' },
  { value: 'kuwait', label: 'Kuwait' },
  { value: 'bahrain', label: 'Bahrain' },
  { value: 'qatar', label: 'Qatar' },
  { value: 'oman', label: 'Oman' },
] as const;

export const STOREFRONT_CURRENCY_OPTIONS: Array<{
  value: StorefrontCurrency;
  label: string;
}> = [
  { value: 'SAR', label: 'SAR' },
  { value: 'AED', label: 'AED' },
];

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const STOREFRONT_BUNDLE_TAB_KEYS = ['merchandise', 'giftCards'] as const;

/** Dropdown value when loading products across every selected category in the tab. */
export const ALL_STOREFRONT_PRODUCTS_CATEGORY_FILTER = 'all';

export const INITIAL_PRODUCTS_CATEGORY_FILTER_BY_TAB: Record<
  StorefrontBundleTabKey,
  string | null
> = {
  merchandise: null,
  giftCards: null,
};

export function getAvailableStorefrontBundleTabs(
  bundles: StorefrontCategoryBundle[],
): StorefrontBundleTabKey[] {
  const tabs: StorefrontBundleTabKey[] = [];
  if (bundles.some((bundle) => !bundle.isGiftcard)) {
    tabs.push('merchandise');
  }
  if (bundles.some((bundle) => bundle.isGiftcard)) {
    tabs.push('giftCards');
  }
  return tabs;
}

export function getSelectedStorefrontBundleTabs(
  bundles: StorefrontCategoryBundle[],
  selectedCategoryIds: string[],
): StorefrontBundleTabKey[] {
  const selectedBundles = bundles.filter((bundle) =>
    selectedCategoryIds.includes(bundle.id),
  );
  return getAvailableStorefrontBundleTabs(selectedBundles);
}

export function resolveStorefrontBundleTab(
  tab: StorefrontBundleTabKey,
  availableTabs: readonly StorefrontBundleTabKey[],
): StorefrontBundleTabKey {
  if (availableTabs.includes(tab)) {
    return tab;
  }
  return availableTabs[0] ?? 'merchandise';
}

export function getInitialCreateStorefrontValues(): CreateStorefrontFormValues {
  return {
    tenantId: '',
    storefrontName: '',
    urlSlug: '',
    region: '',
    currency: 'SAR',
    floatBalance: '',
    lowFloatThreshold: '',
    selectedCategoryIds: [],
    selectedProductIds: [],
    productBundleById: {},
    allProductsBundleIds: [],
    bundleTab: 'merchandise',
    productsTab: 'merchandise',
    activeCategoryFilterId: null,
    productsCategoryFilterByTab: { ...INITIAL_PRODUCTS_CATEGORY_FILTER_BY_TAB },
  };
}

export function slugifyStorefrontName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9\s-]/g, '')
    .replaceAll(/\s+/g, '-')
    .replaceAll(/-+/g, '-')
    .replaceAll(/^-|-$/g, '');
}

export function isValidStorefrontSlug(slug: string): boolean {
  const trimmed = slug.trim();
  return trimmed.length > 0 && SLUG_PATTERN.test(trimmed);
}

export function sanitizeNumericAmountInput(value: string): string {
  const cleaned = value.replaceAll(/[^\d.]/g, '');
  const dotIndex = cleaned.indexOf('.');
  if (dotIndex === -1) {
    return cleaned;
  }
  const whole = cleaned.slice(0, dotIndex);
  const fraction = cleaned.slice(dotIndex + 1).replaceAll('.', '');
  return `${whole}.${fraction}`;
}

export function parsePositiveAmount(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed.replaceAll(',', ''));
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

export function validateCreateStorefrontDetailsStep(
  values: CreateStorefrontFormValues,
  requireTenant: boolean,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (requireTenant && !values.tenantId.trim()) {
    errors.tenantId = 'requiredSelect';
  }
  if (!values.storefrontName.trim()) {
    errors.storefrontName = 'required';
  }
  if (!isValidStorefrontSlug(values.urlSlug)) {
    errors.urlSlug = 'required';
  }
  if (!values.region.trim()) {
    errors.region = 'required';
  }
  if (parsePositiveAmount(values.floatBalance) === null) {
    errors.floatBalance = 'required';
  }
  if (parsePositiveAmount(values.lowFloatThreshold) === null) {
    errors.lowFloatThreshold = 'required';
  }

  return errors;
}

export function getProductSelectAllScopeBundleIds(
  selectedBundles: ReadonlyArray<{ id: string }>,
  isAllCategoriesActive: boolean,
  activeBundleId: string | null,
): string[] {
  if (isAllCategoriesActive) {
    return selectedBundles.map((bundle) => bundle.id);
  }
  if (activeBundleId) {
    return [activeBundleId];
  }
  return [];
}

export type CreateStorefrontProductSelectionPatch = Pick<
  CreateStorefrontFormValues,
  'selectedProductIds' | 'productBundleById' | 'allProductsBundleIds'
>;

function removeSpecificSelectionsForBundles(
  bundleIds: string[],
  selectedProductIds: string[],
  productBundleById: Record<string, string>,
): Pick<
  CreateStorefrontFormValues,
  'selectedProductIds' | 'productBundleById'
> {
  const bundleIdSet = new Set(bundleIds);
  const nextProductBundleById = { ...productBundleById };
  const nextSelectedProductIds = selectedProductIds.filter((productId) => {
    const bundleId = productBundleById[productId];
    if (bundleId && bundleIdSet.has(bundleId)) {
      delete nextProductBundleById[productId];
      return false;
    }
    return true;
  });
  return {
    selectedProductIds: nextSelectedProductIds,
    productBundleById: nextProductBundleById,
  };
}

/**
 * Applies a single product row toggle. Returns null when the event should be
 * ignored (e.g. Radix checkbox unmount deselect for a bundle in “all” mode).
 */
export function applyCreateStorefrontProductToggle(
  values: CreateStorefrontFormValues,
  productId: string,
  bundleId: string,
  checked: boolean,
): CreateStorefrontProductSelectionPatch | null {
  if (checked && values.allProductsBundleIds.includes(bundleId)) {
    return null;
  }

  if (
    !checked &&
    values.allProductsBundleIds.includes(bundleId) &&
    !values.selectedProductIds.includes(productId)
  ) {
    return null;
  }

  let allProductsBundleIds = values.allProductsBundleIds;
  if (!checked && allProductsBundleIds.includes(bundleId)) {
    allProductsBundleIds = allProductsBundleIds.filter((id) => id !== bundleId);
  }

  const selectedProductIds = checked
    ? [...new Set([...values.selectedProductIds, productId])]
    : values.selectedProductIds.filter((id) => id !== productId);
  const productBundleById = { ...values.productBundleById };
  if (checked) {
    productBundleById[productId] = bundleId;
  } else {
    delete productBundleById[productId];
  }

  return {
    selectedProductIds,
    productBundleById,
    allProductsBundleIds,
  };
}

/**
 * Applies the table header “select all” toggle for the current category scope.
 * Returns null when the event should be ignored (e.g. header unchecking because
 * a new page/filter has no selected rows yet).
 */
export function applyCreateStorefrontSelectAllToggle(
  values: CreateStorefrontFormValues,
  scopedBundleIds: string[],
  currentTabBundleIds: string[],
  checked: boolean,
): CreateStorefrontProductSelectionPatch | null {
  if (scopedBundleIds.length === 0) {
    return null;
  }

  const currentTabBundleIdSet = new Set(currentTabBundleIds);
  const tabScopedBundleIds = scopedBundleIds.filter((bundleId) =>
    currentTabBundleIdSet.has(bundleId),
  );

  if (tabScopedBundleIds.length === 0) {
    return null;
  }

  if (!checked) {
    const hadAllModeInScope = tabScopedBundleIds.some((bundleId) =>
      values.allProductsBundleIds.includes(bundleId),
    );
    const hasSpecificInScope = values.selectedProductIds.some((productId) =>
      tabScopedBundleIds.includes(values.productBundleById[productId] ?? ''),
    );
    if (!hadAllModeInScope && !hasSpecificInScope) {
      return null;
    }
  }

  if (checked) {
    const cleared = removeSpecificSelectionsForBundles(
      tabScopedBundleIds,
      values.selectedProductIds,
      values.productBundleById,
    );
    // Only evict bundles that are actually in the scope being selected — not
    // every bundle in the tab. Using currentTabBundleIdSet here would wipe
    // all-mode from same-tab bundles that aren't being touched (e.g. selecting
    // all in category B would erase category A's all-mode selection).
    const tabScopedBundleIdSet = new Set(tabScopedBundleIds);
    const otherAllIds = values.allProductsBundleIds.filter(
      (bundleId) => !tabScopedBundleIdSet.has(bundleId),
    );
    return {
      allProductsBundleIds: [
        ...new Set([...otherAllIds, ...tabScopedBundleIds]),
      ],
      ...cleared,
    };
  }

  const allProductsBundleIds = values.allProductsBundleIds.filter(
    (bundleId) => !tabScopedBundleIds.includes(bundleId),
  );
  const cleared = removeSpecificSelectionsForBundles(
    tabScopedBundleIds,
    values.selectedProductIds,
    values.productBundleById,
  );
  return {
    allProductsBundleIds,
    ...cleared,
  };
}

export function bundleHasProductSelection(
  bundleId: string,
  values: CreateStorefrontFormValues,
): boolean {
  if (values.allProductsBundleIds.includes(bundleId)) {
    return true;
  }
  return values.selectedProductIds.some(
    (productId) => values.productBundleById[productId] === bundleId,
  );
}

/**
 * Merit Table marks the header checkbox checked when `selectedRows.length === data.length`
 * (not when every visible row id is selected). When only some categories are in “all” mode
 * on the combined view, a full page of those rows would falsely check the header — append a
 * guard id so row checkboxes still work but the header stays unchecked.
 */
const PARTIAL_ALL_MODE_TABLE_GUARD = '__create_storefront_partial_all_mode__';

export function buildCreateStorefrontTableSelectedRows(
  products: ReadonlyArray<StorefrontProductRow>,
  values: CreateStorefrontFormValues,
  isEntireScopeAllMode: boolean,
  isProductRowSelected: (product: StorefrontProductRow) => boolean,
): string[] {
  const selectedRowIds = products
    .filter((product) => isProductRowSelected(product))
    .map((product) => product.id);

  if (selectedRowIds.length === 0 || products.length === 0) {
    return selectedRowIds;
  }

  const allPageEffectivelySelected = products.every((product) =>
    isProductRowSelected(product),
  );
  const allPageExplicitlySelected = products.every((product) =>
    values.selectedProductIds.includes(product.id),
  );

  if (
    !isEntireScopeAllMode &&
    allPageEffectivelySelected &&
    !allPageExplicitlySelected
  ) {
    return [...selectedRowIds, PARTIAL_ALL_MODE_TABLE_GUARD];
  }

  return selectedRowIds;
}

function validateCreateStorefrontProductsStep(
  values: CreateStorefrontFormValues,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const hasAnyProductSelection = values.selectedCategoryIds.some((bundleId) =>
    bundleHasProductSelection(bundleId, values),
  );
  if (!hasAnyProductSelection) {
    errors.selectedProductIds = 'required';
  }
  return errors;
}

export function validateCreateStorefrontStep(
  step: CreateStorefrontStepIndex,
  values: CreateStorefrontFormValues,
  options?: Readonly<{ requireTenant?: boolean }>,
): Record<string, string> {
  if (step === 0) {
    return validateCreateStorefrontDetailsStep(
      values,
      options?.requireTenant === true,
    );
  }

  const errors: Record<string, string> = {};

  if (step === 1 && values.selectedCategoryIds.length === 0) {
    errors.selectedCategoryIds = 'required';
  }

  if (step === 2) {
    Object.assign(errors, validateCreateStorefrontProductsStep(values));
  }

  return errors;
}

export function isCreateStorefrontStepValid(
  step: CreateStorefrontStepIndex,
  values: CreateStorefrontFormValues,
  options?: Readonly<{ requireTenant?: boolean }>,
): boolean {
  return (
    Object.keys(validateCreateStorefrontStep(step, values, options)).length ===
    0
  );
}

export function formatStorefrontAmount(
  value: string,
  currency: StorefrontCurrency,
): string {
  const parsed = parsePositiveAmount(value);
  if (parsed === null) {
    return `0 ${currency}`;
  }
  return `${parsed.toLocaleString()} ${currency}`;
}

export function parseBundleCategoryId(bundleId: string): {
  categoryId: string;
  isGiftcard: boolean;
} {
  const [categoryId, bundleType] = bundleId.split(':');
  return {
    categoryId,
    isGiftcard: bundleType === 'giftCards',
  };
}

export function bundleMatchesTab(
  bundle: StorefrontCategoryBundle,
  tab: StorefrontBundleTabKey,
): boolean {
  return tab === 'giftCards' ? bundle.isGiftcard : !bundle.isGiftcard;
}

export function getCategoryIdsForOtherTabs(
  bundles: StorefrontCategoryBundle[],
  selectedCategoryIds: string[],
  tab: StorefrontBundleTabKey,
): string[] {
  return selectedCategoryIds.filter((id) => {
    const bundle = bundles.find((item) => item.id === id);
    return bundle ? !bundleMatchesTab(bundle, tab) : false;
  });
}

export function mergeTabCategorySelections(
  bundles: StorefrontCategoryBundle[],
  selectedCategoryIds: string[],
  tab: StorefrontBundleTabKey,
  tabCategoryIds: string[],
): string[] {
  const otherTabIds = getCategoryIdsForOtherTabs(
    bundles,
    selectedCategoryIds,
    tab,
  );
  return [...otherTabIds, ...tabCategoryIds];
}

export function isTabSelectAllChecked(
  bundles: StorefrontCategoryBundle[],
  selectedCategoryIds: string[],
  tab: StorefrontBundleTabKey,
): boolean {
  const visibleBundles = bundles.filter((bundle) =>
    bundleMatchesTab(bundle, tab),
  );
  return (
    visibleBundles.length > 0 &&
    visibleBundles.every((bundle) => selectedCategoryIds.includes(bundle.id))
  );
}

export function patchProductsCategoryFilterForTab(
  current: Record<StorefrontBundleTabKey, string | null>,
  tab: StorefrontBundleTabKey,
  filterId: string | null,
): Record<StorefrontBundleTabKey, string | null> {
  return { ...current, [tab]: filterId };
}

export function getSelectedTabBundleIds(
  bundles: StorefrontCategoryBundle[],
  selectedCategoryIds: string[],
  tab: StorefrontBundleTabKey,
): string[] {
  return getSelectedTabBundles(bundles, selectedCategoryIds, tab).map(
    (bundle) => bundle.id,
  );
}

export function getSelectedTabBundles(
  bundles: StorefrontCategoryBundle[],
  selectedCategoryIds: string[],
  tab: StorefrontBundleTabKey,
): StorefrontCategoryBundle[] {
  return bundles.filter(
    (bundle) =>
      selectedCategoryIds.includes(bundle.id) && bundleMatchesTab(bundle, tab),
  );
}

/** Selected / available product counts for one merchandise or gift-card tab. */
export function getTabProductSelectionTotals(
  selectedBundles: StorefrontCategoryBundle[],
  values: Pick<
    CreateStorefrontFormValues,
    'selectedProductIds' | 'productBundleById' | 'allProductsBundleIds'
  >,
): { selected: number; total: number } {
  let selected = 0;
  let total = 0;

  for (const bundle of selectedBundles) {
    total += bundle.productCount;
    if (values.allProductsBundleIds.includes(bundle.id)) {
      selected += bundle.productCount;
      continue;
    }
    selected += values.selectedProductIds.filter(
      (productId) => values.productBundleById[productId] === bundle.id,
    ).length;
  }

  return { selected, total };
}

/** First selected bundle in the tab, keep “all”, or keep current if still valid. */
export function resolveActiveCategoryBundleId(
  bundles: StorefrontCategoryBundle[],
  selectedCategoryIds: string[],
  tab: StorefrontBundleTabKey,
  currentActiveId: string | null,
): string | null {
  const selectedBundles = getSelectedTabBundles(
    bundles,
    selectedCategoryIds,
    tab,
  );
  if (selectedBundles.length === 0) {
    return null;
  }
  if (currentActiveId === ALL_STOREFRONT_PRODUCTS_CATEGORY_FILTER) {
    return currentActiveId;
  }
  if (
    currentActiveId &&
    selectedBundles.some((bundle) => bundle.id === currentActiveId)
  ) {
    return currentActiveId;
  }
  return selectedBundles[0].id;
}

export function resolveProductCategoryIds(
  activeCategoryFilterId: string | null,
  selectedBundles: StorefrontCategoryBundle[],
): string[] {
  if (activeCategoryFilterId === ALL_STOREFRONT_PRODUCTS_CATEGORY_FILTER) {
    const categoryIds = selectedBundles
      .filter((bundle) => bundle.productCount > 0)
      .map((bundle) => parseBundleCategoryId(bundle.id).categoryId)
      .filter((categoryId): categoryId is string => Boolean(categoryId));
    return [...new Set(categoryIds)];
  }

  if (!activeCategoryFilterId) {
    return [];
  }

  const activeBundle = selectedBundles.find(
    (bundle) => bundle.id === activeCategoryFilterId,
  );
  if (!activeBundle || activeBundle.productCount === 0) {
    return [];
  }

  const { categoryId } = parseBundleCategoryId(activeCategoryFilterId);
  return categoryId ? [categoryId] : [];
}

export function filterItemsBySearch<T>(
  items: T[],
  search: string,
  getSearchText: (item: T) => string,
): T[] {
  const query = search.trim().toLowerCase();
  if (!query) {
    return items;
  }

  return items.filter((item) =>
    getSearchText(item).toLowerCase().includes(query),
  );
}

export function buildStorefrontBundleTabItems(
  merchandiseLabel: string,
  giftCardsLabel: string,
  tabKeys: readonly StorefrontBundleTabKey[] = STOREFRONT_BUNDLE_TAB_KEYS,
) {
  return tabKeys.map((key) => ({
    key,
    label: key === 'merchandise' ? merchandiseLabel : giftCardsLabel,
    content: null,
  }));
}

export function buildProductsQueryScopeKey(
  selectedCategoryIds: string[],
  productsTab: StorefrontBundleTabKey,
  activeCategoryFilterId: string | null,
): string {
  const sortedCategoryIds = [...selectedCategoryIds].sort((a, b) =>
    a.localeCompare(b),
  );
  return JSON.stringify({
    selectedCategoryIds: sortedCategoryIds,
    productsTab,
    activeCategoryFilterId,
  });
}
