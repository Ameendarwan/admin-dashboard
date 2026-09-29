import { Country } from 'country-state-city';

/**
 * Converts country code to full country name
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'US', 'SA', 'OM')
 * @returns Full country name or original code if not found
 */
export function getCountryName(countryCode: string): string {
  if (!countryCode) return countryCode;

  try {
    const country = Country.getCountryByCode(countryCode.toUpperCase());
    return country?.name || countryCode;
  } catch {
    // If country-state-city fails, return the original code
    return countryCode;
  }
}
