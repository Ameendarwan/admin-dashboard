export type InviteCountryAccountParts = {
  country?: string;
  accountManager?: string;
  metadata?: { country?: string; accountManager?: string };
};

export function buildInviteCountryAccountParts(
  country: string | undefined,
  accountManager: string | undefined,
): InviteCountryAccountParts {
  const parts: InviteCountryAccountParts = {};
  if (country) {
    parts.country = country;
  }
  if (accountManager) {
    parts.accountManager = accountManager;
  }
  if (parts.country !== undefined || parts.accountManager !== undefined) {
    parts.metadata = {};
    if (parts.country !== undefined) {
      parts.metadata.country = parts.country;
    }
    if (parts.accountManager !== undefined) {
      parts.metadata.accountManager = parts.accountManager;
    }
  }
  return parts;
}
