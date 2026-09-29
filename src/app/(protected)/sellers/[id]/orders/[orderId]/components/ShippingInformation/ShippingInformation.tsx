'use client';

import { MapPin } from 'lucide-react';
import { ContentCard } from '@merit-incentives/ui';

import { LabelValue } from '@/components';
import { useLocalization } from '@/hooks/useLocalization';

interface ShippingInformationProps {
  address: string;
  shortAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  shippingPartner: string;
}

export function ShippingInformation({
  address,
  shortAddress,
  city,
  state,
  country,
  postalCode,
  shippingPartner,
}: Readonly<ShippingInformationProps>) {
  const { translate } = useLocalization('order-details');

  return (
    <ContentCard className="p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <MapPin className="h-6 w-6 text-mds-black-700" />
        <h2 className="text-lg font-medium text-mds-black-900">
          {translate('shippingInformation')}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
        <LabelValue label={translate('address')} value={address} />
        <LabelValue label={translate('city')} value={city} />
        <LabelValue label={translate('state')} value={state} />
        <LabelValue label={translate('country')} value={country} />
        <LabelValue label={translate('postalCode')} value={postalCode} />
        <LabelValue
          label={translate('nationalAddressShort')}
          value={shortAddress}
        />
        <LabelValue
          label={translate('shippingPartner')}
          value={shippingPartner}
        />
      </div>
    </ContentCard>
  );
}
