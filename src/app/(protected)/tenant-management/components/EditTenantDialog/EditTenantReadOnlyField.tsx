type EditTenantReadOnlyFieldProps = {
  label: string;
  value: string;
};

export function EditTenantReadOnlyField({
  label,
  value,
}: Readonly<EditTenantReadOnlyFieldProps>) {
  const display = value.trim() ? value : '—';
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-sm font-medium text-mds-black-600">{label}</span>
      <span className="flex min-h-[42px] items-center rounded-md border border-mds-black-100 bg-mds-black-50/60 px-3 py-2 text-base text-mds-black-900 wrap-break-word">
        {display}
      </span>
    </div>
  );
}
