import type {
  EcommerceProductDto,
  ActiveListingRow,
  VariantAttribute,
} from '@/types/catalog';

import { collectProductImageUrls } from './catalogImageUrls';
import { CATALOG_PRODUCT_PLACEHOLDER_IMAGE } from './constants';
import { formatEcommerceDate, listingStatusFromPayload } from './displayFormat';

export {
  collectProductImageUrls,
  sanitizeCatalogImageUrl,
} from './catalogImageUrls';

/** Typed ecommerce product response or loosely indexed ES payloads. */
export type LooseProductLike = EcommerceProductDto | Record<string, unknown>;

export function readProductBrand(
  product: LooseProductLike | null | undefined,
): string {
  if (!product) {
    return '—';
  }
  const rawBrand = product.brand;
  if (typeof rawBrand === 'string' && rawBrand.trim()) {
    return rawBrand.trim();
  }
  const brandObj = rawBrand as { name?: string } | undefined;
  if (typeof brandObj?.name === 'string' && brandObj.name.trim()) {
    return brandObj.name.trim();
  }
  return '—';
}

/** Category path separators: `>`, `/`, or `›`. */
const CATEGORY_PATH_SEPARATOR = /[>/›]/;

export function readCategoryPair(product: LooseProductLike): {
  category: string;
  subCategory: string;
} {
  const path = product.categoryPath;
  if (typeof path === 'string' && path.trim()) {
    const parts = path
      .split(CATEGORY_PATH_SEPARATOR)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length >= 2) {
      return {
        category: parts[0],
        subCategory: parts.at(-1) ?? '—',
      };
    }
    if (parts.length === 1) {
      return { category: parts[0], subCategory: '—' };
    }
  }
  const cats = product.categories as
    | Array<{
        name?: string;
        parentCategory?: { name?: string };
      }>
    | undefined;
  const c = cats?.[0];
  if (!c) {
    return { category: '—', subCategory: '—' };
  }
  const parentName = c.parentCategory?.name;
  if (parentName) {
    return { category: parentName, subCategory: c.name ?? '—' };
  }
  return { category: c.name ?? '—', subCategory: '—' };
}

/** PIM category id on the product assignment (leaf row), not `parentCategory.id`. */
export function readProductCategoryId(
  product: LooseProductLike,
): string | null {
  const cats = product.categories as Array<{ id?: string }> | undefined;
  const id = cats?.[0]?.id?.trim();
  return id || null;
}

function readVariantCount(product: LooseProductLike): number {
  const fromApi = product.variantCount;
  if (typeof fromApi === 'number' && Number.isFinite(fromApi) && fromApi >= 0) {
    return fromApi;
  }
  const v = product.variants;
  return Array.isArray(v) ? v.length : 0;
}

export function productTagsAsLines(product: LooseProductLike): string[] {
  const tags = product.tags;
  if (Array.isArray(tags)) {
    const out: string[] = [];
    for (const t of tags) {
      if (t && typeof t === 'object' && 'value' in t) {
        const val = (t as { value?: unknown }).value;
        if (typeof val === 'string' && val.trim()) {
          out.push(val.trim());
        }
      }
    }
    if (out.length) {
      return out;
    }
  }
  const tv = product.tagValues;
  if (Array.isArray(tv)) {
    return tv.filter(
      (x): x is string => typeof x === 'string' && x.trim().length > 0,
    );
  }
  return [];
}

function findVariantRecord(
  variants: unknown[],
  variantIdFilter: string | null,
): Record<string, unknown> | null {
  if (variantIdFilter) {
    for (const cand of variants) {
      if (!cand || typeof cand !== 'object') {
        continue;
      }
      const id =
        typeof (cand as { id?: unknown }).id === 'string'
          ? (cand as { id: string }).id.trim()
          : '';
      if (id === variantIdFilter) {
        return cand as Record<string, unknown>;
      }
    }
    return null;
  }

  const first = variants[0];
  if (first && typeof first === 'object') {
    return first as Record<string, unknown>;
  }
  return null;
}

function readOptionDisplayValue(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }
  return '';
}

function variantTagsFromOptions(optsArr: unknown[]): VariantAttribute[] {
  const out: VariantAttribute[] = [];
  for (const o of optsArr) {
    if (!o || typeof o !== 'object') {
      continue;
    }
    const rec = o as Record<string, unknown>;
    const opt = rec.option as { title?: string } | undefined;
    const label =
      typeof opt?.title === 'string' && opt.title.trim()
        ? opt.title.trim()
        : 'Option';
    const value = readOptionDisplayValue(rec.value);
    if (value) {
      out.push({ label, value });
    }
  }
  return out;
}

export function variantOptionTagsFromProduct(
  product: LooseProductLike | null,
  opts?: { onlyVariantId?: string },
): VariantAttribute[] {
  if (!product) {
    return [];
  }
  const variants = product.variants;
  if (!Array.isArray(variants) || variants.length === 0) {
    return [];
  }
  const variantIdFilter =
    typeof opts?.onlyVariantId === 'string' && opts.onlyVariantId.trim()
      ? opts.onlyVariantId.trim()
      : null;

  const first = findVariantRecord(variants, variantIdFilter);
  if (!first) {
    return [];
  }

  const optsArr = first.options as unknown[];
  if (!Array.isArray(optsArr)) {
    return [];
  }
  return variantTagsFromOptions(optsArr);
}

/** Maps ecommerce list-products row → active listings table row (placeholder image when missing). */
export function activeListingRowFromApiResponse(
  raw: unknown,
): ActiveListingRow | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const p = raw as Record<string, unknown>;
  const id = p.id;
  if (typeof id !== 'string' || !id) {
    return null;
  }

  const brand = readProductBrand(p);

  const imageUrls = collectProductImageUrls(p);
  const thumb = imageUrls[0] ?? CATALOG_PRODUCT_PLACEHOLDER_IMAGE;

  const { category, subCategory } = readCategoryPair(p);

  const handle = typeof p.handle === 'string' ? p.handle : undefined;
  const subtitle = typeof p.subtitle === 'string' ? p.subtitle : undefined;

  return {
    id,
    productName: typeof p.title === 'string' ? p.title : '—',
    imageUrl: thumb,
    brand,
    category,
    subCategory,
    offerCount: readVariantCount(p),
    status: listingStatusFromPayload(p.status),
    createdOn: formatEcommerceDate(p.createdAt),
    ...(handle ? { handle } : {}),
    ...(subtitle ? { subtitle } : {}),
  };
}
