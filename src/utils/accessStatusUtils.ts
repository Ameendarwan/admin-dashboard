import { AccessUserStatus } from '@/lib/enums';

export type AccessUserStatusColor =
  | 'success'
  | 'warning'
  | 'gray'
  | 'error'
  | 'primary';

/**
 * Maps access management user status to badge color.
 */
export function getAccessUserStatusColor(
  status: string,
): AccessUserStatusColor {
  switch (status) {
    case AccessUserStatus.ACTIVE:
      return 'success';
    case AccessUserStatus.INVITED:
    case AccessUserStatus.PENDING:
      return 'warning';
    case AccessUserStatus.INACTIVE:
      return 'gray';
    default:
      return 'gray';
  }
}
