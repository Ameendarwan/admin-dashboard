'use client';

import { toast } from '@merit-incentives/ui';
import { useCallback, useState } from 'react';

import {
  useApproveActivationRequestItemMutation,
  useCloseActivationRequestMutation,
  useRejectActivationRequestItemMutation,
} from '@/api-queries/rewards-portal/activation-requests';
import type {
  ActivationRequestCardItem,
  ActivationRequestDetail,
} from '@/types/catalog';
import type { CloseActivationRequestAction } from '@/types/rewards-portal/activationRequestsApi';
import { adminApiAxiosMessage } from '@/utils/adminApiAxiosMessage';

import { isActivationRejectionReasonKey } from '../../../constants/giftCardManagementConstants';

interface UseActivationRequestDetailViewArgs {
  translate: (key: string, values?: Record<string, string | number>) => string;
  detail: ActivationRequestDetail;
  onCloseSuccess?: () => void;
}

export function useActivationRequestDetailView({
  translate,
  detail,
  onCloseSuccess,
}: UseActivationRequestDetailViewArgs) {
  const [approveCard, setApproveCard] =
    useState<ActivationRequestCardItem | null>(null);
  const [rejectCard, setRejectCard] =
    useState<ActivationRequestCardItem | null>(null);
  // Brand approval temporarily disabled
  // const [brandApprovalCard, setBrandApprovalCard] =
  //   useState<ActivationRequestCardItem | null>(null);
  const [closeOpen, setCloseOpen] = useState(false);

  const closeMutation = useCloseActivationRequestMutation();
  const approveMutation = useApproveActivationRequestItemMutation();
  const rejectMutation = useRejectActivationRequestItemMutation();

  const itemMutationPending =
    approveMutation.isPending || rejectMutation.isPending;
  const approvingItemId = approveMutation.isPending
    ? approveMutation.variables?.itemId
    : undefined;
  const rejectingItemId = rejectMutation.isPending
    ? rejectMutation.variables?.itemId
    : undefined;

  const resolveRejectionReason = useCallback(
    (reasonKey: string): string => {
      if (!isActivationRejectionReasonKey(reasonKey)) {
        return reasonKey;
      }
      return translate(`giftCardManagement.rejectDialog.reasons.${reasonKey}`);
    },
    [translate],
  );

  const isCardActionsDisabled = useCallback(
    (card: ActivationRequestCardItem) =>
      card.status !== 'PENDING' ||
      (itemMutationPending &&
        approvingItemId !== card.id &&
        rejectingItemId !== card.id),
    [approvingItemId, itemMutationPending, rejectingItemId],
  );

  const handleApproveConfirm = useCallback(() => {
    if (!approveCard) {
      return;
    }
    approveMutation.mutate(
      {
        requestId: detail.id,
        itemId: approveCard.id,
      },
      {
        onSuccess: () => {
          setApproveCard(null);
          toast.success(translate('giftCardManagement.toast.approveSuccess'));
        },
        onError: (error) => {
          toast.error(
            adminApiAxiosMessage(
              error,
              translate('giftCardManagement.toast.approveError'),
            ),
          );
        },
      },
    );
  }, [approveCard, approveMutation, detail.id, translate]);

  const handleRejectConfirm = useCallback(
    ({ reason }: { reason: string }) => {
      if (!rejectCard) {
        return;
      }
      rejectMutation.mutate(
        {
          requestId: detail.id,
          itemId: rejectCard.id,
          body: { rejectionReason: resolveRejectionReason(reason) },
        },
        {
          onSuccess: () => {
            setRejectCard(null);
            toast.success(translate('giftCardManagement.toast.rejectSuccess'));
          },
          onError: (error) => {
            toast.error(
              adminApiAxiosMessage(
                error,
                translate('giftCardManagement.toast.rejectError'),
              ),
            );
          },
        },
      );
    },
    [detail.id, rejectCard, rejectMutation, resolveRejectionReason, translate],
  );

  const handleCloseConfirm = useCallback(
    (payload: {
      action: CloseActivationRequestAction;
      rejectionReason?: string;
      notes?: string;
    }) => {
      closeMutation.mutate(
        {
          requestId: detail.id,
          body: payload,
        },
        {
          onSuccess: () => {
            setCloseOpen(false);
            toast.success(translate('giftCardManagement.toast.closeSuccess'));
            onCloseSuccess?.();
          },
          onError: (error) => {
            toast.error(
              adminApiAxiosMessage(
                error,
                translate('giftCardManagement.toast.closeError'),
              ),
            );
          },
        },
      );
    },
    [closeMutation, detail.id, onCloseSuccess, translate],
  );

  // Brand approval temporarily disabled
  // const handleBrandApprovalConfirm = useCallback(() => {
  //   if (!brandApprovalCard) {
  //     return;
  //   }
  //   // API wiring for brand approval will connect when the endpoint is available.
  //   setBrandApprovalCard(null);
  //   toast.success(translate('giftCardManagement.toast.brandApprovalSuccess'));
  // }, [brandApprovalCard, translate]);

  return {
    approveCard,
    setApproveCard,
    rejectCard,
    setRejectCard,
    // brandApprovalCard,
    // setBrandApprovalCard,
    closeOpen,
    setCloseOpen,
    closeMutationPending: closeMutation.isPending,
    approveMutationPending: approveMutation.isPending,
    rejectMutationPending: rejectMutation.isPending,
    // brandApprovalSubmitting: false,
    approvingItemId,
    rejectingItemId,
    isCardActionsDisabled,
    handleApproveConfirm,
    handleRejectConfirm,
    handleCloseConfirm,
    // handleBrandApprovalConfirm,
  };
}
