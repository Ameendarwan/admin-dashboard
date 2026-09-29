'use client';

import { List, ShoppingBag } from 'lucide-react';

import {
  CATALOG_PRIMARY_TAB_LISTINGS,
  CATALOG_PRIMARY_TAB_OFFERS,
} from '@/app/(protected)/catalog-management/constants/catalogListingsConstants';
import {
  createDetailSectionTabItem,
  DetailSectionTabsLayout,
} from '@/components/DetailSectionTabsLayout';
import { PageHeader } from '@/components/PageHeader';

import {
  CatalogActiveListingsPanel,
  CatalogActiveOffersPanel,
  CatalogListingRequestsPanel,
  CatalogListingsTabSection,
  CatalogOffersTabSection,
} from './components';
import { useCatalogListings } from './hooks';

export function CatalogListingsClient() {
  const {
    translate,
    main,
    sub,
    handleMainTabChange,
    handleSubTabChange,
    handleCreate,
    activeListingsPanelProps,
    listingRequestsPanelProps,
    activeOffersPanelProps,
  } = useCatalogListings();

  return (
    <div className="min-h-screen" id="catalog-listings-page">
      <div className="space-y-1">
        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mds-black-500">
              {translate('eyebrow')}
            </p>
            <PageHeader title={translate('pageTitle')} />
          </div>

          <DetailSectionTabsLayout
            tabStripCorners="xl"
            activeTab={main}
            onTabChange={handleMainTabChange}
            tabPanelClassName="mt-5"
            tabs={[
              createDetailSectionTabItem(
                CATALOG_PRIMARY_TAB_LISTINGS,
                translate('listingsTab'),
                List,
                <CatalogListingsTabSection
                  sectionTitle={translate('sectionTitle')}
                  sectionSubtitle={translate('sectionSubtitle')}
                  createLabel={translate('createNewListing')}
                  onCreate={handleCreate}
                  sub={sub}
                  onSubTabChange={handleSubTabChange}
                  subTabLabels={{
                    active: translate('subTabActive'),
                    requests: translate('subTabRequests'),
                  }}
                  activeContent={
                    <CatalogActiveListingsPanel {...activeListingsPanelProps} />
                  }
                  requestsContent={
                    <CatalogListingRequestsPanel
                      {...listingRequestsPanelProps}
                    />
                  }
                />,
              ),
              createDetailSectionTabItem(
                CATALOG_PRIMARY_TAB_OFFERS,
                translate('offersTab'),
                ShoppingBag,
                <CatalogOffersTabSection
                  sectionTitle={translate('offersView.sectionTitle')}
                  sectionSubtitle={translate('offersView.sectionSubtitle')}
                  content={
                    <CatalogActiveOffersPanel {...activeOffersPanelProps} />
                  }
                />,
              ),
            ]}
          />
        </div>
      </div>
    </div>
  );
}
