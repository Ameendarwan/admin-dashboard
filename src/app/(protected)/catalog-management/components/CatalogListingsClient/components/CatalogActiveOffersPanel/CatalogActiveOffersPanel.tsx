'use client';

import { Table } from '@merit-incentives/ui';
import type { ReactNode } from 'react';

import type { useCatalogActiveOfferTableColumns } from '@/app/(protected)/catalog-management/hooks/useCatalogListingsTableColumns';
import type { CatalogOfferListRow } from '@/types/catalog';

interface CatalogActiveOffersPanelProps {
  translate: (key: string, values?: Record<string, string | number>) => string;
  toolbar: ReactNode;
  columns: ReturnType<typeof useCatalogActiveOfferTableColumns>;
  rows: CatalogOfferListRow[];
  page: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  total: number;
  pageSize: number;
  loading: boolean;
  rowMenuOptions: { value: string; label: string }[];
  onRowMenuSelect: (value: string, row: CatalogOfferListRow) => void;
  onRowClick: (row: CatalogOfferListRow) => void;
  from: number;
  to: number;
}

export function CatalogActiveOffersPanel({
  translate,
  toolbar,
  columns,
  rows,
  page,
  onPageChange,
  totalPages,
  total,
  pageSize,
  loading,
  rowMenuOptions,
  onRowMenuSelect,
  onRowClick,
  from,
  to,
}: Readonly<CatalogActiveOffersPanelProps>) {
  return (
    <div>
      {toolbar}
      <div
        className="relative overflow-hidden rounded-lg border border-mds-black-100 bg-white"
        style={{ zIndex: 10 }}
      >
        <Table
          className="min-h-[50vh]! shadow-none!"
          columns={columns}
          data={rows}
          showSearch={false}
          showPagination
          onPageChange={onPageChange}
          pagination={{
            currentPage: page,
            totalPages,
            totalRecords: total,
            itemsPerPage: pageSize,
          }}
          getRowId={(r: CatalogOfferListRow) => r.id}
          size="md"
          background="white"
          rounded={false}
          shadow={false}
          showRowMenu
          rowMenuOptions={rowMenuOptions}
          onRowMenuSelect={(v, r) =>
            onRowMenuSelect(String(v), r as CatalogOfferListRow)
          }
          onRowClick={(r) => onRowClick(r as CatalogOfferListRow)}
          emptyText={translate('noResults')}
          loading={loading}
        />
        {total > 0 && (
          <p
            className="border-t border-mds-black-100 px-4 py-3 text-sm text-mds-black-600 sm:px-5"
            aria-live="polite"
          >
            {translate('showingResults', {
              from: String(from),
              to: String(to),
              total: String(total),
            })}
          </p>
        )}
      </div>
    </div>
  );
}
