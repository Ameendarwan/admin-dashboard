import { CATALOG_PRODUCT_PLACEHOLDER_IMAGE } from '@/app/(protected)/catalog-management/lib/constants';
import { collectProductImageUrls } from '@/app/(protected)/catalog-management/lib/catalogImageUrls';
import {
  listAllCatalogCategories,
  listCatalogProducts,
} from '@/services/catalogAdminService';
import type {
  EcommerceCategoryDto,
  EcommerceProductDto,
} from '@/types/catalog';
import { readCategoryPair } from '@/app/(protected)/catalog-management/lib/productCatalogPayload';
import type {
  StorefrontCategoryBundle,
  StorefrontProductRow,
} from '@/types/createStorefrontForm';

const DEFAULT_PRODUCT_CURRENCY = 'SAR';

function readMinOfferPrice(product: EcommerceProductDto): number | null {
  const raw = product as EcommerceProductDto & { minOfferPrice?: unknown };
  if (
    typeof raw.minOfferPrice === 'number' &&
    Number.isFinite(raw.minOfferPrice)
  ) {
    return raw.minOfferPrice;
  }
  return null;
}

function isActiveCategory(category: EcommerceCategoryDto): boolean {
  return category.isActive !== false;
}

function hasProducts(category: EcommerceCategoryDto): boolean {
  return (category.productCount ?? 0) > 0;
}

/** Same signal ecommerce-core uses when validating sales-channel category type. */
export function isPimGiftcardCategory(category: EcommerceCategoryDto): boolean {
  const meta = category.metadata;
  if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
    if (
      (meta as { isGiftcardCategory?: unknown }).isGiftcardCategory === true
    ) {
      return true;
    }
  }

  const parent = (
    category as EcommerceCategoryDto & {
      parentCategory?: EcommerceCategoryDto | null;
    }
  ).parentCategory;

  if (parent) {
    return isPimGiftcardCategory(parent);
  }

  return false;
}

export async function loadStorefrontCategoryBundles(): Promise<
  StorefrontCategoryBundle[]
> {
  const [merchandiseCategoryRows, giftcardCategoryRows] = await Promise.all([
    listAllCatalogCategories({
      isGiftcardCategory: false,
      includeProductCount: true,
    }),
    listAllCatalogCategories({
      isGiftcardCategory: true,
      includeProductCount: true,
    }),
  ]);

  const merchandiseBundles = merchandiseCategoryRows
    .filter((category) => isActiveCategory(category) && hasProducts(category))
    .map((category) => ({
      id: `${category.id}:merchandise`,
      name: category.name,
      isGiftcard: false as const,
      productCount: category.productCount ?? 0,
    }));

  const giftcardBundles = giftcardCategoryRows
    .filter(
      (category) =>
        isActiveCategory(category) &&
        isPimGiftcardCategory(category) &&
        hasProducts(category),
    )
    .map((category) => ({
      id: `${category.id}:giftCards`,
      name: category.name,
      isGiftcard: true as const,
      productCount: category.productCount ?? 0,
    }));

  return [...merchandiseBundles, ...giftcardBundles];
}

export type LoadStorefrontProductsParams = {
  categoryIds: string[];
  isGiftcard: boolean;
  search: string;
  page: number;
  pageSize: number;
};

export type LoadStorefrontProductsResult = {
  rows: StorefrontProductRow[];
  total: number;
};

function readProductListImageUrl(product: EcommerceProductDto): string {
  const imageUrls = collectProductImageUrls(product);
  return imageUrls[0] ?? CATALOG_PRODUCT_PLACEHOLDER_IMAGE;
}

function bundleIdForProduct(
  product: EcommerceProductDto,
  categoryIds: string[],
  isGiftcard: boolean,
): string {
  const productCatIds = (product.categories ?? [])
    .map((category) => category.id)
    .filter(Boolean);
  const match = categoryIds.find((id) => productCatIds.includes(id));
  return `${match ?? categoryIds[0]}:${isGiftcard ? 'giftCards' : 'merchandise'}`;
}

function mapProductRow(
  product: EcommerceProductDto,
  currency: string,
  bundleId: string,
): StorefrontProductRow | null {
  if (!product.id) {
    return null;
  }
  const { category } = readCategoryPair(product);
  return {
    id: product.id,
    name: product.title,
    category,
    bundleId,
    imageUrl: readProductListImageUrl(product),
    lowestPrice: readMinOfferPrice(product),
    currency,
  };
}

export async function loadStorefrontProducts(
  params: LoadStorefrontProductsParams,
): Promise<LoadStorefrontProductsResult> {
  const { categoryIds, isGiftcard, search, page, pageSize } = params;

  if (categoryIds.length === 0) {
    return { rows: [], total: 0 };
  }

  const res = await listCatalogProducts({
    categoryIds,
    isGiftcard,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    ...(search.trim() ? { search: search.trim() } : {}),
  });

  const rows = res.rows
    .map((product) =>
      mapProductRow(
        product,
        DEFAULT_PRODUCT_CURRENCY,
        bundleIdForProduct(product, categoryIds, isGiftcard),
      ),
    )
    .filter((row): row is StorefrontProductRow => row !== null);

  return {
    rows,
    total: typeof res.count === 'number' ? res.count : rows.length,
  };
}
