import { type CSSProperties, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PreviewHighlightSlotProps {
  itemKey: string;
  highlightedKey: string | null;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function PreviewHighlightSlot({
  itemKey,
  highlightedKey,
  className,
  style,
  children,
}: Readonly<PreviewHighlightSlotProps>) {
  const isHighlighted = highlightedKey === itemKey;

  return (
    <div
      className={cn(
        'relative transition-shadow',
        className,
        isHighlighted && 'ring-2 ring-mds-primary-500 ring-offset-2',
      )}
      style={style}
    >
      {children}
    </div>
  );
}
