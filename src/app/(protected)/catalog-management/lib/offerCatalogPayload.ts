import type {
  EcommerceOfferCondition,
  EcommerceOfferDetailDto,
  CatalogOfferListRow,
  OfferDetail,
  SellerOfferRow,
} from '@/types/catalog';

import {
  formatEcommerceDate,
  formatOfferConditionDisplay,
  formatOfferPriceLabel,
  normalizedEcommerceOfferStatus,
  readOfferPriceFromApi,
} from './displayFormat';
import { productMetadataAttributeRows } from './parseListingDetail';
import {
  collectOfferImageUrls,
  collectProductImageUrls,
} from './catalogImageUrls';
import { CATALOG_PRODUCT_PLACEHOLDER_IMAGE } from './constants';
import {
  readCategoryPair,
  readProductBrand,
  variantOptionTagsFromProduct,
} from './productCatalogPayload';

function coerceEcommerceOfferCondition(
  raw: EcommerceOfferDetailDto['condition'],
): EcommerceOfferCondition {
  if (typeof raw !== 'string' && typeof raw !== 'number') {
    return 'NEW';
  }
  const s = String(raw).trim().toUpperCase();
  if (s === 'NEW' || s === 'USED' || s === 'REFURB') {
    return s;
  }
  return 'NEW';
}

function readOfferAvailableStock(raw: Record<string, unknown>): number {
  if (
    typeof raw.availableStock === 'number' &&
    Number.isFinite(raw.availableStock)
  ) {
    return raw.availableStock;
  }
  const nested = raw.offer;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const offer = nested as Record<string, unknown>;
    if (
      typeof offer.availableStock === 'number' &&
      Number.isFinite(offer.availableStock)
    ) {
      return offer.availableStock;
    }
    const inventory = offer.inventory;
    if (
      inventory &&
      typeof inventory === 'object' &&
      !Array.isArray(inventory)
    ) {
      const available = (inventory as Record<string, unknown>).availableStock;
      if (typeof available === 'number' && Number.isFinite(available)) {
        return available;
      }
    }
  }
  return 0;
}

function readSellerDisplayLabel(seller: unknown): string {
  if (!seller || typeof seller !== 'object') {
    return '—';
  }
  const s = seller as {
    id?: string;
    metadata?: Record<string, unknown>;
  };
  const m = s.metadata;
  const keys = ['businessName', 'companyName', 'storeName', 'displayName'];
  for (const k of keys) {
    const v = m?.[k];
    if (typeof v === 'string' && v.trim()) {
      return v.trim();
    }
  }
  return typeof s.id === 'string' && s.id ? `${s.id.slice(0, 8)}…` : '—';
}

export function readSalesChannelFromOfferMetadata(metadata: unknown): string {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return '—';
  }
  const m = metadata as Record<string, unknown>;
  const keys = [
    'salesChannel',
    'salesChannelName',
    'channelName',
    'channel',
    'distributionChannel',
  ];
  for (const k of keys) {
    const v = m[k];
    if (typeof v === 'string' && v.trim()) {
      return v.trim();
    }
  }
  return '—';
}

function readSalesChannelsFromOpsOffer(raw: Record<string, unknown>): string {
  const channels = raw.salesChannels;
  if (Array.isArray(channels) && channels.length > 0) {
    const names = channels
      .map((channel) => {
        if (!channel || typeof channel !== 'object' || Array.isArray(channel)) {
          return '';
        }
        const name = (channel as { name?: unknown }).name;
        return typeof name === 'string' ? name.trim() : '';
      })
      .filter(Boolean);
    if (names.length > 0) {
      return names.join(', ');
    }
  }
  return readSalesChannelFromOfferMetadata(raw.metadata);
}

function createdAtToEpochMs(createdAt: unknown): number {
  if (createdAt instanceof Date) {
    const ms = createdAt.getTime();
    return Number.isFinite(ms) ? ms : 0;
  }
  if (typeof createdAt === 'string' || typeof createdAt === 'number') {
    const ms = Date.parse(String(createdAt));
    return Number.isFinite(ms) ? ms : 0;
  }
  return 0;
}

function offerCreatedAtMs(raw: unknown): number {
  if (!raw || typeof raw !== 'object') {
    return 0;
  }
  return createdAtToEpochMs((raw as { createdAt?: unknown }).createdAt);
}

/** Newest-first guard when API/ES order and UI cache disagree. */
export function sortOfferDtosByCreatedAtDesc(
  rows: readonly unknown[],
): unknown[] {
  return [...rows].sort((a, b) => offerCreatedAtMs(b) - offerCreatedAtMs(a));
}

function readSellerSku(o: Record<string, unknown>): string {
  if (typeof o.sellerSku === 'string' && o.sellerSku.trim()) {
    return o.sellerSku;
  }
  if (typeof o.productSku === 'string' && o.productSku.trim()) {
    return o.productSku;
  }
  return '—';
}

function readConditionString(condRaw: unknown): string {
  if (typeof condRaw === 'string') {
    return condRaw;
  }
  if (typeof condRaw === 'number' || typeof condRaw === 'boolean') {
    return String(condRaw);
  }
  return '—';
}

function readTrimmedStringField(value: unknown, fallback = '—'): string {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  return fallback;
}

/** Shared shape for offers table and offer detail header (nested product summary when present). */
export function offerListRowFromApiResponse(
  raw: unknown,
): CatalogOfferListRow | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const id = o.id;
  if (typeof id !== 'string' || !id) {
    return null;
  }

  const product =
    o.product && typeof o.product === 'object'
      ? (o.product as Record<string, unknown>)
      : null;

  const productVariantId =
    typeof o.productVariantId === 'string' && o.productVariantId.trim()
      ? o.productVariantId.trim()
      : undefined;

  const offerImageUrls = collectOfferImageUrls(product, productVariantId);
  const { category, subCategory } = product
    ? readCategoryPair(product)
    : { category: '—', subCategory: '—' };

  const currency = typeof o.currency === 'string' ? o.currency : '';
  const price = readOfferPriceFromApi(o);
  const condRaw = o.condition;

  return {
    id,
    sku: readSellerSku(o),
    productSku: readTrimmedStringField(o.productSku),
    seller: readSellerDisplayLabel(o.seller),
    productName:
      product && typeof product.title === 'string' ? product.title : '—',
    imageUrl: offerImageUrls[0] ?? CATALOG_PRODUCT_PLACEHOLDER_IMAGE,
    category,
    subCategory,
    salesChannel: readSalesChannelsFromOpsOffer(o),
    location: readTrimmedStringField(o.location),
    status: normalizedEcommerceOfferStatus(
      typeof o.status === 'string' || typeof o.status === 'number'
        ? String(o.status)
        : '',
    ),
    submittedOn: formatEcommerceDate(o.createdAt),
    condition: readConditionString(condRaw),
    conditionDisplay: formatOfferConditionDisplay(condRaw),
    priceDisplay: formatOfferPriceLabel(currency, price),
    currency,
    stock: readOfferAvailableStock(o),
  };
}

function resolveOfferDetailImageUrls(
  product: EcommerceOfferDetailDto['product'],
  variantFilter: string | undefined,
  fallbackImageUrl: string,
): string[] {
  const productImageUrls = collectProductImageUrls(product);
  const imageUrlsRaw = collectOfferImageUrls(product, variantFilter);
  if (imageUrlsRaw.length > 0) {
    return imageUrlsRaw;
  }
  if (productImageUrls.length > 0) {
    return productImageUrls;
  }
  return [fallbackImageUrl || CATALOG_PRODUCT_PLACEHOLDER_IMAGE];
}

function readOfferDetailDescription(
  product: EcommerceOfferDetailDto['product'],
): string {
  const description = product?.description;
  if (
    description !== null &&
    description !== undefined &&
    description.trim().length > 0
  ) {
    return description;
  }
  return '';
}

function readOfferStartsAtUtc(startsAt: unknown): string {
  if (typeof startsAt === 'string' && startsAt.trim().length > 0) {
    return startsAt;
  }
  return '';
}

function readOfferEndsAtUtc(endsAt: unknown): string | null {
  if (endsAt === null || endsAt === undefined) {
    return null;
  }
  if (typeof endsAt === 'string' && endsAt.trim().length > 0) {
    return endsAt;
  }
  if (typeof endsAt === 'number') {
    const asString = String(endsAt).trim();
    return asString.length > 0 ? asString : null;
  }
  return null;
}

/** Extends list row with specs, inventory, and linked catalog product fields for the detail page. */
export function offerDetailFromApiResponse(
  dto: EcommerceOfferDetailDto,
): OfferDetail | null {
  const base = offerListRowFromApiResponse(dto);
  if (!base) {
    return null;
  }

  const dtoRecord = dto as unknown as Record<string, unknown>;
  const detailCurrency =
    typeof dto.currency === 'string' ? dto.currency : base.currency;
  const price = readOfferPriceFromApi(dtoRecord);
  const product = dto.product;

  const variantFilter =
    typeof dto.productVariantId === 'string' &&
    dto.productVariantId.trim() &&
    dto.productVariantId.trim() !== '—'
      ? dto.productVariantId.trim()
      : undefined;

  const offerStartsAtUtc = readOfferStartsAtUtc(dto.startsAt);
  if (!offerStartsAtUtc.trim()) {
    return null;
  }

  const available =
    typeof dto.availableStock === 'number' ? dto.availableStock : 0;
  const total = typeof dto.totalStock === 'number' ? dto.totalStock : available;
  const conditionRaw =
    typeof dto.condition === 'string' || typeof dto.condition === 'number'
      ? String(dto.condition)
      : '';

  return {
    id: base.id,
    productName: base.productName,
    brand: readProductBrand(product),
    imageUrls: resolveOfferDetailImageUrls(
      product,
      variantFilter,
      base.imageUrl,
    ),
    productImageUrls: collectProductImageUrls(product),
    variantTags: variantOptionTagsFromProduct(product, {
      onlyVariantId: variantFilter,
    }),
    category: base.category,
    subCategory: base.subCategory,
    sku: base.sku,
    productId: readTrimmedStringField(dto.productId),
    productVariantId: readTrimmedStringField(dto.productVariantId),
    productSku: readTrimmedStringField(dto.productSku, base.productSku),
    condition: conditionRaw.trim() !== '' ? conditionRaw.trim() : '—',
    conditionDisplay: formatOfferConditionDisplay(dto.condition),
    rawCondition: coerceEcommerceOfferCondition(dto.condition),
    location: readTrimmedStringField(dto.location),
    stock: available,
    totalStock: total,
    priceLabel: formatOfferPriceLabel(detailCurrency, price),
    currency: detailCurrency,
    rawPrice: Number.isFinite(price) ? price : 0,
    seller: base.seller,
    sellerId: readTrimmedStringField(dto.sellerId),
    submittedOn: base.submittedOn,
    status: normalizedEcommerceOfferStatus(
      typeof dto.status === 'string' || typeof dto.status === 'number'
        ? String(dto.status)
        : '',
    ),
    description: readOfferDetailDescription(product),
    attributeRows: productMetadataAttributeRows(product),
    offerStartsAtUtc,
    offerEndsAtUtc: readOfferEndsAtUtc(dto.endsAt),
  };
}

export function sellerOfferTableRowFromApiResponse(
  raw: unknown,
): SellerOfferRow | null {
  const base = offerListRowFromApiResponse(raw);
  if (!base) {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const product =
    o.product && typeof o.product === 'object'
      ? (o.product as Record<string, unknown>)
      : null;

  const variantFilter =
    typeof o.productVariantId === 'string' &&
    o.productVariantId.trim() &&
    o.productVariantId.trim() !== '—'
      ? o.productVariantId.trim()
      : undefined;
  const variantTags = variantOptionTagsFromProduct(product, {
    onlyVariantId: variantFilter,
  });
  const currency = typeof o.currency === 'string' ? o.currency : '';
  const price = readOfferPriceFromApi(o);
  const priceLabel = formatOfferPriceLabel(currency, price);
  return {
    id: base.id,
    sku: base.sku,
    seller: base.seller,
    salesChannel: base.salesChannel,
    variantTags,
    location: base.location,
    stock: readOfferAvailableStock(o),
    priceLabel,
    status: base.status,
    submittedOn: base.submittedOn,
  };
}
