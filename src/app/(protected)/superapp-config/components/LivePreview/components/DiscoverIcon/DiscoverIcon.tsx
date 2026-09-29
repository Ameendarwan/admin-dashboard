import Image from 'next/image';

import { cn } from '@/lib/utils';

import type { LivePreviewIcon } from '../../../../hooks';
import { ConditionalLink } from '../ConditionalLink';
import { PreviewHighlightSlot } from '../PreviewHighlightSlot';

interface DiscoverIconProps {
  icon: LivePreviewIcon;
  highlightedKey: string | null;
}

export function DiscoverIcon({
  icon,
  highlightedKey,
}: Readonly<DiscoverIconProps>) {
  const displayLabel = icon.label || icon.title;

  return (
    <PreviewHighlightSlot
      itemKey={icon.key}
      highlightedKey={highlightedKey}
      className="shrink-0 rounded-mds-sm"
    >
      <ConditionalLink
        href={icon.deepLink}
        className="flex flex-col items-center gap-1.5"
      >
        <div
          className={cn(
            'relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-mds-sm',
            !(icon.isUploaded && icon.imagePreview) && 'bg-mds-primary-100',
          )}
        >
          {icon.isUploaded && icon.imagePreview ? (
            <Image
              src={icon.imagePreview}
              alt={displayLabel}
              fill
              className="object-cover"
              unoptimized
            />
          ) : null}
        </div>
        <p className="text-[11px] text-center text-mds-black-900 leading-tight w-16 wrap-break-word">
          {displayLabel}
        </p>
      </ConditionalLink>
    </PreviewHighlightSlot>
  );
}
