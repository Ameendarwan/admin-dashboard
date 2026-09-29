'use client';

import { Button } from '@merit-incentives/ui';
import { Check, X } from 'lucide-react';

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

interface ListingRequestWorkflowActionsProps {
  translate: TranslateFn;
  actionLoading: boolean;
  rejectLocked: boolean;
  approveLocked: boolean;
  onOpenRejectModal: () => void;
  onApprove: () => Promise<void>;
}

export function ListingRequestWorkflowActions({
  translate,
  actionLoading,
  rejectLocked,
  approveLocked,
  onOpenRejectModal,
  onApprove,
}: Readonly<ListingRequestWorkflowActionsProps>) {
  return (
    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
      <Button
        variant="tertiary"
        loading={actionLoading}
        disabled={rejectLocked || actionLoading}
        onClick={() => {
          onOpenRejectModal();
        }}
        leftIcon={
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#EF6B5F]">
            <X
              className="h-3.5 w-3.5 text-[#EF6B5F]"
              aria-hidden
              strokeWidth={2.5}
            />
          </span>
        }
        className="h-12 shrink-0 rounded-full border-2 border-[#EF6B5F] bg-white px-8 text-base font-medium !text-[#EF6B5F] shadow-none hover:bg-[#EF6B5F]/10 focus-visible:ring-2 focus-visible:ring-[#EF6B5F]/35 focus-visible:ring-offset-2"
        type="button"
      >
        {translate('listingRequest.reject')}
      </Button>
      <Button
        variant="primary"
        loading={actionLoading}
        disabled={approveLocked || actionLoading}
        onClick={() => {
          onApprove().catch(() => undefined);
        }}
        leftIcon={
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white">
            <Check
              className="h-3.5 w-3.5 text-white"
              aria-hidden
              strokeWidth={2.5}
            />
          </span>
        }
        className="h-12 shrink-0 rounded-full !border-0 !bg-[#2321C8] px-8 text-base font-medium !text-white shadow-none hover:!bg-[#1c1ba3] focus-visible:ring-2 focus-visible:ring-[#2321C8]/40 focus-visible:ring-offset-2"
        type="button"
      >
        {translate('listingRequest.approve')}
      </Button>
    </div>
  );
}
