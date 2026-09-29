export function readCatalogQueryParam(
  searchParams: URLSearchParams,
  key: string,
  allowed: readonly string[],
  fallback: string,
) {
  const value = searchParams.get(key);
  return value && allowed.includes(value) ? value : fallback;
}

/** 1-based page index from `?page=`; invalid or missing values fall back to `1`. */
export function readCatalogPageQueryParam(
  searchParams: Pick<URLSearchParams, 'get'>,
  key = 'page',
): number {
  const raw = searchParams.get(key);
  if (!raw) {
    return 1;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
}
