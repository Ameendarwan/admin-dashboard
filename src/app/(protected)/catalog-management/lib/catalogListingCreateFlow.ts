import {
  createCatalogProduct,
  createCatalogProductVariant,
  matchCatalogProduct,
} from '@/services/catalogAdminService';
import type { CreateCatalogProductBody } from '@/types/catalog';

type MatchProductResponse = {
  productExists?: boolean;
  productId?: string;
  variantExists?: boolean;
  variant?: { id?: string };
};

type VariantOptions = Record<string, string | boolean>;

function readFirstVariantOptions(
  body: CreateCatalogProductBody,
): VariantOptions {
  const variants = body.variants;
  if (!variants?.length) {
    throw new Error('variants is required and cannot be empty');
  }
  const firstOptions = variants[0]?.options;
  if (
    !firstOptions ||
    typeof firstOptions !== 'object' ||
    Array.isArray(firstOptions)
  ) {
    throw new Error('variants[0].options is required');
  }
  return firstOptions;
}

function readRequiredTitle(body: CreateCatalogProductBody): string {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title) {
    throw new Error('title is required');
  }
  return title;
}

async function resolveOrCreateProductId(
  body: CreateCatalogProductBody,
  title: string,
  firstOptions: VariantOptions,
): Promise<string> {
  const matchPayload = {
    product: { title, variants: [{ options: firstOptions }] },
  };
  const matchResult =
    await matchCatalogProduct<MatchProductResponse>(matchPayload);
  const matchedId =
    matchResult.productExists === true &&
    typeof matchResult.productId === 'string'
      ? matchResult.productId
      : '';

  if (matchResult.productExists && matchedId) {
    return matchedId;
  }

  const created = await createCatalogProduct(body);
  const newId = created?.data?.product?.id;
  if (!newId || typeof newId !== 'string') {
    throw new Error(
      'Catalog service did not return data.product.id after create',
    );
  }
  return newId;
}

function buildVariantBody(variant: {
  options?: unknown;
  title?: unknown;
  images?: unknown;
}): {
  options: VariantOptions;
  title?: string;
  images?: string[];
} | null {
  const options = variant.options;
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    return null;
  }

  const variantBody: {
    options: VariantOptions;
    title?: string;
    images?: string[];
  } = { options: options as VariantOptions };
  if (typeof variant.title === 'string' && variant.title.trim()) {
    variantBody.title = variant.title.trim();
  }
  if (Array.isArray(variant.images) && variant.images.length > 0) {
    variantBody.images = variant.images as string[];
  }
  return variantBody;
}

async function ensureVariantsExist(
  productId: string,
  title: string,
  variants: NonNullable<CreateCatalogProductBody['variants']>,
): Promise<void> {
  for (const variant of variants) {
    const variantBody = buildVariantBody(variant);
    if (!variantBody) {
      continue;
    }

    const variantMatch = await matchCatalogProduct<MatchProductResponse>({
      product: { title, variants: [{ options: variantBody.options }] },
    });

    const existingVariantId = variantMatch.variant?.id;
    if (
      variantMatch.variantExists === true &&
      typeof existingVariantId === 'string' &&
      existingVariantId.trim()
    ) {
      continue;
    }

    await createCatalogProductVariant(productId, variantBody);
  }
}

async function resolveVariantId(
  title: string,
  firstOptions: VariantOptions,
): Promise<string> {
  const finalMatch = await matchCatalogProduct<MatchProductResponse>({
    product: { title, variants: [{ options: firstOptions }] },
  });
  const variantId =
    finalMatch.variantExists === true && finalMatch.variant?.id
      ? asDisplayId(finalMatch.variant.id)
      : '';

  if (!variantId) {
    throw new Error('Could not resolve catalog variant id after create');
  }
  return variantId;
}

function asDisplayId(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return '';
}

/**
 * Admin manual listing: match → create product if missing → create variant if missing.
 * Mirrors seller POST /products without offers; orchestration lives in the portal, not admin-be.
 */
export async function createCatalogListingFromBody(
  body: CreateCatalogProductBody,
): Promise<{ productId: string }> {
  const firstOptions = readFirstVariantOptions(body);
  const title = readRequiredTitle(body);
  const variants = body.variants!;

  const productId = await resolveOrCreateProductId(body, title, firstOptions);
  await ensureVariantsExist(productId, title, variants);
  await resolveVariantId(title, firstOptions);

  return { productId };
}
