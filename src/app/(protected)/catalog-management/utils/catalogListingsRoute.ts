import {
  CATALOG_PRIMARY_TAB_LISTINGS,
  CATALOG_PRIMARY_TAB_OFFERS,
} from '@/app/(protected)/catalog-management/constants/catalogListingsConstants';
import { CATALOG_FILTER_URL_KEYS } from '@/app/(protected)/catalog-management/constants/catalogListFilterKeys';
import { readCatalogPageQueryParam } from '@/app/(protected)/catalog-management/utils/queryParams';

const CATALOG_PATH_PREFIX = '/catalog-management/';

export const CATALOG_PAGE_QUERY = 'page';
export const CATALOG_RETURN_TO_QUERY = 'returnTo';

export type CatalogListingsMainTab =
  | typeof CATALOG_PRIMARY_TAB_LISTINGS
  | typeof CATALOG_PRIMARY_TAB_OFFERS;
export type CatalogListingsSubTab = 'active' | 'requests';

/** Query keys synced between the listings page URL and catalog detail back navigation. */
export const CATALOG_LISTINGS_URL_KEYS = [
  'main',
  'sub',
  CATALOG_PAGE_QUERY,
  ...CATALOG_FILTER_URL_KEYS,
] as const;

const LEGACY_PAGE_QUERY_KEYS = ['listingsPage', 'requestsPage'] as const;

export function stripLegacyCatalogPageParams(params: URLSearchParams): void {
  for (const key of LEGACY_PAGE_QUERY_KEYS) {
    params.delete(key);
  }
}

export function readCatalogListingsPage(
  searchParams: Pick<URLSearchParams, 'get'>,
): number {
  return readCatalogPageQueryParam(searchParams, CATALOG_PAGE_QUERY);
}

export function writeCatalogPage(params: URLSearchParams, page: number): void {
  stripLegacyCatalogPageParams(params);
  const safePage = Math.max(1, Math.floor(page));
  if (safePage <= 1) {
    params.delete(CATALOG_PAGE_QUERY);
    return;
  }
  params.set(CATALOG_PAGE_QUERY, String(safePage));
}

export function snapshotCatalogListingsSearch(
  searchParams: Pick<URLSearchParams, 'get'>,
): string {
  const snapshot = new URLSearchParams();
  for (const key of CATALOG_LISTINGS_URL_KEYS) {
    const value = searchParams.get(key);
    if (value) {
      snapshot.set(key, value);
    }
  }

  if (!snapshot.get('main')) {
    snapshot.set('main', CATALOG_PRIMARY_TAB_OFFERS);
  }
  if (!snapshot.get('sub')) {
    snapshot.set('sub', 'active');
  }

  return snapshot.toString();
}

export function catalogListingsHref(search: string): string {
  return search
    ? `/catalog-management/listings?${search}`
    : '/catalog-management/listings';
}

export function buildCatalogListingsReturnTo(
  pathname: string,
  searchParams: Pick<URLSearchParams, 'toString'>,
): string {
  const search = searchParams.toString();
  return search ? `${pathname}?${search}` : pathname;
}

export function defaultCatalogListingsReturnTo(
  sub: CatalogListingsSubTab = 'active',
): string {
  const params = new URLSearchParams();
  params.set('main', CATALOG_PRIMARY_TAB_LISTINGS);
  params.set('sub', sub);
  return catalogListingsHref(params.toString());
}

export function defaultOffersListReturnTo(): string {
  return catalogListingsHref(
    snapshotCatalogListingsSearch(new URLSearchParams()),
  );
}

export function isSafeCatalogReturnTo(path: string): boolean {
  const trimmed = path.trim();
  if (!trimmed.startsWith(CATALOG_PATH_PREFIX)) {
    return false;
  }
  if (trimmed.includes('://') || trimmed.startsWith('//')) {
    return false;
  }
  return true;
}

export function readSafeCatalogReturnTo(
  raw: string | null | undefined,
): string | null {
  if (!raw) {
    return null;
  }
  try {
    const decoded = decodeURIComponent(raw).trim();
    return isSafeCatalogReturnTo(decoded) ? decoded : null;
  } catch {
    const trimmed = raw.trim();
    return isSafeCatalogReturnTo(trimmed) ? trimmed : null;
  }
}

export function readCatalogReturnToParam(
  searchParams: Pick<URLSearchParams, 'get'>,
): string | null {
  return readSafeCatalogReturnTo(searchParams.get(CATALOG_RETURN_TO_QUERY));
}

export function catalogDetailHref(path: string, returnTo?: string): string {
  if (!returnTo || !isSafeCatalogReturnTo(returnTo)) {
    return path;
  }
  const params = new URLSearchParams();
  params.set(CATALOG_RETURN_TO_QUERY, encodeURIComponent(returnTo));
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function catalogListingDetailHref(
  listingId: string,
  returnTo?: string,
): string {
  return catalogDetailHref(
    `/catalog-management/listings/${listingId}`,
    returnTo,
  );
}

export function catalogListingRequestDetailHref(
  requestId: string,
  returnTo?: string,
): string {
  return catalogDetailHref(
    `/catalog-management/listings/listing-requests/${requestId}`,
    returnTo,
  );
}
