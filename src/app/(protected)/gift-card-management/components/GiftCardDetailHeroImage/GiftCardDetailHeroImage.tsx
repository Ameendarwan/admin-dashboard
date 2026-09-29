'use client';

import { GiftCardCoverImage } from '../GiftCardCoverImage';

interface GiftCardDetailHeroImageProps {
  name: string;
  imageUrl: string | null;
  imageInitials: string;
  imageColor: string;
}

export function GiftCardDetailHeroImage({
  name,
  imageUrl,
  imageInitials,
  imageColor,
}: Readonly<GiftCardDetailHeroImageProps>) {
  return (
    <GiftCardCoverImage
      name={name}
      imageUrl={imageUrl}
      imageInitials={imageInitials}
      imageColor={imageColor}
      className="h-38 w-full shrink-0 overflow-hidden rounded-lg lg:h-auto lg:min-h-38 lg:w-38 lg:self-stretch"
      imageClassName="object-contain lg:object-cover"
      sizes="(max-width: 1023px) 100vw, 152px"
      initialsClassName="text-2xl"
    />
  );
}
