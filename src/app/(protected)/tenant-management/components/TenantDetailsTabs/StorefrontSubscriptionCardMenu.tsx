'use client';

import { EyeIcon, TableRowMenu } from '@merit-incentives/ui';
import { CirclePlus } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { useLocalization } from '@/hooks';
import { buildCreateStorefrontCreateRoute } from '@/lib/storefrontUtils';
import { readRouteParamId } from '@/utils/routeUtils';

enum StorefrontSubscriptionMenuAction {
  VIEW_STOREFRONTS = 'view-storefronts',
  CREATE_STOREFRONT = 'create-storefront',
}

type StorefrontSubscriptionCardMenuProps = Readonly<{
  tenantId: string;
  tenantName: string;
  onViewStorefronts: () => void;
}>;

export function StorefrontSubscriptionCardMenu({
  tenantId,
  tenantName,
  onViewStorefronts,
}: StorefrontSubscriptionCardMenuProps) {
  const router = useRouter();
  const params = useParams();
  const { translate } = useLocalization('tenant-details');
  const tenantProfileId = readRouteParamId(params.id);

  const menuOptions = useMemo(
    () => [
      {
        value: StorefrontSubscriptionMenuAction.VIEW_STOREFRONTS,
        label: translate('subscriptions.storefrontMenu.viewStorefronts'),
        icon: (
          <EyeIcon
            className="h-4 w-4 shrink-0 text-mds-black-900"
            aria-hidden
          />
        ),
      },
      {
        value: StorefrontSubscriptionMenuAction.CREATE_STOREFRONT,
        label: (
          <span className="text-mds-primary-700">
            {translate('subscriptions.storefrontMenu.createStorefront')}
          </span>
        ),
        icon: (
          <CirclePlus
            className="h-4 w-4 shrink-0 text-mds-primary-700"
            aria-hidden
          />
        ),
      },
    ],
    [translate],
  );

  const handleMenuSelect = useCallback(
    (optionValue: string): void => {
      if (optionValue === StorefrontSubscriptionMenuAction.VIEW_STOREFRONTS) {
        onViewStorefronts();
        return;
      }

      if (optionValue === StorefrontSubscriptionMenuAction.CREATE_STOREFRONT) {
        router.push(
          buildCreateStorefrontCreateRoute(
            tenantProfileId,
            tenantId,
            tenantName,
          ),
        );
      }
    },
    [onViewStorefronts, router, tenantId, tenantName, tenantProfileId],
  );

  return (
    <TableRowMenu
      row={{}}
      rowIndex={0}
      tableId="storefront-subscription-card"
      rowMenuOptions={menuOptions}
      onMenuSelect={handleMenuSelect}
      className="shrink-0 [&_button]:rounded-lg [&_button]:!bg-mds-primary-100 [&_button]:transition-colors [&_button:hover]:!bg-mds-primary-200 [&_button[aria-expanded=true]]:!bg-mds-primary-100"
    />
  );
}
