'use client';

import { Snowflake, Droplet } from 'lucide-react';

interface WalletFreezeActionLinkProps {
  action: 'freeze' | 'unfreeze';
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function WalletFreezeActionLink({
  action,
  label,
  onClick,
  disabled = false,
}: Readonly<WalletFreezeActionLinkProps>) {
  const isFreeze = action === 'freeze';
  const Icon = isFreeze ? Snowflake : Droplet;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1 rounded-full text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
        isFreeze
          ? 'text-mds-error-500 hover:text-mds-error-600'
          : 'text-mds-primary-700 hover:text-mds-primary-800'
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
      <span>{label}</span>
    </button>
  );
}
