import type {
  StorefrontSetupConfig,
  StorefrontStatus,
} from '@/types/storefrontAdminApi';

export type StorefrontStatusAction =
  | 'suspend'
  | 'restoreDraft'
  | 'makeLive'
  | 'takeDownToDraft';

const STATUS_ACTION_TARGETS: Record<StorefrontStatusAction, StorefrontStatus> =
  {
    suspend: 'suspended',
    restoreDraft: 'draft',
    makeLive: 'live',
    takeDownToDraft: 'draft',
  };

export function resolveStorefrontStatusActionTarget(
  action: StorefrontStatusAction,
): StorefrontStatus {
  return STATUS_ACTION_TARGETS[action];
}

/** Allowed admin status transitions per storefront-be rules. */
export function getStorefrontStatusActions(
  status: StorefrontStatus,
  setupConfig?: StorefrontSetupConfig,
): StorefrontStatusAction[] {
  if (status === 'draft') {
    const canMakeLive = Boolean(setupConfig?.isSetupComplete);
    return canMakeLive ? ['makeLive', 'suspend'] : ['suspend'];
  }

  if (status === 'live') {
    return ['takeDownToDraft', 'suspend'];
  }

  if (status === 'suspended') {
    return ['restoreDraft'];
  }

  return [];
}
