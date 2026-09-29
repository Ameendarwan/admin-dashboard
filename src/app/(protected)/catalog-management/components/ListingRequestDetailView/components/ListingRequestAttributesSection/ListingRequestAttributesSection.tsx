'use client';

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

interface ListingRequestAttributesSectionProps {
  translate: TranslateFn;
  attributes: Readonly<Record<string, string>>;
}

export function ListingRequestAttributesSection({
  translate,
  attributes,
}: Readonly<ListingRequestAttributesSectionProps>) {
  return (
    <div className="rounded-xl bg-[#F4F7FF] p-4">
      <h3 className="text-2xl font-medium text-mds-black-900">
        {translate('listingDetails.attributes')}
      </h3>
      <div className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(attributes).map(([k, v]) => (
          <div key={k} className="min-w-0">
            <p className="text-sm text-mds-black-500">{k}</p>
            <p className="text-lg text-mds-black-900">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
