'use client';

import { InputField, RadioGroup } from '@merit-incentives/ui';

import {
  isFreeTrialSubscriptionValues,
  resolveLiveFieldFeedback,
  SUBSCRIPTION_CURRENCY,
  type AddPaidSubscriptionFormValues,
  type BillingFrequency,
  type SubscriptionFieldFeedback,
} from './addPaidSubscriptionForm';
import { FieldFeedback } from './FieldFeedback';

type AddPaidSubscriptionBillingStepProps = {
  values: AddPaidSubscriptionFormValues;
  errors: Partial<Record<keyof AddPaidSubscriptionFormValues, string>>;
  warnings: Partial<Record<keyof AddPaidSubscriptionFormValues, string>>;
  showErrors: boolean;
  showWarnings: boolean;
  onChange: (patch: Partial<AddPaidSubscriptionFormValues>) => void;
  translate: (key: string, values?: Record<string, string | number>) => string;
};

function feedback(
  field: keyof AddPaidSubscriptionFormValues,
  errors: AddPaidSubscriptionBillingStepProps['errors'],
  warnings: AddPaidSubscriptionBillingStepProps['warnings'],
  showErrors: boolean,
  showWarnings: boolean,
): SubscriptionFieldFeedback {
  return resolveLiveFieldFeedback(field, errors, warnings, {
    showErrors,
    showWarnings,
  });
}

export function AddPaidSubscriptionBillingStep({
  values,
  errors,
  warnings,
  showErrors,
  showWarnings,
  onChange,
  translate,
}: Readonly<AddPaidSubscriptionBillingStepProps>) {
  const isFreeTrial = isFreeTrialSubscriptionValues(values);

  const frequencyOptions = [
    { value: 'yearly', label: translate('fields.billingYearly') },
    { value: 'months', label: translate('fields.billingMonths') },
  ];

  const priceFb = feedback(
    'agreedPrice',
    errors,
    warnings,
    showErrors,
    showWarnings,
  );
  const billingFb = feedback(
    'billingFrequency',
    errors,
    warnings,
    showErrors,
    showWarnings,
  );
  const billingMonthsFb = feedback(
    'billingMonths',
    errors,
    warnings,
    showErrors,
    showWarnings,
  );

  return (
    <div className="flex min-w-0 flex-col gap-mds-lg">
      <div className="space-y-1">
        {isFreeTrial ? (
          <p className="rounded-xl border border-mds-primary-100 bg-mds-primary-50 px-4 py-3 text-sm text-mds-black-700">
            {translate('fields.billingTrialNote')}
          </p>
        ) : null}
        <InputField
          label={translate('fields.agreedPrice')}
          placeholder={translate('fields.agreedPricePlaceholder')}
          type="number"
          min={0}
          step="0.01"
          value={values.agreedPrice}
          onChange={(e) => {
            onChange({
              agreedPrice: e.target.value,
              currency: SUBSCRIPTION_CURRENCY,
            });
          }}
          error={priceFb.error}
          hint={
            isFreeTrial
              ? translate('fields.agreedPriceTrialOptionalHint')
              : undefined
          }
          required={!isFreeTrial}
          leftIcon={
            <span
              className="text-xs font-semibold tracking-wide text-mds-black-500"
              aria-hidden
            >
              {translate('fields.priceCurrencyPrefix')}
            </span>
          }
        />
        <FieldFeedback warning={priceFb.warning} />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-mds-black-900">
          {translate('fields.billingFrequency')}
          <span className="text-mds-error-500"> *</span>
        </p>
        <RadioGroup
          options={frequencyOptions}
          value={values.billingFrequency}
          onValueChange={(value) => {
            onChange({ billingFrequency: value as BillingFrequency });
          }}
          orientation="horizontal"
          className="flex flex-wrap gap-4 sm:gap-6"
        />
        <FieldFeedback error={billingFb.error} warning={billingFb.warning} />
      </div>

      {values.billingFrequency === 'months' ? (
        <div className="space-y-1">
          <InputField
            label={translate('fields.billingMonthsCount')}
            type="number"
            min={1}
            value={String(values.billingMonths)}
            onChange={(e) => {
              onChange({
                billingMonths: Number(e.target.value) || 0,
              });
            }}
            error={billingMonthsFb.error}
            required
          />
          <FieldFeedback warning={billingMonthsFb.warning} />
        </div>
      ) : null}
    </div>
  );
}
