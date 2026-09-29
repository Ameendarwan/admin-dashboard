export type CreateStorefrontStepIndex = 0 | 1 | 2;

export type StorefrontBundleTabKey = 'merchandise' | 'giftCards';

export type StorefrontCurrency = 'SAR' | 'AED';

export interface CreateStorefrontFormValues {
  tenantId: string;
  storefrontName: string;
  urlSlug: string;
  region: string;
  currency: StorefrontCurrency;
  floatBalance: string;
  lowFloatThreshold: string;
  selectedCategoryIds: string[];
  selectedProductIds: string[];
  /** Maps selected product id → wizard bundle id (`pcat_…:merchandise|giftCards`). */
  productBundleById: Record<string, string>;
  /** Bundle ids where the user chose “select all” for the entire PIM category. */
  allProductsBundleIds: string[];
  bundleTab: StorefrontBundleTabKey;
  productsTab: StorefrontBundleTabKey;
  activeCategoryFilterId: string | null;
  /** Per merchandise/gift-card tab category filter (bundle id or `all`). */
  productsCategoryFilterByTab: Record<StorefrontBundleTabKey, string | null>;
}

export interface StorefrontCategoryBundle {
  id: string;
  name: string;
  isGiftcard: boolean;
  productCount: number;
}

export interface StorefrontProductRow {
  id: string;
  name: string;
  category: string;
  bundleId: string;
  imageUrl: string;
  lowestPrice: number | null;
  currency: string;
}

export interface StorefrontSuccessSummary {
  storefrontName: string;
  urlSlug: string;
  tenantName: string;
  totalProducts: number;
  categoryNames: string[];
}
