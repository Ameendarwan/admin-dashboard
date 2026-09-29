import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { catalogQueryKeys } from '@/api-queries/catalog/catalogQueryKeys';
import {
  listGiftCardSalesChannels,
  setGiftCardSalesChannelActive,
} from '@/services/catalogAdminService';
import type { GiftCardSalesChannelsResponseDto } from '@/types/catalog';

export function useGiftCardSalesChannelsQuery(productId: string) {
  const trimmed = productId.trim();

  return useQuery({
    queryKey: catalogQueryKeys.giftCardSalesChannels(trimmed),
    queryFn: () => listGiftCardSalesChannels(trimmed),
    enabled: trimmed.length > 0,
  });
}

type SetGiftCardSalesChannelVariables = {
  salesChannelId: string;
  active: boolean;
  categoryId?: string;
};

export function useSetGiftCardSalesChannelMutation(productId: string) {
  const trimmed = productId.trim();
  const queryClient = useQueryClient();
  const queryKey = catalogQueryKeys.giftCardSalesChannels(trimmed);

  return useMutation({
    mutationFn: ({
      salesChannelId,
      active,
      categoryId,
    }: SetGiftCardSalesChannelVariables) =>
      setGiftCardSalesChannelActive(
        trimmed,
        salesChannelId,
        active,
        categoryId,
      ),
    // Optimistic update: flip the toggle immediately, reconcile with server result on success, rollback on error.
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });

      const previous =
        queryClient.getQueryData<GiftCardSalesChannelsResponseDto>(queryKey);

      queryClient.setQueryData<GiftCardSalesChannelsResponseDto>(
        queryKey,
        (current) => {
          if (!current) {
            return current;
          }
          return {
            ...current,
            rows: current.rows.map((row) =>
              row.id === variables.salesChannelId
                ? { ...row, active: variables.active }
                : row,
            ),
          };
        },
      );

      return { previous };
    },
    onSuccess: (result) => {
      queryClient.setQueryData<GiftCardSalesChannelsResponseDto>(
        queryKey,
        (current) => {
          if (!current) {
            return current;
          }
          return {
            ...current,
            rows: current.rows.map((row) =>
              row.id === result.salesChannelId
                ? { ...row, active: result.active }
                : row,
            ),
          };
        },
      );
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      void queryClient.invalidateQueries({ queryKey });
    },
    onSettled: (_data, error) => {
      if (!error) {
        void queryClient.invalidateQueries({
          queryKey,
          refetchType: 'none',
        });
      }
    },
  });
}
