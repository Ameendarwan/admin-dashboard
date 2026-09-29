'use client';

import { Button, Popup, TextArea } from '@merit-incentives/ui';
import { useEffect, useId, useState } from 'react';

const FORM_ID = 'reject-listing-request-form';
const REASON_MAX_LENGTH = 500;

type RejectListingRequestModalProps = Readonly<{
  isOpen: boolean;
  submitting: boolean;
  translate: (key: string, values?: Record<string, string | number>) => string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}>;

export function RejectListingRequestModal({
  isOpen,
  submitting,
  translate,
  onClose,
  onConfirm,
}: RejectListingRequestModalProps) {
  const titleId = useId();
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
    }
  }, [isOpen]);

  const trimmed = reason.trim();
  const canSubmit = trimmed.length > 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await onConfirm(trimmed);
    } catch {
      /* parent shows toast */
    }
  }

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={!submitting}
      role="dialog"
      aria-labelledby={titleId}
      className="w-[min(100%,28rem)] max-w-[calc(100vw-2rem)]"
    >
      <Popup.Header onClose={onClose} showDivider className="px-6 py-5 sm:px-8">
        <h2
          id={titleId}
          className="text-lg font-semibold tracking-tight text-mds-black-900 sm:text-xl"
        >
          {translate('listingRequest.rejectModal.title')}
        </h2>
      </Popup.Header>

      <Popup.Content showDivider className="px-6 py-6 sm:px-8">
        <form id={FORM_ID} onSubmit={(e) => void handleSubmit(e)}>
          <p className="mb-4 text-sm text-mds-black-600">
            {translate('listingRequest.rejectModal.description')}
          </p>
          <TextArea
            label={translate('listingRequest.rejectModal.reasonLabel')}
            placeholder={translate(
              'listingRequest.rejectModal.reasonPlaceholder',
            )}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={REASON_MAX_LENGTH}
            rows={4}
            className="w-full max-w-none"
            required
          />
        </form>
      </Popup.Content>

      <Popup.Footer className="px-6 py-4 sm:px-8">
        <div className="flex w-full items-center justify-between gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
            className="min-w-[7.25rem] rounded-xl border-transparent bg-mds-primary-50 !text-mds-primary-700 shadow-none hover:bg-mds-primary-100 hover:!text-mds-primary-900"
          >
            {translate('listingRequest.rejectModal.cancel')}
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            variant="primary"
            loading={submitting}
            disabled={!canSubmit}
            className={`min-w-[7.25rem] rounded-xl ${
              canSubmit
                ? ''
                : '!border-0 !bg-mds-black-100 !text-mds-black-500 hover:!bg-mds-black-100 hover:!text-mds-black-500 cursor-not-allowed'
            }`}
          >
            {translate('listingRequest.rejectModal.confirm')}
          </Button>
        </div>
      </Popup.Footer>
    </Popup>
  );
}
