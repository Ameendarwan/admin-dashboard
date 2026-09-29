import { TenantInviteStatus } from '@/lib/enums';

export function canResendTenantInvite(status: string): boolean {
  return status === TenantInviteStatus.PENDING;
}
