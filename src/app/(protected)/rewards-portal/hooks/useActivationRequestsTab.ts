'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useActivationRequestsListQuery } from '@/api-queries/rewards-portal/activation-requests';
import {
  REWARDS_PORTAL_PAGE_SIZE,
  REWARDS_PORTAL_ROW_MENU,
} from '@/app/(protected)/rewards-portal/constants/rewardsPortalConstants';
import { saveActivationRequestSummaryToSession } from '@/lib/rewards-portal/activationRequestUtils';
import type { ActivationRequestRow } from '@/types/catalog';
import { useLocalization } from '@/hooks/useLocalization';

import {
  buildRewardsPortalReturnTo,
  rewardsPortalActivationRequestDetailHref,
} from '../utils/rewardsPortalRoute';
import { useActivationRequestTableColumns } from './useActivationRequestTableColumns';

interface UseActivationRequestsTabProps {
  tenantId: string;
}

export function useActivationRequestsTab({
  tenantId,
}: UseActivationRequestsTabProps) {
  const { translate } = useLocalization('rewards-portal');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  // Filters temporarily disabled per Figma — keep for later restore.
  // const [searchInput, setSearchInput] = useState('');
  // const [debouncedSearch, setDebouncedSearch] = useState('');
  // const [statusFilter, setStatusFilter] =
  //   useState<ActivationRequestStatusFilter>(ACTIVATION_REQUEST_LIST_ALL);

  const offset = (page - 1) * REWARDS_PORTAL_PAGE_SIZE;

  // useEffect(() => {
  //   const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
  //   return () => clearTimeout(timer);
  // }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [tenantId]);

  const {
    data: listData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useActivationRequestsListQuery({
    tenantId,
    // Omit status to return all activation requests for the tenant.
    // search: debouncedSearch || undefined,
    limit: REWARDS_PORTAL_PAGE_SIZE,
    offset,
    enabled: Boolean(tenantId),
  });

  const goToRequest = useCallback(
    (row: ActivationRequestRow) => {
      saveActivationRequestSummaryToSession(row);
      const returnTo = buildRewardsPortalReturnTo(
        pathname,
        searchParams.toString(),
      );
      router.push(rewardsPortalActivationRequestDetailHref(row.id, returnTo));
    },
    [pathname, router, searchParams],
  );

  const columns = useActivationRequestTableColumns(translate, goToRequest);
  const rows = listData?.data ?? [];
  const total = listData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / REWARDS_PORTAL_PAGE_SIZE));

  const rowMenuOptions = useMemo(
    () => [
      {
        value: REWARDS_PORTAL_ROW_MENU.VIEW,
        label: translate('activationRequests.menuView'),
      },
    ],
    [translate],
  );

  const handleRowMenuSelect = useCallback(
    (value: string, row: ActivationRequestRow) => {
      if (value === REWARDS_PORTAL_ROW_MENU.VIEW) {
        goToRequest(row);
      }
    },
    [goToRequest],
  );

  return {
    translate,
    columns,
    rows,
    page,
    setPage,
    total,
    totalPages,
    // onSearchChange: setSearchInput,
    // statusFilter,
    // onStatusFilterChange: (value: string) =>
    //   setStatusFilter(value as ActivationRequestStatusFilter),
    // statusOptions,
    loading: isLoading || isFetching,
    error: isError,
    retrying: isFetching,
    onRetry: () => {
      void refetch();
    },
    rowMenuOptions,
    onRowMenuSelect: handleRowMenuSelect,
    onRowClick: goToRequest,
  };
}
