export const GIFT_CARD_TAB_GIFT_CARDS = 'gift-cards' as const;
export const GIFT_CARD_TAB_ACTIVATION_REQUESTS = 'activation-requests' as const;

export const GIFT_CARD_ROW_MENU = {
  VIEW: 'view',
} as const;

export const GIFT_CARD_PAGE_SIZE = 10;

/** Ecommerce product statuses supported by GET /catalog/products?status=… */
export const GIFT_CARD_PRODUCT_STATUSES = [
  'published',
  'draft',
  'proposed',
  'rejected',
] as const;

export type GiftCardProductStatus = (typeof GIFT_CARD_PRODUCT_STATUSES)[number];

export const GIFT_CARD_STATUS_FILTER_ALL = 'all' as const;

export const ACTIVATION_REJECTION_REASON_KEYS = [
  'notAvailableInRegion',
  'complianceNotMet',
  'commercialTermsNotAgreed',
  'duplicateRequest',
] as const;

export type ActivationRejectionReasonKey =
  (typeof ACTIVATION_REJECTION_REASON_KEYS)[number];

export function isActivationRejectionReasonKey(
  value: string,
): value is ActivationRejectionReasonKey {
  return (ACTIVATION_REJECTION_REASON_KEYS as readonly string[]).includes(
    value,
  );
}

export function getActivationRejectionReasonOptions(
  translate: (key: string, values?: Record<string, string | number>) => string,
): Array<{ value: string; label: string }> {
  return ACTIVATION_REJECTION_REASON_KEYS.map((key) => ({
    value: key,
    label: translate(`giftCardManagement.rejectDialog.reasons.${key}`),
  }));
}
