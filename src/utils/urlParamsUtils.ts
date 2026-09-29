/**
 * Appends a query param to URLSearchParams when value is present.
 * Skips when value is undefined/null/empty (or empty after trim when options.trim is true).
 * Arrays: appends each item with the same key (e.g. platformName=x&platformName=y).
 */
export function appendParam(
  params: URLSearchParams,
  key: string,
  value: string | number | string[] | undefined | null,
  options?: { trim?: boolean },
): void {
  if (value === undefined || value === null) return;
  if (Array.isArray(value)) {
    value.forEach((v) => params.append(key, String(v)));
    return;
  }
  const str = typeof value === 'number' ? value.toString() : value;
  const final = options?.trim ? str.trim() : str;
  if (final) params.append(key, final);
}
