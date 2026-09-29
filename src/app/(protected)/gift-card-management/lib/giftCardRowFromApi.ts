import type { GiftCardRow, GiftCardStatus } from '@/types/catalog';
import {
  readCategoryPair,
  readProductBrand,
  type LooseProductLike,
} from '@/app/(protected)/catalog-management/lib/productCatalogPayload';

const GIFT_CARD_AVATAR_COLORS = [
  '#0F766E',
  '#1D4ED8',
  '#B45309',
  '#BE123C',
  '#7C3AED',
  '#0E7490',
  '#C2410C',
  '#4338CA',
] as const;

function readMetadata(product: LooseProductLike): Record<string, unknown> {
  const metadata = product.metadata;
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {};
  }
  return metadata as Record<string, unknown>;
}

function asDisplayString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return '';
}

function giftCardInitials(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) {
    return 'GC';
  }
  return parts.map((part) => part.charAt(0).toUpperCase()).join('');
}

// Hash-based selection ensures the same product always gets the same avatar color.
function giftCardAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + (seed.codePointAt(i) ?? 0)) >>> 0;
  }
  return GIFT_CARD_AVATAR_COLORS[hash % GIFT_CARD_AVATAR_COLORS.length];
}

function denominationTypeFromMetadata(
  metadata: Record<string, unknown>,
): GiftCardRow['denominationType'] | null {
  const denomination = metadata.denomination;
  if (
    !denomination ||
    typeof denomination !== 'object' ||
    Array.isArray(denomination)
  ) {
    return null;
  }
  const type = (denomination as { type?: unknown }).type;
  if (type === 'open' || type === 'fixed') {
    return type;
  }
  return null;
}

function optionTitle(option: object): string {
  const nested = (option as { option?: { title?: unknown } }).option?.title;
  return asDisplayString(nested).trim().toLowerCase();
}

function denominationTypeFromVariantOptions(
  options: unknown[],
): GiftCardRow['denominationType'] | null {
  for (const option of options) {
    if (!option || typeof option !== 'object') {
      continue;
    }
    const title = optionTitle(option);
    if (title === 'min' || title === 'max') {
      return 'open';
    }
    if (title.includes('denomination') || title === 'amount') {
      return 'fixed';
    }
  }
  return null;
}

function readDenominationType(
  product: LooseProductLike,
): GiftCardRow['denominationType'] {
  const fromMeta = denominationTypeFromMetadata(readMetadata(product));
  if (fromMeta) {
    return fromMeta;
  }

  const variants = product.variants;
  if (!Array.isArray(variants)) {
    return 'fixed';
  }

  for (const variant of variants) {
    if (!variant || typeof variant !== 'object') {
      continue;
    }
    const options = (variant as { options?: unknown }).options;
    if (!Array.isArray(options)) {
      continue;
    }
    const fromOptions = denominationTypeFromVariantOptions(options);
    if (fromOptions) {
      return fromOptions;
    }
  }

  return 'fixed';
}

function readGiftCardStatus(product: LooseProductLike): GiftCardStatus {
  const metadata = readMetadata(product);
  if (metadata.isActive === false || metadata.discontinued === true) {
    return 'inactive';
  }

  const status = asDisplayString(product.status).trim().toLowerCase();
  if (
    status === 'draft' ||
    status === 'proposed' ||
    status === 'rejected' ||
    status === 'archived' ||
    status === 'inactive'
  ) {
    return 'inactive';
  }

  return 'active';
}

function readCountries(product: LooseProductLike): string {
  const metadata = readMetadata(product);
  const country = metadata.country ?? metadata.region;
  if (typeof country === 'string' && country.trim()) {
    return country.trim().toUpperCase();
  }
  if (Array.isArray(country)) {
    const parts = country
      .filter((value): value is string => typeof value === 'string')
      .map((value) => value.trim().toUpperCase())
      .filter(Boolean);
    if (parts.length > 0) {
      return parts.join(', ');
    }
  }
  return '-';
}

function resolveGiftCardTitle(
  product: LooseProductLike,
  brand: string,
  id: string,
): string {
  if (typeof product.title === 'string' && product.title.trim()) {
    return product.title.trim();
  }
  if (brand !== '—') {
    return brand;
  }
  return id;
}

/** Count of embedded sales-channel memberships from products/ops/list; null when field omitted. */
function readSalesChannelsCount(product: LooseProductLike): number | null {
  const channels = (product as { salesChannels?: unknown }).salesChannels;
  if (!Array.isArray(channels)) {
    return null;
  }
  return channels.length;
}

/** Maps ecommerce catalog product → Gift Cards table row. */
export function giftCardRowFromApi(raw: unknown): GiftCardRow | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const product = raw as LooseProductLike;
  const id = product.id;
  if (typeof id !== 'string' || !id.trim()) {
    return null;
  }

  const brand = readProductBrand(product);
  const title = resolveGiftCardTitle(product, brand, id);
  // Table Category column: parent only (`readCategoryPair.category`); leaf is ignored.
  const { category } = readCategoryPair(product);
  const avatarSeed = brand !== '—' ? brand : title;

  return {
    id,
    name: title,
    brand: brand === '—' ? title : brand,
    category: category !== '—' ? category : '-',
    denominationType: readDenominationType(product),
    salesChannels: readSalesChannelsCount(product),
    // Activation count not on products/ops/list yet.
    activations: null,
    countries: readCountries(product),
    status: readGiftCardStatus(product),
    imageInitials: giftCardInitials(avatarSeed),
    imageColor: giftCardAvatarColor(avatarSeed),
  };
}
