/**
 * Transformation utilities for Identity Service data
 * Maps Identity Service responses to Admin Portal format
 */

import type {
  AdminUser,
  Role,
  Domain,
  UserStatus,
  RoleResponse,
  DomainResponse,
} from '@/types/accessManagement';

// Identity Service types (matching backend DTOs)
export interface IdentityUserDto {
  id: string;
  email: string;
  name?: string;
  username?: string;
  status: string;
  roles?: IdentityRoleDto[];
  metadata?: Record<string, unknown>;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IdentityRoleDto {
  id: string;
  name: string;
  description?: string;
  platformId?: string;
  metadata?: Record<string, unknown>;
}

export interface PaginatedIdentityUsersResponse {
  data: IdentityUserDto[];
  total: number;
  page: number;
  totalPages: number;
}

// Domain enum values
export enum UserDomain {
  OPS = 'ops',
  FINANCE = 'finance',
  SALES = 'sales',
  MARKETING = 'marketing',
  TECH = 'tech',
  FRAUD = 'fraud',
}

// Domain labels
export const USER_DOMAIN_LABELS: Record<UserDomain, string> = {
  [UserDomain.OPS]: 'Ops',
  [UserDomain.FINANCE]: 'Finance',
  [UserDomain.SALES]: 'Sales',
  [UserDomain.MARKETING]: 'Marketing',
  [UserDomain.TECH]: 'Tech',
  [UserDomain.FRAUD]: 'Fraud',
};

// Role enum values
export enum AccessUserRole {
  ADMIN = 'admin',
  LEAD = 'lead',
  STAFF = 'staff',
}

/**
 * Map Identity Service status to Admin Portal status
 */
const mapStatus = (status: string): UserStatus => {
  switch (status) {
    case 'verified':
      return 'active';
    case 'invited':
      return 'invited';
    case 'pending':
      return 'invited'; // Map pending to invited for display consistency
    case 'inactive':
      return 'inactive';
    default:
      return status as UserStatus;
  }
};

/**
 * Map Admin Portal status to Identity Service status
 */
export const mapStatusToIdentity = (status: string): string => {
  switch (status) {
    case 'active':
      return 'verified';
    case 'inactive':
      return 'inactive';
    case 'invited':
      return 'invited';
    case 'pending':
      return 'pending';
    default:
      return status;
  }
};

/**
 * Transform Identity Service user to Admin Portal user format
 */
export const mapIdentityUserToAdminUser = (
  user: IdentityUserDto,
): AdminUser => {
  const role = user.roles?.[0];
  const domain = user.metadata?.domain as Domain;

  return {
    id: user.id,
    fullName: user.name || user.username || '',
    email: user.email,
    domain: (domain || UserDomain.OPS) as Domain,
    role: (role?.name as Role) || ('staff' as Role),
    roleId: role?.id || '',
    status: mapStatus(user.status),
    lastLogin: user.lastLoginAt || null,
    createdAt: user.createdAt,
    metadata: user.metadata,
  };
};

/**
 * Transform Identity Service roles to Admin Portal roles format
 */
export const mapIdentityRoleToAdminRole = (
  role: IdentityRoleDto,
): RoleResponse => {
  return {
    id: role.id,
    name: role.name as Role,
    metadata: role.metadata,
  };
};

/**
 * Get domain options for dropdowns
 */
export const getDomainOptions = (): DomainResponse[] => {
  return Object.values(UserDomain).map((domain) => ({
    value: domain as Domain,
    label: USER_DOMAIN_LABELS[domain],
  }));
};

/**
 * Filter users by domain (client-side filtering)
 * Note: This matches the backend behavior where domain filtering is done client-side
 */
export const filterUsersByDomain = (
  users: IdentityUserDto[],
  domain: Domain,
): IdentityUserDto[] => {
  return users.filter((user) => (user.metadata?.domain as Domain) === domain);
};
