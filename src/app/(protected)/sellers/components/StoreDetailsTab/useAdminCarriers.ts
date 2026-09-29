import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getCarriers } from '@/services/sellerService';
import type { AdminCarriersResponse } from '@/types/sellerAdminShipping';
import { logError } from '@/utils/errorLogger';

export function useAdminCarriers() {
  const query = useQuery<AdminCarriersResponse>({
    queryKey: ['admin-carriers'],
    queryFn: () => getCarriers(),
  });

  useEffect(() => {
    if (query.isError && query.error) {
      logError('Admin carriers list load failed', query.error);
    }
  }, [query.isError, query.error]);

  return query;
}
