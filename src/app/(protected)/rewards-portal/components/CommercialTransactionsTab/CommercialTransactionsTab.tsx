'use client';

import { Button } from '@merit-incentives/ui';

import { useWalletSummary } from '@/api-queries/wallets';
import { Spinner } from '@/components/Spinner';
import { TopUpHistoryTable } from '@/components/TopUpHistoryTable';
import { useLocalization } from '@/hooks';

// import { CommercialSettingsSection } from './components';

type CommercialTransactionsTabProps = {
  tenantId: string;
};

export function CommercialTransactionsTab({
  tenantId,
}: Readonly<CommercialTransactionsTabProps>) {
  const { translate } = useLocalization('rewards-portal');
  const summaryQuery = useWalletSummary(tenantId);

  if (summaryQuery.isLoading) {
    return (
      <Spinner
        text={translate('commercialTransactions.topUpHistory.loading')}
      />
    );
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return (
      <div className="flex flex-col gap-3 items-center">
        <p className="text-sm font-normal text-red-600">
          {translate('commercialTransactions.topUpHistory.loadError')}
        </p>
        <Button
          type="button"
          variant="secondary"
          className="max-w-max"
          onClick={() => {
            void summaryQuery.refetch();
          }}
        >
          {translate('commercialTransactions.topUpHistory.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-6">
      {/* <CommercialSettingsSection /> */}
      <TopUpHistoryTable tenantId={tenantId} summary={summaryQuery.data} />
    </div>
  );
}
