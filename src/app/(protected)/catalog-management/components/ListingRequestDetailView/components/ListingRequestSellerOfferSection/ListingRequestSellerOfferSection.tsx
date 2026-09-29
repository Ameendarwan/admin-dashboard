'use client';

import type { RequestVariantOffer } from '@/types/catalog';

import { CatalogVariantDetailRow } from '../../../CatalogVariantDetailRow';

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

interface ListingRequestSellerOfferSectionProps {
  translate: TranslateFn;
  variants: readonly RequestVariantOffer[];
}

export function ListingRequestSellerOfferSection({
  translate,
  variants,
}: Readonly<ListingRequestSellerOfferSectionProps>) {
  return (
    <div className="rounded-xl bg-[#F4F7FF] p-4">
      <h3 className="text-2xl font-medium text-mds-black-900">
        {translate('listingRequest.sellersOffer')}
      </h3>
      <div className="mt-3 space-y-3">
        {variants.map((v, i) => (
          <CatalogVariantDetailRow
            key={v.id}
            index={i}
            heading={translate('listingRequest.variant', { n: i + 1 })}
            tags={v.tags}
            imageUrls={v.imageUrls}
            imageAltPrefix={translate('listingRequest.variantImageAlt', {
              n: i + 1,
            })}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-mds-black-500">
                  {translate('listingRequest.sku')}
                </p>
                <p className="text-lg text-mds-black-900">{v.sku}</p>
              </div>
              <div>
                <p className="text-sm text-mds-black-500">
                  {translate('listingRequest.condition')}
                </p>
                <p className="text-lg text-mds-black-900">{v.condition}</p>
              </div>
            </div>

            <div className="mt-3 grid gap-3 rounded-lg bg-white/90 p-3 ring-1 ring-inset ring-mds-black-100/35 sm:grid-cols-3">
              <div>
                <p className="text-sm text-mds-black-500">
                  {translate('listingRequest.location')}
                </p>
                <p className="text-base text-mds-black-900">{v.location}</p>
              </div>
              <div>
                <p className="text-sm text-mds-black-500">
                  {translate('listingRequest.stock')}
                </p>
                <p className="text-base text-mds-black-900">{v.stock}</p>
              </div>
              <div>
                <p className="text-sm text-mds-black-500">
                  {translate('listingRequest.price')}
                </p>
                <p className="text-base text-mds-black-900">{v.price}</p>
              </div>
            </div>
          </CatalogVariantDetailRow>
        ))}
      </div>
    </div>
  );
}
