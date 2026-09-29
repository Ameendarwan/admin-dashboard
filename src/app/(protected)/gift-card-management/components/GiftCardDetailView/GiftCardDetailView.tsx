'use client';

import { DetailsPageHeader } from '@/components/DetailsPageHeader';
import type { GiftCardDetail } from '@/types/catalog';

import { GiftCardTermsAndConditionsDialog } from '../GiftCardTermsAndConditionsDialog';
import {
  GiftCardDetailSummaryCard,
  // GiftCardSalesChannelSection,
} from './components';
import { useGiftCardDetailView } from './hooks';

interface GiftCardDetailViewProps {
  detail: GiftCardDetail;
  translate: (key: string, values?: Record<string, string | number>) => string;
  salesChannelsLoading?: boolean;
  salesChannelsError?: boolean;
  salesChannelsRetrying?: boolean;
  togglingSalesChannelId?: string | null;
  togglingSalesChannelActive?: boolean | null;
  onSalesChannelToggle?: (salesChannelId: string, active: boolean) => void;
  onRetrySalesChannels?: () => void;
  onBackClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export function GiftCardDetailView({
  detail,
  translate,
  // salesChannelsLoading = false,
  // salesChannelsError = false,
  // salesChannelsRetrying = false,
  // togglingSalesChannelId = null,
  // togglingSalesChannelActive = null,
  // onSalesChannelToggle,
  // onRetrySalesChannels,
  onBackClick,
}: Readonly<GiftCardDetailViewProps>) {
  const { termsDialogOpen, openTermsDialog, closeTermsDialog } =
    useGiftCardDetailView();

  return (
    <div className="min-h-0" id="gift-card-detail-page">
      <div className="space-y-6">
        <DetailsPageHeader
          title={translate('giftCardManagement.giftCardDetail.pageTitle')}
          onBackClick={onBackClick}
        />

        <GiftCardDetailSummaryCard
          detail={detail}
          translate={translate}
          onTermsClick={openTermsDialog}
        />

        {/* <GiftCardSalesChannelSection
          detail={detail}
          translate={translate}
          loading={salesChannelsLoading}
          error={salesChannelsError}
          retrying={salesChannelsRetrying}
          togglingSalesChannelId={togglingSalesChannelId}
          togglingSalesChannelActive={togglingSalesChannelActive}
          onToggle={(salesChannelId, active) => {
            onSalesChannelToggle?.(salesChannelId, active);
          }}
          onRetry={() => {
            onRetrySalesChannels?.();
          }}
        /> */}
      </div>

      <GiftCardTermsAndConditionsDialog
        isOpen={termsDialogOpen}
        onClose={closeTermsDialog}
      />
    </div>
  );
}
