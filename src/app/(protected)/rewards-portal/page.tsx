'use client';

import { RewardsPortalClient } from '@/app/(protected)/rewards-portal/components';
import { useRewardsPortal } from '@/app/(protected)/rewards-portal/hooks';

export default function RewardsPortalPage() {
  const {
    shouldShowLoading,
    translateRewards,
    tenants,
    handleTenantSelect,
    handlePageChange,
    pagination,
    searchValue,
    handleSearchChange,
    handleApprove,
    handleReject,
    handleRequestReview,
    statusFilter,
    handleStatusFilterChange,
    countryFilter,
    handleCountryFilterChange,
    sortOrder,
    handleSortChange,
    isLoading,
    error,
    loadingRowId,
  } = useRewardsPortal();

  if (shouldShowLoading) {
    return null;
  }

  return (
    <div id="rewards-portal-page">
      <RewardsPortalClient
        tenantProfiles={tenants}
        onTenantSelect={handleTenantSelect}
        onPageChange={handlePageChange}
        pagination={pagination}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestReview={handleRequestReview}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        countryFilter={countryFilter}
        onCountryFilterChange={handleCountryFilterChange}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        isLoading={isLoading}
        error={error}
        loadingRowId={loadingRowId}
        title={translateRewards('title')}
      />
    </div>
  );
}
