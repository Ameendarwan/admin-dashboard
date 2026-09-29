import type { MappedSellerInvite } from '@/types/invite';

/**
 * Seller detail page loads data with `tenantId` only (no invite fetch).
 * Onboarded list rows use `tenant.id` as `id` and set `metadata.tenantId`;
 * prefer explicit tenantId when present.
 */
export function getTenantIdForSellerDetailRoute(
  seller: MappedSellerInvite,
): string {
  const m = seller.metadata;
  if (m && typeof m === 'object' && 'tenantId' in m) {
    const tid = (m as { tenantId?: unknown }).tenantId;
    if (typeof tid === 'string' && tid.trim() !== '') return tid;
  }
  return seller.id;
}

/**
 * Path for seller detail; optional `email` query matches list row and fills the
 * profile email field when API omits it.
 */
export function buildSellerDetailHref(
  tenantId: string,
  email?: string | null,
): string {
  const id = tenantId.trim();
  const path = `/sellers/${encodeURIComponent(id)}`;
  const trimmed = email?.trim();
  if (!trimmed) return path;
  return `${path}?email=${encodeURIComponent(trimmed)}`;
}

/**
 * Reads and decodes the `email` search param for the seller detail page.
 */
export function getSellerDetailEmailFromSearchParams(searchParams: {
  get: (name: string) => string | null;
}): string {
  const raw = searchParams.get('email');
  if (!raw?.trim()) return '';
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim();
  }
}
