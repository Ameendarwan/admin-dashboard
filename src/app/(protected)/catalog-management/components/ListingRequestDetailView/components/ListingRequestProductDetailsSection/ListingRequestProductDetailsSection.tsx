'use client';

import { CatalogProductDescription } from '../../../CatalogProductDescription';

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

interface ListingRequestProductDetailsSectionProps {
  translate: TranslateFn;
  description: string;
  keyFeatures: readonly string[];
}

export function ListingRequestProductDetailsSection({
  translate,
  description,
  keyFeatures,
}: Readonly<ListingRequestProductDetailsSectionProps>) {
  return (
    <div className="rounded-xl bg-[#F4F7FF] p-4">
      <h3 className="text-2xl font-medium text-mds-black-900">
        {translate('listingRequest.productDetails')}
      </h3>
      <h4 className="mt-3 text-lg font-medium text-mds-black-800">
        {translate('listingDetails.description')}
      </h4>
      <CatalogProductDescription text={description} />
      <h4 className="mt-3 text-lg font-medium text-mds-black-800">
        {translate('listingDetails.keyFeatures')}
      </h4>
      <ul className="mt-1 list-inside list-disc text-base text-mds-black-800">
        {keyFeatures.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </div>
  );
}
