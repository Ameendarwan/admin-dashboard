import type {
  OfferDetail,
  VariantAttribute,
  EcommerceOfferStatus,
  PatchCatalogOfferBody,
} from '@/types/catalog';
import {
  datetimeLocalToIsoUtc,
  isoUtcToDatetimeLocal,
} from '@/app/(protected)/catalog-management/utils/offerEditDatetime';

export function editOfferVariantSummary(
  tags: readonly VariantAttribute[],
): string {
  return tags.map((t) => t.value).join(', ');
}

/** Plain digits for the price field (matches API `price`). */
export function offerPriceInputInitialValue(offer: OfferDetail): string {
  if (Number.isFinite(offer.rawPrice)) {
    return Number.isInteger(offer.rawPrice)
      ? String(offer.rawPrice)
      : offer.rawPrice.toFixed(2);
  }
  return editOfferPriceInputValue(offer.priceLabel);
}

/** Best-effort parse from Intl `OfferDetail.priceLabel` when `rawPrice` is unusable. */
export function editOfferPriceInputValue(priceLabel: string): string {
  let s = priceLabel.trim();
  const upper = s.toUpperCase();
  if (upper.startsWith('SAR')) {
    s = s.slice(3).trimStart();
  }
  if (s.toUpperCase().endsWith('SAR')) {
    s = s.slice(0, -3).trimEnd();
  }
  s = s.replaceAll(',', '');

  let cleaned = '';
  for (const ch of s) {
    if ((ch >= '0' && ch <= '9') || ch === '.' || ch === '-' || ch === ' ') {
      cleaned += ch;
    }
  }
  cleaned = cleaned.trim();

  const leadingNumber = /^-?\d*\.?\d+/.exec(cleaned);
  return leadingNumber !== null ? leadingNumber[0] : '';
}

export interface OfferEditableComparable {
  readonly currency: string;
  readonly location: string;
  readonly rawPrice: number;
  readonly stockTotal: number;
  readonly status: EcommerceOfferStatus;
  readonly startsUtc: string;
  /** `null` when offer has no `endsAt` in ecommerce. */
  readonly endsUtc: string | null;
}

export function offerEditableComparable(
  offer: OfferDetail,
): OfferEditableComparable {
  const locationRaw = offer.location.trim();
  /** Match empty input when detail shows catalogue placeholder dash. */
  const locationComparable =
    locationRaw === '' || locationRaw === '—' ? '' : locationRaw;

  const startsRounded =
    datetimeLocalToIsoUtc(
      isoUtcToDatetimeLocal(offer.offerStartsAtUtc.trim()),
    ) ?? offer.offerStartsAtUtc.trim();

  let endsComparable: string | null = null;
  if (
    offer.offerEndsAtUtc !== null &&
    typeof offer.offerEndsAtUtc === 'string' &&
    offer.offerEndsAtUtc.trim().length > 0
  ) {
    const rawEnd = offer.offerEndsAtUtc.trim();
    endsComparable =
      datetimeLocalToIsoUtc(isoUtcToDatetimeLocal(rawEnd)) ?? rawEnd;
  }

  return {
    currency: offer.currency.trim().toUpperCase(),
    location: locationComparable,
    rawPrice: offer.rawPrice,
    stockTotal: Math.max(offer.stock, offer.totalStock),
    status: offer.status,
    startsUtc: startsRounded,
    endsUtc: endsComparable,
  };
}

/** Parses price from the edit field (e.g. 332.50 SAR). */
export function parseOfferMajorPrice(text: string): number | null {
  const trimmed = text.trim().replaceAll(',', '');
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) {
    return null;
  }
  return n;
}

/** Parses form input to API `price` (no unit conversion). */
export function parseOfferMinorPriceFromInput(text: string): number | null {
  return parseOfferMajorPrice(text);
}

export function parseNonNegativeStock(text: string): number | null {
  const trimmed = text.trim().replaceAll(',', '');
  const n = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(n) || n < 0) {
    return null;
  }
  return n;
}

export function editableComparableSame(
  a: OfferEditableComparable,
  b: OfferEditableComparable,
): boolean {
  return (
    a.currency === b.currency &&
    a.location === b.location &&
    a.rawPrice === b.rawPrice &&
    a.stockTotal === b.stockTotal &&
    a.status === b.status &&
    a.startsUtc === b.startsUtc &&
    a.endsUtc === b.endsUtc
  );
}

/**
 * Build a minimal PATCH payload from current editable form values vs baseline.
 */
export function patchBodyFromEditableDiff(
  opts: Readonly<{
    before: OfferEditableComparable;
    after: OfferEditableComparable;
    parsedPriceMinor: number;
    parsedStock: number;
  }>,
): PatchCatalogOfferBody {
  const { before, after, parsedPriceMinor, parsedStock } = opts;
  const body: PatchCatalogOfferBody = {};
  if (before.status !== after.status) {
    body.status = after.status;
  }
  if (before.rawPrice !== after.rawPrice) {
    body.price = parsedPriceMinor;
  }
  if (before.currency !== after.currency && after.currency.length > 0) {
    body.currency = after.currency;
  }
  if (before.location !== after.location) {
    body.location = after.location.length > 0 ? after.location : '';
  }
  if (before.stockTotal !== after.stockTotal) {
    body.totalStock = parsedStock;
    body.availableStock = parsedStock;
  }
  if (before.startsUtc !== after.startsUtc) {
    body.startsAt = after.startsUtc;
  }
  if (before.endsUtc !== after.endsUtc) {
    body.endsAt = after.endsUtc;
  }
  return body;
}
