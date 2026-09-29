'use client';

import React from 'react';
import { Badge, ContentCard } from '@merit-incentives/ui';

import { useLocalization } from '@/hooks/useLocalization';
import { getCountryName } from '@/utils/countryUtils';
import { getTenantSummaryStatusLabelAndColor } from '@/utils/tenantSummaryStatus';
import type { DetailedTenantProfile } from '@/types/tenantManagement';

import { TenantSummaryField } from './TenantSummaryField';

type TenantSummaryCardProps = {
  /** Optional — omit when summary is driven from route/list params only. */
  tenant?: DetailedTenantProfile;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  accountManager: string;
  countryCode: string;
  /** Prefer over tenant.state when customer-profile is not loaded. */
  accountStatus?: string;
};

export function TenantSummaryCard({
  tenant,
  tenantId,
  tenantName,
  tenantEmail,
  accountManager,
  countryCode,
  accountStatus,
}: Readonly<TenantSummaryCardProps>) {
  const { translate } = useLocalization('tenant-details');
  const notProvided = translate('notProvided');
  const { label: statusLabel, color: statusColor } =
    getTenantSummaryStatusLabelAndColor(accountStatus ?? tenant?.state, (key) =>
      translate(key),
    );

  const emailValue = tenantEmail || tenant?.email || notProvided;
  const hasTenantEmail = Boolean(tenantEmail || tenant?.email);

  return (
    <ContentCard className="rounded-xl border border-mds-black-100 bg-white p-4 shadow-sm md:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        <TenantSummaryField
          label={translate('summary.tenantId')}
          value={tenantId || notProvided}
        />
        <TenantSummaryField
          label={translate('summary.tenantBusiness')}
          value={tenantName || tenant?.businessName || notProvided}
        />
        <TenantSummaryField
          label={translate('summary.email')}
          value={emailValue}
          valueLayout={hasTenantEmail ? 'email' : undefined}
        />
        <TenantSummaryField
          label={translate('summary.businessOwner')}
          value={tenantName || tenant?.name || notProvided}
        />
        <TenantSummaryField
          label={translate('summary.accountManager')}
          value={accountManager || notProvided}
        />
        <TenantSummaryField
          label={translate('summary.country')}
          value={countryCode ? getCountryName(countryCode) : notProvided}
        />
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-mds-black-600">
            {translate('summary.accountStatus')}
          </span>
          <Badge leftIcon color={statusColor} size="lg">
            {statusLabel}
          </Badge>
        </div>
      </div>
    </ContentCard>
  );
}
