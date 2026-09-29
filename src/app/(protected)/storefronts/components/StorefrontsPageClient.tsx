'use client';

import { Button, Table } from '@merit-incentives/ui';
import { PlusCircleIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { useLocalization } from '@/hooks/useLocalization';
import { buildStorefrontPublicUrl } from '@/lib/storefrontUtils';
import type {
  StorefrontListRow,
  StorefrontListStatus,
} from '@/types/storefront';
import { STOREFRONT_STATUSES } from '@/types/storefrontAdminApi';
import { openUrlInNewTab } from '@/utils/urlUtils';

import { useStorefrontsPage } from '../hooks/useStorefrontsPage';
import { useStorefrontsTable } from '../hooks/useStorefrontsTable';
import { useStorefrontsTableColumns } from '../hooks/useStorefrontsTableColumns';

export function StorefrontsPageClient() {
  const router = useRouter();
  const { translate } = useLocalization('storefronts');
  const {
    page,
    setPage,
    pageSize,
    rows,
    total,
    totalPages,
    setSearch,
    statusFilter,
    setStatusFilter,
    loading,
    isError,
    refetch,
  } = useStorefrontsPage();

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: translate('allStatuses') },
      ...STOREFRONT_STATUSES.map((status) => ({
        value: status,
        label: translate(`status.${status}`),
      })),
    ],
    [translate],
  );

  const handleCreateStorefront = useCallback(() => {
    router.push('/storefronts/new');
  }, [router]);

  const handleOpenStorefront = useCallback((row: StorefrontListRow) => {
    if (row.status !== 'live') {
      return;
    }

    const url = buildStorefrontPublicUrl(row.urlSlug);
    if (url) {
      openUrlInNewTab(url);
    }
  }, []);

  const columns = useStorefrontsTableColumns(translate, handleOpenStorefront);

  const handleStatusFilterChange = useCallback(
    (value: StorefrontListStatus | 'all') => {
      setStatusFilter(value);
    },
    [setStatusFilter],
  );

  const { searchValue, handleSearchChange, filtersConfig, handleFilterChange } =
    useStorefrontsTable({
      onSearchChange: setSearch,
      onStatusFilterChange: handleStatusFilterChange,
      statusFilter,
      statusOptions,
      translate,
    });

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(from + Math.max(rows.length - 1, 0), total);

  if (isError) {
    return (
      <div
        id="storefronts-page"
        className="min-h-0 pb-8 pt-2 sm:pb-10 md:pb-12 md:pt-4"
      >
        <div className="flex flex-col gap-4 rounded-lg border border-mds-black-100 bg-white p-6">
          <p className="text-sm text-red-600">{translate('loadError')}</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-fit"
            onClick={() => void refetch()}
          >
            {translate('retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="storefronts-page"
      className="min-h-0 pb-8 pt-2 sm:pb-10 md:pb-12 md:pt-4"
    >
      <div className="space-y-5 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-medium text-mds-black-900 sm:text-[34px]">
            {translate('pageTitle')}
          </h1>
          <Button
            variant="primary"
            type="button"
            onClick={handleCreateStorefront}
            leftIcon={<PlusCircleIcon className="h-5 w-5" aria-hidden />}
            className="w-full shrink-0 rounded-lg sm:w-auto"
          >
            {translate('createStorefront')}
          </Button>
        </div>

        <div className="relative overflow-visible" style={{ zIndex: 10 }}>
          <Table
            className="min-h-[50vh]!"
            columns={columns}
            data={rows}
            showSearch={true}
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            searchPlaceholder={translate('searchPlaceholder')}
            filtersConfig={filtersConfig}
            onFilterChange={handleFilterChange}
            pagination={{
              currentPage: page,
              totalPages,
              totalRecords: total,
              itemsPerPage: pageSize,
            }}
            onPageChange={setPage}
            showPagination={true}
            size="md"
            background="white"
            rounded={true}
            shadow={true}
            showCheckboxes={false}
            getRowId={(row: StorefrontListRow) => row.id}
            showRowMenu={false}
            emptyText={translate('noResults')}
            loading={loading}
          />
          {total > 0 ? (
            <p className="mt-3 text-sm text-mds-black-600" aria-live="polite">
              {translate('showingResults', {
                from: String(from),
                to: String(to),
                total: String(total),
              })}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
