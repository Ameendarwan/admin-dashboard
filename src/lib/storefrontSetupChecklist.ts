import type { StorefrontSetupConfig } from '@/types/storefrontAdminApi';

export type StorefrontSetupChecklistCounts = {
  completedCount: number;
  requiredCount: number;
};

export function readStorefrontSetupChecklistCounts(
  setupConfig: Pick<
    StorefrontSetupConfig,
    'completedChecklistsCount' | 'requiredChecklistsCount'
  >,
): StorefrontSetupChecklistCounts {
  return {
    completedCount: Math.max(0, setupConfig.completedChecklistsCount),
    requiredCount: Math.max(0, setupConfig.requiredChecklistsCount),
  };
}
