'use client';

import { InputField, TextArea } from '@merit-incentives/ui';
import { Send } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import { BaseDialog } from '@/components/BaseDialog';
import { useLocalization } from '@/hooks/useLocalization';
import type { ActivationRequestCardItem } from '@/types/catalog';
import { isValidEmail } from '@/utils/stringUtils';

interface SendForBrandApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  card: ActivationRequestCardItem | null;
  onConfirm?: (payload: { brandContactEmail: string; message: string }) => void;
  isSubmitting?: boolean;
}

export function SendForBrandApprovalDialog({
  isOpen,
  onClose,
  card,
  onConfirm,
  isSubmitting = false,
}: Readonly<SendForBrandApprovalDialogProps>) {
  const { translate } = useLocalization('catalog');
  const [brandContactEmail, setBrandContactEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setBrandContactEmail('');
      setMessage('');
    }
  }, [isOpen]);

  if (!card) return null;

  const canConfirm =
    isValidEmail(brandContactEmail) && message.trim().length > 0;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canConfirm || isSubmitting) return;
    onConfirm?.({
      brandContactEmail: brandContactEmail.trim(),
      message: message.trim(),
    });
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
      closeOnOutsideClick={!isSubmitting}
      title={translate('giftCardManagement.brandApprovalDialog.title')}
      secondaryButtonText={translate(
        'giftCardManagement.brandApprovalDialog.cancel',
      )}
      onSecondaryAction={onClose}
      submitButtonText={translate(
        'giftCardManagement.brandApprovalDialog.confirm',
      )}
      submitButtonIcon={<Send className="h-4 w-4" aria-hidden />}
      submitDisabled={!canConfirm}
      className="w-[min(100%,40rem)] max-w-[calc(100vw-2rem)]"
    >
      <InputField
        label={translate('giftCardManagement.brandApprovalDialog.emailLabel')}
        placeholder={translate(
          'giftCardManagement.brandApprovalDialog.emailPlaceholder',
        )}
        type="email"
        value={brandContactEmail}
        onChange={(e) => setBrandContactEmail(e.target.value)}
        required
      />

      <TextArea
        label={translate('giftCardManagement.brandApprovalDialog.messageLabel')}
        placeholder={translate(
          'giftCardManagement.brandApprovalDialog.messagePlaceholder',
        )}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={4}
        required
        className="w-full max-w-none"
      />
    </BaseDialog>
  );
}
