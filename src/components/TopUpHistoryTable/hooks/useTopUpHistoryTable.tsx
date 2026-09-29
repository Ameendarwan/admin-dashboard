'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useTenantTopups } from '@/api-queries/wallets';
import { SortButton } from '@/components';
import { useDebounce, useLocalization, useTableSort } from '@/hooks';
import type {
  ListTenantTopupsParams,
  WalletOperationSourceType,
  WalletOperationStatus,
  WalletSummary,
} from '@/types/walletAdminApi';
import {
  mapOperationStatusToDisplay,
  resolveCurrencyLabel,
  toTopUpHistoryEntry,
  WALLET_OPERATION_SOURCE_TYPE_FILTER_OPTIONS,
  WALLET_OPERATION_STATUS_FILTER_OPTIONS,
} from '@/utils/walletTopUp';

import { DateRangeFilter } from '../components/DateRangeFilter';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

function toStartDatetime(date: string): string | undefined {
  return date ? `${date}T00:00:00.000Z` : undefined;
}

function toEndDatetime(date: string): string | undefined {
  return date ? `${date}T23:59:59.999Z` : undefined;
}

interface UseTopUpHistoryTableArgs {
  tenantId: string;
  summary: WalletSummary;
}

export function useTopUpHistoryTable({
  tenantId,
  summary,
}: Readonly<UseTopUpHistoryTableArgs>) {
  const { translate } = useLocalization('tenant-details.walletTopUp');
  const [searchValue, setSearchValue] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchValue, SEARCH_DEBOUNCE_MS);
  const { handleSortToggle } = useTableSort(sortOrder, (order) => {
    if (order === 'asc' || order === 'desc') {
      setSortOrder(order);
    }
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const queryParams = useMemo((): ListTenantTopupsParams => {
    const params: ListTenantTopupsParams = {
      page: currentPage,
      limit: PAGE_SIZE,
      sortOrder: sortOrder === 'asc' ? 'ASC' : 'DESC',
    };
    if (methodFilter !== 'all') {
      params.sourceType = methodFilter as WalletOperationSourceType;
    }
    if (currencyFilter !== 'all') {
      params.currencyCode = currencyFilter;
    }
    if (statusFilter !== 'all') {
      params.status = statusFilter as WalletOperationStatus;
    }
    const search = debouncedSearch.trim();
    if (search) {
      params.search = search;
    }
    const startDatetime = toStartDatetime(dateRange.start);
    if (startDatetime) {
      params.startDatetime = startDatetime;
    }
    const endDatetime = toEndDatetime(dateRange.end);
    if (endDatetime) {
      params.endDatetime = endDatetime;
    }
    return params;
  }, [
    currencyFilter,
    currentPage,
    dateRange.end,
    dateRange.start,
    debouncedSearch,
    methodFilter,
    sortOrder,
    statusFilter,
  ]);

  const topupsQuery = useTenantTopups(tenantId, queryParams);

  const entries = useMemo(() => {
    return (topupsQuery.data?.data ?? []).map((operation) =>
      toTopUpHistoryEntry(operation, summary.currencies, summary),
    );
  }, [summary, topupsQuery.data?.data]);

  const total = topupsQuery.data?.pagination.total ?? 0;
  const totalPages = Math.max(1, topupsQuery.data?.pagination.totalPages ?? 1);

  const backendStatusLabel = useCallback(
    (status: WalletOperationStatus) =>
      translate(`statuses.${mapOperationStatusToDisplay(status)}`),
    [translate],
  );

  const handleFilterChange = useCallback((key: string, value: string) => {
    setCurrentPage(1);
    switch (key) {
      case 'method':
        setMethodFilter(value);
        break;
      case 'currency':
        setCurrencyFilter(value);
        break;
      case 'status':
        setStatusFilter(value);
        break;
      default:
        break;
    }
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleDateRangeChange = useCallback(
    (nextRange: { start: string; end: string }) => {
      setDateRange(nextRange);
      setCurrentPage(1);
    },
    [],
  );

  const handleSortChange = useCallback(() => {
    setCurrentPage(1);
    handleSortToggle();
  }, [handleSortToggle]);

  const currencyOptions = useMemo(() => {
    return [
      {
        value: 'all',
        label: translate('history.filters.allCurrencies'),
      },
      ...Object.keys(summary.currencies)
        .sort((left, right) => left.localeCompare(right))
        .map((currencyCode) => {
          const label = resolveCurrencyLabel(currencyCode, summary.currencies);
          const isEnabled = summary.currencies[currencyCode]?.isEnabled ?? true;
          return {
            value: currencyCode,
            label: isEnabled
              ? label
              : `${label} · ${translate('currency.disabled')}`,
          };
        }),
    ];
  }, [summary.currencies, translate]);

  const filtersConfig = useMemo(
    () => [
      {
        key: 'method',
        label: '',
        type: 'dropdown' as const,
        placeholder: translate('history.filters.allMethods'),
        value: methodFilter,
        options: [
          {
            value: 'all',
            label: translate('history.filters.allMethods'),
          },
          ...WALLET_OPERATION_SOURCE_TYPE_FILTER_OPTIONS.map((value) => ({
            value,
            label: translate(`methods.${value}`),
          })),
        ],
      },
      {
        key: 'currency',
        label: '',
        type: 'dropdown' as const,
        placeholder: translate('history.filters.allCurrencies'),
        value: currencyFilter,
        options: currencyOptions,
      },
      {
        key: 'status',
        label: '',
        type: 'dropdown' as const,
        placeholder: translate('history.filters.allStatuses'),
        value: statusFilter,
        options: [
          {
            value: 'all',
            label: translate('history.filters.allStatuses'),
          },
          ...WALLET_OPERATION_STATUS_FILTER_OPTIONS.map((value) => ({
            value,
            label: backendStatusLabel(value),
          })),
        ],
      },
      {
        key: 'dateRange',
        label: '',
        type: 'dropdown' as const,
        component: (
          <DateRangeFilter
            start={dateRange.start}
            end={dateRange.end}
            placeholder={translate('history.filters.dateRange')}
            onChange={handleDateRangeChange}
          />
        ),
      },
      {
        key: 'sorting',
        label: '',
        type: 'dropdown' as const,
        component: (
          <SortButton
            sortOrder={sortOrder}
            onSortToggle={handleSortChange}
            ariaLabel={translate('history.filters.sort')}
            title={translate('history.filters.sort')}
          />
        ),
      },
    ],
    [
      backendStatusLabel,
      currencyFilter,
      currencyOptions,
      dateRange.end,
      dateRange.start,
      handleDateRangeChange,
      handleSortChange,
      methodFilter,
      sortOrder,
      statusFilter,
      translate,
    ],
  );

  return {
    searchValue,
    handleSearchChange,
    handleFilterChange,
    filtersConfig,
    entries,
    total,
    currentPage,
    totalPages,
    setCurrentPage,
    isLoading: topupsQuery.isLoading,
    isError: topupsQuery.isError,
  };
}
