import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createBannerConfigWithImage } from '@/services/superAppService';
import { BannerConfigListItem } from '@/types/superApp';

interface CreateBannerConfigParams {
  key: string;
  position: number;
  type: 'banner' | 'icon';
  label: string;
  imageFile: File;
  deepLink?: string;
}

/**
 * Hook for complete workflow: Upload image and create banner config
 * Automatically invalidates banner-configs queries on success
 */
export const useCreateBannerConfig = () => {
  const queryClient = useQueryClient();

  return useMutation<BannerConfigListItem, Error, CreateBannerConfigParams>({
    mutationFn: ({ key, position, type, label, imageFile, deepLink }) =>
      createBannerConfigWithImage(
        key,
        position,
        type,
        label,
        imageFile,
        deepLink,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banner-configs'] });
    },
  });
};
