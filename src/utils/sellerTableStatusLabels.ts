export type OnboardedSellerRowStatusKey = 'active' | 'inactive' | 'suspended';

export function buildOnboardedSellerTableStatusLabels(
  translate: (key: string) => string,
): Record<OnboardedSellerRowStatusKey, string> {
  return {
    active: translate('tenantRowStatus.active'),
    inactive: translate('tenantRowStatus.inactive'),
    suspended: translate('tenantRowStatus.suspended'),
  };
}
