'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@merit-incentives/ui';

import { TenantManagement } from '@/app/(protected)/tenant-management/components/TenantManagement';
import { useRouteProtection } from '@/hooks/useRouteProtection';
import { useTenants } from '@/api-queries/tenantManagement/useTenants';
import { TenantProfile } from '@/types/tenantManagement';
import { useUpdateTenantStateFromTable } from '@/api-queries/tenantManagement/useUpdateTenantStateFromTable';
import { TenantJourney, ReviewStatus } from '@/lib/enums';
import useDebounce from '@/hooks/useDebounce';
import { useResendInvite } from '@/api-queries/invite';
import { useLocalization } from '@/hooks/useLocalization';
import { logError } from '@/utils/errorLogger';

export default function TenantManagementPage() {
  const { shouldShowLoading } = useRouteProtection();
  const { translate } = useLocalization('tenant-management');
  const router = useRouter();
  const resendInviteMutation = useResendInvite();
  const [journey, setJourney] = useState<TenantJourney>(
    TenantJourney.ONBOARDED,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [productsFilter, setProductsFilter] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [accountManagerFilter, setAccountManagerFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const debouncedSearchQuery = useDebounce(searchValue, 300);
  const statusForTenantsQuery = useMemo(() => {
    if (journey === TenantJourney.INVITED) {
      return undefined;
    }
    return statusFilter;
  }, [journey, statusFilter]);
  const { data, isLoading, error, isFetching } = useTenants({
    page: currentPage,
    pageSize: 10,
    search: debouncedSearchQuery,
    status: statusForTenantsQuery,
    sortOrder,
    country: countryFilter,
    accountManager: accountManagerFilter,
    platforms: productsFilter ? [productsFilter] : undefined,
    journey,
  });

  const tenants = data?.data || [];
  const pagination = {
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    total: data?.total ?? 0,
  };

  const updateTenantStateFromTableMutation = useUpdateTenantStateFromTable();
  const [loadingRowId, setLoadingRowId] = useState<string | null>(null);
  const isWaitingForRefetchRef = useRef(false);

  useEffect(() => {
    if (
      loadingRowId &&
      isWaitingForRefetchRef.current &&
      isFetching === false &&
      isLoading === false
    ) {
      setLoadingRowId(null);
      isWaitingForRefetchRef.current = false;
    }
  }, [isFetching, isLoading, loadingRowId]);

  if (shouldShowLoading) {
    return null;
  }

  const handleTenantSelect = (tenantProfile: TenantProfile) => {
    const name = encodeURIComponent(tenantProfile.name || '');
    const email = encodeURIComponent(
      tenantProfile.email ||
        tenantProfile.metadata?.businessOwnerEmail ||
        tenantProfile.key ||
        '',
    );
    const tenantId = tenantProfile.tenantId || tenantProfile.id;
    const accountManager = encodeURIComponent(
      tenantProfile.accountManager || '',
    );
    const country = encodeURIComponent(tenantProfile.country || '');

    router.push(
      `/tenant-management/${tenantProfile.id}?tenantId=${tenantId}&name=${name}&email=${email}&accountManager=${accountManager}&country=${country}`,
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleProductsFilterChange = (value: string) => {
    setProductsFilter(value);
    setCurrentPage(1);
  };

  const handleCountryFilterChange = (value: string) => {
    setCountryFilter(value);
    setCurrentPage(1);
  };

  const handleAccountManagerFilterChange = (value: string) => {
    setAccountManagerFilter(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handleSortChange = (order: 'asc' | 'desc' | null) => {
    if (order) {
      setSortOrder(order);
    }
  };

  const handleJourneyChange = (newJourney: TenantJourney) => {
    setJourney(newJourney);
    setCurrentPage(1);
    setStatusFilter('');
    setProductsFilter('');
    setCountryFilter('');
    setAccountManagerFilter('');
  };

  const handleApprove = async (tenantProfile: TenantProfile) => {
    setLoadingRowId(tenantProfile.id);
    const tenantId = tenantProfile.tenantId || tenantProfile.id;
    try {
      await updateTenantStateFromTableMutation.mutateAsync({
        clientProfileId: tenantProfile.id,
        tenantId: tenantId,
        state: ReviewStatus.APPROVED,
      });
      isWaitingForRefetchRef.current = true;
    } catch {
      setLoadingRowId(null);
    }
  };

  const handleReject = async (tenantProfile: TenantProfile) => {
    setLoadingRowId(tenantProfile.id);
    const tenantId = tenantProfile.tenantId || tenantProfile.id;
    try {
      await updateTenantStateFromTableMutation.mutateAsync({
        clientProfileId: tenantProfile.id,
        tenantId: tenantId,
        state: ReviewStatus.REJECTED,
      });
      isWaitingForRefetchRef.current = true;
    } catch {
      setLoadingRowId(null);
    }
  };

  const handleRequestReview = async (tenantProfile: TenantProfile) => {
    setLoadingRowId(tenantProfile.id);
    const tenantId = tenantProfile.tenantId || tenantProfile.id;
    try {
      await updateTenantStateFromTableMutation.mutateAsync({
        clientProfileId: tenantProfile.id,
        tenantId: tenantId,
        state: ReviewStatus.REVISION_REQUESTED,
      });
      isWaitingForRefetchRef.current = true;
    } catch {
      toast.error('Failed to request review. Please try again.');
      setLoadingRowId(null);
    }
  };

  const handleResendInvite = async (tenantProfile: TenantProfile) => {
    try {
      await resendInviteMutation.mutateAsync(tenantProfile.id);
      toast.success(translate('resendInviteSuccess'), {
        description: translate('resendInviteSuccessDescription'),
      });
    } catch (error) {
      logError('Error resending tenant invite', error);
      toast.error(translate('resendInviteError'), {
        description: translate('resendInviteErrorDescription'),
      });
    }
  };

  return (
    <div id="tenant-management-page">
      <TenantManagement
        journey={journey}
        onJourneyChange={handleJourneyChange}
        tenantProfiles={tenants}
        onTenantSelect={handleTenantSelect}
        onInviteTenant={() => {}}
        onPageChange={handlePageChange}
        pagination={pagination}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestReview={handleRequestReview}
        onResendInvite={handleResendInvite}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        productsFilter={productsFilter}
        onProductsFilterChange={handleProductsFilterChange}
        countryFilter={countryFilter}
        onCountryFilterChange={handleCountryFilterChange}
        accountManagerFilter={accountManagerFilter}
        onAccountManagerFilterChange={handleAccountManagerFilterChange}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        isLoading={isLoading}
        error={error}
        loadingRowId={loadingRowId}
      />
    </div>
  );
}
