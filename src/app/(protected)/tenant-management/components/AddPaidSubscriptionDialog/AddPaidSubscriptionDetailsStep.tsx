'use client';

import { Checkbox, InputDropdown, InputField } from '@merit-incentives/ui';
import { Calendar } from 'lucide-react';

import { DaysStepperField } from '@/components';

import {
  DEFAULT_TRIAL_DAYS,
  getTodayUtcIsoDate,
  MAX_ENTERPRISE_TRIAL_DAYS,
  resolveLiveFieldFeedback,
  type AddPaidSubscriptionFormValues,
  type SubscriptionFieldFeedback,
} from './addPaidSubscriptionForm';
import { FieldFeedback } from './FieldFeedback';

type AddPaidSubscriptionDetailsStepProps = {
  values: AddPaidSubscriptionFormValues;
  errors: Partial<Record<keyof AddPaidSubscriptionFormValues, string>>;
  warnings: Partial<Record<keyof AddPaidSubscriptionFormValues, string>>;
  showErrors: boolean;
  showWarnings: boolean;
  productOptions: { value: string; label: string }[];
  onChange: (patch: Partial<AddPaidSubscriptionFormValues>) => void;
  translate: (key: string, values?: Record<string, string | number>) => string;
};

function feedback(
  field: keyof AddPaidSubscriptionFormValues,
  errors: AddPaidSubscriptionDetailsStepProps['errors'],
  warnings: AddPaidSubscriptionDetailsStepProps['warnings'],
  showErrors: boolean,
  showWarnings: boolean,
): SubscriptionFieldFeedback {
  return resolveLiveFieldFeedback(field, errors, warnings, {
    showErrors,
    showWarnings,
  });
}

export function AddPaidSubscriptionDetailsStep({
  values,
  errors,
  warnings,
  showErrors,
  showWarnings,
  productOptions,
  onChange,
  translate,
}: Readonly<AddPaidSubscriptionDetailsStepProps>) {
  const handleStartDateChange = (nextStart: string) => {
    onChange({
      startDate: nextStart,
      ...(values.endDate && nextStart && values.endDate < nextStart
        ? { endDate: '' }
        : {}),
    });
  };

  const productFb = feedback(
    'productId',
    errors,
    warnings,
    showErrors,
    showWarnings,
  );
  const trialDaysFb = feedback(
    'trialDays',
    errors,
    warnings,
    showErrors,
    showWarnings,
  );
  const startFb = feedback(
    'startDate',
    errors,
    warnings,
    showErrors,
    showWarnings,
  );
  const endFb = feedback('endDate', errors, warnings, showErrors, showWarnings);
  const showEndDateField = !values.enableFreeTrial;
  const graceFb = feedback(
    'gracePeriodDays',
    errors,
    warnings,
    showErrors,
    showWarnings,
  );

  const todayUtc = getTodayUtcIsoDate();

  const trialBoxHighlight = trialDaysFb.error
    ? 'border-mds-error-300 bg-red-50/50'
    : trialDaysFb.warning || graceFb.warning
      ? 'border-amber-300 bg-amber-50/60'
      : 'border-mds-black-100 bg-mds-black-50';

  return (
    <div className="flex min-w-0 flex-col gap-mds-lg">
      <div className="space-y-1">
        <InputDropdown
          label={translate('fields.product')}
          placeholder={translate('fields.productPlaceholder')}
          options={productOptions}
          value={values.productId}
          onChange={(value) => onChange({ productId: value })}
          error={productFb.error}
          required
        />
        <FieldFeedback warning={productFb.warning} />
      </div>

      <div
        className={`space-y-3 rounded-xl border px-4 py-4 ${trialBoxHighlight}`}
      >
        <Checkbox
          checked={values.enableFreeTrial}
          onCheckedChange={(checked) => {
            onChange({
              enableFreeTrial: checked === true,
              ...(checked === true && values.trialDays < 1
                ? { trialDays: DEFAULT_TRIAL_DAYS }
                : {}),
              ...(checked === false ? { endDate: '' } : {}),
            });
          }}
          label={translate('fields.enableFreeTrial')}
        />
        <p className="text-sm text-mds-black-600">
          {translate('fields.enableFreeTrialHint')}
        </p>
        {values.enableFreeTrial ? (
          <div className="space-y-1">
            <DaysStepperField
              label={translate('fields.trialDays')}
              value={values.trialDays}
              min={1}
              max={MAX_ENTERPRISE_TRIAL_DAYS}
              daysLabel={translate('fields.daysSuffix')}
              onChange={(trialDays) => onChange({ trialDays })}
              error={trialDaysFb.error}
              hint={translate('fields.trialDaysHint', {
                maxDays: MAX_ENTERPRISE_TRIAL_DAYS,
              })}
              required
            />
            <FieldFeedback warning={trialDaysFb.warning} />
          </div>
        ) : null}
      </div>

      <div
        className={
          showEndDateField
            ? 'grid grid-cols-1 gap-mds-lg sm:grid-cols-2'
            : 'grid grid-cols-1 gap-mds-lg'
        }
      >
        <div className="space-y-1">
          <InputField
            label={translate('fields.startDate')}
            placeholder={translate('fields.startDatePlaceholder')}
            type="date"
            value={values.startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            error={startFb.error}
            required
            leftIcon={<Calendar className="h-4 w-4" aria-hidden />}
            min={todayUtc}
            max={showEndDateField ? values.endDate || undefined : undefined}
          />
          <FieldFeedback warning={startFb.warning} />
        </div>
        {showEndDateField ? (
          <div className="space-y-1">
            <InputField
              label={translate('fields.endDate')}
              placeholder={translate('fields.endDatePlaceholder')}
              type="date"
              value={values.endDate}
              onChange={(e) => onChange({ endDate: e.target.value })}
              error={endFb.error}
              required
              leftIcon={<Calendar className="h-4 w-4" aria-hidden />}
              min={values.startDate || undefined}
            />
            <FieldFeedback warning={endFb.warning} />
          </div>
        ) : null}
      </div>

      <div className="space-y-1">
        <DaysStepperField
          label={translate('fields.gracePeriod')}
          value={values.gracePeriodDays}
          min={1}
          max={365}
          daysLabel={translate('fields.daysSuffix')}
          onChange={(gracePeriodDays) => onChange({ gracePeriodDays })}
          error={graceFb.error}
          hint={translate('fields.gracePeriodHint')}
        />
        <FieldFeedback warning={graceFb.warning} />
      </div>
    </div>
  );
}
