import { isAxiosError } from 'axios';

export function adminCatalogAxiosMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const d = err.response?.data as { message?: string } | undefined;
    return (
      (typeof d?.message === 'string' && d.message) ||
      err.message ||
      'Request failed'
    );
  }
  return err instanceof Error ? err.message : 'Request failed';
}
