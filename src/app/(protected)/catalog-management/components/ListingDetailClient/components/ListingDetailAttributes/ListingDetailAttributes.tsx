'use client';

import type { ListingDetail } from '@/types/catalog';

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

interface ListingDetailAttributesProps {
  attributeRows: ListingDetail['attributeRows'];
  translate: TranslateFn;
}

export function ListingDetailAttributes({
  attributeRows,
  translate,
}: Readonly<ListingDetailAttributesProps>) {
  if (attributeRows.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl bg-[#F4F7FF] p-4 sm:p-6">
      <h3 className="text-2xl font-medium text-mds-black-900">
        {translate('listingDetails.attributes')}
      </h3>
      <div className="mt-4 flex flex-wrap gap-x-8 gap-y-5">
        {attributeRows.map((row) => (
          <div
            key={`${row.label}-${row.value}`}
            className="min-w-[8rem] max-w-full flex-[1_1_10rem] sm:flex-[1_1_12rem] lg:flex-[1_1_14rem]"
          >
            <p className="text-sm text-mds-black-500">{row.label}</p>
            <p className="mt-1 break-words text-lg text-mds-black-900">
              {row.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
