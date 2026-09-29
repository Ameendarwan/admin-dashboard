import { ReactNode } from 'react';

interface LabelValueProps {
  label: string;
  value: string | ReactNode;
  className?: string;
}

export function LabelValue({
  label,
  value,
  className = '',
}: Readonly<LabelValueProps>) {
  return (
    <div className={className}>
      <p className="mb-2 text-sm font-medium text-mds-black-500">{label}</p>
      <p className="text-lg font-medium text-mds-black-900">{value}</p>
    </div>
  );
}
