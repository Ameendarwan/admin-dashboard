'use client';

import { Button, cn, ContentCard, toast } from '@merit-incentives/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useCreateStorefront } from '@/api-queries/storefronts';
import { DetailsPageHeader } from '@/components/DetailsPageHeader';
import { Spinner } from '@/components/Spinner';
import useDebounce from '@/hooks/useDebounce';
import { useCreateStorefrontCatalogData } from '@/hooks/useCreateStorefrontCatalogData';
import { useCreateStorefrontSubscriptionGate } from '@/hooks/useCreateStorefrontSubscriptionGate';
import { useLocalization } from '@/hooks/useLocalization';
import { useRouteProtection } from '@/hooks/useRouteProtection';
import type {
  CreateStorefrontFormValues,
  CreateStorefrontStepIndex,
  StorefrontCategoryBundle,
  StorefrontSuccessSummary,
} from '@/types/createStorefrontForm';
import { mapCreateStorefrontFormToApiBody } from '@/utils/mapCreateStorefrontFormToApi';
import { mapStorefrontCreateApiError } from '@/utils/mapStorefrontCreateApiError';
import {
  getInitialCreateStorefrontValues,
  getSelectedStorefrontBundleTabs,
  INITIAL_PRODUCTS_CATEGORY_FILTER_BY_TAB,
  isCreateStorefrontStepValid,
  resolveActiveCategoryBundleId,
  resolveStorefrontBundleTab,
  validateCreateStorefrontStep,
} from '@/utils/createStorefrontFormHelpers';

import { CreateStorefrontCategoryBundlesStep } from '../CreateStorefrontCategoryBundlesStep';
import { CreateStorefrontDetailsStep } from '../CreateStorefrontDetailsStep';
import { CreateStorefrontSelectProductsStep } from '../CreateStorefrontSelectProductsStep';
import { CreateStorefrontStepper } from '../CreateStorefrontStepper';
import { CreateStorefrontSuccessDialog } from '../CreateStorefrontSuccessDialog';

const SEARCH_DEBOUNCE_MS = 350;

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function handleStorefrontCreateApiFailure(
  error: unknown,
  fallbackMessage: string,
  setStep: (step: CreateStorefrontStepIndex) => void,
  setStepErrors: (errors: Record<string, string>) => void,
): void {
  const mapped = mapStorefrontCreateApiError(error, fallbackMessage);

  if (mapped.field) {
    setStep(0);
    setStepErrors({ [mapped.field]: mapped.message });
    if (mapped.field === 'storefrontName' || mapped.field === 'urlSlug') {
      toast.error(mapped.message);
    }
    return;
  }

  toast.error(mapped.message);
}

function buildProductsStepValues(
  current: CreateStorefrontFormValues,
  catalogBundles: StorefrontCategoryBundle[],
): CreateStorefrontFormValues {
  const productsTab = resolveStorefrontBundleTab(
    current.bundleTab,
    getSelectedStorefrontBundleTabs(
      catalogBundles,
      current.selectedCategoryIds,
    ),
  );
  const activeCategoryFilterId = resolveActiveCategoryBundleId(
    catalogBundles,
    current.selectedCategoryIds,
    productsTab,
    null,
  );

  return {
    ...current,
    selectedProductIds: [],
    productBundleById: {},
    allProductsBundleIds: [],
    productsTab,
    activeCategoryFilterId,
    productsCategoryFilterByTab: {
      ...INITIAL_PRODUCTS_CATEGORY_FILTER_BY_TAB,
      [productsTab]: activeCategoryFilterId,
    },
  };
}

type AdvanceCreateStorefrontWizardParams = Readonly<{
  step: CreateStorefrontStepIndex;
  values: CreateStorefrontFormValues;
  validationOptions: Readonly<{ requireTenant?: boolean }>;
  resolvedTenantId: string;
  catalogBundles: StorefrontCategoryBundle[];
  verifyTenantHasStorefrontSubscription: (tenantId: string) => Promise<boolean>;
  createStorefront: (
    body: ReturnType<typeof mapCreateStorefrontFormToApiBody>,
  ) => Promise<{ productsAllowlisted: number }>;
  buildSuccessSummary: (
    formValues: CreateStorefrontFormValues,
    createdCategories: Array<{ name?: string; categoryId: string }>,
  ) => StorefrontSuccessSummary;
  submitErrorMessage: string;
  setStepErrors: (errors: Record<string, string>) => void;
  setStep: (step: CreateStorefrontStepIndex) => void;
  setProductsPage: (page: number) => void;
  setCommittedProductSearch: (search: string) => void;
  setProductSearchInput: (search: string) => void;
  setValues: (
    updater: (
      current: CreateStorefrontFormValues,
    ) => CreateStorefrontFormValues,
  ) => void;
  setSuccessSummary: (summary: StorefrontSuccessSummary) => void;
  setSuccessOpen: (open: boolean) => void;
}>;

async function advanceCreateStorefrontWizard({
  step,
  values,
  validationOptions,
  resolvedTenantId,
  catalogBundles,
  verifyTenantHasStorefrontSubscription,
  createStorefront,
  buildSuccessSummary,
  submitErrorMessage,
  setStepErrors,
  setStep,
  setProductsPage,
  setCommittedProductSearch,
  setProductSearchInput,
  setValues,
  setSuccessSummary,
  setSuccessOpen,
}: AdvanceCreateStorefrontWizardParams): Promise<void> {
  const errors = validateCreateStorefrontStep(step, values, validationOptions);
  if (Object.keys(errors).length > 0) {
    setStepErrors(errors);
    return;
  }

  setStepErrors({});
  if (step === 1) {
    setProductsPage(1);
    setCommittedProductSearch('');
    setProductSearchInput('');
    setValues((current) => buildProductsStepValues(current, catalogBundles));
    setStep(2);
    return;
  }

  if (step === 0) {
    if (!resolvedTenantId) {
      setStepErrors({ tenantId: 'requiredSelect' });
      return;
    }

    const hasSubscription =
      await verifyTenantHasStorefrontSubscription(resolvedTenantId);
    if (!hasSubscription) {
      return;
    }

    setStep(1);
    return;
  }

  if (step < 2) {
    setStep((step + 1) as CreateStorefrontStepIndex);
    return;
  }

  if (!resolvedTenantId) {
    setStepErrors({ tenantId: 'requiredSelect' });
    return;
  }

  try {
    const body = mapCreateStorefrontFormToApiBody(
      { ...values, tenantId: resolvedTenantId },
      catalogBundles,
    );
    const result = await createStorefront(body);
    const summary = buildSuccessSummary(values, body.categories);
    setSuccessSummary({
      ...summary,
      totalProducts: result.productsAllowlisted,
    });
    setSuccessOpen(true);
  } catch (error) {
    handleStorefrontCreateApiFailure(
      error,
      submitErrorMessage,
      setStep,
      setStepErrors,
    );
  }
}

export type CreateStorefrontVariant = 'global' | 'tenant';

type CreateStorefrontPageClientProps = Readonly<{
  variant: CreateStorefrontVariant;
  tenantProfileId?: string;
}>;

export function CreateStorefrontPageClient({
  variant,
  tenantProfileId = '',
}: CreateStorefrontPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { shouldShowLoading } = useRouteProtection();
  const { translate } = useLocalization('tenant-details.storefront');

  const isGlobalVariant = variant === 'global';
  const scopedTenantId = searchParams.get('tenantId')?.trim() || '';
  const scopedTenantName = safeDecodeURIComponent(
    searchParams.get('name') || '',
  );

  const [values, setValues] = useState<CreateStorefrontFormValues>(() => ({
    ...getInitialCreateStorefrontValues(),
    tenantId: isGlobalVariant ? '' : scopedTenantId,
  }));
  const [step, setStep] = useState<CreateStorefrontStepIndex>(0);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const createStorefrontMutation = useCreateStorefront();
  const [successOpen, setSuccessOpen] = useState(false);
  const [successSummary, setSuccessSummary] =
    useState<StorefrontSuccessSummary | null>(null);
  const [productsPage, setProductsPage] = useState(1);
  const [productSearchInput, setProductSearchInput] = useState('');
  const debouncedProductSearch = useDebounce(
    productSearchInput.trim(),
    SEARCH_DEBOUNCE_MS,
  );
  const [committedProductSearch, setCommittedProductSearch] = useState('');
  const effectiveProductsPage =
    debouncedProductSearch === committedProductSearch ? productsPage : 1;

  useEffect(() => {
    if (!isGlobalVariant && scopedTenantId) {
      setValues((current) => ({ ...current, tenantId: scopedTenantId }));
    }
  }, [isGlobalVariant, scopedTenantId]);

  useEffect(() => {
    if (debouncedProductSearch === committedProductSearch) {
      return;
    }

    setCommittedProductSearch(debouncedProductSearch);
    setProductsPage(1);
  }, [committedProductSearch, debouncedProductSearch]);

  useEffect(() => {
    setProductsPage(1);
  }, [values.activeCategoryFilterId, values.productsTab]);

  const validationOptions = useMemo(() => ({ requireTenant: true }), []);

  const resolvedTenantId = isGlobalVariant
    ? values.tenantId.trim()
    : scopedTenantId || values.tenantId.trim();

  const {
    selectedTenant,
    isVerifyingSubscription,
    verifyTenantHasStorefrontSubscription,
    handleTenantSelect,
  } = useCreateStorefrontSubscriptionGate({
    isGlobalVariant,
    resolvedTenantId,
    translate,
    setStepErrors,
  });

  const resolvedTenantName = useMemo(() => {
    if (!isGlobalVariant) {
      return scopedTenantName || scopedTenantId;
    }

    return selectedTenant?.name || values.tenantId;
  }, [
    isGlobalVariant,
    scopedTenantId,
    scopedTenantName,
    selectedTenant,
    values.tenantId,
  ]);

  const {
    catalogBundles,
    availableBundleTabs,
    selectedBundleTabs,
    bundlesQuery,
    productsQuery,
    productsPageSize,
  } = useCreateStorefrontCatalogData({
    step,
    values,
    setValues,
    debouncedProductSearch,
    effectiveProductsPage,
    translate,
    keepProductsQueryIdle: createStorefrontMutation.isPending || successOpen,
  });

  const stepLabels = useMemo(
    () => [
      translate('create.steps.details.label'),
      translate('create.steps.categoryBundles.label'),
      translate('create.steps.selectProducts.label'),
    ],
    [translate],
  );

  const patchValues = useCallback(
    (next: Partial<CreateStorefrontFormValues>) => {
      setValues((current) => ({ ...current, ...next }));
      setStepErrors((prev) => {
        if (Object.keys(prev).length === 0) {
          return prev;
        }

        const clearedKeys = new Set(Object.keys(next));
        return Object.fromEntries(
          Object.entries(prev).filter(([key]) => !clearedKeys.has(key)),
        );
      });
    },
    [],
  );

  const goBack = useCallback(() => {
    setStepErrors({});
    setStep((current) =>
      current > 0 ? ((current - 1) as CreateStorefrontStepIndex) : current,
    );
  }, []);

  const buildSuccessSummary = useCallback(
    (
      formValues: CreateStorefrontFormValues,
      createdCategories: Array<{ name?: string; categoryId: string }>,
    ): StorefrontSuccessSummary => {
      const categoryNames = createdCategories
        .map((category) => category.name?.trim() || category.categoryId)
        .filter((name): name is string => Boolean(name));

      return {
        storefrontName: formValues.storefrontName.trim(),
        urlSlug: formValues.urlSlug.trim(),
        tenantName: resolvedTenantName || resolvedTenantId,
        totalProducts: formValues.selectedProductIds.length,
        categoryNames,
      };
    },
    [resolvedTenantId, resolvedTenantName],
  );

  const goNext = useCallback(async () => {
    await advanceCreateStorefrontWizard({
      step,
      values,
      validationOptions,
      resolvedTenantId,
      catalogBundles,
      verifyTenantHasStorefrontSubscription,
      createStorefront: createStorefrontMutation.mutateAsync,
      buildSuccessSummary,
      submitErrorMessage: translate('create.submitError'),
      setStepErrors,
      setStep,
      setProductsPage,
      setCommittedProductSearch,
      setProductSearchInput,
      setValues,
      setSuccessSummary,
      setSuccessOpen,
    });
  }, [
    buildSuccessSummary,
    catalogBundles,
    createStorefrontMutation,
    resolvedTenantId,
    step,
    translate,
    validationOptions,
    values,
    verifyTenantHasStorefrontSubscription,
  ]);

  const isCreating = createStorefrontMutation.isPending;
  const isBusy = isCreating || isVerifyingSubscription;
  const stepIsValid = isCreateStorefrontStepValid(
    step,
    values,
    validationOptions,
  );
  const hasSubscriptionBlock =
    step === 0 && stepErrors.tenantId === 'noStorefrontSubscription';
  const primaryButtonDisabled =
    !isCreating &&
    !isVerifyingSubscription &&
    (!stepIsValid || hasSubscriptionBlock);

  const primaryLabel =
    step === 2
      ? translate('create.actions.createStorefront')
      : translate('create.actions.continue');

  const handleExitAfterSuccess = useCallback(() => {
    setSuccessOpen(false);
    if (isGlobalVariant) {
      router.push('/storefronts');
      return;
    }

    router.push(
      `/tenant-management/${tenantProfileId}?tenantId=${encodeURIComponent(resolvedTenantId)}&name=${encodeURIComponent(resolvedTenantName)}`,
    );
  }, [
    isGlobalVariant,
    resolvedTenantId,
    resolvedTenantName,
    router,
    tenantProfileId,
  ]);

  if (shouldShowLoading) {
    return null;
  }

  if (!isGlobalVariant && !resolvedTenantId) {
    return (
      <div className="min-h-0" id="create-storefront-page">
        <DetailsPageHeader title={translate('create.pageTitle')} />
        <ContentCard className="mt-4 rounded-xl border border-mds-black-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-mds-black-600">
            {translate('create.errors.requiredSelect')}
          </p>
        </ContentCard>
      </div>
    );
  }

  const totalProductPages = Math.max(
    1,
    Math.ceil((productsQuery.data?.total ?? 0) / productsPageSize),
  );

  return (
    <div className="min-h-0" id="create-storefront-page">
      <div className="space-y-4 sm:space-y-6">
        <DetailsPageHeader title={translate('create.pageTitle')} />

        <ContentCard
          className="overflow-hidden rounded-xl border border-mds-black-100 bg-white shadow-sm"
          size="md"
        >
          <ContentCard.Content className="w-full min-w-0 overflow-visible px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
            <CreateStorefrontStepper
              steps={stepLabels}
              currentIndex={step}
              stepNumberLabel={(number) =>
                translate('create.steps.stepNumber', {
                  number: String(number),
                })
              }
            />
          </ContentCard.Content>
        </ContentCard>

        <ContentCard
          className="overflow-hidden rounded-xl border border-mds-black-100 bg-white shadow-sm"
          size="md"
        >
          <ContentCard.Content className="relative w-full min-w-0 p-4 sm:p-6 sm:px-8 lg:p-10">
            {isCreating ? (
              <div
                className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-white/75"
                aria-busy="true"
                aria-live="polite"
              >
                <Spinner text={translate('create.actions.creating')} />
              </div>
            ) : null}
            <div className="relative z-10 w-full min-w-0">
              {step === 0 ? (
                <CreateStorefrontDetailsStep
                  values={values}
                  onChange={patchValues}
                  errors={stepErrors}
                  translate={translate}
                  showTenantField={isGlobalVariant}
                  selectedTenant={selectedTenant}
                  onTenantSelect={handleTenantSelect}
                />
              ) : null}
              {step === 1 ? (
                <CreateStorefrontCategoryBundlesStep
                  values={values}
                  bundles={catalogBundles}
                  availableTabs={availableBundleTabs}
                  loading={bundlesQuery.isPending || bundlesQuery.isFetching}
                  onChange={patchValues}
                  translate={translate}
                />
              ) : null}
              {step === 2 ? (
                <CreateStorefrontSelectProductsStep
                  values={values}
                  bundles={catalogBundles}
                  availableTabs={selectedBundleTabs}
                  products={productsQuery.data?.rows ?? []}
                  totalProducts={productsQuery.data?.total ?? 0}
                  page={effectiveProductsPage}
                  pageSize={productsPageSize}
                  totalPages={totalProductPages}
                  loading={
                    productsQuery.isFetching && !productsQuery.isPlaceholderData
                  }
                  isProductsFetching={productsQuery.isFetching}
                  search={productSearchInput}
                  onSearchChange={setProductSearchInput}
                  onPageChange={setProductsPage}
                  onChange={patchValues}
                  translate={translate}
                />
              ) : null}
            </div>
          </ContentCard.Content>
          <ContentCard.Footer className="border-t border-mds-black-100 bg-white px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
            <div
              className={cn(
                'flex w-full flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4',
                step > 0 ? 'sm:justify-between' : 'sm:justify-end',
              )}
            >
              {step > 0 ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={goBack}
                  disabled={isBusy}
                  className="w-full border-0 bg-mds-primary-100 font-semibold text-mds-primary-700 hover:bg-mds-primary-200 sm:w-auto"
                >
                  {translate('create.actions.back')}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="primary"
                onClick={goNext}
                disabled={primaryButtonDisabled}
                loading={isBusy}
                className={cn(
                  step > 0 ? 'w-full sm:w-auto' : 'ms-auto w-full sm:w-auto',
                )}
              >
                {primaryLabel}
              </Button>
            </div>
          </ContentCard.Footer>
        </ContentCard>
      </div>

      <CreateStorefrontSuccessDialog
        isOpen={successOpen}
        summary={successSummary}
        onClose={handleExitAfterSuccess}
        onGoToManagement={handleExitAfterSuccess}
        translate={translate}
      />
    </div>
  );
}
