'use client';

import { InputField } from '@merit-incentives/ui';

import { IconLabelInputProps } from '@/types/superApp';
import { useLocalization } from '@/hooks/useLocalization';

export default function IconLabelInput({
  value,
  onChange,
}: Readonly<IconLabelInputProps>) {
  const { translate } = useLocalization('media-management');

  return (
    <div className="flex flex-col gap-2 items-start w-full mt-5">
      <div className="flex flex-col gap-1 items-start w-full">
        <InputField
          label={translate('iconLabel.label')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={translate('iconLabel.placeholder')}
          maxLength={20}
          required
          hint={translate('iconLabel.hint')}
        />
      </div>
    </div>
  );
}
