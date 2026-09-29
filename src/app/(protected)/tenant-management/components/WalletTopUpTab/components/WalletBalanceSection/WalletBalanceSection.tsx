'use client';

import { ContentCard } from '@merit-incentives/ui';

import { useLocalization } from '@/hooks';

import type { TenantWalletCardModel } from '../../utils/walletTopUpTypes';
import { TenantWalletCard } from '../TenantWalletCard';

interface WalletBalanceSectionProps {
  wallets: TenantWalletCardModel[];
}

export function WalletBalanceSection({
  wallets,
}: Readonly<WalletBalanceSectionProps>) {
  const { translate } = useLocalization('tenant-details.walletTopUp');

  if (wallets.length === 0) {
    return (
      <ContentCard className="rounded-[14px] border border-mds-black-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-5">
          <h2 className="text-xl font-medium text-mds-black-900">
            {translate('walletBalance.title')}
          </h2>
          <p className="text-sm text-mds-black-600">
            {translate('walletBalance.empty')}
          </p>
        </div>
      </ContentCard>
    );
  }

  return (
    <ContentCard className="rounded-[14px] border border-mds-black-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-5">
        <h2 className="text-xl font-medium text-mds-black-900">
          {translate('walletBalance.title')}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {wallets.map((wallet) => (
            <TenantWalletCard key={wallet.id} wallet={wallet} />
          ))}
        </div>
      </div>
    </ContentCard>
  );
}
