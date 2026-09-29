import { useMemo, useState } from 'react';

import { useCurrentTime } from '@/hooks';
import type { MediaItemData } from '@/types/superApp';

import type { MediaManagementState } from './useMediaManagement';

export type LivePreviewIcon = MediaItemData & { key: string };

function getHighlightedKey(
  isPointerOverPreview: boolean,
  hoveredItem: string | null,
  expandedItem: string | null,
  items: Record<string, unknown>,
): string | null {
  if (isPointerOverPreview) {
    return null;
  }

  const activeKey = hoveredItem ?? expandedItem;
  return activeKey && activeKey in items ? activeKey : null;
}

export function useLivePreview(mediaManagement: MediaManagementState) {
  const { banners, icons, expandedItem, hoveredItem, setHoveredItem } =
    mediaManagement;
  const [isPointerOverPreview, setIsPointerOverPreview] = useState(false);
  const currentTime = useCurrentTime();

  const highlightedBannerKey = useMemo(
    () =>
      getHighlightedKey(
        isPointerOverPreview,
        hoveredItem,
        expandedItem,
        banners,
      ),
    [banners, expandedItem, hoveredItem, isPointerOverPreview],
  );

  const highlightedIconKey = useMemo(
    () =>
      getHighlightedKey(isPointerOverPreview, hoveredItem, expandedItem, icons),
    [expandedItem, hoveredItem, icons, isPointerOverPreview],
  );

  const sortedIcons = useMemo<LivePreviewIcon[]>(() => {
    return Object.entries(icons)
      .map(([key, data]) => ({ key, ...data }))
      .sort((a, b) => (a.position || 0) - (b.position || 0));
  }, [icons]);

  const handlePreviewPointerEnter = () => {
    setIsPointerOverPreview(true);
    setHoveredItem(null);
  };

  const handlePreviewPointerLeave = () => {
    setIsPointerOverPreview(false);
  };

  return {
    currentTime,
    headerBanner: banners.header_promo_banner,
    verticalBanner: banners.vertical_promo_banner,
    horizontal1Banner: banners.horizontal_promo_banner_1,
    horizontal2Banner: banners.horizontal_promo_banner_2,
    sortedIcons,
    highlightedBannerKey,
    highlightedIconKey,
    handlePreviewPointerEnter,
    handlePreviewPointerLeave,
  };
}
