'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

import type { OfferDetail } from '@/types/catalog';
import { CATALOG_PRODUCT_PLACEHOLDER_IMAGE } from '@/app/(protected)/catalog-management/lib/constants';

import { VariantChipsRow } from '../VariantChipsRow';

interface OfferDetailProductSectionProps {
  detail: OfferDetail;
  offerId: string;
  mainImage: number;
  onSelectImage: (index: number) => void;
  translate: (key: string, values?: Record<string, string | number>) => string;
  sellerOfferHeading: string;
}

function productImageFallback(
  productImageUrls: readonly string[],
  index: number,
): string | undefined {
  if (productImageUrls.length === 0) {
    return undefined;
  }
  return productImageUrls[index] ?? productImageUrls[0];
}

interface OfferDetailImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src: string;
  fallbackSrc?: string;
}
function OfferDetailImage({
  src,
  fallbackSrc,
  alt,
  ...props
}: Readonly<OfferDetailImageProps>) {
  const [activeSrc, setActiveSrc] = useState(src);

  useEffect(() => {
    setActiveSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      alt={alt}
      src={activeSrc}
      onError={() => {
        if (fallbackSrc && activeSrc !== fallbackSrc) {
          setActiveSrc(fallbackSrc);
        }
      }}
    />
  );
}

function resolveOfferGallery(
  imageUrls: readonly string[],
  productImageUrls: readonly string[],
): readonly string[] {
  if (imageUrls.length > 0) {
    return imageUrls;
  }
  if (productImageUrls.length > 0) {
    return productImageUrls;
  }
  return [CATALOG_PRODUCT_PLACEHOLDER_IMAGE];
}

export function OfferDetailProductSection({
  detail,
  offerId,
  mainImage,
  onSelectImage,
  translate,
  sellerOfferHeading,
}: Readonly<OfferDetailProductSectionProps>) {
  const gallery = resolveOfferGallery(
    detail.imageUrls,
    detail.productImageUrls,
  );
  const heroSrc = gallery[mainImage] ?? gallery[0];
  const heroFallback = productImageFallback(detail.productImageUrls, mainImage);

  return (
    <>
      <div className="px-4 pb-0 pt-4 sm:px-6 sm:pt-5">
        <h2 className="text-[34px] font-medium leading-tight tracking-tight text-mds-black-900">
          {sellerOfferHeading}
        </h2>
      </div>

      <div className="p-4 pt-3 sm:p-6 sm:pt-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-5">
            <div className="relative aspect-square w-full max-w-[208px] shrink-0 overflow-hidden rounded-xl bg-mds-black-100 sm:w-52">
              <OfferDetailImage
                src={heroSrc}
                fallbackSrc={
                  heroFallback && heroFallback !== heroSrc
                    ? heroFallback
                    : undefined
                }
                alt={detail.productName}
                fill
                sizes="208px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-4">
              <div className="min-w-0">
                <h3 className="truncate text-3xl font-semibold leading-tight text-mds-black-900 sm:text-4xl">
                  {detail.productName}
                </h3>
                <p className="mt-1 text-3xl text-mds-black-800">
                  {detail.brand}
                </p>
                <p className="mt-2 text-sm text-mds-black-500">
                  {detail.category}
                  {' / '}
                  {detail.subCategory}
                </p>
                <div className="mt-3">
                  <VariantChipsRow tags={detail.variantTags} />
                </div>
              </div>
              {gallery.length > 1 && (
                <div className="flex flex-wrap items-center gap-2">
                  {gallery.map((url, i) => {
                    const thumbFallback = productImageFallback(
                      detail.productImageUrls,
                      i,
                    );
                    return (
                      <button
                        type="button"
                        key={`${offerId}-thumb-${String(i)}`}
                        aria-label={translate(
                          'listingDetails.selectThumbnail',
                          {
                            n: i + 1,
                          },
                        )}
                        aria-current={i === mainImage ? true : undefined}
                        onClick={() => onSelectImage(i)}
                        className={
                          i === mainImage
                            ? 'h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 border-mds-primary-600'
                            : 'h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 border-transparent'
                        }
                      >
                        <OfferDetailImage
                          src={url}
                          fallbackSrc={
                            thumbFallback && thumbFallback !== url
                              ? thumbFallback
                              : undefined
                          }
                          alt=""
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
