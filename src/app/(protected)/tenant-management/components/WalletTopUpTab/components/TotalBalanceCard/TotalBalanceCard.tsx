'use client';

import { Badge, ContentCard } from '@merit-incentives/ui';
import { Wallet } from 'lucide-react';

import { useLocalization } from '@/hooks';
import type { WalletStatus } from '@/types/walletAdminApi';

import { formatWalletAmountMinor } from '../../utils/walletTopUpFormatters';
import { WalletFreezeActionLink } from '../WalletFreezeActionLink';
import { WalletFreezeInfoCallout } from '../WalletFreezeInfoCallout';

interface TotalBalanceCardProps {
  totalBalanceMinor: string;
  minorUnit: number | null;
  currencyCode: string | null;
  currencyLabel: string;
  masterStatus?: WalletStatus;
  canFreezeMaster?: boolean;
  canUnfreezeMaster?: boolean;
  onFreezeMaster?: () => void;
  onUnfreezeMaster?: () => void;
}

export function TotalBalanceCard({
  totalBalanceMinor,
  minorUnit,
  currencyCode,
  currencyLabel,
  masterStatus,
  canFreezeMaster = false,
  canUnfreezeMaster = false,
  onFreezeMaster,
  onUnfreezeMaster,
}: Readonly<TotalBalanceCardProps>) {
  const { translate } = useLocalization('tenant-details.walletTopUp');
  const isFrozen = masterStatus === 'FROZEN';

  let amountDisplay: string;
  if (minorUnit === null) {
    amountDisplay = translate('display.unknownBalance');
  } else if (currencyCode) {
    amountDisplay = `${currencyCode} ${formatWalletAmountMinor(totalBalanceMinor, minorUnit)}`;
  } else {
    amountDisplay = formatWalletAmountMinor(totalBalanceMinor, minorUnit);
  }

  return (
    <ContentCard className="rounded-[14px] border border-mds-black-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mds-primary-50">
              <Wallet
                className="h-5 w-5 text-mds-primary-600"
                strokeWidth={1.75}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-medium text-mds-black-900">
                {translate('totalBalance.label')}
              </span>
              {masterStatus ? (
                <Badge
                  color={isFrozen ? 'error' : 'success'}
                  leftIcon
                  size="sm"
                >
                  {translate(`tenantFloatWallets.statuses.${masterStatus}`)}
                </Badge>
              ) : null}
            </div>
          </div>

          {isFrozen && canUnfreezeMaster && onUnfreezeMaster ? (
            <WalletFreezeActionLink
              action="unfreeze"
              label={translate('freezeActions.unfreezeMaster')}
              onClick={onUnfreezeMaster}
            />
          ) : null}
          {!isFrozen && canFreezeMaster && onFreezeMaster ? (
            <WalletFreezeActionLink
              action="freeze"
              label={translate('freezeActions.freezeMaster')}
              onClick={onFreezeMaster}
            />
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-2xl font-semibold text-mds-black-900 sm:text-[28px]">
            {amountDisplay}
          </p>
          <span className="text-sm text-mds-black-500">{currencyLabel}</span>
        </div>

        {isFrozen ? (
          <WalletFreezeInfoCallout
            variant="error"
            title={translate('freezeActions.masterFrozenCalloutTitle')}
            message={translate('freezeActions.masterFrozenCalloutBody')}
          />
        ) : null}
      </div>
    </ContentCard>
  );
}
