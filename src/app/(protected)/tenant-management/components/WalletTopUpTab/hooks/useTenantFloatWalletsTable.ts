'use client';

import { useCallback, useMemo, useState } from 'react';

import { useLocalization } from '@/hooks';
import type { WalletStatus } from '@/types/walletAdminApi';

import { WALLET_STATUS_FILTER_OPTIONS } from '../utils/walletTopUpFilterOptions';
import { formatWalletAmountMinor } from '../utils/walletTopUpFormatters';
import { resolveWalletTableLabel } from '../utils/walletTopUpMappers';
import type { TenantWalletTableEntry } from '../utils/walletTopUpTypes';

const PAGE_SIZE = 10;

interface UseTenantFloatWalletsTableArgs {
  entries: TenantWalletTableEntry[];
}

export function useTenantFloatWalletsTable({
  entries,
}: Readonly<UseTenantFloatWalletsTableArgs>) {
  const { translate } = useLocalization('tenant-details.walletTopUp');
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const walletLabel = useCallback(
    (entry: TenantWalletTableEntry) =>
      resolveWalletTableLabel(entry, translate),
    [translate],
  );

  const statusLabel = useCallback(
    (status: WalletStatus) =>
      translate(`tenantFloatWallets.statuses.${status}`),
    [translate],
  );

  const filteredEntries = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return entries.filter((entry) => {
      if (statusFilter !== 'all' && entry.status !== statusFilter) {
        return false;
      }
      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        walletLabel(entry),
        entry.currencyCode,
        entry.currencyLabel,
        entry.productCode ?? '',
        statusLabel(entry.status),
        formatWalletAmountMinor(entry.balanceMinor, entry.minorUnit),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [entries, searchValue, statusFilter, statusLabel, walletLabel]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));

  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredEntries.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredEntries]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setCurrentPage(1);
    if (key === 'status') {
      setStatusFilter(value);
    }
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  }, []);

  const filtersConfig = useMemo(
    () => [
      {
        key: 'status',
        label: '',
        type: 'dropdown' as const,
        placeholder: translate('tenantFloatWallets.filters.allStatuses'),
        value: statusFilter,
        options: [
          {
            value: 'all',
            label: translate('tenantFloatWallets.filters.allStatuses'),
          },
          ...WALLET_STATUS_FILTER_OPTIONS.map((value) => ({
            value,
            label: translate(`tenantFloatWallets.statuses.${value}`),
          })),
        ],
      },
    ],
    [statusFilter, translate],
  );

  return {
    translate,
    searchValue,
    handleSearchChange,
    handleFilterChange,
    filtersConfig,
    filteredEntries,
    paginatedEntries,
    currentPage,
    setCurrentPage,
    totalPages,
    walletLabel,
    statusLabel,
    pageSize: PAGE_SIZE,
  };
}
