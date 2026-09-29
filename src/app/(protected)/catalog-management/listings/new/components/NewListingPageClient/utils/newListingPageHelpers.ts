import { toast } from '@merit-incentives/ui';
import type { Dispatch, SetStateAction } from 'react';

import {
  isStepValid,
  mergeKeyedValuesForNewSchema,
  validateNewListingForm,
} from '@/app/(protected)/catalog-management/utils/newListingFormHelpers';
import { loadListingTaxonomyFromApi } from '@/app/(protected)/catalog-management/lib/newListingCatalogApi';
import type {
  AttributeFieldDefinition,
  NewListingFormValues,
  NewListingStepIndex,
} from '@/types/catalog';

export type TranslateFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export function taxonomyDisplayName(
  item: { displayName?: string; labelKey: string } | undefined,
  translate: TranslateFn,
  fallback: string,
): string {
  if (!item) {
    return fallback;
  }
  return item.displayName ?? translate(item.labelKey);
}

export function resolveAttributesSectionTitle(args: {
  categoryId: string;
  subcategoryId: string;
  taxonomy: Awaited<ReturnType<typeof loadListingTaxonomyFromApi>> | null;
  translate: TranslateFn;
}): string {
  const effectiveId = args.subcategoryId || args.categoryId;
  const sub = args.taxonomy?.subcategories.find((s) => s.id === effectiveId);
  const cat = args.taxonomy?.categories.find((c) => c.id === effectiveId);
  const named = sub ?? cat;
  const name = taxonomyDisplayName(
    named,
    args.translate,
    args.translate('attributes.fallbackName'),
  );
  return args.translate('attributes.dynamicTitle', { name });
}

export function resetCategoryFieldState(
  setProductAttributeFields: (fields: AttributeFieldDefinition[]) => void,
  setVariantFields: (fields: AttributeFieldDefinition[]) => void,
  setValues: Dispatch<SetStateAction<NewListingFormValues>>,
): void {
  setProductAttributeFields([]);
  setVariantFields([]);
  setValues((v) => ({
    ...v,
    productAttributes: mergeKeyedValuesForNewSchema(v.productAttributes, []),
    productVariants: [],
  }));
}

export function clearErrorsForPatchedKeys(
  prev: Record<string, string>,
  next: Partial<NewListingFormValues>,
): Record<string, string> {
  if (Object.keys(prev).length === 0) {
    return prev;
  }
  const cleared = { ...prev };
  for (const key of Object.keys(next)) {
    if (key === 'features') {
      delete cleared.features;
      continue;
    }
    if (key === 'productVariants') {
      for (const k of Object.keys(cleared)) {
        if (k.startsWith('variantRow:') || k === 'variantsMinOne') {
          delete cleared[k];
        }
      }
      continue;
    }
    if (key in cleared) {
      delete cleared[key];
    }
  }
  return cleared;
}

export function resolveContinueDisabled(args: {
  submitting: boolean;
  step: NewListingStepIndex;
  reviewStepIndex: NewListingStepIndex;
  categoryFieldsBlocking: boolean;
  values: NewListingFormValues;
  productAttributeFields: AttributeFieldDefinition[];
  variantFields: AttributeFieldDefinition[];
}): boolean {
  if (args.submitting) {
    return true;
  }
  if ((args.step === 0 || args.step === 1) && args.categoryFieldsBlocking) {
    return true;
  }
  if (args.step === args.reviewStepIndex) {
    return (
      Object.keys(
        validateNewListingForm(
          args.values,
          args.productAttributeFields,
          args.variantFields,
        ),
      ).length > 0
    );
  }
  return !isStepValid(
    args.step,
    args.values,
    args.productAttributeFields,
    args.variantFields,
  );
}

export function toastReviewValidationFailure(
  errs: Record<string, string>,
  translate: TranslateFn,
  setStep: Dispatch<SetStateAction<NewListingStepIndex>>,
): void {
  const hasVariantError = Object.keys(errs).some(
    (k) => k.startsWith('variantRow:') || k === 'variantsMinOne',
  );
  if (hasVariantError) {
    setStep(3);
    toast.error(translate('errors.submitVariantsInvalid'));
    return;
  }
  toast.error(translate('submitError'));
}
