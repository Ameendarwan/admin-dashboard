'use client';

import { InputDropdown, InputField } from '@merit-incentives/ui';

import { catalogOfferLifecycleMessageKey } from '@/app/(protected)/catalog-management/utils/listingStatusBadgeHelpers';
import type { EcommerceOfferStatus } from '@/types/catalog';

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

interface EditOfferEditableFieldsSectionProps {
  translate: TranslateFn;
  lifecycleFrozen: boolean;
  statusOptions: { value: string; label: string }[];
  status: EcommerceOfferStatus;
  onStatusChange: (status: EcommerceOfferStatus) => void;
  currency: string;
  priceText: string;
  onPriceTextChange: (value: string) => void;
  stockText: string;
  onStockTextChange: (value: string) => void;
}

export function EditOfferEditableFieldsSection({
  translate,
  lifecycleFrozen,
  statusOptions,
  status,
  onStatusChange,
  currency,
  priceText,
  onPriceTextChange,
  stockText,
  onStockTextChange,
}: Readonly<EditOfferEditableFieldsSectionProps>) {
  return (
    <section className="space-y-4 border-t border-mds-black-100 pt-8">
      <h3 className="text-lg font-semibold text-mds-black-900">
        {translate('offerEdit.sectionOffer')}
      </h3>
      <p className="text-sm text-mds-black-600">
        {translate('offerEdit.editableFieldsCaption')}
      </p>
      {lifecycleFrozen ? (
        <p className="text-sm text-mds-black-600">
          {translate('offerEdit.expiredLifecycleHint')}
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        {lifecycleFrozen ? (
          <InputField
            label={translate('offerEdit.offerStatus')}
            value={translate(catalogOfferLifecycleMessageKey('EXPIRED'))}
            readOnly
            disabled
          />
        ) : (
          <InputDropdown
            label={translate('offerEdit.offerStatus')}
            placeholder={translate('offerEdit.offerStatus')}
            options={statusOptions}
            value={status}
            onChange={(v) => onStatusChange(v as EcommerceOfferStatus)}
            required
          />
        )}
        <InputField
          label={translate('offerEdit.currencyCode')}
          value={currency}
          readOnly
          disabled
        />
        <InputField
          label={translate('offerEdit.price')}
          value={priceText}
          onChange={(e) => onPriceTextChange(e.target.value)}
          required
        />
        <InputField
          label={translate('offerEdit.stock')}
          type="number"
          min={0}
          value={stockText}
          onChange={(e) => onStockTextChange(e.target.value)}
          required
        />
      </div>
    </section>
  );
}
