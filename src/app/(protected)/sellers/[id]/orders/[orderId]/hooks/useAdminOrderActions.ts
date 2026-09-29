import { useState, useCallback } from 'react';
import { toast } from 'sonner';

import { useLocalization } from '@/hooks/useLocalization';
import {
  executeAdminOrderAction,
  getProofDownloadUrl,
  getAwbDownloadUrl,
} from '@/services/sellerService';

interface UseAdminOrderActionsParams {
  tenantId: string;
  orderId: string;
  refetch: () => void;
}

export function useAdminOrderActions({
  tenantId,
  orderId,
  refetch,
}: UseAdminOrderActionsParams) {
  const { translate } = useLocalization('order-details');

  const [isMarkingReceived, setIsMarkingReceived] = useState(false);
  const [isRejectingQc, setIsRejectingQc] = useState(false);
  const [isRequestingAwb, setIsRequestingAwb] = useState(false);

  const handleMarkAsReceived = useCallback(async () => {
    try {
      setIsMarkingReceived(true);
      await executeAdminOrderAction(tenantId, orderId, 'MARK_AS_RECEIVED');
      toast.success(translate('toasts.markReceivedSuccess'));
      refetch();
    } catch {
      toast.error(translate('toasts.markReceivedError'));
    } finally {
      setIsMarkingReceived(false);
    }
  }, [tenantId, orderId, refetch, translate]);

  const handleRejectQc = useCallback(
    async (file: File): Promise<boolean> => {
      if (!file) {
        toast.error(translate('toasts.qcProofRequired'));
        return false;
      }
      try {
        setIsRejectingQc(true);
        await executeAdminOrderAction(tenantId, orderId, 'REJECT_QC', file);
        toast.success(translate('toasts.rejectQcSuccess'));
        refetch();
        return true;
      } catch {
        toast.error(translate('toasts.rejectQcError'));
        return false;
      } finally {
        setIsRejectingQc(false);
      }
    },
    [tenantId, orderId, refetch, translate],
  );

  const handleRequestAwbAndShip = useCallback(async (): Promise<boolean> => {
    try {
      setIsRequestingAwb(true);
      await executeAdminOrderAction(
        tenantId,
        orderId,
        'REQUEST_AWB_AND_SHIP',
      );
      toast.success(translate('toasts.requestAwbShipSuccess'));
      refetch();
      return true;
    } catch {
      toast.error(translate('toasts.requestAwbShipError'));
      return false;
    } finally {
      setIsRequestingAwb(false);
    }
  }, [tenantId, orderId, refetch, translate]);

  const openSignedUrl = useCallback(
    (data: { downloadUrl?: string; url?: string } | null | undefined) => {
      const href = data?.downloadUrl ?? data?.url;
      if (href) {
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    },
    [],
  );

  const handleViewSellerProof = useCallback(async () => {
    try {
      const data = await getProofDownloadUrl(tenantId, orderId, 'seller');
      openSignedUrl(data);
    } catch {
      toast.error(translate('toasts.proofDownloadError'));
    }
  }, [tenantId, orderId, translate, openSignedUrl]);

  const handleViewQcProof = useCallback(async () => {
    try {
      const data = await getProofDownloadUrl(tenantId, orderId, 'admin');
      openSignedUrl(data);
    } catch {
      toast.error(translate('toasts.proofDownloadError'));
    }
  }, [tenantId, orderId, translate, openSignedUrl]);

  const handleDownloadAwb = useCallback(async () => {
    try {
      const data = await getAwbDownloadUrl(tenantId, orderId);
      openSignedUrl(data);
    } catch {
      toast.error(translate('toasts.downloadAwbError'));
    }
  }, [tenantId, orderId, translate, openSignedUrl]);

  return {
    isMarkingReceived,
    isRejectingQc,
    isRequestingAwb,
    handleMarkAsReceived,
    handleRejectQc,
    handleRequestAwbAndShip,
    handleViewSellerProof,
    handleViewQcProof,
    handleDownloadAwb,
  };
}
