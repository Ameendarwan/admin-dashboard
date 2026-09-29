'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, InputDropdown, TextArea, toast } from '@merit-incentives/ui';
import { X } from 'lucide-react';

import { useRejectWalletOperation } from '@/api-queries/wallets';
import { createIdempotencyKey } from '@/utils/createIdempotencyKey';

import { useFloatTopUpReviewDetails } from '../../hooks';
import type {
  FloatTopUpRejectionReason,
  FloatTopUpReviewContext,
} from '../../utils/walletTopUpTypes';
import { FloatTopUpReviewModalLayout } from '../FloatTopUpReviewModalLayout';
import { WhatHappensNextCallout } from '../WhatHappensNextCallout';

const REJECTION_REASONS = [
  'transfer_not_received',
  'amount_does_not_match',
  'invalid_proof_of_payment',
  'reference_number_mismatch',
  'compliance_hold',
] as const satisfies readonly FloatTopUpRejectionReason[];

const REJECTION_REASON_SET: ReadonlySet<string> = new Set(REJECTION_REASONS);

function isFloatTopUpRejectionReason(
  value: string,
): value is FloatTopUpRejectionReason {
  return REJECTION_REASON_SET.has(value);
}

interface RejectFloatTopUpModalProps extends FloatTopUpReviewContext {
  tenantId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RejectFloatTopUpModal({
  tenantId,
  isOpen,
  onClose,
  tenantName,
  pendingReview,
}: Readonly<RejectFloatTopUpModalProps>) {
  const { translate, rows } = useFloatTopUpReviewDetails(
    tenantName,
    pendingReview,
  );
  const rejectMutation = useRejectWalletOperation();
  const attemptIdempotencyKeyRef = useRef<string | null>(null);
  const [reasonCode, setReasonCode] = useState<FloatTopUpRejectionReason | ''>(
    '',
  );
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReasonCode('');
      setNotes('');
      attemptIdempotencyKeyRef.current = null;
    }
  }, [isOpen, pendingReview.operationId]);

  const reasonOptions = REJECTION_REASONS.map((reason) => ({
    value: reason,
    label: translate(`reviewModals.reject.reasons.${reason}`),
  }));

  const handleConfirm = async () => {
    if (!reasonCode || rejectMutation.isPending) {
      return;
    }
    const idempotencyKey =
      attemptIdempotencyKeyRef.current ??
      (attemptIdempotencyKeyRef.current = createIdempotencyKey());
    try {
      await rejectMutation.mutateAsync({
        tenantId,
        operationId: pendingReview.operationId,
        reasonCode,
        notes: notes.trim() || undefined,
        idempotencyKey,
      });
      attemptIdempotencyKeyRef.current = null;
      toast.success(translate('toast.rejectSuccess'));
      onClose();
    } catch {
      toast.error(translate('toast.rejectError'));
    }
  };

  return (
    <FloatTopUpReviewModalLayout
      isOpen={isOpen}
      onClose={onClose}
      title={translate('reviewModals.reject.title')}
      description={translate('reviewModals.reject.description')}
      rows={rows}
      isCancelDisabled={rejectMutation.isPending}
      contentClassName="relative overflow-visible px-6 py-5"
      actions={
        <Button
          type="button"
          variant="negative"
          size="md"
          leftIcon={<X className="h-4 w-4" aria-hidden />}
          className="w-full sm:w-auto sm:min-w-44"
          loading={rejectMutation.isPending}
          disabled={rejectMutation.isPending || !reasonCode}
          onClick={() => {
            void handleConfirm();
          }}
        >
          {translate('reviewModals.reject.confirm')}
        </Button>
      }
    >
      <div className="relative overflow-visible" style={{ zIndex: 20 }}>
        <InputDropdown
          label={translate('reviewModals.reject.reasonLabel')}
          required
          options={reasonOptions}
          value={reasonCode}
          placeholder={translate('reviewModals.reject.reasonPlaceholder')}
          onChange={(value) =>
            setReasonCode(isFloatTopUpRejectionReason(value) ? value : '')
          }
        />
      </div>

      <TextArea
        label={translate('reviewModals.reject.notesLabel')}
        placeholder={translate('reviewModals.reject.notesPlaceholder')}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        maxLength={500}
        rows={4}
        className="w-full max-w-none"
      />

      <WhatHappensNextCallout
        title={translate('reviewModals.whatHappensNext.title')}
        items={[
          translate('reviewModals.reject.whatHappensNext.balanceUnchanged'),
          translate('reviewModals.reject.whatHappensNext.recordReason'),
        ]}
      />
    </FloatTopUpReviewModalLayout>
  );
}
