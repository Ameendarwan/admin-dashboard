'use client';

import { Button } from '@merit-incentives/ui/components';

import { useLocalization } from '@/hooks/useLocalization';

type RevisionRequestControlProps = {
  isRevisionMode: boolean;
  isSubmitting: boolean;
  hasRevisionRequests: boolean;
  onEnterRevisionMode: () => void;
  onSendRevisionRequest: () => void;
  onCancelRevisionMode: () => void;
};

export function RevisionRequestControl({
  isRevisionMode,
  isSubmitting,
  hasRevisionRequests,
  onEnterRevisionMode,
  onSendRevisionRequest,
  onCancelRevisionMode,
}: Readonly<RevisionRequestControlProps>) {
  const { translate: tReview } = useLocalization('user-review-page');

  if (!isRevisionMode) {
    return (
      <Button variant="tertiary" onClick={onEnterRevisionMode} className="w-47">
        {tReview('actions.requestRevision')}
      </Button>
    );
  }

  if (isSubmitting) {
    return (
      <div className="flex w-53.25 items-center justify-center p-2">
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-[#FF6868]" />
        <span className="text-[#FF6868]">{tReview('sending')}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={onCancelRevisionMode}
        className="min-w-[6.5rem]"
      >
        {tReview('actions.cancel')}
      </Button>
      <Button
        variant="tertiary"
        onClick={onSendRevisionRequest}
        disabled={!hasRevisionRequests}
        className="min-w-[8.5rem] border-[#FF6868] text-[#FF6868]"
      >
        {tReview('actions.sendRevisionRequest')}
      </Button>
    </div>
  );
}
