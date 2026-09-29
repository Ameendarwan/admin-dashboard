import type { QueryClient } from '@tanstack/react-query';

import { catalogQueryKeys } from '@/api-queries/catalog/catalogQueryKeys';

/** Refetch all Offers tab list queries (every page/search). */
export function invalidateCatalogActiveOffers(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({
    queryKey: [...catalogQueryKeys.all, 'active-offers'],
  });
}
