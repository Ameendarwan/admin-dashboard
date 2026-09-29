import { identityApiClient } from '@/lib/apiClient';

export const fetchFullUserProfile = async (
  userId: string,
  tenantId: string,
) => {
  const response = await identityApiClient.get(
    `/tenants/${tenantId}/public/users/${userId}`,
  );
  return response.data;
};
