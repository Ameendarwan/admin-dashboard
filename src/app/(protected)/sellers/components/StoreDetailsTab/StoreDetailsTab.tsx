'use client';

import {
  Button,
  ContentCard,
  InputDropdown,
  InputField,
  toast,
} from '@merit-incentives/ui';
import { Save } from 'lucide-react';
import React from 'react';

import type { SellerDetails } from '@/types/seller';
import { SELLER_INVITE_SHIPPING_PROVIDERS } from '@/lib/enums';
import { useLocalization } from '@/hooks/useLocalization';

import { InfoField } from '../InfoField';
import { StoreDocumentSlot } from './StoreDocumentSlot';
import { useAdminCarriers } from './useAdminCarriers';
import { useSellerStoreShippingMutations } from './useSellerStoreShippingMutations';

const DEFAULT_DIGEST_THROTTLE_MINUTES = 30;
const MAX_DIGEST_THROTTLE_MINUTES = 10_080; // 7 days

function effectiveThrottleMinutes(
  value: number | undefined,
): number {
  if (value != null && value >= 1) {
    return value;
  }
  return DEFAULT_DIGEST_THROTTLE_MINUTES;
}

function parseThrottleInput(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number.parseInt(t, 10);
  if (!Number.isFinite(n) || n < 1 || n > MAX_DIGEST_THROTTLE_MINUTES) {
    return null;
  }
  return n;
}

interface StoreDetailsTabProps {
  readonly tenantId?: string;
  readonly storeDisplayName: string;
  readonly sellerDetails?: SellerDetails;
}

export function StoreDetailsTab({
  tenantId,
  storeDisplayName,
  sellerDetails,
}: StoreDetailsTabProps) {
  const { translate } = useLocalization('seller-details');
  const [selectedProvider, setSelectedProvider] = React.useState<
    'merit_logistics' | 'self_managed' | 'ship_to_merit'
  >(sellerDetails?.shippingProvider ?? 'merit_logistics');
  const [selectedCarrierKey, setSelectedCarrierKey] = React.useState<
    string | undefined
  >(undefined);

  const [newOrderThrottleInput, setNewOrderThrottleInput] = React.useState('');
  const [awbThrottleInput, setAwbThrottleInput] = React.useState('');

  React.useEffect(() => {
    setSelectedProvider(
      (sellerDetails?.shippingProvider ??
        'merit_logistics') as typeof selectedProvider,
    );
  }, [sellerDetails?.shippingProvider]);

  React.useEffect(() => {
    const nc = sellerDetails?.notificationsConfig;
    const nw = effectiveThrottleMinutes(nc?.new_order?.throttleMinutes);
    const aw = effectiveThrottleMinutes(nc?.awb_ready?.throttleMinutes);
    setNewOrderThrottleInput(String(nw));
    setAwbThrottleInput(String(aw));
  }, [sellerDetails?.notificationsConfig, tenantId]);

  const {
    data: carriersData,
    isError: carriersError,
    isLoading: carriersLoading,
    refetch: refetchCarriers,
  } = useAdminCarriers();

  const { shippingControlMutation } = useSellerStoreShippingMutations(tenantId);

  const carrierOptions =
    carriersData?.carriers?.map((c) => ({
      value: c.key,
      label: c.value,
    })) ?? [];

  const displayName = storeDisplayName.trim() || translate('info.notProvided');

  const serverNewOrderMins = effectiveThrottleMinutes(
    sellerDetails?.notificationsConfig?.new_order?.throttleMinutes,
  );
  const serverAwbMins = effectiveThrottleMinutes(
    sellerDetails?.notificationsConfig?.awb_ready?.throttleMinutes,
  );

  const parsedNewOrder = parseThrottleInput(newOrderThrottleInput);
  const parsedAwb = parseThrottleInput(awbThrottleInput);
  const throttleInputsValid = parsedNewOrder != null && parsedAwb != null;
  const throttleHasChanges =
    throttleInputsValid &&
    (parsedNewOrder !== serverNewOrderMins || parsedAwb !== serverAwbMins);

  const canSaveThrottle =
    !!tenantId &&
    throttleInputsValid &&
    throttleHasChanges &&
    !shippingControlMutation.isPending;

  const handleSaveThrottle = () => {
    if (!tenantId || !throttleInputsValid) return;
    shippingControlMutation.mutate(
      {
        tenantId,
        action: 'change_notification_throttle',
        newOrderThrottleMinutes: parsedNewOrder,
        awbReadyThrottleMinutes: parsedAwb,
      },
      {
        onSuccess: () => {
          toast.success(translate('store.notificationThrottleSaved'));
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <ContentCard className="relative z-20 overflow-visible rounded-xl border border-mds-black-100 bg-white shadow-sm">
        <ContentCard.Content className="space-y-5 overflow-visible p-5 md:p-6">
          <h3 className="text-base font-semibold text-mds-black-900">
            {translate('store.storeAndLogistics')}
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            <InfoField
              label={translate('store.storeDisplayName')}
              value={displayName}
            />
            <div className="relative z-10 min-w-0 overflow-visible">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 text-sm font-medium text-mds-black-600">
                    {translate('store.shippingFulfilmentDefault')}
                  </div>
                  <InputDropdown
                    label=""
                    placeholder={translate('info.shippingProviderPlaceholder')}
                    options={[...SELLER_INVITE_SHIPPING_PROVIDERS]}
                    value={selectedProvider}
                    onChange={(value) => {
                      if (!tenantId) return;
                      const next =
                        value === 'self_managed' || value === 'ship_to_merit'
                          ? value
                          : 'merit_logistics';
                      const previous =
                        sellerDetails?.shippingProvider ?? 'merit_logistics';
                      setSelectedProvider(next as typeof selectedProvider);
                      shippingControlMutation.mutate(
                        {
                          tenantId,
                          action: 'change_provider',
                          shippingProvider: next,
                        },
                        {
                          onError: () => {
                            setSelectedProvider(
                              previous as typeof selectedProvider,
                            );
                          },
                        },
                      );
                    }}
                    disabled={!tenantId || shippingControlMutation.isPending}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 text-sm font-medium text-mds-black-600">
                    {translate('info.defaultCarrierLabel')}
                  </div>
                  {carriersError && !carriersLoading ? (
                    <div className="rounded-lg border border-mds-error-200 bg-mds-error-50/50 p-4 text-sm text-mds-error-700">
                      <p>{translate('errors.loadCarriersFailed')}</p>
                      <Button
                        type="button"
                        variant="secondary"
                        className="mt-3"
                        onClick={() => {
                          refetchCarriers();
                        }}
                      >
                        {translate('retry')}
                      </Button>
                    </div>
                  ) : (
                    <InputDropdown
                      label=""
                      placeholder={translate('info.defaultCarrierPlaceholder')}
                      options={carrierOptions}
                      value={selectedCarrierKey ?? ''}
                      onChange={(value) => {
                        if (!tenantId) return;
                        const previousKey =
                          sellerDetails?.defaultLastMileCarrier ?? undefined;
                        setSelectedCarrierKey(value || undefined);
                        if (value) {
                          shippingControlMutation.mutate(
                            {
                              tenantId,
                              action: 'change_carrier',
                              carrierKey: value,
                            },
                            {
                              onError: () => {
                                setSelectedCarrierKey(previousKey);
                              },
                            },
                          );
                        }
                      }}
                      disabled={
                        !tenantId ||
                        selectedProvider !== 'self_managed' ||
                        shippingControlMutation.isPending ||
                        carriersLoading
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-mds-black-100 pt-6 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium text-mds-black-800">
                {translate('store.emailThrottlingTitle')}
              </div>
              <p className="text-sm font-normal text-mds-black-500">
                {translate('store.emailThrottlingDescription')}
              </p>
            </div>
            <div className="flex gap-3 items-end lg:gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 text-sm font-medium text-mds-black-600">
                  {translate('store.newOrderThrottleMinutes')}
                </div>
                <InputField
                  id="notification-throttle-new-order"
                  type="number"
                  placeholder="0"
                  min={1}
                  max={MAX_DIGEST_THROTTLE_MINUTES}
                  label=""
                  value={newOrderThrottleInput}
                  onChange={(e) => setNewOrderThrottleInput(e.target.value)}
                  disabled={!tenantId || shippingControlMutation.isPending}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 text-sm font-medium text-mds-black-600">
                  {translate('store.awbReadyThrottleMinutes')}
                </div>
                <InputField
                  id="notification-throttle-awb"
                  type="number"
                  placeholder="0"
                  min={1}
                  max={MAX_DIGEST_THROTTLE_MINUTES}
                  label=""
                  value={awbThrottleInput}
                  onChange={(e) => setAwbThrottleInput(e.target.value)}
                  disabled={!tenantId || shippingControlMutation.isPending}
                />
              </div>
              <Button
                  type="button"
                  variant="primary"
                  size="md"
                  className="h-12 w-12 min-h-12 min-w-12 shrink-0 p-0 lg:self-auto self-end"
                  disabled={!canSaveThrottle}
                  loading={shippingControlMutation.isPending}
                  aria-label={translate('store.saveThrottleAria')}
                  onClick={handleSaveThrottle}
                >
                  <Save className="size-4 shrink-0" aria-hidden />
                </Button>
            </div>
          </div>
        </ContentCard.Content>
      </ContentCard>

      <ContentCard className="relative z-0 overflow-visible rounded-xl border border-mds-black-100 bg-white shadow-sm">
        <ContentCard.Content className="space-y-5 overflow-visible p-5 md:p-6">
          <h3 className="text-base font-semibold text-mds-black-900">
            {translate('store.attachedDocuments')}
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <StoreDocumentSlot
              label={translate('store.logo')}
              emptyLabel={translate('store.noDocumentUploaded')}
              viewLabel={translate('store.viewFile')}
              downloadLabel={translate('store.downloadFile')}
              downloadFailedMessage={translate('store.downloadFailed')}
              viewOpenFailedMessage={translate('store.viewOpenFailed')}
              asset={sellerDetails?.storeLogo}
            />
            <StoreDocumentSlot
              label={translate('store.banner')}
              emptyLabel={translate('store.noDocumentUploaded')}
              viewLabel={translate('store.viewFile')}
              downloadLabel={translate('store.downloadFile')}
              downloadFailedMessage={translate('store.downloadFailed')}
              viewOpenFailedMessage={translate('store.viewOpenFailed')}
              asset={sellerDetails?.storeBanner}
            />
          </div>
        </ContentCard.Content>
      </ContentCard>
    </div>
  );
}
