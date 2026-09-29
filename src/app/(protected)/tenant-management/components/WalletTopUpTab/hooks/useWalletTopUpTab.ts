'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from '@merit-incentives/ui';

import {
  usePendingReviewWalletOperations,
  useWalletOperation,
  useWalletSummary,
} from '@/api-queries/wallets';
import { useLocalization } from '@/hooks';

import {
  isWalletDetailReadyForApproval,
  resolveCurrencyLabel,
  toPendingReviewTransfer,
  toProductWalletGroups,
  toTenantWalletCard,
  toTenantWalletTableEntries,
} from '../utils/walletTopUpMappers';

type ReviewModalView = 'review' | 'approve' | 'reject' | null;

interface UseWalletTopUpTabArgs {
  tenantId: string;
  tenantName: string;
}

export function useWalletTopUpTab({
  tenantId,
  tenantName,
}: Readonly<UseWalletTopUpTabArgs>) {
  const { translate } = useLocalization('tenant-details.walletTopUp');
  const [reviewModalView, setReviewModalView] = useState<ReviewModalView>(null);
  const [reviewOperationId, setReviewOperationId] = useState<string | null>(
    null,
  );

  const summaryQuery = useWalletSummary(tenantId);
  const pendingReviewQuery = usePendingReviewWalletOperations(tenantId);

  const detailQuery = useWalletOperation(
    tenantId,
    reviewOperationId,
    reviewModalView !== null,
  );

  const pendingReview = useMemo(
    () =>
      toPendingReviewTransfer({
        operations: pendingReviewQuery.data ?? [],
        summary: summaryQuery.data,
      }),
    [pendingReviewQuery.data, summaryQuery.data],
  );

  const reviewPendingOperation = useMemo(
    () =>
      (pendingReviewQuery.data ?? []).find(
        (operation) =>
          operation.id === reviewOperationId &&
          operation.status === 'PENDING_APPROVAL',
      ) ?? null,
    [pendingReviewQuery.data, reviewOperationId],
  );

  const reviewPending = useMemo(() => {
    if (!reviewPendingOperation) {
      return null;
    }
    const mapped = toPendingReviewTransfer({
      operations: [reviewPendingOperation],
      summary: summaryQuery.data,
      detail:
        detailQuery.data?.id === reviewOperationId ? detailQuery.data : null,
    });
    return mapped
      ? {
          ...mapped,
          count: pendingReview?.count ?? 1,
        }
      : null;
  }, [
    detailQuery.data,
    pendingReview?.count,
    reviewOperationId,
    reviewPendingOperation,
    summaryQuery.data,
  ]);

  const isDetailReady =
    isWalletDetailReadyForApproval(detailQuery.data, reviewOperationId) &&
    detailQuery.isSuccess &&
    !detailQuery.isFetching &&
    !detailQuery.isError;

  useEffect(() => {
    if (
      reviewOperationId &&
      pendingReviewQuery.isSuccess &&
      !reviewPendingOperation
    ) {
      setReviewModalView(null);
      setReviewOperationId(null);
    }
  }, [pendingReviewQuery.isSuccess, reviewOperationId, reviewPendingOperation]);

  useEffect(() => {
    if (
      reviewOperationId &&
      detailQuery.isSuccess &&
      detailQuery.data.id === reviewOperationId &&
      detailQuery.data.status !== 'PENDING_APPROVAL'
    ) {
      setReviewModalView(null);
      setReviewOperationId(null);
    }
  }, [detailQuery.data, detailQuery.isSuccess, reviewOperationId]);

  useEffect(() => {
    setReviewModalView(null);
    setReviewOperationId(null);
  }, [tenantId]);

  const masterWallets = useMemo(() => {
    const summary = summaryQuery.data;
    if (!summary) {
      return [];
    }
    return summary.masterWallets.map((wallet) =>
      toTenantWalletCard(wallet, {
        isDefault: wallet.currencyCode === summary.primaryCurrencyCode,
        currencyMetadata: summary.currencies[wallet.currencyCode],
      }),
    );
  }, [summaryQuery.data]);

  const productWallets = useMemo(
    () => (summaryQuery.data ? toProductWalletGroups(summaryQuery.data) : []),
    [summaryQuery.data],
  );

  const tenantWallets = useMemo(
    () =>
      summaryQuery.data ? toTenantWalletTableEntries(summaryQuery.data) : [],
    [summaryQuery.data],
  );

  const isLoading = summaryQuery.isLoading || pendingReviewQuery.isLoading;
  const isError = summaryQuery.isError || pendingReviewQuery.isError;

  const closeReviewModals = () => {
    setReviewModalView(null);
    setReviewOperationId(null);
  };

  const handleOpenApproveModal = () => {
    void (async () => {
      try {
        const result = await detailQuery.refetch();
        if (result.isError) {
          toast.error(translate('reviewModals.detail.error'));
          return;
        }
        if (!isWalletDetailReadyForApproval(result.data, reviewOperationId)) {
          toast.error(translate('reviewModals.detail.incomplete'));
          return;
        }
        setReviewModalView('approve');
      } catch {
        toast.error(translate('reviewModals.detail.error'));
      }
    })();
  };

  const handleOpenRejectModal = () => {
    setReviewModalView('reject');
  };

  const handleRetry = () => {
    Promise.all([summaryQuery.refetch(), pendingReviewQuery.refetch()]).catch(
      () => undefined,
    );
  };

  const handleRetryDetail = () => {
    detailQuery.refetch().catch(() => undefined);
  };

  const summary = summaryQuery.data;
  const reviewContext =
    reviewPending === null
      ? null
      : {
          tenantName,
          pendingReview: reviewPending,
        };

  const primaryCurrencyMetadata = summary?.primaryCurrencyCode
    ? summary.currencies[summary.primaryCurrencyCode]
    : undefined;
  const primaryCurrencyLabel = summary?.primaryCurrencyCode
    ? resolveCurrencyLabel(summary.primaryCurrencyCode, summary.currencies)
    : translate('totalBalance.noPrimary');
  const displayedPrimaryCurrencyLabel =
    primaryCurrencyMetadata?.isEnabled === false
      ? `${primaryCurrencyLabel} · ${translate('currency.disabled')}`
      : primaryCurrencyLabel;

  return {
    translate,
    tenantId,
    tenantName,
    reviewModalView,
    reviewContext,
    isDetailReady,
    isDetailLoading: detailQuery.isLoading || detailQuery.isFetching,
    isDetailFetching: detailQuery.isFetching,
    isDetailError: detailQuery.isError,
    masterWallets,
    productWallets,
    tenantWallets,
    isLoading,
    isError,
    summary,
    displayedPrimaryCurrencyLabel,
    closeReviewModals,
    handleOpenApproveModal,
    handleOpenRejectModal,
    handleRetry,
    handleRetryDetail,
  };
}
