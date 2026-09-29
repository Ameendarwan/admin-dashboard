'use client';

import { Dispatch, SetStateAction, useMemo } from 'react';

import { MediaType } from '@/types/superApp';
import {
  BANNER_DIMENSIONS,
  PROMO_BANNER_ORDER,
} from '@/app/(protected)/superapp-config/constants';

import MediaItem from '../MediaItem';

interface BannerSectionProps {
  mediaType: MediaType;
  mediaManagement: ReturnType<
    typeof import('../../../../hooks').useMediaManagement
  >;
  expandedBanner: string | null;
  setExpandedBanner: Dispatch<SetStateAction<string | null>>;
}

export default function BannerSection({
  mediaType,
  mediaManagement,
  expandedBanner,
  setExpandedBanner,
}: Readonly<BannerSectionProps>) {
  const handleBannerToggle = (bannerKey: string) => {
    setExpandedBanner(expandedBanner === bannerKey ? null : bannerKey);
  };

  // Dynamically get banner configs in fixed product order (not API position)
  const bannerConfigs = useMemo(() => {
    return PROMO_BANNER_ORDER.filter(
      (key) => key in mediaManagement.banners,
    ).map((key) => {
      const data = mediaManagement.banners[key];
      const dimensions = BANNER_DIMENSIONS[key];
      return {
        key,
        title: data.title,
        dimensions: `${dimensions.width} x ${dimensions.height} px`,
        requiredWidth: dimensions.width,
        requiredHeight: dimensions.height,
      };
    });
  }, [mediaManagement.banners]);

  if (mediaManagement.isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mds-primary-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 items-start w-full overflow-y-auto">
      {bannerConfigs.map((banner) => (
        <MediaItem
          key={banner.key}
          itemId={banner.key}
          title={banner.title}
          dimensions={banner.dimensions}
          requiredWidth={banner.requiredWidth}
          requiredHeight={banner.requiredHeight}
          isExpanded={expandedBanner === banner.key}
          onToggle={() => handleBannerToggle(banner.key)}
          mediaType={mediaType}
          mediaManagement={mediaManagement}
        />
      ))}
    </div>
  );
}
