'use client';

import React, { useEffect, useMemo } from 'react';

import { useSellerCustomerProfile } from '@/api-queries/seller/useSellerCustomerProfile';
import { Spinner } from '@/components/Spinner';
import { TableStateDisplay } from '@/components/TableStateDisplay';
import { useLocalization } from '@/hooks/useLocalization';
import type { SellerDetails } from '@/types/seller';
import { logError } from '@/utils/errorLogger';

import { buildSellerKybViewModel } from './buildSellerKybViewModel';
import { SellerKybPanels } from './SellerKybPanels';

interface SellerKybTabProps {
  readonly sellerTenantId: string | undefined;
  readonly sellerDetails: SellerDetails | undefined;
}

export function SellerKybTab({
  sellerTenantId,
  sellerDetails,
}: Readonly<SellerKybTabProps>) {
  const { translate } = useLocalization('seller-details');
  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useSellerCustomerProfile(sellerTenantId);

  const notProvided = translate('info.notProvided');

  const viewModel = useMemo(() => {
    if (!profile) return null;
    return buildSellerKybViewModel(profile, sellerDetails, notProvided);
  }, [profile, sellerDetails, notProvided]);

  useEffect(() => {
    if (isError && error) {
      logError('Seller customer profile (KYB) load failed', error);
    }
  }, [isError, error]);

  if (!sellerTenantId) {
    return (
      <div className="py-16 text-center text-sm text-mds-black-500">
        {translate('kyb.missingTenant')}
      </div>
    );
  }

  if (isLoading) {
    return <Spinner fullHeight />;
  }

  if (isError) {
    return (
      <TableStateDisplay
        type="error"
        title={translate('kyb.loadError')}
        description={
          error instanceof Error ? error.message : 'Unknown error occurred'
        }
        showRetryButton
        onRetry={() => {
          refetch();
        }}
        retryButtonText={translate('kyb.retry')}
      />
    );
  }

  if (!profile || !viewModel) {
    return (
      <div className="py-16 text-center text-sm text-mds-black-500">
        {translate('kyb.noSubmittedData')}
      </div>
    );
  }

  const firstData = profile.customerProfileData[0];
  const attachedDocuments = firstData?.attachments ?? null;

  return (
    <SellerKybPanels
      model={viewModel}
      attachments={attachedDocuments}
      notProvided={notProvided}
    />
  );
}
