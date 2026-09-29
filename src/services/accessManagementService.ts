import { identityApiClient } from '@/lib/apiClient';
import { AccessUserStatus } from '@/lib/enums';
import { logError } from '@/utils/errorLogger';
import type {
  AdminUser,
  InviteUserRequest,
  UpdateUserRequest,
  PaginatedUsersResponse,
  RoleResponse,
  DomainResponse,
  GetUsersParams,
} from '@/types/accessManagement';
import {
  mapIdentityUserToAdminUser,
  mapIdentityRoleToAdminRole,
  getDomainOptions,
  filterUsersByDomain,
  mapStatusToIdentity,
  type IdentityUserDto,
  type IdentityRoleDto,
  type PaginatedIdentityUsersResponse,
} from '@/utils/identityTransformations';
import { DEFAULT_PLATFORM_NAME } from '@/constants/platform';

/**
 * Get role ID by role name
 * Helper function to convert role name to roleId for invites
 */
const getRoleIdByName = async (roleName: string): Promise<string | null> => {
  try {
    const rolesResponse =
      await identityApiClient.get<IdentityRoleDto[]>('/roles');
    const role = rolesResponse.data.find((r) => r.name === roleName);
    return role?.id || null;
  } catch (error) {
    logError('Error fetching role ID', error);
    return null;
  }
};

/**
 * Invite a new admin user
 */
export const inviteUser = async (
  request: InviteUserRequest,
  tenantId: string,
  inviterUserId: string,
): Promise<AdminUser> => {
  try {
    // Get role ID from role name
    const roleId = await getRoleIdByName(request.role);
    if (!roleId) {
      throw new Error(`Role '${request.role}' not found`);
    }

    // Prepare invite payload for identity service
    const invitePayload = {
      email: request.email,
      name: request.name,
      roleId: roleId,
      tenantId: tenantId,
      status: AccessUserStatus.INVITED,
      metadata: {
        domain: request.domain,
        ...request.metadata,
      },
    };

    const response = await identityApiClient.post<IdentityUserDto>(
      '/auth/invite',
      invitePayload,
      {
        headers: {
          'x-tenant-id': tenantId,
          'x-user-id': inviterUserId,
        },
      },
    );

    return mapIdentityUserToAdminUser(response.data);
  } catch (error) {
    logError('Error inviting user', error);
    throw error;
  }
};

/**
 * Get all admin users with optional filtering
 */
export const getUsers = async (
  params: GetUsersParams = {},
  tenantId: string,
): Promise<PaginatedUsersResponse> => {
  try {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.status) {
      const identityStatus = mapStatusToIdentity(params.status);
      queryParams.append('status', identityStatus);
    }
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `/tenants/${tenantId}/users${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response =
      await identityApiClient.get<PaginatedIdentityUsersResponse>(url);

    let users = response.data.data;

    // Filter by domain (client-side filtering, matching backend behavior)
    if (params.domain) {
      users = filterUsersByDomain(users, params.domain);
    }

    return {
      data: users.map(mapIdentityUserToAdminUser),
      total: params.domain ? users.length : response.data.total,
      page: response.data.page,
      totalPages: params.domain
        ? Math.ceil(users.length / (params.limit || 10))
        : response.data.totalPages,
    };
  } catch (error) {
    logError('Error fetching users', error);
    throw error;
  }
};

/**
 * Get admin user by ID
 */
export const getUserById = async (
  userId: string,
  tenantId: string,
): Promise<AdminUser> => {
  try {
    const response = await identityApiClient.get<IdentityUserDto>(
      `/tenants/${tenantId}/users/${userId}`,
    );
    return mapIdentityUserToAdminUser(response.data);
  } catch (error) {
    logError('Error fetching user', error);
    throw error;
  }
};

/**
 * Assign role to user by role name or role ID. No-op if neither provided.
 */
const assignRoleIfRequested = async (
  userId: string,
  tenantId: string,
  request: UpdateUserRequest,
): Promise<void> => {
  if (!request.role && !request.roleId) return;
  const roleId = request.roleId || (await getRoleIdByName(request.role || ''));
  if (!roleId) return;
  try {
    await identityApiClient.post(
      `/tenants/${tenantId}/users/${userId}/roles/${roleId}`,
      { platformName: DEFAULT_PLATFORM_NAME },
    );
  } catch (error) {
    logError('Failed to assign role to user', error);
  }
};

/**
 * Update admin user.
 */
export const updateUser = async (
  userId: string,
  request: UpdateUserRequest,
  tenantId: string,
): Promise<void> => {
  try {
    const updatePayload: {
      name?: string;
      status?: string;
      metadata?: Record<string, unknown>;
    } = {};

    if (request.name) updatePayload.name = request.name;
    if (request.status)
      updatePayload.status = mapStatusToIdentity(request.status);
    if (request.domain || request.metadata) {
      updatePayload.metadata = {
        ...request.metadata,
        ...(request.domain && { domain: request.domain }),
      };
    }

    const hasUserFieldsToUpdate = Object.keys(updatePayload).length > 0;

    if (hasUserFieldsToUpdate) {
      await identityApiClient.patch<IdentityUserDto>(
        `/tenants/${tenantId}/users/${userId}`,
        updatePayload,
      );
    }
    await assignRoleIfRequested(userId, tenantId, request);
  } catch (error) {
    logError('Error updating user', error);
    throw error;
  }
};

/**
 * Delete admin user
 */
export const deleteUser = async (
  userId: string,
  tenantId: string,
): Promise<void> => {
  try {
    await identityApiClient.delete(`/tenants/${tenantId}/users/${userId}`);
  } catch (error) {
    logError('Error deleting user', error);
    throw error;
  }
};

/**
 * Resend invitation email for an existing user.
 */
export const resendInvite = async (
  userId: string,
  tenantId: string,
): Promise<void> => {
  try {
    await identityApiClient.post(`/tenants/${tenantId}/users/${userId}/invite`);
  } catch (error) {
    logError('Error resending invitation', error);
    throw error;
  }
};

/**
 * Get available roles
 */
export const getRoles = async (): Promise<RoleResponse[]> => {
  try {
    const response = await identityApiClient.get<IdentityRoleDto[]>('/roles');
    return response.data.map(mapIdentityRoleToAdminRole);
  } catch (error) {
    logError('Error fetching roles', error);
    throw error;
  }
};

/**
 * Get available domains (static list)
 */
export const getDomains = async (): Promise<DomainResponse[]> => {
  // Domains are static, no API call needed
  return getDomainOptions();
};
