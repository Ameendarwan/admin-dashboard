export const SAUDI_TIMEZONE = 'Asia/Riyadh';
export const SAUDI_TZ_LABEL = '(KSA)';

type DateSortable = {
  updatedAt?: string | null;
  createdAt?: string | null;
};

/**
 * Compare two date strings using `updatedAt` first, then `createdAt`.
 * Returns the sort result based on the requested direction.
 */
export const compareByUpdatedOrCreated = (
  a: DateSortable,
  b: DateSortable,
  order: 'asc' | 'desc',
): number => {
  const dateA = new Date(a.updatedAt || a.createdAt || '').getTime();
  const dateB = new Date(b.updatedAt || b.createdAt || '').getTime();
  return order === 'asc' ? dateA - dateB : dateB - dateA;
};

/**
 * Sorts an array in place by updatedAt/createdAt and returns it.
 */
export function sortByUpdatedOrCreated<T extends DateSortable>(
  data: T[],
  order: 'asc' | 'desc',
): T[] {
  if (order === 'asc' || order === 'desc') {
    data.sort((a, b) => compareByUpdatedOrCreated(a, b, order));
  }
  return data;
}

/**
 * Format a date as a human-readable relative time, e.g. "2 hours ago".
 * Accepts either an ISO string or a Date instance.
 */
export function formatRelativeTimeAgo(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(dateObj.getTime())) {
    return String(date);
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  // Fallback to locale date if older than a week
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function formatDateTimeInTimeZone(
  value: string,
  timeZone: string = SAUDI_TIMEZONE,
): string {
  if (!value || value === '-') return '-';

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(d);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';
  const yyyy = get('year');
  const mm = get('month');
  const dd = get('day');
  const hh = get('hour');
  const mi = get('minute');
  const ss = get('second');

  if (timeZone === SAUDI_TIMEZONE) {
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`.trim();
  }
  const tzLabel = timeZone.split('/').pop() ?? '';
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss} ${tzLabel}`.trim();
}

export function formatPhoneUsDashed(value: string): string {
  if (!value) return '';

  const digits = value.replaceAll(/\D/g, '');
  const tenDigits = digits.length >= 10 ? digits.slice(-10) : digits;
  if (tenDigits.length !== 10) return value;

  return `${tenDigits.slice(0, 3)}-${tenDigits.slice(3, 6)}-${tenDigits.slice(6)}`;
}

export function formatDateDdMmYyOrRaw(raw: string | undefined): string {
  const s = raw?.trim();
  if (!s) return '';
  const parsed = new Date(s);
  if (Number.isNaN(parsed.getTime())) return s;
  const dd = String(parsed.getDate()).padStart(2, '0');
  const mm = String(parsed.getMonth() + 1).padStart(2, '0');
  const yy = String(parsed.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}
