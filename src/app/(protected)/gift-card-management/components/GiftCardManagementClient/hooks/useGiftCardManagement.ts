'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  GIFT_CARD_PAGE_SIZE,
  GIFT_CARD_PRODUCT_STATUSES,
  GIFT_CARD_ROW_MENU,
  GIFT_CARD_STATUS_FILTER_ALL,
  GIFT_CARD_TAB_GIFT_CARDS,
  type GiftCardProductStatus,
} from '@/app/(protected)/gift-card-management/constants/giftCardManagementConstants';
import {
  useActivationRequestStatsQuery,
  useActivationRequestsListQuery,
} from '@/api-queries/rewards-portal/activation-requests';
import {
  collectActivationRequestTenantOptions,
  mergeActivationRequestTenantOptions,
  saveActivationRequestSummaryToSession,
} from '@/lib/rewards-portal/activationRequestUtils';
import { ACTIVATION_REQUEST_STATUSES } from '@/constants/rewards-portal/activationRequestStatus';
import {
  ACTIVATION_REQUEST_LIST_ALL,
  type ActivationRequestStatusFilter,
} from '@/types/rewards-portal/activationRequestsApi';
import { useAdminGiftCards } from '@/app/(protected)/gift-card-management/hooks/useAdminGiftCards';
import {
  useActivationRequestTableColumns,
  useGiftCardTableColumns,
} from '@/app/(protected)/gift-card-management/hooks/useGiftCardManagementTableColumns';
import type {
  ActivationRequestRow,
  GiftCardManagementTab,
  GiftCardRow,
} from '@/types/catalog';
import type { ActivationRequestStatus } from '@/constants/rewards-portal/activationRequestStatus';
import {
  buildGiftCardsReturnTo,
  giftCardActivationRequestDetailHref,
  giftCardDetailHref,
} from '@/app/(protected)/gift-card-management/utils/giftCardManagementRoute';
import { useLocalization } from '@/hooks/useLocalization';

export function useGiftCardManagement() {
  const { translate } = useLocalization('catalog');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab =
    (searchParams.get('tab') as GiftCardManagementTab | null) ??
    GIFT_CARD_TAB_GIFT_CARDS;
  const isGiftCardsTab = activeTab === GIFT_CARD_TAB_GIFT_CARDS;

  const [giftCardPage, setGiftCardPage] = useState(1);
  const [activationPage, setActivationPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [giftCardStatusFilter, setGiftCardStatusFilter] = useState<string>(
    GIFT_CARD_STATUS_FILTER_ALL,
  );
  const [activationSearchInput, setActivationSearchInput] = useState('');
  const [debouncedActivationSearch, setDebouncedActivationSearch] =
    useState('');
  const [tenantFilter, setTenantFilter] = useState<string>(
    ACTIVATION_REQUEST_LIST_ALL,
  );
  const [activationStatusFilter, setActivationStatusFilter] =
    useState<ActivationRequestStatusFilter>(ACTIVATION_REQUEST_LIST_ALL);
  const [tenantOptionsById, setTenantOptionsById] = useState<
    Map<string, string>
  >(() => new Map());

  const activationOffset = (activationPage - 1) * GIFT_CARD_PAGE_SIZE;

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedActivationSearch(activationSearchInput.trim()),
      350,
    );
    return () => clearTimeout(timer);
  }, [activationSearchInput]);

  useEffect(() => {
    setActivationPage(1);
  }, [activationStatusFilter, tenantFilter, debouncedActivationSearch]);

  useEffect(() => {
    if (isGiftCardsTab) {
      setTenantOptionsById(new Map());
    }
  }, [isGiftCardsTab]);

  const scopedTenantId =
    tenantFilter !== ACTIVATION_REQUEST_LIST_ALL ? tenantFilter : undefined;
  const scopedStatus =
    activationStatusFilter !== ACTIVATION_REQUEST_LIST_ALL
      ? activationStatusFilter
      : undefined;
  const scopedSearch = debouncedActivationSearch || undefined;

  const {
    search: giftCardSearch,
    setSearch: setGiftCardSearch,
    page: giftCardsDisplayPage,
    rows: giftCardRows,
    total: giftCardTotal,
    totalPages: giftCardTotalPages,
    loading: giftCardsLoading,
    error: giftCardsError,
    refetch: refetchGiftCards,
    categoryOptions: giftCardCategoryOptions,
  } = useAdminGiftCards(isGiftCardsTab, {
    page: giftCardPage,
    setPage: setGiftCardPage,
    categoryFilter,
    statusFilter: giftCardStatusFilter,
  });

  const { data: statsData, isLoading: statsLoading } =
    useActivationRequestStatsQuery(scopedTenantId);
  const { data: tenantOptionsSource } = useActivationRequestsListQuery({
    limit: 100,
    offset: 0,
    includeItemCounts: false,
    enabled: !isGiftCardsTab,
  });
  const {
    data: activationListData,
    isLoading: activationListLoading,
    isFetching: activationListFetching,
    isError: activationListError,
    refetch: refetchActivationList,
  } = useActivationRequestsListQuery({
    tenantId: scopedTenantId,
    status: scopedStatus,
    search: scopedSearch,
    limit: GIFT_CARD_PAGE_SIZE,
    offset: activationOffset,
    enabled: !isGiftCardsTab,
  });

  const setTab = useCallback(
    (tab: GiftCardManagementTab) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', tab);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const giftCardColumns = useGiftCardTableColumns(translate);
  const activationColumns = useActivationRequestTableColumns(translate);

  const activationRows = activationListData?.data ?? [];

  useEffect(() => {
    if (isGiftCardsTab) {
      return;
    }

    const discovered = collectActivationRequestTenantOptions([
      ...(tenantOptionsSource?.data ?? []),
      ...(activationListData?.data ?? []),
    ]);
    if (discovered.size === 0) {
      return;
    }

    setTenantOptionsById((current) => {
      const merged = mergeActivationRequestTenantOptions(current, discovered);
      return merged ?? current;
    });
  }, [activationListData?.data, isGiftCardsTab, tenantOptionsSource?.data]);

  const activationTotal = activationListData?.total ?? 0;
  const activationTotalPages = Math.max(
    1,
    Math.ceil(activationTotal / GIFT_CARD_PAGE_SIZE),
  );

  const rowMenuOptions = useMemo(
    () => [
      {
        value: GIFT_CARD_ROW_MENU.VIEW,
        label: translate('giftCardManagement.menuView'),
      },
    ],
    [translate],
  );

  const goActivationRequest = useCallback(
    (row: ActivationRequestRow) => {
      saveActivationRequestSummaryToSession(row);
      const returnTo = buildGiftCardsReturnTo(
        pathname,
        searchParams.toString(),
      );
      router.push(giftCardActivationRequestDetailHref(row.id, returnTo));
    },
    [pathname, router, searchParams],
  );

  const goGiftCardDetail = useCallback(
    (row: GiftCardRow) => {
      const returnTo = buildGiftCardsReturnTo(
        pathname,
        searchParams.toString(),
      );
      router.push(giftCardDetailHref(row.id, returnTo));
    },
    [pathname, router, searchParams],
  );

  const categoryOptions = useMemo(
    () => [
      { value: 'all', label: translate('allCategories') },
      ...giftCardCategoryOptions,
    ],
    [giftCardCategoryOptions, translate],
  );

  const giftCardStatusOptions = useMemo(
    () => [
      {
        value: GIFT_CARD_STATUS_FILTER_ALL,
        label: translate('allStatuses'),
      },
      ...GIFT_CARD_PRODUCT_STATUSES.map((status) => ({
        value: status,
        label: translate(`giftCardManagement.status.product.${status}`),
      })),
    ],
    [translate],
  );

  const tenantOptions = useMemo(
    () => [
      {
        value: ACTIVATION_REQUEST_LIST_ALL,
        label: translate('giftCardManagement.filters.allTenants'),
      },
      ...Array.from(tenantOptionsById.entries())
        .sort(([, labelA], [, labelB]) => labelA.localeCompare(labelB))
        .map(([value, label]) => ({ value, label })),
    ],
    [tenantOptionsById, translate],
  );

  const activationStatusOptions = useMemo(
    () => [
      { value: ACTIVATION_REQUEST_LIST_ALL, label: translate('allStatuses') },
      ...ACTIVATION_REQUEST_STATUSES.map((status) => ({
        value: status,
        label: translate(`giftCardManagement.status.request.${status}`),
      })),
    ],
    [translate],
  );

  const handleTenantFilterChange = useCallback((value: string) => {
    setTenantFilter(
      value === ACTIVATION_REQUEST_LIST_ALL
        ? ACTIVATION_REQUEST_LIST_ALL
        : value,
    );
  }, []);

  const handleActivationStatusFilterChange = useCallback((value: string) => {
    if (value === ACTIVATION_REQUEST_LIST_ALL) {
      setActivationStatusFilter(ACTIVATION_REQUEST_LIST_ALL);
      return;
    }
    if (
      ACTIVATION_REQUEST_STATUSES.includes(value as ActivationRequestStatus)
    ) {
      setActivationStatusFilter(value as ActivationRequestStatus);
    }
  }, []);

  const handleGiftCardStatusFilterChange = useCallback((value: string) => {
    if (value === GIFT_CARD_STATUS_FILTER_ALL) {
      setGiftCardStatusFilter(GIFT_CARD_STATUS_FILTER_ALL);
      return;
    }
    if (GIFT_CARD_PRODUCT_STATUSES.includes(value as GiftCardProductStatus)) {
      setGiftCardStatusFilter(value);
    }
  }, []);

  const setActivationSearch = useCallback((value: string) => {
    setActivationSearchInput(value);
  }, []);

  return {
    translate,
    activeTab,
    setTab,
    statsData,
    statsLoading,

    giftCardSearch,
    setGiftCardSearch,
    giftCardColumns,
    giftCardRows,
    giftCardsDisplayPage,
    giftCardTotal,
    giftCardTotalPages,
    setGiftCardPage,
    giftCardsLoading,
    giftCardsError,
    refetchGiftCards,
    categoryFilter,
    setCategoryFilter,
    categoryOptions,
    giftCardStatusFilter,
    handleGiftCardStatusFilterChange,
    giftCardStatusOptions,
    goGiftCardDetail,

    activationColumns,
    activationRows,
    activationPage,
    setActivationPage,
    activationTotal,
    activationTotalPages,
    activationListLoading,
    activationListFetching,
    activationListError,
    refetchActivationList,
    rowMenuOptions,
    goActivationRequest,
    setActivationSearch,
    tenantFilter,
    handleTenantFilterChange,
    tenantOptions,
    activationStatusFilter,
    handleActivationStatusFilterChange,
    activationStatusOptions,
  };
}
