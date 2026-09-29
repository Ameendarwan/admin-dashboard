import type { AccessManagementInviteError } from '@/types/accessManagement';

export function getInviteErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const e = error as AccessManagementInviteError;
  const fromOriginal =
    e.originalResponse &&
    typeof e.originalResponse === 'object' &&
    'errorCode' in e.originalResponse
      ? (e.originalResponse as { errorCode?: string }).errorCode
      : undefined;
  return (
    e.errorCode || e.response?.data?.errorCode || fromOriginal || undefined
  );
}

export function getInviteErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const e = error as AccessManagementInviteError;
  return e.statusCode ?? e.response?.status;
}
