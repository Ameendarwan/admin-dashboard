import type { MediaItemData } from '@/types/superApp';

import { PreviewBanner } from '../PreviewBanner';

interface PromoBannerGridProps {
  verticalBanner?: MediaItemData;
  horizontal1Banner?: MediaItemData;
  horizontal2Banner?: MediaItemData;
  highlightedKey: string | null;
}

export function PromoBannerGrid({
  verticalBanner,
  horizontal1Banner,
  horizontal2Banner,
  highlightedKey,
}: Readonly<PromoBannerGridProps>) {
  return (
    <div className="flex items-start gap-3">
      <PreviewBanner
        itemKey="vertical_promo_banner"
        banner={verticalBanner}
        highlightedKey={highlightedKey}
        className="min-w-0 flex-1"
        alt="Vertical Banner"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <PreviewBanner
          itemKey="horizontal_promo_banner_1"
          banner={horizontal1Banner}
          highlightedKey={highlightedKey}
          className="w-full"
          alt="Horizontal Banner 1"
        />
        <PreviewBanner
          itemKey="horizontal_promo_banner_2"
          banner={horizontal2Banner}
          highlightedKey={highlightedKey}
          className="w-full"
          alt="Horizontal Banner 2"
        />
      </div>
    </div>
  );
}
