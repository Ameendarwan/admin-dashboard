import { useLocale, useTranslations } from 'next-intl';
import { useCallback } from 'react';

import { logError } from '@/utils/errorLogger';

export type Direction = 'ltr' | 'rtl' | undefined;

export const useLocalization = (namespace?: string) => {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const rawTranslate = useTranslations(namespace);

  const translate = useCallback(
    (key: string, values?: Record<string, string | number>) => {
      try {
        const result = rawTranslate(key, values);
        const fullKey = namespace ? `${namespace}.${key}` : key;

        if (result === key && key.includes('.')) {
          logError(
            `[i18n] Missing translation: "${fullKey}" for locale "${locale}"`,
          );
          return `[Missing: ${fullKey}]`;
        }
        return result;
      } catch (error) {
        logError(
          `[i18n] Error during translation: "${namespace ? `${namespace}.${key}` : key}" for locale "${locale}"`,
          error,
        );
        return key; // fallback to key
      }
    },
    [rawTranslate, locale, namespace],
  );

  const dir = (isRTL ? 'rtl' : 'ltr') as Direction;

  return {
    locale,
    isRTL,
    translate,
    dir,
  };
};
