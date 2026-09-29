'use client';

export interface FloatTopUpDetailRow {
  label: string;
  value: string;
  emphasized?: boolean;
}

interface FloatTopUpDetailRowsProps {
  rows: FloatTopUpDetailRow[];
}

export function FloatTopUpDetailRows({
  rows,
}: Readonly<FloatTopUpDetailRowsProps>) {
  return (
    <dl className="flex flex-col gap-3">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-start justify-between gap-4 text-sm"
        >
          <dt className="text-mds-black-600">{row.label}</dt>
          <dd
            className={
              row.emphasized
                ? 'text-right font-semibold text-mds-black-900'
                : 'text-right font-medium text-mds-black-900'
            }
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
