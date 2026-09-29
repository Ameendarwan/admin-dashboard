'use client';

import { Badge, Table } from '@merit-incentives/ui';
import React, { useState } from 'react';

import { REVIEW_STATUS_LABELS, ReviewStatus } from '@/lib/enums';
import { getReviewStatusBadgeColor } from '@/utils/reviewStatusBadgeColor';
import type { Pagination } from '@/types/pagination';
import { useLocalization } from '@/hooks/useLocalization';

interface DropdownOption {
  value: string;
  label: string | React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactElement<React.SVGProps<SVGSVGElement>>;
}

interface BaseEntity {
  id: string;
  name: string;
  email: string;
  businessName?: string;
  state: string;
}

interface BaseTableProps<T extends BaseEntity> {
  data: T[];
  onRowSelect: (item: T) => void;
  onPageChange: (page: number) => void;
  pagination: Pagination;
  loadingRowId?: string | null;
  rowMenuOptions: DropdownOption[] | ((row: T) => DropdownOption[]);
  onRowMenuSelect: (optionValue: string, item: T) => void;
  translationNamespace?: string;
  showCheckboxes?: boolean;
  showSearch?: boolean;
  disableRowMenu?: boolean;
  statusLabels?: Record<string, string>;
  getStatusColor?: (
    status: string,
  ) => 'success' | 'error' | 'warning' | 'primary' | 'gray';
  loading?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filtersConfig?: Array<{
    key: string;
    label: string;
    type: 'dropdown' | 'multi-select';
    options?: Array<{ value: string; label: string }>;
    value?: string;
    placeholder?: string;
  }>;
  onFilterChange?: (filterKey: string, value: string) => void;
  visibleColumns?: Record<string, boolean>;
  isRowDisabled?: (row: T) => boolean;
}

export function BaseTable<T extends BaseEntity>({
  data,
  onRowSelect,
  onPageChange,
  pagination,
  loadingRowId,
  rowMenuOptions,
  onRowMenuSelect,
  translationNamespace = 'tenant-management',
  showCheckboxes = false,
  disableRowMenu = false,
  statusLabels = REVIEW_STATUS_LABELS,
  getStatusColor,
  loading = false,
  showSearch = false,
  searchValue = '',
  onSearchChange,
  filtersConfig,
  onFilterChange,
  visibleColumns,
  isRowDisabled: customIsRowDisabled,
}: Readonly<BaseTableProps<T>>) {
  const { translate } = useLocalization(translationNamespace);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const currentPage = pagination?.page || 1;

  // Pagination logic
  const itemsPerPage = 5;
  const totalPages = pagination?.totalPages || 1;
  const totalRecords = pagination?.total || 0;
  const paginatedData = data;

  // Row selection handlers
  const handleRowSelect = (rowId: string | number, isSelected: boolean) => {
    // Early return if no data
    if (!paginatedData || paginatedData.length === 0) {
      return;
    }

    const rowIdString = String(rowId);
    const item = paginatedData.find((u) => u.id === rowIdString);

    // Don't allow selection of disabled items
    if (item && isRowDisabled(item)) {
      return;
    }

    setSelectedRows((prev) =>
      isSelected
        ? [...prev, rowIdString]
        : prev.filter((id) => id !== rowIdString),
    );
  };

  const handleSelectAll = (isSelected: boolean) => {
    // Early return if no data
    if (!paginatedData || paginatedData.length === 0) {
      setSelectedRows([]);
      return;
    }

    // Only select non-disabled items
    const selectableItems = paginatedData.filter(
      (item) => !isRowDisabled(item),
    );
    setSelectedRows(isSelected ? selectableItems.map((item) => item.id) : []);
  };

  const handleRowMenuSelectInternal = (optionValue: string, item: T) => {
    // Don't allow actions if the row is currently loading
    if (loadingRowId === item.id) {
      return;
    }

    onRowMenuSelect(optionValue, item);
  };

  // Column definitions
  const columns = [
    {
      key: 'fullName' as keyof T,
      label: translate('table.fullName'),
      render: (row: T) => (
        <div
          className={`font-medium ${isRowDisabled(row) ? 'text-mds-gray-400' : 'text-mds-gray-900'}`}
        >
          {row.name}
        </div>
      ),
      showOnMobile: true,
    },
    {
      key: 'email' as keyof T,
      label: translate('table.email'),
      render: (row: T) => (
        <div
          className={`${isRowDisabled(row) ? 'text-mds-gray-400' : 'text-mds-gray-600'}`}
        >
          {row.email}
        </div>
      ),
      showOnMobile: true,
    },
    {
      key: 'businessName' as keyof T,
      label: translate('table.businessName'),
      render: (row: T) => (
        <div
          className={`${isRowDisabled(row) ? 'text-mds-gray-400' : 'text-mds-gray-900'}`}
        >
          {row.businessName}
        </div>
      ),
      showOnMobile: true,
    },
    {
      key: 'state' as keyof T,
      label: translate('table.status'),
      render: (row: T, value: string) => {
        const isRowLoading = loadingRowId === row.id;

        const colorFn = getStatusColor || getReviewStatusBadgeColor;

        return (
          <div className="flex items-center justify-start space-x-2">
            {isRowLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-mds-primary-600"></div>
                <span className="text-sm text-mds-gray-600">Updating...</span>
              </div>
            ) : (
              <Badge color={colorFn(value)} leftIcon size="lg">
                {statusLabels[value] ?? value}
              </Badge>
            )}
          </div>
        );
      },
      align: 'center' as const,
      showOnMobile: true,
    },
  ];

  // Handle page changes
  const handlePageChange = (page: number) => {
    onPageChange(page);
  };

  // Handle row clicks
  const handleRowClick = (row: T) => {
    // Don't allow row clicks for disabled items
    if (isRowDisabled(row)) {
      return;
    }
    onRowSelect(row);
  };

  // Check if row should be disabled
  const isRowDisabled = (row: T) => {
    if (customIsRowDisabled) {
      return customIsRowDisabled(row);
    }
    // Default: disable onboarding rows (for backward compatibility)
    return row.state === ReviewStatus.ONBOARDING;
  };

  // Filter columns based on visibility
  const filteredColumns = visibleColumns
    ? columns.filter((col) => visibleColumns[col.key as string] !== false)
    : columns;

  return (
    <div
      className="relative overflow-visible table-dropdown-wrapper"
      style={{ zIndex: 10 }}
    >
      <Table
        className="min-h-[50vh]!"
        columns={filteredColumns}
        data={paginatedData}
        showSearch={showSearch}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        filtersConfig={filtersConfig}
        onFilterChange={onFilterChange}
        pagination={{
          currentPage,
          totalPages,
          totalRecords,
          itemsPerPage,
        }}
        onPageChange={handlePageChange}
        showPagination={true}
        size="md"
        background="white"
        rounded={true}
        shadow={true}
        showCheckboxes={showCheckboxes}
        selectedRows={selectedRows}
        onRowSelect={handleRowSelect}
        onSelectAll={handleSelectAll}
        getRowId={(row: T) => row.id}
        showRowMenu={true}
        onRowMenuSelect={handleRowMenuSelectInternal}
        rowMenuOptions={rowMenuOptions}
        onRowClick={handleRowClick}
        emptyText="No data yet"
        getRowClassName={(row: T) =>
          isRowDisabled(row) ? 'cursor-not-allowed' : ''
        }
        isRowMenuDisabled={() => disableRowMenu}
        loading={loading}
      />
    </div>
  );
}
