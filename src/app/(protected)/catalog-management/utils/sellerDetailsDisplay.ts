import type {
  CatalogSellerOption,
  SellerDetailsBulkRow,
} from '@/types/sellerDetailsBulk';

export function sellerOptionFromBulkRow(
  row: SellerDetailsBulkRow,
): CatalogSellerOption | null {
  const tenantId = typeof row.tenantId === 'string' ? row.tenantId.trim() : '';
  if (!tenantId) {
    return null;
  }
  const rawName = row.metadata?.businessName;
  const name = typeof rawName === 'string' ? rawName.trim() : '';
  const supplierId =
    typeof row.supplierId === 'string' ? row.supplierId.trim() : '';
  return { value: tenantId, label: name || supplierId };
}
