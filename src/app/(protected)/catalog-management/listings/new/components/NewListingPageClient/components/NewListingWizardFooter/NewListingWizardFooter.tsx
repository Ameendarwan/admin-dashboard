'use client';

import { Button, cn } from '@merit-incentives/ui';

import type { TranslateFn } from '../../utils/newListingPageHelpers';

interface NewListingWizardFooterProps {
  step: number;
  submitting: boolean;
  continueDisabled: boolean;
  primaryLabel: string;
  translate: TranslateFn;
  onBack: () => void;
  onContinue: () => void;
}

export function NewListingWizardFooter({
  step,
  submitting,
  continueDisabled,
  primaryLabel,
  translate,
  onBack,
  onContinue,
}: Readonly<NewListingWizardFooterProps>) {
  return (
    <div
      className={cn(
        'flex w-full flex-wrap items-center gap-3 sm:gap-4',
        step > 0 ? 'justify-between' : 'justify-end',
      )}
    >
      {step > 0 ? (
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          disabled={submitting}
          className="border-0 bg-mds-primary-100 font-semibold text-mds-primary-700 hover:bg-mds-primary-200"
        >
          {translate('actions.back')}
        </Button>
      ) : null}
      <Button
        type="button"
        variant="primary"
        onClick={onContinue}
        disabled={continueDisabled}
        loading={submitting}
      >
        {primaryLabel}
      </Button>
    </div>
  );
}
