import type { CertificationStatus } from '@/types/rewards-portal/certificationApi';

export const certificationQueryKeys = {
  all: ['rewards-portal', 'certification'] as const,
  pendingProductionIps: (
    tenantId: string,
    status: CertificationStatus = 'IN_REVIEW',
  ) =>
    [
      ...certificationQueryKeys.all,
      'pending-production-ips',
      tenantId,
      status,
    ] as const,
};
