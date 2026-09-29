export interface UserRoleData {
  id: string;
  email: string;
  fullName: string;
  name?: string;
  roles: Array<{
    id: string;
    name: string;
    platformId: string;
  }>;
  status: UserStatus;
  lastLoginAt: string;
}

export enum UserRole {
  ADMIN = 'admin',
  LOYALTY_MANAGER = 'loyalty_manager',
  CUSTOMER_SUPPORT = 'customer_support',
  FINANCE = 'finance',
  DEVELOPER = 'developer',
  READ_ONLY = 'read_only',
}

export enum UserStatus {
  INVITED = 'invited',
  VERIFIED = 'verified',
  PENDING = 'pending',
  REVOKED = 'revoked',
}
