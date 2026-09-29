'use client';

import { Check } from 'lucide-react';
import type { FormEvent } from 'react';

import { BaseDialog } from '@/components/BaseDialog';
import { useLocalization } from '@/hooks/useLocalization';
import type { ActivationRequestCardItem } from '@/types/catalog';

import { ActivationDialogInfoCallout } from '../ActivationDialogInfoCallout';

interface ApproveCardActivationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  card: ActivationRequestCardItem | null;
  tenantName: string;
  businessOwnerEmail: string;
  onConfirm?: () => void;
  isSubmitting?: boolean;
}

export function ApproveCardActivationDialog({
  isOpen,
  onClose,
  card,
  tenantName,
  businessOwnerEmail,
  onConfirm,
  isSubmitting = false,
}: Readonly<ApproveCardActivationDialogProps>) {
  const { translate } = useLocalization('catalog');

  if (!card) return null;

  const rows = [
    {
      label: translate('giftCardManagement.approveDialog.card'),
      value: card.name,
    },
    {
      label: translate('giftCardManagement.approveDialog.brand'),
      value: card.brand,
    },
    {
      label: translate('giftCardManagement.approveDialog.productId'),
      value: card.productId,
    },
    {
      label: translate('giftCardManagement.approveDialog.tenant'),
      value: tenantName,
    },
    {
      label: translate('giftCardManagement.approveDialog.businessOwner'),
      value: businessOwnerEmail,
    },
  ];

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    onConfirm?.();
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
      closeOnOutsideClick={!isSubmitting}
      title={translate('giftCardManagement.approveDialog.title')}
      description={translate('giftCardManagement.approveDialog.subtitle')}
      secondaryButtonText={translate('giftCardManagement.approveDialog.cancel')}
      onSecondaryAction={onClose}
      submitButtonText={translate('giftCardManagement.approveDialog.confirm')}
      submitButtonIcon={<Check className="h-4 w-4" aria-hidden />}
      className="w-[min(100%,44rem)] max-w-[calc(100vw-2rem)]"
    >
      <dl className="space-y-3">
        {rows.map((row) => (
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

      <ActivationDialogInfoCallout
        title={translate('giftCardManagement.approveDialog.whatHappensNext')}
        items={[
          translate('giftCardManagement.approveDialog.nextItem1'),
          translate('giftCardManagement.approveDialog.nextItem2'),
        ]}
      />
    </BaseDialog>
  );
}
