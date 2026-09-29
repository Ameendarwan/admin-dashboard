'use client';

import { toast } from '@merit-incentives/ui';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

import { tenantHasStorefrontSubscription } from '@/app/(protected)/tenant-management/utils/subscriptionProductResolver';
import type { CreateStorefrontTenantOption } from '@/hooks/useCreateStorefrontTenantOptions';
import { listTenantSubscriptions } from '@/services/subscriptionsAdminService';

const NO_STOREFRONT_SUBSCRIPTION_ERROR = 'noStorefrontSubscription';

function clearNoStorefrontSubscriptionError(
  prev: Record<string, string>,
): Record<string, string> {
  if (prev.tenantId !== NO_STOREFRONT_SUBSCRIPTION_ERROR) {
    return prev;
  }

  return Object.fromEntries(
    Object.entries(prev).filter(([key]) => key !== 'tenantId'),
  );
}

type UseCreateStorefrontSubscriptionGateOptions = Readonly<{
  isGlobalVariant: boolean;
  resolvedTenantId: string;
  translate: (key: string) => string;
  setStepErrors: Dispatch<SetStateAction<Record<string, string>>>;
}>;

export function useCreateStorefrontSubscriptionGate({
  isGlobalVariant,
  resolvedTenantId,
  translate,
  setStepErrors,
}: UseCreateStorefrontSubscriptionGateOptions) {
  const [selectedTenant, setSelectedTenant] =
    useState<CreateStorefrontTenantOption | null>(null);
  const [isVerifyingSubscription, setIsVerifyingSubscription] = useState(false);
  const subscriptionCheckIdRef = useRef(0);

  const verifyTenantHasStorefrontSubscription = useCallback(
    async (tenantId: string): Promise<boolean> => {
      const normalized = tenantId.trim();
      if (!normalized) {
        return true;
      }

      setIsVerifyingSubscription(true);
      const checkId = ++subscriptionCheckIdRef.current;
      try {
        const subscriptions = await listTenantSubscriptions(normalized);
        if (checkId !== subscriptionCheckIdRef.current) {
          return false;
        }

        if (!tenantHasStorefrontSubscription(subscriptions)) {
          setStepErrors({ tenantId: NO_STOREFRONT_SUBSCRIPTION_ERROR });
          return false;
        }

        setStepErrors(clearNoStorefrontSubscriptionError);
        return true;
      } catch {
        if (checkId !== subscriptionCheckIdRef.current) {
          return false;
        }

        toast.error(translate('create.submitError'));
        return false;
      } finally {
        if (checkId === subscriptionCheckIdRef.current) {
          setIsVerifyingSubscription(false);
        }
      }
    },
    [setStepErrors, translate],
  );

  const handleTenantSelect = useCallback(
    (option: CreateStorefrontTenantOption | null) => {
      setSelectedTenant(option);
      const tenantId = option?.value?.trim() ?? '';
      if (!tenantId) {
        return;
      }

      void verifyTenantHasStorefrontSubscription(tenantId);
    },
    [verifyTenantHasStorefrontSubscription],
  );

  useEffect(() => {
    if (isGlobalVariant || !resolvedTenantId) {
      return;
    }

    void verifyTenantHasStorefrontSubscription(resolvedTenantId);
  }, [
    isGlobalVariant,
    resolvedTenantId,
    verifyTenantHasStorefrontSubscription,
  ]);

  return {
    selectedTenant,
    isVerifyingSubscription,
    verifyTenantHasStorefrontSubscription,
    handleTenantSelect,
  };
}
