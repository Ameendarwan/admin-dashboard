import type { SellerDetails } from '@/types/seller';

export function getSellerAccountStatusForUi(
  sellerDetails: SellerDetails | undefined,
): string | undefined {
  const raw = sellerDetails?.status;
  if (raw?.toLowerCase() === 'active') {
    return 'accepted';
  }
  if (raw != null) {
    return raw;
  }
  if (sellerDetails?.onboarded) {
    return 'accepted';
  }
  return undefined;
}
