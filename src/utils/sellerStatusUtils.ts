import { SellerStatus, TenantJourney } from '@/lib/enums';

export type SellerJourney = 'invited' | 'onboarded';

export type SellerStatusColor =
  | 'success'
  | 'error'
  | 'warning'
  | 'primary'
  | 'gray';

export function getSellerStatusColor(
  status: string,
  journey?: SellerJourney,
): SellerStatusColor {
  if (journey === TenantJourney.ONBOARDED) {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'gray';
      case 'suspended':
        return 'error';
      default:
        return 'gray';
    }
  }
  if (status === SellerStatus.INVITE_SENT) return 'gray';
  return 'success';
}
