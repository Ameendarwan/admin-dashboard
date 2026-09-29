import type { ReactNode } from 'react';

import { InfoFieldEmailValue } from '@/components/InfoFieldEmailValue';

type TenantSummaryFieldProps = {
  label: string;
  value: string;
  valueLayout?: 'email';
};

export function TenantSummaryField({
  label,
  value,
  valueLayout,
}: Readonly<TenantSummaryFieldProps>) {
  let valueContent: ReactNode = value;
  if (valueLayout === 'email') {
    valueContent = <InfoFieldEmailValue value={value} />;
  }

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-sm font-medium text-mds-black-600">{label}</span>
      <div className="min-w-0 break-words text-base font-medium text-mds-black-900">
        {valueContent}
      </div>
    </div>
  );
}
