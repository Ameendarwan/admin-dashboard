'use client';

import { InputDropdown, InputField } from '@merit-incentives/ui';
import { Send } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import { BaseDialog } from '@/components/BaseDialog';
import { useLocalization } from '@/hooks/useLocalization';
import type { CloseActivationRequestAction } from '@/types/rewards-portal/activationRequestsApi';

import { getActivationRejectionReasonOptions } from '../../constants/giftCardManagementConstants';
import { ActivationDialogInfoCallout } from '../ActivationDialogInfoCallout';

interface CloseActivationRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  onConfirm: (payload: {
    action: CloseActivationRequestAction;
    rejectionReason?: string;
    notes?: string;
  }) => void;
  isSubmitting?: boolean;
}

export function CloseActivationRequestDialog({
  isOpen,
  onClose,
  requestId,
  onConfirm,
  isSubmitting = false,
}: Readonly<CloseActivationRequestDialogProps>) {
  const { translate } = useLocalization('catalog');
  const [action, setAction] = useState<CloseActivationRequestAction | ''>('');
  const [reasonKey, setReasonKey] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAction('');
      setReasonKey('');
      setNotes('');
    }
  }, [isOpen]);

  const reasonOptions = getActivationRejectionReasonOptions(translate);

  const actionOptions = [
    {
      value: 'APPROVE_ALL_PENDING',
      label: translate(
        'giftCardManagement.closeDialog.actions.approveAllPending',
      ),
    },
    {
      value: 'REJECT_ALL_PENDING',
      label: translate(
        'giftCardManagement.closeDialog.actions.rejectAllPending',
      ),
    },
  ];

  const requiresReason = action === 'REJECT_ALL_PENDING';
  const canConfirm =
    action === 'APPROVE_ALL_PENDING' ||
    (action === 'REJECT_ALL_PENDING' && Boolean(reasonKey.trim()));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canConfirm || !action || isSubmitting) return;
    onConfirm({
      action,
      rejectionReason: requiresReason ? reasonKey : undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
      closeOnOutsideClick={!isSubmitting}
      title={translate('giftCardManagement.closeDialog.title')}
      description={translate('giftCardManagement.closeDialog.subtitle')}
      secondaryButtonText={translate('giftCardManagement.closeDialog.cancel')}
      onSecondaryAction={onClose}
      submitButtonText={translate('giftCardManagement.closeDialog.confirm')}
      submitButtonIcon={<Send className="h-4 w-4" aria-hidden />}
      submitDisabled={!canConfirm}
      className="w-[min(100%,40rem)] max-w-[calc(100vw-2rem)]"
    >
      <p className="text-sm text-mds-black-700">
        {translate('giftCardManagement.closeDialog.requestId', {
          id: requestId,
        })}
      </p>

      <InputDropdown
        label={translate('giftCardManagement.closeDialog.actionLabel')}
        placeholder={translate(
          'giftCardManagement.closeDialog.actionPlaceholder',
        )}
        options={actionOptions}
        value={action}
        onChange={(value) => setAction(value as CloseActivationRequestAction)}
        required
      />

      {requiresReason ? (
        <InputDropdown
          label={translate('giftCardManagement.rejectDialog.reasonLabel')}
          placeholder={translate(
            'giftCardManagement.rejectDialog.reasonPlaceholder',
          )}
          options={reasonOptions}
          value={reasonKey}
          onChange={setReasonKey}
          required
        />
      ) : null}

      <InputField
        label={translate('giftCardManagement.closeDialog.notesLabel')}
        placeholder={translate(
          'giftCardManagement.closeDialog.notesPlaceholder',
        )}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <ActivationDialogInfoCallout
        title={translate('giftCardManagement.closeDialog.whatHappensNext')}
        items={[
          translate('giftCardManagement.closeDialog.nextItem1'),
          translate('giftCardManagement.closeDialog.nextItem2'),
          translate('giftCardManagement.closeDialog.nextItem3'),
          translate('giftCardManagement.closeDialog.nextItem4'),
        ]}
      />
    </BaseDialog>
  );
}
