'use client';

import { Button } from '@merit-incentives/ui';
import type { MouseEvent } from 'react';

import { DetailsPageHeader } from '@/components/DetailsPageHeader';
import type { ActivationRequestDetail } from '@/types/catalog';

import { ApproveCardActivationDialog } from '../ApproveCardActivationDialog';
import { CloseActivationRequestDialog } from '../CloseActivationRequestDialog';
import { GiftCardManagementStatusBadge } from '../GiftCardManagementStatusBadge';
import { RejectCardActivationDialog } from '../RejectCardActivationDialog';
// import { SendForBrandApprovalDialog } from '../SendForBrandApprovalDialog';
import {
  ActivationRequestCardsSection,
  ActivationRequestTenantSection,
} from './components';
import { useActivationRequestDetailView } from './hooks';

interface ActivationRequestDetailViewProps {
  translate: (key: string, values?: Record<string, string | number>) => string;
  detail: ActivationRequestDetail;
  onBackClick?: (event: MouseEvent<HTMLElement>) => void;
  onCloseSuccess?: () => void;
  /** When false, hides tenant details (e.g. rewards-portal tenant context). Default true. */
  showTenantSection?: boolean;
}

export function ActivationRequestDetailView({
  translate,
  detail,
  onBackClick,
  onCloseSuccess,
  showTenantSection = true,
}: Readonly<ActivationRequestDetailViewProps>) {
  const {
    approveCard,
    setApproveCard,
    rejectCard,
    setRejectCard,
    // brandApprovalCard,
    // setBrandApprovalCard,
    closeOpen,
    setCloseOpen,
    closeMutationPending,
    approveMutationPending,
    rejectMutationPending,
    // brandApprovalSubmitting,
    approvingItemId,
    rejectingItemId,
    isCardActionsDisabled,
    handleApproveConfirm,
    handleRejectConfirm,
    handleCloseConfirm,
    // handleBrandApprovalConfirm,
  } = useActivationRequestDetailView({
    translate,
    detail,
    onCloseSuccess,
  });

  return (
    <div className="min-h-0" id="activation-request-detail-page">
      <div className="space-y-5">
        <DetailsPageHeader
          title={translate('giftCardManagement.detail.pageTitle')}
          titleSuffix={
            <GiftCardManagementStatusBadge
              kind="activation-request"
              status={detail.status}
            />
          }
          onBackClick={onBackClick}
        >
          {detail.canClose ? (
            <Button
              variant="primary"
              type="button"
              className="rounded-full px-5"
              loading={closeMutationPending}
              disabled={closeMutationPending}
              onClick={() => setCloseOpen(true)}
            >
              {translate('giftCardManagement.detail.closeRequest')}
            </Button>
          ) : null}
        </DetailsPageHeader>

        {showTenantSection ? (
          <ActivationRequestTenantSection
            detail={detail}
            translate={translate}
          />
        ) : null}

        <ActivationRequestCardsSection
          cards={detail.cards}
          translate={translate}
          approvingItemId={approvingItemId}
          rejectingItemId={rejectingItemId}
          isCardActionsDisabled={isCardActionsDisabled}
          onApprove={setApproveCard}
          onReject={setRejectCard}
          // onSendForBrandApproval={setBrandApprovalCard}
        />
      </div>

      <ApproveCardActivationDialog
        isOpen={approveCard !== null}
        onClose={() => setApproveCard(null)}
        card={approveCard}
        tenantName={detail.businessName}
        businessOwnerEmail={detail.businessOwnerEmail}
        isSubmitting={approveMutationPending}
        onConfirm={handleApproveConfirm}
      />

      <RejectCardActivationDialog
        isOpen={rejectCard !== null}
        onClose={() => setRejectCard(null)}
        card={rejectCard}
        tenantName={detail.businessName}
        businessOwnerEmail={detail.businessOwnerEmail}
        isSubmitting={rejectMutationPending}
        onConfirm={handleRejectConfirm}
      />

      {/* Brand approval temporarily disabled
      <SendForBrandApprovalDialog
        isOpen={brandApprovalCard !== null}
        onClose={() => setBrandApprovalCard(null)}
        card={brandApprovalCard}
        isSubmitting={brandApprovalSubmitting}
        onConfirm={handleBrandApprovalConfirm}
      />
      */}

      <CloseActivationRequestDialog
        isOpen={closeOpen}
        onClose={() => setCloseOpen(false)}
        requestId={detail.id}
        isSubmitting={closeMutationPending}
        onConfirm={handleCloseConfirm}
      />
    </div>
  );
}
