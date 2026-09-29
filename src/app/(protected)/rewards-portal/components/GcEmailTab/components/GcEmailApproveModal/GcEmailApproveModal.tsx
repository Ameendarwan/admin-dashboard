'use client';

import { ConfirmationPopup } from '@/components/ConfirmationPopup';
import { useLocalization } from '@/hooks/useLocalization';

interface GcEmailApproveModalProps {
  open: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function GcEmailApproveModal({
  open,
  isLoading = false,
  onClose,
  onConfirm,
}: Readonly<GcEmailApproveModalProps>) {
  const { translate } = useLocalization('rewards-portal');

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <ConfirmationPopup
      isOpen={open}
      onClose={handleClose}
      type="warning"
      title={translate('gcEmail.approve.title')}
      description={translate('gcEmail.approve.description')}
      primaryButton={{
        text: translate('gcEmail.approve.confirm'),
        variant: 'primary',
      }}
      secondaryButton={{
        text: translate('gcEmail.approve.cancel'),
        variant: 'tertiary',
      }}
      onPrimaryAction={onConfirm}
      closeOnPrimaryAction={false}
      primaryLoading={isLoading}
    />
  );
}
