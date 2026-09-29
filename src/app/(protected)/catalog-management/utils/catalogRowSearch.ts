export function matchCatalogRowSearch<
  T extends { productName: string; brand: string },
>(row: T, q: string, extra?: (r: T) => string): boolean {
  if (!q.trim()) {
    return true;
  }
  const s = q.toLowerCase();
  const hay = [row.productName, row.brand, extra ? extra(row) : '']
    .join(' ')
    .toLowerCase();
  return hay.includes(s);
}

export function matchOfferRowSearch(
  row: { productName: string; seller: string; sku: string },
  q: string,
): boolean {
  if (!q.trim()) {
    return true;
  }
  const s = q.toLowerCase();
  const hay = [row.productName, row.seller, row.sku].join(' ').toLowerCase();
  return hay.includes(s);
}
