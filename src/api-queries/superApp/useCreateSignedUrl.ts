import { useMutation } from '@tanstack/react-query';

import { createSignedUrl } from '@/services/superAppService';
import { CreateSignedUrlRequest, SignedUrlResponse } from '@/types/superApp';

/**
 * Hook to generate a signed URL for uploading an image file
 */
export const useCreateSignedUrl = () => {
  return useMutation<SignedUrlResponse, Error, CreateSignedUrlRequest>({
    mutationFn: createSignedUrl,
  });
};
