'use client';

import React from 'react';
import { Table } from '@merit-incentives/ui';

import type { TenantProfile } from '@/types/tenantManagement';
import { TenantJourney } from '@/lib/enums';
import { TableStateDisplay } from '@/components';
import type { Pagination } from '@/types/pagination';
import { useLocalization } from '@/hooks/useLocalization';

import { TenantsTableFilters } from './components/TenantsTableFilters';
import { useTenantsTable } from './hooks/useTenantsTable';

interface TenantsTableProps {
  journey?: TenantJourney;
  tenantProfiles: TenantProfile[];
  onTenantSelect: (tenant: TenantProfile) => void;
  onPageChange: (page: number) => void;
  pagination: Pagination;
  onApprove: (tenant: TenantProfile) => void;
  onReject: (tenant: TenantProfile) => void;
  onResendInvite?: (tenant: TenantProfile) => void;
  onRequestReview: (tenant: TenantProfile) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  productsFilter: string;
  onProductsFilterChange: (value: string) => void;
  countryFilter: string;
  onCountryFilterChange: (value: string) => void;
  accountManagerFilter: string;
  onAccountManagerFilterChange: (value: string) => void;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (order: 'asc' | 'desc' | null) => void;
  isLoading: boolean;
  error: Error | null;
  loadingRowId?: string | null;
}

export function TenantsTable({
  journey,
  tenantProfiles,
  onTenantSelect,
  onPageChange,
  pagination,
  onApprove,
  onReject,
  onResendInvite,
  onRequestReview,
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  productsFilter,
  onProductsFilterChange,
  countryFilter,
  onCountryFilterChange,
  accountManagerFilter,
  onAccountManagerFilterChange,
  sortOrder: externalSortOrder = 'desc',
  onSortChange,
  isLoading,
  error,
  loadingRowId,
}: Readonly<TenantsTableProps>) {
  const { translate } = useLocalization('tenant-management');

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
    filtersConfig,
    handleFilterChange,
    showFilters,
    statusOptions,
    productsOptions,
    accountManagerOptions,
    handleClearFilters,
    hasActiveFilters,
  } = useTenantsTable({
    journey,
    statusFilter,
    onStatusFilterChange,
    productsFilter,
    onProductsFilterChange,
    countryFilter,
    onCountryFilterChange,
    accountManagerFilter,
    onAccountManagerFilterChange,
    sortOrder: externalSortOrder,
    onSortChange,
    translate,
    loadingRowId,
    onTenantSelect,
    onRequestReview,
    onApprove,
    onReject,
    onResendInvite,
  });

  const showErrorState = error && !isLoading;

  if (showErrorState) {
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

  let tableClassName = 'min-h-[50vh]!';
  if (showFilters) {
    tableClassName = `${tableClassName} rounded-none`;
  }

  return (
    <div className="relative overflow-visible" style={{ zIndex: 10 }}>
      {journey !== TenantJourney.INVITED && (
        <TenantsTableFilters
          showFilters={showFilters}
          countryFilter={countryFilter}
          productsFilter={productsFilter}
          statusFilter={statusFilter}
          accountManagerFilter={accountManagerFilter}
          onCountryChange={onCountryFilterChange}
          onProductsChange={onProductsFilterChange}
          onStatusChange={onStatusFilterChange}
          onAccountManagerChange={onAccountManagerFilterChange}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          productsOptions={productsOptions}
          statusOptions={statusOptions}
          accountManagerOptions={accountManagerOptions}
        />
      )}
      <Table
        className={tableClassName}
        columns={columns}
        data={tenantProfiles}
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
