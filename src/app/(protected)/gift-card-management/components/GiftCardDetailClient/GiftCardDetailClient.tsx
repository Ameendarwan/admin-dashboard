'use client';

import { toast } from '@merit-incentives/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import {
  useGiftCardSalesChannelsQuery,
  useSetGiftCardSalesChannelMutation,
} from '@/api-queries/catalog/gift-cards/useGiftCardSalesChannels';
import { useGiftCardDetailQuery } from '@/app/(protected)/gift-card-management/hooks/useGiftCardDetailQuery';
import { Spinner } from '@/components/Spinner';
import { TableStateDisplay } from '@/components/TableStateDisplay';
import { useLocalization } from '@/hooks/useLocalization';

import { GiftCardDetailView } from '../GiftCardDetailView';

interface GiftCardDetailClientProps {
  productId: string;
}

export function GiftCardDetailClient({
  productId,
}: Readonly<GiftCardDetailClientProps>) {
  const { translate } = useLocalization('catalog');
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    data: detail,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGiftCardDetailQuery(productId);
  const {
    data: salesChannelsData,
    isLoading: salesChannelsLoading,
    isError: salesChannelsError,
    isFetching: salesChannelsFetching,
    refetch: refetchSalesChannels,
  } = useGiftCardSalesChannelsQuery(productId);
  const setSalesChannelMutation = useSetGiftCardSalesChannelMutation(productId);

  const returnTo = searchParams.get('returnTo');
  const backHref = returnTo ?? '/gift-card-management?tab=gift-cards';

  const detailWithChannels = useMemo(() => {
    if (!detail) {
      return null;
    }
    return {
      ...detail,
      salesChannels: salesChannelsData?.rows ?? [],
    };
  }, [detail, salesChannelsData?.rows]);

  if (isLoading) {
    return (
      <Spinner
        fullHeight
        text={translate('giftCardManagement.giftCardDetail.loading')}
      />
    );
  }

  if (isError || !detailWithChannels) {
    return (
      <TableStateDisplay
        type="error"
        title={translate('giftCardManagement.giftCardDetail.notFound')}
        description=""
        showRetryButton
        onRetry={() => {
          void refetch();
        }}
        retryLoading={isFetching}
        retryButtonText={translate(
          'giftCardManagement.giftCardDetail.backToList',
        )}
      />
    );
  }

  return (
    <GiftCardDetailView
      detail={detailWithChannels}
      translate={translate}
      salesChannelsLoading={salesChannelsLoading}
      salesChannelsError={salesChannelsError}
      salesChannelsRetrying={salesChannelsFetching && !salesChannelsLoading}
      togglingSalesChannelId={
        setSalesChannelMutation.isPending
          ? (setSalesChannelMutation.variables?.salesChannelId ?? null)
          : null
      }
      togglingSalesChannelActive={
        setSalesChannelMutation.isPending
          ? (setSalesChannelMutation.variables?.active ?? null)
          : null
      }
      onSalesChannelToggle={(salesChannelId, active) => {
        if (active && !detailWithChannels.categoryId) {
          toast.error(
            translate(
              'giftCardManagement.giftCardDetail.salesChannel.missingCategoryId',
            ),
          );
          return;
        }
        setSalesChannelMutation.mutate(
          {
            salesChannelId,
            active,
            categoryId: detailWithChannels.categoryId ?? undefined,
          },
          {
            onError: () => {
              toast.error(
                translate(
                  'giftCardManagement.giftCardDetail.salesChannel.updateError',
                ),
              );
            },
          },
        );
      }}
      onRetrySalesChannels={() => {
        void refetchSalesChannels();
      }}
      onBackClick={() => {
        router.push(backHref);
      }}
    />
  );
}
