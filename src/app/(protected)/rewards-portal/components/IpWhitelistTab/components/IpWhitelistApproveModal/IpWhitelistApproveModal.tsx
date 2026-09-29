'use client';

import { ConfirmationPopup } from '@/components/ConfirmationPopup';
import { useLocalization } from '@/hooks/useLocalization';

interface IpWhitelistApproveModalProps {
  open: boolean;
  ipAddress: string | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function IpWhitelistApproveModal({
  open,
  ipAddress,
  isLoading = false,
  onClose,
  onConfirm,
}: Readonly<IpWhitelistApproveModalProps>) {
  const { translate } = useLocalization('rewards-portal');

  if (!ipAddress) {
    return null;
  }

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
      title={translate('ipWhitelist.pending.approve.title')}
      description={
        <>
          {translate('ipWhitelist.pending.approve.descriptionPrefix')}{' '}
          <span className="font-semibold">{ipAddress}</span>
          {translate('ipWhitelist.pending.approve.descriptionSuffix')}
        </>
      }
      primaryButton={{
        text: translate('ipWhitelist.pending.approve.yes'),
        variant: 'primary',
      }}
      secondaryButton={{
        text: translate('ipWhitelist.pending.approve.no'),
        variant: 'tertiary',
      }}
      onPrimaryAction={onConfirm}
      closeOnPrimaryAction={false}
      primaryLoading={isLoading}
    />
  );
}
