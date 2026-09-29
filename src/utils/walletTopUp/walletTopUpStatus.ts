import type { TopUpDisplayStatus } from './walletTopUpTypes';

export function topUpStatusBadgeColor(
  status: TopUpDisplayStatus,
): 'success' | 'primary' | 'error' | 'warning' {
  switch (status) {
    case 'approved':
      return 'success';
    case 'completed':
      return 'primary';
    case 'rejected':
    case 'failed':
      return 'error';
    case 'pending_review':
    case 'cancelled':
    case 'expired':
      return 'warning';
    default:
      return 'warning';
  }
}
