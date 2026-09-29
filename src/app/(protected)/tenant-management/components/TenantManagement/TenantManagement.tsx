'use client';

import React, { useState } from 'react';
import { Button, toast, Tabs } from '@merit-incentives/ui';
import { CirclePlus } from 'lucide-react';

import type {
  TenantProfile,
  InviteTenantFormData,
} from '@/types/tenantManagement';
import { TenantInviteStatus, TenantJourney } from '@/lib/enums';
import { PageHeader } from '@/components';
import type { Pagination } from '@/types/pagination';
import { useAuth } from '@/app/contexts/auth-context';
import { useCreateInvite } from '@/api-queries/invite';
import { useLocalization } from '@/hooks/useLocalization';
import { buildInviteCountryAccountParts } from '@/utils/tenantInvitePayloadUtils';

import { TenantsTable, InviteTenantDialog } from '../index';

interface TenantManagementProps {
  journey: TenantJourney;
  onJourneyChange: (journey: TenantJourney) => void;
  tenantProfiles: TenantProfile[];
  onTenantSelect: (tenantProfile: TenantProfile) => void;
  onInviteTenant: () => void;
  onPageChange: (page: number) => void;
  pagination: Pagination;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onApprove: (tenantProfile: TenantProfile) => void;
  onReject: (tenantProfile: TenantProfile) => void;
  onRequestReview: (tenantProfile: TenantProfile) => void;
  onResendInvite?: (tenantProfile: TenantProfile) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  productsFilter: string;
  onProductsFilterChange: (value: string) => void;
  countryFilter: string;
  onCountryFilterChange: (value: string) => void;
  accountManagerFilter: string;
  onAccountManagerFilterChange: (value: string) => void;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (order: 'asc' | 'desc' | null) => void;
  isLoading: boolean;
  error: Error | null;
  loadingRowId?: string | null;
}

export function TenantManagement({
  journey,
  onJourneyChange,
  tenantProfiles,
  onTenantSelect,
  onPageChange,
  pagination,
  searchValue,
  onSearchChange,
  onApprove,
  onReject,
  onRequestReview,
  onResendInvite,
  statusFilter,
  onStatusFilterChange,
  productsFilter,
  onProductsFilterChange,
  countryFilter,
  onCountryFilterChange,
  accountManagerFilter,
  onAccountManagerFilterChange,
  sortOrder,
  onSortChange,
  isLoading,
  error,
  loadingRowId,
}: Readonly<TenantManagementProps>) {
  const { translate } = useLocalization('tenant-management');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const { user } = useAuth();
  const createInviteMutation = useCreateInvite();

  const tableContent = (
    <TenantsTable
      journey={journey}
      tenantProfiles={tenantProfiles}
      onTenantSelect={onTenantSelect}
      pagination={pagination}
      onPageChange={onPageChange}
      onApprove={onApprove}
      onReject={onReject}
      onRequestReview={onRequestReview}
      onResendInvite={onResendInvite}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      statusFilter={statusFilter}
      onStatusFilterChange={onStatusFilterChange}
      productsFilter={productsFilter}
      onProductsFilterChange={onProductsFilterChange}
      countryFilter={countryFilter}
      onCountryFilterChange={onCountryFilterChange}
      accountManagerFilter={accountManagerFilter}
      onAccountManagerFilterChange={onAccountManagerFilterChange}
      sortOrder={sortOrder}
      onSortChange={onSortChange}
      isLoading={isLoading}
      error={error}
      loadingRowId={loadingRowId}
    />
  );

  const handleInvite = async (data: InviteTenantFormData) => {
    if (!user?.userId) {
      return;
    }

    try {
      await createInviteMutation.mutateAsync({
        request: {
          invitedBy: user.userId,
          email: data.email,
          tenantName: data.businessName,
          platforms: data.products ?? [],
          status: TenantInviteStatus.PENDING,
          ...buildInviteCountryAccountParts(data.country, data.accountManager),
        },
        ...(data.businessContract && {
          file: data.businessContract,
        }),
      });

      setIsInviteDialogOpen(false);
      toast.success(translate('inviteSuccess'), {
        description: translate('inviteSuccessDescription'),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : translate('inviteErrorDescription');
      toast.error(translate('inviteError'), {
        description: errorMessage,
      });
    }
  };

  const handleInviteTenant = () => {
    setIsInviteDialogOpen(true);
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-1">
        <div className="space-y-6">
          <PageHeader title={translate('title')}>
            <Button
              variant="primary"
              onClick={handleInviteTenant}
              leftIcon={<CirclePlus className="h-5 w-5" />}
            >
              {translate('addTenant')}
            </Button>
          </PageHeader>

          <div className="bg-white rounded-mds-md shadow overflow-hidden [&_[role=tablist]]:border-mds-primary-100">
            <Tabs
              showContent
              size="md"
              onChange={(key: string) => onJourneyChange(key as TenantJourney)}
              tabs={[
                {
                  key: TenantJourney.ONBOARDED,
                  label: translate('tabs.onboarded'),
                  content: tableContent,
                },
                {
                  key: TenantJourney.INVITED,
                  label: translate('tabs.invited'),
                  content: tableContent,
                },
              ]}
            />
          </div>
        </div>

        <InviteTenantDialog
          isOpen={isInviteDialogOpen}
          onClose={() => setIsInviteDialogOpen(false)}
          onInvite={handleInvite}
          isLoading={createInviteMutation.isPending}
        />
      </div>
    </div>
  );
}
