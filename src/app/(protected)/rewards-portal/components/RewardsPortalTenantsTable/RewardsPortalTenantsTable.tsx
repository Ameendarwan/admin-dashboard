'use client';

import React, { useCallback, useMemo } from 'react';
import { Table } from '@merit-incentives/ui';

import { useTenantsTable } from '@/app/(protected)/tenant-management/components/TenantsTable/hooks/useTenantsTable';
import { CountrySearch, TableStateDisplay } from '@/components';
import { PLATFORM_NAME } from '@/constants/platform';
import { useLocalization } from '@/hooks/useLocalization';
import { TenantJourney } from '@/lib/enums';
import type { Pagination } from '@/types/pagination';
import type { TenantProfile } from '@/types/tenantManagement';
import { filterTenantsByPlatform } from '@/utils/platformUtils';

interface RewardsPortalTenantsTableProps {
  tenantProfiles: TenantProfile[];
  onTenantSelect: (tenant: TenantProfile) => void;
  onPageChange: (page: number) => void;
  pagination: Pagination;
  onApprove: (tenant: TenantProfile) => void;
  onReject: (tenant: TenantProfile) => void;
  onRequestReview: (tenant: TenantProfile) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  countryFilter: string;
  onCountryFilterChange: (value: string) => void;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (order: 'asc' | 'desc' | null) => void;
  isLoading: boolean;
  error: Error | null;
  loadingRowId?: string | null;
}

export function RewardsPortalTenantsTable({
  tenantProfiles,
  onTenantSelect,
  onPageChange,
  pagination,
  onApprove,
  onReject,
  onRequestReview,
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  countryFilter,
  onCountryFilterChange,
  sortOrder = 'desc',
  onSortChange,
  isLoading,
  error,
  loadingRowId,
}: Readonly<RewardsPortalTenantsTableProps>) {
  const { translate } = useLocalization('tenant-management');

  const rewardsPortalTenants = useMemo(
    () => filterTenantsByPlatform(tenantProfiles, PLATFORM_NAME.REWARDS_PORTAL),
    [tenantProfiles],
  );

  const {
    selectedRows,
    handleRowSelect,
    handleSelectAll,
    getRowMenuOptions,
    handleRowMenuSelect,
    getRowClassName,
    isRowMenuDisabled,
    handleTenantRowClick,
    columns,
    statusOptions,
  } = useTenantsTable({
    journey: TenantJourney.ONBOARDED,
    statusFilter,
    onStatusFilterChange,
    productsFilter: PLATFORM_NAME.REWARDS_PORTAL,
    onProductsFilterChange: () => undefined,
    countryFilter,
    onCountryFilterChange,
    accountManagerFilter: '',
    onAccountManagerFilterChange: () => undefined,
    sortOrder,
    onSortChange,
    translate,
    loadingRowId,
    onTenantSelect,
    onRequestReview,
    onApprove,
    onReject,
    allowOnboardingActions: true,
    statusSource: 'identityStatus',
  });

  const tableColumns = useMemo(
    () => columns.filter((col) => col.key !== 'activeProducts'),
    [columns],
  );

  const handleFilterChange = useCallback(
    (filterKey: string, value: string) => {
      if (filterKey === 'status') {
        onStatusFilterChange(value);
      }
    },
    [onStatusFilterChange],
  );

  const filtersConfig = useMemo(
    () => [
      {
        key: 'country',
        label: translate('table.country'),
        type: 'dropdown' as const,
        component: (
          <div className="min-w-[200px] max-w-[280px]">
            <CountrySearch
              label=""
              value={countryFilter}
              onChange={onCountryFilterChange}
              placeholder={translate('table.country')}
            />
          </div>
        ),
      },
      {
        key: 'status',
        label: translate('table.status'),
        type: 'dropdown' as const,
        options: statusOptions,
        value: statusFilter,
        placeholder: translate('table.status'),
      },
    ],
    [
      countryFilter,
      onCountryFilterChange,
      statusFilter,
      statusOptions,
      translate,
    ],
  );

  if (error && !isLoading) {
    return (
      <TableStateDisplay
        type="error"
        title={translate('errorLoadingTenants')}
        description={
          error instanceof Error ? error.message : 'Unknown error occurred'
        }
        showRetryButton
        onRetry={() => globalThis.location.reload()}
        retryButtonText={translate('retry')}
      />
    );
  }

  return (
    <div className="relative overflow-visible" style={{ zIndex: 10 }}>
      <Table
        className="min-h-[50vh]!"
        columns={tableColumns}
        data={rewardsPortalTenants}
        showSearch={true}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
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
        getRowId={(row: TenantProfile) => row.id}
        showRowMenu={true}
        onRowMenuSelect={(optionValue, row) =>
          handleRowMenuSelect(optionValue, row as TenantProfile)
        }
        rowMenuOptions={getRowMenuOptions}
        getRowClassName={getRowClassName}
        isRowMenuDisabled={isRowMenuDisabled}
        onRowClick={(row) => handleTenantRowClick(row as TenantProfile)}
        emptyText={translate('noTenantsFound')}
        loading={isLoading}
      />
    </div>
  );
}
