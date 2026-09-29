'use client';

import { TextArea } from '@merit-incentives/ui';
import { Info, X } from 'lucide-react';
import { useEffect, type FormEvent } from 'react';

import { BaseDialog } from '@/components/BaseDialog';
import { useLocalization } from '@/hooks/useLocalization';
import type { PendingProductionIpRowApi } from '@/types/rewards-portal/certificationApi';

interface IpWhitelistRejectDialogProps {
  isOpen: boolean;
  row: PendingProductionIpRowApi | null;
  reason: string;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function IpWhitelistRejectDialog({
  isOpen,
  row,
  reason,
  onReasonChange,
  onClose,
  onConfirm,
  isSubmitting = false,
}: Readonly<IpWhitelistRejectDialogProps>) {
  const { translate } = useLocalization('rewards-portal');

  useEffect(() => {
    if (isOpen) {
      onReasonChange('');
    }
  }, [isOpen, onReasonChange]);

  if (!row) {
    return null;
  }

  const canConfirm = reason.trim().length > 0;
  const requestReason = row.reason?.trim() || '—';

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
      title={translate('ipWhitelist.pending.reject.title', {
        ipAddress: row.ipAddress,
      })}
      description={translate('ipWhitelist.pending.reject.description')}
      secondaryButtonText={translate('ipWhitelist.pending.reject.cancel')}
      onSecondaryAction={onClose}
      submitButtonText={translate('ipWhitelist.pending.reject.confirm')}
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
            {translate('ipWhitelist.pending.reject.callout', {
              ipAddress: row.ipAddress,
            })}
          </p>
        </div>
      </div>

      <section className="flex w-full flex-col gap-4 rounded-mds-md bg-mds-bg-light-50 p-5">
        <div className="flex items-start justify-between gap-4">
          <span className="text-base font-normal leading-[1.4] text-mds-black-900">
            {translate('ipWhitelist.pending.reject.fields.ip')}
          </span>
          <span className="text-right text-base font-normal leading-[1.4] text-mds-black-900">
            {row.ipAddress}
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="text-base font-normal leading-[1.4] text-mds-black-900">
            {translate('ipWhitelist.pending.reject.fields.environment')}
          </span>
          <span className="text-right text-base font-normal leading-[1.4] text-mds-black-900">
            {row.environment}
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="text-base font-normal leading-[1.4] text-mds-black-900">
            {translate('ipWhitelist.pending.reject.fields.reason')}
          </span>
          <span className="text-right text-base font-normal leading-[1.4] text-mds-black-900">
            {requestReason}
          </span>
        </div>
      </section>

      <TextArea
        className="w-full"
        label={translate('ipWhitelist.pending.reject.reasonLabel')}
        placeholder={translate('ipWhitelist.pending.reject.reasonPlaceholder')}
        value={reason}
        onChange={(event) => onReasonChange(event.target.value)}
        required
        rows={5}
      />
    </BaseDialog>
  );
}
