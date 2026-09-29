'use client';

import { TableStateDisplay } from '@/components/TableStateDisplay';
import { Spinner } from '@/components';

import {
  ListingDetailHeader,
  ListingDetailProductCard,
  ListingDetailSellerOffers,
} from './components';
import { useListingDetail } from './hooks';

export function ListingDetailClient() {
  const {
    translate,
    listingId,
    detail,
    loading,
    loadError,
    refetchProduct,
    handleBackToListings,
    mainImage,
    setMainImage,
    detailsOpen,
    toggleDetailsOpen,
    handleOfferSearchChange,
    offersPage,
    setOffersPage,
    offerPageSize,
    filteredOffers,
    pagedOffers,
    totalOfferPages,
    offersLoading,
    offersError,
    handleOfferRowClick,
  } = useListingDetail();

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
        onRetry={refetchProduct}
        retryButtonText={translate('retry') || 'Retry'}
      />
    );
  }

  return (
    <div className="min-h-0" id="listing-detail-page">
      <div className="space-y-4 sm:space-y-5">
        <ListingDetailHeader
          title={translate('listingDetails.title')}
          statusLabel={translate('listingDetails.listingStatus')}
          status={detail.status}
          onBackClick={handleBackToListings}
        />

        <ListingDetailProductCard
          listingId={listingId}
          detail={detail}
          mainImage={mainImage}
          onMainImageChange={setMainImage}
          detailsOpen={detailsOpen}
          onToggleDetails={toggleDetailsOpen}
          translate={translate}
        />

        <ListingDetailSellerOffers
          translate={translate}
          onOfferSearchChange={handleOfferSearchChange}
          offersError={offersError}
          pagedOffers={pagedOffers}
          filteredOffersCount={filteredOffers.length}
          offersPage={offersPage}
          totalOfferPages={totalOfferPages}
          offerPageSize={offerPageSize}
          offersLoading={offersLoading}
          onPageChange={setOffersPage}
          onRowClick={handleOfferRowClick}
        />
      </div>
    </div>
  );
}
