import { useMutation, useQueryClient } from '@tanstack/react-query';

import { resendInvite } from '@/services/inviteSevice';

export const useResendInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) => resendInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-invites'] });
      queryClient.invalidateQueries({ queryKey: ['invite'] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
};
