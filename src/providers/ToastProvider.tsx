'use client';

import { ToastProvider } from '@merit-incentives/ui/components';
import React from 'react';

interface ToastProviderWrapperProps {
  children: React.ReactNode;
}

export function ToastProviderWrapper({
  children,
}: Readonly<ToastProviderWrapperProps>) {
  return <ToastProvider>{children}</ToastProvider>;
}
