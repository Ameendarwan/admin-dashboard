import React from 'react';

interface StatusCardProps {
  readonly title: string;
  readonly value: number;
}

/* eslint-disable react/prop-types */
export const StatusCard = React.memo<StatusCardProps>(function StatusCard({
  title,
  value,
}) {
  return (
    <div className="rounded-xl border border-mds-black-100 bg-white p-4 shadow-sm">
      <p className="text-sm text-mds-black-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-mds-black-900">{value}</p>
    </div>
  );
});
