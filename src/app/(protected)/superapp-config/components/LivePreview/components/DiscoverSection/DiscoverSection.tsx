'use client';

import { useLocalization } from '@/hooks/useLocalization';

import type { LivePreviewIcon } from '../../../../hooks';
import { DiscoverIcon } from '../DiscoverIcon';

interface DiscoverSectionProps {
  icons: LivePreviewIcon[];
  highlightedKey: string | null;
}

export function DiscoverSection({
  icons,
  highlightedKey,
}: Readonly<DiscoverSectionProps>) {
  const { translate } = useLocalization('media-management');

  return (
    <div className="mb-4">
      <h2 className="text-[15px] font-semibold text-mds-black-900 mb-3">
        {translate('livePreview.discover')}
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {icons.map((icon) => (
          <DiscoverIcon
            key={icon.key}
            icon={icon}
            highlightedKey={highlightedKey}
          />
        ))}
      </div>
    </div>
  );
}
