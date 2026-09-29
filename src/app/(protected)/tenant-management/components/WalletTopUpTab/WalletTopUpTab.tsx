'use client';

import { Button } from '@merit-incentives/ui';

import { Spinner } from '@/components/Spinner';
import { TopUpHistoryTable } from '@/components/TopUpHistoryTable';

import {
  ApproveFloatTopUpModal,
  ProductWalletsSection,
  RejectFloatTopUpModal,
  ReviewFloatTopUpModal,
  TenantFloatWalletsTable,
  TotalBalanceCard,
  WalletBalanceSection,
  WalletFreezeStatusModal,
} from './components';
import { useWalletFreezeActions, useWalletTopUpTab } from './hooks';

interface WalletTopUpTabProps {
  tenantId: string;
  tenantName: string;
}

export function WalletTopUpTab({
  tenantId,
  tenantName,
}: Readonly<WalletTopUpTabProps>) {
  const {
    translate,
    reviewModalView,
    reviewContext,
    isDetailReady,
    isDetailLoading,
    isDetailFetching,
    isDetailError,
    masterWallets,
    productWallets,
    tenantWallets,
    isLoading,
    isError,
    summary,
    displayedPrimaryCurrencyLabel,
    closeReviewModals,
    handleOpenApproveModal,
    handleOpenRejectModal,
    handleRetry,
    handleRetryDetail,
  } = useWalletTopUpTab({ tenantId, tenantName });

  const {
    freezeModalContext,
    isFreezeModalOpen,
    isFreezeActionLoading,
    isMasterFrozen,
    // canFreezeMaster,
    // canUnfreezeMaster,
    closeFreezeModal,
    confirmFreezeAction,
    // openMasterFreezeModal,
    // openMasterUnfreezeModal,
    // openProductFreezeModal,
    // openProductUnfreezeModal,
    // openSubTenantFreezeModal,
    // openSubTenantUnfreezeModal,
    getProductFreezeState,
  } = useWalletFreezeActions({
    tenantId,
    tenantName,
    primaryCurrencyCode: summary?.primaryCurrencyCode ?? null,
    masterWallets,
    productWallets,
    tenantWallets,
  });

  if (isLoading) {
    return <Spinner text={translate('loading')} />;
  }

  if (isError || !summary) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-normal text-red-600">
          {translate('loadError')}
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleRetry}
        >
          {translate('retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-6">
      {reviewContext ? (
        <>
          <ReviewFloatTopUpModal
            isOpen={reviewModalView === 'review'}
            onClose={closeReviewModals}
            onApprove={handleOpenApproveModal}
            onReject={handleOpenRejectModal}
            tenantName={reviewContext.tenantName}
            pendingReview={reviewContext.pendingReview}
            isDetailLoading={isDetailLoading}
            isDetailError={isDetailError}
            isDetailReady={isDetailReady}
            onRetryDetail={handleRetryDetail}
          />
          <ApproveFloatTopUpModal
            tenantId={tenantId}
            isOpen={reviewModalView === 'approve'}
            onClose={closeReviewModals}
            tenantName={reviewContext.tenantName}
            pendingReview={reviewContext.pendingReview}
            isDetailLoading={isDetailFetching}
            isDetailError={isDetailError}
            isDetailReady={isDetailReady}
            onRetryDetail={handleRetryDetail}
          />
          <RejectFloatTopUpModal
            tenantId={tenantId}
            isOpen={reviewModalView === 'reject'}
            onClose={closeReviewModals}
            tenantName={reviewContext.tenantName}
            pendingReview={reviewContext.pendingReview}
          />
        </>
      ) : null}

      {/* Keep sections above history at z-0 so upward filter menus aren't covered. */}
      <div className="relative z-0 flex flex-col gap-6">
        <TotalBalanceCard
          totalBalanceMinor={summary.totalBalanceMinor}
          minorUnit={summary.totalBalanceMinorUnit}
          currencyCode={summary.primaryCurrencyCode}
          currencyLabel={`${translate('totalBalance.currencyLabel')}: ${displayedPrimaryCurrencyLabel}`}
          masterStatus={
            masterWallets.length > 0
              ? isMasterFrozen
                ? 'FROZEN'
                : 'ACTIVE'
              : undefined
          }
          // TODO: Freeze/unfreeze actions will be added in next iteration
          // canFreezeMaster={canFreezeMaster}
          // canUnfreezeMaster={canUnfreezeMaster}
          // onFreezeMaster={openMasterFreezeModal}
          // onUnfreezeMaster={openMasterUnfreezeModal}
        />

        <WalletBalanceSection wallets={masterWallets} />

        <ProductWalletsSection
          productWallets={productWallets}
          getProductFreezeState={getProductFreezeState}
          // TODO: Freeze/unfreeze actions will be added in next iteration
          // onFreezeProduct={openProductFreezeModal}
          // onUnfreezeProduct={openProductUnfreezeModal}
        />

        {tenantWallets.length > 0 && (
          <TenantFloatWalletsTable
            tenantName={tenantName}
            entries={tenantWallets}
            // TODO: Freeze/unfreeze actions will be added in next iteration
            // onFreezeWallet={openSubTenantFreezeModal}
            // onUnfreezeWallet={openSubTenantUnfreezeModal}
          />
        )}
      </div>

      <TopUpHistoryTable tenantId={tenantId} summary={summary} />

      <WalletFreezeStatusModal
        isOpen={isFreezeModalOpen}
        context={freezeModalContext}
        isLoading={isFreezeActionLoading}
        onClose={closeFreezeModal}
        onConfirm={() => {
          void confirmFreezeAction();
        }}
      />
    </div>
  );
}
