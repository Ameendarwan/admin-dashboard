import { MediaType } from '../../../types/superApp';

export const MEDIA_TYPES: Record<MediaType, MediaType> = {
  'promo-banners': 'promo-banners',
  'carousel-icons': 'carousel-icons',
};

/** Fixed display/publish order for promo banners (independent of API update order). */
export const PROMO_BANNER_ORDER = [
  'header_promo_banner',
  'vertical_promo_banner',
  'horizontal_promo_banner_1',
  'horizontal_promo_banner_2',
] as const;

export type PromoBannerKey = (typeof PROMO_BANNER_ORDER)[number];

/** Required upload dimensions — live preview slots use the same aspect ratios. */
export const BANNER_DIMENSIONS: Record<
  PromoBannerKey,
  { width: number; height: number }
> = {
  header_promo_banner: { width: 670, height: 256 },
  vertical_promo_banner: { width: 324, height: 400 },
  horizontal_promo_banner_1: { width: 324, height: 200 },
  horizontal_promo_banner_2: { width: 324, height: 200 },
};

export function getBannerAspectRatio(key: PromoBannerKey): string {
  const { width, height } = BANNER_DIMENSIONS[key];
  return `${width} / ${height}`;
}

const PROMO_BANNER_POSITIONS: Record<PromoBannerKey, number> = {
  header_promo_banner: 1,
  vertical_promo_banner: 2,
  horizontal_promo_banner_1: 3,
  horizontal_promo_banner_2: 4,
};

export function isPromoBannerKey(key: string): key is PromoBannerKey {
  return PROMO_BANNER_ORDER.includes(key as PromoBannerKey);
}

export function getPromoBannerPosition(key: string): number | undefined {
  return isPromoBannerKey(key) ? PROMO_BANNER_POSITIONS[key] : undefined;
}

export function comparePromoBannerOrder(a: string, b: string): number {
  const indexA = PROMO_BANNER_ORDER.indexOf(a as PromoBannerKey);
  const indexB = PROMO_BANNER_ORDER.indexOf(b as PromoBannerKey);
  const orderA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
  const orderB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
  return orderA - orderB;
}
