export function giftCardActivationRequestDetailHref(
  requestId: string,
  returnTo?: string,
): string {
  const base = `/gift-card-management/activation-requests/${requestId}`;
  if (!returnTo) return base;
  return `${base}?returnTo=${encodeURIComponent(returnTo)}`;
}

export function buildGiftCardsReturnTo(
  pathname: string,
  search: string,
): string {
  if (!search) {
    return pathname;
  }
  const qs = search.startsWith('?') ? search : `?${search}`;
  return `${pathname}${qs}`;
}

export function giftCardDetailHref(
  productId: string,
  returnTo?: string,
): string {
  const base = `/gift-card-management/${encodeURIComponent(productId)}`;
  if (!returnTo) {
    return base;
  }
  return `${base}?returnTo=${encodeURIComponent(returnTo)}`;
}
