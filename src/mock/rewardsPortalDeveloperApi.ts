export const DEVELOPER_API_KEY_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
} as const;

export type DeveloperApiKeyStatus =
  (typeof DEVELOPER_API_KEY_STATUS)[keyof typeof DEVELOPER_API_KEY_STATUS];

export const DEVELOPER_API_ENVIRONMENT = {
  PRODUCTION: 'Production',
  SANDBOX: 'Sandbox',
} as const;

export type DeveloperApiEnvironment =
  (typeof DEVELOPER_API_ENVIRONMENT)[keyof typeof DEVELOPER_API_ENVIRONMENT];

export type DeveloperApiKeyRow = Readonly<{
  id: string;
  name: string;
  createdAt: string;
  environment: DeveloperApiEnvironment;
  keyValueMasked: string;
  lastUsedAt: string;
  status: DeveloperApiKeyStatus;
}>;

/** Figma mock rows for Developer API tab (LiveOps node 5848:139556). */
export const mockDeveloperApiKeys: DeveloperApiKeyRow[] = [
  {
    id: 'dev-api-key-1',
    name: 'Production API Key',
    createdAt: '2026-03-30T00:00:00.000Z',
    environment: DEVELOPER_API_ENVIRONMENT.PRODUCTION,
    keyValueMasked: 'mk_live_................4f2a',
    lastUsedAt: '2020-06-12T00:00:00.000Z',
    status: DEVELOPER_API_KEY_STATUS.ACTIVE,
  },
  {
    id: 'dev-api-key-2',
    name: 'Production API Key (secondary)',
    createdAt: '2026-05-12T00:00:00.000Z',
    environment: DEVELOPER_API_ENVIRONMENT.PRODUCTION,
    keyValueMasked: 'mk_live_................4f2a',
    lastUsedAt: '2012-10-28T00:00:00.000Z',
    status: DEVELOPER_API_KEY_STATUS.ACTIVE,
  },
  {
    id: 'dev-api-key-3',
    name: 'Sandbox API Key',
    createdAt: '2026-02-28T00:00:00.000Z',
    environment: DEVELOPER_API_ENVIRONMENT.SANDBOX,
    keyValueMasked: 'mk_live_................4f2a',
    lastUsedAt: '2016-05-07T00:00:00.000Z',
    status: DEVELOPER_API_KEY_STATUS.ACTIVE,
  },
  {
    id: 'dev-api-key-4',
    name: 'Sandbox API Key (legacy)',
    createdAt: '2026-01-04T00:00:00.000Z',
    environment: DEVELOPER_API_ENVIRONMENT.SANDBOX,
    keyValueMasked: 'mk_live_................4f2a',
    lastUsedAt: '2016-05-07T00:00:00.000Z',
    status: DEVELOPER_API_KEY_STATUS.SUSPENDED,
  },
];
