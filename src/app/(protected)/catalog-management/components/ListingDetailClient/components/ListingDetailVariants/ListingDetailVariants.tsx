'use client';

import type { ListingDetail } from '@/types/catalog';

import { CatalogVariantDetailRow } from '../../../CatalogVariantDetailRow';

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

interface ListingDetailVariantsProps {
  variants: ListingDetail['variants'];
  translate: TranslateFn;
}

export function ListingDetailVariants({
  variants,
  translate,
}: Readonly<ListingDetailVariantsProps>) {
  if (variants.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl bg-[#F4F7FF] p-4 sm:p-6">
      <h3 className="text-2xl font-medium text-mds-black-900">
        {translate('listingDetails.variants')}
      </h3>
      <div className="mt-4 space-y-3">
        {variants.map((variant, index) => (
          <CatalogVariantDetailRow
            key={variant.id}
            index={index}
            heading={translate('listingDetails.variant', {
              n: index + 1,
            })}
            tags={variant.tags}
            imageUrls={variant.imageUrls}
            imageAltPrefix={translate('listingDetails.variantImageAlt', {
              n: index + 1,
            })}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-mds-black-500">
                  {translate('listingDetails.catalogSku')}
                </p>
                <p className="text-lg text-mds-black-900">
                  {variant.catalogSku || '—'}
                </p>
              </div>
              {variant.sellerSku ? (
                <div>
                  <p className="text-sm text-mds-black-500">
                    {translate('listingDetails.sellerSku')}
                  </p>
                  <p className="text-lg text-mds-black-900">
                    {variant.sellerSku}
                  </p>
                </div>
              ) : null}
            </div>
          </CatalogVariantDetailRow>
        ))}
      </div>
    </div>
  );
}
