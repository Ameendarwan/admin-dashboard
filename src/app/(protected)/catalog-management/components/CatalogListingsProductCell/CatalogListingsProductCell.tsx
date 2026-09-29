import Image from 'next/image';

import { cn } from '@/lib/utils';

interface CatalogListingsProductCellProps {
  name: string;
  imageUrl: string;
  imageShape?: 'round' | 'square';
}

export function CatalogListingsProductCell({
  name,
  imageUrl,
  imageShape = 'round',
}: Readonly<CatalogListingsProductCellProps>) {
  return (
    <div className="flex min-w-0 max-w-xs items-center gap-3">
      <div
        className={cn(
          'relative h-11 w-11 shrink-0 overflow-hidden bg-mds-black-100 ring-1 ring-mds-black-100',
          imageShape === 'square' ? 'rounded-lg' : 'rounded-full',
        )}
      >
        <Image
          src={imageUrl}
          alt=""
          width={44}
          height={44}
          className="h-full w-full object-cover"
          unoptimized
        />
      </div>
      <span className="truncate text-[15px] font-medium leading-snug text-mds-black-900">
        {name}
      </span>
    </div>
  );
}
