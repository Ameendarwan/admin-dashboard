'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface GiftCardCoverImageProps {
  name: string;
  imageUrl: string | null;
  imageInitials: string;
  imageColor: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  initialsClassName?: string;
}

export function GiftCardCoverImage({
  name,
  imageUrl,
  imageInitials,
  imageColor,
  className = 'h-25 w-40 shrink-0 overflow-hidden rounded-xl',
  imageClassName = 'object-cover',
  sizes = '160px',
  initialsClassName = 'text-xl',
}: Readonly<GiftCardCoverImageProps>) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <div className={`relative ${className}`}>
      {showImage && imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          className={imageClassName}
          sizes={sizes}
          unoptimized
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center font-bold text-white ${initialsClassName}`}
          style={{ backgroundColor: imageColor }}
          aria-hidden
        >
          {imageInitials}
        </div>
      )}
    </div>
  );
}
