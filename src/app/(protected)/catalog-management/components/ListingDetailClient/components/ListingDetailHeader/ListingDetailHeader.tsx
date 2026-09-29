'use client';

import type { MouseEvent } from 'react';

import { ListingStatusBadge } from '@/app/(protected)/catalog-management/components/ListingStatusBadge';
import { DetailsPageHeader } from '@/components/DetailsPageHeader';
import type { ListingDetail } from '@/types/catalog';

interface ListingDetailHeaderProps {
  title: string;
  statusLabel: string;
  status: ListingDetail['status'];
  onBackClick: (event: MouseEvent<HTMLElement>) => void;
}

export function ListingDetailHeader({
  title,
  statusLabel,
  status,
  onBackClick,
}: Readonly<ListingDetailHeaderProps>) {
  return (
    <DetailsPageHeader title={title} onBackClick={onBackClick}>
      <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center lg:gap-3">
        <div className="flex items-center gap-2">
          <p className="whitespace-nowrap text-sm text-mds-black-600">
            {statusLabel}:
          </p>
          <ListingStatusBadge kind="listing" status={status} />
        </div>
      </div>
    </DetailsPageHeader>
  );
}
