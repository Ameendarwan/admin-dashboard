'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@merit-incentives/ui';

import { useTenants } from '@/api-queries/tenantManagement/useTenants';
import { useUpdateTenantStateFromTable } from '@/api-queries/tenantManagement/useUpdateTenantStateFromTable';
import { useLocalization } from '@/hooks/useLocalization';
import { useRouteProtection } from '@/hooks/useRouteProtection';
import useDebounce from '@/hooks/useDebounce';
import { PLATFORM_NAME } from '@/constants/platform';
import { TenantJourney, ReviewStatus } from '@/lib/enums';
import type { TenantProfile } from '@/types/tenantManagement';
import { filterTenantsByPlatform } from '@/utils/platformUtils';

import { rewardsPortalTenantDetailHref } from '../utils/rewardsPortalRoute';

export function useRewardsPortal() {
  const { shouldShowLoading } = useRouteProtection();
  const { translate: translateRewards } = useLocalization('rewards-portal');
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const debouncedSearchQuery = useDebounce(searchValue, 300);

  const { data, isLoading, error, isFetching } = useTenants({
    page: currentPage,
    pageSize: 10,
    search: debouncedSearchQuery,
    status: statusFilter,
    sortOrder,
    country: countryFilter,
    journey: TenantJourney.ONBOARDED,
    platforms: [PLATFORM_NAME.REWARDS_PORTAL],
    statusQueryKey: 'status',
  });

  const tenants = useMemo(
    () =>
      filterTenantsByPlatform(data?.data || [], PLATFORM_NAME.REWARDS_PORTAL),
    [data?.data],
  );
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

  const handleTenantSelect = (tenantProfile: TenantProfile) => {
    const tenantId = tenantProfile.tenantId || tenantProfile.id;

    router.push(
      rewardsPortalTenantDetailHref(tenantProfile.id, {
        tenantId,
        name: tenantProfile.name || tenantProfile.businessName || '',
        email:
          tenantProfile.email ||
          tenantProfile.metadata?.businessOwnerEmail ||
          tenantProfile.key ||
          '',
        accountManager: tenantProfile.accountManager || '',
        country: tenantProfile.country || '',
        status: tenantProfile.status || tenantProfile.state || '',
      }),
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleCountryFilterChange = (value: string) => {
    setCountryFilter(value);
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

  return {
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
  };
}
