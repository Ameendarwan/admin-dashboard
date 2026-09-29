'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';

import type { ListingDetail } from '@/types/catalog';

import { ListingDetailAttributes } from '../ListingDetailAttributes';
import { ListingDetailProductDetails } from '../ListingDetailProductDetails';
import { ListingDetailVariants } from '../ListingDetailVariants';

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

interface ListingDetailProductCardProps {
  listingId: string;
  detail: ListingDetail;
  mainImage: number;
  onMainImageChange: (index: number) => void;
  detailsOpen: boolean;
  onToggleDetails: () => void;
  translate: TranslateFn;
}

export function ListingDetailProductCard({
  listingId,
  detail,
  mainImage,
  onMainImageChange,
  detailsOpen,
  onToggleDetails,
  translate,
}: Readonly<ListingDetailProductCardProps>) {
  return (
    <div className="overflow-hidden rounded-xl border border-mds-black-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-5">
          <div className="relative aspect-square w-36 shrink-0 overflow-hidden rounded-xl bg-mds-black-100 sm:w-44 lg:w-52">
            <Image
              src={detail.imageUrls[mainImage] ?? detail.imageUrls[0]}
              alt={detail.productName}
              fill
              sizes="(min-width: 1024px) 208px, (min-width: 640px) 176px, 144px"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-4">
            <div className="min-w-0">
              <h2 className="truncate text-4xl font-semibold leading-tight text-mds-black-900">
                {detail.productName}
              </h2>
              <p className="mt-1 text-3xl text-mds-black-800">{detail.brand}</p>
              <p className="mt-1 text-sm text-mds-black-500">
                {detail.categoryPath}
              </p>
            </div>
            {detail.imageUrls.length > 1 ? (
              <div className="flex flex-wrap items-center gap-2">
                {detail.imageUrls.map((url, i) => (
                  <button
                    type="button"
                    key={`${listingId}-image-${String(i)}`}
                    aria-label={translate('listingDetails.selectThumbnail', {
                      n: i + 1,
                    })}
                    aria-current={i === mainImage ? true : undefined}
                    onClick={() => onMainImageChange(i)}
                    className={
                      i === mainImage
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
            ) : null}
          </div>
        </div>
        <div className="shrink-0 text-right text-sm text-mds-black-600 lg:pt-1">
          <p>
            {translate('listingDetails.createdOn')}: {detail.createdOn}
          </p>
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={onToggleDetails}
          className="inline-flex items-center gap-1.5 text-base font-medium text-mds-primary-700"
        >
          {detailsOpen
            ? translate('listingDetails.hideDetails')
            : translate('listingDetails.showDetails')}
          {detailsOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>

      {detailsOpen ? (
        <div className="mt-4 space-y-4">
          <ListingDetailProductDetails detail={detail} translate={translate} />
          <ListingDetailAttributes
            attributeRows={detail.attributeRows}
            translate={translate}
          />
          <ListingDetailVariants
            variants={detail.variants}
            translate={translate}
          />
        </div>
      ) : null}
    </div>
  );
}
