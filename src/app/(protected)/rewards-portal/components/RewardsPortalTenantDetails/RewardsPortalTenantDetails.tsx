'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@merit-incentives/ui/components';

import { TenantSummaryCard } from '@/app/(protected)/tenant-management/components';
import { BackButton } from '@/components/BackButton';
import { useLocalization } from '@/hooks/useLocalization';
import { useRouteProtection } from '@/hooks/useRouteProtection';
import { SIDEBAR_ROUTES } from '@/constants/sidebar';

import { RewardsPortalDetailsTabs } from '../RewardsPortalDetailsTabs';

export function RewardsPortalTenantDetails() {
  const { shouldShowLoading } = useRouteProtection();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { translate: tDetails } = useLocalization('tenant-details');
  const { translate: tRewards } = useLocalization('rewards-portal');

  const tenantId = searchParams.get('tenantId') || '';
  const tenantName = decodeURIComponent(searchParams.get('name') || '');
  const tenantEmail = decodeURIComponent(searchParams.get('email') || '');
  const accountManager = decodeURIComponent(
    searchParams.get('accountManager') || '',
  );
  const countryCode = decodeURIComponent(searchParams.get('country') || '');
  const accountStatus = decodeURIComponent(searchParams.get('status') || '');

  if (shouldShowLoading) {
    return null;
  }

  if (!tenantId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            {tRewards('tenantNotFound')}
          </h1>
          <Button
            variant="primary"
            onClick={() => router.push(SIDEBAR_ROUTES.REWARDS_PORTAL)}
          >
            {tRewards('backToRewardsPortal')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10 pt-2 md:pb-12 md:pt-4">
      <div className="mx-auto w-full max-w-[1600px] px-4 md:px-8">
        <div className="flex flex-col gap-4 mb-4 md:mb-6">
          <BackButton />
          <h1 className="text-2xl sm:text-[34px] font-medium text-mds-black-900">
            {tDetails('title')}
          </h1>
        </div>

        <div className="mb-6">
          <TenantSummaryCard
            tenantId={tenantId}
            tenantName={tenantName}
            tenantEmail={tenantEmail}
            accountManager={accountManager}
            countryCode={countryCode}
            accountStatus={accountStatus}
          />
        </div>

        <RewardsPortalDetailsTabs tenantId={tenantId} />
      </div>
    </div>
  );
}
