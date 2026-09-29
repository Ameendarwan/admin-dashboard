import { adminApiClient } from '@/lib/apiClient';
import type {
  EcommerceCategoryAttributesResponse,
  EcommerceCategoryRow,
  EcommerceCategoryVariantFieldsResponse,
  EcommerceCreateProductResponse,
  EcommerceListCategoriesResponse,
  EcommerceListOffersResponse,
  EcommerceListOffersOpsResponse,
  EcommerceListProductsResponse,
  EcommerceOfferDetailDto,
  EcommerceOfferOpsDetailDto,
  EcommerceOfferInventoryPatchResponseDto,
  EcommerceProductDto,
  ListCatalogCategoriesParams,
  ListCatalogBrandsParams,
  ListCatalogBrandsResponse,
  ListCatalogOffersParams,
  ListCatalogListingRequestsParams,
  ListCatalogProductsParams,
  PatchCatalogOfferBody,
  PatchCatalogListingRequestStatusBody,
  ListingRequestsListResponse,
  CreateCatalogProductBody,
  CatalogListingRequestRow,
  GiftCardSalesChannelsResponseDto,
  SetGiftCardSalesChannelResponseDto,
  EcommerceCategoryAttributeItemDto,
  EcommerceVariantFieldItemDto,
} from '@/types/catalog';

/** All admin catalog UI calls go through admin-be `/catalog/*` (proxies ecommerce or seller-portal). */
const CATALOG_BASE = '/catalog';

/** Enable allowlists product; ecommerce fan-out links offers in background. */
const GIFT_CARD_SALES_CHANNEL_WRITE_TIMEOUT_MS = 60_000;

/** Unwraps `{ data: { … } }` envelopes from PIM/ecommerce category payloads. */
function nestedPayload(
  data: Record<string, unknown>,
): Record<string, unknown> | null {
  const inner = data.data;
  return inner && typeof inner === 'object' && !Array.isArray(inner)
    ? (inner as Record<string, unknown>)
    : null;
}

/**
 * PIM GET /product-categories/:id returns `{ productCategory: { … } }`.
 * List endpoints return flat rows — normalize both to `EcommerceCategoryRow`.
 */
export function normalizeCatalogCategoryPayload(
  data: unknown,
): EcommerceCategoryRow {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid category response');
  }

  const root = data as Record<string, unknown>;
  const nested = nestedPayload(root);
  const productCategory = root.productCategory ?? nested?.productCategory;

  if (
    productCategory &&
    typeof productCategory === 'object' &&
    !Array.isArray(productCategory)
  ) {
    return productCategory as EcommerceCategoryRow;
  }

  return root as unknown as EcommerceCategoryRow;
}

/** PIM/ecommerce may return `{ attributes }` or `{ data: { attributes } }`. */
export function normalizeCategoryAttributesPayload(
  data: unknown,
): EcommerceCategoryAttributeItemDto[] {
  if (!data || typeof data !== 'object') {
    return [];
  }
  const root = data as Record<string, unknown>;
  const nested = nestedPayload(root);
  const attrs = root.attributes ?? nested?.attributes;
  if (!Array.isArray(attrs)) {
    return [];
  }
  return attrs.filter(
    (item): item is EcommerceCategoryAttributeItemDto =>
      item != null &&
      typeof item === 'object' &&
      typeof (item as EcommerceCategoryAttributeItemDto).label === 'string',
  );
}

/** Variant axes may be under `variantFields`, `data.variantFields`, or `metadata.variantFields`. */
export function normalizeCategoryVariantFieldsPayload(
  data: unknown,
): EcommerceVariantFieldItemDto[] {
  if (!data || typeof data !== 'object') {
    return [];
  }
  const root = data as Record<string, unknown>;
  const nested = nestedPayload(root);
  const meta =
    root.metadata &&
    typeof root.metadata === 'object' &&
    !Array.isArray(root.metadata)
      ? (root.metadata as Record<string, unknown>)
      : null;
  const fields =
    root.variantFields ?? nested?.variantFields ?? meta?.variantFields;
  if (!Array.isArray(fields)) {
    return [];
  }
  return fields.filter(
    (item): item is EcommerceVariantFieldItemDto =>
      item != null &&
      typeof item === 'object' &&
      typeof (item as EcommerceVariantFieldItemDto).label === 'string',
  );
}

/** Seller bulk-upload rows for admin review (seller-portal proxy; all statuses except processing failures). */
export async function listCatalogListingRequests(
  params: ListCatalogListingRequestsParams = {},
): Promise<ListingRequestsListResponse> {
  const { data } = await adminApiClient.get<ListingRequestsListResponse>(
    `${CATALOG_BASE}/listing-requests`,
    { params },
  );
  return data;
}

export async function getCatalogListingRequest(
  requestId: string,
): Promise<CatalogListingRequestRow> {
  const { data } = await adminApiClient.get<CatalogListingRequestRow>(
    `${CATALOG_BASE}/listing-requests/${encodeURIComponent(requestId)}`,
  );
  return data;
}

/** Dedupes catalog products/variants by title + variant options before create. */
export async function matchCatalogProduct<T = unknown>(
  body: unknown,
): Promise<T> {
  const { data } = await adminApiClient.post<T>(
    `${CATALOG_BASE}/products/match`,
    body,
  );
  return data;
}

export async function createCatalogProductVariant(
  productId: string,
  body: {
    options: Record<string, string | number | boolean>;
    images?: string[];
  },
): Promise<unknown> {
  const { data } = await adminApiClient.post<unknown>(
    `${CATALOG_BASE}/products/${encodeURIComponent(productId)}/variants`,
    body,
  );
  return data;
}

export async function getCatalogSellerSkuExists(params: {
  sellerId: string;
  sellerSku: string;
  locationId?: string;
}): Promise<{ exists: boolean; offerId?: string }> {
  const { data } = await adminApiClient.get<{
    exists: boolean;
    offerId?: string;
  }>(`${CATALOG_BASE}/offers/seller-sku/exists`, { params });
  return data;
}

export async function createCatalogOffer(
  body: Record<string, unknown>,
): Promise<unknown> {
  const { data } = await adminApiClient.post<unknown>(
    `${CATALOG_BASE}/offers`,
    body,
  );
  return data;
}

/** Approve/reject workflow; admin-be may email the seller on live/rejected. */
export async function patchCatalogListingRequestStatus(
  requestId: string,
  body: PatchCatalogListingRequestStatusBody,
): Promise<Record<string, unknown>> {
  const { data } = await adminApiClient.patch<Record<string, unknown>>(
    `${CATALOG_BASE}/listing-requests/${encodeURIComponent(requestId)}/status`,
    body,
  );
  return data;
}

/** Proxies admin-be POST /catalog/products/list → ecommerce POST /products/list. */
export async function listCatalogProducts(
  params: ListCatalogProductsParams,
): Promise<EcommerceListProductsResponse> {
  const { data } = await adminApiClient.post<EcommerceListProductsResponse>(
    `${CATALOG_BASE}/products/list`,
    params,
  );
  return data;
}

export async function listCatalogBrands(
  params: ListCatalogBrandsParams = {},
): Promise<ListCatalogBrandsResponse> {
  const { data } = await adminApiClient.get<ListCatalogBrandsResponse>(
    `${CATALOG_BASE}/brands`,
    { params },
  );
  return {
    rows: Array.isArray(data?.rows) ? data.rows : [],
    count: typeof data?.count === 'number' ? data.count : 0,
  };
}

export async function getCatalogProduct(
  productId: string,
): Promise<EcommerceProductDto> {
  const { data } = await adminApiClient.get<EcommerceProductDto>(
    `${CATALOG_BASE}/products/${encodeURIComponent(productId)}`,
  );
  return data;
}

export async function createCatalogProduct(
  body: CreateCatalogProductBody,
): Promise<EcommerceCreateProductResponse> {
  const { data } = await adminApiClient.post<EcommerceCreateProductResponse>(
    `${CATALOG_BASE}/products`,
    body,
  );
  return data;
}

/** Aligns with seller POST /products/upload-url response. */
export type CatalogProductImageUploadUrlResponse = {
  uploadUrl: string;
  storagePath: string;
};

/** Step 1 of image upload: signed GCS URL from admin-be (step 2 is direct PUT to GCS). */
export async function requestCatalogProductImageUploadUrl(body: {
  fileName: string;
  contentType: string;
}): Promise<CatalogProductImageUploadUrlResponse> {
  const { data } =
    await adminApiClient.post<CatalogProductImageUploadUrlResponse>(
      `${CATALOG_BASE}/product-images/upload-url`,
      body,
    );
  return data;
}

/** PUT file bytes to GCS; storage path is later sent in create product body. */
export async function uploadCatalogProductImageToSignedUrl(
  uploadUrl: string,
  file: File,
  fileType: string,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': fileType,
    },
    body: file,
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(
      `Image upload failed (${response.status}): ${errorText || response.statusText}`,
    );
  }
}

export async function listCatalogOffers(
  params: ListCatalogOffersParams,
): Promise<EcommerceListOffersResponse> {
  const { data } = await adminApiClient.get<EcommerceListOffersResponse>(
    `${CATALOG_BASE}/offers`,
    { params },
  );
  return data;
}

export async function listCatalogOpsOffers(
  params: ListCatalogOffersParams,
): Promise<EcommerceListOffersOpsResponse> {
  const { data } = await adminApiClient.get<EcommerceListOffersOpsResponse>(
    `${CATALOG_BASE}/offers/ops`,
    { params },
  );
  return data;
}

/** Pages through ops offers until all rows for one catalog product id are loaded. */
export async function listAllCatalogOffersForProduct(
  productId: string,
): Promise<EcommerceOfferOpsDetailDto[]> {
  const pageSize = 100;
  const all: EcommerceOfferOpsDetailDto[] = [];
  let offset = 0;
  for (;;) {
    const res = await listCatalogOpsOffers({
      productId,
      limit: pageSize,
      offset,
    });
    const rows = res.rows ?? [];
    all.push(...rows);
    const count = typeof res.count === 'number' ? res.count : all.length;
    if (all.length >= count || rows.length === 0) {
      break;
    }
    offset += rows.length;
  }
  return all;
}

export async function getCatalogOffer(
  offerId: string,
): Promise<EcommerceOfferDetailDto> {
  const { data } = await adminApiClient.get<EcommerceOfferDetailDto>(
    `${CATALOG_BASE}/offers/${encodeURIComponent(offerId)}`,
  );
  return data;
}

export async function patchCatalogOffer(
  offerId: string,
  body: PatchCatalogOfferBody,
): Promise<EcommerceOfferInventoryPatchResponseDto> {
  const { data } =
    await adminApiClient.patch<EcommerceOfferInventoryPatchResponseDto>(
      `${CATALOG_BASE}/offers/${encodeURIComponent(offerId)}`,
      body,
    );
  return data;
}

export async function listCatalogCategories(
  params: ListCatalogCategoriesParams = {},
): Promise<EcommerceListCategoriesResponse> {
  const { data } = await adminApiClient.get<EcommerceListCategoriesResponse>(
    `${CATALOG_BASE}/categories`,
    { params },
  );
  return data;
}

/** Fetches every category page for trees and dropdowns (category management, new listing). */
export async function listAllCatalogCategories(
  params: Omit<ListCatalogCategoriesParams, 'limit' | 'offset'> = {},
): Promise<EcommerceCategoryRow[]> {
  const pageSize = 100;
  const all: EcommerceCategoryRow[] = [];
  let offset = 0;
  for (;;) {
    const res = await listCatalogCategories({
      ...params,
      limit: pageSize,
      offset,
    });
    all.push(...res.rows);
    if (all.length >= res.count || res.rows.length === 0) {
      break;
    }
    offset += res.rows.length;
  }
  return all;
}

export async function getCatalogCategory(
  categoryId: string,
): Promise<EcommerceCategoryRow> {
  const { data } = await adminApiClient.get<unknown>(
    `${CATALOG_BASE}/categories/${encodeURIComponent(categoryId)}`,
  );
  return normalizeCatalogCategoryPayload(data);
}

export async function createCatalogCategory(
  body: Record<string, unknown>,
): Promise<EcommerceCategoryRow> {
  const { data } = await adminApiClient.post<EcommerceCategoryRow>(
    `${CATALOG_BASE}/categories`,
    body,
  );
  return data;
}

/** PATCH admin-be → ecommerce POST. Soft-delete sets `{ isActive: false }`. */
export async function updateCatalogCategory(
  categoryId: string,
  body: Record<string, unknown>,
): Promise<EcommerceCategoryRow> {
  const { data } = await adminApiClient.patch<EcommerceCategoryRow>(
    `${CATALOG_BASE}/categories/${encodeURIComponent(categoryId)}`,
    body,
  );
  return data;
}

export async function getCatalogCategoryAttributes(
  categoryId: string,
): Promise<EcommerceCategoryAttributesResponse> {
  const { data } = await adminApiClient.get<unknown>(
    `${CATALOG_BASE}/categories/${encodeURIComponent(categoryId)}/attributes`,
  );
  return { attributes: normalizeCategoryAttributesPayload(data) };
}

export async function createCatalogCategoryAttributes(
  categoryId: string,
  body: Record<string, unknown>,
): Promise<EcommerceCategoryAttributesResponse> {
  const { data } = await adminApiClient.post<unknown>(
    `${CATALOG_BASE}/categories/${encodeURIComponent(categoryId)}/attributes`,
    body,
  );
  return { attributes: normalizeCategoryAttributesPayload(data) };
}

export async function getCatalogCategoryVariantFields(
  categoryId: string,
): Promise<EcommerceCategoryVariantFieldsResponse> {
  const { data } = await adminApiClient.get<unknown>(
    `${CATALOG_BASE}/categories/${encodeURIComponent(
      categoryId,
    )}/variant-fields`,
  );
  return { variantFields: normalizeCategoryVariantFieldsPayload(data) };
}

export async function setCatalogCategoryVariantFields(
  categoryId: string,
  body: Record<string, unknown>,
): Promise<EcommerceCategoryVariantFieldsResponse> {
  const { data } = await adminApiClient.post<unknown>(
    `${CATALOG_BASE}/categories/${encodeURIComponent(
      categoryId,
    )}/variant-fields`,
    body,
  );
  return { variantFields: normalizeCategoryVariantFieldsPayload(data) };
}

export async function listGiftCardSalesChannels(
  productId: string,
): Promise<GiftCardSalesChannelsResponseDto> {
  const { data } = await adminApiClient.get<GiftCardSalesChannelsResponseDto>(
    `${CATALOG_BASE}/gift-cards/${encodeURIComponent(productId)}/sales-channels`,
  );
  return data;
}

export async function setGiftCardSalesChannelActive(
  productId: string,
  salesChannelId: string,
  active: boolean,
  categoryId?: string,
): Promise<SetGiftCardSalesChannelResponseDto> {
  const { data } =
    await adminApiClient.patch<SetGiftCardSalesChannelResponseDto>(
      `${CATALOG_BASE}/gift-cards/${encodeURIComponent(productId)}/sales-channels/${encodeURIComponent(salesChannelId)}`,
      {
        active,
        ...(active && categoryId ? { categoryId } : {}),
      },
      { timeout: GIFT_CARD_SALES_CHANNEL_WRITE_TIMEOUT_MS },
    );
  return data;
}
