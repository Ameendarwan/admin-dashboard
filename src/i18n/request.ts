import { getRequestConfig } from 'next-intl/server';

import { getUserLocale } from '@/services/localeService';

import { locales, defaultLocale } from './config';

export default getRequestConfig(async () => {
  const userLocale = await getUserLocale();

  // Check if the user locale is supported, otherwise fall back to default
  const locale = locales.includes(userLocale as (typeof locales)[number])
    ? userLocale
    : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
