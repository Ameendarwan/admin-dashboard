'use client';

import { Badge, type BadgeColor } from '@merit-incentives/ui';
import React from 'react';

import { useLocalization } from '@/hooks/useLocalization';
import { mapApiStatusToSellerStatus } from '@/app/(protected)/sellers/hooks/useSellersPage';
import { SELLER_STATUS_LABELS, SellerStatus } from '@/lib/enums';
import type { SellerDetails } from '@/types/seller';
import type { SellerAccountType } from '@/utils/sellerAccountType';

import { InfoField } from '../InfoField';

interface SellerInfoProps {
  readonly sellerId: string;
  readonly email: string;
  readonly shopName: string;
  readonly sellerDetails?: SellerDetails;
  readonly inviteStatus?: string;
  readonly accountType: SellerAccountType;
}

export function SellerInfo({
  sellerId,
  email,
  shopName,
  sellerDetails,
  inviteStatus,
  accountType,
}: SellerInfoProps) {
  const { translate } = useLocalization('seller-details');

  const getSellerStatusColor = (status: string): BadgeColor => {
    if (status === SellerStatus.INVITE_ACCEPTED) return 'success';
    return 'gray';
  };

  const mappedStatus = inviteStatus
    ? mapApiStatusToSellerStatus(inviteStatus)
    : '';
  const statusLabel = mappedStatus
    ? SELLER_STATUS_LABELS[mappedStatus as SellerStatus] || '-'
    : '-';
  const statusColor = mappedStatus
    ? getSellerStatusColor(mappedStatus)
    : 'gray';

  const accountTypeLabel =
    accountType === 'business'
      ? translate('info.accountTypeBusiness')
      : translate('info.accountTypeIndividual');

  return (
    <div className="rounded-xl border border-mds-black-100 bg-white p-5 shadow-sm md:p-6">
      <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-3 lg:grid-cols-5 md:gap-6">
        <InfoField
          label={translate('info.sellerId')}
          value={sellerId || translate('info.notProvided')}
        />
        <InfoField
          label={translate('info.fullName')}
          value={sellerDetails?.fullName || translate('info.notProvided')}
        />
        <InfoField
          label={translate('info.email')}
          value={email || translate('info.notProvided')}
          valueLayout={email ? 'email' : undefined}
        />
        <InfoField
          label={translate('info.accountType')}
          value={accountTypeLabel}
        />
        <InfoField
          label={translate('info.shopName')}
          value={shopName.trim() || translate('info.notProvided')}
        />
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <span className="text-sm font-medium text-mds-black-600">
          {translate('info.accountStatus')}
        </span>
        {mappedStatus === SellerStatus.INVITE_ACCEPTED ? (
          <Badge leftIcon color="success" size="lg">
            {translate('info.statusActive')}
          </Badge>
        ) : (
          <Badge leftIcon color={statusColor} size="lg">
            {statusLabel}
          </Badge>
        )}
      </div>
    </div>
  );
}
