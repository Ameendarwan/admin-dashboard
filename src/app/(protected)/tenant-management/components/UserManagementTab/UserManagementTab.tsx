'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Badge, Button, ContentCard, Table, toast } from '@merit-incentives/ui';
import { Plus } from 'lucide-react';

import { ConfirmationPopup } from '@/components/ConfirmationPopup';
import {
  InviteUserDialog,
  EditUserDialog,
} from '@/app/(protected)/access-management/components';
import { useLocalization } from '@/hooks/useLocalization';
import {
  useUsers,
  useInviteUser,
  useUpdateUser,
  useDeleteUser,
  useRoles,
  useDomains,
} from '@/api-queries/accessManagement';
import { useAuth } from '@/app/contexts/auth-context';
import { formatTableDate } from '@/hooks';
import {
  AdminUser,
  Domain,
  Role,
  UserStatus,
  UserStatusFilter,
  UpdateUserRequest,
} from '@/types/accessManagement';
import {
  AccessManagementTableMenuAction,
  ACCESS_USER_STATUS_LABELS,
  AccessUserStatus,
} from '@/lib/enums';

interface UserManagementTabProps {
  tenantId: string;
}

const RESEND_INVITE_SUPPORTED = false;

function isResendInviteEligibleStatus(status: string): boolean {
  return (
    status === AccessUserStatus.INVITED || status === AccessUserStatus.PENDING
  );
}

interface TeamMember {
  id: string;
  memberName: string;
  email: string;
  role: string;
  roleValue: Role;
  domain: string;
  status: string;
  rawStatus: UserStatus;
  dateJoined: string;
}

function createFilterOptions(
  options: Array<{ value: string; label: string }>,
  allLabel: string,
) {
  return [{ value: '', label: allLabel }, ...options];
}

export function UserManagementTab({
  tenantId,
}: Readonly<UserManagementTabProps>) {
  const PAGE_SIZE = 10;
  const { translate } = useLocalization('tenant-details.userManagement');
  const { user: currentUser } = useAuth();

  const [searchValue, setSearchValue] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateJoinedFilter, setDateJoinedFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] =
    useState<TeamMember | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] =
    useState<TeamMember | null>(null);

  const {
    data: usersResponse,
    isLoading,
    refetch,
  } = useUsers(
    {
      page: currentPage,
      limit: PAGE_SIZE,
      search: searchValue || undefined,
      role: (roleFilter || undefined) as Role | undefined,
      status: (statusFilter || undefined) as UserStatusFilter | undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
    tenantId,
  );

  const inviteUserMutation = useInviteUser(tenantId);
  const updateUserMutation = useUpdateUser(tenantId);
  const deleteUserMutation = useDeleteUser(tenantId);
  const { data: rolesData } = useRoles();
  const { data: domainsData } = useDomains();

  const users = useMemo(
    () =>
      (usersResponse?.data || []).map((user: AdminUser) => {
        return {
          id: user.id,
          memberName: user.fullName,
          email: user.email,
          role: user.role,
          roleValue: user.role,
          domain: user.domain,
          status:
            ACCESS_USER_STATUS_LABELS[
              user.status as keyof typeof ACCESS_USER_STATUS_LABELS
            ],
          rawStatus: user.status,
          dateJoined: formatTableDate(user.createdAt),
        };
      }),
    [usersResponse],
  );

  const totalMembers = users.length;
  const activeMembers = users.filter(
    (m) => m.rawStatus === AccessUserStatus.ACTIVE,
  ).length;
  const inactiveMembers = users.filter(
    (m) => m.rawStatus === AccessUserStatus.INACTIVE,
  ).length;

  const filteredMembers = useMemo(() => {
    return users.filter((member) => {
      const matchesDateJoined =
        !dateJoinedFilter || member.dateJoined === dateJoinedFilter;

      return matchesDateJoined;
    });
  }, [users, dateJoinedFilter]);

  const roleOptions = useMemo(
    () =>
      createFilterOptions(
        (rolesData || []).map((role) => ({
          value: role.name,
          label: role.name,
        })),
        translate('filters.allRoles'),
      ),
    [rolesData, translate],
  );

  const statusOptions = useMemo(
    () =>
      createFilterOptions(
        [
          { value: AccessUserStatus.ACTIVE, label: translate('status.active') },
          {
            value: AccessUserStatus.INACTIVE,
            label: translate('status.inactive'),
          },
          { value: AccessUserStatus.INVITED, label: 'Invited' },
          { value: AccessUserStatus.PENDING, label: 'Pending' },
        ],
        translate('filters.allStatuses'),
      ),
    [translate],
  );

  const dateJoinedOptions = useMemo(
    () =>
      createFilterOptions(
        users
          .map((m) => ({ value: m.dateJoined, label: m.dateJoined }))
          .filter(
            (opt, idx, arr) =>
              arr.findIndex((o) => o.value === opt.value) === idx,
          )
          .sort(
            (a, b) => new Date(b.value).getTime() - new Date(a.value).getTime(),
          ),
        translate('filters.allDates'),
      ),
    [users, translate],
  );

  const handleFilterChange = useCallback((filterKey: string, value: string) => {
    switch (filterKey) {
      case 'role':
        setRoleFilter(value);
        setCurrentPage(1);
        break;
      case 'status':
        setStatusFilter(value);
        setCurrentPage(1);
        break;
      case 'dateJoined':
        setDateJoinedFilter(value);
        setCurrentPage(1);
        break;
    }
  }, []);

  const getStatusColor = useCallback(
    (status: string): 'success' | 'warning' | 'gray' => {
      if (status === translate('status.active')) return 'success';
      if (status === 'Invited' || status === 'Pending') return 'warning';
      return 'gray';
    },
    [translate],
  );

  const columns = useMemo(
    () => [
      {
        key: 'memberName' as const,
        label: translate('table.memberName'),
        render: (row: TeamMember) => (
          <div className="font-medium text-mds-black-900">{row.memberName}</div>
        ),
        showOnMobile: true,
      },
      {
        key: 'email' as const,
        label: translate('table.email'),
        render: (row: TeamMember) => (
          <div className="text-mds-black-600">{row.email}</div>
        ),
        showOnMobile: true,
      },
      {
        key: 'role' as const,
        label: translate('table.role'),
        render: (row: TeamMember) => (
          <div className="text-mds-black-900">{row.role}</div>
        ),
        showOnMobile: true,
      },
      {
        key: 'status' as const,
        label: translate('table.status'),
        render: (row: TeamMember) => (
          <div className="flex items-center justify-start">
            <Badge color={getStatusColor(row.status)} leftIcon size="lg">
              {row.status}
            </Badge>
          </div>
        ),
        align: 'center' as const,
        showOnMobile: true,
      },
      {
        key: 'dateJoined' as const,
        label: translate('table.dateJoined'),
        render: (row: TeamMember) => (
          <div className="text-mds-black-600">{row.dateJoined}</div>
        ),
        showOnMobile: true,
      },
    ],
    [translate, getStatusColor],
  );

  const filtersConfig = useMemo(
    () => [
      {
        key: 'role',
        label: translate('filters.role'),
        type: 'dropdown' as const,
        options: roleOptions,
        value: roleFilter,
        placeholder: translate('filters.role'),
      },
      {
        key: 'status',
        label: translate('filters.status'),
        type: 'dropdown' as const,
        options: statusOptions,
        value: statusFilter,
        placeholder: translate('filters.status'),
      },
      {
        key: 'dateJoined',
        label: translate('filters.dateJoined'),
        type: 'dropdown' as const,
        options: dateJoinedOptions,
        value: dateJoinedFilter,
        placeholder: translate('filters.dateJoined'),
      },
      {
        key: 'addUser',
        label: '',
        type: 'dropdown' as const,
        component: (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsInviteDialogOpen(true)}
          >
            {translate('addUser')}
          </Button>
        ),
      },
    ],
    [
      translate,
      roleOptions,
      statusOptions,
      dateJoinedOptions,
      roleFilter,
      statusFilter,
      dateJoinedFilter,
    ],
  );

  const handleRowSelect = useCallback(
    (rowId: string | number, isSelected: boolean) => {
      const id = String(rowId);
      setSelectedRows((prev) =>
        isSelected ? [...prev, id] : prev.filter((r) => r !== id),
      );
    },
    [],
  );

  const handleSelectAll = useCallback(
    (isSelected: boolean) => {
      setSelectedRows(isSelected ? filteredMembers.map((m) => m.id) : []);
    },
    [filteredMembers],
  );

  const getRowMenuOptions = useCallback(
    (user: TeamMember) => [
      {
        value: AccessManagementTableMenuAction.EDIT,
        label: translate('actions.edit'),
      },
      {
        value: AccessManagementTableMenuAction.RESEND_INVITE,
        label: translate('actions.resendInvite'),
        disabled:
          !RESEND_INVITE_SUPPORTED ||
          !isResendInviteEligibleStatus(user.rawStatus),
      },
      {
        value: AccessManagementTableMenuAction.DEACTIVATE,
        label: translate('actions.delete'),
        disabled: currentUser?.userId === user.id,
      },
    ],
    [translate, currentUser?.userId],
  );

  const handleRowMenuSelect = useCallback(
    (optionValue: string, row: TeamMember) => {
      if (
        optionValue === AccessManagementTableMenuAction.DEACTIVATE &&
        currentUser?.userId === row.id
      ) {
        return;
      }
      if (optionValue === AccessManagementTableMenuAction.EDIT) {
        setSelectedUserForEdit(row);
        setIsEditDialogOpen(true);
      }
      if (optionValue === AccessManagementTableMenuAction.RESEND_INVITE) {
        if (!RESEND_INVITE_SUPPORTED) {
          toast.warning(translate('toast.resendInviteNotAvailable'));
          return;
        }
        if (!isResendInviteEligibleStatus(row.rawStatus)) {
          return;
        }
      }
      if (optionValue === AccessManagementTableMenuAction.DEACTIVATE) {
        setSelectedUserForDelete(row);
        setIsDeleteDialogOpen(true);
      }
    },
    [currentUser?.userId, translate],
  );

  const handleInvite = useCallback(
    (fullName: string, email: string, domain: string, role: string) => {
      inviteUserMutation.mutate(
        {
          name: fullName,
          email,
          domain: domain as Domain,
          role: role as Role,
        },
        {
          onSuccess: () => {
            toast.success(translate('toast.inviteSuccess'));
            setIsInviteDialogOpen(false);
            refetch();
          },
          onError: () => {
            toast.error(translate('toast.inviteError'));
          },
        },
      );
    },
    [inviteUserMutation, refetch, translate],
  );

  const handleSaveEditUser = useCallback(
    (
      fullName: string,
      _email: string,
      domain: string,
      role: string,
      status: string,
    ) => {
      if (!selectedUserForEdit) return;

      const request: UpdateUserRequest = {};
      if (fullName !== selectedUserForEdit.memberName) {
        request.name = fullName;
      }
      if (domain !== selectedUserForEdit.domain) {
        request.domain = domain as Domain;
      }
      if (role !== selectedUserForEdit.roleValue) {
        request.role = role as Role;
      }
      const currentStatus =
        selectedUserForEdit.rawStatus === AccessUserStatus.INACTIVE
          ? AccessUserStatus.INACTIVE
          : AccessUserStatus.ACTIVE;
      if (
        status !== currentStatus &&
        (status === AccessUserStatus.ACTIVE ||
          status === AccessUserStatus.INACTIVE)
      ) {
        request.status = status;
      }
      if (Object.keys(request).length === 0) {
        setIsEditDialogOpen(false);
        setSelectedUserForEdit(null);
        return;
      }
      updateUserMutation.mutate(
        {
          userId: selectedUserForEdit.id,
          request,
        },
        {
          onSuccess: () => {
            toast.success(translate('toast.updateSuccess'));
            setIsEditDialogOpen(false);
            setSelectedUserForEdit(null);
            refetch();
          },
          onError: () => {
            toast.error(translate('toast.updateError'));
          },
        },
      );
    },
    [selectedUserForEdit, updateUserMutation, translate, refetch],
  );

  const handleDeleteUser = useCallback(() => {
    if (!selectedUserForDelete) return;

    deleteUserMutation.mutate(selectedUserForDelete.id, {
      onSuccess: () => {
        toast.success(translate('toast.deleteSuccess'));
        setIsDeleteDialogOpen(false);
        setSelectedUserForDelete(null);
        refetch();
      },
      onError: () => {
        toast.error(translate('toast.deleteError'));
      },
    });
  }, [deleteUserMutation, refetch, selectedUserForDelete, translate]);

  const roleDropdownOptions = useMemo(
    () =>
      (rolesData || []).map((item) => ({
        value: item.name,
        label: item.name,
      })),
    [rolesData],
  );

  const domainDropdownOptions = useMemo(
    () =>
      (domainsData || []).map((item) => ({
        value: item.value,
        label: item.label,
      })),
    [domainsData],
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  }, []);

  const handleCloseInviteDialog = useCallback(() => {
    setIsInviteDialogOpen(false);
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setSelectedUserForEdit(null);
  }, []);

  const domainOptions = useMemo(
    () =>
      domainDropdownOptions.length > 0
        ? domainDropdownOptions
        : [{ value: 'ops', label: 'Ops' }],
    [domainDropdownOptions],
  );

  const isLoadingData =
    isLoading ||
    inviteUserMutation.isPending ||
    updateUserMutation.isPending ||
    deleteUserMutation.isPending;

  const mappedRoleOptions = useMemo(
    () =>
      roleDropdownOptions.length > 0
        ? roleDropdownOptions
        : [{ value: 'admin', label: 'Admin' }],
    [roleDropdownOptions],
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ContentCard className="rounded-xl bg-gray-50/80 p-5 shadow-sm">
          <div className="text-sm text-mds-black-600">
            {translate('stats.totalTeamMembers')}
          </div>
          <div className="mt-1 text-2xl font-semibold text-mds-black-900">
            {totalMembers}
          </div>
        </ContentCard>
        <ContentCard className="rounded-xl bg-gray-50/80 p-5 shadow-sm">
          <div className="text-sm text-mds-black-600">
            {translate('stats.activeMembers')}
          </div>
          <div className="mt-1 text-2xl font-semibold text-mds-black-900">
            {activeMembers}
          </div>
        </ContentCard>
        <ContentCard className="rounded-xl bg-gray-50/80 p-5 shadow-sm">
          <div className="text-sm text-mds-black-600">
            {translate('stats.inactiveMembers')}
          </div>
          <div className="mt-1 text-2xl font-semibold text-mds-black-900">
            {inactiveMembers}
          </div>
        </ContentCard>
      </div>

      {/* Team Members table */}
      <ContentCard className="rounded-lg border border-gray-100 p-6 shadow-sm">
        <h2 className="text-[20px] font-medium text-mds-black-900 mb-4">
          {translate('teamMembersTitle')}
        </h2>
        <div className="relative overflow-visible" style={{ zIndex: 10 }}>
          <Table
            className="min-h-[50vh]!"
            columns={columns}
            data={filteredMembers}
            showSearch={true}
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            searchPlaceholder={translate('searchPlaceholder')}
            filtersConfig={filtersConfig}
            onFilterChange={handleFilterChange}
            pagination={{
              currentPage: usersResponse?.page || 1,
              totalPages: usersResponse?.totalPages || 1,
              totalRecords: usersResponse?.total || 0,
              itemsPerPage: PAGE_SIZE,
            }}
            onPageChange={setCurrentPage}
            showPagination={(usersResponse?.totalPages || 1) > 1}
            size="md"
            background="white"
            rounded={true}
            shadow={false}
            showCheckboxes={false}
            selectedRows={selectedRows}
            onRowSelect={handleRowSelect}
            onSelectAll={handleSelectAll}
            getRowId={(row: TeamMember) => row.id}
            showRowMenu={true}
            onRowMenuSelect={handleRowMenuSelect}
            rowMenuOptions={getRowMenuOptions}
            emptyText={translate('emptyText')}
            loading={isLoadingData}
          />
        </div>
      </ContentCard>

      <InviteUserDialog
        isOpen={isInviteDialogOpen}
        onClose={handleCloseInviteDialog}
        onInvite={handleInvite}
        roleOptions={mappedRoleOptions}
        domainOptions={domainOptions}
        isLoading={isLoadingData}
      />

      <EditUserDialog
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onSave={handleSaveEditUser}
        userData={
          selectedUserForEdit
            ? {
                fullName: selectedUserForEdit.memberName,
                email: selectedUserForEdit.email,
                domain: selectedUserForEdit.domain,
                role: selectedUserForEdit.roleValue,
                status:
                  selectedUserForEdit.rawStatus === AccessUserStatus.INACTIVE
                    ? AccessUserStatus.INACTIVE
                    : AccessUserStatus.ACTIVE,
              }
            : null
        }
        roleOptions={mappedRoleOptions}
        domainOptions={domainOptions}
        isLoading={isLoadingData}
      />

      <ConfirmationPopup
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedUserForDelete(null);
        }}
        type="delete"
        title={translate('actions.delete')}
        description={
          selectedUserForDelete
            ? `Delete user ${selectedUserForDelete.memberName}?`
            : 'Delete selected user'
        }
        primaryButton={{
          text: translate('actions.delete'),
          variant: 'negative',
        }}
        secondaryButton={{
          text: translate('cancel'),
          variant: 'secondary',
        }}
        onPrimaryAction={handleDeleteUser}
        onSecondaryAction={() => {
          setIsDeleteDialogOpen(false);
          setSelectedUserForDelete(null);
        }}
      />
    </div>
  );
}
