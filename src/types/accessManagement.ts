import * as z from 'zod';
import { useForm } from 'react-hook-form';

import {
  createUserFormSchema,
  createEditUserFormSchema,
} from '@/utils/formSchemas';

// API Types
export type Role = 'admin' | 'lead' | 'staff';
export type Domain =
  | 'ops'
  | 'finance'
  | 'sales'
  | 'marketing'
  | 'tech'
  | 'fraud';
export type UserStatus = 'invited' | 'active' | 'inactive';
export type UserStatusFilter = 'invited' | 'active' | 'inactive';

export type AccessManagementInviteError = Error & {
  errorCode?: string;
  statusCode?: number;
  response?: { data?: { errorCode?: string }; status?: number };
  originalResponse?: { errorCode?: string; errorMessage?: string };
};

// API Request Types
export interface InviteUserRequest {
  name: string;
  email: string;
  role: Role;
  domain: Domain;
  metadata?: Record<string, unknown>;
}

export interface UpdateUserRequest {
  name?: string;
  role?: Role;
  domain?: Domain;
  status?: 'active' | 'inactive';
  roleId?: string;
  metadata?: Record<string, unknown>;
}

export interface GetUsersParams {
  search?: string;
  role?: Role;
  domain?: Domain;
  status?: UserStatusFilter;
  sortBy?:
    | 'name'
    | 'email'
    | 'username'
    | 'status'
    | 'createdAt'
    | 'updatedAt'
    | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// API Response Types
export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  domain: Domain;
  role: Role;
  roleId: string;
  status: UserStatus;
  lastLogin: string | null;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface PaginatedUsersResponse {
  data: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}

export interface RoleResponse {
  id: string;
  name: Role;
  metadata?: Record<string, unknown>;
}

export interface DomainResponse {
  value: Domain;
  label: string;
}

// Legacy Types (for UI compatibility)
export interface AccessManagementUser {
  id: string;
  fullName: string;
  email: string;
  domain: string;
  role: string;
  status: string;
  lastLogin: string;
}

// Permission model
export interface Permission {
  key: string;
  admin: boolean;
  lead: boolean;
  staff: boolean;
}

// User data for editing
export interface UserData {
  fullName: string;
  email: string;
  domain: string;
  role: string;
  status: 'active' | 'inactive';
}

// Form types
export type InviteUserFormData = z.infer<
  ReturnType<typeof createUserFormSchema>
>;
export type EditUserFormData = z.infer<
  ReturnType<typeof createEditUserFormSchema>
>;

// Dialog props
export interface InviteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (
    fullName: string,
    email: string,
    domain: string,
    role: string,
  ) => void;
  roleOptions: Array<{ value: string; label: string }>;
  domainOptions: Array<{ value: string; label: string }>;
  isLoading?: boolean;
}

export interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    fullName: string,
    email: string,
    domain: string,
    role: string,
    status: string,
  ) => void;
  userData: UserData | null;
  roleOptions: Array<{ value: string; label: string }>;
  domainOptions: Array<{ value: string; label: string }>;
  isLoading?: boolean;
}

export interface PermissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Form fields props
export interface InviteUserFormFieldsProps {
  translate: (key: string) => string;
  register: ReturnType<typeof useForm<InviteUserFormData>>['register'];
  errors: ReturnType<typeof useForm<InviteUserFormData>>['formState']['errors'];
  roleOptions: Array<{ value: string; label: string }>;
  domainOptions: Array<{ value: string; label: string }>;
  role: string | undefined;
  domain: string | undefined;
  setValue: ReturnType<typeof useForm<InviteUserFormData>>['setValue'];
}
