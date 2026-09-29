/** Derives page count when seller-portal omits totalPages but sends total + limit. */
export function normalizedListingRequestsTotalPages(
  total: number,
  rawTotalPages: number | undefined,
  pageSize: number,
): number {
  const fromApi =
    typeof rawTotalPages === 'number'
      ? rawTotalPages
      : Math.ceil(total / pageSize);
  return Math.max(1, Number.isFinite(fromApi) ? fromApi : 1);
}
