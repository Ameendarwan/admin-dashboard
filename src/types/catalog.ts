/**
 * Catalog domain types (listings, offers, categories, gift cards, API DTOs).
 * Single source for catalog-related TypeScript types.
 */

/**
 * Types aligned with merit-ecommerce-core HTTP responses (admin-be proxies these verbatim).
 * @see merit-ecommerce-core Swagger / DTOs; product list may return Elasticsearch `_source` with extra fields.
 */

export type EcommerceOfferStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';

export type EcommerceOfferCondition = 'NEW' | 'USED' | 'REFURB';

/** Seller portal row from OfferInventoryResponseDto (JSON uses string dates). */
export interface EcommerceSellerDto {
  id: string;
  tenantId: string;
  supplierId: string;
  onboarded: boolean;
  shippingProvider: string;
  phone: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface EcommerceProductTagDto {
  id?: string;
  value?: string;
}

export interface EcommerceProductCategoryDto {
  id?: string;
  name?: string;
  parentCategory?: { id?: string; name?: string } | null;
}

export interface EcommerceProductTypeDto {
  id?: string;
  value?: string;
}

export interface EcommerceProductVariantOptionDto {
  id?: string;
  value?: string;
  optionId?: string;
  option?: { id?: string; title?: string; productId?: string };
}

export interface EcommerceProductVariantDto {
  id?: string;
  title?: string;
  sku?: string;
  productId?: string;
  thumbnail?: string | null;
  images?: unknown;
  metadata?: Record<string, unknown> | null;
  options?: EcommerceProductVariantOptionDto[];
}

export interface EcommerceProductMetadataDto {
  region?: string;
  country?: string;
  isActive?: boolean;
  parentSku?: string;
  externalId?: string;
  discontinued?: boolean;
  taxApplicable?: boolean;
  defaultLanguage?: string;
  productGroup?: string | string[];
  imagesFileIds?: string[];
  imagesKeys?: string[];
  keyFeatures?: string[];
  features?: string[];
  /** Flat spec map from ecommerce; keys may overlap poorly with variant option titles — filter in UI. */
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

/** Product as returned by ecommerce (ProductResponseDto + indexed fields). */
export interface EcommerceProductDto {
  id: string;
  title: string;
  handle?: string | null;
  subtitle?: string | null;
  status?: string | null;
  description?: string | null;
  externalId?: string | null;
  thumbnail?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isGiftcard?: boolean;
  discountable?: boolean;
  /** ES breadcrumb when present */
  categoryPath?: string;
  brand?: { id?: string; name?: string } | string | null;
  type?: EcommerceProductTypeDto | null;
  categories?: EcommerceProductCategoryDto[];
  images?: Array<{ url?: string }>;
  tags?: EcommerceProductTagDto[];
  tagValues?: string[];
  attributes?: Record<string, unknown>;
  metadata?: EcommerceProductMetadataDto | null;
  options?: Array<{
    id?: string;
    title?: string;
    values?: Array<{ value?: string }>;
  }>;
  variants?: EcommerceProductVariantDto[];
  keyFeatures?: string[];
  /** Elasticsearch / list aggregates may expose this; not always on canonical product rows. */
  variantCount?: number;
  /** Present on products/ops/list when ecommerce embeds channel membership. */
  salesChannels?: EcommerceSalesChannelDto[];
}

/** OfferDetailResponseDto over JSON (dates ISO strings). */
export interface EcommerceOfferDetailDto {
  id: string;
  sellerId: string;
  sellerSku: string;
  productId: string;
  productVariantId: string;
  productSku: string;
  condition: string;
  currency: string;
  price: number;
  status: string;
  startsAt: string;
  endsAt?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  availableStock: number;
  totalStock: number;
  location?: string | null;
  inventoryMetadata?: Record<string, unknown> | null;
  seller: EcommerceSellerDto | null;
  product: EcommerceProductDto | null;
}

export interface EcommerceListProductsResponse {
  rows: EcommerceProductDto[];
  count: number;
  offset: number;
  limit: number;
}

export interface EcommerceListOffersResponse {
  rows: EcommerceOfferDetailDto[];
  count: number;
  limit: number;
  offset: number;
}

export interface EcommerceSalesChannelDto {
  id: string;
  code: string;
  name: string;
  description: string | null;
  region: string;
  currency: string;
  isActive: boolean;
  autoLinkNewOffers?: boolean;
  ownerType?: string | null;
  ownerId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/** OfferOpsResponseDto — seller details + sales channel assignments. */
export interface EcommerceOfferOpsDetailDto extends EcommerceOfferDetailDto {
  salesChannels: EcommerceSalesChannelDto[];
}

export interface EcommerceListOffersOpsResponse {
  rows: EcommerceOfferOpsDetailDto[];
  count: number;
  limit: number;
  offset: number;
}

export interface EcommerceCategoryDto {
  id: string;
  name: string;
  handle?: string | null;
  isActive?: boolean;
  parentCategoryId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  metadata?: {
    variantFields?: Array<{
      label: string;
      type: string;
      values?: string[];
    }>;
    [key: string]: unknown;
  };
  productCount?: number;
}

export interface EcommerceListCategoriesResponse {
  rows: EcommerceCategoryDto[];
  count: number;
  offset: number;
  limit: number;
}

export interface EcommerceCategoryAttributeItemDto {
  label: string;
  type: string;
  values?: string[];
  isRequired: boolean;
}

export interface EcommerceCategoryAttributesResponse {
  attributes: EcommerceCategoryAttributeItemDto[];
}

export interface EcommerceVariantFieldItemDto {
  label: string;
  type: 'enum' | 'string' | 'number' | 'boolean';
  values?: string[];
}

export interface EcommerceCategoryVariantFieldsResponse {
  variantFields: EcommerceVariantFieldItemDto[];
}

/** Wrapped response from POST /products (products.service#create). */
export interface EcommerceCreateProductResponse {
  data?: {
    product?: EcommerceProductDto;
  };
}

/** Seller-portal bulk rows `sortColumn` values used by the listing-requests table. */
export type ListingRequestSortColumn = 'createdAt';

export type ListingRequestsPaginationDto = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/** One row from GET /catalog/listing-requests. */
export type CatalogListingRequestRow = {
  id?: unknown;
  product?: unknown;
  brand?: unknown;
  mainImage?: unknown;
  businessName?: unknown;
  sellerEmail?: unknown;
  category?: unknown;
  subCategory?: unknown;
  status?: unknown;
  created_at?: unknown;
  createdAt?: unknown;
  updated_at?: unknown;
  updatedAt?: unknown;
};

export type ListingRequestsListResponse = {
  data: CatalogListingRequestRow[];
  pagination: ListingRequestsPaginationDto;
};

/** Aligns with seller-portal / admin-be `ListingRequestWorkflowStatus`. */
export type ListingRequestWorkflowStatus =
  | 'pending'
  | 'under_review'
  | 'live'
  | 'rejected';

/** List query filter — seller-portal omits rejected when status is unspecified. */
export type ListingRequestWorkflowQueryStatus = Exclude<
  ListingRequestWorkflowStatus,
  'rejected'
>;

export type ListCatalogListingRequestsParams = {
  search?: string;
  matchResult?:
    | 'match_found'
    | 'possible_match'
    | 'no_match_found'
    | 'invalid_entry';
  status?: ListingRequestWorkflowStatus;
  tenantId?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
  sortColumn?: ListingRequestSortColumn;
  sortOrder?: 'asc' | 'desc';
};

export type PatchCatalogListingRequestStatusBody = {
  status: ListingRequestWorkflowStatus;
  reason?: string;
};

export type ApproveCatalogListingRequestResponse = {
  alreadyLive?: boolean;
  offerId?: string;
  ecommerce?: unknown;
  row?: Record<string, unknown>;
};

export type CatalogProductCategoryRef = {
  id: string;
};

export type CatalogProductVariantInput = {
  options: Record<string, string | boolean>;
  title?: string;
  images?: string[];
};

/** Body for POST /catalog/products (create listing). */
export type CreateCatalogProductBody = {
  title: string;
  description?: string;
  brand?: string;
  categories?: CatalogProductCategoryRef[];
  tags?: string[];
  attributes?: Record<string, string>;
  images?: string[];
  variants: CatalogProductVariantInput[];
};

/** JSON-safe metadata bag for PATCH (matches admin-be whitelist). */
export type CatalogOfferMetadataPatch = Readonly<
  Record<string, string | number | boolean | null>
>;

/** Request body for `PATCH /catalog/offers/:offerId` (mirrors ecommerce `UpdateOfferDto`). */
export type PatchCatalogOfferBody = {
  status?: EcommerceOfferStatus;
  currency?: string;
  price?: number;
  totalStock?: number;
  availableStock?: number;
  location?: string | null;
  startsAt?: string;
  endsAt?: string | null;
  metadata?: CatalogOfferMetadataPatch;
  inventoryMetadata?: CatalogOfferMetadataPatch;
};

/** Ecommerce PATCH response without embedded product (OfferInventoryResponseDto). */
export type EcommerceOfferInventoryPatchResponseDto = Omit<
  EcommerceOfferDetailDto,
  'product'
>;

export type ListCatalogProductsParams = {
  limit?: number;
  offset?: number;
  search?: string;
  categoryIds?: string[];
  status?: string;
  isGiftcard?: boolean;
  productIds?: string[];
  brandIds?: string[];
  sortOrder?: 'asc' | 'desc';
};

export type ListCatalogBrandsParams = {
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
};

export type CatalogBrandRow = {
  id?: string;
  name?: string;
};

export type ListCatalogBrandsResponse = {
  rows: CatalogBrandRow[];
  count: number;
};

export type ListCatalogOffersParams = {
  limit?: number;
  offset?: number;
  search?: string;
  categoryId?: string;
  sellerId?: string;
  /** Catalog product id; forwarded to ecommerce offers list. */
  productId?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
};

export type ListCatalogCategoriesParams = {
  limit?: number;
  offset?: number;
  isGiftcardCategory?: boolean;
  includeProductCount?: boolean;
};

/** @deprecated Use EcommerceCategoryDto — alias for existing imports */
export type EcommerceCategoryRow = EcommerceCategoryDto;

export type GiftCardSalesChannelRowDto = {
  id: string;
  name: string;
  code: string;
  active: boolean;
};

export type GiftCardSalesChannelsResponseDto = {
  rows: GiftCardSalesChannelRowDto[];
};

export type SetGiftCardSalesChannelResponseDto = {
  salesChannelId: string;
  active: boolean;
};

export const NEW_LISTING_IMAGE_SLOT_COUNT = 8;

/** Per-variant image slots (aligned with seller portal new-product wizard). */
export const NEW_LISTING_VARIANT_IMAGE_SLOT_COUNT = 5;

export type NewListingStepIndex = 0 | 1 | 2 | 3 | 4;

export interface CatalogTaxonomyCategory {
  readonly id: string;
  readonly labelKey: string;
  readonly displayName?: string;
}

export interface CatalogTaxonomySubcategory {
  readonly id: string;
  readonly categoryId: string;
  readonly labelKey: string;
  readonly displayName?: string;
}

/** Mirrors seller `Category.metadata.variantFields` entries. */
export interface CatalogCategoryVariantFieldMeta {
  readonly label: string;
  readonly type: string;
}

export interface CatalogCategoryRow {
  readonly id: string;
  readonly name: string;
  readonly parentCategoryId?: string | null;
  readonly metadata?: {
    readonly variantFields?: readonly CatalogCategoryVariantFieldMeta[];
  };
}

export type AttributeFieldType = 'text' | 'select';

export interface AttributeSelectOption {
  readonly value: string;
  readonly label: string;
}

export interface AttributeFieldDefinition {
  readonly id: string;
  readonly apiKey: string;
  readonly labelKey: string;
  readonly displayName?: string;
  readonly type: AttributeFieldType;
  readonly required: boolean;
  readonly suffixKey?: string;
  readonly options?: readonly AttributeSelectOption[];
}

export interface ListingTaxonomyDTO {
  readonly categories: readonly CatalogTaxonomyCategory[];
  readonly subcategories: readonly CatalogTaxonomySubcategory[];
  readonly categoryRows: readonly CatalogCategoryRow[];
}

export interface ProductImageSlot {
  readonly id: string;
  file: File | null;
  previewUrl: string | null;
}

/** One purchasable variant row; options match category variant field ids (same keys as form). */
export interface NewListingProductVariantRow {
  readonly id: string;
  optionsByFieldId: Record<string, string>;
  imageSlots: ProductImageSlot[];
}

export interface NewListingFormValues {
  categoryId: string;
  subcategoryId: string;
  title: string;
  brand: string;
  description: string;
  features: string[];
  productAttributes: Record<string, string>;
  /** Multiple SKUs/variants: each row uses the same category variant field set (e.g. several colors). */
  productVariants: NewListingProductVariantRow[];
  imageSlots: ProductImageSlot[];
}

export interface CreateListingPayload {
  categoryId: string;
  subcategoryId: string;
  title: string;
  brand: string;
  description: string;
  features: string[];
  productAttributes: Record<string, string>;
  variants: Array<{
    options: Record<string, string>;
    title?: string;
    imageFiles: File[];
  }>;
  imageFiles: File[];
}

export interface CreateListingResult {
  readonly id: string;
}

export type CategorySubcategoryRow = {
  id: string;
  name: string;
  handle?: string | null;
  isActive?: boolean;
};

export type CategoryManagementRow = {
  id: string;
  name: string;
  handle?: string | null;
  isActive?: boolean;
  subcategories: CategorySubcategoryRow[];
};

export type CatalogListingStatus = 'active' | 'draft' | 'archived';

export type ListingRequestStatus = 'pending_review' | 'rejected' | 'approved';

export interface VariantAttribute {
  readonly label: string;
  readonly value: string;
}

export interface CatalogOfferListRow {
  readonly id: string;
  readonly sku: string;
  readonly productSku: string;
  readonly seller: string;
  readonly productName: string;
  readonly imageUrl: string;
  readonly category: string;
  readonly subCategory: string;
  readonly salesChannel: string;
  readonly location: string;
  /** Ecommerce offer lifecycle (`OfferStatus`). */
  readonly status: EcommerceOfferStatus;
  readonly submittedOn: string;
  readonly condition: string;
  readonly conditionDisplay: string;
  readonly priceDisplay: string;
  readonly currency: string;
  readonly stock: number;
}

export interface ActiveListingRow {
  readonly id: string;
  readonly productName: string;
  readonly imageUrl: string;
  readonly brand: string;
  readonly category: string;
  readonly subCategory: string;
  readonly offerCount: number;
  readonly status: CatalogListingStatus;
  readonly createdOn: string;
  readonly handle?: string;
  readonly subtitle?: string;
}

export interface ListingRequestRow {
  readonly id: string;
  readonly productName: string;
  readonly imageUrl: string;
  readonly brand: string;
  readonly seller: string;
  readonly category: string;
  readonly subCategory: string;
  readonly matchResult:
    | 'match_found'
    | 'possible_match'
    | 'no_match_found'
    | null;
  readonly status: ListingRequestStatus;
  readonly submittedOn: string;
}

export interface SellerOfferRow {
  readonly id: string;
  readonly sku: string;
  readonly seller: string;
  readonly salesChannel: string;
  readonly variantTags: readonly VariantAttribute[];
  readonly location: string;
  readonly stock: number;
  readonly priceLabel: string;
  /** Ecommerce offer lifecycle (`OfferStatus`). */
  readonly status: EcommerceOfferStatus;
  readonly submittedOn: string;
}

export interface OfferDetail {
  readonly id: string;
  readonly productName: string;
  readonly brand: string;
  readonly imageUrls: readonly string[];
  /** Product-level gallery used when variant images are missing or fail to load. */
  readonly productImageUrls: readonly string[];
  readonly variantTags: readonly VariantAttribute[];
  readonly category: string;
  readonly subCategory: string;
  readonly sku: string;
  readonly productId: string;
  readonly productVariantId: string;
  readonly productSku: string;
  readonly condition: string;
  readonly conditionDisplay: string;
  readonly rawCondition: EcommerceOfferCondition;
  readonly location: string;
  readonly stock: number;
  readonly totalStock: number;
  readonly priceLabel: string;
  readonly currency: string;
  readonly rawPrice: number;
  readonly seller: string;
  readonly sellerId: string;
  readonly submittedOn: string;
  /** Ecommerce lifecycle: ACTIVE · INACTIVE · EXPIRED */
  readonly status: EcommerceOfferStatus;
  readonly description: string;
  readonly attributeRows: readonly ListingDetailAttributeRow[];
  /** Offer `startsAt` from ecommerce (ISO-8601). */
  readonly offerStartsAtUtc: string;
  /** Offer `endsAt` from ecommerce, or null when open-ended. */
  readonly offerEndsAtUtc: string | null;
}

export interface ListingDetailAttributeRow {
  readonly label: string;
  readonly value: string;
}

export interface ListingDetailVariant {
  readonly id: string;
  readonly title: string;
  readonly tags: readonly VariantAttribute[];
  readonly catalogSku: string;
  readonly sellerSku: string;
  readonly imageUrls: readonly string[];
}

export interface ListingDetail {
  readonly id: string;
  readonly productName: string;
  readonly brand: string;
  readonly categoryPath: string;
  readonly createdOn: string;
  readonly updatedOn: string;
  readonly imageUrls: readonly string[];
  readonly status: CatalogListingStatus;
  readonly description: string;
  readonly keyFeatures: readonly string[];
  readonly attributeRows: readonly ListingDetailAttributeRow[];
  readonly handle: string;
  readonly subtitle: string;
  readonly tags: readonly string[];
  readonly variants: readonly ListingDetailVariant[];
}

export interface RequestVariantOffer {
  readonly id: string;
  readonly tags: readonly VariantAttribute[];
  readonly imageUrls: readonly string[];
  readonly sku: string;
  readonly condition: string;
  readonly location: string;
  readonly stock: number;
  readonly price: string;
}

export interface ListingRequestDetail {
  readonly id: string;
  readonly productName: string;
  readonly brand: string;
  readonly categoryPath: string;
  readonly imageUrls: readonly string[];
  readonly status: ListingRequestStatus;
  readonly workflowStatus: ListingRequestWorkflowStatus;
  readonly description: string;
  readonly keyFeatures: readonly string[];
  readonly attributes: Readonly<Record<string, string>>;
  readonly sellerName: string;
  readonly sellerEmail: string;
  readonly submittedOn: string;
  readonly matchResult:
    | 'match_found'
    | 'possible_match'
    | 'no_match_found'
    | null;
  readonly rejectionReason: string | null;
  readonly variants: readonly RequestVariantOffer[];
}

import type {
  ActivationRequestItemStatus,
  ActivationRequestStatus,
} from '@/constants/rewards-portal/activationRequestStatus';

export type GiftCardStatus = 'active' | 'inactive';

export type GiftCardRow = {
  id: string;
  name: string;
  brand: string;
  category: string;
  denominationType: 'open' | 'fixed';
  salesChannels: number | null;
  activations: number | null;
  countries: string;
  status: GiftCardStatus;
  imageInitials: string;
  imageColor: string;
};

export type ActivationRequestRow = {
  id: string;
  tenantId: string;
  tenantName: string;
  businessOwnerEmail: string;
  cardsLabel: string;
  submittedAt: string;
  status: ActivationRequestStatus;
  submittedByUserId: string;
  notes: string | null;
};

export type ActivationRequestCardItem = {
  id: string;
  name: string;
  brand: string;
  productId: string;
  category: string;
  minDenomination: string;
  maxDenomination: string;
  denominationType: string;
  validity: string;
  deliveryMode: string;
  redemption: string;
  country: string;
  usageLimitation: string;
  expectedSpend: string;
  preferredDenominations: string;
  status: ActivationRequestItemStatus;
  imageUrl: string | null;
  imageInitials: string;
  imageColor: string;
};

export type ActivationRequestDetail = {
  id: string;
  status: ActivationRequestStatus;
  submittedByUserId: string;
  tenantId: string;
  businessName: string;
  businessOwnerEmail: string;
  businessOwnerInitial: string;
  accountStatus: string;
  kybStatus: string;
  complianceFlag: string;
  activeCards: string;
  ordersLast30Days: string;
  floatBalance: string;
  cards: ActivationRequestCardItem[];
  canClose: boolean;
  notes: string | null;
};

export type GiftCardManagementTab = 'gift-cards' | 'activation-requests';

export type GiftCardSalesChannelRow = {
  id: string;
  name: string;
  active: boolean;
};

export type GiftCardActivationLogRow = {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
};

export type GiftCardDetail = {
  id: string;
  cardId: string;
  name: string;
  brand: string;
  category: string;
  categoryId: string | null;
  denominationType: 'open' | 'fixed';
  preferredDenominations: string;
  validity: string;
  usageLimitations: string;
  deliveryMode: string;
  country: string;
  redemption: string;
  status: GiftCardStatus;
  isThirdParty: boolean;
  imageUrl: string | null;
  imageInitials: string;
  imageColor: string;
  salesChannels: GiftCardSalesChannelRow[];
  activationLog: GiftCardActivationLogRow[];
};
