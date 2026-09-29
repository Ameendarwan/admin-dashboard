'use client';

import { Button, Table } from '@merit-incentives/ui';
import { CheckCircle2, Hourglass, XCircle } from 'lucide-react';

import { GIFT_CARD_PAGE_SIZE } from '@/app/(protected)/gift-card-management/constants/giftCardManagementConstants';
import { useActivationRequestTableColumns } from '@/app/(protected)/gift-card-management/hooks/useGiftCardManagementTableColumns';
import { useActivationRequestsTabTable } from '@/app/(protected)/gift-card-management/hooks/useActivationRequestsTabTable';
import type { ActivationRequestRow } from '@/types/catalog';

import { ActivationRequestsStatsCards } from '../../../ActivationRequestsStatsCards';

interface ActivationRequestsTabPanelProps {
  translate: (key: string, values?: Record<string, string | number>) => string;
  pending: number;
  approved: number;
  rejected: number;
  columns: ReturnType<typeof useActivationRequestTableColumns>;
  rows: ActivationRequestRow[];
  onSearchChange: (value: string) => void;
  tenantFilter: string;
  onTenantFilterChange: (value: string) => void;
  tenantOptions: { value: string; label: string }[];
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  statusOptions: { value: string; label: string }[];
  page: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading: boolean;
  error: boolean;
  retrying: boolean;
  onRetry: () => void;
  rowMenuOptions: { value: string; label: string }[];
  onRowMenuSelect: (value: string, row: ActivationRequestRow) => void;
  onRowClick: (row: ActivationRequestRow) => void;
}

export function ActivationRequestsTabPanel({
  translate,
  pending,
  approved,
  rejected,
  columns,
  rows,
  onSearchChange,
  tenantFilter,
  onTenantFilterChange,
  tenantOptions,
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  page,
  total,
  totalPages,
  onPageChange,
  loading,
  error,
  retrying,
  onRetry,
  rowMenuOptions,
  onRowMenuSelect,
  onRowClick,
}: Readonly<ActivationRequestsTabPanelProps>) {
  const { searchValue, handleSearchChange, filtersConfig, handleFilterChange } =
    useActivationRequestsTabTable({
      onSearchChange,
      onTenantFilterChange,
      onStatusFilterChange,
      tenantFilter,
      statusFilter,
      tenantOptions,
      statusOptions,
      translate,
    });

  return (
    <div className="relative space-y-4">
      <div className="relative z-0">
        <ActivationRequestsStatsCards
          pending={pending}
          approved={approved}
          rejected={rejected}
          labels={{
            pending: translate(
              'giftCardManagement.activationRequests.stats.pending',
            ),
            approved: translate(
              'giftCardManagement.activationRequests.stats.approved',
            ),
            rejected: translate(
              'giftCardManagement.activationRequests.stats.rejected',
            ),
          }}
          icons={{
            pending: Hourglass,
            approved: CheckCircle2,
            rejected: XCircle,
          }}
        />
      </div>
      <div className="relative z-20 overflow-visible">
        <Table
          className="min-h-[50vh]! overflow-visible!"
          columns={columns}
          data={rows}
          showSearch={true}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          searchPlaceholder={translate(
            'giftCardManagement.activationRequests.searchPlaceholder',
          )}
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
          getRowId={(row: ActivationRequestRow) => row.id}
          showRowMenu={true}
          rowMenuOptions={rowMenuOptions}
          onRowMenuSelect={(value, row) =>
            onRowMenuSelect(String(value), row as ActivationRequestRow)
          }
          onRowClick={onRowClick}
          emptyText={
            error
              ? translate('giftCardManagement.activationRequests.loadError')
              : translate('giftCardManagement.activationRequests.empty')
          }
          loading={loading}
        />
        {error ? (
          <div className="mt-3">
            <Button
              variant="secondary"
              type="button"
              loading={retrying}
              disabled={retrying}
              onClick={() => {
                onRetry();
              }}
            >
              {translate('giftCardManagement.activationRequests.retry')}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
