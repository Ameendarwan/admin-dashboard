'use client';

import { Button } from '@merit-incentives/ui';

import { useFloatTopUpReviewDetails } from '../../hooks';
import type { FloatTopUpReviewContext } from '../../utils/walletTopUpTypes';
import { FloatTopUpReviewModalLayout } from '../FloatTopUpReviewModalLayout';

interface ReviewFloatTopUpModalProps extends FloatTopUpReviewContext {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  isDetailLoading: boolean;
  isDetailError: boolean;
  isDetailReady: boolean;
  onRetryDetail: () => void;
}

export function ReviewFloatTopUpModal({
  isOpen,
  onClose,
  onApprove,
  onReject,
  isDetailLoading,
  isDetailError,
  isDetailReady,
  onRetryDetail,
  tenantName,
  pendingReview,
}: Readonly<ReviewFloatTopUpModalProps>) {
  const { translate, rows } = useFloatTopUpReviewDetails(
    tenantName,
    pendingReview,
  );

  return (
    <FloatTopUpReviewModalLayout
      isOpen={isOpen}
      onClose={onClose}
      title={translate('reviewModals.review.title')}
      description={translate('reviewModals.review.description')}
      subtitle={translate('reviewModals.review.subtitle')}
      rows={rows}
      detailStatus={{
        isLoading: isDetailLoading,
        isError: isDetailError,
        isReady: isDetailReady,
        showIncomplete: true,
        onRetry: onRetryDetail,
      }}
      actions={
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="negative"
            size="md"
            onClick={onReject}
            className="w-full sm:min-w-32"
          >
            {translate('reviewModals.actions.reject')}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onApprove}
            disabled={!isDetailReady}
            className="w-full sm:min-w-32"
          >
            {translate('reviewModals.actions.approve')}
          </Button>
        </div>
      }
    />
  );
}
