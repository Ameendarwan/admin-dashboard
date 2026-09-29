'use client';

import Image from 'next/image';

import {
  activeProductVariantRows,
  normalizedFeatures,
  orderedAttributeEntries,
} from '@/app/(protected)/catalog-management/utils/newListingFormHelpers';
import type {
  AttributeFieldDefinition,
  NewListingFormValues,
} from '@/types/catalog';

interface NewListingReviewStepProps {
  values: NewListingFormValues;
  productAttributeFields: readonly AttributeFieldDefinition[];
  variantFields: readonly AttributeFieldDefinition[];
  translate: (key: string, values?: Record<string, string | number>) => string;
}

export function NewListingReviewStep({
  values,
  productAttributeFields,
  variantFields,
  translate,
}: Readonly<NewListingReviewStepProps>) {
  const productRows = orderedAttributeEntries(
    productAttributeFields,
    values.productAttributes,
    translate,
  );
  const activeVariants = activeProductVariantRows(
    variantFields,
    values.productVariants,
  );

  const images = values.imageSlots.filter((s) => s.previewUrl);
  const features = normalizedFeatures(values.features);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold leading-tight tracking-tight text-mds-black-900">
          {translate('review.sectionTitle')}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-mds-black-600">
          {translate('review.sectionSubtitle')}
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <section className="rounded-xl bg-[#F4F7FF] p-5 sm:p-6">
          <h3 className="text-base font-semibold text-mds-black-800">
            {translate('review.productDetails')}
          </h3>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="text-xs text-mds-black-500">
                {translate('review.labels.title')}
              </dt>
              <dd className="mt-1 text-[15px] font-medium text-mds-black-900">
                {values.title}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-mds-black-500">
                {translate('review.labels.brand')}
              </dt>
              <dd className="mt-1 text-[15px] font-medium text-mds-black-900">
                {values.brand}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-mds-black-500">
                {translate('review.labels.description')}
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-mds-black-900">
                {values.description}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-mds-black-500">
                {translate('review.labels.features')}
              </dt>
              <dd className="mt-1">
                <ul className="list-inside list-disc space-y-1.5 text-[15px] text-mds-black-900">
                  {features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </section>

        {productRows.length > 0 ? (
          <section className="rounded-xl bg-[#F4F7FF] p-5 sm:p-6">
            <h3 className="text-base font-semibold text-mds-black-800">
              {translate('review.productAttributes')}
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              {productRows.map((row) => (
                <div key={row.id} className="min-w-0">
                  <p className="text-xs text-mds-black-500">{row.labelForUi}</p>
                  <p className="mt-1 text-[15px] font-medium text-mds-black-900">
                    {row.displayValue || '—'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeVariants.length > 0 ? (
          <section className="rounded-xl bg-[#F4F7FF] p-5 sm:p-6">
            <h3 className="text-base font-semibold text-mds-black-800">
              {translate('review.productVariants')}
            </h3>
            <div className="mt-4 space-y-6">
              {activeVariants.map((pv, i) => {
                const attrRows = orderedAttributeEntries(
                  variantFields,
                  pv.optionsByFieldId,
                  translate,
                );
                return (
                  <div
                    key={pv.id}
                    className="min-w-0 border-t border-mds-black-100 pt-4 first:border-t-0 first:pt-0"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-mds-black-600">
                      {translate('variants.variantRowHeading', { n: i + 1 })}
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                      {attrRows.map((row) => (
                        <div key={row.id} className="min-w-0">
                          <p className="text-xs text-mds-black-500">
                            {row.labelForUi}
                          </p>
                          <p className="mt-1 text-[15px] font-medium text-mds-black-900">
                            {row.displayValue || '—'}
                          </p>
                        </div>
                      ))}
                    </div>
                    {pv.imageSlots.some((slot) => slot.previewUrl) ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {pv.imageSlots
                          .filter((slot) => slot.previewUrl)
                          .map((slot) => (
                            <div
                              key={slot.id}
                              className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-mds-black-100"
                            >
                              <Image
                                src={slot.previewUrl!}
                                alt=""
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="rounded-xl bg-[#F4F7FF] p-5 sm:p-6">
          <h3 className="text-base font-semibold text-mds-black-800">
            {translate('review.images')}
          </h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {images.map((slot) => (
              <div
                key={slot.id}
                className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-mds-black-100"
              >
                {slot.previewUrl ? (
                  <Image
                    src={slot.previewUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
