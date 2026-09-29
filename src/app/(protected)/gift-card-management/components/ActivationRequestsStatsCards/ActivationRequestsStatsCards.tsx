'use client';

import type { LucideIcon } from 'lucide-react';

interface ActivationRequestsStatsCardsProps {
  pending: number;
  approved: number;
  rejected: number;
  labels: {
    pending: string;
    approved: string;
    rejected: string;
  };
  icons: {
    pending: LucideIcon;
    approved: LucideIcon;
    rejected: LucideIcon;
  };
}

export function ActivationRequestsStatsCards({
  pending,
  approved,
  rejected,
  labels,
  icons,
}: Readonly<ActivationRequestsStatsCardsProps>) {
  const items = [
    {
      key: 'pending',
      value: pending,
      label: labels.pending,
      Icon: icons.pending,
      iconClass: 'text-mds-casablanca-600',
      iconBg: 'bg-mds-casablanca-50',
    },
    {
      key: 'approved',
      value: approved,
      label: labels.approved,
      Icon: icons.approved,
      iconClass: 'text-mds-success-500',
      iconBg: 'bg-mds-success-50',
    },
    {
      key: 'rejected',
      value: rejected,
      label: labels.rejected,
      Icon: icons.rejected,
      iconClass: 'text-mds-error-500',
      iconBg: 'bg-mds-error-50',
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {items.map(({ key, value, label, Icon, iconClass, iconBg }) => (
        <div
          key={key}
          className="flex items-center gap-4 rounded-xl border border-mds-black-100 bg-white px-5 py-4 shadow-sm"
        >
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconBg}`}
          >
            <Icon className={`h-5 w-5 ${iconClass}`} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-mds-black-600">{label}</p>
            <p className="mt-0.5 text-2xl font-semibold tabular-nums text-mds-black-900">
              {value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
