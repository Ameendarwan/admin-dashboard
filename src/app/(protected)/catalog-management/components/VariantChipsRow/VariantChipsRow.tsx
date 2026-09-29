'use client';

import { Badge } from '@merit-incentives/ui';

import type { VariantAttribute } from '@/types/catalog';

interface VariantChipsRowProps {
  readonly tags: readonly VariantAttribute[];
}

export function VariantChipsRow({ tags }: Readonly<VariantChipsRowProps>) {
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <Badge key={`${t.label}-${t.value}`} color="primary" size="sm">
          {t.label}: {t.value}
        </Badge>
      ))}
    </div>
  );
}
