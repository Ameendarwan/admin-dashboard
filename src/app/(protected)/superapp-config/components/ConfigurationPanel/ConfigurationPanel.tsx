'use client';

import { useState } from 'react';
import { Tabs } from '@merit-incentives/ui';

import { MediaType } from '@/types/superApp';
import { useLocalization } from '@/hooks/useLocalization';

import { BannerSection, CarouselSection } from './components';
import { MEDIA_TYPES } from '../../constants';

interface ConfigurationPanelProps {
  mediaManagement: ReturnType<typeof import('../../hooks').useMediaManagement>;
}

export function ConfigurationPanel({
  mediaManagement,
}: Readonly<ConfigurationPanelProps>) {
  const [activeTab, setActiveTab] = useState<MediaType>(
    MEDIA_TYPES['promo-banners'],
  );
  const { translate } = useLocalization('media-management');

  return (
    <div className="bg-white flex flex-col gap-5 w-full items-start overflow-clip px-6 py-6 rounded-mds-md">
      <Tabs
        showContent
        size="md"
        onChange={(key: string) => {
          setActiveTab(key as MediaType);
        }}
        tabs={[
          {
            content: mediaManagement.isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mds-primary-500" />
              </div>
            ) : (
              <BannerSection
                mediaType={activeTab}
                mediaManagement={mediaManagement}
                expandedBanner={mediaManagement.expandedItem}
                setExpandedBanner={mediaManagement.setExpandedItem}
              />
            ),
            key: MEDIA_TYPES['promo-banners'],
            label: translate('tabs.promoBanners'),
          },
          {
            content: mediaManagement.isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mds-primary-500" />
              </div>
            ) : (
              <CarouselSection
                mediaType={activeTab}
                mediaManagement={mediaManagement}
              />
            ),
            key: MEDIA_TYPES['carousel-icons'],
            label: translate('tabs.carouselIcons'),
          },
        ]}
      />
    </div>
  );
}
