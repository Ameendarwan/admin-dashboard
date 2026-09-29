'use client';

import { useCallback, useMemo } from 'react';
import { Badge, ContentCard, Table } from '@merit-incentives/ui';
import { Eye } from 'lucide-react';

import { useLocalization } from '@/hooks';
import type { WalletSummary } from '@/types/walletAdminApi';
import { getProductLabel } from '@/constants/platform';
import {
  formatTopUpHistoryDate,
  formatWalletAmountMinorOrUnknown,
  topUpStatusBadgeColor,
  type TopUpDisplayStatus,
  type TopUpHistoryEntry,
  type TopUpMethodDisplay,
} from '@/utils/walletTopUp';

import { TopUpDetailsModal } from './components';
import { useTopUpHistoryDetails, useTopUpHistoryTable } from './hooks';

const PAGE_SIZE = 10;
const VIEW_DETAILS_ACTION = 'view';

interface TopUpHistoryTableProps {
  tenantId: string;
  summary: WalletSummary;
}

export function TopUpHistoryTable({
  tenantId,
  summary,
}: Readonly<TopUpHistoryTableProps>) {
  const { locale, translate } = useLocalization('tenant-details.walletTopUp');
  const {
    searchValue,
    handleSearchChange,
    handleFilterChange,
    filtersConfig,
    entries,
    total,
    currentPage,
    totalPages,
    setCurrentPage,
    isLoading,
  } = useTopUpHistoryTable({ tenantId, summary });
  const {
    isDetailsOpen,
    details,
    isDetailsLoading,
    isDetailsError,
    openDetails,
    closeDetails,
    retryDetails,
  } = useTopUpHistoryDetails({ tenantId, summary });

  const methodLabel = useCallback(
    (method: TopUpMethodDisplay | null | undefined) => {
      if (!method) {
        return '-';
      }
      return translate(`methods.${method}`);
    },
    [translate],
  );

  const statusLabel = useCallback(
    (status: TopUpDisplayStatus) => translate(`statuses.${status}`),
    [translate],
  );

  const walletTypeLabel = useCallback(
    (walletType: TopUpHistoryEntry['walletType']) => {
      if (!walletType) {
        return '-';
      }
      return translate(`walletTypes.${walletType}`);
    },
    [translate],
  );

  const columns = useMemo(
    () => [
      {
        key: 'type' as const,
        label: translate('history.table.type'),
        render: (row: TopUpHistoryEntry) => (
          <div className="text-sm capitalize font-medium text-mds-black-900">
            {walletTypeLabel(row.walletType)}
          </div>
        ),
        showOnMobile: true,
      },
      {
        key: 'product' as const,
        label: translate('history.table.product'),
        render: (row: TopUpHistoryEntry) =>
          row.productCode ? (
            <Badge color="primary" size="lg">
              {getProductLabel(row.productCode)}
            </Badge>
          ) : (
            <span className="text-sm text-mds-black-900">-</span>
          ),
        showOnMobile: true,
      },
      {
        key: 'method' as const,
        label: translate('history.table.method'),
        render: (row: TopUpHistoryEntry) => (
          <div className="text-sm font-medium text-mds-black-900">
            {methodLabel(row.method)}
          </div>
        ),
        showOnMobile: true,
      },
      {
        key: 'amount' as const,
        label: translate('history.table.amount'),
        render: (row: TopUpHistoryEntry) => (
          <div className="text-sm text-mds-black-900">
            {formatWalletAmountMinorOrUnknown(
              row.amountMinor,
              row.minorUnit,
              '-',
            )}
          </div>
        ),
        showOnMobile: true,
      },
      {
        key: 'currency' as const,
        label: translate('history.table.currency'),
        render: (row: TopUpHistoryEntry) => (
          <div className="text-sm text-mds-black-900">
            {row.currencyLabel || '-'}
            {row.isCurrencyEnabled
              ? null
              : ` · ${translate('currency.disabled')}`}
          </div>
        ),
        showOnMobile: true,
      },
      {
        key: 'submittedAt' as const,
        label: translate('history.table.submitted'),
        render: (row: TopUpHistoryEntry) => (
          <div className="whitespace-nowrap text-sm text-mds-black-600">
            {row.submittedAt
              ? formatTopUpHistoryDate(row.submittedAt, locale)
              : '-'}
          </div>
        ),
        showOnMobile: true,
      },
      {
        key: 'status' as const,
        label: translate('history.table.status'),
        render: (row: TopUpHistoryEntry) => (
          <Badge color={topUpStatusBadgeColor(row.status)} leftIcon size="lg">
            {statusLabel(row.status)}
          </Badge>
        ),
        align: 'center' as const,
        showOnMobile: true,
      },
    ],
    [locale, methodLabel, statusLabel, translate, walletTypeLabel],
  );

  const rowMenuOptions = useMemo(
    () => [
      {
        value: VIEW_DETAILS_ACTION,
        label: translate('history.actions.view'),
        icon: <Eye className="h-4 w-4" />,
      },
    ],
    [translate],
  );

  const handleRowMenuSelect = useCallback(
    (optionValue: string, row: TopUpHistoryEntry) => {
      if (optionValue === VIEW_DETAILS_ACTION) {
        openDetails(row);
      }
    },
    [openDetails],
  );

  return (
    <>
      <ContentCard className="overflow-visible rounded-[14px] border border-mds-black-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-medium text-mds-black-900">
            {translate('history.title')}
          </h2>

          {/* -mx-4 cancels card padding so Table toolbar padding aligns with the heading.
              table-dropdown-wrapper + overflow-visible keep upward filter menus from clipping.
              z-index stays on the table only so the details modal is not trapped under the sticky header. */}
          <div
            className="table-dropdown-wrapper relative -mx-4 overflow-visible"
            style={{ zIndex: 10 }}
          >
            <Table
              columns={columns}
              data={entries}
              loading={isLoading}
              showSearch
              searchValue={searchValue}
              onSearchChange={handleSearchChange}
              searchPlaceholder={translate('history.searchPlaceholder')}
              filtersConfig={filtersConfig}
              onFilterChange={handleFilterChange}
              pagination={{
                currentPage,
                totalPages,
                totalRecords: total,
                itemsPerPage: PAGE_SIZE,
              }}
              onPageChange={setCurrentPage}
              showPagination={true}
              size="md"
              background="white"
              rounded={false}
              shadow={false}
              getRowId={(row: TopUpHistoryEntry) => row.id}
              emptyText={translate('history.empty')}
              showRowMenu
              rowMenuOptions={rowMenuOptions}
              onRowMenuSelect={handleRowMenuSelect}
              className="w-full overflow-visible! max-md:**:[[role=group]]:w-full max-md:**:[[role=group]]:flex-wrap [&_tbody_tr]:border-mds-black-100 [&_td]:px-3 [&_td]:py-3 sm:[&_td]:px-4 sm:[&_td]:py-3.5 [&_th]:whitespace-nowrap [&_th]:px-3 [&_th]:py-3 sm:[&_th]:px-4 [&_th]:text-[11px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-mds-black-500 [&_thead_tr]:bg-mds-black-50"
            />
          </div>
        </div>
      </ContentCard>

      <TopUpDetailsModal
        isOpen={isDetailsOpen}
        onClose={closeDetails}
        details={details}
        isLoading={isDetailsLoading}
        isError={isDetailsError}
        onRetry={() => {
          void retryDetails();
        }}
      />
    </>
  );
}
