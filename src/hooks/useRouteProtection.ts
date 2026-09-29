import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { useAuth } from '@/app/contexts/auth-context';

export function useRouteProtection() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setIsRedirecting(true);
        router.replace('/login');
        return;
      }

      // If user is authenticated and on home page (root), redirect to dashboard
      if (isAuthenticated && pathname === '/') {
        setIsRedirecting(true);
        router.replace('/dashboard');
        return;
      }

      // If we reach here, no redirect is needed
      setIsRedirecting(false);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  const navigateToHome = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return {
    isAuthenticated,
    isLoading,
    pathname,
    isRedirecting,
    navigateToHome,
    // Show loading if auth is loading OR if we're redirecting
    shouldShowLoading: isLoading || isRedirecting,
  };
}
