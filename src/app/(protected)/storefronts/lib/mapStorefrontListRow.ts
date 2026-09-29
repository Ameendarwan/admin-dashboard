import type { StorefrontListItem } from '@/types/storefrontAdminApi';
import type { StorefrontListRow } from '@/types/storefront';
import { readStorefrontSetupChecklistCounts } from '@/lib/storefrontSetupChecklist';

function readOptionalString(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed || null;
}

export function mapStorefrontListItemToRow(
  item: StorefrontListItem,
): StorefrontListRow {
  const businessName =
    readOptionalString(item.businessName) ?? readOptionalString(item.adminName);
  const adminName =
    readOptionalString(item.adminName) ?? readOptionalString(item.businessName);
  const { completedCount, requiredCount } = readStorefrontSetupChecklistCounts(
    item.setupConfig,
  );

  return {
    id: item.id,
    storefrontName: item.storeName,
    urlSlug: item.urlSlug,
    tenantId: item.tenantId,
    tenantName: businessName ?? item.tenantId,
    status: item.status,
    completedSetupSteps: completedCount,
    requiredSetupSteps: requiredCount,
    storeAdminName: adminName,
    storeAdminEmail: readOptionalString(item.adminEmail),
    floatBalance: item.floatBalance,
    currency: item.currency,
    setupConfig: item.setupConfig,
  };
}
