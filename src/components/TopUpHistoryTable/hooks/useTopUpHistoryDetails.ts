'use client';

import { useCallback, useMemo, useState } from 'react';

import { useWalletOperation } from '@/api-queries/wallets';
import { useLocalization } from '@/hooks';
import type { WalletSummary } from '@/types/walletAdminApi';
import { toTopUpDetailsView } from '@/utils/walletTopUp';
import type { TopUpHistoryEntry } from '@/utils/walletTopUp';

interface UseTopUpHistoryDetailsArgs {
  tenantId: string;
  summary: WalletSummary;
}

export function useTopUpHistoryDetails({
  tenantId,
  summary,
}: Readonly<UseTopUpHistoryDetailsArgs>) {
  const { locale, translate } = useLocalization('tenant-details.walletTopUp');
  const [selectedEntry, setSelectedEntry] = useState<TopUpHistoryEntry | null>(
    null,
  );

  const operationId = selectedEntry?.id ?? null;
  const detailQuery = useWalletOperation(
    tenantId,
    operationId,
    Boolean(operationId),
  );

  const details = useMemo(() => {
    if (!selectedEntry) {
      return null;
    }
    return toTopUpDetailsView({
      entry: selectedEntry,
      detail:
        detailQuery.data?.id === selectedEntry.id ? detailQuery.data : null,
      currencies: summary.currencies,
      translate,
      locale,
    });
  }, [detailQuery.data, locale, selectedEntry, summary.currencies, translate]);

  const openDetails = useCallback((entry: TopUpHistoryEntry) => {
    setSelectedEntry(entry);
  }, []);

  const closeDetails = useCallback(() => {
    setSelectedEntry(null);
  }, []);

  return {
    isDetailsOpen: Boolean(selectedEntry),
    details,
    isDetailsLoading: Boolean(operationId) && detailQuery.isFetching,
    isDetailsError: Boolean(operationId) && detailQuery.isError,
    openDetails,
    closeDetails,
    retryDetails: detailQuery.refetch,
  };
}
