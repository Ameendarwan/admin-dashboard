import { AxiosError } from 'axios';

export const SESSION_EXPIRED_EVENT = 'merit:session-expired';

export interface SessionExpiredEventDetail {
  redirect?: boolean;
  showToast?: boolean;
}

// Notify the app to run full session expiry logout (handled in auth-context).
export function dispatchSessionExpired(
  options: SessionExpiredEventDetail = {},
): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<SessionExpiredEventDetail>(SESSION_EXPIRED_EVENT, {
      detail: options,
    }),
  );
}

export function isTransientNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return !error.response;
  }
  return false;
}

export function getHttpErrorStatus(error: unknown): number | undefined {
  if (error instanceof AxiosError) {
    return error.response?.status;
  }
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'status' in error.response &&
    typeof error.response.status === 'number'
  ) {
    return error.response.status;
  }
  return undefined;
}
