import {
  REVIEW_STATUS_LABELS,
  TenantInviteStatus,
  TenantJourney,
} from '@/lib/enums';
import type { TenantProfile } from '@/types/tenantManagement';
import {
  getReviewStatusBadgeColor,
  type ReviewStatusBadgeColor,
} from '@/utils/reviewStatusBadgeColor';

export type TenantTableStatusSource = 'customerProfileState' | 'identityStatus';

function resolveIdentityStatusBadge(
  row: TenantProfile,
  translate: (key: string) => string,
): { color: ReviewStatusBadgeColor; label: string } {
  const raw = (row.status || row.state || '').toLowerCase().trim();

  if (raw === 'active') {
    return {
      color: 'success',
      label: translate('tenantIdentityStatus.active'),
    };
  }

  if (raw === 'inactive') {
    return {
      color: 'error',
      label: translate('tenantIdentityStatus.inactive'),
    };
  }

  if (!raw) {
    return { color: 'gray', label: '—' };
  }

  return {
    color: 'gray',
    label: raw.charAt(0).toUpperCase() + raw.slice(1),
  };
}

export function resolveTenantTableStatusBadge(
  row: TenantProfile,
  journey: TenantJourney | undefined,
  translate: (key: string) => string,
  statusSource: TenantTableStatusSource = 'customerProfileState',
): { color: ReviewStatusBadgeColor; label: string } {
  if (journey === TenantJourney.INVITED) {
    const inviteAccepted = row.status === TenantInviteStatus.ACCEPTED;
    if (inviteAccepted) {
      return {
        color: 'success',
        label: translate('inviteStatuses.accepted'),
      };
    }
    return {
      color: 'gray',
      label: translate('inviteStatuses.pending'),
    };
  }

  if (statusSource === 'identityStatus') {
    return resolveIdentityStatusBadge(row, translate);
  }

  const state = row.customerProfileState ?? '';
  let label = '';
  if (state && state in REVIEW_STATUS_LABELS) {
    label = REVIEW_STATUS_LABELS[state];
  }

  return {
    color: getReviewStatusBadgeColor(state),
    label,
  };
}
