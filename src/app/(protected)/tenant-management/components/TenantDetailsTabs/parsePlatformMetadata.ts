import { formatDateForDisplay } from '@/hooks';
import type { Platform } from '@/types/tenantManagement';

type MetadataPriceValue = string | number | undefined;

function getMetadataString(
  metadata: Record<string, unknown>,
  key: string,
): string | undefined {
  const v = metadata[key];
  return typeof v === 'string' ? v : undefined;
}

function getMetadataPriceValue(
  metadata: Record<string, unknown>,
  key: string,
): MetadataPriceValue {
  const v = metadata[key];
  if (typeof v === 'string' || typeof v === 'number') return v;
  return undefined;
}

type ParsedPlatformSubscription = {
  plan: string;
  planLabel: string;
  status: string;
  isActive: boolean;
  subscriptionStart: string;
  subscriptionEnd: string;
  basePrice: string | number;
};

export function parsePlatformMetadata(
  metadata: Record<string, unknown>,
  platform: Platform,
): ParsedPlatformSubscription {
  const planStr = getMetadataString(metadata, 'plan');
  const plan = planStr?.toLowerCase() ?? 'standard';
  const planLabel = planStr ?? 'Standard';
  const status = getMetadataString(metadata, 'status') ?? 'Active';
  const isActive = status.toString().toLowerCase() !== 'inactive';

  const subscriptionStartRaw =
    getMetadataString(metadata, 'subscriptionStartDate') ?? platform.createdAt;
  const subscriptionEndRaw =
    getMetadataString(metadata, 'subscriptionEndDate') ?? platform.updatedAt;

  return {
    plan,
    planLabel,
    status,
    isActive,
    subscriptionStart: formatDateForDisplay(subscriptionStartRaw),
    subscriptionEnd: formatDateForDisplay(subscriptionEndRaw),
    basePrice: getMetadataPriceValue(metadata, 'pricePerMonth') ?? '-',
  };
}
