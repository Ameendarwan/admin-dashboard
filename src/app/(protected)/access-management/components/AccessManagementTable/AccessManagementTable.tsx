'use client';

import { Table } from '@merit-incentives/ui';
import React from 'react';

import type { Pagination } from '@/types/pagination';
import { useLocalization } from '@/hooks/useLocalization';
import type { AccessManagementUser } from '@/types/accessManagement';
import { useAuth } from '@/app/contexts/auth-context';

import { useAccessManagementTable } from '../../hooks';

interface AccessManagementTableProps {
  users: AccessManagementUser[];
  onUserSelect: (user: AccessManagementUser) => void;
  onEditUser?: (user: AccessManagementUser) => void;
  onDeleteUser?: (user: AccessManagementUser) => void;
  onResendInvite?: (user: AccessManagementUser) => void;
  onPageChange: (page: number) => void;
  pagination: Pagination;
  loadingRowId?: string | null;
  onSearchChange?: (value: string) => void;
  onRoleFilterChange?: (value: string) => void;
  onDomainFilterChange?: (value: string) => void;
  onStatusFilterChange?: (value: string) => void;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (order: 'asc' | 'desc' | null) => void;
  loading?: boolean;
  domainOptions: Array<{ value: string; label: string }>;
  roleOptions: Array<{ value: string; label: string }>;
  statusOptions: Array<{ value: string; label: string }>;
  createFilterOptions: (
    baseOptions: Array<{ value: string; label: string }>,
    allLabel: string,
  ) => Array<{ value: string; label: string }>;
}

export function AccessManagementTable({
  users,
  onUserSelect,
  onEditUser,
  onDeleteUser,
  onResendInvite,
  onPageChange,
  pagination,
  onSearchChange,
  onRoleFilterChange,
  onDomainFilterChange,
  onStatusFilterChange,
  sortOrder: externalSortOrder = 'desc',
  onSortChange,
  loading,
  domainOptions: baseDomainOptions,
  roleOptions: baseRoleOptions,
  statusOptions: baseStatusOptions,
  createFilterOptions,
}: Readonly<AccessManagementTableProps>) {
  const { translate } = useLocalization('access-management');
  const { user: currentUser } = useAuth();

  const {
    searchValue,
    handleSearchChange,
    selectedRows,
    handleRowSelect,
    handleSelectAll,
    getRowMenuOptions,
    handleRowMenuSelect,
    columns,
    filtersConfig,
    handleFilterChange,
  } = useAccessManagementTable({
    onSearchChange,
    onRoleFilterChange,
    onDomainFilterChange,
    onStatusFilterChange,
    sortOrder: externalSortOrder,
    onSortChange,
    translate,
    domainOptions: baseDomainOptions,
    roleOptions: baseRoleOptions,
    statusOptions: baseStatusOptions,
    createFilterOptions,
    onEditUser,
    onDeleteUser,
    onResendInvite,
    currentUserId: currentUser?.userId,
  });

  return (
    <div className="relative overflow-visible" style={{ zIndex: 10 }}>
      <Table
        className="min-h-[50vh]!"
        columns={columns}
        data={users}
        showSearch={true}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        filtersConfig={filtersConfig}
        onFilterChange={handleFilterChange}
        pagination={{
          currentPage: pagination.page,
          totalPages: pagination.totalPages,
          totalRecords: pagination.total,
          itemsPerPage: 10,
        }}
        onPageChange={onPageChange}
        showPagination={true}
        size="md"
        background="white"
        rounded={true}
        shadow={true}
        showCheckboxes={false}
        selectedRows={selectedRows}
        onRowSelect={handleRowSelect}
        onSelectAll={handleSelectAll}
        getRowId={(row: AccessManagementUser) => row.id}
        showRowMenu={true}
        onRowMenuSelect={(optionValue, row) =>
          handleRowMenuSelect(optionValue, row as AccessManagementUser)
        }
        rowMenuOptions={getRowMenuOptions}
        onRowClick={onUserSelect}
        emptyText={translate('noUsersFound')}
        loading={loading}
      />
    </div>
  );
}
