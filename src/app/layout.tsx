import React from 'react';
import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Provider as JotaiProvider } from 'jotai';

import { RadixTooltipProvider } from '@/providers/RadixTooltipProvider';
import { ToastProviderWrapper } from '@/providers/ToastProvider';

import { QueryProvider } from '../providers/QueryProvider';
import { AuthProvider } from './contexts/auth-context';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Merit-Admin-Portal',
  description: 'Portal for Merit-Admins',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const isRTL = locale.startsWith('ar');

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
      <body
        className={`${manrope.variable} ${manrope.className} antialiased bg-mds-bg-light-50! min-h-screen`}
      >
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
          timeZone="UTC"
        >
          <AuthProvider>
            <JotaiProvider>
              <QueryProvider>
                <RadixTooltipProvider>
                  <ToastProviderWrapper>{children}</ToastProviderWrapper>
                </RadixTooltipProvider>
              </QueryProvider>
            </JotaiProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
