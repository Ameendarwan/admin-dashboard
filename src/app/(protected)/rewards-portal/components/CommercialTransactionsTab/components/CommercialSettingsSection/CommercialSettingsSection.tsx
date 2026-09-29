'use client';

import { Button, ContentCard, InputField } from '@merit-incentives/ui';
import { Pencil, Percent } from 'lucide-react';

import { useLocalization } from '@/hooks';

const STATIC_TRANSACTION_FEE = '3.00';

export function CommercialSettingsSection() {
  const { translate } = useLocalization('rewards-portal');

  return (
    <ContentCard className="relative z-0 overflow-visible rounded-mds-md border border-mds-black-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-5">
        <div className="flex min-h-12 items-center justify-between gap-4">
          <h2 className="text-xl font-medium leading-[1.2] text-mds-black-900">
            {translate('commercialTransactions.commercialSettings.title')}
          </h2>
          <Button
            type="button"
            variant="tertiary"
            size="sm"
            leftIcon={<Pencil className="h-4 w-4" aria-hidden />}
            onClick={() => undefined}
          >
            {translate('commercialTransactions.commercialSettings.edit')}
          </Button>
        </div>

        <div className="w-full md:max-w-[min(100%,574px)]">
          <div className="relative">
            <InputField
              label={translate(
                'commercialTransactions.commercialSettings.transactionFeeLabel',
              )}
              hint={translate(
                'commercialTransactions.commercialSettings.transactionFeeHint',
              )}
              value={STATIC_TRANSACTION_FEE}
              onChange={() => undefined}
              rightIcon={<Percent className="h-4 w-4" aria-hidden />}
              disabled
              readOnly
              className="w-full [&_input]:pe-10"
            />
          </div>
        </div>
      </div>
    </ContentCard>
  );
}
