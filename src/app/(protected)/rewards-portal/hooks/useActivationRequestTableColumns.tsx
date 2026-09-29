'use client';

import { useMemo } from 'react';

import { GiftCardManagementStatusBadge } from '@/app/(protected)/gift-card-management/components';
import type { ActivationRequestRow } from '@/types/catalog';

export function useActivationRequestTableColumns(
  translate: (key: string, values?: Record<string, string | number>) => string,
  onRequestIdClick?: (row: ActivationRequestRow) => void,
) {
  return useMemo(
    () => [
      {
        key: 'requestId' as const,
        label: translate('activationRequests.table.requestId'),
        render: (row: ActivationRequestRow) => (
          <button
            type="button"
            className="text-left text-base font-medium leading-[1.4] text-mds-black-900 underline decoration-solid underline-offset-2 hover:text-mds-primary-700"
            onClick={(event) => {
              event.stopPropagation();
              onRequestIdClick?.(row);
            }}
          >
            {row.id}
          </button>
        ),
        showOnMobile: true,
      },
      {
        key: 'cards' as const,
        label: translate('activationRequests.table.cards'),
        render: (row: ActivationRequestRow) => (
          <span className="text-base font-medium leading-[1.4] text-mds-black-900">
            {row.cardsLabel}
          </span>
        ),
      },
      {
        key: 'submitted' as const,
        label: translate('activationRequests.table.submitted'),
        render: (row: ActivationRequestRow) => (
          <span className="text-base font-medium leading-[1.4] text-mds-black-900">
            {row.submittedAt}
          </span>
        ),
      },
      {
        key: 'status' as const,
        label: translate('activationRequests.table.status'),
        render: (row: ActivationRequestRow) => (
          <GiftCardManagementStatusBadge
            kind="activation-request"
            status={row.status}
          />
        ),
      },
    ],
    [onRequestIdClick, translate],
  );
}
