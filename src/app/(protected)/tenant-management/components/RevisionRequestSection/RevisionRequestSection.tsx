'use client';

import React from 'react';
import { Checkbox, InputField } from '@merit-incentives/ui/components';

import { REVISION_REASON_MAX_LENGTH } from '@/lib/enums';

interface RevisionRequestSectionProps {
  isRevisionRequested: boolean;
  revisionReason: string;
  onRevisionChange: (checked: boolean) => void;
  onReasonChange: (reason: string) => void;
  requestRevisionLabel: string;
  reasonPlaceholder: string;
}

export function RevisionRequestSection({
  isRevisionRequested,
  revisionReason,
  onRevisionChange,
  onReasonChange,
  requestRevisionLabel,
  reasonPlaceholder,
}: Readonly<RevisionRequestSectionProps>) {
  return (
    <div className="space-y-2">
      <Checkbox
        checked={isRevisionRequested}
        onCheckedChange={onRevisionChange}
        label={requestRevisionLabel}
      />

      {isRevisionRequested && (
        <div className="space-y-1">
          <InputField
            type="text"
            placeholder={reasonPlaceholder}
            value={revisionReason}
            onChange={(e) => onReasonChange(e.target.value)}
            maxLength={REVISION_REASON_MAX_LENGTH}
          />
          <div className="text-xs text-gray-500 text-right">
            {revisionReason.length}/{REVISION_REASON_MAX_LENGTH}
          </div>
        </div>
      )}
    </div>
  );
}
