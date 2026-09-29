'use client';

import React from 'react';

import { useAuth } from '@/app/contexts/auth-context';
import { useRouteProtection } from '@/hooks/useRouteProtection';
import { Spinner, AppLayout } from '@/components';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const { shouldShowLoading } = useRouteProtection();

  // Show loading while checking auth state or during redirects
  if (shouldShowLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}
