import { useState, useMemo, useCallback, useRef } from 'react';
import { toast } from '@merit-incentives/ui';

import { useLocalization } from '@/hooks/useLocalization';
import { logError } from '@/utils/errorLogger';
import {
  useUsers,
  useInviteUser,
  useUpdateUser,
  useDeleteUser,
  useResendInvite,
  useRoles,
  useDomains,
} from '@/api-queries/accessManagement';
import { Pagination } from '@/types/pagination';
import { ACCESS_USER_STATUS_LABELS, AccessUserStatus } from '@/lib/enums';
import {
  AccessManagementInviteError,
  AccessManagementUser,
  AdminUser,
  Role,
  Domain,
  UserStatusFilter,
  UpdateUserRequest,
} from '@/types/accessManagement';

import {
  getInviteErrorCode,
  getInviteErrorStatus,
} from '../utils/inviteErrorUtils';

export const useAccessManagement = (pageSize: number = 10) => {
  const { translate } = useLocalization('access-management');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [domainFilter, setDomainFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] =
    useState<AccessManagementUser | null>(null);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [showInviteSuccessPopup, setShowInviteSuccessPopup] = useState(false);
  const [showInviteErrorPopup, setShowInviteErrorPopup] = useState(false);
  const [inviteErrorType, setInviteErrorType] = useState<
    'other_platform' | 'already_in_tenant'
  >('other_platform');
  const [invitedEmail, setInvitedEmail] = useState('');
  const lastInviteEmailRef = useRef('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] =
    useState<AccessManagementUser | null>(null);

  const {
    data: usersResponse,
    isLoading,
    refetch,
  } = useUsers({
    page: currentPage,
    limit: pageSize,
    search: searchValue || undefined,
    role: (roleFilter || undefined) as Role | undefined,
    domain: (domainFilter || undefined) as Domain | undefined,
    status: (statusFilter || undefined) as UserStatusFilter | undefined,
    sortBy: 'createdAt',
    sortOrder,
  });

  const inviteUserMutation = useInviteUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const resendInviteMutation = useResendInvite();
  const { data: rolesData } = useRoles();
  const { data: domainsData } = useDomains();

  const transformedUsers: AccessManagementUser[] = useMemo(() => {
    if (!usersResponse?.data) return [];

    return usersResponse.data.map((user: AdminUser) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      domain: user.domain,
      role: user.role,
      status: user.status,
      lastLogin: user.lastLogin || 'Never',
    }));
  }, [usersResponse]);

  const pagination: Pagination = {
    page: usersResponse?.page || 1,
    totalPages: usersResponse?.totalPages || 1,
    total: usersResponse?.total || 0,
  };

  const handleInviteUser = useCallback(() => {
    setIsInviteDialogOpen(true);
  }, []);

  const handleViewPermissions = useCallback(() => {
    setIsPermissionsDialogOpen(true);
  }, []);

  const handleInvite = useCallback(
    (fullName: string, email: string, domain: string, role: string) => {
      lastInviteEmailRef.current = email;
      inviteUserMutation.mutate(
        {
          name: fullName,
          email,
          domain: domain as Domain,
          role: role as Role,
        },
        {
          onSuccess: () => {
            setInvitedEmail(email);
            setIsInviteDialogOpen(false);
            setShowInviteSuccessPopup(true);
            refetch();
          },
          onError: (error) => {
            const enhancedError = error as AccessManagementInviteError;
            const errorCode = getInviteErrorCode(error);
            const statusCode = getInviteErrorStatus(error);

            const isSameTenantDuplicate =
              errorCode === 'USER_ALREADY_EXISTS' && statusCode === 409;
            const isEmailUsedElsewhere =
              errorCode === 'EMAIL_REGISTERED_IN_ANOTHER_PORTAL' ||
              (errorCode === 'USER_ALREADY_EXISTS' && statusCode !== 409);

            if (isSameTenantDuplicate || isEmailUsedElsewhere) {
              setInvitedEmail(lastInviteEmailRef.current);
              setIsInviteDialogOpen(false);
              setInviteErrorType(
                isSameTenantDuplicate ? 'already_in_tenant' : 'other_platform',
              );
              setShowInviteErrorPopup(true);
            } else {
              logError('Error inviting user', enhancedError);
              const apiMessage =
                enhancedError?.originalResponse &&
                typeof enhancedError.originalResponse === 'object' &&
                'errorMessage' in enhancedError.originalResponse
                  ? String(
                      (
                        enhancedError.originalResponse as {
                          errorMessage?: string;
                        }
                      ).errorMessage || '',
                    )
                  : '';
              toast.error(translate('resendInviteError'), {
                description:
                  apiMessage.trim() ||
                  translate('resendInviteErrorDescription'),
              });
            }
          },
        },
      );
    },
    [inviteUserMutation, refetch, translate],
  );

  const handleUserSelect = useCallback(() => {}, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  }, []);

  const handleRoleFilterChange = useCallback((value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  }, []);

  const handleDomainFilterChange = useCallback((value: string) => {
    setDomainFilter(value);
    setCurrentPage(1);
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((order: 'asc' | 'desc' | null) => {
    if (order) {
      setSortOrder(order);
    }
  }, []);

  const handleCloseInviteDialog = useCallback(() => {
    setIsInviteDialogOpen(false);
  }, []);

  const handleClosePermissionsDialog = useCallback(() => {
    setIsPermissionsDialogOpen(false);
  }, []);

  const handleCloseSuccessPopup = useCallback(() => {
    setShowInviteSuccessPopup(false);
    setInvitedEmail('');
  }, []);

  const handleCloseInviteErrorPopup = useCallback(() => {
    setShowInviteErrorPopup(false);
    setInvitedEmail('');
    setInviteErrorType('other_platform');
  }, []);

  const handleEditUser = useCallback((user: AccessManagementUser) => {
    setSelectedUserForEdit(user);
    setIsEditDialogOpen(true);
  }, []);

  const handleSaveEditUser = useCallback(
    (
      fullName: string,
      _email: string,
      domain: string,
      role: string,
      status: string,
    ) => {
      if (!selectedUserForEdit) return;

      const updateRequest: UpdateUserRequest = {};
      if (fullName !== selectedUserForEdit.fullName) {
        updateRequest.name = fullName;
      }
      if (domain !== selectedUserForEdit.domain) {
        updateRequest.domain = domain as Domain;
      }
      if (role !== selectedUserForEdit.role) {
        updateRequest.role = role as Role;
      }
      if (status !== selectedUserForEdit.status) {
        updateRequest.status = status as 'active' | 'inactive';
      }

      updateUserMutation.mutate(
        {
          userId: selectedUserForEdit.id,
          request: updateRequest,
        },
        {
          onSuccess: () => {
            setIsEditDialogOpen(false);
            setSelectedUserForEdit(null);
            refetch();
            toast.success(translate('userUpdateSuccess'), {
              description: translate('userUpdateSuccessDescription'),
            });
          },
          onError: (error) => {
            logError('Error updating user', error);
            toast.error(translate('userUpdateError'), {
              description: translate('userUpdateErrorDescription'),
            });
          },
        },
      );
    },
    [selectedUserForEdit, updateUserMutation, refetch, translate],
  );

  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setSelectedUserForEdit(null);
  }, []);

  const handleDeleteUser = useCallback((user: AccessManagementUser) => {
    setSelectedUserForDelete(user);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!selectedUserForDelete) return;

    deleteUserMutation.mutate(selectedUserForDelete.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setSelectedUserForDelete(null);
        refetch();
        toast.success(translate('deleteUser'));
      },
      onError: (error) => {
        logError('Error deleting user', error);
        toast.error(translate('resendInviteError'), {
          description: translate('resendInviteErrorDescription'),
        });
      },
    });
  }, [selectedUserForDelete, deleteUserMutation, refetch, translate]);

  const handleCloseDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setSelectedUserForDelete(null);
  }, []);

  const handleResendInvite = useCallback(
    (user: AccessManagementUser) => {
      resendInviteMutation.mutate(user.id, {
        onSuccess: () => {
          refetch();
          toast.success(translate('resendInviteSuccess'), {
            description: translate('resendInviteSuccessDescription'),
          });
        },
        onError: (error) => {
          logError('Error resending invitation', error);
          toast.error(translate('resendInviteError'), {
            description: translate('resendInviteErrorDescription'),
          });
        },
      });
    },
    [resendInviteMutation, refetch, translate],
  );

  const domainOptions = useMemo(
    () =>
      domainsData?.map((d) => ({
        value: d.value,
        label: d.label,
      })) || [],
    [domainsData],
  );

  const roleOptions = useMemo(() => {
    if (!rolesData) return [];

    const allowedRoles: Role[] = ['admin', 'lead', 'staff'];
    const roleMap = new Map<Role, (typeof rolesData)[0]>(
      rolesData
        .filter((r): r is (typeof rolesData)[0] & { name: Role } =>
          allowedRoles.includes(r.name as Role),
        )
        .map((r) => [r.name as Role, r]),
    );

    return allowedRoles
      .filter((roleName) => roleMap.has(roleName))
      .map((roleName) => {
        const role = roleMap.get(roleName)!;
        return {
          value: role.name,
          label: role.name.charAt(0).toUpperCase() + role.name.slice(1),
        };
      });
  }, [rolesData]);

  const statusOptions = useMemo(
    () =>
      [
        AccessUserStatus.ACTIVE,
        AccessUserStatus.INACTIVE,
        AccessUserStatus.INVITED,
      ].map((value) => ({
        value,
        label: ACCESS_USER_STATUS_LABELS[value],
      })),
    [],
  );

  return {
    users: transformedUsers,
    pagination,
    isLoading:
      isLoading ||
      inviteUserMutation.isPending ||
      updateUserMutation.isPending ||
      deleteUserMutation.isPending ||
      resendInviteMutation.isPending,
    sortOrder,
    isInviteDialogOpen,
    isEditDialogOpen,
    selectedUserForEdit,
    isPermissionsDialogOpen,
    showInviteSuccessPopup,
    showInviteErrorPopup,
    inviteErrorType,
    invitedEmail,
    isDeleteDialogOpen,
    selectedUserForDelete,
    domainOptions,
    roleOptions,
    statusOptions,
    handleInviteUser,
    handleEditUser,
    handleSaveEditUser,
    handleDeleteUser,
    handleConfirmDelete,
    handleViewPermissions,
    handleInvite,
    handleUserSelect,
    handlePageChange,
    handleSearchChange,
    handleRoleFilterChange,
    handleDomainFilterChange,
    handleStatusFilterChange,
    handleSortChange,
    handleCloseInviteDialog,
    handleCloseEditDialog,
    handleCloseDeleteDialog,
    handleClosePermissionsDialog,
    handleCloseSuccessPopup,
    handleCloseInviteErrorPopup,
    handleResendInvite,
  };
};

interface Option {
  value: string;
  label: string;
}

export function createFilterOptions(
  baseOptions: Option[],
  allLabel: string,
): Option[] {
  return [{ value: '', label: allLabel }, ...baseOptions];
}
