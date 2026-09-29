'use client';

import { ContentCard } from '@merit-incentives/ui';

import { DetailsPageHeader } from '@/components/DetailsPageHeader';

import { ListingFormStepper } from '../ListingFormStepper';
import { NewListingStepBody, NewListingWizardFooter } from './components';
import { useNewListingPage } from './hooks';

export function NewListingPageClient() {
  const {
    tList,
    step,
    values,
    patchValues,
    categoryOptions,
    subcategoryOptions,
    stepErrors,
    attributesStepLoading,
    variantsStepLoading,
    productAttributeFields,
    variantFields,
    attributesSectionTitle,
    stepLabels,
    submitting,
    continueDisabled,
    primaryLabel,
    goBack,
    goNext,
  } = useNewListingPage();

  return (
    <div className="min-h-0" id="catalog-new-listing-page">
      <div className="space-y-4 sm:space-y-5">
        <DetailsPageHeader title={tList('pageTitle')} />

        <ContentCard
          className="overflow-hidden rounded-xl border border-mds-black-100 bg-white shadow-sm"
          size="md"
        >
          <ContentCard.Content className="w-full min-w-0 space-y-8 p-6 sm:p-8 lg:p-10">
            <div className="w-full min-w-0">
              <ListingFormStepper steps={stepLabels} currentIndex={step} />
            </div>
            <div className="w-full min-w-0">
              <NewListingStepBody
                step={step}
                values={values}
                patchValues={patchValues}
                categoryOptions={categoryOptions}
                subcategoryOptions={subcategoryOptions}
                stepErrors={stepErrors}
                translate={tList}
                attributesStepLoading={attributesStepLoading}
                variantsStepLoading={variantsStepLoading}
                productAttributeFields={productAttributeFields}
                variantFields={variantFields}
                attributesSectionTitle={attributesSectionTitle}
              />
            </div>
          </ContentCard.Content>
          <ContentCard.Footer className="border-t border-mds-black-100 bg-white px-6 py-5 sm:px-8 lg:px-10">
            <NewListingWizardFooter
              step={step}
              submitting={submitting}
              continueDisabled={continueDisabled}
              primaryLabel={primaryLabel}
              translate={tList}
              onBack={goBack}
              onContinue={() => void goNext()}
            />
          </ContentCard.Footer>
        </ContentCard>
      </div>
    </div>
  );
}
