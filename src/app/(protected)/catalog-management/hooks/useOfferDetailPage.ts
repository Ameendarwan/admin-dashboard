'use client';

import { toast } from '@merit-incentives/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { catalogQueryKeys } from '@/api-queries/catalog/catalogQueryKeys';
import { invalidateCatalogActiveOffers } from '@/api-queries/catalog/invalidateCatalogActiveOffers';
import { useCatalogOfferDetailQuery } from '@/api-queries/catalog/useCatalogAdminQueries';
import { catalogOfferLifecycleMessageKey } from '@/app/(protected)/catalog-management/utils/listingStatusBadgeHelpers';
import {
  OFFER_DETAIL_INLINE_STATUSES,
  OFFER_UUID_RE,
} from '@/app/(protected)/catalog-management/constants/offerDetailConstants';
import { useCatalogDetailBack } from '@/app/(protected)/catalog-management/hooks/useCatalogDetailBack';
import { adminCatalogAxiosMessage } from '@/app/(protected)/catalog-management/utils/adminCatalogAxiosMessage';
import { defaultOffersListReturnTo } from '@/app/(protected)/catalog-management/utils/catalogListingsRoute';
import { offerDetailFromApiResponse } from '@/app/(protected)/catalog-management/lib/offerCatalogPayload';
import {
  isDisplayableSellerName,
  readOfferDetailSellerNameParam,
} from '@/app/(protected)/catalog-management/utils/offerDetailRoute';
import { useLocalization } from '@/hooks/useLocalization';
import {
  getCatalogOffer,
  patchCatalogOffer,
} from '@/services/catalogAdminService';
import type { EcommerceOfferStatus } from '@/types/catalog';

export function useOfferDetailPage() {
  const { translate } = useLocalization('catalog');
  const params = useParams();
  const searchParams = useSearchParams();
  const offerId = String(params?.offerId ?? '');

  const useLiveOffer = OFFER_UUID_RE.test(offerId);

  const { returnTo: listingsReturnTo, handleBack: handleBackToListings } =
    useCatalogDetailBack(defaultOffersListReturnTo());

  const queryClient = useQueryClient();
  const offerQuery = useCatalogOfferDetailQuery(offerId, useLiveOffer);

  const sellerNameFromUrl = useMemo(
    () => readOfferDetailSellerNameParam(searchParams),
    [searchParams],
  );

  const rawDetail = offerQuery.data ?? null;

  const detail = useMemo(() => {
    if (!rawDetail) {
      return null;
    }
    if (!isDisplayableSellerName(sellerNameFromUrl)) {
      return rawDetail;
    }
    if (rawDetail.seller === sellerNameFromUrl) {
      return rawDetail;
    }
    return { ...rawDetail, seller: sellerNameFromUrl };
  }, [rawDetail, sellerNameFromUrl]);

  const sellerOfferHeading = useMemo(() => {
    let name: string | null = null;
    if (isDisplayableSellerName(sellerNameFromUrl)) {
      name = sellerNameFromUrl;
    } else if (detail && isDisplayableSellerName(detail.seller)) {
      name = detail.seller;
    }
    if (name) {
      return translate('offerDetail.sellerOfferHeadingNamed', {
        sellerName: name,
      });
    }
    return translate('offerDetail.sellerOfferHeading');
  }, [detail, sellerNameFromUrl, translate]);
  const loading = useLiveOffer && offerQuery.isPending;
  const loadError = useMemo(() => {
    if (!useLiveOffer) {
      return translate('notFound');
    }
    if (offerQuery.isError) {
      return adminCatalogAxiosMessage(offerQuery.error);
    }
    if (offerQuery.isSuccess && offerQuery.data === null) {
      return translate('notFound');
    }
    return null;
  }, [
    offerQuery.data,
    offerQuery.error,
    offerQuery.isError,
    offerQuery.isSuccess,
    translate,
    useLiveOffer,
  ]);

  const refreshOfferDetailSilent = useCallback(async (): Promise<boolean> => {
    if (!useLiveOffer) {
      return false;
    }
    try {
      const raw = await getCatalogOffer(offerId);
      const mapped = offerDetailFromApiResponse(raw);
      queryClient.setQueryData(catalogQueryKeys.offer(offerId), mapped);
      return mapped !== null;
    } catch (e) {
      toast.error(adminCatalogAxiosMessage(e));
      return false;
    }
  }, [offerId, queryClient, useLiveOffer]);

  const refetchLive = useCallback(() => {
    if (!useLiveOffer) {
      return;
    }
    void queryClient.refetchQueries({
      queryKey: catalogQueryKeys.offer(offerId),
    });
  }, [offerId, queryClient, useLiveOffer]);

  const [mainImage, setMainImage] = useState(0);
  const [offerStatusUi, setOfferStatusUi] =
    useState<EcommerceOfferStatus>('INACTIVE');
  const [offerStatusSaving, setOfferStatusSaving] = useState(false);
  const [editOfferOpen, setEditOfferOpen] = useState(false);
  const editOfferNonce = useRef(0);

  useEffect(() => {
    if (detail) {
      if (detail.status === 'EXPIRED') {
        setOfferStatusUi('EXPIRED');
      } else {
        const matched = OFFER_DETAIL_INLINE_STATUSES.find(
          (s) => s === detail.status,
        );
        setOfferStatusUi(matched ?? 'INACTIVE');
      }
      setMainImage(0);
    }
  }, [detail]);

  const statusOptions = useMemo(
    () =>
      OFFER_DETAIL_INLINE_STATUSES.map((value) => ({
        value,
        label: translate(catalogOfferLifecycleMessageKey(value)),
      })),
    [translate],
  );

  const offerStatusHeaderFrozen = detail?.status === 'EXPIRED';

  const onEditOffer = useCallback(() => {
    editOfferNonce.current += 1;
    setEditOfferOpen(true);
  }, []);

  const handleOfferStatusChange = useCallback(
    async (next: EcommerceOfferStatus) => {
      if (!detail || next === detail.status || offerStatusSaving) {
        return;
      }
      const previous = offerStatusUi;
      setOfferStatusUi(next);
      setOfferStatusSaving(true);
      try {
        await patchCatalogOffer(offerId, { status: next });
        toast.success(translate('offerDetail.statusUpdated'));
        await refreshOfferDetailSilent();
        invalidateCatalogActiveOffers(queryClient);
      } catch (e) {
        setOfferStatusUi(previous);
        toast.error(adminCatalogAxiosMessage(e));
      } finally {
        setOfferStatusSaving(false);
      }
    },
    [
      detail,
      offerId,
      offerStatusSaving,
      offerStatusUi,
      queryClient,
      refreshOfferDetailSilent,
      translate,
    ],
  );

  return {
    translate,
    offerId,
    useLiveOffer,
    loading,
    loadError,
    detail,
    refetchLive,
    refreshOfferDetailSilent,
    mainImage,
    setMainImage,
    offerStatusUi,
    offerStatusSaving,
    offerStatusHeaderFrozen,
    handleOfferStatusChange,
    statusOptions,
    editOfferOpen,
    setEditOfferOpen,
    onEditOffer,
    editOfferNonce,
    sellerOfferHeading,
    listingsReturnTo,
    handleBackToListings,
  };
}
