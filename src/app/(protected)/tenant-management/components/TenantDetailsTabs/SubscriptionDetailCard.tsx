import type { ReactNode } from 'react';

type SubscriptionDetailCardProps = Readonly<{
  icon: ReactNode;
  label: string;
  children: ReactNode;
  trailing?: ReactNode;
}>;

export function SubscriptionDetailCard({
  icon,
  label,
  children,
  trailing,
}: SubscriptionDetailCardProps) {
  const hasTrailing = trailing !== undefined && trailing !== null;

  return (
    <div className="flex items-start gap-mds-md rounded-xl border border-gray-100 bg-white px-mds-lg py-mds-md">
      <div className="mt-mds-3xs shrink-0 rounded-lg bg-mds-primary-50 p-mds-sm">
        {icon}
      </div>
      <div className={hasTrailing ? 'min-w-0 flex-1' : 'min-w-0'}>
        <div className="text-xs font-medium text-mds-black-500">{label}</div>
        <div className="text-sm font-medium text-mds-black-900">{children}</div>
      </div>
      {hasTrailing ? (
        <div className="shrink-0 text-sm font-medium text-mds-black-900">
          {trailing}
        </div>
      ) : null}
    </div>
  );
}
