'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Popup, toast } from '@merit-incentives/ui';

import { useLocalization } from '@/hooks';
import type {
  SubscribableProduct,
  TenantSubscription,
} from '@/types/subscriptionsAdminApi';

import { mapPaidSubscriptionFormToCreateBody } from '../../utils/mapPaidSubscriptionFormToApi';
import {
  buildSubscribableProductDropdownOptions,
  filterSubscribableProductsForAdmin,
  findSubscribableProductById,
  formatSubscriptionProductDropdownLabel,
  getExcludedSubscribableProductIds,
  isSelectedSubscribableProductAllowed,
} from '../../utils/subscriptionProductResolver';
import { subscriptionsAdminAxiosMessage } from '../../utils/subscriptionsAdminAxiosMessage';
import { AddPaidSubscriptionBillingStep } from './AddPaidSubscriptionBillingStep';
import { AddPaidSubscriptionDetailsStep } from './AddPaidSubscriptionDetailsStep';
import { AddPaidSubscriptionReviewStep } from './AddPaidSubscriptionReviewStep';
import {
  addCalendarDays,
  BILLING_STEP_FIELDS,
  calendarDaysBetweenStartAndEnd,
  DEFAULT_ADD_PAID_SUBSCRIPTION_VALUES,
  DETAILS_STEP_FIELDS,
  getBillingStepFieldErrors,
  getDetailsStepFieldErrors,
  getDetailsStepWarnings,
  isFreeTrialSubscriptionValues,
  type AddPaidSubscriptionFormValues,
} from './addPaidSubscriptionForm';

type AddPaidSubscriptionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  tenantEmailFromUrl?: string;
  tenantProfileEmail?: string;
  tenantProfileUserId?: string;
  subscriptions: TenantSubscription[];
  subscribableProducts: SubscribableProduct[];
  isSubscribableProductsLoading?: boolean;
  isSubscribableProductsError?: boolean;
  isSubmitting?: boolean;
  onSubmit: (values: AddPaidSubscriptionFormValues) => Promise<void>;
};

type WizardStep = 0 | 1 | 2;

function mapSubmitErrorMessage(
  error: unknown,
  translate: (key: string, values?: Record<string, string | number>) => string,
  formValues?: AddPaidSubscriptionFormValues,
): string {
  if (error instanceof Error) {
    if (error.message === 'PAYMENT_PRODUCT_NOT_CONFIGURED') {
      return translate('errors.productNotConfigured');
    }
    if (error.message === 'MISSING_TENANT_EMAIL') {
      return translate('errors.missingTenantEmail');
    }
    if (error.message === 'MISSING_TENANT_USER_ID') {
      return translate('errors.missingTenantUserId');
    }
    if (error.message === 'INVALID_AGREED_PRICE') {
      return translate('validation.agreedPricePositive');
    }
    if (error.message === 'INVALID_TRIAL_DAYS') {
      return translate('validation.trialDaysInvalid', { maxDays: 90 });
    }
    if (error.message === 'TRIAL_EXCEEDS_SUBSCRIPTION_PERIOD' && formValues) {
      return translate('validation.trialExceedsPeriod', {
        trialDays: formValues.trialDays,
        periodDays:
          calendarDaysBetweenStartAndEnd(
            formValues.startDate,
            formValues.endDate,
          ) ?? 0,
      });
    }
  }
  return subscriptionsAdminAxiosMessage(error);
}

function scrollToFirstFieldFeedback(container: HTMLElement | null) {
  if (!container) {
    return;
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const target =
        container.querySelector('[data-field-feedback="error"]') ??
        container.querySelector('[role="alert"]');
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
}

export function AddPaidSubscriptionDialog({
  isOpen,
  onClose,
  tenantId,
  tenantEmailFromUrl,
  tenantProfileEmail,
  tenantProfileUserId,
  subscriptions,
  subscribableProducts,
  isSubscribableProductsLoading = false,
  isSubscribableProductsError = false,
  isSubmitting = false,
  onSubmit,
}: Readonly<AddPaidSubscriptionDialogProps>) {
  const { translate: translateTenant } = useLocalization('tenant-details');
  const translate = useCallback(
    (key: string, values?: Record<string, string | number>) =>
      translateTenant(`subscriptions.addPaidSubscription.${key}`, values),
    [translateTenant],
  );

  const contentRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<WizardStep>(0);
  const [values, setValues] = useState<AddPaidSubscriptionFormValues>(
    DEFAULT_ADD_PAID_SUBSCRIPTION_VALUES,
  );
  const [submitAttempted, setSubmitAttempted] = useState<
    Partial<Record<WizardStep, boolean>>
  >({});

  const isFreeTrial = isFreeTrialSubscriptionValues(values);

  const detailsErrors = useMemo(
    () => getDetailsStepFieldErrors(values, translate),
    [translate, values],
  );
  const detailsWarnings = useMemo(
    () => getDetailsStepWarnings(values, translate),
    [translate, values],
  );
  const billingErrors = useMemo(
    () => getBillingStepFieldErrors(values, translate, isFreeTrial),
    [isFreeTrial, translate, values],
  );

  const showDetailsErrors = Boolean(submitAttempted[0]);
  const showDetailsWarnings = true;
  const showBillingErrors = Boolean(submitAttempted[1]);

  const productCatalogFeedback = useMemo(() => {
    if (!values.productId || isSubscribableProductsLoading) {
      return undefined;
    }
    if (isSubscribableProductsError) {
      return translate('errors.subscribableProductsUnavailable');
    }
    const allowedProducts =
      filterSubscribableProductsForAdmin(subscribableProducts);
    if (allowedProducts.length === 0) {
      return translate('errors.subscribableProductsUnavailable');
    }
    if (
      isSelectedSubscribableProductAllowed(
        values.productId,
        subscribableProducts,
      )
    ) {
      return undefined;
    }
    return translate('errors.productNotConfigured');
  }, [
    isSubscribableProductsError,
    isSubscribableProductsLoading,
    subscribableProducts,
    translate,
    values.productId,
  ]);

  const detailsFieldErrors = useMemo(
    () => ({
      ...detailsErrors,
      ...(productCatalogFeedback && showDetailsErrors
        ? { productId: productCatalogFeedback }
        : {}),
    }),
    [detailsErrors, productCatalogFeedback, showDetailsErrors],
  );

  const detailsFieldWarnings = useMemo(
    () => ({
      ...detailsWarnings,
      ...(productCatalogFeedback && values.productId
        ? { productId: productCatalogFeedback }
        : {}),
    }),
    [detailsWarnings, productCatalogFeedback, values.productId],
  );

  const productOptions = useMemo(() => {
    const excludedIds = getExcludedSubscribableProductIds(subscriptions);
    return buildSubscribableProductDropdownOptions(subscribableProducts).filter(
      (option) => !excludedIds.has(option.value),
    );
  }, [subscribableProducts, subscriptions]);

  const productLabel = useMemo(() => {
    const match = productOptions.find(
      (option) => option.value === values.productId,
    );
    if (match) {
      return match.label;
    }
    const product = findSubscribableProductById(
      subscribableProducts,
      values.productId,
    );
    if (product?.name) {
      return formatSubscriptionProductDropdownLabel(product.name);
    }
    return values.productId;
  }, [productOptions, subscribableProducts, values.productId]);

  const resetDialog = useCallback(() => {
    setStep(0);
    setValues(DEFAULT_ADD_PAID_SUBSCRIPTION_VALUES);
    setSubmitAttempted({});
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    resetDialog();
  }, [isOpen, resetDialog]);

  const patchValues = useCallback(
    (patch: Partial<AddPaidSubscriptionFormValues>) => {
      setValues((current) => {
        const next = { ...current, ...patch };
        if (isFreeTrialSubscriptionValues(next) && next.startDate) {
          return {
            ...next,
            endDate: addCalendarDays(next.startDate, next.trialDays),
          };
        }
        return next;
      });
    },
    [],
  );

  const validateStep = useCallback(
    (currentStep: WizardStep): boolean => {
      if (currentStep === 0) {
        setSubmitAttempted((current) => ({ ...current, 0: true }));
        const hasError =
          Boolean(productCatalogFeedback) ||
          DETAILS_STEP_FIELDS.some((field) => detailsErrors[field]);
        if (hasError) {
          scrollToFirstFieldFeedback(contentRef.current);
        }
        return !hasError;
      }
      if (currentStep === 1) {
        setSubmitAttempted((current) => ({ ...current, 1: true }));
        const hasError = BILLING_STEP_FIELDS.some(
          (field) => billingErrors[field],
        );
        if (hasError) {
          scrollToFirstFieldFeedback(contentRef.current);
        }
        return !hasError;
      }
      return true;
    },
    [billingErrors, detailsErrors, productCatalogFeedback],
  );

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  const handleContinue = async () => {
    if (!validateStep(step)) {
      return;
    }

    if (step < 2) {
      setStep((current) => (current + 1) as WizardStep);
      return;
    }

    if (!tenantId) {
      toast.error(translate('errors.missingTenant'));
      return;
    }

    try {
      mapPaidSubscriptionFormToCreateBody(values, {
        subscriptions,
        subscribableProducts,
        tenantEmailFromUrl,
        tenantProfileEmail,
        tenantProfileUserId,
      });
    } catch (error) {
      toast.error(mapSubmitErrorMessage(error, translate, values));
      return;
    }

    try {
      await onSubmit(values);
      toast.success(translate('success'));
      handleClose();
    } catch (error) {
      toast.error(mapSubmitErrorMessage(error, translate, values));
    }
  };

  const primaryLabel =
    step === 2 ? translate('actions.save') : translate('actions.continue');

  return (
    <Popup
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      className="w-[min(100%,44rem)] max-w-[calc(100vw-2rem)] overflow-hidden"
    >
      <Popup.Header
        onClose={handleClose}
        showDivider
        className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8"
      >
        <h2 className="min-w-0 text-xl font-bold text-mds-black-900 sm:text-2xl">
          {translate('title')}
        </h2>
      </Popup.Header>

      <Popup.Content
        showDivider
        className="max-h-[min(720px,calc(100dvh-12rem))] min-w-0 overflow-x-hidden overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8"
      >
        <div ref={contentRef} className="min-w-0">
          {step === 0 ? (
            <AddPaidSubscriptionDetailsStep
              values={values}
              errors={showDetailsErrors ? detailsFieldErrors : {}}
              warnings={detailsFieldWarnings}
              showErrors={showDetailsErrors}
              showWarnings={showDetailsWarnings}
              productOptions={productOptions}
              onChange={patchValues}
              translate={translate}
            />
          ) : null}
          {step === 1 ? (
            <AddPaidSubscriptionBillingStep
              values={values}
              errors={showBillingErrors ? billingErrors : {}}
              warnings={{}}
              showErrors={showBillingErrors}
              showWarnings={false}
              onChange={patchValues}
              translate={translate}
            />
          ) : null}
          {step === 2 ? (
            <AddPaidSubscriptionReviewStep
              values={values}
              productLabel={productLabel}
              onEditDetails={() => {
                setStep(0);
                setSubmitAttempted((current) => ({ ...current, 0: true }));
              }}
              onEditBilling={() => {
                setStep(1);
                setSubmitAttempted((current) => ({ ...current, 1: true }));
              }}
              translate={translate}
            />
          ) : null}
        </div>
      </Popup.Content>

      <Popup.Footer className="border-t border-mds-black-100 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <div className="flex w-full min-w-0 flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full border-0 bg-mds-primary-100 font-medium text-mds-primary-700 hover:bg-mds-primary-200 sm:w-auto sm:min-w-28"
          >
            {translate('actions.cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => void handleContinue()}
            disabled={isSubmitting}
            loading={isSubmitting}
            className="w-full sm:w-auto sm:min-w-28"
          >
            {primaryLabel}
          </Button>
        </div>
      </Popup.Footer>
    </Popup>
  );
}
