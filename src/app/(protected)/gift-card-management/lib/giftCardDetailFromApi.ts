import type { GiftCardDetail } from '@/types/catalog';
import { collectProductImageUrls } from '@/app/(protected)/catalog-management/lib/catalogImageUrls';
import {
  readCategoryPair,
  readProductCategoryId,
  type LooseProductLike,
} from '@/app/(protected)/catalog-management/lib/productCatalogPayload';

import { giftCardRowFromApi } from './giftCardRowFromApi';

function readMetadata(product: LooseProductLike): Record<string, unknown> {
  const metadata = product.metadata;
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {};
  }
  return metadata as Record<string, unknown>;
}

/** Safe display string — avoids String(object) → "[object Object]". */
function asDisplayString(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === 'boolean') {
    return String(value);
  }
  return '';
}

function readCardId(product: LooseProductLike): string {
  const metadata = readMetadata(product);
  const parentSku = metadata.parentSku ?? metadata.parent_sku;
  if (typeof parentSku === 'string' && parentSku.trim()) {
    return parentSku.trim();
  }
  const externalId =
    metadata.externalId ?? metadata.external_id ?? product.externalId;
  if (typeof externalId === 'string' && externalId.trim()) {
    return externalId.trim();
  }
  return typeof product.id === 'string' ? product.id : '-';
}

function readDenominationList(values: unknown): string | null {
  if (!Array.isArray(values)) {
    return null;
  }
  const displayValues = values
    .map((value) => asDisplayString(value))
    .filter(Boolean);
  return displayValues.length > 0 ? displayValues.join(', ') : null;
}

function readOpenDenominationRange(record: {
  min?: unknown;
  max?: unknown;
  type?: unknown;
}): string | null {
  if (record.type !== 'open') {
    return null;
  }
  const min = asDisplayString(record.min);
  const max = asDisplayString(record.max);
  if (min && max) {
    return `${min} – ${max}`;
  }
  return null;
}

function readOptionTitle(option: object): string {
  const nested = (option as { option?: { title?: unknown } }).option?.title;
  return asDisplayString(nested).toLowerCase();
}

function collectDenominationValuesFromOptions(options: unknown[]): string[] {
  const values: string[] = [];
  for (const option of options) {
    if (!option || typeof option !== 'object') {
      continue;
    }
    const title = readOptionTitle(option);
    const value = asDisplayString((option as { value?: unknown }).value);
    if ((title === 'denomination' || title === 'amount') && value) {
      values.push(value);
    }
  }
  return values;
}

function readDenominationsFromVariants(
  product: LooseProductLike,
): string | null {
  const variants = product.variants;
  if (!Array.isArray(variants)) {
    return null;
  }

  const values: string[] = [];
  for (const variant of variants) {
    if (!variant || typeof variant !== 'object') {
      continue;
    }
    const options = (variant as { options?: unknown }).options;
    if (!Array.isArray(options)) {
      continue;
    }
    values.push(...collectDenominationValuesFromOptions(options));
  }

  return values.length > 0 ? values.join(', ') : null;
}

// preferred → allocated → open min/max range → variants options → '-'.
function readPreferredDenominations(product: LooseProductLike): string {
  const metadata = readMetadata(product);
  const denomination = metadata.denomination;
  if (
    denomination &&
    typeof denomination === 'object' &&
    !Array.isArray(denomination)
  ) {
    const record = denomination as {
      preferred?: unknown;
      allocated?: unknown;
      min?: unknown;
      max?: unknown;
      type?: unknown;
    };
    const preferred = readDenominationList(record.preferred);
    if (preferred) {
      return preferred;
    }
    const allocated = readDenominationList(record.allocated);
    if (allocated) {
      return allocated;
    }
    const openRange = readOpenDenominationRange(record);
    if (openRange) {
      return openRange;
    }
  }

  return readDenominationsFromVariants(product) ?? '-';
}

function readValidity(product: LooseProductLike): string {
  const metadata = readMetadata(product);
  const validity = metadata.validity;
  if (typeof validity === 'string' && validity.trim()) {
    return validity.trim();
  }
  if (typeof validity === 'number' && Number.isFinite(validity)) {
    return `${validity} Months`;
  }
  if (validity && typeof validity === 'object' && !Array.isArray(validity)) {
    const record = validity as { value?: unknown; unit?: unknown };
    const value = asDisplayString(record.value);
    const unit = asDisplayString(record.unit);
    if (value && unit) {
      return `${value} ${unit}`;
    }
    if (value) {
      return value;
    }
  }
  return '-';
}

function formatFulfillmentType(value: string): string {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function readDeliveryMode(product: LooseProductLike): string {
  const metadata = readMetadata(product);
  const fulfillmentTypes =
    metadata.fulfillment_types ?? metadata.fulfillmentTypes;
  if (Array.isArray(fulfillmentTypes)) {
    const labels = fulfillmentTypes
      .filter((value): value is string => typeof value === 'string')
      .map((value) => formatFulfillmentType(value.trim()))
      .filter(Boolean);
    if (labels.length > 0) {
      return labels.join(' + ');
    }
  }
  if (typeof fulfillmentTypes === 'string' && fulfillmentTypes.trim()) {
    return formatFulfillmentType(fulfillmentTypes.trim());
  }
  return '-';
}

function readUsageLimitations(product: LooseProductLike): string {
  const metadata = readMetadata(product);
  const candidates = [
    metadata.usageLimitation,
    metadata.usage_limitation,
    metadata.usageLimitations,
    metadata.usage_limitations,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }
  return '-';
}

function readRedemption(product: LooseProductLike): string {
  const metadata = readMetadata(product);
  const redemption = metadata.redemption ?? metadata.redemptionType;
  if (typeof redemption === 'string' && redemption.trim()) {
    return redemption.trim();
  }
  return '-';
}

function readIsThirdParty(product: LooseProductLike): boolean {
  const typeValue = product.type;
  if (typeValue && typeof typeValue === 'object' && 'value' in typeValue) {
    const value = asDisplayString(
      (typeValue as { value?: unknown }).value,
    ).toLowerCase();
    return value.includes('gift') || value.includes('third');
  }
  return true;
}

function formatCategoryLabel(category: string, subCategory: string): string {
  if (subCategory !== '—' && category !== '—') {
    return `${category} / ${subCategory}`;
  }
  if (category !== '—') {
    return category;
  }
  if (subCategory !== '—') {
    return subCategory;
  }
  return '-';
}

/** Maps admin-be GET /catalog/products/:id → gift card detail view model. */
export function giftCardDetailFromApi(raw: unknown): GiftCardDetail | null {
  const listRow = giftCardRowFromApi(raw);
  if (!listRow) {
    return null;
  }

  const product = raw as LooseProductLike;
  const { category, subCategory } = readCategoryPair(product);
  const imageUrls = collectProductImageUrls(product);

  return {
    id: listRow.id,
    cardId: readCardId(product),
    name: listRow.name,
    brand: listRow.brand,
    category: formatCategoryLabel(category, subCategory),
    categoryId: readProductCategoryId(product),
    denominationType: listRow.denominationType,
    preferredDenominations: readPreferredDenominations(product),
    validity: readValidity(product),
    usageLimitations: readUsageLimitations(product),
    deliveryMode: readDeliveryMode(product),
    country: listRow.countries,
    redemption: readRedemption(product),
    status: listRow.status,
    isThirdParty: readIsThirdParty(product),
    imageUrl: imageUrls[0] ?? null,
    imageInitials: listRow.imageInitials,
    imageColor: listRow.imageColor,
    salesChannels: [],
    activationLog: [],
  };
}
