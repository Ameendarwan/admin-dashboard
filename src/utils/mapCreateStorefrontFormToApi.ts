import type {
  CreateStorefrontBody,
  CreateStorefrontCategoryBody,
  StorefrontCategoryType,
} from '@/types/storefrontAdminApi';
import type {
  CreateStorefrontFormValues,
  StorefrontCategoryBundle,
} from '@/types/createStorefrontForm';
import {
  bundleHasProductSelection,
  parseBundleCategoryId,
  parsePositiveAmount,
} from '@/utils/createStorefrontFormHelpers';

function resolveCategoryPayload(
  bundleId: string,
  bundle: StorefrontCategoryBundle | undefined,
  values: CreateStorefrontFormValues,
  sortOrder: number,
): CreateStorefrontCategoryBody | null {
  if (!bundle || !bundleHasProductSelection(bundleId, values)) {
    return null;
  }

  const { categoryId } = parseBundleCategoryId(bundleId);
  const type: StorefrontCategoryType = bundle.isGiftcard
    ? 'GIFTCARD'
    : 'MERCHANDISE';

  const base = {
    categoryId,
    name: bundle.name,
    type,
    sortOrder,
  };

  if (values.allProductsBundleIds.includes(bundleId)) {
    return {
      ...base,
      productSelectionMode: 'all',
      productCount: bundle.productCount,
    };
  }

  const productIds = values.selectedProductIds.filter(
    (productId) => values.productBundleById[productId] === bundleId,
  );

  if (productIds.length === 0) {
    return null;
  }

  return {
    ...base,
    productSelectionMode: 'specific',
    productIds,
  };
}

export function mapCreateStorefrontFormToApiBody(
  values: CreateStorefrontFormValues,
  bundles: StorefrontCategoryBundle[],
): CreateStorefrontBody {
  const floatBalance = parsePositiveAmount(values.floatBalance);
  const lowFloatThreshold = parsePositiveAmount(values.lowFloatThreshold);

  if (floatBalance === null || lowFloatThreshold === null) {
    throw new Error('Invalid storefront monetary fields');
  }

  const resolvedCategories = values.selectedCategoryIds
    .map((bundleId, sortOrder) => {
      const bundle = bundles.find((item) => item.id === bundleId);
      return resolveCategoryPayload(bundleId, bundle, values, sortOrder);
    })
    .filter(
      (category): category is CreateStorefrontCategoryBody => category !== null,
    )
    .map((category, sortOrder) => ({ ...category, sortOrder }));

  if (resolvedCategories.length === 0) {
    throw new Error(
      'No valid products for the selected categories. Gift card products require a gift card PIM category, and merchandise products require a merchandise category.',
    );
  }

  return {
    tenantId: values.tenantId.trim(),
    storeName: values.storefrontName.trim(),
    urlSlug: values.urlSlug.trim(),
    region: values.region.trim(),
    currency: values.currency,
    floatBalance,
    lowFloatThreshold,
    categories: resolvedCategories,
  };
}
