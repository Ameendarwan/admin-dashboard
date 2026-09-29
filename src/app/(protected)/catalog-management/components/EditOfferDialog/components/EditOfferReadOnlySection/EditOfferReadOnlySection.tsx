'use client';

import { formatCatalogOfferUtcPeriod } from '@/app/(protected)/catalog-management/lib/displayFormat';
import type { OfferDetail } from '@/types/catalog';

import { VariantChipsRow } from '../../../VariantChipsRow';

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

interface EditOfferReadOnlySectionProps {
  translate: TranslateFn;
  offer: OfferDetail;
}

export function EditOfferReadOnlySection({
  translate,
  offer,
}: Readonly<EditOfferReadOnlySectionProps>) {
  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold text-mds-black-900">
        {translate('offerEdit.readOnlyHeading')}
      </h3>
      <p className="text-sm text-mds-black-600">
        {translate('offerEdit.readOnlyCaption')}
      </p>
      <div className="min-w-0 overflow-hidden rounded-xl bg-mds-black-50 p-4 text-mds-black-800">
        <dl className="grid min-w-0 gap-x-8 gap-y-3 sm:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-sm text-mds-black-600">
              {translate('offerEdit.product')}
            </dt>
            <dd className="min-w-0 break-words text-base font-medium">
              {offer.productName}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-sm text-mds-black-600">
              {translate('offerEdit.brand')}
            </dt>
            <dd className="min-w-0 break-words text-base font-medium">
              {offer.brand}
            </dd>
          </div>
          <div className="min-w-0 sm:col-span-2">
            <dt className="text-sm text-mds-black-600">
              {translate('offerEdit.variant')}
            </dt>
            <dd className="mt-1 min-w-0">
              <VariantChipsRow tags={offer.variantTags} />
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-sm text-mds-black-600">
              {translate('offerEdit.sku')}
            </dt>
            <dd className="min-w-0 break-all text-base font-medium">
              {offer.sku}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-sm text-mds-black-600">
              {translate('listingDetails.catalogSku')}
            </dt>
            <dd className="min-w-0 break-all text-base font-medium">
              {offer.productSku}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-sm text-mds-black-600">
              {translate('offerDetail.labels.conditionDisplay')}
            </dt>
            <dd className="min-w-0 break-words text-base font-medium">
              {offer.conditionDisplay}
            </dd>
          </div>
          <div className="min-w-0 sm:col-span-2">
            <dt className="text-sm text-mds-black-600">
              {translate('offerDetail.labels.productVariantId')}
            </dt>
            <dd className="min-w-0 break-all text-base font-medium">
              {offer.productVariantId}
            </dd>
          </div>
          {offer.variantTags.length > 0 ? (
            <div className="min-w-0 sm:col-span-2">
              <dt className="text-sm text-mds-black-600">
                {translate('listingDetails.keyFeatures')}
              </dt>
              <dd className="min-w-0 break-words text-base font-normal">
                {offer.variantTags
                  .map((tag) => `${tag.label}: ${tag.value}`)
                  .join('; ')}
              </dd>
            </div>
          ) : null}
          <div className="min-w-0">
            <dt className="text-sm text-mds-black-600">
              {translate('offerEdit.location')}
            </dt>
            <dd className="min-w-0 break-words text-base font-medium">
              {offer.location?.trim() || '—'}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-sm text-mds-black-600">
              {translate('offerDetail.labels.offerPeriod')}
            </dt>
            <dd className="min-w-0 break-words text-base font-medium">
              {formatCatalogOfferUtcPeriod(
                offer.offerStartsAtUtc,
                offer.offerEndsAtUtc,
                translate('offerDetail.offerPeriodNoEnd'),
              )}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
