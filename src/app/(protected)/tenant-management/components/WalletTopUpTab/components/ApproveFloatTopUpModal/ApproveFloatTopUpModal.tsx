'use client';

import { useEffect, useRef } from 'react';
import { Button, toast } from '@merit-incentives/ui';
import { Check } from 'lucide-react';

import { useApproveWalletOperation } from '@/api-queries/wallets';
import { createIdempotencyKey } from '@/utils/createIdempotencyKey';

import { useFloatTopUpReviewDetails } from '../../hooks';
import type { FloatTopUpReviewContext } from '../../utils/walletTopUpTypes';
import { FloatTopUpReviewModalLayout } from '../FloatTopUpReviewModalLayout';
import { WhatHappensNextCallout } from '../WhatHappensNextCallout';

interface ApproveFloatTopUpModalProps extends FloatTopUpReviewContext {
  tenantId: string;
  isOpen: boolean;
  onClose: () => void;
  isDetailLoading: boolean;
  isDetailError: boolean;
  isDetailReady: boolean;
  onRetryDetail: () => void;
}

export function ApproveFloatTopUpModal({
  tenantId,
  isOpen,
  onClose,
  isDetailLoading,
  isDetailError,
  isDetailReady,
  onRetryDetail,
  tenantName,
  pendingReview,
}: Readonly<ApproveFloatTopUpModalProps>) {
  const { translate, targetLabel, formattedAmount, rows } =
    useFloatTopUpReviewDetails(tenantName, pendingReview, {
      includeBalances: true,
    });
  const approveMutation = useApproveWalletOperation();
  const attemptIdempotencyKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      attemptIdempotencyKeyRef.current = null;
    }
  }, [isOpen, pendingReview.operationId]);

  const handleConfirm = async () => {
    if (!isDetailReady || approveMutation.isPending) {
      if (!isDetailReady) {
        toast.error(translate('reviewModals.detail.incomplete'));
      }
      return;
    }
    const idempotencyKey =
      attemptIdempotencyKeyRef.current ??
      (attemptIdempotencyKeyRef.current = createIdempotencyKey());
    try {
      await approveMutation.mutateAsync({
        tenantId,
        operationId: pendingReview.operationId,
        idempotencyKey,
      });
      attemptIdempotencyKeyRef.current = null;
      toast.success(translate('toast.approveSuccess'));
      onClose();
    } catch {
      toast.error(translate('toast.approveError'));
    }
  };

  return (
    <FloatTopUpReviewModalLayout
      isOpen={isOpen}
      onClose={onClose}
      title={translate('reviewModals.approve.title')}
      description={translate('reviewModals.approve.description')}
      subtitle={translate('reviewModals.approve.subtitle')}
      rows={rows}
      detailStatus={{
        isLoading: isDetailLoading,
        isError: isDetailError,
        isReady: isDetailReady,
        onRetry: onRetryDetail,
      }}
      isCancelDisabled={approveMutation.isPending}
      actions={
        <Button
          type="button"
          variant="primary"
          size="md"
          leftIcon={<Check className="h-4 w-4" aria-hidden />}
          className="w-full sm:w-auto sm:min-w-44"
          loading={approveMutation.isPending}
          disabled={approveMutation.isPending || !isDetailReady}
          onClick={() => {
            void handleConfirm();
          }}
        >
          {translate('reviewModals.approve.confirm')}
        </Button>
      }
    >
      <WhatHappensNextCallout
        title={translate('reviewModals.whatHappensNext.title')}
        items={[
          translate('reviewModals.approve.whatHappensNext.credit', {
            amount: formattedAmount,
            currencyCode: pendingReview.currencyCode,
            product: targetLabel,
          }),
        ]}
      />
    </FloatTopUpReviewModalLayout>
  );
}
