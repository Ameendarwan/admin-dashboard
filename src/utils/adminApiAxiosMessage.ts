import { isAxiosError } from 'axios';

type ApiErrorPayload = {
  message?: unknown;
  errorMessage?: unknown;
};

function normalizeApiErrorMessage(message: unknown): string | undefined {
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

/** Reads admin-be / storefront-be error bodies (`errorMessage`, `message`) for toasts. */
export function adminApiAxiosMessage(
  err: unknown,
  fallback = 'Request failed',
): string {
  if (err instanceof Error) {
    const trimmed = err.message.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  if (isAxiosError(err)) {
    const data = err.response?.data as ApiErrorPayload | undefined;
    const message =
      normalizeApiErrorMessage(data?.errorMessage) ??
      normalizeApiErrorMessage(data?.message);
    if (message) {
      return message;
    }
    return err.message || fallback;
  }

  return fallback;
}
