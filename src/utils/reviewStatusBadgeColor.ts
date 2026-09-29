import { ReviewStatus } from '@/lib/enums';

export type ReviewStatusBadgeColor =
  | 'success'
  | 'error'
  | 'warning'
  | 'primary'
  | 'gray';

export function getReviewStatusBadgeColor(
  status: string,
): ReviewStatusBadgeColor {
  switch (status) {
    case ReviewStatus.APPROVED:
      return 'success';
    case ReviewStatus.REJECTED:
      return 'error';
    case ReviewStatus.REVISION_REQUESTED:
    case ReviewStatus.PENDING_REVIEW:
      return 'warning';
    case ReviewStatus.ONBOARDING:
    case ReviewStatus.REVIEW_IN_PROGRESS:
      return 'primary';
    default:
      return 'gray';
  }
}
