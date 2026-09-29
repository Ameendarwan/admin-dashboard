import { getProductLabel, PRODUCT_LABELS } from '@/constants/platform';

/**
 * Human label for Identity platform badges.
 * Uses `PRODUCT_LABELS` for known slugs; otherwise prefers `alias`, then raw `name`.
 */
export const getPlatformDisplayLabel = (platform: {
  name: string;
  alias?: string | null;
}): string => {
  const normalized = platform.name.trim().replaceAll('-', '_');
  if (PRODUCT_LABELS[normalized]) {
    return PRODUCT_LABELS[normalized];
  }
  const a = platform.alias?.trim();
  if (a && a.length > 0) {
    return a;
  }
  return getProductLabel(platform.name);
};

/** True when the tenant is assigned the given Identity platform slug (`platforms.name`). */
export const tenantHasPlatform = (
  tenant: { platforms?: Array<{ name: string }> | null },
  platformName: string,
): boolean =>
  Boolean(tenant.platforms?.some((platform) => platform.name === platformName));

/**
 * Keep only tenants assigned the given Identity platform slug (`platforms.name`).
 */
export const filterTenantsByPlatform = <
  T extends { platforms?: Array<{ name: string }> | null },
>(
  tenants: T[],
  platformName: string,
): T[] => tenants.filter((tenant) => tenantHasPlatform(tenant, platformName));
