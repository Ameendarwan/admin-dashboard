'use client';

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

interface ListingRequestRequestedBySectionProps {
  translate: TranslateFn;
  sellerName: string;
  sellerEmail: string;
  submittedOn: string;
}

export function ListingRequestRequestedBySection({
  translate,
  sellerName,
  sellerEmail,
  submittedOn,
}: Readonly<ListingRequestRequestedBySectionProps>) {
  return (
    <div className="rounded-xl bg-[#F4F7FF] p-4">
      <h3 className="text-2xl font-medium text-mds-black-900">
        {translate('listingRequest.requestedBy')}
      </h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-sm text-mds-black-500">
            {translate('listingRequest.sellerName')}
          </p>
          <p className="text-lg text-mds-black-900">{sellerName}</p>
        </div>
        <div>
          <p className="text-sm text-mds-black-500">
            {translate('listingRequest.email')}
          </p>
          <p className="text-lg text-mds-black-900">{sellerEmail}</p>
        </div>
        <div>
          <p className="text-sm text-mds-black-500">
            {translate('listingRequest.submittedOn')}
          </p>
          <p className="text-lg text-mds-black-900">{submittedOn}</p>
        </div>
      </div>
    </div>
  );
}
