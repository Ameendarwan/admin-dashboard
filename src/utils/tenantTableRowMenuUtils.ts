import { ReviewStatus, TenantsTableMenuAction } from '@/lib/enums';
import type { TenantProfile } from '@/types/tenantManagement';
import { canResendTenantInvite } from '@/utils/tenantInviteStatusUtils';

export type TenantRowMenuOption = { value: string; label: string };

export type InvitedTenantResendMenuFields = {
  value: string;
  label: string;
  disabled: boolean;
};

export function getInvitedTenantResendMenuFields(
  row: TenantProfile,
  translate: (key: string) => string,
): InvitedTenantResendMenuFields {
  return {
    value: TenantsTableMenuAction.RESEND_INVITE,
    label: translate('table.resendInvite'),
    disabled: !canResendTenantInvite(row.status),
  };
}

export function buildOnboardedTenantRowMenuOptions(
  row: TenantProfile,
  translate: (key: string) => string,
  options?: { allowOnboardingActions?: boolean },
): TenantRowMenuOption[] {
  const view: TenantRowMenuOption = {
    value: TenantsTableMenuAction.VIEW_DETAILS,
    label: translate('table.viewDetails'),
  };
  const requestRevision: TenantRowMenuOption = {
    value: TenantsTableMenuAction.REQUEST_REVISION,
    label: translate('table.requestRevision'),
  };
  const approve: TenantRowMenuOption = {
    value: TenantsTableMenuAction.APPROVE,
    label: translate('table.approve'),
  };
  const reject: TenantRowMenuOption = {
    value: TenantsTableMenuAction.REJECT,
    label: translate('table.reject'),
  };

  const state = row.customerProfileState;

  switch (state) {
    case ReviewStatus.ONBOARDING:
      return options?.allowOnboardingActions ? [view] : [];
    case ReviewStatus.APPROVED:
      return [view];
    case ReviewStatus.REJECTED:
      return [view, requestRevision, approve];
    case ReviewStatus.PENDING_REVIEW:
    case ReviewStatus.REVISION_REQUESTED:
    case ReviewStatus.REVIEW_IN_PROGRESS:
      return [view, requestRevision, approve, reject];
    default:
      return [view];
  }
}
