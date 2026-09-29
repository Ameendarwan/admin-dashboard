'use client';

import { useMemo } from 'react';

import type { ActivationRequestRow, GiftCardRow } from '@/types/catalog';
import {
  GiftCardBrandCell,
  GiftCardDenominationTypeBadge,
  GiftCardManagementStatusBadge,
} from '@/app/(protected)/gift-card-management/components';

export function useGiftCardTableColumns(
  translate: (key: string, values?: Record<string, string | number>) => string,
) {
  return useMemo(
    () => [
      {
        key: 'card' as const,
        label: translate('giftCardManagement.table.card'),
        render: (row: GiftCardRow) => (
          <GiftCardBrandCell
            name={row.name}
            imageInitials={row.imageInitials}
            imageColor={row.imageColor}
          />
        ),
        showOnMobile: true,
      },
      {
        key: 'category' as const,
        label: translate('giftCardManagement.table.category'),
        render: (row: GiftCardRow) => (
          <span className="text-sm text-mds-black-800">{row.category}</span>
        ),
      },
      {
        key: 'denominationType' as const,
        label: translate('giftCardManagement.table.denominationType'),
        render: (row: GiftCardRow) => (
          <GiftCardDenominationTypeBadge
            denominationType={row.denominationType}
          />
        ),
      },
      // {
      //   key: 'salesChannels' as const,
      //   label: translate('giftCardManagement.table.salesChannels'),
      //   render: (row: GiftCardRow) => (
      //     <span className="tabular-nums text-sm text-mds-black-800">
      //       {row.salesChannels === null
      //         ? '—'
      //         : String(row.salesChannels).padStart(2, '0')}
      //     </span>
      //   ),
      //   align: 'center' as const,
      // },
      // {
      //   key: 'activations' as const,
      //   label: translate('giftCardManagement.table.activations'),
      //   render: (row: GiftCardRow) => (
      //     <span className="tabular-nums text-sm text-mds-black-800">
      //       {row.activations === null
      //         ? '—'
      //         : String(row.activations).padStart(2, '0')}
      //     </span>
      //   ),
      //   align: 'center' as const,
      // },
      {
        key: 'country' as const,
        label: translate('giftCardManagement.table.country'),
        render: (row: GiftCardRow) => (
          <span className="text-sm text-mds-black-800">{row.countries}</span>
        ),
      },
      {
        key: 'status' as const,
        label: translate('giftCardManagement.table.status'),
        render: (row: GiftCardRow) => (
          <GiftCardManagementStatusBadge kind="gift-card" status={row.status} />
        ),
      },
    ],
    [translate],
  );
}

export function useActivationRequestTableColumns(
  translate: (key: string, values?: Record<string, string | number>) => string,
) {
  return useMemo(
    () => [
      {
        key: 'tenant' as const,
        label: translate('giftCardManagement.activationRequests.table.tenant'),
        render: (row: ActivationRequestRow) => (
          <span className="text-sm font-medium text-mds-black-900">
            {row.tenantName !== '-' ? row.tenantName : row.tenantId}
          </span>
        ),
        showOnMobile: true,
      },
      {
        key: 'owner' as const,
        label: translate('giftCardManagement.activationRequests.table.owner'),
        render: (row: ActivationRequestRow) => (
          <span className="text-sm text-mds-black-800">
            {row.businessOwnerEmail}
          </span>
        ),
      },
      {
        key: 'cards' as const,
        label: translate('giftCardManagement.activationRequests.table.cards'),
        render: (row: ActivationRequestRow) => (
          <span className="tabular-nums text-sm text-mds-black-800">
            {row.cardsLabel}
          </span>
        ),
      },
      {
        key: 'submitted' as const,
        label: translate(
          'giftCardManagement.activationRequests.table.submitted',
        ),
        render: (row: ActivationRequestRow) => (
          <span className="text-sm text-mds-black-800">{row.submittedAt}</span>
        ),
      },
      {
        key: 'status' as const,
        label: translate('giftCardManagement.table.status'),
        render: (row: ActivationRequestRow) => (
          <GiftCardManagementStatusBadge
            kind="activation-request"
            status={row.status}
          />
        ),
        align: 'center' as const,
      },
    ],
    [translate],
  );
}
