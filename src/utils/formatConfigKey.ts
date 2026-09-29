/**
 * Formats a config key for display by removing underscores/dashes,
 * splitting words, and capitalizing the first letter of each word
 * @param key - Config key (e.g., "header_promo_banner")
 * @returns Formatted label (e.g., "Header Promo Banner")
 */
export function formatConfigKey(key: string): string {
  return key
    .replaceAll(/[_-]/g, ' ') // Replace underscores and dashes with spaces
    .split(' ') // Split into words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter
    .join(' '); // Join back together
}
