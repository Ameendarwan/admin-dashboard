'use client';

import { Button, Tooltip } from '@merit-incentives/ui';
import React from 'react';

export interface MarkAsReceivedToolbarProps {
  readonly selectionSuffix: string;
  readonly isDisabled: boolean;
  readonly isMarkingReceived: boolean;
  readonly tooltipText: string | null;
  readonly onMark: () => void;
}

export function MarkAsReceivedToolbar({
  selectionSuffix,
  isDisabled,
  isMarkingReceived,
  tooltipText,
  onMark,
}: MarkAsReceivedToolbarProps) {
  const label = `Mark as Received${selectionSuffix}`;
  if (tooltipText) {
    return (
      <Tooltip content="Action Disabled" supportingText={tooltipText}>
        <span className="inline-block">
          <Button variant="tertiary" disabled>
            {label}
          </Button>
        </span>
      </Tooltip>
    );
  }
  return (
    <Button
      variant="tertiary"
      disabled={isDisabled}
      loading={isMarkingReceived}
      onClick={onMark}
    >
      {label}
    </Button>
  );
}
