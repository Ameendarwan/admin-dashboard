'use client';

import { TableRowMenu, toast } from '@merit-incentives/ui';
import { Loader2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import { useUpdateStorefrontStatus } from '@/api-queries/storefronts';
import { useLocalization } from '@/hooks';
import { cn } from '@/lib/utils';
import {
  getStorefrontStatusActions,
  resolveStorefrontStatusActionTarget,
  type StorefrontStatusAction,
} from '@/lib/storefrontStatusUtils';
import type {
  StorefrontSetupConfig,
  StorefrontStatus,
} from '@/types/storefrontAdminApi';
import { adminApiAxiosMessage } from '@/utils/adminApiAxiosMessage';
import { trimStorefrontApiErrorMessage } from '@/utils/mapStorefrontCreateApiError';

type StorefrontStatusMenuProps = Readonly<{
  storefrontId: string;
  tenantId: string;
  status: StorefrontStatus;
  setupConfig?: StorefrontSetupConfig;
  tableId: string;
  rowIndex?: number;
}>;

function readStatusActionLabelKey(
  action: StorefrontStatusAction,
): `statusActions.${StorefrontStatusAction}` {
  return `statusActions.${action}`;
}

export function StorefrontStatusMenu({
  storefrontId,
  tenantId,
  status,
  setupConfig,
  tableId,
  rowIndex = 0,
}: StorefrontStatusMenuProps) {
  const { translate } = useLocalization('storefronts');
  const { mutateAsync, isPending } = useUpdateStorefrontStatus();

  const actions = useMemo(
    () => getStorefrontStatusActions(status, setupConfig),
    [status, setupConfig],
  );

  const menuOptions = useMemo(
    () =>
      actions.map((action) => ({
        value: action,
        label: translate(readStatusActionLabelKey(action)),
      })),
    [actions, translate],
  );

  const handleMenuSelect = useCallback(
    async (optionValue: string): Promise<void> => {
      if (isPending) {
        return;
      }

      const action = optionValue as StorefrontStatusAction;
      if (!actions.includes(action)) {
        return;
      }

      const nextStatus = resolveStorefrontStatusActionTarget(action);
      if (nextStatus === status) {
        return;
      }

      try {
        await mutateAsync({
          storefrontId,
          tenantId,
          status: nextStatus,
        });
        toast.success(translate('statusActions.success'));
      } catch (error) {
        const rawMessage = adminApiAxiosMessage(
          error,
          translate('statusActions.error'),
        );
        const message =
          trimStorefrontApiErrorMessage(rawMessage) ||
          translate('statusActions.error');
        toast.error(message);
      }
    },
    [
      actions,
      isPending,
      mutateAsync,
      storefrontId,
      status,
      tenantId,
      translate,
    ],
  );

  if (menuOptions.length === 0) {
    if (isPending) {
      return (
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center"
          role="status"
          aria-live="polite"
          aria-label={translate('statusActions.updating')}
        >
          <Loader2 className="h-4 w-4 animate-spin text-mds-primary-700" />
        </div>
      );
    }

    return null;
  }

  return (
    <TableRowMenu
      row={{}}
      rowIndex={rowIndex}
      tableId={tableId}
      rowMenuOptions={menuOptions}
      onMenuSelect={(value) => {
        void handleMenuSelect(value);
      }}
      className={cn(
        'shrink-0 [&_button]:rounded-lg [&_button]:transition-colors [&_button:hover]:!bg-mds-primary-100 [&_button[aria-expanded=true]]:!bg-mds-primary-100',
      )}
    />
  );
}
