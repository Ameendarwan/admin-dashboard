'use client';

import { useQuery } from '@tanstack/react-query';

import { catalogQueryKeys } from '@/api-queries/catalog/catalogQueryKeys';
import { giftCardDetailFromApi } from '@/app/(protected)/gift-card-management/lib/giftCardDetailFromApi';
import type { GiftCardDetail } from '@/types/catalog';
import { getCatalogProduct } from '@/services/catalogAdminService';
import { TIME_5_MIN } from '@/utils/timeUtils';

export function useGiftCardDetailQuery(productId: string) {
  const trimmed = productId.trim();

  return useQuery({
    queryKey: catalogQueryKeys.giftCardDetail(trimmed),
    queryFn: async (): Promise<GiftCardDetail | null> => {
      const raw = await getCatalogProduct(trimmed);
      return giftCardDetailFromApi(raw);
    },
    enabled: Boolean(trimmed),
    staleTime: TIME_5_MIN,
    gcTime: TIME_5_MIN,
  });
}
