'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { invalidateCatalogActiveOffers } from '@/api-queries/catalog/invalidateCatalogActiveOffers';
import { useOfferDetailPage } from '@/app/(protected)/catalog-management/hooks/useOfferDetailPage';
import { TableStateDisplay } from '@/components/TableStateDisplay';
import { Spinner } from '@/components';

import { EditOfferDialog } from '../EditOfferDialog';
import { catalogOfferLifecycleMessageKey } from '../../utils/listingStatusBadgeHelpers';
import { OfferDetailHeaderToolbar } from '../OfferDetailHeaderToolbar';
import { OfferDetailProductSection } from '../OfferDetailProductSection';
import { OfferDetailSpecsSection } from '../OfferDetailSpecsSection';

export function OfferDetailClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    translate,
    offerId,
    useLiveOffer,
    loading,
    loadError,
    detail,
    refetchLive,
    refreshOfferDetailSilent,
    mainImage,
    setMainImage,
    offerStatusUi,
    offerStatusSaving,
    offerStatusHeaderFrozen,
    handleOfferStatusChange,
    statusOptions,
    editOfferOpen,
    setEditOfferOpen,
    onEditOffer,
    editOfferNonce,
    sellerOfferHeading,
    listingsReturnTo,
    handleBackToListings,
  } = useOfferDetailPage();

  if (loading) {
    return <Spinner fullHeight />;
  }

  if (!detail) {
    return (
      <TableStateDisplay
        type="error"
        title={loadError ?? translate('notFound')}
        description={translate('notFoundHint')}
        showRetryButton
        onRetry={
          useLiveOffer ? refetchLive : () => router.push(listingsReturnTo)
        }
        retryButtonText={
          useLiveOffer ? translate('retry') || 'Retry' : translate('backToList')
        }
      />
    );
  }

  return (
    <div className="min-h-0" id="offer-detail-page">
      <div className="space-y-4 sm:space-y-5">
        <OfferDetailHeaderToolbar
          title={translate('offerDetail.title')}
          offerStatusLabel={translate('offerDetail.offerStatusLabel')}
          editLabel={translate('offerDetail.edit')}
          expiredStatusLabel={translate(
            catalogOfferLifecycleMessageKey('EXPIRED'),
          )}
          offerStatusHeaderFrozen={offerStatusHeaderFrozen}
          offerStatusUi={offerStatusUi}
          offerStatusSaving={offerStatusSaving}
          statusOptions={statusOptions}
          onOfferStatusChange={handleOfferStatusChange}
          onEditOffer={onEditOffer}
          onBackClick={handleBackToListings}
        />

        <div className="overflow-hidden rounded-xl border border-mds-black-100 bg-white shadow-sm">
          <OfferDetailProductSection
            detail={detail}
            offerId={offerId}
            mainImage={mainImage}
            onSelectImage={setMainImage}
            translate={translate}
            sellerOfferHeading={sellerOfferHeading}
          />

          <OfferDetailSpecsSection detail={detail} translate={translate} />
        </div>
      </div>

      {editOfferOpen ? (
        <EditOfferDialog
          key={`edit-offer-${String(editOfferNonce.current)}`}
          offer={detail}
          onClose={() => setEditOfferOpen(false)}
          onSaved={async () => {
            await refreshOfferDetailSilent();
            invalidateCatalogActiveOffers(queryClient);
          }}
        />
      ) : null}
    </div>
  );
}
