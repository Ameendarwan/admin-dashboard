/** Removes trailing "fixed" / "open" denomination suffixes from category display labels. */
export function stripGiftCardCategoryDenominationSuffix(name: string): string {
  const stripped = name.replace(/[\s\-_/]*(fixed|open)\s*$/i, '').trim();
  return stripped || name;
}
