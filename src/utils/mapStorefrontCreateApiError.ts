import { adminApiAxiosMessage } from '@/utils/adminApiAxiosMessage';

export type StorefrontCreateErrorField =
  | 'tenantId'
  | 'storefrontName'
  | 'urlSlug';

export type StorefrontCreateApiError = {
  field?: StorefrontCreateErrorField;
  message: string;
};

const STOREFRONT_REQUEST_FAILED_PREFIX =
  /^Storefront request failed(?: \[[^\]]+\])?:\s*/i;

/** Strips admin-be proxy prefix from storefront-be error text. */
export function trimStorefrontApiErrorMessage(message: string): string {
  return message.replace(STOREFRONT_REQUEST_FAILED_PREFIX, '').trim();
}

export function mapStorefrontCreateApiError(
  error: unknown,
  fallbackMessage: string,
): StorefrontCreateApiError {
  const rawMessage = adminApiAxiosMessage(error, fallbackMessage);
  const message = trimStorefrontApiErrorMessage(rawMessage) || fallbackMessage;
  const lower = message.toLowerCase();

  if (lower.includes('urlslug') || lower.includes('url slug')) {
    return { field: 'urlSlug', message };
  }

  if (lower.includes('already exists')) {
    return { field: 'storefrontName', message };
  }

  return { message };
}
