import React from 'react';

import { InfoFieldEmailValue } from '@/components/InfoFieldEmailValue';

interface InfoFieldProps {
  label: string;
  value: string | number;
  /** Splits at @ so the domain stays on one line when wrapping. */
  valueLayout?: 'email';
  className?: string;
  valueClassName?: string;
}

/* eslint-disable react/prop-types */
export const InfoField = React.memo<InfoFieldProps>(
  ({ label, value, valueLayout, className = '', valueClassName }) => {
    const valueSizeClass = valueClassName ?? 'text-base';

    let valueContent: React.ReactNode = value;
    if (valueLayout === 'email' && typeof value === 'string') {
      valueContent = <InfoFieldEmailValue value={value} />;
    }

    return (
      <div className={`flex min-w-0 flex-col gap-2 ${className}`}>
        <div className="text-sm font-medium text-mds-black-600">{label}</div>
        <div
          className={`min-w-0 break-words ${valueSizeClass} font-medium text-mds-black-900`}
        >
          {valueContent}
        </div>
      </div>
    );
  },
);

InfoField.displayName = 'InfoField';
