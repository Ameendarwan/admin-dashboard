import { useQuery } from '@tanstack/react-query';

import { listingRequestDetailFromApi } from '@/app/(protected)/catalog-management/lib/listingRequestMappers';
import {
  offerDetailFromApiResponse,
  sellerOfferTableRowFromApiResponse,
} from '@/app/(protected)/catalog-management/lib/offerCatalogPayload';
import { parseListingDetail } from '@/app/(protected)/catalog-management/lib/parseListingDetail';
import {
  getCatalogOffer,
  getCatalogProduct,
  getCatalogListingRequest,
  listAllCatalogOffersForProduct,
} from '@/services/catalogAdminService';
import type {
  ListingDetail,
  ListingRequestDetail,
  OfferDetail,
  SellerOfferRow,
} from '@/types/catalog';
import { TIME_5_MIN } from '@/utils/timeUtils';

import { catalogQueryKeys } from './catalogQueryKeys';

/** Offer detail page: raw ecommerce offer → UI OfferDetail model. */
export function useCatalogOfferDetailQuery(offerId: string, enabled: boolean) {
  return useQuery({
    queryKey: catalogQueryKeys.offer(offerId),
    queryFn: async (): Promise<OfferDetail | null> => {
      const raw = await getCatalogOffer(offerId);
      return offerDetailFromApiResponse(raw);
    },
    enabled: enabled && Boolean(offerId),
    gcTime: TIME_5_MIN,
    staleTime: TIME_5_MIN,
  });
}

/** Listing detail: catalog product by id (listingId is ecommerce product id). */
export function useCatalogListingProductQuery(listingId: string) {
  return useQuery({
    queryKey: catalogQueryKeys.product(listingId),
    queryFn: async (): Promise<ListingDetail | null> => {
      const raw = await getCatalogProduct(listingId);
      return parseListingDetail(raw);
    },
    enabled: Boolean(listingId),
    gcTime: TIME_5_MIN,
    staleTime: TIME_5_MIN,
  });
}

/** All seller offers linked to one catalog product (paginated fetch in service). */
export function useCatalogListingSellerOffersQuery(listingId: string) {
  return useQuery({
    queryKey: catalogQueryKeys.productSellerOffers(listingId),
    queryFn: async (): Promise<SellerOfferRow[]> => {
      const rawRows = await listAllCatalogOffersForProduct(listingId);
      return rawRows
        .map(sellerOfferTableRowFromApiResponse)
        .filter((r): r is SellerOfferRow => r !== null);
    },
    enabled: Boolean(listingId),
    gcTime: TIME_5_MIN,
    staleTime: TIME_5_MIN,
  });
}

/** Seller bulk listing request detail (seller-portal row, not ecommerce). */
export function useCatalogListingRequestQuery(requestId: string) {
  const trimmed = requestId.trim();
  return useQuery({
    queryKey: catalogQueryKeys.listingRequest(trimmed),
    queryFn: async (): Promise<ListingRequestDetail | null> => {
      const raw = await getCatalogListingRequest(trimmed);
      return listingRequestDetailFromApi(raw as Record<string, unknown>);
    },
    enabled: Boolean(trimmed),
    gcTime: TIME_5_MIN,
    staleTime: TIME_5_MIN,
  });
}
