'use client';

import { Button } from '@merit-incentives/ui';
import { AlertTriangle, Loader2, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

import { logError } from '@/utils/errorLogger';

import { useAuth } from '../contexts/auth-context';

const UnauthorizedPage = () => {
  const t = useTranslations();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      logError('Error during sign out', error);
      // Force redirect to login even if logout fails
      window.location.href = '/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle
              className="h-12 w-12 text-red-600"
              aria-hidden="true"
            />
          </div>

          {/* Error Title */}
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            {t('unauthorized.title') || 'Access Denied'}
          </h1>

          {/* Error Message */}
          <p className="mt-4 text-base text-gray-600">
            {t('unauthorized.message') ||
              "You don't have access to this product. Please contact your administrator if you believe this is an error."}
          </p>

          {/* Sign Out Button */}
          <div className="mt-8">
            <Button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              leftIcon={
                isLoggingOut ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogOut className="h-5 w-5" />
                )
              }
              className="w-full"
              aria-label={t('unauthorized.signOutButton') || 'Sign out'}
            >
              {isLoggingOut
                ? t('unauthorized.signingOut') || 'Signing out...'
                : t('unauthorized.signOutButton') || 'Sign Out'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
