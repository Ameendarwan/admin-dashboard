'use client';

import { InputDropdown, toast } from '@merit-incentives/ui';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, type ReactNode } from 'react';

import {
  CATALOG_LISTINGS_ROW_MENU,
  CATALOG_PRIMARY_TAB_LISTINGS,
  CATALOG_PRIMARY_TAB_OFFERS,
} from '@/app/(protected)/catalog-management/constants/catalogListingsConstants';
import {
  CATALOG_AL_FILTER,
  CATALOG_LR_FILTER,
  CATALOG_OF_FILTER,
  createdAtSortUrlValue,
  toggleCreatedAtSort,
} from '@/app/(protected)/catalog-management/constants/catalogListFilterKeys';
import { CatalogBrandSearchSelect } from '@/app/(protected)/catalog-management/components/CatalogBrandSearchSelect';
import { CatalogListToolbar } from '@/app/(protected)/catalog-management/components/CatalogListToolbar';
import { CatalogSellerSearchSelect } from '@/app/(protected)/catalog-management/components/CatalogSellerSearchSelect';
import { useAdminCatalogActiveListings } from '@/app/(protected)/catalog-management/hooks/useAdminCatalogActiveListings';
import { useAdminCatalogActiveOffers } from '@/app/(protected)/catalog-management/hooks/useAdminCatalogActiveOffers';
import { useAdminCatalogListingRequests } from '@/app/(protected)/catalog-management/hooks/useAdminCatalogListingRequests';
import { useCatalogCategoryFilterOptions } from '@/app/(protected)/catalog-management/hooks/useCatalogCategoryFilterOptions';
import { useCatalogListingsUrlState } from '@/app/(protected)/catalog-management/hooks/useCatalogListingsUrlState';
import { useDebouncedCatalogUrlSearch } from '@/app/(protected)/catalog-management/hooks/useDebouncedCatalogUrlSearch';
import {
  useCatalogActiveListingTableColumns,
  useCatalogActiveOfferTableColumns,
  useCatalogRequestListingTableColumns,
} from '@/app/(protected)/catalog-management/hooks/useCatalogListingsTableColumns';
import { isListingRequestRowActionable } from '@/app/(protected)/catalog-management/lib/listingRequestRowFieldReaders';
import {
  buildCatalogListingsReturnTo,
  catalogListingDetailHref,
  catalogListingRequestDetailHref,
  type CatalogListingsSubTab,
} from '@/app/(protected)/catalog-management/utils/catalogListingsRoute';
import {
  activeListingApiStatus,
  offerApiCategoryId,
  readActiveListingUrlFilters,
  readListingRequestUrlFilters,
  readOfferUrlFilters,
} from '@/app/(protected)/catalog-management/utils/catalogUrlFilters';
import { catalogOfferDetailHref } from '@/app/(protected)/catalog-management/utils/offerDetailRoute';
import { useLocalization } from '@/hooks/useLocalization';
import type {
  ActiveListingRow,
  CatalogOfferListRow,
  ListingRequestRow,
} from '@/types/catalog';

/** All state, data fetching, navigation and menu wiring for the catalog listings page. */
export function useCatalogListings() {
  const { translate } = useLocalization('catalog');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { main, sub, page, setPage, setQuery } = useCatalogListingsUrlState();
  const isCatalogListingsActiveTab =
    main === CATALOG_PRIMARY_TAB_LISTINGS && sub === 'active';
  const isCatalogOffersActiveTab =
    main === CATALOG_PRIMARY_TAB_OFFERS && sub === 'active';
  const isCatalogListingRequestsTab =
    main === CATALOG_PRIMARY_TAB_LISTINGS && sub === 'requests';

  const listingRequestFilters = useMemo(
    () => readListingRequestUrlFilters(searchParams),
    [searchParams],
  );
  const activeListingFilters = useMemo(
    () => readActiveListingUrlFilters(searchParams),
    [searchParams],
  );
  const offerFilters = useMemo(
    () => readOfferUrlFilters(searchParams),
    [searchParams],
  );

  const commitListingRequestSearch = useCallback(
    (next: string | undefined) => {
      setQuery({ filters: { [CATALOG_LR_FILTER.search]: next } });
    },
    [setQuery],
  );
  const commitActiveListingSearch = useCallback(
    (next: string | undefined) => {
      setQuery({ filters: { [CATALOG_AL_FILTER.search]: next } });
    },
    [setQuery],
  );
  const commitOfferSearch = useCallback(
    (next: string | undefined) => {
      setQuery({ filters: { [CATALOG_OF_FILTER.search]: next } });
    },
    [setQuery],
  );

  const [listingRequestSearchInput, setListingRequestSearchInput] =
    useDebouncedCatalogUrlSearch(
      listingRequestFilters.search,
      commitListingRequestSearch,
    );
  const [activeListingSearchInput, setActiveListingSearchInput] =
    useDebouncedCatalogUrlSearch(
      activeListingFilters.search,
      commitActiveListingSearch,
    );
  const [offerSearchInput, setOfferSearchInput] = useDebouncedCatalogUrlSearch(
    offerFilters.search,
    commitOfferSearch,
  );

  const hasActiveListingDropdownFilters = Boolean(
    activeListingFilters.status ||
    activeListingFilters.parentCategoryId ||
    activeListingFilters.brandId ||
    activeListingFilters.type,
  );
  const hasListingRequestDropdownFilters = Boolean(
    listingRequestFilters.tenantId ||
    listingRequestFilters.status ||
    listingRequestFilters.matchResult ||
    listingRequestFilters.parentCategoryId,
  );
  const hasOfferDropdownFilters = Boolean(
    offerFilters.sellerId ||
    offerFilters.status ||
    offerFilters.parentCategoryId,
  );

  const listingTypeIsGiftcard =
    activeListingFilters.type === 'giftcard'
      ? true
      : activeListingFilters.type === 'merchandise'
        ? false
        : undefined;

  const listingRequestCategoryFilters = useCatalogCategoryFilterOptions({
    enabled: isCatalogListingRequestsTab,
    parentCategoryId: listingRequestFilters.parentCategoryId,
    allCategoriesLabel: translate('allCategories'),
    allSubcategoriesLabel: translate('filters.allSubcategories'),
  });
  const activeListingCategoryFilters = useCatalogCategoryFilterOptions({
    enabled: isCatalogListingsActiveTab,
    parentCategoryId: activeListingFilters.parentCategoryId,
    allCategoriesLabel: translate('allCategories'),
    allSubcategoriesLabel: translate('filters.allSubcategories'),
    isGiftcardCategory: listingTypeIsGiftcard,
  });
  const offerCategoryFilters = useCatalogCategoryFilterOptions({
    enabled: isCatalogOffersActiveTab,
    parentCategoryId: offerFilters.parentCategoryId,
    allCategoriesLabel: translate('allCategories'),
    allSubcategoriesLabel: translate('filters.allSubcategories'),
  });

  const liveActiveListings = useAdminCatalogActiveListings(
    isCatalogListingsActiveTab,
    {
      page,
      setPage,
      filters: {
        search: activeListingFilters.search,
        status: activeListingApiStatus(activeListingFilters.status),
        categoryIds: activeListingFilters.subCategoryId
          ? [activeListingFilters.subCategoryId]
          : activeListingCategoryFilters.productListCategoryIds,
        brandId: activeListingFilters.brandId,
        isGiftcard: listingTypeIsGiftcard,
        sortOrder: activeListingFilters.sortOrder,
      },
    },
  );
  const liveActiveOffers = useAdminCatalogActiveOffers(
    isCatalogOffersActiveTab,
    {
      page,
      setPage,
      filters: {
        search: offerFilters.search,
        status: offerFilters.status,
        sellerId: offerFilters.sellerId,
        categoryId: offerApiCategoryId(offerFilters),
      },
    },
  );
  const liveListingRequests = useAdminCatalogListingRequests(
    isCatalogListingRequestsTab,
    { page, setPage, filters: listingRequestFilters },
  );

  useEffect(() => {
    if (liveActiveListings.error) {
      toast.error(liveActiveListings.error);
    }
  }, [liveActiveListings.error]);

  useEffect(() => {
    if (liveActiveOffers.error) {
      toast.error(liveActiveOffers.error);
    }
  }, [liveActiveOffers.error]);

  useEffect(() => {
    if (liveListingRequests.error) {
      toast.error(liveListingRequests.error);
    }
  }, [liveListingRequests.error]);

  const dateOptions = useMemo(
    () => [
      { value: 'all', label: translate('dateAll') },
      { value: '2024', label: translate('date2024') },
      { value: '2023', label: translate('date2023') },
    ],
    [translate],
  );

  const requestStatusOptions = useMemo(
    () => [
      { value: 'all', label: translate('allStatuses') },
      { value: 'under_review', label: translate('status.pendingReview') },
      { value: 'live', label: translate('status.approved') },
      { value: 'rejected', label: translate('status.rejected') },
    ],
    [translate],
  );

  const matchResultOptions = useMemo(
    () => [
      { value: 'all', label: translate('filters.allMatchResults') },
      { value: 'match_found', label: translate('matchResult.matchFound') },
      {
        value: 'possible_match',
        label: translate('matchResult.possibleMatch'),
      },
      { value: 'no_match_found', label: translate('matchResult.noMatchFound') },
    ],
    [translate],
  );

  const listingStatusOptions = useMemo(
    () => [
      { value: 'all', label: translate('allStatuses') },
      { value: 'active', label: translate('status.active') },
      { value: 'draft', label: translate('status.draft') },
      { value: 'archived', label: translate('status.archived') },
    ],
    [translate],
  );

  const listingTypeOptions = useMemo(
    () => [
      { value: 'all', label: translate('filters.allTypes') },
      { value: 'merchandise', label: translate('filters.merchandise') },
      { value: 'giftcard', label: translate('filters.giftcard') },
    ],
    [translate],
  );

  const offerStatusOptions = useMemo(
    () => [
      { value: 'all', label: translate('allStatuses') },
      { value: 'ACTIVE', label: translate('offerLifecycle.active') },
      { value: 'INACTIVE', label: translate('offerLifecycle.inactive') },
      { value: 'EXPIRED', label: translate('offerLifecycle.expired') },
    ],
    [translate],
  );

  const activeColumns = useCatalogActiveListingTableColumns(translate);
  const requestColumns = useCatalogRequestListingTableColumns(translate);
  const activeOfferColumns = useCatalogActiveOfferTableColumns(translate);

  const handleCreate = useCallback(() => {
    router.push('/catalog-management/listings/new');
  }, [router]);

  const goListing = useCallback(
    (id: string) => {
      const returnTo = buildCatalogListingsReturnTo(pathname, searchParams);
      router.push(catalogListingDetailHref(id, returnTo));
    },
    [pathname, router, searchParams],
  );

  const goRequest = useCallback(
    (id: string) => {
      const returnTo = buildCatalogListingsReturnTo(pathname, searchParams);
      router.push(catalogListingRequestDetailHref(id, returnTo));
    },
    [pathname, router, searchParams],
  );

  const goOffer = useCallback(
    (id: string, sellerName?: string) => {
      const returnTo = buildCatalogListingsReturnTo(pathname, searchParams);
      router.push(
        catalogOfferDetailHref(id, {
          sellerName,
          returnTo,
        }),
      );
    },
    [pathname, router, searchParams],
  );

  const activeRowMenuOptions = useMemo(
    () => [
      { value: CATALOG_LISTINGS_ROW_MENU.VIEW, label: translate('menuView') },
    ],
    [translate],
  );

  const requestRowMenuOptions = useCallback(
    (row: ListingRequestRow) =>
      isListingRequestRowActionable(row.status)
        ? [
            {
              value: CATALOG_LISTINGS_ROW_MENU.VIEW,
              label: translate('menuViewRequest'),
            },
          ]
        : [],
    [translate],
  );

  const isRequestRowMenuDisabled = useCallback(
    (row: ListingRequestRow) => !isListingRequestRowActionable(row.status),
    [],
  );

  const offerRowMenuOptions = useMemo(
    () => [
      { value: CATALOG_LISTINGS_ROW_MENU.VIEW, label: translate('menuView') },
    ],
    [translate],
  );

  const onActiveMenu = useCallback(
    (value: string, row: ActiveListingRow) => {
      if (value === CATALOG_LISTINGS_ROW_MENU.VIEW) {
        goListing(row.id);
      }
    },
    [goListing],
  );

  const onRequestMenu = useCallback(
    (value: string, row: ListingRequestRow) => {
      if (value === CATALOG_LISTINGS_ROW_MENU.VIEW) {
        goRequest(row.id);
      } else {
        toast.info(translate('placeholders.rowAction'));
      }
    },
    [goRequest, translate],
  );

  const onActiveOfferMenu = useCallback(
    (value: string, row: CatalogOfferListRow) => {
      if (value === CATALOG_LISTINGS_ROW_MENU.VIEW) {
        goOffer(row.id, row.seller);
        return;
      }
      toast.info(translate('placeholders.rowAction'));
    },
    [goOffer, translate],
  );

  const onActiveOfferRowClick = useCallback(
    (row: CatalogOfferListRow) => {
      goOffer(row.id, row.seller);
    },
    [goOffer],
  );

  const onActiveListingRowClick = useCallback(
    (row: ActiveListingRow) => {
      goListing(row.id);
    },
    [goListing],
  );

  const onListingRequestRowClick = useCallback(
    (row: ListingRequestRow) => {
      goRequest(row.id);
    },
    [goRequest],
  );

  const fromActive =
    (liveActiveListings.page - 1) * liveActiveListings.pageSize + 1;
  const toActive = Math.min(
    fromActive + Math.max(liveActiveListings.rows.length - 1, 0),
    liveActiveListings.total,
  );
  const fromReq =
    (liveListingRequests.page - 1) * liveListingRequests.pageSize + 1;
  const toReq = Math.min(
    fromReq + Math.max(liveListingRequests.rows.length - 1, 0),
    liveListingRequests.total,
  );
  const fromOfferActive =
    (liveActiveOffers.page - 1) * liveActiveOffers.pageSize + 1;
  const toOfferActive = Math.min(
    fromOfferActive + Math.max(liveActiveOffers.rows.length - 1, 0),
    liveActiveOffers.total,
  );

  const handleMainTabChange = useCallback(
    (key: string) => {
      if (key === CATALOG_PRIMARY_TAB_OFFERS) {
        setQuery({ main: CATALOG_PRIMARY_TAB_OFFERS, sub: 'active' });
      } else {
        setQuery({ main: CATALOG_PRIMARY_TAB_LISTINGS, sub });
      }
    },
    [setQuery, sub],
  );

  const handleSubTabChange = useCallback(
    (key: CatalogListingsSubTab) => {
      setQuery({ sub: key });
    },
    [setQuery],
  );

  const activeListingsToolbar: ReactNode = (
    <CatalogListToolbar
      searchValue={activeListingSearchInput}
      onSearchChange={setActiveListingSearchInput}
      searchPlaceholder={translate('listings.searchPlaceholder')}
      extraFilters={
        <>
          <div className="min-w-[10.5rem] flex-1">
            <InputDropdown
              value={activeListingFilters.type ?? 'all'}
              onChange={(value) =>
                setQuery({
                  filters: {
                    [CATALOG_AL_FILTER.type]: value,
                    [CATALOG_AL_FILTER.category]: undefined,
                    [CATALOG_AL_FILTER.subcategory]: undefined,
                  },
                })
              }
              options={listingTypeOptions}
              placeholder={translate('filters.allTypes')}
            />
          </div>
          <div className="min-w-[10.5rem] flex-1">
            <CatalogBrandSearchSelect
              value={activeListingFilters.brandId ?? ''}
              onChange={(brandId) =>
                setQuery({
                  filters: {
                    [CATALOG_AL_FILTER.brand]: brandId || undefined,
                  },
                })
              }
              enabled={isCatalogListingsActiveTab}
              allBrandsLabel={translate('filters.allBrands')}
              searchPlaceholder={translate('filters.brandSearchPlaceholder')}
              loadingLabel={translate('filters.brandsLoading')}
              noResultsLabel={translate('filters.noBrandResults')}
            />
          </div>
        </>
      }
      showStatus
      statusValue={activeListingFilters.status ?? 'all'}
      onStatusChange={(value) =>
        setQuery({ filters: { [CATALOG_AL_FILTER.status]: value } })
      }
      statusOptions={listingStatusOptions}
      categoryValue={activeListingFilters.parentCategoryId ?? 'all'}
      onCategoryChange={(value) =>
        setQuery({
          filters: {
            [CATALOG_AL_FILTER.category]: value,
            [CATALOG_AL_FILTER.subcategory]: undefined,
          },
        })
      }
      categoryOptions={activeListingCategoryFilters.categoryOptions}
      showCategoryFilter
      showSubcategoryFilter={activeListingCategoryFilters.showSubcategory}
      subcategoryValue={activeListingFilters.subCategoryId ?? 'all'}
      onSubcategoryChange={(value) =>
        setQuery({
          filters: { [CATALOG_AL_FILTER.subcategory]: value },
        })
      }
      subcategoryOptions={activeListingCategoryFilters.subcategoryOptions}
      showDateFilter={false}
      dateValue="all"
      onDateChange={() => {}}
      dateOptions={dateOptions}
      hasActiveFilters={hasActiveListingDropdownFilters}
      onClearFilters={() =>
        setQuery({
          filters: {
            [CATALOG_AL_FILTER.status]: undefined,
            [CATALOG_AL_FILTER.category]: undefined,
            [CATALOG_AL_FILTER.subcategory]: undefined,
            [CATALOG_AL_FILTER.brand]: undefined,
            [CATALOG_AL_FILTER.type]: undefined,
          },
        })
      }
      showCreatedAtSort
      createdAtSortOrder={activeListingFilters.sortOrder}
      onCreatedAtSortToggle={() =>
        setQuery({
          filters: {
            [CATALOG_AL_FILTER.sort]: createdAtSortUrlValue(
              toggleCreatedAtSort(activeListingFilters.sortOrder),
            ),
          },
        })
      }
    />
  );

  const listingRequestsToolbar: ReactNode = (
    <CatalogListToolbar
      searchValue={listingRequestSearchInput}
      onSearchChange={setListingRequestSearchInput}
      searchPlaceholder={translate('requests.searchPlaceholder')}
      extraFilters={
        <div className="min-w-[10.5rem] flex-1">
          <CatalogSellerSearchSelect
            value={listingRequestFilters.tenantId ?? ''}
            onChange={(tenantId) =>
              setQuery({
                filters: {
                  [CATALOG_LR_FILTER.seller]: tenantId || undefined,
                },
              })
            }
            enabled={isCatalogListingRequestsTab}
            allSellersLabel={translate('filters.allSellers')}
            searchPlaceholder={translate('filters.sellerSearchPlaceholder')}
            loadingLabel={translate('filters.sellersLoading')}
            noResultsLabel={translate('filters.noSellerResults')}
          />
        </div>
      }
      showStatus
      statusValue={listingRequestFilters.status ?? 'all'}
      onStatusChange={(value) =>
        setQuery({
          filters: { [CATALOG_LR_FILTER.status]: value },
        })
      }
      statusOptions={requestStatusOptions}
      showMatchResult
      matchResultValue={listingRequestFilters.matchResult ?? 'all'}
      onMatchResultChange={(value) =>
        setQuery({
          filters: { [CATALOG_LR_FILTER.match]: value },
        })
      }
      matchResultOptions={matchResultOptions}
      categoryValue={listingRequestFilters.parentCategoryId ?? 'all'}
      onCategoryChange={(value) =>
        setQuery({
          filters: {
            [CATALOG_LR_FILTER.category]: value,
            [CATALOG_LR_FILTER.subcategory]: undefined,
          },
        })
      }
      categoryOptions={listingRequestCategoryFilters.categoryOptions}
      showCategoryFilter
      showSubcategoryFilter={listingRequestCategoryFilters.showSubcategory}
      subcategoryValue={listingRequestFilters.subCategoryId ?? 'all'}
      onSubcategoryChange={(value) =>
        setQuery({
          filters: { [CATALOG_LR_FILTER.subcategory]: value },
        })
      }
      subcategoryOptions={listingRequestCategoryFilters.subcategoryOptions}
      dateValue="all"
      onDateChange={() => {}}
      dateOptions={dateOptions}
      showDateFilter={false}
      hasActiveFilters={hasListingRequestDropdownFilters}
      onClearFilters={() =>
        setQuery({
          filters: {
            [CATALOG_LR_FILTER.seller]: undefined,
            [CATALOG_LR_FILTER.status]: undefined,
            [CATALOG_LR_FILTER.match]: undefined,
            [CATALOG_LR_FILTER.category]: undefined,
            [CATALOG_LR_FILTER.subcategory]: undefined,
          },
        })
      }
      showCreatedAtSort
      createdAtSortOrder={listingRequestFilters.sortOrder}
      onCreatedAtSortToggle={() =>
        setQuery({
          filters: {
            [CATALOG_LR_FILTER.sort]: createdAtSortUrlValue(
              toggleCreatedAtSort(listingRequestFilters.sortOrder),
            ),
          },
        })
      }
    />
  );

  const activeOffersToolbar: ReactNode = (
    <CatalogListToolbar
      searchValue={offerSearchInput}
      onSearchChange={setOfferSearchInput}
      searchPlaceholder={translate('offersView.searchPlaceholder')}
      extraFilters={
        <div className="min-w-[10.5rem] flex-1">
          <CatalogSellerSearchSelect
            value={offerFilters.sellerId ?? ''}
            onChange={(sellerId) =>
              setQuery({
                filters: {
                  [CATALOG_OF_FILTER.seller]: sellerId || undefined,
                },
              })
            }
            enabled={isCatalogOffersActiveTab}
            allSellersLabel={translate('filters.allSellers')}
            searchPlaceholder={translate('filters.sellerSearchPlaceholder')}
            loadingLabel={translate('filters.sellersLoading')}
            noResultsLabel={translate('filters.noSellerResults')}
          />
        </div>
      }
      showStatus
      statusValue={offerFilters.status ?? 'all'}
      onStatusChange={(value) =>
        setQuery({ filters: { [CATALOG_OF_FILTER.status]: value } })
      }
      statusOptions={offerStatusOptions}
      categoryValue={offerFilters.parentCategoryId ?? 'all'}
      onCategoryChange={(value) =>
        setQuery({
          filters: {
            [CATALOG_OF_FILTER.category]: value,
            [CATALOG_OF_FILTER.subcategory]: undefined,
          },
        })
      }
      categoryOptions={offerCategoryFilters.categoryOptions}
      showCategoryFilter
      showSubcategoryFilter={offerCategoryFilters.showSubcategory}
      subcategoryValue={offerFilters.subCategoryId ?? 'all'}
      onSubcategoryChange={(value) =>
        setQuery({
          filters: { [CATALOG_OF_FILTER.subcategory]: value },
        })
      }
      subcategoryOptions={offerCategoryFilters.subcategoryOptions}
      showDateFilter={false}
      dateValue="all"
      onDateChange={() => {}}
      dateOptions={dateOptions}
      hasActiveFilters={hasOfferDropdownFilters}
      onClearFilters={() =>
        setQuery({
          filters: {
            [CATALOG_OF_FILTER.seller]: undefined,
            [CATALOG_OF_FILTER.status]: undefined,
            [CATALOG_OF_FILTER.category]: undefined,
            [CATALOG_OF_FILTER.subcategory]: undefined,
          },
        })
      }
    />
  );

  return {
    translate,
    main,
    sub,
    handleMainTabChange,
    handleSubTabChange,
    handleCreate,
    activeListingsPanelProps: {
      translate,
      toolbar: activeListingsToolbar,
      columns: activeColumns,
      rows: liveActiveListings.rows,
      page: liveActiveListings.page,
      onPageChange: liveActiveListings.setPage,
      totalPages: liveActiveListings.totalPages,
      total: liveActiveListings.total,
      pageSize: liveActiveListings.pageSize,
      loading: liveActiveListings.loading,
      rowMenuOptions: activeRowMenuOptions,
      onRowMenuSelect: onActiveMenu,
      onRowClick: onActiveListingRowClick,
      from: fromActive,
      to: toActive,
    },
    listingRequestsPanelProps: {
      translate,
      toolbar: listingRequestsToolbar,
      columns: requestColumns,
      rows: liveListingRequests.rows,
      page: liveListingRequests.page,
      onPageChange: liveListingRequests.setPage,
      totalPages: liveListingRequests.totalPages,
      total: liveListingRequests.total,
      pageSize: liveListingRequests.pageSize,
      loading: liveListingRequests.loading,
      rowMenuOptions: requestRowMenuOptions,
      isRowMenuDisabled: isRequestRowMenuDisabled,
      onRowMenuSelect: onRequestMenu,
      onRowClick: onListingRequestRowClick,
      from: fromReq,
      to: toReq,
    },
    activeOffersPanelProps: {
      translate,
      toolbar: activeOffersToolbar,
      columns: activeOfferColumns,
      rows: liveActiveOffers.rows,
      page: liveActiveOffers.page,
      onPageChange: liveActiveOffers.setPage,
      totalPages: liveActiveOffers.totalPages,
      total: liveActiveOffers.total,
      pageSize: liveActiveOffers.pageSize,
      loading: liveActiveOffers.loading,
      rowMenuOptions: offerRowMenuOptions,
      onRowMenuSelect: onActiveOfferMenu,
      onRowClick: onActiveOfferRowClick,
      from: fromOfferActive,
      to: toOfferActive,
    },
  };
}
