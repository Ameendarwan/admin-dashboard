'use client';

import { InputDropdown, InputField } from '@merit-incentives/ui';
import { X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import { BaseDialog } from '@/components/BaseDialog';
import { useLocalization } from '@/hooks/useLocalization';
import type { ActivationRequestCardItem } from '@/types/catalog';

import { getActivationRejectionReasonOptions } from '../../constants/giftCardManagementConstants';
import { ActivationDialogInfoCallout } from '../ActivationDialogInfoCallout';

interface RejectCardActivationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  card: ActivationRequestCardItem | null;
  tenantName: string;
  businessOwnerEmail: string;
  onConfirm?: (payload: { reason: string; notes: string }) => void;
  isSubmitting?: boolean;
}

export function RejectCardActivationDialog({
  isOpen,
  onClose,
  card,
  tenantName,
  businessOwnerEmail,
  onConfirm,
  isSubmitting = false,
}: Readonly<RejectCardActivationDialogProps>) {
  const { translate } = useLocalization('catalog');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setNotes('');
    }
  }, [isOpen]);

  if (!card) return null;

  const reasonOptions = getActivationRejectionReasonOptions(translate);

  const detailRows = [
    {
      label: translate('giftCardManagement.rejectDialog.card'),
      value: card.name,
    },
    {
      label: translate('giftCardManagement.rejectDialog.brand'),
      value: card.brand,
    },
    {
      label: translate('giftCardManagement.rejectDialog.productId'),
      value: card.productId,
    },
    {
      label: translate('giftCardManagement.rejectDialog.tenant'),
      value: tenantName,
    },
    {
      label: translate('giftCardManagement.rejectDialog.businessOwner'),
      value: businessOwnerEmail,
    },
  ];

  const canConfirm = reason.trim().length > 0;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canConfirm || isSubmitting) return;
    onConfirm?.({ reason, notes });
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
      closeOnOutsideClick={!isSubmitting}
      title={translate('giftCardManagement.rejectDialog.title')}
      description={translate('giftCardManagement.rejectDialog.subtitle')}
      secondaryButtonText={translate('giftCardManagement.rejectDialog.cancel')}
      onSecondaryAction={onClose}
      submitButtonText={translate('giftCardManagement.rejectDialog.confirm')}
      submitButtonIcon={<X className="h-4 w-4" aria-hidden />}
      submitButtonVariant="negative"
      submitDisabled={!canConfirm}
      className="w-[min(100%,40rem)] max-w-[calc(100vw-2rem)]"
    >
      <dl className="space-y-3">
        {detailRows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-4 text-sm"
          >
            <dt className="shrink-0 text-mds-black-600">{row.label}</dt>
            <dd className="truncate text-end font-medium text-mds-black-900">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <InputDropdown
        label={translate('giftCardManagement.rejectDialog.reasonLabel')}
        placeholder={translate(
          'giftCardManagement.rejectDialog.reasonPlaceholder',
        )}
        options={reasonOptions}
        value={reason}
        onChange={setReason}
        required
      />

      <InputField
        label={translate('giftCardManagement.rejectDialog.notesLabel')}
        placeholder={translate(
          'giftCardManagement.rejectDialog.notesPlaceholder',
        )}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <ActivationDialogInfoCallout
        title={translate('giftCardManagement.rejectDialog.whatHappensNext')}
        items={[
          translate('giftCardManagement.rejectDialog.nextItem1'),
          translate('giftCardManagement.rejectDialog.nextItem2'),
          translate('giftCardManagement.rejectDialog.nextItem3'),
        ]}
      />
    </BaseDialog>
  );
}
