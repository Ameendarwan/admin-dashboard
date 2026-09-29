export interface TenantStorefront {
  id: number;
  domain: string;
  theme: {
    favicon?: string;
    logo?: string;
    previewText?: string;
    title?: string;
  };
  createdAt: number;
  updatedAt: number;
}

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  type: string;
  storefronts: TenantStorefront[];
  createdAt: number;
  updatedAt: number;
}

export interface TenantResponse {
  data: Tenant[];
}

export interface TenantMetadata {
  id: number;
  type: string;
  slug: string;
}
