'use client';

import Image from 'next/image';

import type { VariantAttribute } from '@/types/catalog';

import { VariantChipsRow } from '../VariantChipsRow';

interface CatalogVariantDetailRowProps {
  index: number;
  heading: string;
  tags: readonly VariantAttribute[];
  imageUrls: readonly string[];
  imageAltPrefix: string;
  children?: React.ReactNode;
}

export function CatalogVariantDetailRow({
  index,
  heading,
  tags,
  imageUrls,
  imageAltPrefix,
  children,
}: Readonly<CatalogVariantDetailRowProps>) {
  return (
    <div className="border-b border-mds-black-100 pb-4 last:border-b-0 last:pb-0">
      <p className="text-lg font-medium text-mds-black-900">{heading}</p>
      {tags.length > 0 ? (
        <div className="mt-2">
          <VariantChipsRow tags={tags} />
        </div>
      ) : null}

      {imageUrls.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {imageUrls.map((url, imageIndex) => (
            <div
              key={`${index}-variant-image-${String(imageIndex)}`}
              className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-mds-black-100"
            >
              <Image
                src={url}
                alt={`${imageAltPrefix} ${imageIndex + 1}`}
                fill
                sizes="56px"
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      ) : null}

      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}
