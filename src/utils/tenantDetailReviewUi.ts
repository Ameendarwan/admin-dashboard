import { ReviewStatus } from '@/lib/enums';

export function tenantStateAllowsKybReviewActions(state: string): boolean {
  return (
    state === ReviewStatus.PENDING_REVIEW ||
    state === ReviewStatus.REVIEW_IN_PROGRESS ||
    state === ReviewStatus.REVISION_REQUESTED
  );
}
