'use client';

import { Gift, ShieldCheck } from 'lucide-react';

import {
  GIFT_CARD_ROW_MENU,
  GIFT_CARD_TAB_ACTIVATION_REQUESTS,
  GIFT_CARD_TAB_GIFT_CARDS,
} from '@/app/(protected)/gift-card-management/constants/giftCardManagementConstants';
import {
  createDetailSectionTabItem,
  DetailSectionTabsLayout,
} from '@/components/DetailSectionTabsLayout';
import { PageHeader } from '@/components/PageHeader';

import { ActivationRequestsTabPanel, GiftCardsTabPanel } from './components';
import { useGiftCardManagement } from './hooks';

export function GiftCardManagementClient() {
  const {
    translate,
    activeTab,
    setTab,
    statsData,
    statsLoading,

    setGiftCardSearch,
    giftCardColumns,
    giftCardRows,
    giftCardsDisplayPage,
    giftCardTotal,
    giftCardTotalPages,
    setGiftCardPage,
    giftCardsLoading,
    giftCardsError,
    refetchGiftCards,
    categoryFilter,
    setCategoryFilter,
    categoryOptions,
    giftCardStatusFilter,
    handleGiftCardStatusFilterChange,
    giftCardStatusOptions,
    goGiftCardDetail,

    activationColumns,
    activationRows,
    activationPage,
    setActivationPage,
    activationTotal,
    activationTotalPages,
    activationListLoading,
    activationListFetching,
    activationListError,
    refetchActivationList,
    rowMenuOptions,
    goActivationRequest,
    setActivationSearch,
    tenantFilter,
    handleTenantFilterChange,
    tenantOptions,
    activationStatusFilter,
    handleActivationStatusFilterChange,
    activationStatusOptions,
  } = useGiftCardManagement();

  const giftCardsTabContent = (
    <GiftCardsTabPanel
      translate={translate}
      columns={giftCardColumns}
      rows={giftCardRows}
      onSearchChange={setGiftCardSearch}
      categoryFilter={categoryFilter}
      onCategoryFilterChange={setCategoryFilter}
      categoryOptions={categoryOptions}
      statusFilter={giftCardStatusFilter}
      onStatusFilterChange={handleGiftCardStatusFilterChange}
      statusOptions={giftCardStatusOptions}
      page={giftCardsDisplayPage}
      total={giftCardTotal}
      totalPages={giftCardTotalPages}
      onPageChange={setGiftCardPage}
      loading={giftCardsLoading}
      error={giftCardsError}
      onRetry={() => {
        void refetchGiftCards();
      }}
      onRowClick={goGiftCardDetail}
    />
  );

  const activationRequestsTabContent = (
    <ActivationRequestsTabPanel
      translate={translate}
      pending={statsData?.pending ?? 0}
      approved={statsData?.approved ?? 0}
      rejected={statsData?.rejected ?? 0}
      columns={activationColumns}
      rows={activationRows}
      onSearchChange={setActivationSearch}
      tenantFilter={tenantFilter}
      onTenantFilterChange={handleTenantFilterChange}
      tenantOptions={tenantOptions}
      statusFilter={activationStatusFilter}
      onStatusFilterChange={handleActivationStatusFilterChange}
      statusOptions={activationStatusOptions}
      page={activationPage}
      total={activationTotal}
      totalPages={activationTotalPages}
      onPageChange={setActivationPage}
      loading={activationListLoading || statsLoading}
      error={activationListError}
      retrying={activationListFetching}
      onRetry={() => {
        void refetchActivationList();
      }}
      rowMenuOptions={rowMenuOptions}
      onRowMenuSelect={(value, row) => {
        if (value === GIFT_CARD_ROW_MENU.VIEW) {
          goActivationRequest(row);
        }
      }}
      onRowClick={goActivationRequest}
    />
  );

  return (
    <div id="gift-card-management-page" className="min-h-screen">
      <div className="space-y-1">
        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mds-black-500">
              {translate('eyebrow')}
            </p>
            <PageHeader title={translate('giftCardManagement.pageTitle')}>
              {/* <Button
                variant="primary"
                type="button"
                leftIcon={<CirclePlus className="h-5 w-5" aria-hidden />}
              >
                {translate('giftCardManagement.addGiftCard')}
              </Button> */}
            </PageHeader>
          </div>

          <DetailSectionTabsLayout
            tabStripCorners="xl"
            activeTab={activeTab}
            onTabChange={setTab}
            tabPanelClassName="mt-5"
            tabs={[
              createDetailSectionTabItem(
                GIFT_CARD_TAB_GIFT_CARDS,
                translate('giftCardManagement.tabs.giftCards'),
                Gift,
                giftCardsTabContent,
              ),
              createDetailSectionTabItem(
                GIFT_CARD_TAB_ACTIVATION_REQUESTS,
                translate('giftCardManagement.tabs.activationRequests', {
                  count: statsData?.pending ?? 0,
                }),
                ShieldCheck,
                activationRequestsTabContent,
              ),
            ]}
          />
        </div>
      </div>
    </div>
  );
}
