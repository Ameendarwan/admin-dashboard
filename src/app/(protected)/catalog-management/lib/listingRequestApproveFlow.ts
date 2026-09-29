import {
  createCatalogOffer,
  createCatalogProduct,
  createCatalogProductVariant,
  getCatalogCategoryVariantFields,
  getCatalogListingRequest,
  getCatalogProduct,
  getCatalogSellerSkuExists,
  matchCatalogProduct,
  patchCatalogListingRequestStatus,
} from '@/services/catalogAdminService';
import type { ApproveCatalogListingRequestResponse } from '@/types/catalog';

import {
  extractImageUrlsFromProductJson,
  readCategoryName,
  readString,
  recordFromUnknown,
} from './listingRequestRowFieldReaders';
import { parseVariantImages } from './variantImageUtils';

type MatchResult = {
  productExists?: boolean;
  productId?: string;
  variantExists?: boolean;
  variant?: { id?: string };
};

function asScalarString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return '';
}

function normalizeMatchText(value: unknown): string {
  return asScalarString(value)
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function variantOptionLookupKey(raw: string): string {
  return normalizeMatchText(raw).toLowerCase();
}

function normalizeVariantOptions(
  raw: Record<string, unknown> | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw) return out;
  for (const [k, v] of Object.entries(raw)) {
    const key = normalizeMatchText(k);
    const value = normalizeMatchText(v);
    if (key && value) out[key] = value;
  }
  return out;
}

/** Aligns seller spreadsheet option keys with PIM/catalog axis labels (case/space insensitive). */
function remapOptionKeys(
  options: Record<string, string>,
  allowedTitles: readonly string[],
): { mapped: Record<string, string>; unknownKeys: string[] } {
  if (!allowedTitles.length) {
    return { mapped: { ...options }, unknownKeys: [] };
  }
  const canonicalByLookup = new Map<string, string>();
  for (const label of allowedTitles) {
    const display = normalizeMatchText(label);
    if (display) {
      canonicalByLookup.set(variantOptionLookupKey(display), display);
    }
  }
  const mapped: Record<string, string> = {};
  const unknownKeys: string[] = [];
  for (const [optionKey, value] of Object.entries(options)) {
    const canonical = canonicalByLookup.get(variantOptionLookupKey(optionKey));
    if (canonical !== undefined) {
      mapped[canonical] = value;
    } else {
      unknownKeys.push(optionKey);
    }
  }
  return { mapped, unknownKeys };
}

function listingRequestCategoryId(row: Record<string, unknown>): string | null {
  const sub = readCategoryName(row.subCategory);
  const cat = readCategoryName(row.category);
  return sub?.id?.trim() || cat?.id?.trim() || null;
}

function offerCondition(raw: unknown): string {
  const v = asScalarString(raw).trim().toUpperCase();
  if (v === 'USED') return 'USED';
  if (v === 'REFURB' || v === 'REFURBISHED') return 'REFURB';
  return 'NEW';
}

function offerPriceMinor(raw: unknown): number {
  const n =
    typeof raw === 'number'
      ? raw
      : Number.parseFloat(asScalarString(raw).trim());
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n);
}

function offerStock(raw: unknown): number {
  const n =
    typeof raw === 'number' ? raw : Number.parseInt(asScalarString(raw), 10);
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
}

function productOptionTitles(product: unknown): string[] {
  if (!product || typeof product !== 'object' || Array.isArray(product)) {
    return [];
  }
  const options = (product as { options?: unknown }).options;
  if (!Array.isArray(options)) return [];
  const titles: string[] = [];
  for (const row of options) {
    if (
      row &&
      typeof row === 'object' &&
      typeof (row as { title?: unknown }).title === 'string'
    ) {
      const t = normalizeMatchText((row as { title: string }).title);
      if (t) titles.push(t);
    }
  }
  return titles;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function readFeatureTags(
  productJson: Record<string, unknown> | null,
): string[] {
  if (!Array.isArray(productJson?.keyFeatures)) {
    return [];
  }
  return (productJson.keyFeatures as unknown[])
    .map((f) => asScalarString(f).trim())
    .filter(Boolean);
}

async function loadCategoryVariantLabels(
  categoryId: string,
): Promise<string[]> {
  try {
    const vfRes = await getCatalogCategoryVariantFields(categoryId);
    return (vfRes.variantFields ?? [])
      .map((f) =>
        typeof f.label === 'string' ? normalizeMatchText(f.label) : '',
      )
      .filter((s) => s.length > 0);
  } catch {
    return [];
  }
}

function assertCategoryOptionKeys(
  categoryId: string,
  categoryVariantLabels: string[],
  remapped: { unknownKeys: string[] },
): void {
  if (categoryVariantLabels.length > 0 && remapped.unknownKeys.length > 0) {
    throw new Error(
      `Variant option keys are not part of category variant-fields (${categoryId}): ` +
        `${remapped.unknownKeys.join(', ')}. Expected: ${categoryVariantLabels.join(', ')}.`,
    );
  }
}

async function ensureCatalogProductId(args: {
  title: string;
  categoryId: string;
  productJson: Record<string, unknown> | null;
  attributesJson: Record<string, unknown> | null;
  optionsForVariant: Record<string, string>;
  variantImages: string[] | undefined;
  matchResult: MatchResult;
}): Promise<string> {
  const existingId =
    typeof args.matchResult.productId === 'string'
      ? args.matchResult.productId
      : '';
  if (args.matchResult.productExists && existingId) {
    return existingId;
  }

  const tags = readFeatureTags(args.productJson);
  const createBody: Record<string, unknown> = {
    title: args.title,
    description:
      typeof args.productJson?.description === 'string'
        ? args.productJson.description
        : undefined,
    brand:
      typeof args.productJson?.brand === 'string'
        ? args.productJson.brand
        : undefined,
    images: extractImageUrlsFromProductJson(args.productJson),
    categories: [{ id: args.categoryId }],
    tags: tags.length ? tags : undefined,
    attributes:
      args.attributesJson && Object.keys(args.attributesJson).length > 0
        ? args.attributesJson
        : undefined,
    variants: [
      {
        options: args.optionsForVariant,
        ...(args.variantImages?.length ? { images: args.variantImages } : {}),
      },
    ],
  };

  const created = await createCatalogProduct(
    createBody as Parameters<typeof createCatalogProduct>[0],
  );
  const newId = created?.data?.product?.id;
  if (!newId || typeof newId !== 'string') {
    throw new Error(
      'Catalog service did not return data.product.id after create',
    );
  }
  return newId;
}

async function alignOptionsToProductAxes(
  productId: string,
  variantOpts: Record<string, string>,
): Promise<Record<string, string>> {
  if (Object.keys(variantOpts).length === 0) {
    return variantOpts;
  }
  const prod = await getCatalogProduct(productId);
  const axes = productOptionTitles(prod);
  if (axes.length === 0) {
    return variantOpts;
  }
  const remapped = remapOptionKeys(variantOpts, axes);
  if (remapped.unknownKeys.length > 0) {
    throw new Error(
      `Variant options (${remapped.unknownKeys.join(', ')}) are not on catalog product ${productId}. ` +
        `Product defines: ${axes.join(', ')}.`,
    );
  }
  return remapped.mapped;
}

function readMatchedVariantId(matchResult: MatchResult): string {
  if (matchResult.variantExists === true && matchResult.variant?.id) {
    return asScalarString(matchResult.variant.id);
  }
  return '';
}

async function ensureCatalogVariantId(args: {
  productId: string;
  optionsForVariant: Record<string, string>;
  variantImages: string[] | undefined;
  runMatch: () => Promise<MatchResult>;
  matchResult: MatchResult;
}): Promise<string> {
  let variantId = readMatchedVariantId(args.matchResult);
  if (variantId) {
    return variantId;
  }

  await createCatalogProductVariant(args.productId, {
    options: args.optionsForVariant,
    ...(args.variantImages?.length ? { images: args.variantImages } : {}),
  });
  const rematch = await args.runMatch();
  variantId = readMatchedVariantId(rematch);
  if (!variantId) {
    throw new Error(
      'Could not resolve catalog variant id for this listing request',
    );
  }
  return variantId;
}

async function markRequestLiveIfSkuExists(args: {
  requestId: string;
  tenantId: string;
  sellerSku: string;
  locationId: string | undefined;
}): Promise<ApproveCatalogListingRequestResponse | null> {
  const skuCheck = await getCatalogSellerSkuExists({
    sellerId: args.tenantId,
    sellerSku: args.sellerSku,
    locationId: args.locationId,
  });
  if (skuCheck?.exists !== true) {
    return null;
  }
  const refreshed = await patchCatalogListingRequestStatus(args.requestId, {
    status: 'live',
  });
  return {
    alreadyLive: true,
    offerId: skuCheck.offerId,
    row: refreshed as Record<string, unknown>,
  };
}

async function createOfferAndMarkLive(args: {
  requestId: string;
  tenantId: string;
  sellerSku: string;
  productId: string;
  variantId: string;
  offersJson: Record<string, unknown>;
  locationId: string | undefined;
}): Promise<ApproveCatalogListingRequestResponse> {
  const productSummary = await getCatalogProduct(args.productId);
  const handle =
    typeof productSummary.handle === 'string'
      ? productSummary.handle.trim()
      : '';
  const productSku = handle || args.productId;

  const currency =
    typeof args.offersJson.currency === 'string' &&
    args.offersJson.currency.trim()
      ? args.offersJson.currency.trim().toUpperCase()
      : 'SAR';
  const price = offerPriceMinor(args.offersJson.price);
  if (price <= 0) {
    throw new Error('Listing request has invalid offer price');
  }

  const offerResult = await createCatalogOffer({
    sellerId: args.tenantId,
    sellerSku: args.sellerSku,
    productId: args.productId,
    productVariantId: args.variantId,
    productSku,
    condition: offerCondition(args.offersJson.condition),
    currency,
    price,
    totalStock: offerStock(args.offersJson.quantity),
    startsAt: new Date().toISOString(),
    ...(typeof args.offersJson.location === 'string' &&
    args.offersJson.location.trim()
      ? { location: args.offersJson.location.trim() }
      : {}),
    ...(args.locationId ? { locationId: args.locationId } : {}),
  });

  const refreshed = await patchCatalogListingRequestStatus(args.requestId, {
    status: 'live',
  });

  return {
    ecommerce: {
      productId: args.productId,
      productVariantId: args.variantId,
      offer: offerResult,
    },
    row: refreshed as Record<string, unknown>,
  };
}

/**
 * Approve flow: match or create product/variant, create offer, set request status live.
 * Skips offer create when seller SKU already exists (marks live only).
 */
export async function approveCatalogListingRequest(
  requestId: string,
): Promise<ApproveCatalogListingRequestResponse> {
  const row = (await getCatalogListingRequest(requestId)) as Record<
    string,
    unknown
  >;

  const tenantId = readString(row.tenantId);
  if (!tenantId) {
    throw new Error('Listing request is missing tenantId');
  }

  const productJson = recordFromUnknown(row.productJson);
  const offersJson = recordFromUnknown(row.offersJson) ?? {};
  const attributesJson = recordFromUnknown(row.attributesJson);

  const title = normalizeMatchText(productJson?.title);
  if (!title) {
    throw new Error('Listing request is missing product title');
  }

  const sellerSku = readString(offersJson.sku) ?? readString(productJson?.sku);
  if (!sellerSku) {
    throw new Error('Listing request is missing SKU');
  }

  const categoryId = listingRequestCategoryId(row);
  if (!categoryId) {
    throw new Error('Listing request is missing category id');
  }

  const variantOpts = normalizeVariantOptions(
    recordFromUnknown(offersJson.variantOptions) ?? undefined,
  );
  const categoryVariantLabels = await loadCategoryVariantLabels(categoryId);
  const catRemapped = remapOptionKeys(variantOpts, categoryVariantLabels);
  assertCategoryOptionKeys(categoryId, categoryVariantLabels, catRemapped);

  let optionsForVariant: Record<string, string> = { ...catRemapped.mapped };
  const variantImages = parseVariantImages(offersJson.variantImages);

  const runMatch = () =>
    matchCatalogProduct<MatchResult>({
      product: { title, variants: [{ options: optionsForVariant }] },
    });

  let matchResult = await runMatch();
  const productId = await ensureCatalogProductId({
    title,
    categoryId,
    productJson,
    attributesJson,
    optionsForVariant,
    variantImages,
    matchResult,
  });

  optionsForVariant = await alignOptionsToProductAxes(productId, variantOpts);
  matchResult = await runMatch();
  const variantId = await ensureCatalogVariantId({
    productId,
    optionsForVariant,
    variantImages,
    runMatch,
    matchResult,
  });

  const locationIdRaw = offersJson.locationId;
  const locationId =
    typeof locationIdRaw === 'string' && isUuid(locationIdRaw.trim())
      ? locationIdRaw.trim()
      : undefined;

  const existingSkuResponse = await markRequestLiveIfSkuExists({
    requestId,
    tenantId,
    sellerSku,
    locationId,
  });
  if (existingSkuResponse) {
    return existingSkuResponse;
  }

  return createOfferAndMarkLive({
    requestId,
    tenantId,
    sellerSku,
    productId,
    variantId,
    offersJson,
    locationId,
  });
}
