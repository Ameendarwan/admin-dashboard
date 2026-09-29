'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Button, ContentCard, Tabs } from '@merit-incentives/ui';
import { CirclePlus } from 'lucide-react';

import {
  useCreatePaidSubscription,
  useSubscribableProducts,
  useTenantSubscriptions,
} from '@/api-queries/tenantManagement';
import { Spinner } from '@/components/Spinner';
import { useLocalization } from '@/hooks';
import type { DetailedTenantProfile } from '@/types/tenantManagement';

import { mapPaidSubscriptionFormToCreateBody } from '../../utils/mapPaidSubscriptionFormToApi';
import { AddPaidSubscriptionDialog } from '../AddPaidSubscriptionDialog';
import type { AddPaidSubscriptionFormValues } from '../AddPaidSubscriptionDialog/addPaidSubscriptionForm';
import { TenantContractsPanel } from './TenantContractsPanel';
import { TenantSubscriptionCard } from './TenantSubscriptionCard';
import { ViewStorefrontsModal } from './ViewStorefrontsModal';

type SubscriptionsTabContentProps = {
  tenant: DetailedTenantProfile;
  tenantId: string;
  tenantName: string;
  /** From tenant list URL; falls back to `tenant.email` when mapping the create body. */
  tenantEmailFromUrl?: string;
};

type SubscriptionsSubTabKey = 'products' | 'uploadContracts';

export function SubscriptionsTabContent({
  tenant,
  tenantId,
  tenantName,
  tenantEmailFromUrl,
}: Readonly<SubscriptionsTabContentProps>) {
  const { translate } = useLocalization('tenant-details');
  const [subTab, setSubTab] = useState<SubscriptionsSubTabKey>('products');
  const [isAddSubscriptionOpen, setIsAddSubscriptionOpen] = useState(false);
  const [isViewStorefrontsOpen, setIsViewStorefrontsOpen] = useState(false);

  const handleViewStorefronts = useCallback((): void => {
    setIsViewStorefrontsOpen(true);
  }, []);

  const handleCloseViewStorefronts = useCallback((): void => {
    setIsViewStorefrontsOpen(false);
  }, []);

  const handleOpenAddSubscription = useCallback((): void => {
    setIsAddSubscriptionOpen(true);
  }, []);

  const handleCloseAddSubscription = useCallback((): void => {
    setIsAddSubscriptionOpen(false);
  }, []);

  const handleSubTabChange = useCallback((key: string): void => {
    setSubTab(key as SubscriptionsSubTabKey);
  }, []);

  const {
    data: subscriptions = [],
    isLoading: isSubscriptionsLoading,
    isError: isSubscriptionsError,
    refetch: refetchSubscriptions,
  } = useTenantSubscriptions(tenantId);

  const {
    data: subscribableProducts = [],
    isLoading: isSubscribableProductsLoading,
    isError: isSubscribableProductsError,
  } = useSubscribableProducts(Boolean(tenantId));

  const createPaidSubscriptionMutation = useCreatePaidSubscription();

  const handleRetrySubscriptions = useCallback((): void => {
    refetchSubscriptions();
  }, [refetchSubscriptions]);

  const handleAddPaidSubscriptionSubmit = useCallback(
    async (values: AddPaidSubscriptionFormValues): Promise<void> => {
      const body = mapPaidSubscriptionFormToCreateBody(values, {
        subscriptions,
        subscribableProducts,
        tenantEmailFromUrl,
        tenantProfileEmail: tenant.email,
        tenantProfileUserId: tenant.userId,
      });
      await createPaidSubscriptionMutation.mutateAsync({
        tenantId,
        body,
      });
    },
    [
      createPaidSubscriptionMutation,
      subscribableProducts,
      subscriptions,
      tenant.email,
      tenant.userId,
      tenantEmailFromUrl,
      tenantId,
    ],
  );

  const productsTabContent = useMemo(() => {
    if (isSubscriptionsLoading) {
      return <Spinner text={translate('subscriptions.loading')} />;
    }
    if (isSubscriptionsError) {
      return (
        <div className="flex flex-col gap-mds-md">
          <p className="text-sm font-normal text-red-600">
            {translate('subscriptions.loadError')}
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleRetrySubscriptions}
          >
            {translate('subscriptions.retry')}
          </Button>
        </div>
      );
    }
    if (subscriptions.length === 0) {
      return (
        <p className="text-sm font-normal text-mds-black-600">
          {translate('subscriptions.noSubscribedProducts')}
        </p>
      );
    }
    return (
      <div className="flex flex-col gap-mds-lg">
        {subscriptions.map((subscription) => (
          <TenantSubscriptionCard
            key={subscription.id}
            subscription={subscription}
            subscribableProducts={subscribableProducts}
            tenantId={tenantId}
            tenantName={tenantName}
            onViewStorefronts={handleViewStorefronts}
          />
        ))}
      </div>
    );
  }, [
    isSubscriptionsError,
    isSubscriptionsLoading,
    handleRetrySubscriptions,
    handleViewStorefronts,
    subscribableProducts,
    subscriptions,
    tenantId,
    tenantName,
    translate,
  ]);

  const subscriptionTabs = useMemo(
    () => [
      {
        key: 'products',
        label: translate('subscriptions.subTabs.products'),
        content: productsTabContent,
      },
      {
        key: 'uploadContracts',
        label: translate('subscriptions.subTabs.uploadContracts'),
        content: <TenantContractsPanel tenant={tenant} />,
      },
    ],
    [productsTabContent, tenant, translate],
  );

  return (
    <>
      <ContentCard className="rounded-xl border border-mds-black-100 bg-white p-mds-2xl shadow-sm">
        <div className="mb-mds-lg flex flex-col gap-mds-lg md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-medium text-mds-black-900">
            {translate('subscriptions.pageTitle')}
          </h2>
          <Button
            variant="secondary"
            size="md"
            className="rounded-full border-0 bg-mds-primary-100 px-5 font-medium text-mds-primary-700 hover:bg-mds-primary-200"
            leftIcon={
              <CirclePlus className="h-5 w-5 shrink-0 text-mds-primary-700" />
            }
            onClick={handleOpenAddSubscription}
            disabled={!tenantId}
          >
            {translate('subscriptions.newSubscription')}
          </Button>
        </div>

        <Tabs
          showContent
          size="md"
          activeTab={subTab}
          onChange={handleSubTabChange}
          contentClassName="mt-mds-xl"
          tabs={subscriptionTabs}
        />
      </ContentCard>

      <ViewStorefrontsModal
        isOpen={isViewStorefrontsOpen}
        onClose={handleCloseViewStorefronts}
        tenantId={tenantId}
      />

      <AddPaidSubscriptionDialog
        isOpen={isAddSubscriptionOpen}
        onClose={handleCloseAddSubscription}
        tenantId={tenantId}
        tenantEmailFromUrl={tenantEmailFromUrl}
        tenantProfileEmail={tenant.email}
        tenantProfileUserId={tenant.userId}
        subscriptions={subscriptions}
        subscribableProducts={subscribableProducts}
        isSubscribableProductsLoading={isSubscribableProductsLoading}
        isSubscribableProductsError={isSubscribableProductsError}
        isSubmitting={createPaidSubscriptionMutation.isPending}
        onSubmit={handleAddPaidSubscriptionSubmit}
      />
    </>
  );
}
