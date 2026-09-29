'use client';

import { Badge, Table } from '@merit-incentives/ui';
import { useMemo } from 'react';

import { useCatalogListSearchTable } from '@/app/(protected)/catalog-management/hooks/useCatalogListSearchTable';
import { catalogOfferLifecycleMessageKey } from '@/app/(protected)/catalog-management/utils/listingStatusBadgeHelpers';
import type { EcommerceOfferStatus, SellerOfferRow } from '@/types/catalog';

import { VariantChipsRow } from '../../../VariantChipsRow';

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

function offerBadge(status: EcommerceOfferStatus, translate: TranslateFn) {
  const colors = {
    ACTIVE: 'success' as const,
    INACTIVE: 'gray' as const,
    EXPIRED: 'warning' as const,
  };
  return {
    color: colors[status],
    text: translate(catalogOfferLifecycleMessageKey(status)),
  };
}

interface ListingDetailSellerOffersProps {
  translate: TranslateFn;
  onOfferSearchChange: (value: string) => void;
  offersError: string | null;
  pagedOffers: SellerOfferRow[];
  filteredOffersCount: number;
  offersPage: number;
  totalOfferPages: number;
  offerPageSize: number;
  offersLoading: boolean;
  onPageChange: (page: number) => void;
  onRowClick: (row: SellerOfferRow) => void;
}

export function ListingDetailSellerOffers({
  translate,
  onOfferSearchChange,
  offersError,
  pagedOffers,
  filteredOffersCount,
  offersPage,
  totalOfferPages,
  offerPageSize,
  offersLoading,
  onPageChange,
  onRowClick,
}: Readonly<ListingDetailSellerOffersProps>) {
  const { searchValue, handleSearchChange } = useCatalogListSearchTable({
    onSearchChange: onOfferSearchChange,
  });

  const offerColumns = useMemo(
    () => [
      {
        key: 'sku' as const,
        label: translate('offersTable.sku'),
        render: (row: SellerOfferRow) => (
          <span className="font-mono text-sm text-mds-gray-900">{row.sku}</span>
        ),
      },
      {
        key: 'seller' as const,
        label: translate('offersTable.seller'),
        render: (row: SellerOfferRow) => (
          <span className="text-mds-gray-800">{row.seller}</span>
        ),
      },
      {
        key: 'ch' as const,
        label: translate('offersTable.salesChannel'),
        render: (row: SellerOfferRow) => (
          <span className="text-mds-gray-800">{row.salesChannel}</span>
        ),
      },
      {
        key: 'variants' as const,
        label: translate('offersTable.variants'),
        render: (row: SellerOfferRow) => (
          <VariantChipsRow tags={row.variantTags} />
        ),
      },
      {
        key: 'loc' as const,
        label: translate('offersTable.location'),
        render: (row: SellerOfferRow) => (
          <span className="text-mds-gray-800">{row.location}</span>
        ),
      },
      {
        key: 'stock' as const,
        label: translate('offersTable.stock'),
        render: (row: SellerOfferRow) => (
          <span className="tabular-nums">{row.stock}</span>
        ),
        align: 'center' as const,
      },
      {
        key: 'price' as const,
        label: translate('offersTable.price'),
        render: (row: SellerOfferRow) => (
          <span className="font-medium text-mds-gray-900">
            {row.priceLabel}
          </span>
        ),
      },
      {
        key: 'st' as const,
        label: translate('offersTable.status'),
        render: (row: SellerOfferRow) => {
          const b = offerBadge(row.status, translate);
          return (
            <Badge
              className="whitespace-nowrap"
              color={b.color}
              leftIcon
              size="sm"
            >
              {b.text}
            </Badge>
          );
        },
        align: 'center' as const,
      },
      {
        key: 'sub' as const,
        label: translate('offersTable.submittedOn'),
        render: (row: SellerOfferRow) => (
          <span className="text-mds-gray-800">{row.submittedOn}</span>
        ),
      },
    ],
    [translate],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-mds-black-100 bg-white shadow-sm">
      <div className="border-b border-mds-black-100 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold tracking-tight text-mds-black-900">
          {translate('listingDetails.sellerOffers')}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-mds-black-600">
          {translate('listingDetails.sellerOffersSubtitle')}
        </p>
      </div>
      <div
        className="relative overflow-visible p-4 sm:p-5"
        style={{ zIndex: 10 }}
      >
        {offersError ? (
          <p className="mb-3 text-sm text-red-700" role="alert">
            {offersError}
          </p>
        ) : null}
        <Table
          className="min-h-[50vh]!"
          columns={offerColumns}
          data={pagedOffers}
          showSearch={true}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          searchPlaceholder={translate('listingDetails.searchPlaceholder')}
          showPagination={filteredOffersCount > offerPageSize}
          onPageChange={onPageChange}
          pagination={{
            currentPage: offersPage,
            totalPages: totalOfferPages,
            totalRecords: filteredOffersCount,
            itemsPerPage: offerPageSize,
          }}
          getRowId={(r: SellerOfferRow) => r.id}
          size="md"
          background="white"
          rounded={true}
          shadow={true}
          emptyText={translate('noResults')}
          loading={offersLoading}
          onRowClick={(r) => onRowClick(r as SellerOfferRow)}
        />
        {filteredOffersCount > 0 ? (
          <p className="mt-3 text-sm text-mds-black-600">
            {translate('showingResults', {
              from: String(
                (offersPage - 1) * offerPageSize + (pagedOffers.length ? 1 : 0),
              ),
              to: String((offersPage - 1) * offerPageSize + pagedOffers.length),
              total: String(filteredOffersCount),
            })}
          </p>
        ) : null}
      </div>
    </div>
  );
}
