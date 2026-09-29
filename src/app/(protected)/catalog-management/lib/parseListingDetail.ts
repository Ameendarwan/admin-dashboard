import type { EcommerceProductDto, ListingDetail } from '@/types/catalog';

import {
  collectProductImageUrls,
  collectVariantImagesOnly,
  unwrapCatalogProductPayload,
} from './catalogImageUrls';
import { CATALOG_PRODUCT_PLACEHOLDER_IMAGE } from './constants';
import { listingStatusFromPayload } from './displayFormat';

const METADATA_LABELS: Record<string, string> = {
  region: 'Region',
  country: 'Country',
  isActive: 'Active',
  parentSku: 'Parent SKU',
  externalId: 'External ID',
  discontinued: 'Discontinued',
  taxApplicable: 'Tax applicable',
  defaultLanguage: 'Default language',
  productGroup: 'Product group',
};

/** Category path separators: `>`, `/`, or `›`. */
const CATEGORY_PATH_SEPARATOR = /[>/›]/;

/** En dash, em dash, or hyphen used in attribute label segments. */
const LABEL_DASH_SEPARATOR = /[\u2013\u2014-]/;

function readText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  return '';
}

function formatPrimitiveDisplay(value: unknown): string | null {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return null;
}

function formatNamedObjectDisplay(
  record: Record<string, unknown>,
): string | null {
  const named =
    readText(record.name) || readText(record.label) || readText(record.title);
  const inner = record.value ?? record.values;
  if (inner !== undefined && inner !== null) {
    const formatted = formatDisplayValue(inner);
    if (formatted) {
      return named ? `${named}: ${formatted}` : formatted;
    }
  }
  return named || null;
}

function formatShallowObjectEntries(record: Record<string, unknown>): string {
  const shallow: string[] = [];
  for (const [key, nested] of Object.entries(record)) {
    if (nested !== null && typeof nested === 'object') {
      continue;
    }
    const part = formatDisplayValue(nested);
    if (part) {
      shallow.push(`${labelForKey(key)}: ${part}`);
    }
  }
  return shallow.join(', ');
}

function formatDisplayValue(value: unknown): string {
  const primitive = formatPrimitiveDisplay(value);
  if (primitive !== null) {
    return primitive;
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => formatDisplayValue(item))
      .filter((part) => part.length > 0)
      .join(', ');
  }
  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>;
    const named = formatNamedObjectDisplay(record);
    if (named !== null) {
      return named;
    }
    return formatShallowObjectEntries(record);
  }
  return '';
}

function flattenSingleKeyRecord(
  record: Record<string, unknown>,
): { label: string; value: string } | null {
  const keys = Object.keys(record);
  if (keys.length !== 1) {
    return null;
  }
  const [onlyKey] = keys;
  const display = formatDisplayValue(record[onlyKey]);
  if (!display) {
    return null;
  }
  return { label: labelForKey(onlyKey), value: display };
}

function flattenArrayAttributeSource(
  labelPrefix: string,
  items: unknown[],
): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];

  for (const item of items) {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const record = item as Record<string, unknown>;
      const single = flattenSingleKeyRecord(record);
      if (single) {
        out.push(single);
        continue;
      }
      for (const [key, value] of Object.entries(record)) {
        out.push(...flattenAttributeSource(labelForKey(key), value));
      }
      continue;
    }
    const display = formatDisplayValue(item);
    if (display) {
      out.push({ label: labelPrefix, value: display });
    }
  }

  return out;
}

function flattenObjectAttributeSource(
  labelPrefix: string,
  record: Record<string, unknown>,
): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  const keys = Object.keys(record);

  if (keys.length === 0) {
    return out;
  }

  if (keys.length === 1 && ('value' in record || 'values' in record)) {
    const display = formatDisplayValue(record.value ?? record.values);
    if (display) {
      out.push({
        label: labelPrefix || labelForKey(keys[0]),
        value: display,
      });
    }
    return out;
  }

  for (const [key, value] of Object.entries(record)) {
    const childLabel =
      labelPrefix && labelPrefix.toLowerCase() !== key.toLowerCase()
        ? `${labelPrefix} – ${labelForKey(key)}`
        : labelForKey(key);
    out.push(...flattenAttributeSource(childLabel, value));
  }
  return out;
}

/** Turn API attribute values (scalars, arrays, nested maps) into label/value rows. */
function flattenAttributeSource(
  labelPrefix: string,
  raw: unknown,
): { label: string; value: string }[] {
  if (raw === null || raw === undefined) {
    return [];
  }

  if (Array.isArray(raw)) {
    return flattenArrayAttributeSource(labelPrefix, raw);
  }

  if (typeof raw === 'object') {
    return flattenObjectAttributeSource(
      labelPrefix,
      raw as Record<string, unknown>,
    );
  }

  const display = formatDisplayValue(raw);
  return display ? [{ label: labelPrefix, value: display }] : [];
}

function labelForKey(key: string): string {
  if (METADATA_LABELS[key]) {
    return METADATA_LABELS[key];
  }
  const spaced = key.replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('_', ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatDate(value: unknown): string {
  if (value === null || value === undefined) {
    return '—';
  }

  let d: Date;
  if (value instanceof Date) {
    d = value;
  } else if (typeof value === 'string' || typeof value === 'number') {
    d = new Date(value);
  } else {
    return '—';
  }

  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

function readBrand(product: EcommerceProductDto): string {
  const rawBrand = product.brand;
  if (typeof rawBrand === 'string') {
    const text = rawBrand.trim();
    return text || '—';
  }
  if (rawBrand && typeof rawBrand === 'object') {
    const name = rawBrand.name;
    if (typeof name === 'string' && name.trim()) {
      return name.trim();
    }
  }
  return '—';
}

function readCategoryPath(product: EcommerceProductDto): string {
  const fromPath = readText(product.categoryPath);
  if (fromPath) {
    return fromPath
      .split(CATEGORY_PATH_SEPARATOR)
      .map((part) => part.trim())
      .filter(Boolean)
      .join(' / ');
  }
  const category = product.categories?.[0];
  if (!category) {
    return '—';
  }
  const parent = readText(category.parentCategory?.name);
  const name = readText(category.name);
  if (parent && name) {
    return `${parent} / ${name}`;
  }
  if (name) {
    return name;
  }
  return '—';
}

function readTags(product: EcommerceProductDto): string[] {
  const tags: string[] = [];
  for (const tag of product.tags ?? []) {
    const value = readText(tag.value);
    if (value && !tags.includes(value)) {
      tags.push(value);
    }
  }
  for (const value of product.tagValues ?? []) {
    const trimmed = readText(value);
    if (trimmed && !tags.includes(trimmed)) {
      tags.push(trimmed);
    }
  }
  return tags;
}

function readKeyFeatures(product: EcommerceProductDto): string[] {
  const fromList = (raw: unknown): string[] => {
    if (!Array.isArray(raw)) {
      return [];
    }
    const lines: string[] = [];
    for (const item of raw) {
      const text = readText(item);
      if (text && !lines.includes(text)) {
        lines.push(text);
      }
    }
    return lines;
  };

  const topLevel = fromList(product.keyFeatures);
  if (topLevel.length > 0) {
    return topLevel;
  }

  const meta = product.metadata;
  if (!meta) {
    return [];
  }

  const fromMeta = fromList(meta.keyFeatures);
  if (fromMeta.length > 0) {
    return fromMeta;
  }

  return fromList(meta.features);
}

export type CatalogProductAttributeRow = {
  readonly label: string;
  readonly value: string;
};

/** Lowercased titles from product.options → variant-defining axes (exclude from Attributes grid on offer detail). */
function variantDimensionTitlesLower(
  product: EcommerceProductDto,
): Set<string> {
  const titles = new Set<string>();
  for (const opt of product.options ?? []) {
    const t = readText(opt.title);
    if (t.length > 0) {
      titles.add(t.toLowerCase());
    }
  }
  return titles;
}

/**
 * Row label overlaps a variant axis if it equals an option title (any segment split on dash).
 */
function labelOverlapsVariantAxis(
  label: string,
  variantTitlesLower: Set<string>,
): boolean {
  const norm = label.trim().toLowerCase();
  if (norm.length === 0) {
    return false;
  }
  if (variantTitlesLower.has(norm)) {
    return true;
  }
  const segments = norm
    .split(LABEL_DASH_SEPARATOR)
    .map((seg) => seg.trim())
    .filter(Boolean);
  for (const seg of segments) {
    if (variantTitlesLower.has(seg)) {
      return true;
    }
  }
  return false;
}

/**
 * Category / product spec attributes for offer detail: `product.attributes` and nested
 * `product.metadata.attributes`. Omits axes defined under `product.options` (RAM, Color, Storage, …);
 * variant values stay on variant chips, not here.
 */
export function catalogProductAttributeRows(
  product: EcommerceProductDto,
): CatalogProductAttributeRow[] {
  const rows: CatalogProductAttributeRow[] = [];
  const seen = new Set<string>();
  const blocked = variantDimensionTitlesLower(product);

  const pushUnique = (label: string, display: string) => {
    if (labelOverlapsVariantAxis(label, blocked)) {
      return;
    }
    const trimmedLabel = label.trim();
    const trimmedDisplay = display.trim();
    if (!trimmedLabel || !trimmedDisplay) {
      return;
    }
    const dedupeKey = `${trimmedLabel.toLowerCase()}:${trimmedDisplay.toLowerCase()}`;
    if (seen.has(dedupeKey)) {
      return;
    }
    seen.add(dedupeKey);
    rows.push({ label: trimmedLabel, value: trimmedDisplay });
  };

  const fromRecordRoot = (raw: unknown): void => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return;
    }
    const attributeFlats = flattenAttributeSource('', raw);
    for (const flat of attributeFlats) {
      pushUnique(flat.label, flat.value);
    }
  };

  fromRecordRoot(product.attributes);

  const meta = product.metadata;
  const nested =
    meta && typeof meta === 'object' && meta.attributes !== undefined
      ? meta.attributes
      : null;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    fromRecordRoot(nested);
  }

  return rows;
}

/**
 * Active listing detail: show only structured product attributes from
 * `product.metadata.attributes` (ecommerce spec). Omits variant axis labels that
 * duplicate `product.options` so variant dimensions stay on variant rows only.
 */
function readAttributeRows(
  product: EcommerceProductDto,
): ListingDetail['attributeRows'] {
  const meta = product.metadata;
  if (!meta || typeof meta !== 'object' || meta.attributes === undefined) {
    return [];
  }

  const nested = meta.attributes;
  if (
    nested === null ||
    (typeof nested !== 'object' && !Array.isArray(nested))
  ) {
    return [];
  }

  const blocked = variantDimensionTitlesLower(product);
  const rows: ListingDetail['attributeRows'][number][] = [];
  const seen = new Set<string>();

  const flats = flattenAttributeSource('', nested);
  for (const flat of flats) {
    if (labelOverlapsVariantAxis(flat.label, blocked)) {
      continue;
    }
    const trimmedLabel = flat.label.trim();
    const trimmedDisplay = flat.value.trim();
    if (!trimmedLabel || !trimmedDisplay) {
      continue;
    }
    const dedupeKey = `${trimmedLabel.toLowerCase()}:${trimmedDisplay.toLowerCase()}`;
    if (seen.has(dedupeKey)) {
      continue;
    }
    seen.add(dedupeKey);
    rows.push({ label: trimmedLabel, value: trimmedDisplay });
  }

  return rows;
}

/** `product.metadata.attributes` rows for offer / listing detail (variant axes excluded). */
export function productMetadataAttributeRows(
  product: EcommerceProductDto | null | undefined,
): ListingDetail['attributeRows'] {
  if (!product) {
    return [];
  }
  return readAttributeRows(product);
}

function readVariants(product: EcommerceProductDto): ListingDetail['variants'] {
  const variants: ListingDetail['variants'][number][] = [];

  for (const rawVariant of product.variants ?? []) {
    if (!rawVariant || typeof rawVariant !== 'object') {
      continue;
    }

    const tags: ListingDetail['variants'][number]['tags'][number][] = [];
    for (const option of rawVariant.options ?? []) {
      const label = readText(option.option?.title) || 'Option';
      const value = readText(option.value);
      if (value) {
        tags.push({ label, value });
      }
    }

    const meta =
      rawVariant.metadata && typeof rawVariant.metadata === 'object'
        ? rawVariant.metadata
        : null;
    const sellerSku = meta ? readText(meta.sellerSku) : '';

    const title =
      readText(rawVariant.title) ||
      tags.map((tag) => tag.value).join(' / ') ||
      'Variant';

    variants.push({
      id: readText(rawVariant.id) || `variant-${variants.length + 1}`,
      title,
      tags,
      catalogSku: readText(rawVariant.sku),
      sellerSku,
      imageUrls: collectVariantImagesOnly(rawVariant),
    });
  }

  return variants;
}

/** Build listing detail view-model from a catalog product API response. */
export function parseListingDetail(raw: unknown): ListingDetail | null {
  const unwrapped = unwrapCatalogProductPayload(raw);
  if (!unwrapped) {
    return null;
  }

  const product = unwrapped as unknown as EcommerceProductDto;
  const id = readText(product.id);
  if (!id) {
    return null;
  }

  const imageUrls = collectProductImageUrls(unwrapped);

  return {
    id,
    productName: readText(product.title) || '—',
    brand: readBrand(product),
    categoryPath: readCategoryPath(product),
    createdOn: formatDate(product.createdAt),
    updatedOn: formatDate(product.updatedAt),
    imageUrls:
      imageUrls.length > 0 ? imageUrls : [CATALOG_PRODUCT_PLACEHOLDER_IMAGE],
    status: listingStatusFromPayload(product.status),
    description: readText(product.description),
    keyFeatures: readKeyFeatures(product),
    attributeRows: readAttributeRows(product),
    handle: readText(product.handle),
    subtitle: readText(product.subtitle),
    tags: readTags(product),
    variants: readVariants(product),
  };
}
