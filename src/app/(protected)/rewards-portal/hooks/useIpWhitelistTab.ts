'use client';

import { useCallback, useState } from 'react';
import { toast } from '@merit-incentives/ui';

import {
  useDecideProductionIpsMutation,
  usePendingProductionIpsQuery,
} from '@/api-queries/rewards-portal/certification';
import { useLocalization } from '@/hooks/useLocalization';
import type { PendingProductionIpRowApi } from '@/types/rewards-portal/certificationApi';

import { useIpWhitelistPendingTableColumns } from './useIpWhitelistPendingTableColumns';
import { useIpWhitelistSafelistTableColumns } from './useIpWhitelistSafelistTableColumns';

type IpWhitelistDialog = 'approve' | 'reject' | null;

interface UseIpWhitelistTabProps {
  tenantId: string;
}

export function useIpWhitelistTab({ tenantId }: UseIpWhitelistTabProps) {
  const { translate } = useLocalization('rewards-portal');
  const [activeDialog, setActiveDialog] = useState<IpWhitelistDialog>(null);
  const [selectedRow, setSelectedRow] =
    useState<PendingProductionIpRowApi | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [decidingRequestId, setDecidingRequestId] = useState<string | null>(
    null,
  );

  const pendingQuery = usePendingProductionIpsQuery(tenantId, {
    enabled: Boolean(tenantId),
    status: 'IN_REVIEW',
  });

  const safelistQuery = usePendingProductionIpsQuery(tenantId, {
    enabled: Boolean(tenantId),
    status: 'APPROVED',
  });

  const decideMutation = useDecideProductionIpsMutation();

  const closeDialog = useCallback(() => {
    if (decidingRequestId) {
      return;
    }
    setActiveDialog(null);
    setSelectedRow(null);
    setRejectionReason('');
  }, [decidingRequestId]);

  const handleDecide = useCallback(
    async (
      row: PendingProductionIpRowApi,
      status: 'APPROVED' | 'REJECTED',
      reason?: string,
    ) => {
      setDecidingRequestId(row.requestId);
      try {
        await decideMutation.mutateAsync({
          requestId: row.requestId,
          body:
            status === 'REJECTED'
              ? {
                  status,
                  rejectionReason:
                    reason?.trim() ||
                    translate('ipWhitelist.pending.defaultRejectionReason'),
                }
              : { status },
        });
        toast.success(
          translate(
            status === 'APPROVED'
              ? 'ipWhitelist.pending.toast.approveSuccess'
              : 'ipWhitelist.pending.toast.rejectSuccess',
          ),
        );
        setActiveDialog(null);
        setSelectedRow(null);
        setRejectionReason('');
      } catch {
        toast.error(
          translate(
            status === 'APPROVED'
              ? 'ipWhitelist.pending.toast.approveError'
              : 'ipWhitelist.pending.toast.rejectError',
          ),
        );
      } finally {
        setDecidingRequestId(null);
      }
    },
    [decideMutation, translate],
  );

  const onApprove = useCallback((row: PendingProductionIpRowApi) => {
    setSelectedRow(row);
    setActiveDialog('approve');
  }, []);

  const onReject = useCallback((row: PendingProductionIpRowApi) => {
    setSelectedRow(row);
    setActiveDialog('reject');
  }, []);

  const confirmApprove = useCallback(() => {
    if (!selectedRow) {
      return;
    }
    void handleDecide(selectedRow, 'APPROVED');
  }, [handleDecide, selectedRow]);

  const confirmReject = useCallback(() => {
    if (!selectedRow || !rejectionReason.trim()) {
      return;
    }
    void handleDecide(selectedRow, 'REJECTED', rejectionReason);
  }, [handleDecide, rejectionReason, selectedRow]);

  const columns = useIpWhitelistPendingTableColumns({
    translate,
    onApprove,
    onReject,
    decidingRequestId,
  });

  const safelistColumns = useIpWhitelistSafelistTableColumns({ translate });

  return {
    translate,
    columns,
    rows: pendingQuery.data?.data ?? [],
    loading: pendingQuery.isLoading || pendingQuery.isFetching,
    error: pendingQuery.isError,
    retrying: pendingQuery.isFetching,
    onRetry: () => {
      void pendingQuery.refetch();
    },
    safelistColumns,
    safelistRows: safelistQuery.data?.data ?? [],
    safelistLoading: safelistQuery.isLoading || safelistQuery.isFetching,
    safelistError: safelistQuery.isError,
    safelistRetrying: safelistQuery.isFetching,
    onSafelistRetry: () => {
      void safelistQuery.refetch();
    },
    activeDialog,
    selectedRow,
    rejectionReason,
    setRejectionReason,
    closeDialog,
    confirmApprove,
    confirmReject,
    isDeciding: Boolean(decidingRequestId),
  };
}
