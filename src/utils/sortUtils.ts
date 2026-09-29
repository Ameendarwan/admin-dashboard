import { SortOrder } from '@/lib/enums';

/**
 * Converts string sort order to SortOrder enum. Returns undefined for invalid/empty values.
 */
export function toSortOrder(
  order: 'asc' | 'desc' | undefined | null,
): SortOrder | undefined {
  if (order === 'asc') return SortOrder.ASC;
  if (order === 'desc') return SortOrder.DESC;
  return undefined;
}
