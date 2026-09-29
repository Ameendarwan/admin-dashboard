/** Build `datetime-local` value from an ISO-8601 instant (stores wall clock in browser local TZ). */
export function isoUtcToDatetimeLocal(isoUtc: string): string {
  const d = new Date(isoUtc);
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${String(d.getFullYear())}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Interpret `datetime-local` as local wall time and encode as UTC ISO instant. */
export function datetimeLocalToIsoUtc(local: string): string | undefined {
  const trimmed = local.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed.toISOString();
}
