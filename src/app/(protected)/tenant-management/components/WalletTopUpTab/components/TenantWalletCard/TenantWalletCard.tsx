'use client';

import { Badge } from '@merit-incentives/ui';
import Image from 'next/image';

import { useLocalization } from '@/hooks';

import { formatWalletAmountMinor } from '../../utils/walletTopUpFormatters';
import type { TenantWalletCardModel } from '../../utils/walletTopUpTypes';

interface TenantWalletCardProps {
  wallet: TenantWalletCardModel;
}

export function TenantWalletCard({ wallet }: Readonly<TenantWalletCardProps>) {
  const { translate } = useLocalization('tenant-details.walletTopUp');
  const isFrozen = wallet.status === 'FROZEN';

  return (
    <div
      className={`rounded-xl p-4 ${
        isFrozen ? 'bg-mds-black-50' : 'bg-mds-bg-light-50'
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        {wallet.countryCode ? (
          <Image
            src={`https://flagcdn.com/w40/${wallet.countryCode.toLowerCase()}.png`}
            alt=""
            width={28}
            height={20}
            className={`h-5 w-7 rounded-sm object-cover ${
              isFrozen ? 'opacity-60' : ''
            }`}
            // Load flags in the browser — Next image optimization fails for
            // flagcdn on develop/prod (server-side fetch), which shows broken imgs.
            unoptimized
            aria-hidden
          />
        ) : (
          <span
            className={`inline-flex h-5 min-w-7 items-center justify-center rounded-sm px-1 text-[10px] font-semibold ${
              isFrozen
                ? 'bg-mds-black-100 text-mds-black-400'
                : 'bg-mds-black-50 text-mds-black-600'
            }`}
          >
            {wallet.currencyCode}
          </span>
        )}
        <div className="flex flex-wrap justify-end gap-1">
          {wallet.isDefault ? (
            isFrozen ? (
              <span className="rounded-l-md bg-mds-black-100 px-3 py-1.5 text-sm font-medium text-mds-black-400">
                {translate('walletBalance.default')}
              </span>
            ) : (
              <Badge color="primary" size="sm">
                {translate('walletBalance.default')}
              </Badge>
            )
          ) : null}
          {isFrozen ? (
            <Badge color="error" leftIcon size="sm">
              {translate('tenantFloatWallets.statuses.FROZEN')}
            </Badge>
          ) : null}
          {wallet.isCurrencyEnabled ? null : (
            <Badge color="warning" size="sm">
              {translate('currency.disabled')}
            </Badge>
          )}
        </div>
      </div>
      <p
        className={`text-xl font-semibold ${
          isFrozen ? 'text-mds-black-400' : 'text-mds-black-900'
        }`}
      >
        {formatWalletAmountMinor(wallet.amountMinor, wallet.minorUnit)}
      </p>
      <p
        className={`mt-1 text-sm ${
          isFrozen ? 'text-mds-black-400' : 'text-mds-black-500'
        }`}
      >
        {wallet.currencyLabel}
      </p>
    </div>
  );
}
