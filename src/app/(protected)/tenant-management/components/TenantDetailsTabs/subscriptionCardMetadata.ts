import type { Platform } from '@/types/tenantManagement';

import { parsePlatformMetadata } from './parsePlatformMetadata';

function getStr(
  metadata: Record<string, unknown>,
  key: string,
): string | undefined {
  const v = metadata[key];
  return typeof v === 'string' ? v : undefined;
}

export function getSubscriptionCardDisplay(platform: Platform) {
  const parsed = parsePlatformMetadata(platform.metadata, platform);
  const m = platform.metadata;

  const agreedPrice =
    getStr(m, 'agreedPrice') ??
    (typeof parsed.basePrice === 'number'
      ? `${parsed.basePrice.toLocaleString()} SAR`
      : parsed.basePrice === '-'
        ? '—'
        : String(parsed.basePrice));

  const billingFrequency = getStr(m, 'billingFrequency') ?? '—';

  return {
    status: parsed.status,
    isActive: parsed.isActive,
    subscriptionStart: parsed.subscriptionStart,
    subscriptionEnd: parsed.subscriptionEnd,
    agreedPrice,
    billingFrequency,
  };
}
