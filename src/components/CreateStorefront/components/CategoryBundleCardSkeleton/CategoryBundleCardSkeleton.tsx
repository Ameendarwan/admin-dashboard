const SKELETON_CARD_CLASS =
  'flex items-start gap-3 rounded-xl border border-mds-black-100 bg-mds-primary-50/40 px-4 py-4';

export function CategoryBundleCardSkeleton() {
  return (
    <div className={SKELETON_CARD_CLASS} aria-hidden="true">
      <div className="mt-0.5 h-5 w-5 shrink-0 animate-pulse rounded bg-mds-black-100" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-3/4 max-w-[180px] animate-pulse rounded bg-mds-black-100" />
        <div className="h-3.5 w-1/3 max-w-[120px] animate-pulse rounded bg-mds-black-100" />
      </div>
    </div>
  );
}

const CATEGORY_BUNDLE_SKELETON_KEYS = [
  'category-bundle-skeleton-a',
  'category-bundle-skeleton-b',
  'category-bundle-skeleton-c',
  'category-bundle-skeleton-d',
  'category-bundle-skeleton-e',
  'category-bundle-skeleton-f',
  'category-bundle-skeleton-g',
  'category-bundle-skeleton-h',
  'category-bundle-skeleton-i',
] as const;

type CategoryBundleGridSkeletonProps = Readonly<{
  count?: number;
}>;

export function CategoryBundleGridSkeleton({
  count = 9,
}: CategoryBundleGridSkeletonProps) {
  return (
    <>
      {CATEGORY_BUNDLE_SKELETON_KEYS.slice(0, count).map((key) => (
        <CategoryBundleCardSkeleton key={key} />
      ))}
    </>
  );
}

export function CategoryBundlesToolbarSkeleton() {
  return (
    <div className="mb-4 flex shrink-0" aria-hidden="true">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 animate-pulse rounded bg-mds-black-100" />
        <div className="h-4 w-20 animate-pulse rounded bg-mds-black-100" />
      </div>
    </div>
  );
}
