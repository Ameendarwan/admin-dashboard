import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getUsers,
  getUserById,
  inviteUser,
  updateUser,
  deleteUser,
  resendInvite,
  getRoles,
  getDomains,
} from '@/services/accessManagementService';
import type {
  GetUsersParams,
  PaginatedUsersResponse,
  InviteUserRequest,
  UpdateUserRequest,
  RoleResponse,
  DomainResponse,
} from '@/types/accessManagement';
import { TIME_10_MIN, TIME_30_MIN } from '@/utils/timeUtils';
import { useAuth } from '@/app/contexts/auth-context';

interface UpdateUserParams {
  userId: string;
  request: UpdateUserRequest;
}

/**
 * Get all admin users with optional filtering
 */
export const useUsers = (
  params: GetUsersParams = {},
  tenantIdOverride?: string,
) => {
  const { user } = useAuth();
  const tenantId = tenantIdOverride || user?.tenantId || '';

  return useQuery({
    queryKey: ['access-management-users', params, tenantId],
    queryFn: () => getUsers(params, tenantId),
    enabled: !!tenantId,
    gcTime: TIME_10_MIN,
    select: (response: PaginatedUsersResponse) =>
      response || { data: [], page: 1, totalPages: 1, total: 0 },
  });
};

/**
 * Get admin user by ID
 */
export const useUserById = (userId: string, tenantIdOverride?: string) => {
  const { user } = useAuth();
  const tenantId = tenantIdOverride || user?.tenantId || '';

  return useQuery({
    queryKey: ['access-management-user', userId, tenantId],
    queryFn: () => getUserById(userId, tenantId),
    enabled: !!userId && !!tenantId,
    gcTime: TIME_10_MIN,
  });
};

/**
 * Invite a new admin user
 */
export const useInviteUser = (tenantIdOverride?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (request: InviteUserRequest) => {
      const tenantId = tenantIdOverride || user?.tenantId || '';
      const inviterUserId = user?.userId || '';
      if (!tenantId || !inviterUserId) {
        throw new Error('User authentication required');
      }
      return inviteUser(request, tenantId, inviterUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-management-users'] });
    },
  });
};

/**
 * Update an admin user
 */
export const useUpdateUser = (tenantIdOverride?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ userId, request }: UpdateUserParams) => {
      const tenantId = tenantIdOverride || user?.tenantId;
      if (!tenantId) {
        throw new Error('User authentication required');
      }
      return updateUser(userId, request, tenantId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['access-management-users'] });
      queryClient.invalidateQueries({
        queryKey: ['access-management-user', variables.userId],
      });
    },
  });
};

/**
 * Delete an admin user
 */
export const useDeleteUser = (tenantIdOverride?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (userId: string) => {
      const tenantId = tenantIdOverride || user?.tenantId;
      if (!tenantId) {
        throw new Error('User authentication required');
      }
      return deleteUser(userId, tenantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-management-users'] });
    },
  });
};

/**
 * Resend invitation email to a pending user
 */
export const useResendInvite = (tenantIdOverride?: string) => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: (userId: string) => {
      const tenantId = tenantIdOverride || user?.tenantId;
      if (!tenantId) {
        throw new Error('User authentication required');
      }
      return resendInvite(userId, tenantId);
    },
  });
};

/**
 * Get available roles for admin dashboard
 */
export const useRoles = () => {
  return useQuery<RoleResponse[]>({
    queryKey: ['access-management-roles'],
    queryFn: getRoles,
    gcTime: TIME_30_MIN,
    staleTime: TIME_30_MIN,
  });
};

/**
 * Get available domains (static list)
 */
export const useDomains = () => {
  return useQuery<DomainResponse[]>({
    queryKey: ['access-management-domains'],
    queryFn: getDomains,
    gcTime: TIME_30_MIN,
    staleTime: TIME_30_MIN,
  });
};
