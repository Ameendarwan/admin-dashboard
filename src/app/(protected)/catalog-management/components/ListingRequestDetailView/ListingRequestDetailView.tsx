'use client';

import { Badge } from '@merit-incentives/ui';

import { DetailsPageHeader } from '@/components/DetailsPageHeader';
import type { ListingRequestDetail } from '@/types/catalog';

import { ListingStatusBadge } from '../ListingStatusBadge';
import { RejectListingRequestModal } from '../RejectListingRequestModal';
import {
  listingRequestMatchResultLabel,
  matchResultToColor,
} from '../../utils/listingStatusBadgeHelpers';
import {
  ListingRequestAttributesSection,
  ListingRequestProductDetailsSection,
  ListingRequestProductHero,
  ListingRequestRequestedBySection,
  ListingRequestSellerOfferSection,
  ListingRequestWorkflowActions,
} from './components';

interface ListingRequestDetailViewProps {
  translate: (key: string, values?: Record<string, string | number>) => string;
  detail: ListingRequestDetail;
  mainImage: number;
  onSelectImage: (index: number) => void;
  actionLoading: boolean;
  rejectLocked: boolean;
  approveLocked: boolean;
  showWorkflowActions: boolean;
  rejectModalOpen: boolean;
  onOpenRejectModal: () => void;
  onCloseRejectModal: () => void;
  onConfirmReject: (reason: string) => Promise<void>;
  onApprove: () => Promise<void>;
  onBackClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export function ListingRequestDetailView({
  translate,
  detail,
  mainImage,
  onSelectImage,
  actionLoading,
  rejectLocked,
  approveLocked,
  showWorkflowActions,
  rejectModalOpen,
  onOpenRejectModal,
  onCloseRejectModal,
  onConfirmReject,
  onApprove,
  onBackClick,
}: Readonly<ListingRequestDetailViewProps>) {
  return (
    <div className="min-h-0" id="listing-request-detail-page">
      <div className="space-y-4 sm:space-y-5">
        <DetailsPageHeader
          title={translate('listingRequest.title')}
          titleSuffix={
            <div className="flex flex-wrap items-center gap-2">
              <ListingStatusBadge kind="request" status={detail.status} />
              {detail.matchResult ? (
                <Badge
                  className="whitespace-nowrap"
                  color={matchResultToColor[detail.matchResult]}
                  leftIcon
                  size="lg"
                >
                  {listingRequestMatchResultLabel(
                    detail.matchResult,
                    translate,
                  )}
                </Badge>
              ) : null}
            </div>
          }
          onBackClick={onBackClick}
        >
          {showWorkflowActions ? (
            <ListingRequestWorkflowActions
              translate={translate}
              actionLoading={actionLoading}
              rejectLocked={rejectLocked}
              approveLocked={approveLocked}
              onOpenRejectModal={onOpenRejectModal}
              onApprove={onApprove}
            />
          ) : null}
        </DetailsPageHeader>

        <div className="overflow-hidden rounded-xl border border-mds-black-100 bg-white p-4 shadow-sm sm:p-6">
          <ListingRequestProductHero
            translate={translate}
            productName={detail.productName}
            brand={detail.brand}
            categoryPath={detail.categoryPath}
            imageUrls={detail.imageUrls}
            mainImage={mainImage}
            onSelectImage={onSelectImage}
            submittedOn={detail.submittedOn}
          />

          <div className="mt-4 space-y-3">
            <ListingRequestRequestedBySection
              translate={translate}
              sellerName={detail.sellerName}
              sellerEmail={detail.sellerEmail}
              submittedOn={detail.submittedOn}
            />

            {detail.rejectionReason ? (
              <div className="rounded-xl bg-[#FEF3F2] p-4">
                <h3 className="text-2xl font-medium text-mds-black-900">
                  {translate('listingRequest.rejectionReason')}
                </h3>
                <p className="mt-3 whitespace-pre-wrap text-base text-mds-black-800">
                  {detail.rejectionReason}
                </p>
              </div>
            ) : null}

            <ListingRequestProductDetailsSection
              translate={translate}
              description={detail.description}
              keyFeatures={detail.keyFeatures}
            />

            <ListingRequestAttributesSection
              translate={translate}
              attributes={detail.attributes}
            />

            <ListingRequestSellerOfferSection
              translate={translate}
              variants={detail.variants}
            />
          </div>
        </div>
      </div>
      <RejectListingRequestModal
        isOpen={rejectModalOpen}
        submitting={actionLoading}
        translate={translate}
        onClose={onCloseRejectModal}
        onConfirm={onConfirmReject}
      />
    </div>
  );
}
