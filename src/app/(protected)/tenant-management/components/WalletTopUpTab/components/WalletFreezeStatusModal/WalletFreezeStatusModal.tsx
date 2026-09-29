'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Checkbox, InputField } from '@merit-incentives/ui';

import { useLocalization } from '@/hooks';

import { WalletFreezeConfirmLayout } from '../WalletFreezeConfirmLayout';
import { WalletFreezeInfoCallout } from '../WalletFreezeInfoCallout';

export type WalletFreezeModalVariant =
  | 'freeze-master'
  | 'unfreeze-master'
  | 'freeze-product'
  | 'unfreeze-product'
  | 'freeze-sub-tenant'
  | 'unfreeze-sub-tenant';

export type WalletFreezeModalContext = {
  variant: WalletFreezeModalVariant;
  walletId: string;
  /** Display name: tenant name, product label, or sub-tenant wallet label. */
  targetName: string;
  /** Sub-tenant count under a product (freeze-product only). */
  subTenantCount?: number;
};

interface WalletFreezeStatusModalProps {
  isOpen: boolean;
  context: WalletFreezeModalContext | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function WalletFreezeStatusModal({
  isOpen,
  context,
  isLoading,
  onClose,
  onConfirm,
}: Readonly<WalletFreezeStatusModalProps>) {
  const { translate } = useLocalization('tenant-details.walletTopUp');
  const [confirmText, setConfirmText] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
      setAcknowledged(false);
    }
  }, [isOpen, context?.walletId, context?.variant]);

  if (!context) {
    return null;
  }

  const { variant, targetName, subTenantCount = 0 } = context;
  const isFreeze = variant.startsWith('freeze');
  const cancelLabel = translate('freezeModals.actions.no');
  const confirmLabel = translate('freezeModals.actions.yes');

  let title = '';
  let description = '';
  let isConfirmDisabled = false;
  let children: ReactNode = null;

  switch (variant) {
    case 'freeze-master': {
      title = translate('freezeModals.freezeMaster.title');
      description = translate('freezeModals.freezeMaster.description');
      isConfirmDisabled =
        confirmText.trim().toLowerCase() !== targetName.trim().toLowerCase();
      children = (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-mds-black-800">
            {translate('freezeModals.freezeMaster.typePromptPrefix')}{' '}
            <span className="font-bold">{targetName}</span>{' '}
            {translate('freezeModals.freezeMaster.typePromptSuffix')}
          </p>
          <InputField
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder={targetName}
            autoComplete="off"
          />
        </div>
      );
      break;
    }
    case 'unfreeze-master': {
      title = translate('freezeModals.unfreezeMaster.title');
      description = translate('freezeModals.unfreezeMaster.description');
      children = (
        <WalletFreezeInfoCallout
          message={translate('freezeModals.unfreezeMaster.callout')}
        />
      );
      break;
    }
    case 'freeze-product': {
      title = translate('freezeModals.freezeProduct.title', {
        productName: targetName,
      });
      description = translate('freezeModals.freezeProduct.description', {
        productName: targetName,
        count: String(subTenantCount),
      });
      isConfirmDisabled = !acknowledged;
      children = (
        <>
          <WalletFreezeInfoCallout
            message={translate('freezeModals.freezeProduct.callout')}
          />
          <Checkbox
            checked={acknowledged}
            onCheckedChange={(checked) => setAcknowledged(checked === true)}
            label={translate('freezeModals.freezeProduct.acknowledge', {
              productName: targetName,
            })}
          />
        </>
      );
      break;
    }
    case 'unfreeze-product': {
      title = translate('freezeModals.unfreezeProduct.title', {
        productName: targetName,
      });
      description = translate('freezeModals.unfreezeProduct.description', {
        productName: targetName,
      });
      children = (
        <WalletFreezeInfoCallout
          message={translate('freezeModals.unfreezeProduct.callout')}
        />
      );
      break;
    }
    case 'freeze-sub-tenant': {
      title = translate('freezeModals.freezeSubTenant.title', {
        walletName: targetName,
      });
      description = translate('freezeModals.freezeSubTenant.description');
      break;
    }
    case 'unfreeze-sub-tenant': {
      title = translate('freezeModals.unfreezeSubTenant.title', {
        walletName: targetName,
      });
      description = translate('freezeModals.unfreezeSubTenant.description');
      break;
    }
    default:
      break;
  }

  return (
    <WalletFreezeConfirmLayout
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      cancelLabel={cancelLabel}
      confirmLabel={confirmLabel}
      confirmVariant={isFreeze ? 'negative' : 'primary'}
      isConfirmDisabled={isConfirmDisabled}
      isLoading={isLoading}
      onConfirm={onConfirm}
    >
      {children}
    </WalletFreezeConfirmLayout>
  );
}
