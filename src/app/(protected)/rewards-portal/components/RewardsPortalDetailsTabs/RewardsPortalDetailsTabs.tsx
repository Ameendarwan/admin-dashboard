'use client';

import { useState } from 'react';
import { Building2, KeyRound, List, ShieldCheck } from 'lucide-react';

import {
  createDetailSectionTabItem,
  DetailSectionTabsLayout,
  type DetailSectionTabItem,
} from '@/components/DetailSectionTabsLayout';
import { useLocalization } from '@/hooks';
import { useActivationRequestsListQuery } from '@/api-queries/rewards-portal/activation-requests';

import { ActivationRequestsTab } from '../ActivationRequestsTab';
import { CommercialTransactionsTab } from '../CommercialTransactionsTab';
import { DeveloperApiTab } from '../DeveloperApiTab';
// import { GcEmailTab } from '../GcEmailTab';
import { IpWhitelistTab } from '../IpWhitelistTab';
import {
  REWARDS_PORTAL_TAB_ACTIVATION_REQUESTS,
  REWARDS_PORTAL_TAB_COMMERCIAL_TRANSACTIONS,
  REWARDS_PORTAL_TAB_DEVELOPER_API,
  REWARDS_PORTAL_TAB_GC_EMAIL,
  REWARDS_PORTAL_TAB_IP_WHITELIST,
} from '../../constants/rewardsPortalConstants';

type RewardsPortalDetailsTabsProps = {
  tenantId: string;
};

type RewardsPortalTabKey =
  | typeof REWARDS_PORTAL_TAB_COMMERCIAL_TRANSACTIONS
  | typeof REWARDS_PORTAL_TAB_ACTIVATION_REQUESTS
  | typeof REWARDS_PORTAL_TAB_DEVELOPER_API
  | typeof REWARDS_PORTAL_TAB_IP_WHITELIST
  | typeof REWARDS_PORTAL_TAB_GC_EMAIL;

export function RewardsPortalDetailsTabs({
  tenantId,
}: Readonly<RewardsPortalDetailsTabsProps>) {
  const { translate } = useLocalization('rewards-portal');
  const [activeTab, setActiveTab] = useState<RewardsPortalTabKey>(
    REWARDS_PORTAL_TAB_COMMERCIAL_TRANSACTIONS,
  );

  const { data: requestsList } = useActivationRequestsListQuery({
    tenantId,
    limit: 1,
    offset: 0,
    includeItemCounts: false,
    enabled: Boolean(tenantId),
  });
  const requestsCount = requestsList?.total ?? 0;

  const tabConfig: DetailSectionTabItem<RewardsPortalTabKey>[] = [
    createDetailSectionTabItem(
      REWARDS_PORTAL_TAB_COMMERCIAL_TRANSACTIONS,
      translate('tabs.commercialTransactions'),
      Building2,
      <CommercialTransactionsTab tenantId={tenantId} />,
    ),
    createDetailSectionTabItem(
      REWARDS_PORTAL_TAB_ACTIVATION_REQUESTS,
      translate('tabs.activationRequests', { count: requestsCount }),
      List,
      <ActivationRequestsTab tenantId={tenantId} />,
    ),
    createDetailSectionTabItem(
      REWARDS_PORTAL_TAB_DEVELOPER_API,
      translate('tabs.developerApi'),
      KeyRound,
      <DeveloperApiTab />,
    ),
    createDetailSectionTabItem(
      REWARDS_PORTAL_TAB_IP_WHITELIST,
      translate('tabs.ipWhitelist'),
      ShieldCheck,
      <IpWhitelistTab tenantId={tenantId} />,
    ),
    // createDetailSectionTabItem(
    //   REWARDS_PORTAL_TAB_GC_EMAIL,
    //   translate('tabs.gcEmail'),
    //   Mail,
    //   <GcEmailTab />,
    // ),
  ];

  return (
    <DetailSectionTabsLayout
      tabs={tabConfig}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}
