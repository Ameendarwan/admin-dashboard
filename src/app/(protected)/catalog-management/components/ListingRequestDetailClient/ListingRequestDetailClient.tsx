'use client';

import { useParams, useRouter } from 'next/navigation';

import { useCatalogDetailBack } from '@/app/(protected)/catalog-management/hooks/useCatalogDetailBack';
import { useListingRequestDetail } from '@/app/(protected)/catalog-management/hooks/useListingRequestDetail';
import { defaultCatalogListingsReturnTo } from '@/app/(protected)/catalog-management/utils/catalogListingsRoute';
import { Spinner } from '@/components';
import { TableStateDisplay } from '@/components/TableStateDisplay';

import { ListingRequestDetailView } from '../ListingRequestDetailView';

export function ListingRequestDetailClient() {
  const router = useRouter();
  const params = useParams();
  const requestId = String(params?.requestId ?? '');

  const { returnTo: listingsReturnTo, handleBack: handleBackToListings } =
    useCatalogDetailBack(defaultCatalogListingsReturnTo('requests'));

  const {
    loading,
    loadError,
    detail,
    mainImage,
    setMainImage,
    actionLoading,
    approveLocked,
    rejectLocked,
    showWorkflowActions,
    rejectModalOpen,
    openRejectModal,
    closeRejectModal,
    onConfirmReject,
    onApprove,
    translate,
  } = useListingRequestDetail(requestId);

  if (loading) {
    return <Spinner fullHeight />;
  }

  if (loadError || !detail) {
    return (
      <TableStateDisplay
        type="error"
        title={translate('notFound')}
        description={loadError ?? translate('notFoundHint')}
        showRetryButton
        onRetry={() => router.push(listingsReturnTo)}
        retryButtonText={translate('backToList')}
      />
    );
  }

  return (
    <ListingRequestDetailView
      translate={translate}
      detail={detail}
      mainImage={mainImage}
      onSelectImage={setMainImage}
      actionLoading={actionLoading}
      rejectLocked={rejectLocked}
      approveLocked={approveLocked}
      showWorkflowActions={showWorkflowActions}
      rejectModalOpen={rejectModalOpen}
      onOpenRejectModal={openRejectModal}
      onCloseRejectModal={closeRejectModal}
      onConfirmReject={onConfirmReject}
      onApprove={onApprove}
      onBackClick={handleBackToListings}
    />
  );
}
