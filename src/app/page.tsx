'use client';

import { useRouteProtection } from '@/hooks/useRouteProtection';

export type Locale = 'en' | 'ar';

export default function Home() {
  const { shouldShowLoading } = useRouteProtection();

  // Show loading while checking auth or redirecting
  if (shouldShowLoading) {
    return null; // or return a loading spinner
  }

  return null;
}
