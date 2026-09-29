import { isAxiosError } from 'axios';

type ApiErrorPayload = {
  message?: unknown;
  errorMessage?: unknown;
};

/** Normalizes Nest ValidationPipe / GlobalExceptionFilter error bodies for toasts. */
export function normalizeApiErrorMessage(message: unknown): string | undefined {
  if (typeof message === 'string') {
    const trimmed = message.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (Array.isArray(message)) {
    const parts = message
      .filter((part): part is string => typeof part === 'string')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
    return parts.length > 0 ? parts.join(' ') : undefined;
  }

  return undefined;
}

export function subscriptionsAdminAxiosMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as ApiErrorPayload | undefined;
    const message =
      normalizeApiErrorMessage(data?.errorMessage) ??
      normalizeApiErrorMessage(data?.message);
    if (message) {
      return message;
    }
    return err.message || 'Request failed';
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Request failed';
}
