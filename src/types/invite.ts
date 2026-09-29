import { TenantInviteStatus } from '@/lib/enums';

import { TenantMetadata } from './tenant';

export interface SellerMetadata {
  supplierId?: string;
  businessRegistrationId?: string;
  shippingProvider?: string;
  tenantId?: string;
}

export interface CreateInviteRequest {
  invitedBy: string;
  email: string;
  tenantName: string;
  platforms: string[];
  status: TenantInviteStatus;
  metadata?: TenantMetadata | SellerMetadata | Record<string, unknown> | null;
  country?: string;
  accountManager?: string;
}

export interface CreateInviteResponse {
  id: string;
  invitedBy: string;
  email: string;
  tenantName: string;
  platforms: string[];
  status: string;
  invitationToken?: string;
  metadata?: TenantMetadata | SellerMetadata | Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvitesResponse {
  data: CreateInviteResponse[];
  page: number;
  totalPages: number;
  total: number;
}

export interface MappedSellerInvite extends CreateInviteResponse {
  name: string;
  businessName: string;
  state: string;
}
