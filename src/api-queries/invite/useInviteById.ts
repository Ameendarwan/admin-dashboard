import { useQuery } from '@tanstack/react-query';

import { getInviteById } from '@/services/inviteSevice';

/**
 * Hook to fetch invite by ID
 */
export const useInviteById = (inviteId: string) => {
  return useQuery({
    queryKey: ['invite', inviteId],
    queryFn: () => getInviteById(inviteId),
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
