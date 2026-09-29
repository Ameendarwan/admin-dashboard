'use client';

import { toast } from '@merit-incentives/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { catalogQueryKeys } from '@/api-queries/catalog/catalogQueryKeys';
import { adminCatalogAxiosMessage } from '@/app/(protected)/catalog-management/utils/adminCatalogAxiosMessage';
import {
  buildCreateListingPayload,
  createEmptyProductVariantRow,
  getInitialNewListingValues,
  mergeKeyedValuesForNewSchema,
  revokeVariantImageSlots,
  subcategoriesForCategory,
  validateNewListingForm,
  validateNewListingStep,
} from '@/app/(protected)/catalog-management/utils/newListingFormHelpers';
import { useLocalization } from '@/hooks/useLocalization';
import {
  createCatalogProductFromForm,
  loadCategoryFieldsForListing,
  loadListingTaxonomyFromApi,
} from '@/app/(protected)/catalog-management/lib/newListingCatalogApi';
import type {
  AttributeFieldDefinition,
  NewListingFormValues,
  NewListingStepIndex,
} from '@/types/catalog';
import { TIME_30_MIN, TIME_5_MIN } from '@/utils/timeUtils';

import {
  clearErrorsForPatchedKeys,
  resetCategoryFieldState,
  resolveAttributesSectionTitle,
  resolveContinueDisabled,
  toastReviewValidationFailure,
} from '../utils/newListingPageHelpers';

export function useNewListingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  /** Scope to `catalog.newListing` so keys like `attributes.*` resolve (avoids broken `newListing.attributes.*` lookups under `catalog` alone). */
  const { translate: tList } = useLocalization('catalog.newListing');

  const taxonomyQuery = useQuery({
    queryKey: catalogQueryKeys.newListingTaxonomy,
    queryFn: loadListingTaxonomyFromApi,
    staleTime: TIME_30_MIN,
    gcTime: TIME_30_MIN,
  });

  const [values, setValues] = useState<NewListingFormValues>(
    getInitialNewListingValues,
  );

  useEffect(() => {
    if (taxonomyQuery.isError) {
      toast.error(tList('loadTaxonomyError'));
    }
  }, [taxonomyQuery.isError, tList]);

  const taxonomy = taxonomyQuery.data ?? null;

  const fieldsQuery = useQuery({
    queryKey: catalogQueryKeys.newListingCategoryFields(
      values.categoryId,
      values.subcategoryId,
    ),
    queryFn: () =>
      loadCategoryFieldsForListing(
        values.categoryId,
        values.subcategoryId,
        taxonomyQuery.data!.categoryRows,
      ),
    enabled: Boolean(taxonomyQuery.data) && Boolean(values.categoryId.trim()),
    gcTime: TIME_5_MIN,
    staleTime: TIME_5_MIN,
  });

  const [step, setStep] = useState<NewListingStepIndex>(0);
  const [productAttributeFields, setProductAttributeFields] = useState<
    AttributeFieldDefinition[]
  >([]);
  const [variantFields, setVariantFields] = useState<
    AttributeFieldDefinition[]
  >([]);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const categoryFieldsErrorToasted = useRef(false);

  const imageSlotsRef = useRef(values.imageSlots);
  imageSlotsRef.current = values.imageSlots;
  const variantRowsRef = useRef(values.productVariants);
  variantRowsRef.current = values.productVariants;

  useEffect(() => {
    return () => {
      for (const s of imageSlotsRef.current) {
        if (s.previewUrl) {
          URL.revokeObjectURL(s.previewUrl);
        }
      }
      revokeVariantImageSlots(variantRowsRef.current);
    };
  }, []);

  useEffect(() => {
    if (fieldsQuery.isError && !categoryFieldsErrorToasted.current) {
      toast.error(tList('loadCategoryFieldsError'));
      categoryFieldsErrorToasted.current = true;
    }
    if (!fieldsQuery.isError) {
      categoryFieldsErrorToasted.current = false;
    }
  }, [fieldsQuery.isError, tList]);

  useEffect(() => {
    if (!taxonomyQuery.data || !values.categoryId.trim()) {
      resetCategoryFieldState(
        setProductAttributeFields,
        setVariantFields,
        setValues,
      );
      return;
    }

    if (fieldsQuery.isError) {
      resetCategoryFieldState(
        setProductAttributeFields,
        setVariantFields,
        setValues,
      );
      return;
    }

    if (!fieldsQuery.isSuccess || !fieldsQuery.data) {
      return;
    }

    const { productFields, variantFields: vf } = fieldsQuery.data;
    setProductAttributeFields([...productFields]);
    setVariantFields([...vf]);
    setValues((v) => ({
      ...v,
      productAttributes: mergeKeyedValuesForNewSchema(
        v.productAttributes,
        productFields,
      ),
      productVariants: vf.length > 0 ? [createEmptyProductVariantRow(vf)] : [],
    }));
  }, [
    taxonomyQuery.data,
    values.categoryId,
    values.subcategoryId,
    fieldsQuery.data,
    fieldsQuery.isError,
    fieldsQuery.isSuccess,
  ]);

  const categoryOptions = useMemo(() => {
    if (!taxonomy) {
      return [];
    }
    return taxonomy.categories.map((c) => ({
      value: c.id,
      label: c.displayName ?? tList(c.labelKey),
    }));
  }, [taxonomy, tList]);

  const subcategoryOptions = useMemo(() => {
    if (!taxonomy || !values.categoryId) {
      return [];
    }
    return subcategoriesForCategory(
      values.categoryId,
      taxonomy.subcategories,
    ).map((s) => ({
      value: s.id,
      label: s.displayName ?? tList(s.labelKey),
    }));
  }, [taxonomy, tList, values.categoryId]);

  const stepLabels = useMemo(
    () => [
      tList('steps.details'),
      tList('steps.attributes'),
      tList('steps.images'),
      tList('steps.variants'),
      tList('steps.review'),
    ],
    [tList],
  );

  const reviewStepIndex: NewListingStepIndex = 4;

  const attributesSectionTitle = useMemo(
    () =>
      resolveAttributesSectionTitle({
        categoryId: values.categoryId,
        subcategoryId: values.subcategoryId,
        taxonomy,
        translate: tList,
      }),
    [taxonomy, tList, values.categoryId, values.subcategoryId],
  );

  const patchValues = useCallback((next: Partial<NewListingFormValues>) => {
    setValues((v) => ({ ...v, ...next }));
    setStepErrors((prev) => clearErrorsForPatchedKeys(prev, next));
  }, []);

  const goBack = useCallback(() => {
    setStepErrors({});
    setStep((s) => (s > 0 ? ((s - 1) as NewListingStepIndex) : s));
  }, []);

  const goNext = useCallback(async () => {
    let errs: Record<string, string>;
    if (step === reviewStepIndex) {
      errs = validateNewListingForm(
        values,
        productAttributeFields,
        variantFields,
      );
    } else {
      errs = validateNewListingStep(
        step,
        values,
        productAttributeFields,
        variantFields,
      );
    }
    if (Object.keys(errs).length > 0) {
      setStepErrors(errs);
      if (step === reviewStepIndex) {
        toastReviewValidationFailure(errs, tList, setStep);
      }
      return;
    }
    setStepErrors({});
    if (step < reviewStepIndex) {
      setStep((s) => (s + 1) as NewListingStepIndex);
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildCreateListingPayload(
        values,
        productAttributeFields,
        variantFields,
      );
      if (variantFields.length > 0 && payload.variants.length < 1) {
        setStep(3);
        setStepErrors({ variantsMinOne: 'variantsMinOne' });
        toast.error(tList('errors.variantsMinOne'));
        return;
      }
      await createCatalogProductFromForm(payload);
      await queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all });
      toast.success(tList('submitSuccess'));
      router.push('/catalog-management/listings');
    } catch (e) {
      toast.error(adminCatalogAxiosMessage(e) || tList('submitError'));
    } finally {
      setSubmitting(false);
    }
  }, [
    productAttributeFields,
    queryClient,
    router,
    step,
    tList,
    values,
    variantFields,
  ]);

  const categorySelected = Boolean(values.categoryId.trim());
  const categoryFieldsLoading =
    categorySelected && (fieldsQuery.isPending || fieldsQuery.isFetching);
  const categoryFieldsBlocking =
    categorySelected && (categoryFieldsLoading || fieldsQuery.isError);

  const continueDisabled = resolveContinueDisabled({
    submitting,
    step,
    reviewStepIndex,
    categoryFieldsBlocking,
    values,
    productAttributeFields,
    variantFields,
  });

  const attributesStepLoading = step === 1 && categoryFieldsLoading;
  const variantsStepLoading = step === 3 && categoryFieldsLoading;

  let primaryLabel = tList('actions.continue');
  if (step === reviewStepIndex) {
    primaryLabel = tList('actions.submit');
  }

  return {
    tList,
    step,
    values,
    patchValues,
    categoryOptions,
    subcategoryOptions,
    stepErrors,
    attributesStepLoading,
    variantsStepLoading,
    productAttributeFields,
    variantFields,
    attributesSectionTitle,
    stepLabels,
    submitting,
    continueDisabled,
    primaryLabel,
    goBack,
    goNext,
  };
}
