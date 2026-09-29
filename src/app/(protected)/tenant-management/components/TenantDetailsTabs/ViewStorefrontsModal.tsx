'use client';

import { Button, InputField, Popup, SearchIcon } from '@merit-incentives/ui';
import { useCallback, useState } from 'react';

import { useTenantStorefronts } from '@/api-queries/storefronts';
import { Spinner } from '@/components/Spinner';
import useDebounce from '@/hooks/useDebounce';
import { useLocalization } from '@/hooks';

import { StorefrontCard } from './StorefrontCard';
import { StorefrontEmptyIllustration } from './StorefrontEmptyIllustration';

type ViewStorefrontsModalProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
}>;

export function ViewStorefrontsModal({
  isOpen,
  onClose,
  tenantId,
}: ViewStorefrontsModalProps) {
  const { translate } = useLocalization('tenant-details');
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 300);

  const {
    data: storefronts,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useTenantStorefronts(tenantId, {
    enabled: isOpen && Boolean(tenantId),
    filters: {
      storeName: debouncedSearch.trim() || undefined,
    },
  });

  const storefrontList = storefronts ?? [];
  const loading = isLoading || isFetching;

  const handleClose = useCallback((): void => {
    setSearchValue('');
    onClose();
  }, [onClose]);

  const handleRetry = useCallback((): void => {
    refetch();
  }, [refetch]);

  const hasSearch = debouncedSearch.trim().length > 0;
  const hasStorefronts = storefrontList.length > 0;

  const renderStorefrontListBody = () => {
    if (loading && storefrontList.length === 0) {
      return <Spinner text={translate('storefront.loading')} />;
    }

    if (isError) {
      return (
        <div className="flex flex-col gap-mds-md">
          <p className="text-sm font-normal text-red-600">
            {translate('storefront.loadError')}
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-fit"
            onClick={handleRetry}
          >
            {translate('storefront.retry')}
          </Button>
        </div>
      );
    }

    if (!hasStorefronts && hasSearch) {
      return (
        <p className="py-8 text-center text-sm text-mds-black-600">
          {translate('storefront.viewModal.noSearchResults')}
        </p>
      );
    }

    if (!hasStorefronts) {
      return (
        <div className="flex flex-col items-center justify-center px-4 py-10 sm:px-8 sm:py-14">
          <StorefrontEmptyIllustration />
          <h3 className="mt-8 text-center text-lg font-semibold text-mds-black-900 sm:text-xl">
            {translate('storefront.emptyTitle')}
          </h3>
          <p className="mt-3 max-w-md text-center text-sm leading-relaxed text-mds-black-600 sm:text-[15px]">
            {translate('storefront.emptyDescription')}
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-mds-lg">
        {storefrontList.map((storefront) => (
          <StorefrontCard
            key={storefront.id}
            storefront={storefront}
            translate={(key, values) => translate(`storefront.${key}`, values)}
          />
        ))}
      </div>
    );
  };

  return (
    <Popup
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      className="w-[min(100%,52rem)] max-w-[calc(100vw-2rem)] overflow-hidden"
    >
      <Popup.Header
        onClose={handleClose}
        showDivider
        className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8"
      >
        <h2 className="min-w-0 text-xl font-bold text-mds-black-900 sm:text-2xl">
          {translate('storefront.viewModal.title')}
        </h2>
      </Popup.Header>

      <Popup.Content
        showDivider
        className="max-h-[min(720px,calc(100dvh-12rem))] min-w-0 overflow-x-hidden overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8"
      >
        <div className="flex flex-col gap-5">
          <InputField
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={translate('storefront.viewModal.searchPlaceholder')}
            aria-label={translate('storefront.viewModal.searchPlaceholder')}
            leftIcon={<SearchIcon className="h-4 w-4 text-mds-black-500" />}
          />

          {renderStorefrontListBody()}
        </div>
      </Popup.Content>

      <Popup.Footer className="border-t border-mds-black-100 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <div className="flex w-full min-w-0">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleClose}
            className="w-full border-0 bg-mds-primary-100 font-medium text-mds-primary-700 hover:bg-mds-primary-200 sm:w-auto sm:min-w-28"
          >
            {translate('storefront.viewModal.close')}
          </Button>
        </div>
      </Popup.Footer>
    </Popup>
  );
}
