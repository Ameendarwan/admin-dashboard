'use client';

import React from 'react';

import { useLocalization } from '@/hooks/useLocalization';
import type { ReviewMode } from '@/lib/enums';
import type { RevisionFieldCallbacks } from '@/types/review';
import type { ComplianceDeclarationsMetadata } from '@/types/tenantManagement';
import { getCountryName } from '@/utils/countryUtils';

import { ReviewField } from '../ReviewField';

type ComplianceDeclarationsReviewProps = {
  compliance: ComplianceDeclarationsMetadata;
  mode: ReviewMode;
  onRevisionRequest: RevisionFieldCallbacks['onRevisionRequest'];
  onRevisionClear: RevisionFieldCallbacks['onRevisionClear'];
};

export function ComplianceDeclarationsReview({
  compliance,
  mode,
  onRevisionRequest,
  onRevisionClear,
}: Readonly<ComplianceDeclarationsReviewProps>) {
  const { translate } = useLocalization('compliance-declarations-review');

  if (!compliance) {
    return null;
  }

  return (
    <div className="rounded-xl border border-mds-black-100 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-medium text-mds-black-900">
        {translate('title')}
      </h2>

      <div className="space-y-8">
        <ReviewField
          label={translate('fields.countryOfOrigin')}
          value={getCountryName(compliance.countryOfOrigin)}
          fieldPath="compliance.countryOfOrigin"
          mode={mode}
          onRevisionRequest={onRevisionRequest}
          onRevisionClear={onRevisionClear}
          canBeRevised={false}
        />

        <div className="flex min-w-0 flex-col gap-1">
          <span className="flex flex-wrap items-start gap-1 text-sm font-medium text-mds-black-500">
            <span className="max-w-[42rem]">
              {translate('fields.sanctionsQuestion')}{' '}
              {translate('fields.sanctionsNote')}
            </span>
            <span className="shrink-0 text-destructive">*</span>
          </span>
          <span className="text-base font-medium text-mds-black-900">
            {compliance.subjectToSanctions
              ? translate('values.yes')
              : translate('values.no')}
          </span>
          {compliance.sanctionsDetails ? (
            <p className="mt-2 text-base font-medium text-mds-black-900 wrap-break-word">
              {compliance.sanctionsDetails}
            </p>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <span className="flex flex-wrap items-start gap-1 text-sm font-medium text-mds-black-500">
            <span className="max-w-[44rem]">
              {translate('fields.amlQuestion')}
            </span>
            <span className="shrink-0 text-destructive">*</span>
          </span>
          <span className="text-base font-medium text-mds-black-900">
            {compliance.amlCftCompliance
              ? translate('values.yes')
              : translate('values.no')}
          </span>
          {compliance.amlCftDetails ? (
            <p className="mt-2 text-base font-medium text-mds-black-900 wrap-break-word">
              {compliance.amlCftDetails}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
