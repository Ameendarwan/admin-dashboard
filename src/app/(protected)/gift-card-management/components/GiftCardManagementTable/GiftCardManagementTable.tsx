'use client';

import { Pagination, Table } from '@merit-incentives/ui';
import type { ReactNode } from 'react';

import { useLocalization } from '@/hooks/useLocalization';

const TABLE_CLASS_NAME =
  '!min-h-[32vh] min-w-[720px] w-full !shadow-none sm:!min-h-[36vh] [&_tbody_tr]:border-0 [&_td]:border-0 [&_td]:px-3 [&_td]:py-3 sm:[&_td]:px-4 [&_td]:py-3.5 [&_th]:whitespace-nowrap [&_th]:px-3 [&_th]:py-3 sm:[&_th]:px-4 [&_th]:text-[11px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-mds-black-500 [&_thead_tr]:bg-mds-black-50';

type GiftCardManagementTableColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  showOnMobile?: boolean;
  align?: 'left' | 'center' | 'right';
};

interface GiftCardManagementTableProps<T extends { id: string }> {
  columns: GiftCardManagementTableColumn<T>[];
  rows: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  emptyText?: string;
  showRowMenu?: boolean;
  rowMenuOptions?: { value: string; label: string }[];
  onRowMenuSelect?: (value: string, row: T) => void;
  onRowClick?: (row: T) => void;
}

export function GiftCardManagementTable<T extends { id: string }>({
  columns,
  rows,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  loading = false,
  emptyText,
  showRowMenu = true,
  rowMenuOptions,
  onRowMenuSelect,
  onRowClick,
}: Readonly<GiftCardManagementTableProps<T>>) {
  const { translate } = useLocalization('catalog');

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(from + Math.max(rows.length - 1, 0), total);

  return (
    <>
      <div className="overflow-x-auto">
        <Table
          className={TABLE_CLASS_NAME}
          columns={columns}
          data={rows}
          showSearch={false}
          showPagination={false}
          getRowId={(row: T) => row.id}
          size="md"
          background="white"
          rounded={true}
          shadow={true}
          emptyText={emptyText ?? translate('noResults')}
          loading={loading}
          showRowMenu={showRowMenu}
          rowMenuOptions={rowMenuOptions}
          onRowMenuSelect={onRowMenuSelect}
          onRowClick={onRowClick}
        />
      </div>
      {total > 0 && (
        <p
          className="border-t border-mds-black-100 px-4 py-3 text-xs text-mds-black-600 sm:px-5 sm:text-sm"
          aria-live="polite"
        >
          {translate('showingResults', {
            from: String(from),
            to: String(to),
            total: String(total),
          })}
        </p>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center border-t border-mds-black-100 px-4 py-3 sm:justify-end sm:px-5">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );
}
