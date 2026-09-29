import { useQuery } from '@tanstack/react-query';

import { fetchSellerCustomerProfile } from '@/services/sellerService';

export const useSellerCustomerProfile = (
  sellerTenantId: string | undefined,
) => {
  return useQuery({
    queryKey: ['seller-customer-profile', sellerTenantId],
    queryFn: () => fetchSellerCustomerProfile(sellerTenantId),
    enabled: Boolean(sellerTenantId),
    gcTime: 10 * 60 * 1000,
  });
};
