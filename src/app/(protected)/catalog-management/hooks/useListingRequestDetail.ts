'use client';

import { toast } from '@merit-incentives/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { catalogQueryKeys } from '@/api-queries/catalog/catalogQueryKeys';
import { invalidateCatalogActiveListings } from '@/api-queries/catalog/invalidateCatalogActiveListings';
import { invalidateCatalogActiveOffers } from '@/api-queries/catalog/invalidateCatalogActiveOffers';
import { useCatalogListingRequestQuery } from '@/api-queries/catalog/useCatalogAdminQueries';
import { listingRequestDetailFromApi } from '@/app/(protected)/catalog-management/lib/listingRequestMappers';
import { isListingRequestWorkflowTerminal } from '@/app/(protected)/catalog-management/lib/listingRequestRowFieldReaders';
import { adminCatalogAxiosMessage } from '@/app/(protected)/catalog-management/utils/adminCatalogAxiosMessage';
import { useLocalization } from '@/hooks/useLocalization';
import { approveCatalogListingRequest } from '@/app/(protected)/catalog-management/lib/listingRequestApproveFlow';
import {
  getCatalogListingRequest,
  patchCatalogListingRequestStatus,
} from '@/services/catalogAdminService';

/** Listing request detail: load row, approve (ecommerce orchestration), reject, refresh cache. */
export function useListingRequestDetail(requestId: string) {
  const { translate } = useLocalization('catalog');
  const queryClient = useQueryClient();
  const trimmed = requestId.trim();
  const detailQuery = useCatalogListingRequestQuery(requestId);

  const detail = detailQuery.data ?? null;
  const loading = Boolean(trimmed) && detailQuery.isPending;
  const loadError = useMemo(() => {
    if (!trimmed) {
      return translate('notFound');
    }
    if (detailQuery.isError) {
      return adminCatalogAxiosMessage(detailQuery.error);
    }
    if (detailQuery.isSuccess && detailQuery.data === null) {
      return translate('notFound');
    }
    return null;
  }, [
    detailQuery.data,
    detailQuery.error,
    detailQuery.isError,
    detailQuery.isSuccess,
    translate,
    trimmed,
  ]);

  const [mainImage, setMainImage] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setMainImage(0);
  }, [detail?.id]);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const approveLocked = isListingRequestWorkflowTerminal(
    detail?.workflowStatus,
  );
  const rejectLocked = detail?.workflowStatus === 'rejected';
  const showWorkflowActions = !approveLocked;

  const invalidateListingRequestsList = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: [...catalogQueryKeys.all, 'listing-requests'],
    });
  }, [queryClient]);

  const applyDetailFromApiPayload = useCallback(
    async (payload: Record<string, unknown> | null | undefined) => {
      const key = catalogQueryKeys.listingRequest(trimmed);
      const mapped = listingRequestDetailFromApi(payload ?? undefined);
      if (mapped) {
        queryClient.setQueryData(key, mapped);
        return true;
      }
      const raw = await getCatalogListingRequest(trimmed);
      const fallback = listingRequestDetailFromApi(
        raw as Record<string, unknown>,
      );
      if (fallback) {
        queryClient.setQueryData(key, fallback);
        return true;
      }
      toast.error(translate('notFound'));
      return false;
    },
    [queryClient, translate, trimmed],
  );

  const openRejectModal = useCallback(() => {
    if (!detail || rejectLocked || actionLoading) {
      return;
    }
    setRejectModalOpen(true);
  }, [actionLoading, detail, rejectLocked]);

  const closeRejectModal = useCallback(() => {
    if (actionLoading) {
      return;
    }
    setRejectModalOpen(false);
  }, [actionLoading]);

  const onConfirmReject = useCallback(
    async (reason: string) => {
      if (!detail || rejectLocked || actionLoading) {
        return;
      }
      setActionLoading(true);
      try {
        const data = await patchCatalogListingRequestStatus(requestId, {
          status: 'rejected',
          reason,
        });
        toast.info(translate('status.rejected'));
        await applyDetailFromApiPayload(data);
        invalidateListingRequestsList();
        setRejectModalOpen(false);
      } catch (e) {
        toast.error(adminCatalogAxiosMessage(e));
        throw e;
      } finally {
        setActionLoading(false);
      }
    },
    [
      actionLoading,
      applyDetailFromApiPayload,
      detail,
      invalidateListingRequestsList,
      rejectLocked,
      requestId,
      translate,
    ],
  );

  const onApprove = useCallback(async () => {
    if (!detail || approveLocked || actionLoading) {
      return;
    }
    setActionLoading(true);
    try {
      const data = await approveCatalogListingRequest(requestId);
      toast.success(translate('status.approved'));
      const rowPayload = data?.row;
      if (rowPayload && typeof rowPayload === 'object') {
        await applyDetailFromApiPayload(rowPayload as Record<string, unknown>);
      } else {
        await applyDetailFromApiPayload(undefined);
      }
      invalidateListingRequestsList();
      invalidateCatalogActiveListings(queryClient);
      invalidateCatalogActiveOffers(queryClient);
    } catch (e) {
      toast.error(adminCatalogAxiosMessage(e));
    } finally {
      setActionLoading(false);
    }
  }, [
    actionLoading,
    applyDetailFromApiPayload,
    approveLocked,
    detail,
    invalidateListingRequestsList,
    queryClient,
    requestId,
    translate,
  ]);

  return {
    loading,
    loadError,
    detail,
    mainImage,
    setMainImage,
    actionLoading,
    approveLocked,
    rejectLocked,
    showWorkflowActions,
    rejectModalOpen,
    openRejectModal,
    closeRejectModal,
    onConfirmReject,
    onApprove,
    translate,
  };
}
