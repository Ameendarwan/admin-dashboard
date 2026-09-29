'use client';

import { TextArea } from '@merit-incentives/ui';
import { Info, X } from 'lucide-react';
import { useEffect, type FormEvent } from 'react';

import { BaseDialog } from '@/components/BaseDialog';
import { useLocalization } from '@/hooks/useLocalization';

interface GcEmailRejectDialogProps {
  isOpen: boolean;
  reason: string;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function GcEmailRejectDialog({
  isOpen,
  reason,
  onReasonChange,
  onClose,
  onConfirm,
  isSubmitting = false,
}: Readonly<GcEmailRejectDialogProps>) {
  const { translate } = useLocalization('rewards-portal');

  useEffect(() => {
    if (isOpen) {
      onReasonChange('');
    }
  }, [isOpen, onReasonChange]);

  const canConfirm = reason.trim().length > 0;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canConfirm || isSubmitting) {
      return;
    }
    onConfirm();
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
      closeOnOutsideClick={!isSubmitting}
      title={translate('gcEmail.reject.title')}
      description={translate('gcEmail.reject.description')}
      secondaryButtonText={translate('gcEmail.reject.cancel')}
      onSecondaryAction={onClose}
      submitButtonText={translate('gcEmail.reject.confirm')}
      submitButtonIcon={<X className="h-5 w-5" aria-hidden />}
      submitButtonVariant="negative"
      submitDisabled={!canConfirm}
      className="w-[min(100%,40rem)] max-w-[calc(100vw-2rem)]"
    >
      <div className="flex items-start overflow-hidden rounded-lg bg-mds-casablanca-50">
        <div className="flex shrink-0 items-start px-3 py-4">
          <Info className="h-6 w-6 text-mds-casablanca-500" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 px-1.5 py-4">
          <p className="text-sm font-medium leading-[1.2] text-mds-black-800">
            {translate('gcEmail.reject.callout')}
          </p>
        </div>
      </div>

      <TextArea
        label={translate('gcEmail.reject.reasonLabel')}
        placeholder={translate('gcEmail.reject.reasonPlaceholder')}
        value={reason}
        onChange={(event) => onReasonChange(event.target.value)}
        required
        rows={5}
      />
    </BaseDialog>
  );
}
