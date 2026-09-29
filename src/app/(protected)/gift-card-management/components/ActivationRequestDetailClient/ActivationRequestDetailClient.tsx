'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { TableStateDisplay } from '@/components/TableStateDisplay';
import { Spinner } from '@/components/Spinner';
import { useActivationRequestDetailQuery } from '@/api-queries/rewards-portal/activation-requests';
import { useLocalization } from '@/hooks/useLocalization';

import { ActivationRequestDetailView } from '../ActivationRequestDetailView';

interface ActivationRequestDetailClientProps {
  requestId: string;
}

export function ActivationRequestDetailClient({
  requestId,
}: Readonly<ActivationRequestDetailClientProps>) {
  const { translate } = useLocalization('catalog');
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    data: detail,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useActivationRequestDetailQuery(requestId);

  const returnTo = searchParams.get('returnTo');
  const backHref = returnTo ?? '/gift-card-management?tab=activation-requests';
  const showTenantSection = searchParams.get('hideTenant') !== '1';

  if (isLoading) {
    return (
      <Spinner
        fullHeight
        text={translate('giftCardManagement.detail.loading')}
      />
    );
  }

  if (isError || !detail) {
    return (
      <TableStateDisplay
        type="error"
        title={translate('giftCardManagement.detail.notFound')}
        description=""
        showRetryButton
        onRetry={() => {
          void refetch();
        }}
        retryLoading={isFetching}
        retryButtonText={translate('giftCardManagement.detail.backToList')}
      />
    );
  }

  return (
    <ActivationRequestDetailView
      translate={translate}
      detail={detail}
      showTenantSection={showTenantSection}
      onBackClick={() => {
        router.push(backHref);
      }}
      onCloseSuccess={() => {
        router.push(backHref);
      }}
    />
  );
}
