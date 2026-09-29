'use client';

import type {
  AttributeFieldDefinition,
  NewListingFormValues,
} from '@/types/catalog';

import { renderNewListingAttributeField } from '../NewListingAttributeField';

interface NewListingAttributesStepProps {
  values: NewListingFormValues;
  productFields: readonly AttributeFieldDefinition[];
  onChangeProductAttributes: (next: Record<string, string>) => void;
  errors: Record<string, string>;
  sectionTitle: string;
  translate: (key: string, values?: Record<string, string | number>) => string;
}

export function NewListingAttributesStep({
  values,
  productFields,
  onChangeProductAttributes,
  errors,
  sectionTitle,
  translate,
}: Readonly<NewListingAttributesStepProps>) {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-semibold leading-tight tracking-tight text-mds-black-900">
          {sectionTitle}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-mds-black-600">
          {translate('attributes.subtitle')}
        </p>
      </div>

      {productFields.length === 0 ? (
        <p className="text-sm text-mds-black-600">
          {translate('attributes.noExtraFields')}
        </p>
      ) : (
        <section className="space-y-5">
          <h3 className="text-lg font-semibold text-mds-black-800">
            {translate('attributes.productSection')}
          </h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            {productFields.map((field) =>
              renderNewListingAttributeField(
                field,
                values.productAttributes[field.id] ?? '',
                (v) =>
                  onChangeProductAttributes({
                    ...values.productAttributes,
                    [field.id]: v,
                  }),
                errors[field.id],
                translate,
              ),
            )}
          </div>
        </section>
      )}
    </div>
  );
}
