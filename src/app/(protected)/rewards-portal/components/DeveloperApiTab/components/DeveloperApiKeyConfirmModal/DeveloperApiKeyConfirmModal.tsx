'use client';

import { ConfirmationPopup } from '@/components/ConfirmationPopup';
import { useLocalization } from '@/hooks/useLocalization';

export type DeveloperApiKeyConfirmAction = 'suspend' | 'restore';

interface DeveloperApiKeyConfirmModalProps {
  open: boolean;
  action: DeveloperApiKeyConfirmAction | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeveloperApiKeyConfirmModal({
  open,
  action,
  isLoading = false,
  onClose,
  onConfirm,
}: Readonly<DeveloperApiKeyConfirmModalProps>) {
  const { translate } = useLocalization('rewards-portal');

  if (!action) {
    return null;
  }

  const isSuspend = action === 'suspend';

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
      title={translate(
        isSuspend
          ? 'developerApi.confirm.suspendTitle'
          : 'developerApi.confirm.restoreTitle',
      )}
      description={translate(
        isSuspend
          ? 'developerApi.confirm.suspendDescription'
          : 'developerApi.confirm.restoreDescription',
      )}
      primaryButton={{
        text: translate(
          isSuspend
            ? 'developerApi.confirm.suspendConfirm'
            : 'developerApi.confirm.restoreConfirm',
        ),
        variant: isSuspend ? 'negative' : 'primary',
      }}
      secondaryButton={{
        text: translate('developerApi.confirm.cancel'),
        variant: 'tertiary',
      }}
      onPrimaryAction={onConfirm}
      closeOnPrimaryAction={false}
      primaryLoading={isLoading}
    />
  );
}
