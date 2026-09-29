import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateBannerConfigWithImage } from '@/services/superAppService';
import { BannerConfigListItem } from '@/types/superApp';

interface UpdateBannerConfigParams {
  configId: string;
  configKey: string;
  currentVersion: number;
  imageFile: File;
  updates?: {
    label?: string;
    deepLink?: string;
    position?: number;
  };
}

/**
 * Hook for complete workflow: Upload image and update existing banner config
 * Automatically invalidates banner-configs queries on success
 */
export const useUpdateBannerConfig = () => {
  const queryClient = useQueryClient();

  return useMutation<BannerConfigListItem, Error, UpdateBannerConfigParams>({
    mutationFn: ({ configId, configKey, currentVersion, imageFile, updates }) =>
      updateBannerConfigWithImage(
        configId,
        configKey,
        currentVersion,
        imageFile,
        updates,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banner-configs'] });
    },
  });
};
