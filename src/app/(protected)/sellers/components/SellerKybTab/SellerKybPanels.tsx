'use client';

import React from 'react';

import { useLocalization } from '@/hooks/useLocalization';
import type { SellerKybViewModel } from '@/types/sellerKybViewModel';
import type { Attachment } from '@/types/tenantManagement';

import { formatAttachmentTypeLabel } from './attachmentTypeLabel';
import { KybDocumentSlot } from './KybDocumentSlot';
import { KybField } from './KybField';
import { KybSection } from './KybSection';

interface SellerKybPanelsProps {
  readonly model: SellerKybViewModel;
  readonly attachments: Attachment[] | null;
  readonly notProvided: string;
}

export function SellerKybPanels({
  model,
  attachments,
  notProvided,
}: SellerKybPanelsProps) {
  const { translate } = useLocalization('seller-details');
  const { business, role, financials } = model;

  const d = (value: string) => (value.trim() ? value : notProvided);

  const attachmentList = attachments?.length ? attachments : [];

  return (
    <div className="flex flex-col gap-6">
      <KybSection title={translate('kyb.sections.business')}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <KybField
            label={translate('kyb.fields.crn')}
            value={d(business.crn)}
          />
          <KybField
            label={translate('kyb.fields.legalNameEn')}
            value={d(business.legalNameEn)}
          />
          <KybField
            label={translate('kyb.fields.legalNameAr')}
            value={d(business.legalNameAr)}
          />
          <KybField
            label={translate('kyb.fields.vatNumber')}
            value={d(business.vatNumber)}
          />
          <KybField
            label={translate('kyb.fields.businessAddress')}
            value={d(business.businessAddress)}
          />
          <KybField
            label={translate('kyb.fields.country')}
            value={d(business.country)}
          />
          <KybField
            label={translate('kyb.fields.state')}
            value={d(business.state)}
          />
          <KybField
            label={translate('kyb.fields.city')}
            value={d(business.city)}
          />
          <KybField
            label={translate('kyb.fields.zipPostal')}
            value={d(business.zipPostal)}
          />
        </div>
      </KybSection>

      <KybSection title={translate('kyb.sections.role')}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <KybField label={translate('kyb.fields.role')} value={d(role.role)} />
          <KybField
            label={translate('kyb.fields.nationalId')}
            value={d(role.nationalId)}
          />
          <KybField
            label={translate('kyb.fields.fullNameEn')}
            value={d(role.fullNameEn)}
          />
          <KybField
            label={translate('kyb.fields.fullNameAr')}
            value={d(role.fullNameAr)}
          />
          <KybField
            label={translate('kyb.fields.dateOfBirth')}
            value={d(role.dateOfBirth)}
          />
        </div>
      </KybSection>

      <KybSection title={translate('kyb.sections.financials')}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <KybField
            label={translate('kyb.fields.iban')}
            value={d(financials.iban)}
          />
          <KybField
            label={translate('kyb.fields.bankName')}
            value={d(financials.bankName)}
          />
          <KybField
            label={translate('kyb.fields.currency')}
            value={d(financials.currency)}
          />
        </div>
      </KybSection>

      <KybSection title={translate('kyb.sections.documents')}>
        {attachmentList.length === 0 ? (
          <p className="text-sm text-mds-black-500">
            {translate('kyb.documents.noneAttached')}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {attachmentList.map((att) => (
              <KybDocumentSlot
                key={att.id}
                label={formatAttachmentTypeLabel(att.attachmentType)}
                attachment={att}
                notProvidedLabel={notProvided}
                viewLabel={translate('store.viewFile')}
                downloadLabel={translate('store.downloadFile')}
                downloadFailedMessage={translate('store.downloadFailed')}
                viewOpenFailedMessage={translate('store.viewOpenFailed')}
              />
            ))}
          </div>
        )}
      </KybSection>
    </div>
  );
}
