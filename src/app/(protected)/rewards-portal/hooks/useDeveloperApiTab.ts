'use client';

import { useCallback, useState } from 'react';

import {
  DEVELOPER_API_KEY_STATUS,
  type DeveloperApiKeyRow,
} from '@/mock/rewardsPortalDeveloperApi';
import { useLocalization } from '@/hooks/useLocalization';

import type { DeveloperApiKeyConfirmAction } from '../components/DeveloperApiTab/components';
import { useDeveloperApiTableColumns } from './useDeveloperApiTableColumns';

type ConfirmState = {
  action: DeveloperApiKeyConfirmAction;
  row: DeveloperApiKeyRow;
} | null;

export function useDeveloperApiTab() {
  const { translate } = useLocalization('rewards-portal');
  const [rows, setRows] = useState<DeveloperApiKeyRow[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  const openSuspendConfirm = useCallback((row: DeveloperApiKeyRow) => {
    setConfirmState({ action: 'suspend', row });
  }, []);

  const openRestoreConfirm = useCallback((row: DeveloperApiKeyRow) => {
    setConfirmState({ action: 'restore', row });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState(null);
  }, []);

  const confirmAction = useCallback(() => {
    if (!confirmState) {
      return;
    }

    const { action, row } = confirmState;
    const nextStatus =
      action === 'suspend'
        ? DEVELOPER_API_KEY_STATUS.SUSPENDED
        : DEVELOPER_API_KEY_STATUS.ACTIVE;

    setRows((current) =>
      current.map((item) =>
        item.id === row.id ? { ...item, status: nextStatus } : item,
      ),
    );
    setConfirmState(null);
  }, [confirmState]);

  const columns = useDeveloperApiTableColumns({
    translate,
    onSuspend: openSuspendConfirm,
    onRestore: openRestoreConfirm,
  });

  return {
    translate,
    columns,
    rows,
    confirmOpen: Boolean(confirmState),
    confirmActionType: confirmState?.action ?? null,
    closeConfirm,
    confirmAction,
  };
}
