import React, { useCallback, useMemo, useState } from 'react';
import { Badge } from '@merit-incentives/ui';
import { Pencil, Trash2, Send } from 'lucide-react';

import {
  AccessUserStatus,
  USER_DOMAIN_LABELS,
  ACCESS_USER_ROLE_LABELS,
  ACCESS_USER_STATUS_LABELS,
  AccessManagementTableMenuAction,
} from '@/lib/enums';
import { getAccessUserStatusColor } from '@/utils/accessStatusUtils';
import type { AccessManagementUser } from '@/types/accessManagement';
import { ColumnSettingsButton, SortButton } from '@/components';
import { useAuth } from '@/app/contexts/auth-context';
import {
  useTableRowSelection,
  useColumnVisibility,
  useTableSort,
  formatTableDate,
  renderTableTextCell,
} from '@/hooks';

interface UseAccessManagementTableProps {
  onSearchChange?: (value: string) => void;
  onRoleFilterChange?: (value: string) => void;
  onDomainFilterChange?: (value: string) => void;
  onStatusFilterChange?: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortChange?: (order: 'asc' | 'desc' | null) => void;
  translate: (key: string) => string;
  domainOptions: Array<{ value: string; label: string }>;
  roleOptions: Array<{ value: string; label: string }>;
  statusOptions: Array<{ value: string; label: string }>;
  createFilterOptions: (
    baseOptions: Array<{ value: string; label: string }>,
    allLabel: string,
  ) => Array<{ value: string; label: string }>;
  onEditUser?: (user: AccessManagementUser) => void;
  onDeleteUser?: (user: AccessManagementUser) => void;
  onResendInvite?: (user: AccessManagementUser) => void;
  currentUserId?: string;
}

export function useAccessManagementTable({
  onSearchChange,
  onRoleFilterChange,
  onDomainFilterChange,
  onStatusFilterChange,
  sortOrder,
  onSortChange,
  translate,
  domainOptions: baseDomainOptions,
  roleOptions: baseRoleOptions,
  statusOptions: baseStatusOptions,
  createFilterOptions,
  onEditUser,
  onDeleteUser,
  onResendInvite,
  currentUserId,
}: UseAccessManagementTableProps) {
  const { user: currentUser } = useAuth();

  // Shared table features
  const { selectedRows, handleRowSelect, handleSelectAll } =
    useTableRowSelection();
  const { visibleColumns, toggleColumnVisibility } = useColumnVisibility({
    fullName: true,
    email: true,
    domain: true,
    role: true,
    status: true,
    lastLogin: true,
  });
  const { handleSortToggle } = useTableSort(sortOrder, onSortChange);

  // Local state for table features
  const [searchValue, setSearchValue] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [domainFilter, setDomainFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Memoized filter options with 'All' prefix
  const roleOptions = useMemo(
    () => createFilterOptions(baseRoleOptions, translate('table.role')),
    [baseRoleOptions, createFilterOptions, translate],
  );

  const domainOptions = useMemo(
    () => createFilterOptions(baseDomainOptions, translate('domain')),
    [baseDomainOptions, createFilterOptions, translate],
  );

  const statusOptions = useMemo(
    () => createFilterOptions(baseStatusOptions, translate('status')),
    [baseStatusOptions, createFilterOptions, translate],
  );

  // Column options for visibility settings
  const columnOptions = useMemo(
    () => [
      { key: 'fullName', label: translate('table.fullName') },
      { key: 'email', label: translate('table.email') },
      { key: 'domain', label: translate('table.domain') },
      { key: 'role', label: translate('table.role') },
      { key: 'status', label: translate('table.status') },
      { key: 'lastLogin', label: translate('table.lastLogin') },
    ],
    [translate],
  );

  // Row menu options - function that returns options per row with disabled state
  const getRowMenuOptions = useCallback(
    (user: AccessManagementUser) => {
      const isCurrentUser = currentUser?.userId === user.id;
      const isInvited =
        user.status === AccessUserStatus.INVITED ||
        user.status === AccessUserStatus.PENDING;

      return [
        {
          value: AccessManagementTableMenuAction.EDIT,
          label: translate('table.edit'),
          icon: <Pencil className="w-4 h-4" />,
        },
        {
          value: AccessManagementTableMenuAction.RESEND_INVITE,
          label: translate('table.resendInvite'),
          icon: <Send className="w-4 h-4" />,
          disabled: !isInvited,
        },
        {
          value: AccessManagementTableMenuAction.DEACTIVATE,
          label: (
            <span className="text-red-500">
              {translate('table.deleteUser')}
            </span>
          ),
          icon: <Trash2 className="w-4 h-4 text-red-500" />,
          disabled: isCurrentUser,
        },
      ];
    },
    [currentUser?.userId, translate],
  );

  const handleRowMenuSelect = (
    optionValue: string,
    user: AccessManagementUser,
  ) => {
    // Prevent delete action for current user
    if (
      optionValue === AccessManagementTableMenuAction.DEACTIVATE &&
      currentUserId === user.id
    ) {
      return;
    }

    if (optionValue === AccessManagementTableMenuAction.EDIT) {
      onEditUser?.(user);
    } else if (optionValue === AccessManagementTableMenuAction.RESEND_INVITE) {
      onResendInvite?.(user);
    } else if (optionValue === AccessManagementTableMenuAction.DEACTIVATE) {
      onDeleteUser?.(user);
    }
  };

  // Handle search changes
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearchChange?.(value);
  };

  // Handle filter changes
  const handleFilterChange = (filterKey: string, value: string) => {
    const filterHandlers = {
      role: { set: setRoleFilter, callback: onRoleFilterChange },
      domain: { set: setDomainFilter, callback: onDomainFilterChange },
      status: { set: setStatusFilter, callback: onStatusFilterChange },
    };

    const handler = filterHandlers[filterKey as keyof typeof filterHandlers];
    if (handler) {
      handler.set(value);
      handler.callback?.(value);
    }
  };

  // Filter configuration for the table
  const filtersConfig = useMemo(
    () => [
      {
        key: 'role',
        label: translate('role'),
        type: 'dropdown' as const,
        options: roleOptions,
        value: roleFilter,
        placeholder: translate('selectRole'),
      },
      {
        key: 'domain',
        label: translate('domain'),
        type: 'dropdown' as const,
        options: domainOptions,
        value: domainFilter,
        placeholder: translate('selectDomain'),
      },
      {
        key: 'status',
        label: translate('status'),
        type: 'dropdown' as const,
        options: statusOptions,
        value: statusFilter,
        placeholder: translate('selectStatus'),
      },
      {
        key: 'sorting',
        label: '',
        type: 'dropdown' as const,
        component: (
          <SortButton sortOrder={sortOrder} onSortToggle={handleSortToggle} />
        ),
      },
      {
        key: 'settings',
        label: '',
        type: 'dropdown' as const,
        component: (
          <ColumnSettingsButton
            columnOptions={columnOptions}
            visibleColumns={visibleColumns}
            toggleColumnVisibility={toggleColumnVisibility}
          />
        ),
      },
    ],
    [
      translate,
      roleOptions,
      domainOptions,
      statusOptions,
      roleFilter,
      domainFilter,
      statusFilter,
      sortOrder,
      handleSortToggle,
      columnOptions,
      visibleColumns,
      toggleColumnVisibility,
    ],
  );

  // Define table columns
  const columns = useMemo(() => {
    const allColumns = [
      {
        key: 'fullName' as const,
        label: translate('table.fullName'),
        render: (row: AccessManagementUser) =>
          renderTableTextCell(row.fullName, 'text-mds-gray-900 font-medium'),
        showOnMobile: true,
      },
      {
        key: 'email' as const,
        label: translate('table.email'),
        render: (row: AccessManagementUser) =>
          renderTableTextCell(row.email, 'text-mds-gray-600'),
        showOnMobile: true,
      },
      {
        key: 'domain' as const,
        label: translate('table.domain'),
        render: (row: AccessManagementUser) =>
          renderTableTextCell(
            USER_DOMAIN_LABELS[row.domain as keyof typeof USER_DOMAIN_LABELS],
          ),
        showOnMobile: true,
      },
      {
        key: 'role' as const,
        label: translate('table.role'),
        render: (row: AccessManagementUser) =>
          renderTableTextCell(
            ACCESS_USER_ROLE_LABELS[
              row.role as keyof typeof ACCESS_USER_ROLE_LABELS
            ],
          ),
        showOnMobile: true,
      },
      {
        key: 'status' as const,
        label: translate('table.status'),
        render: (row: AccessManagementUser) => (
          <div className="flex items-center justify-start">
            <Badge
              color={getAccessUserStatusColor(row.status)}
              leftIcon
              size="lg"
            >
              {
                ACCESS_USER_STATUS_LABELS[
                  row.status as keyof typeof ACCESS_USER_STATUS_LABELS
                ]
              }
            </Badge>
          </div>
        ),
        align: 'center' as const,
        showOnMobile: true,
      },
      {
        key: 'lastLogin' as const,
        label: translate('table.lastLogin'),
        render: (row: AccessManagementUser) =>
          renderTableTextCell(formatTableDate(row.lastLogin)),
        showOnMobile: true,
      },
    ];

    // Filter columns based on visibility
    return allColumns.filter((col) => visibleColumns[col.key] !== false);
  }, [translate, visibleColumns]);

  return {
    // Search
    searchValue,
    handleSearchChange,
    // Row selection
    selectedRows,
    handleRowSelect,
    handleSelectAll,
    // Row menu
    getRowMenuOptions,
    handleRowMenuSelect,
    // Columns
    columns,
    // Filters
    filtersConfig,
    handleFilterChange,
  };
}
