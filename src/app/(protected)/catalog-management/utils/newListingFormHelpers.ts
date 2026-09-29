import {
  NEW_LISTING_IMAGE_SLOT_COUNT,
  NEW_LISTING_VARIANT_IMAGE_SLOT_COUNT,
  type AttributeFieldDefinition,
  type CreateListingPayload,
  type NewListingFormValues,
  type NewListingProductVariantRow,
  type NewListingStepIndex,
  type ProductImageSlot,
} from '@/types/catalog';

export const NEW_LISTING_MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const NEW_LISTING_MIN_DESCRIPTION_RECOMMENDED = 100;

export function createImageSlotId(index: number): string {
  return `img-slot-${index}`;
}

export function createInitialImageSlots(): ProductImageSlot[] {
  return Array.from({ length: NEW_LISTING_IMAGE_SLOT_COUNT }, (_, i) => ({
    id: createImageSlotId(i),
    file: null,
    previewUrl: null,
  }));
}

export function createVariantImageSlotId(
  variantRowId: string,
  index: number,
): string {
  return `vimg-${variantRowId}-${index}`;
}

export function createInitialVariantImageSlots(
  variantRowId: string,
): ProductImageSlot[] {
  return Array.from(
    { length: NEW_LISTING_VARIANT_IMAGE_SLOT_COUNT },
    (_, i) => ({
      id: createVariantImageSlotId(variantRowId, i),
      file: null,
      previewUrl: null,
    }),
  );
}

export function revokeVariantImageSlots(
  rows: readonly NewListingProductVariantRow[],
): void {
  for (const row of rows) {
    for (const slot of row.imageSlots) {
      if (slot.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(slot.previewUrl);
      }
    }
  }
}

export function createProductVariantRowId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `pv-${globalThis.crypto.randomUUID()}`;
  }
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    const bytes = new Uint8Array(8);
    globalThis.crypto.getRandomValues(bytes);
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(
      '',
    );
    return `pv-${Date.now()}-${hex}`;
  }
  return `pv-${Date.now()}`;
}

export function createEmptyProductVariantRow(
  fields: readonly AttributeFieldDefinition[],
): NewListingProductVariantRow {
  const id = createProductVariantRowId();
  return {
    id,
    optionsByFieldId: buildKeyedDefaults(fields),
    imageSlots: createInitialVariantImageSlots(id),
  };
}

export function getInitialNewListingValues(): NewListingFormValues {
  return {
    categoryId: '',
    subcategoryId: '',
    title: '',
    brand: '',
    description: '',
    features: [''],
    productAttributes: {},
    productVariants: [],
    imageSlots: createInitialImageSlots(),
  };
}

export function subcategoriesForCategory<T extends { categoryId: string }>(
  categoryId: string,
  all: readonly T[],
): T[] {
  if (!categoryId) {
    return [];
  }
  return all.filter((s) => s.categoryId === categoryId);
}

export function buildKeyedDefaults(
  fields: readonly AttributeFieldDefinition[],
): Record<string, string> {
  const next: Record<string, string> = {};
  for (const f of fields) {
    next[f.id] = '';
  }
  return next;
}

export function mergeKeyedValuesForNewSchema(
  previous: Record<string, string>,
  fields: readonly AttributeFieldDefinition[],
): Record<string, string> {
  const next = buildKeyedDefaults(fields);
  for (const f of fields) {
    if (previous[f.id] !== undefined) {
      next[f.id] = previous[f.id];
    }
  }
  return next;
}

export function nonEmptyKeyedValues(
  fields: readonly AttributeFieldDefinition[],
  values: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) {
    const v = values[f.id];
    const t = v !== undefined ? String(v).trim() : '';
    if (t) {
      out[f.apiKey] = t;
    }
  }
  return out;
}

/** Rows with at least one option value set (for validation / payload). */
export function activeProductVariantRows(
  variantFields: readonly AttributeFieldDefinition[],
  rows: readonly NewListingProductVariantRow[],
): NewListingProductVariantRow[] {
  return rows.filter((r) => !isVariantRowEmpty(variantFields, r));
}

export function isVariantRowEmpty(
  variantFields: readonly AttributeFieldDefinition[],
  row: NewListingProductVariantRow,
): boolean {
  return (
    Object.keys(nonEmptyKeyedValues(variantFields, row.optionsByFieldId))
      .length === 0
  );
}

export function isVariantRowComplete(
  variantFields: readonly AttributeFieldDefinition[],
  row: NewListingProductVariantRow,
): boolean {
  for (const field of variantFields) {
    const v = row.optionsByFieldId[field.id];
    if (v === undefined || String(v).trim() === '') {
      return false;
    }
  }
  return variantFields.length > 0;
}

/** Variant rules aligned with admin-be (min 1 variant, non-empty options per row). */
function collectIncompleteVariantFieldErrors(
  variantFields: readonly AttributeFieldDefinition[],
  row: NewListingProductVariantRow,
  errors: Record<string, string>,
): void {
  for (const field of variantFields) {
    const v = row.optionsByFieldId[field.id];
    if (v === undefined || String(v).trim() === '') {
      errors[`variantRow:${row.id}:${field.id}`] = 'required';
    }
  }
}

function collectDuplicateVariantErrors(
  variantFields: readonly AttributeFieldDefinition[],
  completeRows: readonly NewListingProductVariantRow[],
  errors: Record<string, string>,
): void {
  const seen = new Map<string, string>();
  for (const row of completeRows) {
    const sig = variantRowDuplicateSignature(variantFields, row);
    if (seen.has(sig)) {
      errors[`variantRow:${row.id}:duplicate`] = 'duplicateVariantRow';
    } else {
      seen.set(sig, row.id);
    }
  }
}

export function validateProductVariants(
  variantFields: readonly AttributeFieldDefinition[],
  productVariants: readonly NewListingProductVariantRow[],
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (variantFields.length === 0) {
    return errors;
  }

  if (productVariants.length === 0) {
    errors.variantsMinOne = 'variantsMinOne';
    return errors;
  }

  const completeRows: NewListingProductVariantRow[] = [];

  for (const row of productVariants) {
    if (isVariantRowEmpty(variantFields, row)) {
      errors[`variantRow:${row.id}:empty`] = 'variantRowEmpty';
      continue;
    }
    if (!isVariantRowComplete(variantFields, row)) {
      collectIncompleteVariantFieldErrors(variantFields, row, errors);
      continue;
    }
    completeRows.push(row);
  }

  if (completeRows.length === 0) {
    if (!errors.variantsMinOne) {
      errors.variantsMinOne = 'variantsMinOne';
    }
    return errors;
  }

  collectDuplicateVariantErrors(variantFields, completeRows, errors);
  return errors;
}

function variantRowDuplicateSignature(
  variantFields: readonly AttributeFieldDefinition[],
  row: NewListingProductVariantRow,
): string {
  const o = nonEmptyKeyedValues(variantFields, row.optionsByFieldId);
  const entries = Object.entries(o).map(
    ([k, v]) => [k, v.trim().toLowerCase()] as const,
  );
  entries.sort((a, b) => a[0].localeCompare(b[0]));
  return JSON.stringify(entries);
}

export function buildCreateListingVariantsPayload(
  variantFields: readonly AttributeFieldDefinition[],
  rows: readonly NewListingProductVariantRow[],
): CreateListingPayload['variants'] {
  const out: CreateListingPayload['variants'] = [];
  for (const row of rows) {
    if (!isVariantRowComplete(variantFields, row)) {
      continue;
    }
    const options = nonEmptyKeyedValues(variantFields, row.optionsByFieldId);
    if (Object.keys(options).length === 0) {
      continue;
    }
    const optionValues = Object.values(options);
    const title =
      optionValues.length > 0 ? optionValues.join(' / ') : undefined;
    const imageFiles = row.imageSlots
      .map((slot) => slot.file)
      .filter((file): file is File => file !== null);
    out.push({
      options,
      ...(title ? { title } : {}),
      imageFiles,
    });
  }
  return out;
}

export function normalizedFeatures(features: string[]): string[] {
  return features.map((f) => f.trim()).filter(Boolean);
}

export function isStepValid(
  step: NewListingStepIndex,
  values: NewListingFormValues,
  productAttributeFields: readonly AttributeFieldDefinition[],
  variantFields: readonly AttributeFieldDefinition[],
): boolean {
  const errors = validateNewListingStep(
    step,
    values,
    productAttributeFields,
    variantFields,
  );
  return Object.keys(errors).length === 0;
}

function validateDetailsStep(
  values: NewListingFormValues,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.categoryId) {
    errors.categoryId = 'required';
  }
  if (!values.title.trim()) {
    errors.title = 'required';
  }
  if (!values.brand.trim()) {
    errors.brand = 'required';
  }
  if (!values.description.trim()) {
    errors.description = 'required';
  }
  if (normalizedFeatures(values.features).length === 0) {
    errors.features = 'required';
  }
  return errors;
}

function validateAttributesStep(
  values: NewListingFormValues,
  productAttributeFields: readonly AttributeFieldDefinition[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of productAttributeFields) {
    if (!field.required) {
      continue;
    }
    const v = values.productAttributes[field.id];
    if (v === undefined || String(v).trim() === '') {
      errors[field.id] = 'required';
    }
  }
  return errors;
}

function validateImagesStep(
  values: NewListingFormValues,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const filled = values.imageSlots.filter((s) => s.file !== null).length;
  if (filled < 1) {
    errors.images = 'minOne';
  }
  return errors;
}

export function validateNewListingStep(
  step: NewListingStepIndex,
  values: NewListingFormValues,
  productAttributeFields: readonly AttributeFieldDefinition[],
  variantFields: readonly AttributeFieldDefinition[],
): Record<string, string> {
  if (step === 0) {
    return validateDetailsStep(values);
  }
  if (step === 1) {
    return validateAttributesStep(values, productAttributeFields);
  }
  if (step === 2) {
    return validateImagesStep(values);
  }
  if (step === 3) {
    return validateProductVariants(variantFields, values.productVariants);
  }
  return {};
}

/** Full-form validation before submit (details, attributes, images, variants). */
export function validateNewListingForm(
  values: NewListingFormValues,
  productAttributeFields: readonly AttributeFieldDefinition[],
  variantFields: readonly AttributeFieldDefinition[],
): Record<string, string> {
  return {
    ...validateNewListingStep(0, values, productAttributeFields, variantFields),
    ...validateNewListingStep(1, values, productAttributeFields, variantFields),
    ...validateNewListingStep(2, values, productAttributeFields, variantFields),
    ...validateNewListingStep(3, values, productAttributeFields, variantFields),
  };
}

const NEW_LISTING_IMAGE_TYPE_RE = /^image\/(svg\+xml|png|jpeg|jpg)$/i;

export function validateImageFile(file: File, maxBytes: number): string | null {
  if (NEW_LISTING_IMAGE_TYPE_RE.exec(file.type) === null) {
    return 'type';
  }
  if (file.size > maxBytes) {
    return 'size';
  }
  return null;
}

export function buildCreateListingPayload(
  values: NewListingFormValues,
  productAttributeFields: readonly AttributeFieldDefinition[],
  variantFields: readonly AttributeFieldDefinition[],
): CreateListingPayload {
  return {
    categoryId: values.categoryId,
    subcategoryId: values.subcategoryId,
    title: values.title.trim(),
    brand: values.brand.trim(),
    description: values.description.trim(),
    features: normalizedFeatures(values.features),
    productAttributes: nonEmptyKeyedValues(
      productAttributeFields,
      values.productAttributes,
    ),
    variants: buildCreateListingVariantsPayload(
      variantFields,
      values.productVariants,
    ),
    imageFiles: values.imageSlots
      .map((s) => s.file)
      .filter((f): f is File => f !== null),
  };
}

export function orderedAttributeEntries(
  fields: readonly AttributeFieldDefinition[],
  values: Record<string, string>,
  translate: (key: string) => string,
): { id: string; labelForUi: string; displayValue: string }[] {
  return fields.map((f) => ({
    id: f.id,
    labelForUi: f.displayName ?? translate(f.labelKey),
    displayValue: formatAttributeValueForReview(
      f,
      values[f.id] ?? '',
      translate,
    ),
  }));
}

export function formatAttributeValueForReview(
  field: AttributeFieldDefinition,
  raw: string,
  translate: (key: string) => string,
): string {
  const base =
    field.type === 'select' && field.options?.length
      ? (field.options.find((o) => o.value === raw)?.label ?? raw)
      : raw;
  if (!field.suffixKey || !base) {
    return base;
  }
  return `${base} ${translate(field.suffixKey)}`;
}
