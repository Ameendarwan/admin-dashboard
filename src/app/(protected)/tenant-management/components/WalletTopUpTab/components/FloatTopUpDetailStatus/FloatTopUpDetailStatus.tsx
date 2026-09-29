'use client';

import { Button } from '@merit-incentives/ui';

import { useLocalization } from '@/hooks';

interface FloatTopUpDetailStatusProps {
  isLoading: boolean;
  isError: boolean;
  isReady?: boolean;
  showIncomplete?: boolean;
  onRetry: () => void;
}

export function FloatTopUpDetailStatus({
  isLoading,
  isError,
  isReady = true,
  showIncomplete = false,
  onRetry,
}: Readonly<FloatTopUpDetailStatusProps>) {
  const { translate } = useLocalization('tenant-details.walletTopUp');

  return (
    <>
      {isLoading ? (
        <p className="text-sm text-mds-black-600" aria-live="polite">
          {translate('reviewModals.detail.loading')}
        </p>
      ) : null}
      {isError ? (
        <div
          className="flex flex-col items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3"
          role="alert"
        >
          <p className="text-sm text-red-700">
            {translate('reviewModals.detail.error')}
          </p>
          <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
            {translate('retry')}
          </Button>
        </div>
      ) : null}
      {showIncomplete && !isLoading && !isError && !isReady ? (
        <p className="text-sm text-red-700" role="alert">
          {translate('reviewModals.detail.incomplete')}
        </p>
      ) : null}
    </>
  );
}
