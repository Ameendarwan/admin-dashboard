import type { SellerStoreBrandingFile } from '@/types/seller';
import { fileNameFromUrl } from '@/utils/urlUtils';

export function resolveBrandingFile(
  asset: SellerStoreBrandingFile | null | undefined,
): { displayName: string; url: string | null } {
  const url = asset?.url?.trim() || null;
  const name =
    asset?.fileName?.trim() || (url ? fileNameFromUrl(url) : '') || '';
  return { displayName: name, url };
}
