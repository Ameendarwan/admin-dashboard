'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from '@merit-incentives/ui';

import { useFreezeWallet, useUnfreezeWallet } from '@/api-queries/wallets';
import { useLocalization } from '@/hooks';
import type { WalletStatus } from '@/types/walletAdminApi';
import { createIdempotencyKey } from '@/utils/createIdempotencyKey';
import { getProductLabel } from '@/constants/platform';

import type {
  WalletFreezeModalContext,
  WalletFreezeModalVariant,
} from '../components/WalletFreezeStatusModal';
import { resolveWalletTableLabel } from '../utils/walletTopUpMappers';
import type {
  ProductWalletGroupModel,
  TenantWalletCardModel,
  TenantWalletTableEntry,
} from '../utils/walletTopUpTypes';

const FREEZE_REASON_CODE = 'COMPLIANCE_REVIEW' as const;

function pickRepresentativeWallet(
  wallets: Array<{ id: string; status: WalletStatus; currencyCode: string }>,
  primaryCurrencyCode: string | null,
  preferredStatus: WalletStatus,
): { id: string; status: WalletStatus } | null {
  const eligible = wallets.filter(
    (wallet) => wallet.status === preferredStatus,
  );
  if (eligible.length === 0) {
    return null;
  }
  if (primaryCurrencyCode) {
    const primaryMatch = eligible.find(
      (wallet) => wallet.currencyCode === primaryCurrencyCode,
    );
    if (primaryMatch) {
      return primaryMatch;
    }
  }
  return eligible[0];
}

interface UseWalletFreezeActionsArgs {
  tenantId: string;
  tenantName: string;
  primaryCurrencyCode: string | null;
  masterWallets: TenantWalletCardModel[];
  productWallets: ProductWalletGroupModel[];
  tenantWallets: TenantWalletTableEntry[];
}

export function useWalletFreezeActions({
  tenantId,
  tenantName,
  primaryCurrencyCode,
  masterWallets,
  productWallets,
  tenantWallets,
}: Readonly<UseWalletFreezeActionsArgs>) {
  const { translate } = useLocalization('tenant-details.walletTopUp');
  const freezeMutation = useFreezeWallet();
  const unfreezeMutation = useUnfreezeWallet();
  const [modalContext, setModalContext] =
    useState<WalletFreezeModalContext | null>(null);
  /** Stable for retries of the same confirm attempt; cleared on success or modal change. */
  const attemptIdempotencyKeyRef = useRef<string | null>(null);

  useEffect(() => {
    setModalContext(null);
    attemptIdempotencyKeyRef.current = null;
  }, [tenantId]);

  useEffect(() => {
    attemptIdempotencyKeyRef.current = null;
  }, [modalContext?.walletId, modalContext?.variant]);

  const isMutating = freezeMutation.isPending || unfreezeMutation.isPending;

  const primaryMasterWallet =
    (primaryCurrencyCode
      ? masterWallets.find(
          (wallet) => wallet.currencyCode === primaryCurrencyCode,
        )
      : undefined) ?? masterWallets[0];

  const isMasterFrozen = primaryMasterWallet?.status === 'FROZEN';

  const closeModal = useCallback(() => {
    if (isMutating) {
      return;
    }
    attemptIdempotencyKeyRef.current = null;
    setModalContext(null);
  }, [isMutating]);

  const openModal = useCallback((context: WalletFreezeModalContext) => {
    setModalContext(context);
  }, []);

  const openMasterFreezeModal = useCallback(() => {
    const target = pickRepresentativeWallet(
      masterWallets,
      primaryCurrencyCode,
      'ACTIVE',
    );
    if (!target) {
      return;
    }
    openModal({
      variant: 'freeze-master',
      walletId: target.id,
      targetName: tenantName,
    });
  }, [masterWallets, openModal, primaryCurrencyCode, tenantName]);

  const openMasterUnfreezeModal = useCallback(() => {
    const target = pickRepresentativeWallet(
      masterWallets,
      primaryCurrencyCode,
      'FROZEN',
    );
    if (!target) {
      return;
    }
    openModal({
      variant: 'unfreeze-master',
      walletId: target.id,
      targetName: tenantName,
    });
  }, [masterWallets, openModal, primaryCurrencyCode, tenantName]);

  const openProductFreezeModal = useCallback(
    (productCode: string) => {
      const group = productWallets.find(
        (item) => item.productCode === productCode,
      );
      if (!group) {
        return;
      }
      const target = pickRepresentativeWallet(
        group.wallets,
        primaryCurrencyCode,
        'ACTIVE',
      );
      if (!target) {
        return;
      }
      const productName = getProductLabel(productCode);
      const subTenantCount = tenantWallets.filter(
        (entry) => entry.productCode === productCode,
      ).length;
      openModal({
        variant: 'freeze-product',
        walletId: target.id,
        targetName: productName,
        subTenantCount,
      });
    },
    [openModal, primaryCurrencyCode, productWallets, tenantWallets],
  );

  const openProductUnfreezeModal = useCallback(
    (productCode: string) => {
      const group = productWallets.find(
        (item) => item.productCode === productCode,
      );
      if (!group) {
        return;
      }
      const target = pickRepresentativeWallet(
        group.wallets,
        primaryCurrencyCode,
        'FROZEN',
      );
      if (!target) {
        return;
      }
      openModal({
        variant: 'unfreeze-product',
        walletId: target.id,
        targetName: getProductLabel(productCode),
      });
    },
    [openModal, primaryCurrencyCode, productWallets],
  );

  const openSubTenantFreezeModal = useCallback(
    (entry: TenantWalletTableEntry) => {
      if (entry.status !== 'ACTIVE') {
        return;
      }
      openModal({
        variant: 'freeze-sub-tenant',
        walletId: entry.id,
        targetName: resolveWalletTableLabel(entry, translate),
      });
    },
    [openModal, translate],
  );

  const openSubTenantUnfreezeModal = useCallback(
    (entry: TenantWalletTableEntry) => {
      if (entry.status !== 'FROZEN') {
        return;
      }
      openModal({
        variant: 'unfreeze-sub-tenant',
        walletId: entry.id,
        targetName: resolveWalletTableLabel(entry, translate),
      });
    },
    [openModal, translate],
  );

  const getProductFreezeState = useCallback(
    (
      productCode: string,
    ): { isFrozen: boolean; canFreeze: boolean; canUnfreeze: boolean } => {
      const group = productWallets.find(
        (item) => item.productCode === productCode,
      );
      if (!group || group.wallets.length === 0) {
        return { isFrozen: false, canFreeze: false, canUnfreeze: false };
      }
      const canFreeze = group.wallets.some(
        (wallet) => wallet.status === 'ACTIVE',
      );
      const canUnfreeze = group.wallets.some(
        (wallet) => wallet.status === 'FROZEN',
      );
      const isFrozen = group.wallets.every(
        (wallet) => wallet.status === 'FROZEN',
      );
      return { isFrozen, canFreeze, canUnfreeze };
    },
    [productWallets],
  );

  const handleConfirm = useCallback(async () => {
    if (!modalContext || isMutating) {
      return;
    }

    const isFreeze = modalContext.variant.startsWith('freeze');
    const notesKey = isFreeze
      ? 'freezeModals.defaultFreezeNotes'
      : 'freezeModals.defaultUnfreezeNotes';
    const idempotencyKey =
      attemptIdempotencyKeyRef.current ??
      (attemptIdempotencyKeyRef.current = createIdempotencyKey());

    try {
      if (isFreeze) {
        await freezeMutation.mutateAsync({
          tenantId,
          walletId: modalContext.walletId,
          reasonCode: FREEZE_REASON_CODE,
          notes: translate(notesKey),
          idempotencyKey,
        });
        toast.success(translate('toast.freezeSuccess'));
      } else {
        await unfreezeMutation.mutateAsync({
          tenantId,
          walletId: modalContext.walletId,
          reasonCode: FREEZE_REASON_CODE,
          notes: translate(notesKey),
          idempotencyKey,
        });
        toast.success(translate('toast.unfreezeSuccess'));
      }
      attemptIdempotencyKeyRef.current = null;
      setModalContext(null);
    } catch {
      toast.error(
        translate(isFreeze ? 'toast.freezeError' : 'toast.unfreezeError'),
      );
    }
  }, [
    freezeMutation,
    isMutating,
    modalContext,
    tenantId,
    translate,
    unfreezeMutation,
  ]);

  return {
    freezeModalContext: modalContext,
    isFreezeModalOpen: modalContext !== null,
    isFreezeActionLoading: isMutating,
    isMasterFrozen,
    canFreezeMaster: Boolean(
      pickRepresentativeWallet(masterWallets, primaryCurrencyCode, 'ACTIVE'),
    ),
    canUnfreezeMaster: Boolean(
      pickRepresentativeWallet(masterWallets, primaryCurrencyCode, 'FROZEN'),
    ),
    closeFreezeModal: closeModal,
    confirmFreezeAction: handleConfirm,
    openMasterFreezeModal,
    openMasterUnfreezeModal,
    openProductFreezeModal,
    openProductUnfreezeModal,
    openSubTenantFreezeModal,
    openSubTenantUnfreezeModal,
    getProductFreezeState,
  };
}

export type { WalletFreezeModalVariant };
