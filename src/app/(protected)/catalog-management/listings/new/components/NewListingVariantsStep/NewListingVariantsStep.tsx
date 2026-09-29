'use client';

import { Button, toast, TrashAltIcon } from '@merit-incentives/ui';
import { PlusCircleIcon } from 'lucide-react';

import {
  createEmptyProductVariantRow,
  NEW_LISTING_MAX_IMAGE_BYTES,
  validateImageFile,
} from '@/app/(protected)/catalog-management/utils/newListingFormHelpers';
import type {
  AttributeFieldDefinition,
  NewListingFormValues,
  NewListingProductVariantRow,
  ProductImageSlot,
} from '@/types/catalog';
import { NEW_LISTING_VARIANT_IMAGE_SLOT_COUNT } from '@/types/catalog';

import { renderNewListingAttributeField } from '../NewListingAttributeField';
import { VariantImageSlot } from '../VariantImageSlot';

interface NewListingVariantsStepProps {
  values: NewListingFormValues;
  variantFields: readonly AttributeFieldDefinition[];
  onChangeProductVariants: (next: NewListingProductVariantRow[]) => void;
  errors: Record<string, string>;
  translate: (key: string, values?: Record<string, string | number>) => string;
}

function updateVariantImageSlot(
  row: NewListingProductVariantRow,
  slotIndex: number,
  file: File | null,
): NewListingProductVariantRow {
  const nextSlots = row.imageSlots.map((slot, i) => {
    if (i !== slotIndex) {
      return slot;
    }
    if (slot.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(slot.previewUrl);
    }
    if (!file) {
      return { ...slot, file: null, previewUrl: null };
    }
    return {
      ...slot,
      file,
      previewUrl: URL.createObjectURL(file),
    };
  });
  return { ...row, imageSlots: nextSlots };
}

export function NewListingVariantsStep({
  values,
  variantFields,
  onChangeProductVariants,
  errors,
  translate,
}: Readonly<NewListingVariantsStepProps>) {
  if (variantFields.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold leading-tight tracking-tight text-mds-black-900">
            {translate('variants.sectionTitle')}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-mds-black-600">
            {translate('variants.noVariantFields')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold leading-tight tracking-tight text-mds-black-900">
          {translate('variants.sectionTitle')}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-mds-black-600">
          {translate('variants.subtitle')}
        </p>
        {errors.variantsMinOne ? (
          <p className="mt-2 text-sm text-red-500">
            {translate('errors.variantsMinOne')}
          </p>
        ) : null}
      </div>

      <div className="space-y-6">
        {values.productVariants.map((pv, rowIndex) => {
          const dupErr = errors[`variantRow:${pv.id}:duplicate`];
          const emptyErr = errors[`variantRow:${pv.id}:empty`];
          return (
            <div
              key={pv.id}
              className="space-y-4 rounded-xl border border-mds-black-100 bg-mds-black-50/40 p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-base font-semibold text-mds-black-800">
                  {translate('variants.variantRowHeading', {
                    n: rowIndex + 1,
                  })}
                </h4>
                {values.productVariants.length > 1 ? (
                  <Button
                    type="button"
                    variant="tertiary"
                    className="h-9 shrink-0 text-red-500 hover:bg-red-50"
                    onClick={() => {
                      const removed = values.productVariants.find(
                        (r) => r.id === pv.id,
                      );
                      if (removed) {
                        for (const slot of removed.imageSlots) {
                          if (slot.previewUrl?.startsWith('blob:')) {
                            URL.revokeObjectURL(slot.previewUrl);
                          }
                        }
                      }
                      onChangeProductVariants(
                        values.productVariants.filter((r) => r.id !== pv.id),
                      );
                    }}
                    aria-label={translate('variants.removeVariant')}
                    leftIcon={<TrashAltIcon className="h-4 w-4" />}
                  >
                    {translate('variants.removeVariant')}
                  </Button>
                ) : null}
              </div>
              {emptyErr ? (
                <p className="text-sm text-red-500">
                  {translate('errors.variantRowEmpty')}
                </p>
              ) : null}
              {dupErr ? (
                <p className="text-sm text-red-500">
                  {translate('errors.duplicateVariantRow')}
                </p>
              ) : null}
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                {variantFields.map((field) =>
                  renderNewListingAttributeField(
                    field,
                    pv.optionsByFieldId[field.id] ?? '',
                    (v) => {
                      onChangeProductVariants(
                        values.productVariants.map((r) =>
                          r.id === pv.id
                            ? {
                                ...r,
                                optionsByFieldId: {
                                  ...r.optionsByFieldId,
                                  [field.id]: v,
                                },
                              }
                            : r,
                        ),
                      );
                    },
                    errors[`variantRow:${pv.id}:${field.id}`],
                    translate,
                    {
                      selectPlaceholderKey: 'variants.selectPlaceholder',
                      textPlaceholderKey: 'variants.textPlaceholder',
                    },
                  ),
                )}
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-mds-black-800">
                    {translate('variants.variantImages')}
                  </p>
                  <p className="text-xs text-mds-black-500">
                    {translate('variants.variantImagesHint')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {Array.from(
                    { length: NEW_LISTING_VARIANT_IMAGE_SLOT_COUNT },
                    (_, slotIndex) => {
                      const slot =
                        pv.imageSlots[slotIndex] ??
                        ({
                          id: `vimg-${pv.id}-${slotIndex}`,
                          file: null,
                          previewUrl: null,
                        } satisfies ProductImageSlot);
                      return (
                        <VariantImageSlot
                          key={slot.id}
                          previewUrl={slot.previewUrl}
                          selectAriaLabel={translate(
                            'variants.variantImageSelect',
                          )}
                          removeAriaLabel={translate(
                            'variants.variantImageRemove',
                          )}
                          onSelect={(file) => {
                            const code = validateImageFile(
                              file,
                              NEW_LISTING_MAX_IMAGE_BYTES,
                            );
                            if (code === 'type') {
                              toast.error(translate('images.errorType'));
                              return;
                            }
                            if (code === 'size') {
                              toast.error(
                                translate('images.errorSize', {
                                  maxMb: Math.floor(
                                    NEW_LISTING_MAX_IMAGE_BYTES / (1024 * 1024),
                                  ),
                                }),
                              );
                              return;
                            }
                            onChangeProductVariants(
                              values.productVariants.map((r) =>
                                r.id === pv.id
                                  ? updateVariantImageSlot(r, slotIndex, file)
                                  : r,
                              ),
                            );
                          }}
                          onRemove={() => {
                            onChangeProductVariants(
                              values.productVariants.map((r) =>
                                r.id === pv.id
                                  ? updateVariantImageSlot(r, slotIndex, null)
                                  : r,
                              ),
                            );
                          }}
                        />
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="tertiary"
        size="sm"
        className="inline-flex h-auto min-h-0 w-fit min-w-0 gap-2 self-start border-0 border-transparent bg-transparent p-0 py-1 text-sm font-semibold text-mds-primary-700 shadow-none ring-offset-0 hover:border-transparent hover:bg-transparent hover:text-mds-primary-800 active:border-transparent active:bg-transparent focus-visible:ring-2 focus-visible:ring-mds-primary-600 focus-visible:ring-offset-2"
        onClick={() =>
          onChangeProductVariants([
            ...values.productVariants,
            createEmptyProductVariantRow(variantFields),
          ])
        }
        leftIcon={
          <PlusCircleIcon
            className="h-5 w-5 shrink-0 text-mds-primary-700"
            aria-hidden
          />
        }
      >
        {translate('variants.addVariant')}
      </Button>
    </div>
  );
}
