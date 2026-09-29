'use client';

import type { OfferDetail } from '@/types/catalog';

import { CatalogProductDescription } from '../CatalogProductDescription';
import { OfferDetailField } from '../OfferDetailField';

interface OfferDetailSpecsSectionProps {
  detail: OfferDetail;
  translate: (key: string, values?: Record<string, string | number>) => string;
}

/** Product Details card — fields and order match catalog offer-detail Figma. */
export function OfferDetailSpecsSection({
  detail,
  translate,
}: Readonly<OfferDetailSpecsSectionProps>) {
  return (
    <>
      <div className="px-4 pb-6 pt-5 sm:px-6">
        <div className="space-y-4 rounded-xl bg-[#F4F7FF] p-4 sm:p-5">
          <h3 className="text-2xl font-medium text-mds-black-900">
            {translate('offerDetail.productDetailsHeading')}
          </h3>
          <div className="mt-3 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <OfferDetailField
              label={translate('offerDetail.labels.category')}
              value={detail.category}
            />
            <OfferDetailField
              label={translate('offerDetail.labels.subCategory')}
              value={detail.subCategory}
            />
            <OfferDetailField
              label={translate('listingRequest.sku')}
              value={detail.sku}
            />
            <OfferDetailField
              label={translate('listingRequest.condition')}
              value={detail.conditionDisplay}
            />
            <OfferDetailField
              label={translate('listingRequest.location')}
              value={detail.location}
            />
            <OfferDetailField
              label={translate('listingRequest.stock')}
              value={detail.stock}
            />
            <OfferDetailField
              label={translate('listingRequest.price')}
              value={detail.priceLabel}
            />
            <OfferDetailField
              label={translate('offerDetail.labels.seller')}
              value={detail.seller}
            />
            <OfferDetailField
              label={translate('listingRequest.submittedOn')}
              value={detail.submittedOn}
            />
          </div>

          {detail.description ? (
            <div className="mt-3">
              <p className="text-sm text-mds-black-500">
                {translate('listingDetails.description')}
              </p>
              <CatalogProductDescription text={detail.description} />
            </div>
          ) : null}

          {detail.variantTags.length > 0 ? (
            <div className="mt-3">
              <p className="text-sm text-mds-black-500">
                {translate('listingDetails.keyFeatures')}
              </p>
              <ul className="mt-1 list-inside list-disc text-base text-mds-black-800">
                {detail.variantTags.map((option) => (
                  <li key={`${option.label}-${option.value}`}>
                    {option.label}: {option.value}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      {detail.attributeRows.length > 0 ? (
        <>
          <hr className="border-0 border-t border-mds-black-100" />
          <div className="px-4 pb-6 pt-5 sm:px-6">
            <div className="rounded-xl bg-[#F4F7FF] p-4 sm:p-5">
              <h3 className="text-2xl font-medium text-mds-black-900">
                {translate('listingDetails.attributes')}
              </h3>
              <div className="mt-3 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                {detail.attributeRows.map((row) => (
                  <OfferDetailField
                    key={`${row.label}-${row.value}`}
                    label={row.label}
                    value={row.value}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
