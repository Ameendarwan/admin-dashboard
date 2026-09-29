'use client';

import { useLivePreview, type MediaManagementState } from '../../hooks';
import {
  DiscoverSection,
  LivePreviewHeader,
  PhoneFrame,
  PreviewBanner,
  PromoBannerGrid,
} from './components';

interface LivePreviewProps {
  mediaManagement: MediaManagementState;
}

export function LivePreview({ mediaManagement }: Readonly<LivePreviewProps>) {
  const {
    currentTime,
    headerBanner,
    verticalBanner,
    horizontal1Banner,
    horizontal2Banner,
    sortedIcons,
    highlightedBannerKey,
    highlightedIconKey,
    handlePreviewPointerEnter,
    handlePreviewPointerLeave,
  } = useLivePreview(mediaManagement);

  return (
    <div
      className="bg-white flex flex-col gap-5 items-center justify-center overflow-clip px-6 py-6 rounded-mds-md w-full"
      onMouseEnter={handlePreviewPointerEnter}
      onMouseLeave={handlePreviewPointerLeave}
    >
      <LivePreviewHeader />
      <PhoneFrame currentTime={currentTime}>
        <PreviewBanner
          itemKey="header_promo_banner"
          banner={headerBanner}
          highlightedKey={highlightedBannerKey}
          className="mb-4 w-full"
          alt="Header Banner"
        />
        <DiscoverSection
          icons={sortedIcons}
          highlightedKey={highlightedIconKey}
        />
        <PromoBannerGrid
          verticalBanner={verticalBanner}
          horizontal1Banner={horizontal1Banner}
          horizontal2Banner={horizontal2Banner}
          highlightedKey={highlightedBannerKey}
        />
      </PhoneFrame>
    </div>
  );
}
