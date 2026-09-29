'use client';

import { cn, InputDropdown, InputField } from '@merit-incentives/ui';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

import {
  sanitizeNumericAmountInput,
  STOREFRONT_CURRENCY_OPTIONS,
  STOREFRONT_REGION_OPTIONS,
  slugifyStorefrontName,
} from '@/utils/createStorefrontFormHelpers';
import { getStorefrontPublicHostSuffixForDisplay } from '@/lib/storefrontUtils';
import { keepSpaceInTextControl } from '@/utils/keepSpaceInTextControl';
import type { CreateStorefrontTenantOption } from '@/hooks/useCreateStorefrontTenantOptions';
import type {
  CreateStorefrontFormValues,
  StorefrontCurrency,
} from '@/types/createStorefrontForm';

import { TenantDropdownSelect } from '../TenantDropdownSelect';

type CreateStorefrontDetailsStepProps = Readonly<{
  values: CreateStorefrontFormValues;
  onChange: (next: Partial<CreateStorefrontFormValues>) => void;
  errors: Record<string, string>;
  translate: (key: string, values?: Record<string, string | number>) => string;
  showTenantField: boolean;
  selectedTenant?: CreateStorefrontTenantOption | null;
  onTenantSelect?: (option: CreateStorefrontTenantOption | null) => void;
}>;

function translateCreateStorefrontFieldError(
  errorKey: string | undefined,
  translate: (key: string, values?: Record<string, string | number>) => string,
): string | undefined {
  if (!errorKey) {
    return undefined;
  }

  switch (errorKey) {
    case 'required':
      return translate('create.errors.required');
    case 'requiredSelect':
      return translate('create.errors.requiredSelect');
    case 'noStorefrontSubscription':
      return translate('create.errors.noStorefrontSubscription');
    default:
      return errorKey;
  }
}

const FIELD_LABEL_CLASS =
  'mb-2 block min-h-5 text-sm font-medium leading-5 text-mds-black-900';
const FIELD_FOOTER_CLASS = 'mt-1.5 min-h-[18px] text-xs leading-[18px]';
const FIELD_SHELL_CLASS =
  'flex h-12 w-full items-stretch overflow-hidden rounded-lg border border-mds-black-200 bg-white focus-within:border-mds-primary-600 focus-within:ring-2 focus-within:ring-mds-primary-100';
const FIELD_SHELL_ERROR_CLASS =
  'border-mds-error-500 focus-within:border-mds-error-500 focus-within:ring-mds-error-100';
const NATIVE_INPUT_CLASS =
  'min-w-0 flex-1 rounded-none border-0 bg-transparent px-4 text-sm text-mds-black-900 shadow-none outline-none ring-0 placeholder:text-mds-black-400 focus:border-0 focus:outline-none focus:ring-0';
const MERIT_CONTROL_CLASS =
  'w-full [&_button]:h-12 [&_button]:min-h-12 [&_input]:h-12 [&_input]:min-h-12';

type StorefrontFieldProps = Readonly<{
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  control: ReactNode;
}>;

function renderFieldFooter(error?: string, hint?: string) {
  if (error) {
    return <p className="text-mds-error-500">{error}</p>;
  }

  if (hint) {
    return <p className="text-mds-black-500">{hint}</p>;
  }

  return null;
}

function StorefrontField({
  label,
  required = false,
  error,
  hint,
  control,
}: StorefrontFieldProps) {
  return (
    <div className="flex min-w-0 flex-col">
      <label className={FIELD_LABEL_CLASS}>
        {label}
        {required ? <span className="text-mds-error-500"> *</span> : null}
      </label>
      <div className="min-h-12">{control}</div>
      <div className={FIELD_FOOTER_CLASS}>{renderFieldFooter(error, hint)}</div>
    </div>
  );
}

function UrlSlugField({
  label,
  value,
  error,
  placeholder,
  onChange,
}: Readonly<{
  label: string;
  value: string;
  error?: string;
  placeholder: string;
  onChange: (urlSlug: string) => void;
}>) {
  return (
    <StorefrontField
      label={label}
      required
      error={error}
      control={
        <div
          className={cn(
            FIELD_SHELL_CLASS,
            error ? FIELD_SHELL_ERROR_CLASS : null,
          )}
        >
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={keepSpaceInTextControl}
            onBlur={() => onChange(slugifyStorefrontName(value))}
            className={cn(NATIVE_INPUT_CLASS, 'pe-2')}
          />
          <span className="flex shrink-0 items-center pe-3 text-xs font-medium text-mds-black-800 sm:pe-4 sm:text-sm">
            .{getStorefrontPublicHostSuffixForDisplay()}
          </span>
        </div>
      }
    />
  );
}

function RegionField({
  label,
  value,
  error,
  placeholder,
  options,
  onChange,
}: Readonly<{
  label: string;
  value: string;
  error?: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  onChange: (region: string) => void;
}>) {
  return (
    <StorefrontField
      label={label}
      required
      error={error}
      control={
        <InputDropdown
          placeholder={placeholder}
          options={options}
          value={value}
          onChange={onChange}
          size="md"
          className={MERIT_CONTROL_CLASS}
        />
      }
    />
  );
}

function CurrencyPrefix({
  value,
  onChange,
  options,
  readOnly = false,
}: Readonly<{
  value: StorefrontCurrency;
  onChange?: (currency: StorefrontCurrency) => void;
  options: Array<{ value: StorefrontCurrency; label: string }>;
  readOnly?: boolean;
}>) {
  if (readOnly) {
    return (
      <div className="flex h-12 w-20 shrink-0 items-center justify-center border-r border-mds-black-200 px-2 text-sm font-medium text-mds-black-800 sm:w-[92px] sm:px-3">
        {value}
      </div>
    );
  }

  return (
    <div className="relative h-12 w-20 shrink-0 border-r border-mds-black-200 sm:w-[92px]">
      <select
        value={value}
        onChange={(event) =>
          onChange?.(event.target.value as StorefrontCurrency)
        }
        className="h-full w-full cursor-pointer appearance-none rounded-none border-0 bg-transparent py-0 pl-3 pr-7 text-sm font-medium text-mds-black-800 shadow-none outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0"
        aria-label="Currency"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-mds-black-500"
        aria-hidden
      />
    </div>
  );
}

function CompositeAmountField({
  label,
  value,
  onChange,
  error,
  hint,
  currency,
  onCurrencyChange,
  currencyOptions,
  currencyReadOnly = false,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  currency: StorefrontCurrency;
  onCurrencyChange?: (currency: StorefrontCurrency) => void;
  currencyOptions: Array<{ value: StorefrontCurrency; label: string }>;
  currencyReadOnly?: boolean;
}>) {
  return (
    <StorefrontField
      label={label}
      required
      error={error}
      hint={hint}
      control={
        <div
          className={cn(
            FIELD_SHELL_CLASS,
            error ? FIELD_SHELL_ERROR_CLASS : null,
          )}
        >
          <CurrencyPrefix
            value={currency}
            onChange={onCurrencyChange}
            options={currencyOptions}
            readOnly={currencyReadOnly}
          />
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={value}
            onChange={(event) =>
              onChange(sanitizeNumericAmountInput(event.target.value))
            }
            className={NATIVE_INPUT_CLASS}
          />
        </div>
      }
    />
  );
}

const FORM_ROW_CLASS =
  'grid w-full grid-cols-1 items-start gap-6 sm:grid-cols-2';

export function CreateStorefrontDetailsStep({
  values,
  onChange,
  errors,
  translate,
  showTenantField,
  selectedTenant = null,
  onTenantSelect,
}: CreateStorefrontDetailsStepProps) {
  const regionOptions = STOREFRONT_REGION_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  const currencyOptions = STOREFRONT_CURRENCY_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  const tenantError = translateCreateStorefrontFieldError(
    errors.tenantId,
    translate,
  );
  const storefrontNameError = translateCreateStorefrontFieldError(
    errors.storefrontName,
    translate,
  );
  const urlSlugError = translateCreateStorefrontFieldError(
    errors.urlSlug,
    translate,
  );
  const regionError = errors.region
    ? translate('create.errors.requiredSelect')
    : undefined;
  const floatBalanceError = errors.floatBalance
    ? translate('create.errors.required')
    : undefined;
  const lowFloatError = errors.lowFloatThreshold
    ? translate('create.errors.required')
    : undefined;

  const sectionSubtitle = showTenantField
    ? translate('create.steps.details.sectionSubtitle')
    : translate('create.steps.details.sectionSubtitleTenantScoped');
  const urlSlugLabel = translate('create.steps.details.urlSlug');
  const urlSlugPlaceholder = translate(
    'create.steps.details.urlSlugPlaceholder',
  );
  const regionLabel = translate('create.steps.details.region');
  const regionPlaceholder = translate('create.steps.details.selectRegion');

  return (
    <div className="relative z-10 w-full min-w-0">
      <header className="mb-6 w-full space-y-2 sm:mb-8">
        <h2 className="text-lg font-semibold leading-tight text-mds-black-900 sm:text-xl">
          {translate('create.steps.details.sectionTitle')}
        </h2>
        <p className="w-full text-sm leading-relaxed text-mds-black-600">
          {sectionSubtitle}
        </p>
      </header>

      {!showTenantField && tenantError ? (
        <p className="mb-4 text-sm text-mds-error-500" role="alert">
          {tenantError}
        </p>
      ) : null}

      <div className="flex w-full min-w-0 flex-col gap-6">
        <div className={FORM_ROW_CLASS}>
          {showTenantField ? (
            <StorefrontField
              label={translate('create.steps.details.tenant')}
              required
              error={tenantError}
              control={
                <TenantDropdownSelect
                  enabled={showTenantField}
                  value={values.tenantId}
                  selectedOption={selectedTenant}
                  hasError={Boolean(tenantError)}
                  controlClassName={MERIT_CONTROL_CLASS}
                  onChange={(tenantId, option) => {
                    onChange({ tenantId });
                    onTenantSelect?.(option);
                  }}
                  placeholder={translate('create.steps.details.selectTenant')}
                  searchPlaceholder={translate(
                    'create.steps.details.searchTenantPlaceholder',
                  )}
                  moreLabel={translate('create.steps.details.loadMoreTenants')}
                  loadingLabel={translate(
                    'create.steps.details.loadingTenants',
                  )}
                  noResultsLabel={translate(
                    'create.steps.details.noTenantsFound',
                  )}
                />
              }
            />
          ) : null}

          <StorefrontField
            label={translate('create.steps.details.storefrontName')}
            required
            error={storefrontNameError}
            control={
              <InputField
                placeholder={translate(
                  'create.steps.details.storefrontNamePlaceholder',
                )}
                value={values.storefrontName}
                onChange={(event) =>
                  onChange({ storefrontName: event.target.value })
                }
                onKeyDown={keepSpaceInTextControl}
                size="md"
                className={MERIT_CONTROL_CLASS}
              />
            }
          />

          {showTenantField ? null : (
            <UrlSlugField
              label={urlSlugLabel}
              value={values.urlSlug}
              error={urlSlugError}
              placeholder={urlSlugPlaceholder}
              onChange={(urlSlug) => onChange({ urlSlug })}
            />
          )}
        </div>

        {showTenantField ? (
          <div className={FORM_ROW_CLASS}>
            <UrlSlugField
              label={urlSlugLabel}
              value={values.urlSlug}
              error={urlSlugError}
              placeholder={urlSlugPlaceholder}
              onChange={(urlSlug) => onChange({ urlSlug })}
            />

            <RegionField
              label={regionLabel}
              value={values.region}
              error={regionError}
              placeholder={regionPlaceholder}
              options={regionOptions}
              onChange={(region) => onChange({ region })}
            />
          </div>
        ) : (
          <div className={FORM_ROW_CLASS}>
            <RegionField
              label={regionLabel}
              value={values.region}
              error={regionError}
              placeholder={regionPlaceholder}
              options={regionOptions}
              onChange={(region) => onChange({ region })}
            />

            <CompositeAmountField
              label={translate('create.steps.details.floatBalance')}
              value={values.floatBalance}
              onChange={(floatBalance) => onChange({ floatBalance })}
              error={floatBalanceError}
              currency={values.currency}
              onCurrencyChange={(currency) => onChange({ currency })}
              currencyOptions={currencyOptions}
            />
          </div>
        )}

        <div className={FORM_ROW_CLASS}>
          {showTenantField ? (
            <CompositeAmountField
              label={translate('create.steps.details.floatBalance')}
              value={values.floatBalance}
              onChange={(floatBalance) => onChange({ floatBalance })}
              error={floatBalanceError}
              currency={values.currency}
              onCurrencyChange={(currency) => onChange({ currency })}
              currencyOptions={currencyOptions}
            />
          ) : null}

          <CompositeAmountField
            label={translate('create.steps.details.lowFloatThreshold')}
            value={values.lowFloatThreshold}
            onChange={(lowFloatThreshold) => onChange({ lowFloatThreshold })}
            error={lowFloatError}
            hint={translate('create.steps.details.lowFloatHint')}
            currency={values.currency}
            currencyOptions={currencyOptions}
            currencyReadOnly
          />
        </div>
      </div>
    </div>
  );
}
