import type {
  ActivationRequestItemStatus,
  ActivationRequestStatus,
} from '@/constants/rewards-portal/activationRequestStatus';

/** Sentinel for "no filter" in activation request list UI. */
export const ACTIVATION_REQUEST_LIST_ALL = 'all' as const;

export type ActivationRequestStatusFilter =
  | typeof ACTIVATION_REQUEST_LIST_ALL
  | ActivationRequestStatus;

/** Admin-be activation requests API types (Rewards Portal status passthrough). */

export type ActivationRequestListItemApi = Readonly<{
  id: string;
  tenantId: string;
  tenantName: string;
  businessOwnerEmail: string;
  cardsLabel: string;
  submittedAt: string;
  status: ActivationRequestStatus;
  submittedByUserId: string;
  notes: string | null;
}>;

export type PaginatedActivationRequestsApi = Readonly<{
  data: ActivationRequestListItemApi[];
  total: number;
  limit: number;
  offset: number;
}>;

export type ActivationRequestStatsApi = Readonly<{
  pending: number;
  approved: number;
  rejected: number;
}>;

export type ListActivationRequestsParams = Readonly<{
  tenantId?: string;
  status?: ActivationRequestStatus;
  search?: string;
  limit: number;
  offset: number;
  includeItemCounts?: boolean;
}>;

export type ActivationRequestStatsParams = Readonly<{
  tenantId?: string;
}>;

export type CloseActivationRequestAction =
  | 'APPROVE_ALL_PENDING'
  | 'REJECT_ALL_PENDING';

export type CloseActivationRequestBody = Readonly<{
  action: CloseActivationRequestAction;
  rejectionReason?: string;
  notes?: string;
}>;

export type RejectActivationRequestItemBody = Readonly<{
  rejectionReason: string;
}>;

export type ActivationRequestCatalogProductSnapshotApi = Readonly<{
  id: string;
  title: string;
  thumbnail: string | null;
  brand: { id: string; name: string };
  categories: { id: string; name: string }[];
  variants: ReadonlyArray<Record<string, unknown>>;
  offers: ReadonlyArray<Record<string, unknown>>;
  country?: string | null;
  validity?: string | null;
  denominationPreferred?: ReadonlyArray<number | string> | null;
}>;

export type ActivationRequestItemApi = Readonly<{
  id: string;
  activationRequestId: string;
  catalogProductId: string;
  productType: string;
  forecastedQuantity: number | null;
  status: ActivationRequestItemStatus;
  rejectionReason: string | null;
  resolvedAt: string | null;
  resolvedByUserId: string | null;
  createdAt: string;
  catalogProduct: ActivationRequestCatalogProductSnapshotApi | null;
}>;

export type ActivationRequestDetailApi = Readonly<{
  id: string;
  tenantId: string;
  submittedByUserId: string;
  status: ActivationRequestStatus;
  resolvedAt: string | null;
  resolvedByUserId: string | null;
  notes: string | null;
  pendingCount: number;
  createdAt: string;
  items: ActivationRequestItemApi[];
}>;
