'use client';

import { Badge, ContentCard, Pagination, Table } from '@merit-incentives/ui';

import type { WalletStatus } from '@/types/walletAdminApi';

import { useTenantFloatWalletsTable } from '../../hooks';
import { formatWalletAmountMinor } from '../../utils/walletTopUpFormatters';
import type { TenantWalletTableEntry } from '../../utils/walletTopUpTypes';
// import { WalletFreezeActionLink } from '../WalletFreezeActionLink';

function walletStatusBadgeColor(status: WalletStatus): 'success' | 'error' {
  return status === 'ACTIVE' ? 'success' : 'error';
}

interface TenantFloatWalletsTableProps {
  tenantName: string;
  entries: TenantWalletTableEntry[];
  onFreezeWallet?: (entry: TenantWalletTableEntry) => void;
  onUnfreezeWallet?: (entry: TenantWalletTableEntry) => void;
}

export function TenantFloatWalletsTable({
  tenantName,
  entries,
  // onFreezeWallet,
  // onUnfreezeWallet,
}: Readonly<TenantFloatWalletsTableProps>) {
  const {
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
  } = useTenantFloatWalletsTable({ entries });

  const columns = [
    {
      key: 'label' as const,
      label: translate('tenantFloatWallets.table.wallet'),
      render: (row: TenantWalletTableEntry) => (
        <div className="text-sm font-medium text-mds-black-900">
          {walletLabel(row)}
        </div>
      ),
      showOnMobile: true,
    },
    {
      key: 'balance' as const,
      label: translate('tenantFloatWallets.table.currentFloatBalance'),
      render: (row: TenantWalletTableEntry) => (
        <div>
          <div className="text-sm text-mds-black-900">
            {row.currencyCode}{' '}
            {formatWalletAmountMinor(row.balanceMinor, row.minorUnit)}
          </div>
          <div className="text-xs text-mds-black-500">
            {row.currencyLabel}
            {row.isCurrencyEnabled
              ? null
              : ` · ${translate('currency.disabled')}`}
          </div>
        </div>
      ),
      showOnMobile: true,
    },
    {
      key: 'status' as const,
      label: translate('tenantFloatWallets.table.status'),
      render: (row: TenantWalletTableEntry) => (
        <Badge color={walletStatusBadgeColor(row.status)} leftIcon size="lg">
          {statusLabel(row.status)}
        </Badge>
      ),
      align: 'center' as const,
      showOnMobile: true,
    },
    // {
    //   key: 'actions' as const,
    //   label: translate('tenantFloatWallets.table.actions'),
    //   render: (row: TenantWalletTableEntry) => {
    //     if (row.status === 'FROZEN' && onUnfreezeWallet) {
    //       return (
    //         <WalletFreezeActionLink
    //           action="unfreeze"
    //           label={translate('freezeActions.unfreeze')}
    //           onClick={() => onUnfreezeWallet(row)}
    //         />
    //       );
    //     }
    //     if (row.status === 'ACTIVE' && onFreezeWallet) {
    //       return (
    //         <WalletFreezeActionLink
    //           action="freeze"
    //           label={translate('freezeActions.freeze')}
    //           onClick={() => onFreezeWallet(row)}
    //         />
    //       );
    //     }
    //     return null;
    //   },
    //   showOnMobile: true,
    // },
  ];

  const visibleCount = paginatedEntries.length;

  return (
    <ContentCard className="relative z-0 overflow-visible rounded-mds-md border border-mds-black-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-medium text-mds-black-900">
          {translate('tenantFloatWallets.title', { tenantName })}
        </h2>

        {/* -mx-4 cancels card padding so Table toolbar padding aligns with the heading. */}
        <div className="relative z-0 -mx-4 overflow-visible">
          <Table
            columns={columns}
            data={paginatedEntries}
            showSearch
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            searchPlaceholder={translate(
              'tenantFloatWallets.searchPlaceholder',
            )}
            filtersConfig={filtersConfig}
            onFilterChange={handleFilterChange}
            showPagination={false}
            size="md"
            background="white"
            rounded={false}
            shadow={false}
            getRowId={(row: TenantWalletTableEntry) => row.id}
            emptyText={translate('tenantFloatWallets.empty')}
            className="w-full [&_tbody_tr]:border-mds-black-100 [&_td]:px-3 [&_td]:py-3 sm:[&_td]:px-4 sm:[&_td]:py-3.5 [&_th]:whitespace-nowrap [&_th]:px-3 [&_th]:py-3 sm:[&_th]:px-4 [&_th]:text-[11px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-mds-black-500 [&_thead_tr]:bg-mds-black-50"
          />

          {filteredEntries.length > 0 ? (
            <p
              className="border-t border-mds-black-100 px-4 py-3 text-sm text-mds-black-600"
              aria-live="polite"
            >
              {translate('tenantFloatWallets.showingResults', {
                count: String(visibleCount),
                total: String(filteredEntries.length),
              })}
            </p>
          ) : null}

          {totalPages > 1 ? (
            <div className="flex justify-center border-t border-mds-black-100 px-4 py-3 sm:justify-end">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          ) : null}
        </div>
      </div>
    </ContentCard>
  );
}
