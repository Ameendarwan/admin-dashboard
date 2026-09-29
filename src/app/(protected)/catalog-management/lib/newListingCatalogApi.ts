import { createCatalogListingFromBody } from '@/app/(protected)/catalog-management/lib/catalogListingCreateFlow';
import {
  getCatalogCategoryAttributes,
  getCatalogCategoryVariantFields,
  listAllCatalogCategories,
  requestCatalogProductImageUploadUrl,
  uploadCatalogProductImageToSignedUrl,
} from '@/services/catalogAdminService';
import type {
  AttributeFieldDefinition,
  CatalogCategoryRow,
  CatalogCategoryVariantFieldMeta,
  CatalogProductVariantInput,
  CatalogTaxonomySubcategory,
  CreateCatalogProductBody,
  CreateListingPayload,
  CreateListingResult,
  EcommerceCategoryAttributeItemDto,
  EcommerceCategoryDto,
  ListingTaxonomyDTO,
} from '@/types/catalog';

/** PIM category id: subcategory wins when selected, otherwise parent category. */
export function effectiveListingCategoryId(
  categoryId: string,
  subcategoryId: string,
): string {
  return subcategoryId.trim() || categoryId.trim();
}

/** Builds category/subcategory pickers from flat ecommerce rows (parent → children). */
export async function loadListingTaxonomyFromApi(): Promise<ListingTaxonomyDTO> {
  const rows = await listAllCatalogCategories();
  const active = rows.filter((r) => r.isActive !== false);
  const categoryRows: CatalogCategoryRow[] = active.map((r) => ({
    id: r.id,
    name: r.name,
    parentCategoryId: r.parentCategoryId,
    metadata: readCategoryMetadata(r as EcommerceCategoryDto),
  }));
  const roots = categoryRows.filter((r) => !r.parentCategoryId);
  const categories = roots.map((r) => ({
    id: r.id,
    labelKey: r.name,
    displayName: r.name,
  }));
  const subcategories: CatalogTaxonomySubcategory[] = [];
  for (const root of roots) {
    const children = categoryRows.filter((c) => c.parentCategoryId === root.id);
    for (const ch of children) {
      subcategories.push({
        id: ch.id,
        categoryId: root.id,
        labelKey: ch.name,
        displayName: ch.name,
      });
    }
  }
  return { categories, subcategories, categoryRows };
}

function readCategoryMetadata(
  row: EcommerceCategoryDto | Record<string, unknown>,
): CatalogCategoryRow['metadata'] {
  const meta = (row as EcommerceCategoryDto).metadata;
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) {
    return undefined;
  }
  const variantFields = (meta as { variantFields?: unknown }).variantFields;
  if (!Array.isArray(variantFields)) {
    return undefined;
  }
  const parsed: CatalogCategoryVariantFieldMeta[] = [];
  for (const item of variantFields) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      continue;
    }
    const label = (item as { label?: unknown }).label;
    const type = (item as { type?: unknown }).type;
    if (typeof label === 'string' && label.trim()) {
      parsed.push({
        label: label.trim(),
        type: typeof type === 'string' ? type : 'string',
      });
    }
  }
  return parsed.length ? { variantFields: parsed } : undefined;
}

function isAttributeDropdown(
  field: EcommerceCategoryAttributeItemDto,
): boolean {
  const type = String(field.type ?? '').toLowerCase();
  return (
    type === 'dropdown' ||
    type === 'select' ||
    type === 'multiselect' ||
    type === 'enum' ||
    (field.values?.length ?? 0) > 0
  );
}

function mapProductAttributeField(
  categoryId: string,
  raw: EcommerceCategoryAttributeItemDto,
  index: number,
): AttributeFieldDefinition {
  const isDropdown = isAttributeDropdown(raw);
  return {
    id: `pa-${categoryId}-${index}`,
    apiKey: raw.label,
    labelKey: raw.label,
    displayName: raw.label,
    type: isDropdown ? 'select' : 'text',
    required: raw.isRequired === true,
    ...(isDropdown && raw.values?.length
      ? {
          options: raw.values.map((v) => ({
            value: v,
            label: v,
          })),
        }
      : {}),
  };
}

function mapMetadataVariantField(
  categoryId: string,
  raw: CatalogCategoryVariantFieldMeta,
  index: number,
): AttributeFieldDefinition {
  return {
    id: `vf-meta-${categoryId}-${index}`,
    apiKey: raw.label,
    labelKey: raw.label,
    displayName: raw.label,
    type: 'text',
    required: true,
  };
}

function mapApiVariantField(
  categoryId: string,
  raw: { label: string; type: string; values?: string[] },
  index: number,
): AttributeFieldDefinition {
  const isEnum = raw.type === 'enum' || (raw.values?.length ?? 0) > 0;
  const isBool = raw.type === 'boolean';
  let options: AttributeFieldDefinition['options'];
  if (isBool) {
    options = [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' },
    ];
  } else if (isEnum && raw.values?.length) {
    options = raw.values.map((v) => ({ value: v, label: v }));
  }
  return {
    id: `vf-api-${categoryId}-${index}`,
    apiKey: raw.label,
    labelKey: raw.label,
    displayName: raw.label,
    type: isBool || isEnum ? 'select' : 'text',
    required: true,
    ...(options?.length ? { options } : {}),
  };
}

function variantFieldsFromCategoryMetadata(
  categoryRows: readonly CatalogCategoryRow[],
  categoryId: string,
  subcategoryId: string,
): AttributeFieldDefinition[] {
  const selectedId = subcategoryId.trim() || categoryId.trim();
  if (!selectedId) {
    return [];
  }
  const row = categoryRows.find((c) => c.id === selectedId);
  const meta = row?.metadata?.variantFields ?? [];
  return meta.map((f, i) => mapMetadataVariantField(selectedId, f, i));
}

export type CategoryFieldsForListing = {
  readonly productFields: readonly AttributeFieldDefinition[];
  readonly variantFields: readonly AttributeFieldDefinition[];
};

/**
 * Seller FE: attributes from GET /categories/:id/attributes;
 * variant axes from selected category row metadata.variantFields,
 * with GET /categories/:id/variant-fields as fallback when metadata is empty.
 */
export async function loadCategoryFieldsForListing(
  categoryId: string,
  subcategoryId: string,
  categoryRows: readonly CatalogCategoryRow[],
): Promise<CategoryFieldsForListing> {
  const effectiveId = effectiveListingCategoryId(categoryId, subcategoryId);
  if (!effectiveId) {
    return { productFields: [], variantFields: [] };
  }

  const attrRes = await getCatalogCategoryAttributes(effectiveId);
  const productFields = attrRes.attributes.map((a, i) =>
    mapProductAttributeField(effectiveId, a, i),
  );

  let variantFields = variantFieldsFromCategoryMetadata(
    categoryRows,
    categoryId,
    subcategoryId,
  );
  if (variantFields.length === 0) {
    try {
      const vfRes = await getCatalogCategoryVariantFields(effectiveId);
      variantFields = vfRes.variantFields.map((f, i) =>
        mapApiVariantField(effectiveId, f, i),
      );
    } catch {
      variantFields = [];
    }
  }

  return { productFields, variantFields };
}

function buildCatalogProductBodyFromPayload(
  payload: CreateListingPayload,
  imageRefs: string[],
  variants: CatalogProductVariantInput[],
): CreateCatalogProductBody {
  const listingCategoryId = effectiveListingCategoryId(
    payload.categoryId,
    payload.subcategoryId,
  );

  if (payload.variants.length < 1) {
    throw new Error(
      'At least one product variant with option values is required.',
    );
  }

  return {
    title: payload.title,
    description: payload.description,
    brand: payload.brand,
    categories: [{ id: listingCategoryId }],
    tags: payload.features,
    ...(Object.keys(payload.productAttributes).length > 0
      ? { attributes: payload.productAttributes }
      : {}),
    images: imageRefs,
    variants,
  };
}

function mapPayloadVariantToInput(
  variant: CreateListingPayload['variants'][number],
  imageRefs: string[],
): CatalogProductVariantInput {
  const options = variant.options as Record<string, string | boolean>;
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('Each variant must include option values.');
  }
  if (Object.keys(options).length === 0) {
    throw new Error('Each variant must include at least one option value.');
  }
  return {
    options,
    ...(variant.title ? { title: variant.title } : {}),
    ...(imageRefs.length > 0 ? { images: imageRefs } : {}),
  };
}

async function uploadListingImages(imageFiles: File[]): Promise<string[]> {
  const storagePaths: string[] = [];
  for (const file of imageFiles) {
    const contentType = file.type?.trim() || 'application/octet-stream';
    const { uploadUrl, storagePath } =
      await requestCatalogProductImageUploadUrl({
        fileName: file.name,
        contentType,
      });
    await uploadCatalogProductImageToSignedUrl(uploadUrl, file, contentType);
    storagePaths.push(storagePath);
  }
  return storagePaths;
}

/** Upload images to GCS, then match/create product + variant via catalogListingCreateFlow. */
export async function createCatalogProductFromForm(
  payload: CreateListingPayload,
): Promise<CreateListingResult> {
  const storagePaths = await uploadListingImages(payload.imageFiles);
  const variants: CatalogProductVariantInput[] = [];
  for (const variant of payload.variants) {
    const variantImagePaths =
      variant.imageFiles.length > 0
        ? await uploadListingImages(variant.imageFiles)
        : [];
    variants.push(mapPayloadVariantToInput(variant, variantImagePaths));
  }
  const body = buildCatalogProductBodyFromPayload(
    payload,
    storagePaths,
    variants,
  );
  const { productId } = await createCatalogListingFromBody(body);
  return { id: productId };
}
