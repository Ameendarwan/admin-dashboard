import {
  CATALOG_RETURN_TO_QUERY,
  isSafeCatalogReturnTo,
  readSafeCatalogReturnTo,
} from '@/app/(protected)/catalog-management/utils/catalogListingsRoute';

/** Query param when navigating from listing detail offers table (seller name known in UI). */
export const OFFER_DETAIL_SELLER_NAME_QUERY = 'sellerName';

/** Encoded `/catalog/...` path to restore listings pagination when leaving offer detail. */
export const OFFER_DETAIL_RETURN_TO_QUERY = CATALOG_RETURN_TO_QUERY;

export type CatalogOfferDetailHrefOptions = {
  sellerName?: string;
  returnTo?: string;
};

export function isDisplayableSellerName(
  value: string | undefined | null,
): value is string {
  const trimmed = value?.trim();
  return Boolean(trimmed && trimmed !== '—');
}

export function catalogOfferDetailHref(
  offerId: string,
  sellerNameOrOpts?: string | CatalogOfferDetailHrefOptions,
): string {
  let sellerName: string | undefined;
  let returnTo: string | undefined;

  if (typeof sellerNameOrOpts === 'string') {
    sellerName = sellerNameOrOpts;
  } else if (sellerNameOrOpts) {
    sellerName = sellerNameOrOpts.sellerName;
    returnTo = sellerNameOrOpts.returnTo;
  }

  const path = `/catalog-management/offers/${offerId}`;
  const params = new URLSearchParams();

  if (isDisplayableSellerName(sellerName)) {
    params.set(OFFER_DETAIL_SELLER_NAME_QUERY, sellerName.trim());
  }

  if (returnTo && isSafeCatalogReturnTo(returnTo)) {
    params.set(OFFER_DETAIL_RETURN_TO_QUERY, encodeURIComponent(returnTo));
  }

  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function readOfferDetailSellerNameParam(
  searchParams: Pick<URLSearchParams, 'get'>,
): string | null {
  const raw = searchParams.get(OFFER_DETAIL_SELLER_NAME_QUERY);
  if (!raw) {
    return null;
  }
  try {
    const decoded = decodeURIComponent(raw).trim();
    return decoded || null;
  } catch {
    const trimmed = raw.trim();
    return trimmed || null;
  }
}

export function readOfferDetailReturnToParam(
  searchParams: Pick<URLSearchParams, 'get'>,
): string | null {
  return readSafeCatalogReturnTo(
    searchParams.get(OFFER_DETAIL_RETURN_TO_QUERY),
  );
}
