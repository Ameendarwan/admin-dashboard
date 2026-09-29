export type BulkSellerDetailsParams = {
  sellerIds?: string[];
  fullData?: boolean;
  search?: string;
  limit?: number;
  onboarded?: boolean;
};

export type SellerDetailsBulkRow = {
  tenantId?: string;
  supplierId?: string;
  metadata?: {
    businessName?: unknown;
  } | null;
};

export type CatalogSellerOption = {
  value: string;
  label: string;
};
