'use client';

import { Link } from 'lucide-react';
import { InputField } from '@merit-incentives/ui';

import { DeepLinkInputProps } from '@/types/superApp';
import { useLocalization } from '@/hooks/useLocalization';

export default function DeepLinkInput({
  value,
  onChange,
}: Readonly<DeepLinkInputProps>) {
  const { translate } = useLocalization('media-management');

  return (
    <div className="flex flex-col gap-2 items-start w-full mt-5">
      <div className="flex flex-col gap-1 items-start w-full">
        <InputField
          label={translate('deepLink.label')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={translate('deepLink.placeholder')}
          leftIcon={<Link className="w-6 h-6 text-mds-black-900" />}
          hint={translate('deepLink.hint')}
        />
      </div>
    </div>
  );
}
