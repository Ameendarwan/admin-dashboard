const DEFAULT_STOREFRONT_APP_ROOT_DOMAIN = 'meritengage.com';
const DEFAULT_STOREFRONT_ENVIRONMENT = 'develop';

function getStorefrontPublicHostSuffix(): string {
  const rootDomain =
    process.env.NEXT_PUBLIC_STOREFRONT_APP_ROOT_DOMAIN?.trim() ||
    DEFAULT_STOREFRONT_APP_ROOT_DOMAIN;
  const environment =
    process.env.NEXT_PUBLIC_ENVIRONMENT?.trim() ||
    DEFAULT_STOREFRONT_ENVIRONMENT;

  if (environment === 'production') {
    return `storefront.${rootDomain}`;
  }

  return `storefront.${environment}.${rootDomain}`;
}

export function getStorefrontPublicHostSuffixForDisplay(): string {
  return getStorefrontPublicHostSuffix();
}

export function formatStorefrontPublicHost(urlSlug: string): string {
  const slug = urlSlug.trim();
  if (!slug) {
    return '';
  }

  return `${slug}.${getStorefrontPublicHostSuffix()}`;
}

export function buildStorefrontPublicUrl(urlSlug: string): string {
  const host = formatStorefrontPublicHost(urlSlug);
  if (!host) {
    return '';
  }

  return `https://${host}`;
}

export function formatStorefrontFloatBalance(
  currency: string,
  amount: string,
): string {
  const parsed = Number(amount.replaceAll(',', ''));
  const formatted = Number.isFinite(parsed) ? parsed.toLocaleString() : amount;
  return `${currency} ${formatted}`;
}

export function buildCreateStorefrontCreateRoute(
  tenantProfileId: string,
  tenantId: string,
  tenantName: string,
): string {
  const query = new URLSearchParams({
    tenantId,
    name: tenantName,
  });

  return `/tenant-management/${tenantProfileId}/storefront/new?${query.toString()}`;
}
