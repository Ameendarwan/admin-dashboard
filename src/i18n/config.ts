export type Locale = (typeof locales)[number];

export const locales = [
  'en', // English
  'ar', // Arabic
] as const;

export const defaultLocale: Locale = 'en';
