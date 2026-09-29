import Image from 'next/image';

import type { MediaItemData } from '@/types/superApp';
import { cn } from '@/lib/utils';

import {
  getBannerAspectRatio,
  type PromoBannerKey,
} from '../../../../constants';
import { ConditionalLink } from '../ConditionalLink';
import { PreviewHighlightSlot } from '../PreviewHighlightSlot';

interface PreviewBannerProps {
  itemKey: PromoBannerKey;
  banner?: MediaItemData;
  highlightedKey: string | null;
  className?: string;
  alt: string;
}

export function PreviewBanner({
  itemKey,
  banner,
  highlightedKey,
  className,
  alt,
}: Readonly<PreviewBannerProps>) {
  return (
    <PreviewHighlightSlot
      itemKey={itemKey}
      highlightedKey={highlightedKey}
      className={cn('overflow-hidden rounded-[16px] mt-1', className)}
      style={{ aspectRatio: getBannerAspectRatio(itemKey) }}
    >
      {banner?.isUploaded && banner.imagePreview ? (
        <ConditionalLink
          href={banner.deepLink}
          className="block relative h-full"
        >
          <Image
            src={banner.imagePreview}
            alt={alt}
            fill
            className="object-cover"
            unoptimized
          />
        </ConditionalLink>
      ) : (
        <div className="h-full bg-mds-gray-200" />
      )}
    </PreviewHighlightSlot>
  );
}
