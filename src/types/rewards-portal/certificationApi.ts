export const CERTIFICATION_STATUS = {
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type CertificationStatus =
  (typeof CERTIFICATION_STATUS)[keyof typeof CERTIFICATION_STATUS];

export type PendingProductionIpRowApi = Readonly<{
  id: string;
  requestId: string;
  ipAddress: string;
  environment: string;
  reason: string | null;
  requestedOn: string;
  status: CertificationStatus;
}>;

export type PaginatedPendingProductionIpsApi = Readonly<{
  data: PendingProductionIpRowApi[];
  total: number;
}>;

export type ListPendingProductionIpsParams = Readonly<{
  tenantId: string;
  status?: CertificationStatus;
}>;

export type DecideProductionIpsBody = Readonly<{
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}>;
