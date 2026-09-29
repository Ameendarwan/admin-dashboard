/* eslint-disable import/order */

'use client';

import { Button, Tabs } from '@merit-incentives/ui';

import { ConfirmationPopup } from '@/components/ConfirmationPopup';
import { InviteSellerDialog } from '@/app/(protected)/sellers/components/InviteSellerDialog';
import { PageHeader } from '@/components/PageHeader';
import React from 'react';
import type { SellerJourney } from '@/services/sellerService';
import { SellersTable } from '@/app/(protected)/sellers/components/SellersTable';
import { TableStateDisplay } from '@/components/TableStateDisplay';
import { TenantJourney } from '@/lib/enums';
import { useLocalization } from '@/hooks/useLocalization';
import { useSellersPage } from './hooks/useSellersPage';

export default function SellersOverviewPage() {
  const { translate } = useLocalization('sellers-dashboard');

  const {
    sellerInvites,
    pagination,
    isLoading,
    error,
    showErrorState,
    journey,
    sortOrder,
    isInviteDialogOpen,
    showInviteSuccessPopup,
    showInviteErrorPopup,
    invitedEmail,
    createInviteMutation,
    handleJourneyChange,
    handleInviteSeller,
    handleInvite,
    handleSellerSelect,
    handlePageChange,
    handleSearchChange,
    handleStatusFilterChange,
    handleSortChange,
    handleCloseInviteDialog,
    handleCloseSuccessPopup,
    handleCloseErrorPopup,
    handleResendInvite,
  } = useSellersPage(10);

  const tableContent = (
    <SellersTable
      journey={journey}
      sellerProfiles={sellerInvites}
      onSellerSelect={handleSellerSelect}
      onPageChange={handlePageChange}
      pagination={pagination}
      loadingRowId={null}
      onSearchChange={handleSearchChange}
      onStatusFilterChange={handleStatusFilterChange}
      sortOrder={sortOrder}
      onSortChange={handleSortChange}
      loading={isLoading}
      onResendInvite={handleResendInvite}
    />
  );

  return (
    <div id="sellers-overview-page" className="min-h-screen">
      <div className="space-y-1">
        <div className="space-y-6">
          <PageHeader title={translate('title')}>
            <Button
              variant="primary"
              onClick={handleInviteSeller}
              className="w-47"
            >
              {translate('inviteSeller')}
            </Button>
          </PageHeader>

          {showErrorState && (
            <TableStateDisplay
              type="error"
              title={translate('errorLoadingSellers')}
              description={
                error instanceof Error
                  ? error.message
                  : 'Unknown error occurred'
              }
              showRetryButton
              onRetry={() => globalThis.location.reload()}
              retryButtonText={translate('retry')}
            />
          )}

          {!showErrorState && (
            <div className="bg-white rounded-mds-md shadow overflow-hidden **:[[role=tablist]]:border-mds-primary-100">
              <Tabs
                showContent
                size="md"
                onChange={(key: string) =>
                  handleJourneyChange(key as SellerJourney)
                }
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
          )}
        </div>

        <InviteSellerDialog
          isOpen={isInviteDialogOpen}
          onClose={handleCloseInviteDialog}
          onInvite={handleInvite}
          isLoading={createInviteMutation.isPending}
        />

        <ConfirmationPopup
          isOpen={showInviteSuccessPopup}
          onClose={handleCloseSuccessPopup}
          type="success"
          title={translate('inviteSuccess.title')}
          description={translate('inviteSuccess.message', {
            email: invitedEmail,
          })}
          primaryButton={{
            text: translate('inviteSuccess.confirmText'),
            variant: 'primary',
          }}
          onPrimaryAction={handleCloseSuccessPopup}
        />

        <ConfirmationPopup
          isOpen={showInviteErrorPopup}
          onClose={handleCloseErrorPopup}
          type="error"
          title={translate('inviteError.title')}
          description={
            <>
              {translate('inviteError.messagePrefix')}{' '}
              <strong>{invitedEmail}</strong>{' '}
              {translate('inviteError.messageSuffix')}
            </>
          }
          primaryButton={{
            text: translate('inviteError.confirmText'),
            variant: 'primary',
          }}
          onPrimaryAction={handleCloseErrorPopup}
        />
      </div>
    </div>
  );
}
