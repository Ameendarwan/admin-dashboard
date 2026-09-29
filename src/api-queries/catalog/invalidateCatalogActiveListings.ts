import type { QueryClient } from '@tanstack/react-query';

import { catalogQueryKeys } from '@/api-queries/catalog/catalogQueryKeys';

/** Refetch all Active Listings tab queries (every page/search). */
export function invalidateCatalogActiveListings(
  queryClient: QueryClient,
): void {
  void queryClient.invalidateQueries({
    queryKey: [...catalogQueryKeys.all, 'active-listings'],
  });
}
