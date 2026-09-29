/** Rewards Portal activation request statuses — must match rewards-portal-be enum. */
export const ACTIVATION_REQUEST_STATUSES = [
  'PENDING',
  'PROCESSING',
  'PARTIALLY_APPROVED',
  'APPROVED',
  'REJECTED',
] as const;

export type ActivationRequestStatus =
  (typeof ACTIVATION_REQUEST_STATUSES)[number];

export const TERMINAL_ACTIVATION_REQUEST_STATUSES =
  new Set<ActivationRequestStatus>([
    'APPROVED',
    'PARTIALLY_APPROVED',
    'REJECTED',
  ]);

export const ACTIVATION_REQUEST_ITEM_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
] as const;

export type ActivationRequestItemStatus =
  (typeof ACTIVATION_REQUEST_ITEM_STATUSES)[number];

export function isTerminalActivationRequestStatus(
  status: ActivationRequestStatus,
): boolean {
  return TERMINAL_ACTIVATION_REQUEST_STATUSES.has(status);
}
