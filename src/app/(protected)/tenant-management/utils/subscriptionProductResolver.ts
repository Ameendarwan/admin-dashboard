import type {
  SubscribableProduct,
  TenantSubscription,
} from '@/types/subscriptionsAdminApi';

function formatProductNameForDisplay(name: string): string {
  return name.trim().replaceAll(/[-_]/g, ' ').replace(/\s+/g, ' ');
}

/** e.g. `rewards-portal` → `REWARDS PORTAL` (subscription list) */
export function formatSubscriptionProductDisplayName(name: string): string {
  return formatProductNameForDisplay(name).toUpperCase();
}

/** e.g. `rewards-portal` → `Rewards portal` (dropdown / review) */
export function formatSubscriptionProductDropdownLabel(name: string): string {
  const normalized = formatProductNameForDisplay(name);
  if (!normalized) {
    return '';
  }
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

/** Payment catalog `products.name` for the Storefront product (admin-be aligned). */
export const STOREFRONT_SUBSCRIPTION_PRODUCT_NAME = 'storefront';

/** Payment catalog `products.name` values shown in admin subscription UI. */
export const ALLOWED_SUBSCRIPTION_PRODUCT_NAMES = [
  'lms',
  'innovation',
  'travelx',
  STOREFRONT_SUBSCRIPTION_PRODUCT_NAME,
  'rewards-portal',
] as const;

const ALLOWED_NAME_SET = new Set<string>(ALLOWED_SUBSCRIPTION_PRODUCT_NAMES);

const NAME_ORDER = new Map<string, number>(
  ALLOWED_SUBSCRIPTION_PRODUCT_NAMES.map((name, index) => [name, index]),
);

export function normalizeSubscriptionProductName(name: string): string {
  return name.trim().toLowerCase().replaceAll('_', '-');
}

export function isAllowedSubscriptionProductName(name: string): boolean {
  return ALLOWED_NAME_SET.has(normalizeSubscriptionProductName(name));
}

export function filterSubscribableProductsForAdmin(
  products: SubscribableProduct[],
): SubscribableProduct[] {
  return products
    .filter(
      (product) =>
        product.isActive === true &&
        product.name &&
        isAllowedSubscriptionProductName(product.name),
    )
    .sort((a, b) => {
      const orderA =
        NAME_ORDER.get(normalizeSubscriptionProductName(a.name)) ?? 999;
      const orderB =
        NAME_ORDER.get(normalizeSubscriptionProductName(b.name)) ?? 999;
      return orderA - orderB;
    });
}

export type SubscribableProductDropdownOption = {
  value: string;
  label: string;
};

export function buildSubscribableProductDropdownOptions(
  products: SubscribableProduct[],
): SubscribableProductDropdownOption[] {
  return filterSubscribableProductsForAdmin(products).map((product) => ({
    value: product.id,
    label: formatSubscriptionProductDropdownLabel(product.name),
  }));
}

export function findSubscribableProductById(
  products: SubscribableProduct[],
  productId: string,
): SubscribableProduct | undefined {
  return products.find((product) => product.id === productId);
}

/** Product IDs already covered by an existing payment subscription for this tenant. */
export function getExcludedSubscribableProductIds(
  subscriptions: TenantSubscription[],
): Set<string> {
  const excluded = new Set<string>();

  for (const subscription of subscriptions) {
    if (subscription.productId) {
      excluded.add(subscription.productId);
    }
  }

  return excluded;
}

function readMetadataString(
  metadata: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const value = metadata?.[key];
  return typeof value === 'string' ? value : undefined;
}

/** Payment product name for an existing subscription (catalog or legacy metadata). */
export function resolveSubscriptionProductName(
  subscription: TenantSubscription,
  subscribableProducts: SubscribableProduct[] = [],
): string | undefined {
  const catalogProduct = subscribableProducts.find(
    (product) => product.id === subscription.productId,
  );
  if (catalogProduct?.name) {
    return catalogProduct.name;
  }
  if (subscription.product?.name) {
    return subscription.product.name;
  }
  const paymentProductName = readMetadataString(
    subscription.metadata,
    'paymentProductName',
  );
  if (paymentProductName) {
    return paymentProductName;
  }
  const legacySlug = readMetadataString(
    subscription.metadata,
    'portalProductSlug',
  );
  if (legacySlug === 'travel-shop') {
    return 'travelx';
  }
  return legacySlug;
}

export function isSelectedSubscribableProductAllowed(
  productId: string,
  subscribableProducts: SubscribableProduct[],
): boolean {
  return filterSubscribableProductsForAdmin(subscribableProducts).some(
    (product) => product.id === productId,
  );
}

export function isStorefrontSubscriptionProductName(
  name: string | undefined,
): boolean {
  if (!name?.trim()) {
    return false;
  }
  return (
    normalizeSubscriptionProductName(name) ===
    STOREFRONT_SUBSCRIPTION_PRODUCT_NAME
  );
}

/** Whether the tenant has a non-cancelled Storefront payment subscription. */
export function tenantHasStorefrontSubscription(
  subscriptions: TenantSubscription[],
  subscribableProducts: SubscribableProduct[] = [],
): boolean {
  return subscriptions.some((subscription) => {
    if (subscription.status === 'cancelled' || subscription.deletedAt) {
      return false;
    }

    const productName = resolveSubscriptionProductName(
      subscription,
      subscribableProducts,
    );
    return isStorefrontSubscriptionProductName(productName);
  });
}
