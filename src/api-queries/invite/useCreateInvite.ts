import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createInvite } from '@/services/inviteSevice';
import { CreateInviteRequest } from '@/types/invite';

interface CreateInviteParams {
  request: CreateInviteRequest;
  file?: File;
}

export const useCreateInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ request, file }: CreateInviteParams) =>
      createInvite(request, file),
    onSuccess: () => {
      // Invalidate both seller and tenant queries
      queryClient.invalidateQueries({ queryKey: ['seller-invites'] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
};
