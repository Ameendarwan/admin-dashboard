import { cn } from '@/lib/utils';
import type { StorefrontStatus } from '@/types/storefrontAdminApi';

type StorefrontDraftLiveBadgeProps = Readonly<{
  status: StorefrontStatus;
  label: string;
  size?: 'sm' | 'md';
}>;

const BADGE_CLASS_BY_SIZE = {
  sm: 'px-2.5 py-1 text-xs font-medium',
  md: 'px-2.5 py-1 text-sm font-semibold',
} as const;

const STATUS_BADGE_CLASS: Record<StorefrontStatus, string> = {
  live: 'bg-mds-success-50 text-mds-success-700',
  draft: 'bg-mds-black-100 text-mds-black-700',
  suspended: 'bg-amber-50 text-amber-800',
};

const STATUS_DOT_CLASS: Record<StorefrontStatus, string> = {
  live: 'bg-mds-success-500',
  draft: 'bg-mds-black-600',
  suspended: 'bg-amber-500',
};

export function StorefrontDraftLiveBadge({
  status,
  label,
  size = 'md',
}: StorefrontDraftLiveBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full',
        BADGE_CLASS_BY_SIZE[size],
        STATUS_BADGE_CLASS[status],
      )}
    >
      <span
        className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT_CLASS[status])}
        aria-hidden
      />
      {label}
    </span>
  );
}
