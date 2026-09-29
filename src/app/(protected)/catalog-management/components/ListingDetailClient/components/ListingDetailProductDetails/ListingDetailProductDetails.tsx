'use client';

import type { ListingDetail } from '@/types/catalog';

import { CatalogProductDescription } from '../../../CatalogProductDescription';

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

interface ListingDetailProductDetailsProps {
  detail: ListingDetail;
  translate: TranslateFn;
}

export function ListingDetailProductDetails({
  detail,
  translate,
}: Readonly<ListingDetailProductDetailsProps>) {
  if (!detail.description && detail.keyFeatures.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl bg-[#F4F7FF] p-4 sm:p-6">
      <h3 className="text-2xl font-medium text-mds-black-900">
        {translate('listingDetails.productDetails')}
      </h3>
      {detail.description ? (
        <>
          <h4 className="mt-3 text-sm font-medium text-mds-black-500">
            {translate('listingDetails.description')}
          </h4>
          <CatalogProductDescription text={detail.description} />
        </>
      ) : null}
      {detail.keyFeatures.length > 0 ? (
        <>
          <h4
            className={
              detail.description
                ? 'mt-4 text-sm font-medium text-mds-black-500'
                : 'mt-3 text-sm font-medium text-mds-black-500'
            }
          >
            {translate('listingDetails.keyFeatures')}
          </h4>
          <ul className="mt-1 list-inside list-disc text-base text-mds-black-800">
            {detail.keyFeatures.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
