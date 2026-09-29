import type { BadgeColor } from '@merit-incentives/ui';

import { ReviewStatus } from '@/lib/enums';

export type TenantSummaryStatusBadgeColor = Extract<
  BadgeColor,
  'success' | 'warning' | 'error' | 'gray' | 'primary'
>;

export function getTenantSummaryStatusLabelAndColor(
  state: string | undefined,
  translate: (key: string) => string,
): {
  label: string;
  color: TenantSummaryStatusBadgeColor;
} {
  const normalized = state?.toLowerCase().trim();

  switch (normalized) {
    case 'active':
    case ReviewStatus.APPROVED:
      return { label: translate('summary.active'), color: 'success' };
    case 'inactive':
      return { label: translate('summary.inactive'), color: 'gray' };
    case ReviewStatus.PENDING_REVIEW:
      return { label: translate('summary.pendingReview'), color: 'warning' };
    case ReviewStatus.REVIEW_IN_PROGRESS:
      return {
        label: translate('summary.reviewInProgress'),
        color: 'primary',
      };
    case ReviewStatus.REVISION_REQUESTED:
      return {
        label: translate('summary.revisionRequested'),
        color: 'warning',
      };
    case ReviewStatus.REJECTED:
      return { label: translate('summary.rejected'), color: 'error' };
    case ReviewStatus.ONBOARDING:
      return { label: translate('summary.onboarding'), color: 'gray' };
    default:
      return { label: state || '—', color: 'gray' };
  }
}
