'use client';

import { useState } from 'react';
import { Building2, CreditCard, Users, Wallet } from 'lucide-react';

import {
  createDetailSectionTabItem,
  DetailSectionTabsLayout,
  type DetailSectionTabItem,
} from '@/components/DetailSectionTabsLayout';
import { useLocalization } from '@/hooks';
import type { ReviewMode } from '@/lib/enums';
import type { RevisionFieldCallbacks } from '@/types/review';
import type {
  Attachment,
  BeneficialOwnerMetadata,
  BusinessDetailsMetadata,
  ComplianceDeclarationsMetadata,
  DirectorMetadata,
  DetailedTenantProfile,
} from '@/types/tenantManagement';

import { BusinessDetailsReview } from '../BusinessDetailsReview';
import { AttachedDocumentsReview } from '../AttachedDocumentsReview';
import { ComplianceDeclarationsReview } from '../ComplianceDeclarationsReview';
import { UserManagementTab } from '../UserManagementTab/UserManagementTab';
import { SubscriptionsTabContent } from './SubscriptionsTabContent';
import { WalletTopUpTab } from '../WalletTopUpTab';

type TenantDetailsTabsProps = {
  tenant: DetailedTenantProfile;
  accountManager: string;
  tenantEmailFromUrl?: string;
  businessDetails: BusinessDetailsMetadata | undefined;
  directors: DirectorMetadata[];
  beneficialOwners: BeneficialOwnerMetadata[];
  attachedDocuments: Attachment[] | null;
  compliance: ComplianceDeclarationsMetadata | undefined;
  mode: ReviewMode;
  tenantId: string;
  onRevisionRequest: RevisionFieldCallbacks['onRevisionRequest'];
  onRevisionClear: RevisionFieldCallbacks['onRevisionClear'];
};

type TenantTabKey =
  | 'overview-kyb'
  | 'subscriptions'
  | 'wallet'
  | 'user-management';

const showUserManagementTab = false;

function tenantNameFromProfile(
  tenant: DetailedTenantProfile,
  tenantEmailFromUrl?: string,
): string {
  const businessName =
    tenant.customerProfileData[0]?.businessDetailsMetadata?.businessName;
  if (typeof businessName === 'string' && businessName.trim()) {
    return businessName.trim();
  }
  if (tenantEmailFromUrl?.trim()) {
    return tenantEmailFromUrl.trim();
  }
  return tenant.tenantId || '';
}

export function TenantDetailsTabs({
  tenant,
  accountManager,
  tenantEmailFromUrl,
  businessDetails,
  directors,
  beneficialOwners,
  attachedDocuments,
  compliance,
  mode,
  tenantId: tenantIdFromPage,
  onRevisionRequest,
  onRevisionClear,
}: Readonly<TenantDetailsTabsProps>) {
  const { translate } = useLocalization('tenant-details');
  const tenantId = tenantIdFromPage || tenant.tenantId || '';
  const [activeTab, setActiveTab] = useState<TenantTabKey>('overview-kyb');
  const tenantName = tenantNameFromProfile(tenant, tenantEmailFromUrl);

  const revisionFieldProps = {
    mode,
    onRevisionRequest,
    onRevisionClear,
  } as const;

  const overviewContent = (
    <div className="flex flex-col gap-6">
      {businessDetails ? (
        <BusinessDetailsReview
          businessDetails={businessDetails}
          directors={directors}
          beneficialOwners={beneficialOwners}
          accountManager={accountManager}
          {...revisionFieldProps}
        />
      ) : null}
      {attachedDocuments === undefined ? null : (
        <AttachedDocumentsReview
          attachments={attachedDocuments}
          {...revisionFieldProps}
        />
      )}
      {compliance ? (
        <ComplianceDeclarationsReview
          compliance={compliance}
          {...revisionFieldProps}
        />
      ) : null}
    </div>
  );

  const tabConfig: DetailSectionTabItem<TenantTabKey>[] = [
    createDetailSectionTabItem(
      'overview-kyb',
      translate('tabs.overviewKyb'),
      Building2,
      overviewContent,
    ),
    createDetailSectionTabItem(
      'subscriptions',
      translate('tabs.subscriptions'),
      CreditCard,
      <SubscriptionsTabContent
        tenant={tenant}
        tenantId={tenantId}
        tenantName={tenantName}
        tenantEmailFromUrl={tenantEmailFromUrl}
      />,
    ),
    createDetailSectionTabItem(
      'wallet',
      translate('tabs.wallet'),
      Wallet,
      <WalletTopUpTab tenantId={tenantId} tenantName={tenantName} />,
    ),
    ...(showUserManagementTab
      ? [
          createDetailSectionTabItem(
            'user-management',
            translate('tabs.userManagement'),
            Users,
            <UserManagementTab tenantId={tenantId} />,
          ),
        ]
      : []),
  ];

  return (
    <DetailSectionTabsLayout
      tabs={tabConfig}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}
