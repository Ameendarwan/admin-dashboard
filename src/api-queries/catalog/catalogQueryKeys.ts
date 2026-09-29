import type { ListingRequestSortColumn } from '@/types/catalog';

/** React Query keys for catalog tabs, detail pages, category management, and new listing wizard. */
const catalogRoot = ['catalog'] as const;

export type CatalogListingRequestListFilters = {
  tenantId?: string;
  status?: string;
  matchResult?: string;
  categoryId?: string;
};

export const catalogQueryKeys = {
  all: catalogRoot,
  offer: (offerId: string) => [...catalogRoot, 'offer', offerId] as const,
  product: (productId: string) =>
    [...catalogRoot, 'product', productId] as const,
  productSellerOffers: (productId: string) =>
    [...catalogRoot, 'product-seller-offers-ops', productId] as const,
  listingRequest: (requestId: string) =>
    [...catalogRoot, 'listing-request', requestId] as const,
  activeListings: (
    page: number,
    limit: number,
    search: string,
    filters: {
      status?: string;
      categoryIds?: string[];
      brandId?: string;
      isGiftcard?: boolean;
      sortOrder?: string;
    },
  ) =>
    [
      ...catalogRoot,
      'active-listings',
      { page, limit, search, ...filters },
    ] as const,
  giftCards: (
    page: number,
    limit: number,
    search: string,
    categoryId: string,
    status: string,
  ) =>
    [
      ...catalogRoot,
      'gift-cards',
      { page, limit, search, categoryId, status },
    ] as const,
  giftCardCategories: () => [...catalogRoot, 'gift-card-categories'] as const,
  giftCardDetail: (productId: string) =>
    [...catalogRoot, 'gift-card-detail', productId] as const,
  giftCardSalesChannels: (productId: string) =>
    [...catalogRoot, 'gift-card-sales-channels', productId] as const,
  activeOffers: (
    page: number,
    limit: number,
    search: string,
    filters: {
      status?: string;
      sellerId?: string;
      categoryId?: string;
    },
  ) =>
    [
      ...catalogRoot,
      'active-offers',
      { page, limit, search, ...filters },
    ] as const,
  listingRequests: (
    page: number,
    limit: number,
    search: string,
    sortColumn: ListingRequestSortColumn,
    sortOrder: 'asc' | 'desc',
    filters: CatalogListingRequestListFilters,
  ) =>
    [
      ...catalogRoot,
      'listing-requests',
      { page, limit, search, sortColumn, sortOrder, ...filters },
    ] as const,
  sellerDetailsBulk: (search: string) =>
    [...catalogRoot, 'seller-details-bulk', search] as const,
  sellerDetailsById: (tenantId: string) =>
    [...catalogRoot, 'seller-details', tenantId] as const,
  catalogBrands: (search: string) =>
    [...catalogRoot, 'brands', search] as const,
  categoryManagementList: [...catalogRoot, 'categories', 'management'] as const,
  newListingTaxonomy: [...catalogRoot, 'new-listing', 'taxonomy'] as const,
  newListingCategoryFields: (categoryId: string, subcategoryId: string) =>
    [
      ...catalogRoot,
      'new-listing',
      'category-fields',
      categoryId,
      subcategoryId,
    ] as const,
};
