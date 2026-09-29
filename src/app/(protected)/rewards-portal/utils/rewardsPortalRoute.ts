export function rewardsPortalTenantDetailHref(
  profileId: string,
  query: {
    tenantId: string;
    name: string;
    email: string;
    accountManager: string;
    country: string;
    status?: string;
  },
): string {
  const params = new URLSearchParams({
    tenantId: query.tenantId,
    name: query.name,
    email: query.email,
    accountManager: query.accountManager,
    country: query.country,
  });
  if (query.status?.trim()) {
    params.set('status', query.status.trim());
  }
  return `/rewards-portal/${profileId}?${params.toString()}`;
}

export function buildRewardsPortalReturnTo(
  pathname: string,
  search: string,
): string {
  if (!search) {
    return pathname;
  }
  const qs = search.startsWith('?') ? search : `?${search}`;
  return `${pathname}${qs}`;
}

export function rewardsPortalActivationRequestDetailHref(
  requestId: string,
  returnTo?: string,
): string {
  const base = `/gift-card-management/activation-requests/${encodeURIComponent(requestId)}`;
  const params = new URLSearchParams();
  // Tenant context is already on the rewards-portal page — hide duplicate section.
  params.set('hideTenant', '1');
  if (returnTo) {
    params.set('returnTo', returnTo);
  }
  return `${base}?${params.toString()}`;
}
