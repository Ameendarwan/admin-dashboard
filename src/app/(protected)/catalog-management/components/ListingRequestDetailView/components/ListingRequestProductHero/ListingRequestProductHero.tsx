'use client';

import Image from 'next/image';

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

interface ListingRequestProductHeroProps {
  translate: TranslateFn;
  productName: string;
  brand: string;
  categoryPath: string;
  imageUrls: readonly string[];
  mainImage: number;
  onSelectImage: (index: number) => void;
  submittedOn: string;
}

export function ListingRequestProductHero({
  translate,
  productName,
  brand,
  categoryPath,
  imageUrls,
  mainImage,
  onSelectImage,
  submittedOn,
}: Readonly<ListingRequestProductHeroProps>) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-5">
        <div className="relative aspect-square w-36 shrink-0 overflow-hidden rounded-xl bg-mds-black-100 sm:w-44 lg:w-52">
          <Image
            src={imageUrls[mainImage] ?? imageUrls[0]}
            alt={productName}
            fill
            sizes="(min-width: 1024px) 208px, (min-width: 640px) 176px, 144px"
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-4xl font-semibold leading-tight text-mds-black-900">
              {productName}
            </h2>
            <p className="mt-1 text-3xl text-mds-black-800">{brand}</p>
            <p className="mt-1 text-sm text-mds-black-500">{categoryPath}</p>
          </div>
          {imageUrls.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              {imageUrls.map((url, index) => (
                <button
                  type="button"
                  key={url}
                  aria-label={translate('listingDetails.selectThumbnail', {
                    n: index + 1,
                  })}
                  aria-current={index === mainImage ? true : undefined}
                  onClick={() => onSelectImage(index)}
                  className={
                    index === mainImage
                      ? 'h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 border-mds-primary-600'
                      : 'h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 border-transparent'
                  }
                >
                  <Image
                    src={url}
                    alt=""
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <p className="shrink-0 text-sm text-mds-black-600 lg:pt-1">
        {translate('listingRequest.submittedOn')}: {submittedOn}
      </p>
    </div>
  );
}
