import type {
  ListingRequestDetail,
  ListingRequestRow,
  RequestVariantOffer,
  VariantAttribute,
} from '@/types/catalog';

import {
  LISTING_REQUEST_MATCH_FILTERS,
  type ListingRequestMatchFilter,
} from '../constants/catalogListFilterKeys';
import { CATALOG_PRODUCT_PLACEHOLDER_IMAGE } from './constants';
import {
  attributesToDisplayStrings,
  formatEcommerceDate,
} from './displayFormat';
import {
  extractImageUrlsFromProductJson,
  listingRequestWorkflowStatusToUiStatus,
  readCategoryName,
  readString,
  readWorkflowStatus,
  recordFromUnknown,
} from './listingRequestRowFieldReaders';
import {
  normalizeVariantImageUrls,
  parseVariantImages,
} from './variantImageUtils';

function variantTagsFromOffersJson(
  offers: Record<string, unknown>,
): readonly VariantAttribute[] {
  const variantOptions = offers.variantOptions as
    | Record<string, unknown>
    | undefined;
  if (!variantOptions || typeof variantOptions !== 'object') {
    return [];
  }
  return Object.entries(variantOptions).map(([label, value]) => {
    let display = '';
    if (typeof value === 'string') {
      display = value;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      display = String(value);
    }
    return { label, value: display };
  });
}

function readMatchResult(value: unknown): ListingRequestMatchFilter | null {
  return typeof value === 'string' &&
    (LISTING_REQUEST_MATCH_FILTERS as readonly string[]).includes(value)
    ? (value as ListingRequestMatchFilter)
    : null;
}

function readRejectionReason(raw: Record<string, unknown>): string | null {
  const fromObject = (value: unknown): string | null => {
    const rec = recordFromUnknown(value);
    if (!rec) {
      return null;
    }
    const reason = rec.reason;
    return typeof reason === 'string' && reason.trim() ? reason.trim() : null;
  };
  return (
    fromObject(raw.rejection) ??
    fromObject(recordFromUnknown(raw.metadata)?.rejection)
  );
}

function formatOfferPrice(offers: Record<string, unknown>): string {
  const price = offers.price;
  const currency = offers.currency;
  if (price === undefined || price === null) {
    return '—';
  }
  const cur =
    typeof currency === 'string' && currency.trim() ? currency.trim() : '';
  let priceText = '';
  if (typeof price === 'string' || typeof price === 'number') {
    priceText = String(price);
  } else {
    return '—';
  }
  if (cur) {
    return `${cur} ${priceText}`.trim();
  }
  return priceText;
}

/** Seller-portal bulk row → listing requests table (status, product name, thumbnails). */
export function listingRequestRowFromListItem(
  raw: Record<string, unknown>,
): ListingRequestRow | null {
  const id = readString(raw.id);
  if (!id) {
    return null;
  }
  const productName = readString(raw.product) ?? '—';
  const brand = readString(raw.brand) ?? '—';
  const mainImage = readString(raw.mainImage);
  const seller = readString(raw.businessName) ?? '—';
  const cat = readCategoryName(raw.category);
  const sub = readCategoryName(raw.subCategory);
  const created =
    raw.created_at ?? raw.createdAt ?? raw.updated_at ?? raw.updatedAt;
  return {
    id,
    productName,
    imageUrl: mainImage ?? CATALOG_PRODUCT_PLACEHOLDER_IMAGE,
    brand,
    seller,
    category: cat?.name ?? '—',
    subCategory: sub?.name ?? '—',
    matchResult: readMatchResult(raw.matchResult ?? raw.match_result),
    status: listingRequestWorkflowStatusToUiStatus(raw.status),
    submittedOn: formatEcommerceDate(created),
  };
}

/** Full request payload for approve/reject UI (productJson, offersJson, attributesJson). */
export function listingRequestDetailFromApi(
  raw: Record<string, unknown> | null | undefined,
): ListingRequestDetail | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const id = readString(raw.id);
  if (!id) {
    return null;
  }
  const productJson = recordFromUnknown(raw.productJson);
  const offersJson = recordFromUnknown(raw.offersJson) ?? {};
  const productName =
    readString(productJson?.title) ?? readString(raw.product) ?? '—';
  const brand = readString(productJson?.brand) ?? '—';
  const cat = readCategoryName(raw.category);
  const sub = readCategoryName(raw.subCategory);
  const catSeg = cat?.name && cat.name !== '—' ? cat.name : '';
  const subSeg = sub?.name && sub.name !== '—' ? sub.name : '';
  const categoryPath = [catSeg, subSeg].filter(Boolean).join(' / ') || '—';
  const imageUrls = extractImageUrlsFromProductJson(productJson);
  const description =
    readString(productJson?.description) ??
    readString(productJson?.desc) ??
    '—';
  const keyFeaturesRaw = productJson?.keyFeatures;
  const keyFeatures = Array.isArray(keyFeaturesRaw)
    ? keyFeaturesRaw.flatMap((f) => {
        if (f == null) {
          return [];
        }
        const s = String(f).trim();
        return s ? [s] : [];
      })
    : [];
  const attributesJson = recordFromUnknown(raw.attributesJson);
  const attributes = attributesToDisplayStrings(attributesJson ?? {});
  const sellerName = readString(raw.businessName) ?? '—';
  const sellerEmail = readString(raw.sellerEmail) ?? '—';
  const created =
    raw.createdAt ?? raw.created_at ?? raw.updatedAt ?? raw.updated_at;

  const quantityRaw = offersJson.quantity;
  const quantityNum =
    typeof quantityRaw === 'number' ? quantityRaw : Number(quantityRaw);
  const stock = Number.isFinite(quantityNum) ? quantityNum : 0;

  const variant: RequestVariantOffer = {
    id: `${id}-offer`,
    tags: variantTagsFromOffersJson(offersJson),
    imageUrls: normalizeVariantImageUrls(
      parseVariantImages(offersJson.variantImages),
    ),
    sku: readString(offersJson.sku) ?? '—',
    condition: readString(offersJson.condition) ?? '—',
    location: readString(offersJson.location) ?? '—',
    stock,
    price: formatOfferPrice(offersJson),
  };

  return {
    id,
    productName,
    brand,
    categoryPath,
    imageUrls: imageUrls.length
      ? imageUrls
      : [CATALOG_PRODUCT_PLACEHOLDER_IMAGE],
    status: listingRequestWorkflowStatusToUiStatus(raw.status),
    workflowStatus: readWorkflowStatus(raw.status),
    description,
    keyFeatures,
    attributes,
    sellerName,
    sellerEmail,
    submittedOn: formatEcommerceDate(created),
    matchResult: readMatchResult(raw.matchResult ?? raw.match_result),
    rejectionReason: readRejectionReason(raw),
    variants: [variant],
  };
}
