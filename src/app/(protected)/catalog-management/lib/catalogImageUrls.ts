/** Product-like payload from ecommerce GET/list (typed DTO or ES `_source`). */
export type CatalogProductImageSource = {
  thumbnail?: unknown;
  images?: unknown;
  metadata?: unknown;
};

type CatalogVariantImageSource = {
  thumbnail?: unknown;
  images?: unknown;
  metadata?: unknown;
};

function readPublicStorageBucket(): string | null {
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  return bucket && bucket.length > 0 ? bucket : null;
}

function resolveRelativeStoragePath(path: string): string | null {
  const normalized = path.replaceAll(/^\/+/g, '').trim();
  if (!normalized) {
    return null;
  }

  const bucket = readPublicStorageBucket();
  if (bucket) {
    return `https://storage.googleapis.com/${bucket}/${normalized}`;
  }

  return null;
}

/** Normalize API / ES image URL strings for Next `<Image src>`. */
export function sanitizeCatalogImageUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') {
    return null;
  }
  let url = raw.trim();
  if (!url) {
    return null;
  }
  if (url.startsWith('[') && url.endsWith(']')) {
    url = url.slice(1, -1).trim();
  }
  if (url.includes('&amp;')) {
    url = url.replaceAll('&amp;', '&');
  }
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  if (/^gs:\/\//i.test(url)) {
    const withoutScheme = url.replace(/^gs:\/\//i, '');
    const slashIndex = withoutScheme.indexOf('/');
    if (slashIndex > 0) {
      const bucket = withoutScheme.slice(0, slashIndex);
      const objectPath = withoutScheme.slice(slashIndex + 1);
      return `https://storage.googleapis.com/${bucket}/${objectPath}`;
    }
  }
  if (!/^https?:\/\//i.test(url)) {
    return resolveRelativeStoragePath(url);
  }
  return url;
}

const UPLOADS_PATH_PATTERN = /(uploads\/[^?]+)/i;

function storagePathFromImageUrl(url: string): string {
  const match = UPLOADS_PATH_PATTERN.exec(url);
  return match ? match[1] : url;
}

function imageUrlFromEntry(entry: unknown): string | null {
  if (typeof entry === 'string') {
    return sanitizeCatalogImageUrl(entry);
  }
  if (!entry || typeof entry !== 'object') {
    return null;
  }
  const rec = entry as Record<string, unknown>;
  return (
    sanitizeCatalogImageUrl(rec.url) ??
    sanitizeCatalogImageUrl(rec.URL) ??
    sanitizeCatalogImageUrl(rec.src)
  );
}

function readMetadataPathList(product: CatalogProductImageSource): string[] {
  const meta = product.metadata;
  if (!meta || typeof meta !== 'object') {
    return [];
  }
  const record = meta as Record<string, unknown>;
  const paths: string[] = [];
  for (const key of ['imagesFileIds', 'imagesKeys'] as const) {
    const raw = record[key];
    if (!Array.isArray(raw)) {
      continue;
    }
    for (const item of raw) {
      if (typeof item === 'string' && item.trim()) {
        paths.push(item.trim().replaceAll(/^\/+/g, ''));
      }
    }
  }
  return paths;
}

function rememberMetadataImageUrls(
  metadata: unknown,
  remember: (raw: unknown) => void,
): void {
  if (!metadata || typeof metadata !== 'object') {
    return;
  }
  const raw = (metadata as Record<string, unknown>).imagesUrls;
  if (!Array.isArray(raw)) {
    return;
  }
  for (const item of raw) {
    remember(item);
  }
}

function pathsMatch(storagePath: string, candidate: string): boolean {
  return (
    storagePath === candidate ||
    storagePath.endsWith(candidate) ||
    candidate.endsWith(storagePath)
  );
}

function rememberImageUrl(
  urlByPath: Map<string, string>,
  raw: unknown,
  overwrite = false,
): void {
  const url = imageUrlFromEntry(raw);
  if (!url) {
    return;
  }
  const pathKey = storagePathFromImageUrl(url);
  if (!urlByPath.has(pathKey) || overwrite) {
    urlByPath.set(pathKey, url);
  }
}

function orderUrlsByMetadataPaths(
  urlByPath: Map<string, string>,
  orderedPaths: string[],
): string[] {
  const ordered: string[] = [];
  for (const path of orderedPaths) {
    for (const [storagePath, url] of urlByPath) {
      if (pathsMatch(storagePath, path)) {
        if (!ordered.includes(url)) {
          ordered.push(url);
        }
        break;
      }
    }
  }
  for (const url of urlByPath.values()) {
    if (!ordered.includes(url)) {
      ordered.push(url);
    }
  }
  return ordered;
}

function collectOrderedImageUrls(
  urlByPath: Map<string, string>,
  source: CatalogProductImageSource,
  requireOrderedHit = false,
): string[] {
  const orderedPaths = readMetadataPathList(source);
  if (orderedPaths.length === 0) {
    return [...urlByPath.values()];
  }
  const ordered = orderUrlsByMetadataPaths(urlByPath, orderedPaths);
  if (requireOrderedHit && ordered.length === 0) {
    return [...urlByPath.values()];
  }
  if (requireOrderedHit) {
    return ordered.length > 0 ? ordered : [...urlByPath.values()];
  }
  return ordered;
}

/**
 * Collects product gallery URLs from ecommerce product payloads:
 * `thumbnail`, `images[]` (string or `{ url }`), ordered by `metadata.imagesFileIds` / `imagesKeys`.
 */
export function collectProductImageUrls(
  product: CatalogProductImageSource | null | undefined,
): string[] {
  if (!product) {
    return [];
  }

  const urlByPath = new Map<string, string>();
  rememberImageUrl(urlByPath, product.thumbnail);
  rememberMetadataImageUrls(product.metadata, (raw) =>
    rememberImageUrl(urlByPath, raw),
  );

  const images = product.images;
  if (Array.isArray(images)) {
    for (const entry of images) {
      // Signed `images[]` URLs from the API win over unsigned metadata paths.
      rememberImageUrl(urlByPath, entry, true);
    }
  }

  return collectOrderedImageUrls(urlByPath, product, true);
}

/** Variant row gallery: only `variant.images[]`; empty when the array is missing or empty. */
export function collectVariantImagesOnly(
  variant: CatalogVariantImageSource | null | undefined,
): string[] {
  if (!variant) {
    return [];
  }

  const images = variant.images;
  if (!Array.isArray(images) || images.length === 0) {
    return [];
  }

  const urlByPath = new Map<string, string>();
  for (const entry of images) {
    rememberImageUrl(urlByPath, entry);
  }

  return collectOrderedImageUrls(urlByPath, variant);
}

/** Collects variant gallery URLs from ecommerce variant payloads. */
export function collectVariantImageUrls(
  variant: CatalogVariantImageSource | null | undefined,
): string[] {
  if (!variant) {
    return [];
  }

  const urlByPath = new Map<string, string>();
  const images = variant.images;
  const hasVariantGallery = Array.isArray(images) && images.length > 0;

  if (hasVariantGallery) {
    for (const entry of images) {
      rememberImageUrl(urlByPath, entry, true);
    }
    rememberImageUrl(urlByPath, variant.thumbnail);
  } else {
    rememberImageUrl(urlByPath, variant.thumbnail);
    rememberMetadataImageUrls(variant.metadata, (raw) =>
      rememberImageUrl(urlByPath, raw),
    );
    if (Array.isArray(images)) {
      for (const entry of images) {
        rememberImageUrl(urlByPath, entry, true);
      }
    }
  }

  return collectOrderedImageUrls(urlByPath, variant, true);
}

function findVariantInProduct(
  product: CatalogProductImageSource & { variants?: unknown },
  variantId: string | undefined,
): CatalogVariantImageSource | null {
  const id = typeof variantId === 'string' ? variantId.trim() : '';
  if (!id) {
    return null;
  }
  const variants = product.variants;
  if (!Array.isArray(variants)) {
    return null;
  }
  for (const candidate of variants) {
    if (!candidate || typeof candidate !== 'object') {
      continue;
    }
    const candidateId = (candidate as { id?: unknown }).id;
    if (typeof candidateId === 'string' && candidateId.trim() === id) {
      return candidate as CatalogVariantImageSource;
    }
  }
  return null;
}

/**
 * Offer galleries prefer the linked variant's images, then fall back to product-level assets.
 */
export function collectOfferImageUrls(
  product:
    | (CatalogProductImageSource & { variants?: unknown })
    | null
    | undefined,
  productVariantId?: string,
): string[] {
  const variant = findVariantInProduct(product ?? {}, productVariantId);
  if (variant) {
    const variantUrls = collectVariantImageUrls(variant);
    if (variantUrls.length > 0) {
      return variantUrls;
    }
  }
  return collectProductImageUrls(product);
}

/** Unwrap `{ data: product }` / `{ product }` envelopes from admin-be or ecommerce. */
export function unwrapCatalogProductPayload(
  raw: unknown,
): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const root = raw as Record<string, unknown>;
  if (typeof root.id === 'string' && root.id.trim()) {
    return root;
  }
  for (const key of ['data', 'product'] as const) {
    const inner = root[key];
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      const rec = inner as Record<string, unknown>;
      if (typeof rec.id === 'string' && rec.id.trim()) {
        return rec;
      }
    }
  }
  return null;
}
