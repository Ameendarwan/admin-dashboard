import { useMutation, useQueryClient } from '@tanstack/react-query';

import { submitReviewRequest } from '@/services/reviewService';

export const useSubmitReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitReviewRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({
        queryKey: ['client-profile'],
      });
    },
  });
};
