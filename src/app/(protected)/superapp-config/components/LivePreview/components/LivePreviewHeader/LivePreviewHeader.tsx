'use client';

import { useLocalization } from '@/hooks/useLocalization';

export function LivePreviewHeader() {
  const { translate } = useLocalization('media-management');

  return (
    <div className="flex flex-col gap-1 items-start w-full">
      <p className="font-semibold leading-[1.2] text-xl text-mds-black-900">
        {translate('livePreview.title')}
      </p>
      <p className="font-medium leading-[1.4] text-sm text-mds-black-500">
        {translate('livePreview.description')}
      </p>
    </div>
  );
}
