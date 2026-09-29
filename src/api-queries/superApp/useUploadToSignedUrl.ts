import { useMutation } from '@tanstack/react-query';

import { uploadFileToSignedUrl } from '@/services/superAppService';

interface UploadToSignedUrlParams {
  signedUrl: string;
  file: File;
  fileType: string;
}

/**
 * Hook to upload a file to a pre-signed URL
 */
export const useUploadToSignedUrl = () => {
  return useMutation<void, Error, UploadToSignedUrlParams>({
    mutationFn: ({ signedUrl, file, fileType }) =>
      uploadFileToSignedUrl(signedUrl, file, fileType),
  });
};
