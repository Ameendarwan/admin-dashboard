import type {
  EcommerceOfferStatus,
  CatalogListingStatus,
} from '@/types/catalog';

function asScalarString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return '';
}

export function normalizedEcommerceOfferStatus(
  raw: string,
): EcommerceOfferStatus {
  const s = raw.trim().toUpperCase();
  if (s === 'ACTIVE' || s === 'INACTIVE' || s === 'EXPIRED') {
    return s;
  }
  return 'INACTIVE';
}

export function formatOfferUtcDateTime(isoUtc: string): string {
  const d = new Date(isoUtc);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatCatalogOfferUtcPeriod(
  startsAtUtc: string,
  endsAtUtc: string | null,
  noEndLabel: string,
): string {
  const left = formatOfferUtcDateTime(startsAtUtc);
  const end =
    endsAtUtc !== null &&
    typeof endsAtUtc === 'string' &&
    endsAtUtc.trim().length > 0
      ? formatOfferUtcDateTime(endsAtUtc)
      : noEndLabel;
  return `${left} → ${end}`;
}

export function formatAttrValueForDisplay(raw: unknown): string {
  if (raw === null || raw === undefined) {
    return '';
  }
  if (
    typeof raw === 'string' ||
    typeof raw === 'number' ||
    typeof raw === 'boolean'
  ) {
    return String(raw);
  }
  if (Array.isArray(raw)) {
    const parts = raw
      .map(formatAttrValueForDisplay)
      .filter((s) => s.length > 0);
    return parts.join(', ');
  }
  if (typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    const name = o.name ?? o.label ?? o.title;
    const val = o.value ?? o.values;
    if (
      typeof name === 'string' &&
      name.trim() &&
      val !== undefined &&
      !(
        typeof val === 'object' &&
        val !== null &&
        !Array.isArray(val) &&
        Object.keys(val as object).length === 0
      )
    ) {
      const inner = formatAttrValueForDisplay(val);
      return inner ? `${name.trim()}: ${inner}` : name.trim();
    }
    try {
      return JSON.stringify(o);
    } catch {
      return '';
    }
  }
  return '';
}

export function attributesToDisplayStrings(
  raw: unknown,
): Record<string, string> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(raw as Record<string, unknown>).map(([k, v]) => [
      k,
      formatAttrValueForDisplay(v),
    ]),
  );
}

export function formatEcommerceDate(value: unknown): string {
  if (value === null || value === undefined) {
    return '—';
  }

  let d: Date;
  if (value instanceof Date) {
    d = value;
  } else if (typeof value === 'string' || typeof value === 'number') {
    d = new Date(value);
  } else {
    return '—';
  }

  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Map ecommerce product status strings to admin catalog UI listing status.
 * Typical values: draft | proposed | published | rejected — UI: active | draft | archived.
 */
export function listingStatusFromPayload(raw: unknown): CatalogListingStatus {
  const s = asScalarString(raw).trim().toLowerCase();
  if (s === 'draft' || s === 'proposed') {
    return 'draft';
  }
  if (s === 'rejected' || s === 'archived') {
    return 'archived';
  }
  if (s === 'published' || s === 'active') {
    return 'active';
  }
  return 'active';
}

export function formatOfferConditionDisplay(raw: unknown): string {
  const s = asScalarString(raw).toUpperCase();
  if (s === 'NEW') {
    return 'New';
  }
  if (s === 'USED') {
    return 'Used';
  }
  if (s === 'REFURB') {
    return 'Refurbished';
  }
  return s || '—';
}

/** Reads top-level `price` from offer API payloads (no unit conversion). */
export function readOfferPriceFromApi(raw: Record<string, unknown>): number {
  const price = raw.price;
  return typeof price === 'number' && Number.isFinite(price)
    ? price
    : Number.NaN;
}

/** Formats API `price` for display (no unit conversion). */
export function formatOfferPriceLabel(currency: string, price: number): string {
  const c = (currency ?? '').trim().toUpperCase();
  if (!c || !Number.isFinite(price)) {
    return '—';
  }
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: c.length === 3 ? c : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${c} ${price}`;
  }
}
