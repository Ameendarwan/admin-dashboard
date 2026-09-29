'use client';

import React from 'react';

import { ReviewMode } from '@/lib/enums';
import { useLocalization } from '@/hooks/useLocalization';
import type { RevisionFieldCallbacks } from '@/types/review';

import { RevisionRequestSection } from '../RevisionRequestSection';
import { useRevisionRequest } from '../../hooks/useRevisionRequest';

type ReviewFieldProps = {
  label: string;
  value?: string | null;
  fieldPath: string;
  mode: ReviewMode;
  onRevisionRequest: RevisionFieldCallbacks['onRevisionRequest'];
  onRevisionClear: RevisionFieldCallbacks['onRevisionClear'];
  isSelect?: boolean;
  hideLabel?: boolean;
  canBeRevised?: boolean;
};

export function ReviewField({
  label,
  value,
  fieldPath,
  mode,
  onRevisionRequest,
  onRevisionClear,
  hideLabel = false,
  canBeRevised = true,
}: Readonly<ReviewFieldProps>) {
  const { translate } = useLocalization('review-field');
  const {
    isRevisionRequested,
    revisionReason,
    handleRevisionChange,
    handleReasonChange,
  } = useRevisionRequest({
    fieldPath,
    mode,
    onRevisionRequest,
    onRevisionClear,
  });

  const isRevisionMode = mode === ReviewMode.REVISION;
  const trimmed = typeof value === 'string' ? value.trim() : '';
  const displayValue = trimmed || '—';

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {!hideLabel && (
        <span className="text-sm font-medium text-mds-black-500">{label}</span>
      )}
      <span className="text-base font-medium text-mds-black-900 wrap-break-word">
        {displayValue}
      </span>

      {isRevisionMode && canBeRevised && (
        <div className="mt-2">
          <RevisionRequestSection
            isRevisionRequested={isRevisionRequested}
            revisionReason={revisionReason}
            onRevisionChange={handleRevisionChange}
            onReasonChange={handleReasonChange}
            requestRevisionLabel={translate('requestRevision')}
            reasonPlaceholder={translate('reasonPlaceholder')}
          />
        </div>
      )}
    </div>
  );
}
