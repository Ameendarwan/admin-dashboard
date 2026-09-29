'use client';

import { useCallback, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { catalogQueryKeys } from '@/api-queries/catalog/catalogQueryKeys';
import {
  useCatalogListingProductQuery,
  useCatalogListingSellerOffersQuery,
} from '@/api-queries/catalog/useCatalogAdminQueries';
import { adminCatalogAxiosMessage } from '@/app/(protected)/catalog-management/utils/adminCatalogAxiosMessage';
import {
  catalogListingDetailHref,
  defaultCatalogListingsReturnTo,
} from '@/app/(protected)/catalog-management/utils/catalogListingsRoute';
import { useCatalogDetailBack } from '@/app/(protected)/catalog-management/hooks/useCatalogDetailBack';
import { catalogOfferDetailHref } from '@/app/(protected)/catalog-management/utils/offerDetailRoute';
import { useLocalization } from '@/hooks/useLocalization';
import type { SellerOfferRow } from '@/types/catalog';

const OFFER_ROW_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const OFFER_PAGE_SIZE = 10;

function resolveListingLoadError(args: {
  listingId: string;
  isError: boolean;
  isSuccess: boolean;
  data: unknown;
  error: unknown;
  notFoundLabel: string;
}): string | null {
  if (!args.listingId) {
    return null;
  }
  if (args.isError) {
    return adminCatalogAxiosMessage(args.error);
  }
  if (args.isSuccess && args.data === null) {
    return args.notFoundLabel;
  }
  return null;
}

function filterSellerOffersBySearch(
  sellerOffers: readonly SellerOfferRow[],
  offerSearch: string,
): SellerOfferRow[] {
  const q = offerSearch.toLowerCase();
  if (!q) {
    return [...sellerOffers];
  }
  return sellerOffers.filter((o) => {
    const pool = [o.sku, o.seller, o.salesChannel, o.priceLabel, o.location]
      .join(' ')
      .toLowerCase();
    return pool.includes(q);
  });
}

export function useListingDetail() {
  const { translate } = useLocalization('catalog');
  const router = useRouter();
  const params = useParams();
  const listingId = String(params?.listingId ?? '');

  const { returnTo: listingsReturnTo, handleBack: handleBackToListings } =
    useCatalogDetailBack(defaultCatalogListingsReturnTo('active'));

  const queryClient = useQueryClient();
  const productQuery = useCatalogListingProductQuery(listingId);
  const offersQuery = useCatalogListingSellerOffersQuery(listingId);

  const detail = productQuery.data ?? null;
  const loading =
    Boolean(listingId) &&
    (productQuery.isPending ||
      (productQuery.isFetching && productQuery.data === undefined));

  const loadError = useMemo(
    () =>
      resolveListingLoadError({
        listingId,
        isError: productQuery.isError,
        isSuccess: productQuery.isSuccess,
        data: productQuery.data,
        error: productQuery.error,
        notFoundLabel: translate('notFound'),
      }),
    [
      listingId,
      productQuery.data,
      productQuery.error,
      productQuery.isError,
      productQuery.isSuccess,
      translate,
    ],
  );

  const offersLoading = Boolean(listingId) && offersQuery.isFetching;
  const offersError =
    Boolean(listingId) && offersQuery.isError
      ? adminCatalogAxiosMessage(offersQuery.error)
      : null;

  const refetchProduct = useCallback(() => {
    void queryClient.refetchQueries({
      queryKey: catalogQueryKeys.product(listingId),
    });
  }, [listingId, queryClient]);

  const [mainImage, setMainImage] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [offerSearch, setOfferSearch] = useState('');
  const [offersPage, setOffersPage] = useState(1);

  const filteredOffers = useMemo(
    () => filterSellerOffersBySearch(offersQuery.data ?? [], offerSearch),
    [offersQuery.data, offerSearch],
  );

  const totalOfferPages = Math.max(
    1,
    Math.ceil(filteredOffers.length / OFFER_PAGE_SIZE),
  );
  const safePage = Math.min(offersPage, totalOfferPages);
  const pagedOffers = useMemo(() => {
    const start = (safePage - 1) * OFFER_PAGE_SIZE;
    return filteredOffers.slice(start, start + OFFER_PAGE_SIZE);
  }, [filteredOffers, safePage]);

  const toggleDetailsOpen = useCallback(() => {
    setDetailsOpen((v) => !v);
  }, []);

  const handleOfferSearchChange = useCallback((value: string) => {
    setOfferSearch(value);
    setOffersPage(1);
  }, []);

  const handleOfferRowClick = useCallback(
    (row: SellerOfferRow) => {
      if (!OFFER_ROW_UUID.test(row.id)) {
        return;
      }
      router.push(
        catalogOfferDetailHref(row.id, {
          sellerName: row.seller,
          returnTo: catalogListingDetailHref(listingId, listingsReturnTo),
        }),
      );
    },
    [listingId, listingsReturnTo, router],
  );

  return {
    translate,
    listingId,
    detail,
    loading,
    loadError,
    refetchProduct,
    handleBackToListings,
    mainImage,
    setMainImage,
    detailsOpen,
    toggleDetailsOpen,
    offerSearch,
    handleOfferSearchChange,
    offersPage: safePage,
    setOffersPage,
    offerPageSize: OFFER_PAGE_SIZE,
    filteredOffers,
    pagedOffers,
    totalOfferPages,
    offersLoading,
    offersError,
    handleOfferRowClick,
  };
}
