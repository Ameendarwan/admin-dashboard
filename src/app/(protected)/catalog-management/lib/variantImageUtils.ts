import { sanitizeCatalogImageUrl } from './catalogImageUrls';

/** Parse variant image URLs from seller bulk `offersJson.variantImages` (array or CSV). */
export function parseVariantImages(raw: unknown): string[] | undefined {
  if (raw == null) {
    return undefined;
  }
  if (Array.isArray(raw)) {
    const list = raw
      .filter((x) => typeof x === 'string' && x.trim())
      .map((s) => (s as string).trim());
    return list.length ? list : undefined;
  }
  if (typeof raw === 'string') {
    const list = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return list.length ? list : undefined;
  }
  return undefined;
}

/** Normalize variant image URL strings for display. */
export function normalizeVariantImageUrls(raw: unknown): string[] {
  if (raw == null) {
    return [];
  }
  const candidates = Array.isArray(raw) ? raw : [raw];
  const urls: string[] = [];
  for (const item of candidates) {
    const url = sanitizeCatalogImageUrl(item);
    if (url && !urls.includes(url)) {
      urls.push(url);
    }
  }
  return urls;
}
