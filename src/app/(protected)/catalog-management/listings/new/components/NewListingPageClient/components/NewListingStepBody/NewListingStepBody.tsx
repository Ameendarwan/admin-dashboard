'use client';

import type {
  AttributeFieldDefinition,
  NewListingFormValues,
  NewListingStepIndex,
} from '@/types/catalog';

import { NewListingAttributesStep } from '../../../NewListingAttributesStep';
import { NewListingDetailsStep } from '../../../NewListingDetailsStep';
import { NewListingImagesStep } from '../../../NewListingImagesStep';
import { NewListingReviewStep } from '../../../NewListingReviewStep';
import { NewListingVariantsStep } from '../../../NewListingVariantsStep';
import type { TranslateFn } from '../../utils/newListingPageHelpers';

interface NewListingStepBodyProps {
  step: NewListingStepIndex;
  values: NewListingFormValues;
  patchValues: (next: Partial<NewListingFormValues>) => void;
  categoryOptions: { value: string; label: string }[];
  subcategoryOptions: { value: string; label: string }[];
  stepErrors: Record<string, string>;
  translate: TranslateFn;
  attributesStepLoading: boolean;
  variantsStepLoading: boolean;
  productAttributeFields: AttributeFieldDefinition[];
  variantFields: AttributeFieldDefinition[];
  attributesSectionTitle: string;
}

export function NewListingStepBody({
  step,
  values,
  patchValues,
  categoryOptions,
  subcategoryOptions,
  stepErrors,
  translate,
  attributesStepLoading,
  variantsStepLoading,
  productAttributeFields,
  variantFields,
  attributesSectionTitle,
}: Readonly<NewListingStepBodyProps>) {
  if (step === 0) {
    return (
      <NewListingDetailsStep
        values={values}
        onChange={patchValues}
        categoryOptions={categoryOptions}
        subcategoryOptions={subcategoryOptions}
        errors={stepErrors}
        translate={translate}
      />
    );
  }

  if (step === 1) {
    if (attributesStepLoading) {
      return (
        <p className="text-sm text-mds-black-600">
          {translate('loadingCategoryFields')}
        </p>
      );
    }
    return (
      <NewListingAttributesStep
        values={values}
        productFields={productAttributeFields}
        onChangeProductAttributes={(productAttributes) =>
          patchValues({ productAttributes })
        }
        errors={stepErrors}
        sectionTitle={attributesSectionTitle}
        translate={translate}
      />
    );
  }

  if (step === 2) {
    return (
      <NewListingImagesStep
        values={values}
        onChangeSlots={(imageSlots) => patchValues({ imageSlots })}
        errors={stepErrors}
        translate={translate}
      />
    );
  }

  if (step === 3) {
    if (variantsStepLoading) {
      return (
        <p className="text-sm text-mds-black-600">
          {translate('loadingCategoryFields')}
        </p>
      );
    }
    return (
      <NewListingVariantsStep
        values={values}
        variantFields={variantFields}
        onChangeProductVariants={(productVariants) =>
          patchValues({ productVariants })
        }
        errors={stepErrors}
        translate={translate}
      />
    );
  }

  return (
    <NewListingReviewStep
      values={values}
      productAttributeFields={productAttributeFields}
      variantFields={variantFields}
      translate={translate}
    />
  );
}
