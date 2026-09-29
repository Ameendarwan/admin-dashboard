'use client';

import { Button, InputDropdown } from '@merit-incentives/ui';
import { Pencil } from 'lucide-react';

import { DetailsPageHeader } from '@/components/DetailsPageHeader';
import type { EcommerceOfferStatus } from '@/types/catalog';

interface OfferDetailHeaderToolbarProps {
  title: string;
  offerStatusLabel: string;
  editLabel: string;
  expiredStatusLabel: string;
  offerStatusHeaderFrozen: boolean;
  offerStatusUi: EcommerceOfferStatus;
  offerStatusSaving: boolean;
  statusOptions: { value: EcommerceOfferStatus; label: string }[];
  onOfferStatusChange: (next: EcommerceOfferStatus) => Promise<void>;
  onEditOffer: () => void;
  onBackClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export function OfferDetailHeaderToolbar({
  title,
  offerStatusLabel,
  editLabel,
  expiredStatusLabel,
  offerStatusHeaderFrozen,
  offerStatusUi,
  offerStatusSaving,
  statusOptions,
  onOfferStatusChange,
  onEditOffer,
  onBackClick,
}: Readonly<OfferDetailHeaderToolbarProps>) {
  return (
    <DetailsPageHeader title={title} onBackClick={onBackClick}>
      <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center lg:gap-3">
        <div className="flex items-center gap-2">
          <p className="whitespace-nowrap text-sm text-mds-black-600">
            {offerStatusLabel}:
          </p>
          <div className="w-full min-w-[10rem] sm:w-44">
            {offerStatusHeaderFrozen ? (
              <p className="rounded-xl border border-mds-black-100 bg-white px-3 py-2 text-base font-medium text-mds-black-900">
                {expiredStatusLabel}
              </p>
            ) : (
              <InputDropdown
                value={offerStatusUi}
                disabled={offerStatusSaving}
                onChange={(v) => {
                  onOfferStatusChange(v as EcommerceOfferStatus).catch(
                    () => undefined,
                  );
                }}
                options={statusOptions}
                placeholder={offerStatusLabel}
              />
            )}
          </div>
        </div>
        <Button
          variant="primary"
          onClick={onEditOffer}
          leftIcon={<Pencil className="h-4 w-4" aria-hidden />}
          type="button"
        >
          {editLabel}
        </Button>
      </div>
    </DetailsPageHeader>
  );
}
