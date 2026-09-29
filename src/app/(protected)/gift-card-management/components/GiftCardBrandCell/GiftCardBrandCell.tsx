'use client';

interface GiftCardBrandCellProps {
  name: string;
  imageInitials: string;
  imageColor: string;
}

export function GiftCardBrandCell({
  name,
  imageInitials,
  imageColor,
}: Readonly<GiftCardBrandCellProps>) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
        style={{ backgroundColor: imageColor }}
        aria-hidden
      >
        {imageInitials}
      </div>
      <span className="truncate text-sm font-medium text-mds-black-900">
        {name}
      </span>
    </div>
  );
}
