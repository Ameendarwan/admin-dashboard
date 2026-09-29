'use client';

import React from 'react';

import { useLocalization } from '@/hooks/useLocalization';
import { AttachmentType, DocumentType, ReviewMode } from '@/lib/enums';
import type { RevisionFieldCallbacks } from '@/types/review';
import type { Attachment } from '@/types/tenantManagement';

import { getAttachmentByType } from '../../utils/getAttachmentByType';
import { DocumentReviewCard } from '../DocumentReviewCard';

type AttachedDocumentsReviewProps = {
  attachments: Attachment[] | null;
  mode: ReviewMode;
  onRevisionRequest: RevisionFieldCallbacks['onRevisionRequest'];
  onRevisionClear: RevisionFieldCallbacks['onRevisionClear'];
};

export function AttachedDocumentsReview({
  attachments,
  mode,
  onRevisionRequest,
  onRevisionClear,
}: Readonly<AttachedDocumentsReviewProps>) {
  const { translate } = useLocalization('attached-documents-review');

  if (!attachments) return null;

  const businessRegistration = getAttachmentByType(
    attachments,
    AttachmentType.BUSINESS_REGISTRATION,
  );
  const nationalAddress = getAttachmentByType(
    attachments,
    AttachmentType.NATIONAL_ADDRESS,
  );
  const vatRegistration = getAttachmentByType(
    attachments,
    AttachmentType.VAT_REGISTRATION,
  );

  return (
    <div className="rounded-xl border border-mds-black-100 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-medium text-mds-black-900">
        {translate('title')}
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <DocumentReviewCard
          label={translate('documents.businessRegistration')}
          fileName={businessRegistration?.fileName || 'file.format'}
          fieldPath={`attachments.${DocumentType.BUSINESS_REGISTRATION}`}
          filePath={businessRegistration?.filePath || ''}
          downloadUrl={businessRegistration?.downloadUrl || ''}
          mode={mode}
          onRevisionRequest={onRevisionRequest}
          onRevisionClear={onRevisionClear}
        />

        <DocumentReviewCard
          label={translate('documents.nationalAddress')}
          fileName={nationalAddress?.fileName || 'file.format'}
          fieldPath={`attachments.${DocumentType.NATIONAL_ADDRESS}`}
          filePath={nationalAddress?.filePath || ''}
          downloadUrl={nationalAddress?.downloadUrl || ''}
          mode={mode}
          onRevisionRequest={onRevisionRequest}
          onRevisionClear={onRevisionClear}
        />

        <DocumentReviewCard
          label={translate('documents.vatRegistration')}
          fileName={vatRegistration?.fileName || 'file.format'}
          fieldPath={`attachments.${DocumentType.VAT_REGISTRATION}`}
          filePath={vatRegistration?.filePath || ''}
          downloadUrl={vatRegistration?.downloadUrl || ''}
          mode={mode}
          onRevisionRequest={onRevisionRequest}
          onRevisionClear={onRevisionClear}
        />
      </div>
    </div>
  );
}
