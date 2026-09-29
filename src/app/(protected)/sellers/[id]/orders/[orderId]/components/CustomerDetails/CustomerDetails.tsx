'use client';

import { User } from 'lucide-react';
import { ContentCard } from '@merit-incentives/ui';

import { LabelValue } from '@/components';
import { useLocalization } from '@/hooks/useLocalization';
import { formatPhoneUsDashed } from '@/utils/dateHelpers';

interface CustomerDetailsProps {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export function CustomerDetails({
  firstName,
  lastName,
  email,
  phoneNumber,
}: Readonly<CustomerDetailsProps>) {
  const { translate } = useLocalization('order-details');

  return (
    <ContentCard className="p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <User className="h-6 w-6 text-mds-neutral-700" />
        <h2 className="text-xl font-normal text-mds-neutral-900">
          {translate('customerDetails')}
        </h2>
      </div>
      <div className="space-y-4">
        <LabelValue label={translate('firstName')} value={firstName} />
        <LabelValue label={translate('lastName')} value={lastName} />
        <LabelValue label={translate('email')} value={email} />
        <LabelValue
          label={translate('phoneNumber')}
          value={formatPhoneUsDashed(phoneNumber)}
        />
      </div>
    </ContentCard>
  );
}
