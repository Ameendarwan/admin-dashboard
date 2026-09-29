const storefrontRoot = ['storefronts'] as const;

export const storefrontQueryKeys = {
  all: storefrontRoot,
  globalList: (params: Record<string, unknown>) =>
    [...storefrontRoot, 'global-list', params] as const,
  list: (params: Record<string, unknown> = {}) =>
    [...storefrontRoot, 'list', params] as const,
  tenantList: (tenantId: string, filters: Record<string, unknown> = {}) =>
    [...storefrontRoot, 'tenant', tenantId, filters] as const,
};
