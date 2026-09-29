'use client';

import {
  Button,
  InputDropdown,
  InputField,
  TextArea,
  TrashAltIcon,
} from '@merit-incentives/ui';
import { PlusCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { NEW_LISTING_MIN_DESCRIPTION_RECOMMENDED } from '@/app/(protected)/catalog-management/utils/newListingFormHelpers';
import { newListingKeepSpaceInTextControl } from '@/app/(protected)/catalog-management/utils/newListingKeepSpaceInTextControl';
import type { NewListingFormValues } from '@/types/catalog';
import { createClientId } from '@/utils/idUtils';

interface NewListingDetailsStepProps {
  values: NewListingFormValues;
  onChange: (next: Partial<NewListingFormValues>) => void;
  categoryOptions: { value: string; label: string }[];
  subcategoryOptions: { value: string; label: string }[];
  errors: Record<string, string>;
  translate: (key: string, values?: Record<string, string | number>) => string;
}

export function NewListingDetailsStep({
  values,
  onChange,
  categoryOptions,
  subcategoryOptions,
  errors,
  translate,
}: Readonly<NewListingDetailsStepProps>) {
  const descriptionHint = translate('details.descriptionHint', {
    min: NEW_LISTING_MIN_DESCRIPTION_RECOMMENDED,
  });
  const [featureKeys, setFeatureKeys] = useState<string[]>(() =>
    values.features.map(() => createClientId()),
  );

  useEffect(() => {
    setFeatureKeys((prev) => {
      if (prev.length === values.features.length) {
        return prev;
      }
      if (prev.length < values.features.length) {
        const added = Array.from(
          { length: values.features.length - prev.length },
          () => createClientId(),
        );
        return [...prev, ...added];
      }
      return prev.slice(0, values.features.length);
    });
  }, [values.features.length]);

  return (
    <div className="w-full min-w-0">
      <header className="mb-8 w-full space-y-2 md:mb-10">
        <h2 className="text-2xl font-semibold leading-tight tracking-tight text-mds-black-900">
          {translate('details.sectionTitle')}
        </h2>
        <p className="w-full text-sm leading-relaxed text-mds-black-600">
          {translate('details.sectionSubtitle')}
        </p>
      </header>

      {/* Rows 1–2: equal half-width columns; row 3: full-width — aligned with stepper width */}
      <form
        className="grid w-full min-w-0 grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 md:gap-x-8 md:gap-y-6"
        onSubmit={(e) => e.preventDefault()}
        noValidate
      >
        <div className="min-w-0">
          <InputDropdown
            label={translate('details.category')}
            placeholder={translate('details.selectCategory')}
            options={categoryOptions}
            value={values.categoryId}
            onChange={(v) =>
              onChange({
                categoryId: v,
                subcategoryId: '',
                productAttributes: {},
                productVariants: [],
              })
            }
            error={
              errors.categoryId ? translate('errors.requiredSelect') : undefined
            }
            required
            className="w-full"
          />
        </div>
        <div className="min-w-0">
          <InputDropdown
            label={translate('details.subcategory')}
            placeholder={translate('details.selectSubcategory')}
            options={subcategoryOptions}
            value={values.subcategoryId}
            onChange={(v) =>
              onChange({
                subcategoryId: v,
                productAttributes: {},
                productVariants: [],
              })
            }
            disabled={!values.categoryId}
            className="w-full"
          />
        </div>

        <div className="min-w-0">
          <InputField
            label={translate('details.productTitle')}
            placeholder={translate('details.productTitlePlaceholder')}
            value={values.title}
            onChange={(e) => onChange({ title: e.target.value })}
            onKeyDown={newListingKeepSpaceInTextControl}
            error={errors.title ? translate('errors.required') : undefined}
            required
            className="w-full"
          />
        </div>
        <div className="min-w-0">
          <InputField
            label={translate('details.brand')}
            placeholder={translate('details.brandPlaceholder')}
            value={values.brand}
            onChange={(e) => onChange({ brand: e.target.value })}
            onKeyDown={newListingKeepSpaceInTextControl}
            error={errors.brand ? translate('errors.required') : undefined}
            required
            className="w-full"
          />
        </div>

        <div className="min-w-0 md:col-span-2">
          <TextArea
            label={translate('details.description')}
            placeholder={translate('details.descriptionPlaceholder')}
            value={values.description}
            onChange={(e) => onChange({ description: e.target.value })}
            onKeyDown={newListingKeepSpaceInTextControl}
            hint={descriptionHint}
            error={
              errors.description ? translate('errors.required') : undefined
            }
            required
            rows={7}
            className="min-h-[168px] w-full max-w-none"
          />
        </div>

        {/* Full grid width: one feature per row, Add below last input */}
        <div className="min-w-0 md:col-span-2">
          <div className="flex w-full min-w-0 flex-col gap-3">
            {values.features.map((feature, index) => (
              <div
                key={featureKeys[index] ?? `feature-fallback-${feature}`}
                className="grid w-full min-w-0 grid-cols-1 items-end gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
              >
                <InputField
                  {...(index === 0
                    ? {
                        label: translate('details.featuresLabel'),
                        required: true as const,
                      }
                    : {})}
                  placeholder={translate('details.featurePlaceholder', {
                    n: index + 1,
                  })}
                  value={feature}
                  onChange={(e) => {
                    const next = [...values.features];
                    next[index] = e.target.value;
                    onChange({ features: next });
                  }}
                  onKeyDown={newListingKeepSpaceInTextControl}
                  className="min-w-0 w-full max-w-none"
                  error={
                    index === 0 && errors.features
                      ? translate('errors.atLeastOneFeature')
                      : undefined
                  }
                />
                {index > 0 ? (
                  <Button
                    type="button"
                    variant="tertiary"
                    className="h-11 shrink-0 justify-self-start text-red-500 hover:bg-red-50 sm:mb-px sm:justify-self-end"
                    onClick={() => {
                      const next = values.features.filter(
                        (_, i) => i !== index,
                      );
                      setFeatureKeys((keys) =>
                        keys.filter((_, i) => i !== index),
                      );
                      onChange({ features: next.length ? next : [''] });
                    }}
                    aria-label={translate('details.removeFeature')}
                  >
                    <TrashAltIcon className="h-5 w-5" />
                  </Button>
                ) : null}
              </div>
            ))}
            <Button
              type="button"
              variant="tertiary"
              size="sm"
              className="inline-flex h-auto min-h-0 w-fit min-w-0 gap-2 self-start border-0 border-transparent bg-transparent p-0 py-1 text-sm font-semibold text-mds-primary-700 shadow-none ring-offset-0 hover:border-transparent hover:bg-transparent hover:text-mds-primary-800 active:border-transparent active:bg-transparent focus-visible:ring-2 focus-visible:ring-mds-primary-600 focus-visible:ring-offset-2"
              onClick={() => onChange({ features: [...values.features, ''] })}
              leftIcon={
                <PlusCircleIcon
                  className="h-5 w-5 shrink-0 text-mds-primary-700"
                  aria-hidden
                />
              }
            >
              {translate('details.addFeature')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
