interface OfferDetailFieldProps {
  label: string;
  value: string | number;
}

export function OfferDetailField({
  label,
  value,
}: Readonly<OfferDetailFieldProps>) {
  const text = typeof value === 'number' ? String(value) : value;
  return (
    <div className="min-w-0">
      <p className="text-sm text-mds-black-500">{label}</p>
      <p className="break-words text-lg text-mds-black-900">{text}</p>
    </div>
  );
}
