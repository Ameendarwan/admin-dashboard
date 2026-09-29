import type { SellerDetails } from '@/types/seller';

export type SellerAccountType = 'business' | 'individual';

/**
 * Infers account type from seller profile fields until the API exposes an explicit type.
 * Business: company name or business registration id present.
 */
export function getSellerAccountType(
  details: SellerDetails | undefined,
): SellerAccountType {
  if (!details) return 'individual';
  if (details.companyName?.trim()) return 'business';
  if (details.businessRegistrationId?.trim()) return 'business';
  return 'individual';
}
