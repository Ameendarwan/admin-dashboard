'use client';

import { Table } from '@merit-incentives/ui';

import { GIFT_CARD_PAGE_SIZE } from '@/app/(protected)/gift-card-management/constants/giftCardManagementConstants';
import { useGiftCardTableColumns } from '@/app/(protected)/gift-card-management/hooks/useGiftCardManagementTableColumns';
import { useGiftCardsTabTable } from '@/app/(protected)/gift-card-management/hooks/useGiftCardsTabTable';
import { TableStateDisplay } from '@/components/TableStateDisplay';
import type { GiftCardRow } from '@/types/catalog';

interface GiftCardsTabPanelProps {
  translate: (key: string, values?: Record<string, string | number>) => string;
  columns: ReturnType<typeof useGiftCardTableColumns>;
  rows: GiftCardRow[];
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categoryOptions: { value: string; label: string }[];
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  statusOptions: { value: string; label: string }[];
  page: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onRowClick: (row: GiftCardRow) => void;
}

export function GiftCardsTabPanel({
  translate,
  columns,
  rows,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  categoryOptions,
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  page,
  total,
  totalPages,
  onPageChange,
  loading,
  error,
  onRetry,
  onRowClick,
}: Readonly<GiftCardsTabPanelProps>) {
  const { searchValue, handleSearchChange, filtersConfig, handleFilterChange } =
    useGiftCardsTabTable({
      onSearchChange,
      onCategoryFilterChange,
      onStatusFilterChange,
      categoryFilter,
      statusFilter,
      categoryOptions,
      statusOptions,
      translate,
    });

  if (error) {
    return (
      <TableStateDisplay
        type="error"
        title={translate('giftCardManagement.giftCardsLoadError')}
        description=""
        showRetryButton
        onRetry={onRetry}
        retryLoading={loading}
        retryButtonText={translate('giftCardManagement.giftCardsRetry')}
      />
    );
  }

  return (
    <div className="relative overflow-visible" style={{ zIndex: 10 }}>
      <Table
        className="min-h-[50vh]!"
        columns={columns}
        data={rows}
        showSearch={true}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder={translate('giftCardManagement.searchPlaceholder')}
        filtersConfig={filtersConfig}
        onFilterChange={handleFilterChange}
        pagination={{
          currentPage: page,
          totalPages,
          totalRecords: total,
          itemsPerPage: GIFT_CARD_PAGE_SIZE,
        }}
        onPageChange={onPageChange}
        showPagination={true}
        size="md"
        background="white"
        rounded={true}
        shadow={true}
        showCheckboxes={false}
        getRowId={(row: GiftCardRow) => row.id}
        showRowMenu={true}
        rowMenuOptions={[
          {
            value: 'view',
            label: translate('menuView'),
          },
        ]}
        onRowMenuSelect={(_value, row) => {
          onRowClick(row as GiftCardRow);
        }}
        onRowClick={onRowClick}
        emptyText={translate('giftCardManagement.giftCardsEmpty')}
        loading={loading}
      />
    </div>
  );
}
