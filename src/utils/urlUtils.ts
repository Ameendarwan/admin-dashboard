/** Matches `http://` or `https://` at the start of a string (case-insensitive). */
export const HTTP_OR_HTTPS_SCHEME = /^https?:\/\//i;

/** Returns `raw` unchanged if it already has an http(s) scheme; otherwise prefixes `https://`. */
export function ensureHttpOrHttpsUrl(raw: string): string {
  return HTTP_OR_HTTPS_SCHEME.test(raw) ? raw : `https://${raw}`;
}

export function fileNameFromUrl(url: string): string {
  try {
    const segment = new URL(url).pathname.split('/').pop();
    return segment ? decodeURIComponent(segment) : 'file';
  } catch {
    return 'file';
  }
}

export function openUrlInNewTab(url: string): void {
  if (!url) return;
  globalThis.open(url, '_blank', 'noopener,noreferrer');
}
