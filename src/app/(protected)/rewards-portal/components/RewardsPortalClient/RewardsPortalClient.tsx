'use client';

import React from 'react';

import { PageHeader } from '@/components';
import type { TenantProfile } from '@/types/tenantManagement';
import type { Pagination } from '@/types/pagination';

import { RewardsPortalTenantsTable } from '../RewardsPortalTenantsTable';

interface RewardsPortalClientProps {
  tenantProfiles: TenantProfile[];
  onTenantSelect: (tenantProfile: TenantProfile) => void;
  onPageChange: (page: number) => void;
  pagination: Pagination;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onApprove: (tenantProfile: TenantProfile) => void;
  onReject: (tenantProfile: TenantProfile) => void;
  onRequestReview: (tenantProfile: TenantProfile) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  countryFilter: string;
  onCountryFilterChange: (value: string) => void;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (order: 'asc' | 'desc' | null) => void;
  isLoading: boolean;
  error: Error | null;
  loadingRowId?: string | null;
  title: string;
}

export function RewardsPortalClient({
  tenantProfiles,
  onTenantSelect,
  onPageChange,
  pagination,
  searchValue,
  onSearchChange,
  onApprove,
  onReject,
  onRequestReview,
  statusFilter,
  onStatusFilterChange,
  countryFilter,
  onCountryFilterChange,
  sortOrder,
  onSortChange,
  isLoading,
  error,
  loadingRowId,
  title,
}: Readonly<RewardsPortalClientProps>) {
  return (
    <div className="min-h-screen">
      <div className="space-y-1">
        <div className="space-y-6">
          <PageHeader title={title} />
          <RewardsPortalTenantsTable
            tenantProfiles={tenantProfiles}
            onTenantSelect={onTenantSelect}
            pagination={pagination}
            onPageChange={onPageChange}
            onApprove={onApprove}
            onReject={onReject}
            onRequestReview={onRequestReview}
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            statusFilter={statusFilter}
            onStatusFilterChange={onStatusFilterChange}
            countryFilter={countryFilter}
            onCountryFilterChange={onCountryFilterChange}
            sortOrder={sortOrder}
            onSortChange={onSortChange}
            isLoading={isLoading}
            error={error}
            loadingRowId={loadingRowId}
          />
        </div>
      </div>
    </div>
  );
}
