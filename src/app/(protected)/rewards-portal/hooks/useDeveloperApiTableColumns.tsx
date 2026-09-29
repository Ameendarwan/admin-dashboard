'use client';

import { useMemo } from 'react';
import { Badge } from '@merit-incentives/ui';
import { Ban, RotateCcw } from 'lucide-react';

import { formatDateForDisplay } from '@/hooks';
import {
  DEVELOPER_API_KEY_STATUS,
  type DeveloperApiKeyRow,
} from '@/mock/rewardsPortalDeveloperApi';

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

interface UseDeveloperApiTableColumnsParams {
  translate: TranslateFn;
  onSuspend: (row: DeveloperApiKeyRow) => void;
  onRestore: (row: DeveloperApiKeyRow) => void;
}

export function useDeveloperApiTableColumns({
  translate,
  onSuspend,
  onRestore,
}: UseDeveloperApiTableColumnsParams) {
  return useMemo(
    () => [
      {
        key: 'key' as const,
        label: translate('developerApi.table.key'),
        render: (row: DeveloperApiKeyRow) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-medium leading-[1.4] text-mds-black-900">
              {row.name}
            </span>
            <span className="text-sm font-normal leading-[1.4] text-mds-black-500">
              {translate('developerApi.created', {
                date: formatDateForDisplay(row.createdAt),
              })}
            </span>
          </div>
        ),
        showOnMobile: true,
      },
      {
        key: 'environment' as const,
        label: translate('developerApi.table.environment'),
        render: (row: DeveloperApiKeyRow) => (
          <span className="text-base font-medium leading-[1.4] text-mds-black-900">
            {row.environment}
          </span>
        ),
      },
      {
        key: 'keyValue' as const,
        label: translate('developerApi.table.keyValue'),
        render: (row: DeveloperApiKeyRow) => (
          <Badge className="whitespace-nowrap font-mono" color="gray" size="lg">
            {row.keyValueMasked}
          </Badge>
        ),
      },
      {
        key: 'lastUsed' as const,
        label: translate('developerApi.table.lastUsed'),
        render: (row: DeveloperApiKeyRow) => (
          <span className="text-base font-medium leading-[1.4] text-mds-black-900">
            {formatDateForDisplay(row.lastUsedAt)}
          </span>
        ),
      },
      {
        key: 'status' as const,
        label: translate('developerApi.table.status'),
        render: (row: DeveloperApiKeyRow) => {
          const isActive = row.status === DEVELOPER_API_KEY_STATUS.ACTIVE;
          return (
            <Badge
              className="whitespace-nowrap"
              color={isActive ? 'success' : 'error'}
              leftIcon
              size="lg"
            >
              {translate(
                isActive
                  ? 'developerApi.status.active'
                  : 'developerApi.status.suspended',
              )}
            </Badge>
          );
        },
      },
      {
        key: 'actions' as const,
        label: translate('developerApi.table.actions'),
        render: (row: DeveloperApiKeyRow) => {
          const isActive = row.status === DEVELOPER_API_KEY_STATUS.ACTIVE;

          return (
            <div
              className="flex flex-wrap items-center gap-3"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              role="presentation"
            >
              {isActive ? (
                <button
                  type="button"
                  onClick={() => onSuspend(row)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-mds-error-500 hover:text-mds-error-600"
                >
                  <Ban
                    className="h-4 w-4 shrink-0"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span>{translate('developerApi.actions.suspend')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onRestore(row)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-mds-primary-700 hover:text-mds-primary-800"
                >
                  <RotateCcw
                    className="h-4 w-4 shrink-0"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span>{translate('developerApi.actions.restore')}</span>
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [onRestore, onSuspend, translate],
  );
}
