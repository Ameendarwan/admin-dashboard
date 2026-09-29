/* eslint-disable import/order */

'use client';

import { Button, toast } from '@merit-incentives/ui';

import { DetailsPageHeader } from '@/components/DetailsPageHeader';
import React from 'react';
import { useLocalization } from '@/hooks/useLocalization';

export function SellerDetailsPageShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { translate } = useLocalization('seller-details');

  return (
    <div className="min-h-screen pb-10 pt-2 md:pb-12 md:pt-4">
      <div className="mx-auto w-full max-w-400 px-4 md:px-8">
        <DetailsPageHeader title={translate('title')}>
          <Button
            type="button"
            variant="secondary"
            className="w-full rounded-lg border border-mds-black-200 bg-white text-mds-black-800! shadow-none hover:bg-mds-black-50 sm:w-auto"
            onClick={() => toast.info(translate('deactivateSellerUnavailable'))}
          >
            {translate('deactivateSeller')}
          </Button>
        </DetailsPageHeader>
        {children}
      </div>
    </div>
  );
}
