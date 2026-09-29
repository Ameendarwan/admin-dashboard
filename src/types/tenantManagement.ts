import type { Product, ReviewStatus } from '@/lib/enums';

import type { Attachment, BaseProfile, BaseProfileData } from './shared';

export interface TenantPlatformSettings {
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface Platform {
  id: string;
  name: string;
  description?: string | null;
  alias?: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  TenantPlatform: TenantPlatformSettings;
}

export interface TenantProfile {
  id: string;
  key: string;
  name: string;
  businessName: string;
  metadata: {
    businessOwnerEmail: string;
    businessUrl?: string;
    [key: string]: unknown;
  };
  subDomain: string | null;
  country: string | null;
  accountManager: string | null;
  status: string;
  customerProfileState: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  platforms: Platform[];
  email?: string;
  tenantId?: string;
  state?: string;
}

export interface DetailedTenantProfile extends BaseProfile {
  customerProfileData: TenantProfileData[];
  platforms?: Platform[];
  contracts?: Attachment[];
}

export type TenantProfileData = BaseProfileData;

export interface InviteTenantFormData {
  email: string;
  businessName: string;
  products: Product[];
  country?: string;
  accountManager?: string;
  businessContract?: File;
}

export interface IdentityTenant {
  id: string;
  key: string;
  name: string;
  businessName?: string | null;
  country?: string | null;
  accountManager?: string | null;
  metadata?: Record<string, unknown>;
}

export interface UpdateIdentityTenantPayload {
  businessName: string;
  country?: string;
  accountManager?: string;
}

export interface UpdateIdentityTenantMutationVariables {
  tenantId: string;
  payload: UpdateIdentityTenantPayload;
}

export type {
  Attachment,
  BeneficialOwnerMetadata,
  BusinessDetailsMetadata,
  ComplianceDeclarationsMetadata,
  DirectorMetadata,
} from './shared';
