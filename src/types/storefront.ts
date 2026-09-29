import type {
  StorefrontSetupConfig,
  StorefrontStatus,
} from '@/types/storefrontAdminApi';

export type { StorefrontSetupChecklistCounts } from '@/lib/storefrontSetupChecklist';

export type StorefrontListStatus = StorefrontStatus;

export interface StorefrontListRow {
  id: string;
  storefrontName: string;
  urlSlug: string;
  tenantName: string;
  tenantId: string;
  status: StorefrontListStatus;
  completedSetupSteps: number;
  requiredSetupSteps: number;
  storeAdminName: string | null;
  storeAdminEmail: string | null;
  floatBalance: string;
  currency: string;
  setupConfig: StorefrontSetupConfig;
}
