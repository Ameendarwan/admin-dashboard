'use client';

import React, { useEffect } from 'react';

import { Spinner } from '@/components';

const LoginPage = () => {
  useEffect(() => {
    const unifiedLoginUrl = `${process.env.NEXT_PUBLIC_ACCOUNTS_URL}/login`;

    if (!process.env.NEXT_PUBLIC_ACCOUNTS_URL) {
      throw new Error('NEXT_PUBLIC_ACCOUNTS_URL is not defined');
    }

    // Get any redirect parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect');
    const isLogout = urlParams.get('logout') === 'true';

    // Build the full redirect URI
    const origin = window.location.origin;
    const normalizedPath = redirectParam || '/dashboard';
    const pathWithSlash = normalizedPath.startsWith('/')
      ? normalizedPath
      : '/' + normalizedPath;
    const redirectUri = `${origin}${pathWithSlash}`;

    // Build the unified login URL with redirect_uri
    const targetUrl = new URL(unifiedLoginUrl);
    targetUrl.searchParams.set('redirect_uri', redirectUri);

    // Add logout parameter if this is a logout scenario
    if (isLogout) {
      targetUrl.searchParams.set('logout', 'true');
    }

    window.location.replace(targetUrl.toString());
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner />
    </div>
  );
};

export default LoginPage;
