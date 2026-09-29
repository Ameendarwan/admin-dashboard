import type { Platform } from '@/types/tenantManagement';

export function isSuperPlatform(platform: Platform): boolean {
  return platform.name.toLowerCase() === 'super-platform';
}
