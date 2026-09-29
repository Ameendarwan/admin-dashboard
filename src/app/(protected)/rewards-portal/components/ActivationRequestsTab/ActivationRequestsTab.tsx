'use client';

import { Button, ContentCard, Table } from '@merit-incentives/ui';

import { REWARDS_PORTAL_PAGE_SIZE } from '@/app/(protected)/rewards-portal/constants/rewardsPortalConstants';
import type { ActivationRequestRow } from '@/types/catalog';

import { useActivationRequestsTab } from '../../hooks/useActivationRequestsTab';
// Filters temporarily disabled per Figma.
// import { useActivationRequestsTabTable } from '../../hooks/useActivationRequestsTabTable';

interface ActivationRequestsTabProps {
  tenantId: string;
}

export function ActivationRequestsTab({
  tenantId,
}: Readonly<ActivationRequestsTabProps>) {
  const {
    translate,
    columns,
    rows,
    page,
    setPage,
    total,
    totalPages,
    // onSearchChange,
    // statusFilter,
    // onStatusFilterChange,
    // statusOptions,
    loading,
    error,
    retrying,
    onRetry,
    rowMenuOptions,
    onRowMenuSelect,
    onRowClick,
  } = useActivationRequestsTab({ tenantId });

  // const { searchValue, handleSearchChange, filtersConfig, handleFilterChange } =
  //   useActivationRequestsTabTable({
  //     onSearchChange,
  //     onStatusFilterChange,
  //     statusFilter,
  //     statusOptions,
  //     translate,
  //   });

  return (
    <ContentCard className="overflow-visible rounded-mds-md border border-mds-black-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-5">
        <h2 className="text-xl font-medium leading-[1.2] text-mds-black-900">
          {translate('activationRequests.title', { count: total })}
        </h2>

        {/* -mx-4 cancels card padding so Table aligns with the heading. */}
        <div className="relative -mx-4 overflow-visible" style={{ zIndex: 10 }}>
          <Table
            className="w-full [&_tbody_tr]:border-mds-black-100 [&_td]:px-3 [&_td]:py-3 sm:[&_td]:px-4 sm:[&_td]:py-3.5 [&_th]:whitespace-nowrap [&_th]:px-3 [&_th]:py-3 sm:[&_th]:px-4 [&_th]:text-sm [&_th]:font-semibold [&_th]:text-mds-black-600 [&_thead_tr]:bg-mds-black-50"
            columns={columns}
            data={rows}
            showSearch={false}
            // searchValue={searchValue}
            // onSearchChange={handleSearchChange}
            // searchPlaceholder={translate('activationRequests.searchPlaceholder')}
            // filtersConfig={filtersConfig}
            // onFilterChange={handleFilterChange}
            pagination={{
              currentPage: page,
              totalPages,
              totalRecords: total,
              itemsPerPage: REWARDS_PORTAL_PAGE_SIZE,
            }}
            onPageChange={setPage}
            showPagination={totalPages > 1}
            size="md"
            background="white"
            rounded={false}
            shadow={false}
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
                ? translate('activationRequests.loadError')
                : translate('activationRequests.empty')
            }
            loading={loading}
          />
        </div>

        {error ? (
          <div className="px-4 flex justify-center">
            <Button
              variant="secondary"
              type="button"
              loading={retrying}
              disabled={retrying}
              onClick={() => {
                onRetry();
              }}
            >
              {translate('activationRequests.retry')}
            </Button>
          </div>
        ) : null}
      </div>
    </ContentCard>
  );
}
