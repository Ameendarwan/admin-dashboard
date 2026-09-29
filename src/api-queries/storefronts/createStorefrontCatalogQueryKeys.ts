/** Wizard-only catalog picker keys — kept separate from storefront list invalidation. */
const createStorefrontCatalogRoot = ['create-storefront-catalog'] as const;

export const createStorefrontCatalogQueryKeys = {
  all: createStorefrontCatalogRoot,
  categoryBundles: [
    ...createStorefrontCatalogRoot,
    'category-bundles',
  ] as const,
  products: (
    scopeKey: string,
    categoryIds: string[],
    isGiftcard: boolean,
    search: string,
    page: number,
    pageSize: number,
  ) =>
    [
      ...createStorefrontCatalogRoot,
      'products',
      {
        scopeKey,
        categoryIds: [...categoryIds].sort((a, b) => a.localeCompare(b)),
        isGiftcard,
        search,
        page,
        pageSize,
      },
    ] as const,
};
