'use client';

import { useMemo } from 'react';
import { Badge } from '@merit-incentives/ui';

import type {
  ActiveListingRow,
  CatalogOfferListRow,
  ListingRequestRow,
} from '@/types/catalog';

import { CatalogListingsProductCell } from '../components/CatalogListingsProductCell';
import { ListingStatusBadge } from '../components/ListingStatusBadge';
import {
  matchResultToColor,
  listingRequestMatchResultLabel,
} from '../utils/listingStatusBadgeHelpers';

export function useCatalogActiveListingTableColumns(
  translate: (key: string) => string,
) {
  return useMemo(
    () => [
      {
        key: 'product' as const,
        label: translate('listings.table.product'),
        render: (row: ActiveListingRow) => (
          <CatalogListingsProductCell
            name={row.productName}
            imageUrl={row.imageUrl}
          />
        ),
        showOnMobile: true,
      },
      {
        key: 'brand' as const,
        label: translate('listings.table.brand'),
        render: (row: ActiveListingRow) => (
          <span className="text-mds-gray-800">{row.brand}</span>
        ),
        showOnMobile: true,
      },
      {
        key: 'category' as const,
        label: translate('listings.table.category'),
        render: (row: ActiveListingRow) => (
          <span className="text-mds-gray-800">{row.category}</span>
        ),
      },
      {
        key: 'subCategory' as const,
        label: translate('listings.table.subCategory'),
        render: (row: ActiveListingRow) => (
          <span className="text-mds-gray-800">{row.subCategory}</span>
        ),
      },
      {
        key: 'offers' as const,
        label: translate('listings.table.offers'),
        render: (row: ActiveListingRow) => (
          <span className="tabular-nums text-mds-gray-900">
            {row.offerCount}
          </span>
        ),
        align: 'center' as const,
      },
      {
        key: 'status' as const,
        label: translate('listings.table.status'),
        render: (row: ActiveListingRow) => (
          <ListingStatusBadge kind="listing" status={row.status} />
        ),
        align: 'center' as const,
      },
      {
        key: 'created' as const,
        label: translate('listings.table.createdOn'),
        render: (row: ActiveListingRow) => (
          <span className="text-mds-gray-800">{row.createdOn}</span>
        ),
      },
    ],
    [translate],
  );
}

export function useCatalogRequestListingTableColumns(
  translate: (key: string) => string,
) {
  return useMemo(
    () => [
      {
        key: 'product' as const,
        label: translate('requests.table.product'),
        render: (row: ListingRequestRow) => (
          <CatalogListingsProductCell
            name={row.productName}
            imageUrl={row.imageUrl}
          />
        ),
        showOnMobile: true,
      },
      {
        key: 'brand' as const,
        label: translate('requests.table.brand'),
        render: (row: ListingRequestRow) => (
          <span className="text-mds-gray-800">{row.brand}</span>
        ),
      },
      {
        key: 'seller' as const,
        label: translate('requests.table.seller'),
        render: (row: ListingRequestRow) => (
          <span className="text-mds-gray-800">{row.seller}</span>
        ),
      },
      {
        key: 'category' as const,
        label: translate('requests.table.category'),
        render: (row: ListingRequestRow) => (
          <span className="text-mds-gray-800">{row.category}</span>
        ),
      },
      {
        key: 'subCategory' as const,
        label: translate('requests.table.subCategory'),
        render: (row: ListingRequestRow) => (
          <span className="text-mds-gray-800">{row.subCategory}</span>
        ),
      },
      {
        key: 'status' as const,
        label: translate('requests.table.status'),
        render: (row: ListingRequestRow) => (
          <ListingStatusBadge kind="request" status={row.status} />
        ),
        align: 'center' as const,
      },
      {
        key: 'matchResult' as const,
        label: translate('requests.table.matchResult'),
        render: (row: ListingRequestRow) =>
          row.matchResult ? (
            <Badge
              className="whitespace-nowrap"
              color={matchResultToColor[row.matchResult]}
              leftIcon
              size="lg"
            >
              {listingRequestMatchResultLabel(row.matchResult, translate)}
            </Badge>
          ) : (
            <span className="text-mds-gray-800">—</span>
          ),
      },
      {
        key: 'submitted' as const,
        label: translate('requests.table.submittedOn'),
        render: (row: ListingRequestRow) => (
          <span className="text-mds-gray-800">{row.submittedOn}</span>
        ),
      },
    ],
    [translate],
  );
}

export function useCatalogActiveOfferTableColumns(
  translate: (key: string) => string,
) {
  return useMemo(
    () => [
      {
        key: 'sku' as const,
        label: translate('offersTable.sku'),
        render: (row: CatalogOfferListRow) => (
          <span className="text-mds-gray-800">{row.sku}</span>
        ),
      },
      {
        key: 'seller' as const,
        label: translate('offersTable.seller'),
        render: (row: CatalogOfferListRow) => (
          <span className="text-mds-gray-800">{row.seller}</span>
        ),
      },
      {
        key: 'product' as const,
        label: translate('offersTable.product'),
        render: (row: CatalogOfferListRow) => (
          <CatalogListingsProductCell
            name={row.productName}
            imageUrl={row.imageUrl}
          />
        ),
        showOnMobile: true,
      },
      {
        key: 'category' as const,
        label: translate('offersTable.category'),
        render: (row: CatalogOfferListRow) => (
          <span className="text-mds-gray-800">{row.category}</span>
        ),
      },
      {
        key: 'subCategory' as const,
        label: translate('offersTable.subCategory'),
        render: (row: CatalogOfferListRow) => (
          <span className="text-mds-gray-800">{row.subCategory}</span>
        ),
      },
      {
        key: 'condition' as const,
        label: translate('offersTable.condition'),
        render: (row: CatalogOfferListRow) => (
          <span className="text-mds-gray-800">{row.conditionDisplay}</span>
        ),
      },
      {
        key: 'priceCol' as const,
        label: translate('offersTable.price'),
        render: (row: CatalogOfferListRow) => (
          <span className="font-medium text-mds-gray-900">
            {row.priceDisplay}
          </span>
        ),
      },
      {
        key: 'stockQty' as const,
        label: translate('offersTable.stock'),
        render: (row: CatalogOfferListRow) => (
          <span className="tabular-nums text-mds-gray-800">{row.stock}</span>
        ),
        align: 'center' as const,
      },
      {
        key: 'locationCol' as const,
        label: translate('offersTable.location'),
        render: (row: CatalogOfferListRow) => (
          <span className="text-mds-gray-800">{row.location}</span>
        ),
      },
      {
        key: 'salesChannel' as const,
        label: translate('offersTable.salesChannel'),
        render: (row: CatalogOfferListRow) => (
          <span className="text-mds-gray-800">{row.salesChannel}</span>
        ),
      },
      {
        key: 'status' as const,
        label: translate('offersTable.status'),
        render: (row: CatalogOfferListRow) => (
          <ListingStatusBadge kind="offer" status={row.status} />
        ),
        align: 'center' as const,
      },
      {
        key: 'submitted' as const,
        label: translate('offersTable.submittedOn'),
        render: (row: CatalogOfferListRow) => (
          <span className="text-mds-gray-800">{row.submittedOn}</span>
        ),
      },
    ],
    [translate],
  );
}
