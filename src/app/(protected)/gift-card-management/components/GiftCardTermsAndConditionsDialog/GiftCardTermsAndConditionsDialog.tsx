'use client';

import { Popup } from '@merit-incentives/ui';
import { useId } from 'react';

import { useLocalization } from '@/hooks/useLocalization';

const GENERAL_TERM_KEYS = [
  'generalTerm1',
  'generalTerm2',
  'generalTerm3',
] as const;

const REDEMPTION_STEP_KEYS = [
  'redemptionStep1',
  'redemptionStep2',
  'redemptionStep3',
  'redemptionStep4',
  'redemptionStep5',
  'redemptionStep6',
  'redemptionStep7',
  'redemptionStep8',
] as const;

interface GiftCardTermsAndConditionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function TermsList({ items }: Readonly<{ items: string[] }>) {
  return (
    <ol className="list-decimal space-y-3 ps-5 text-sm leading-relaxed text-mds-black-700">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ol>
  );
}

export function GiftCardTermsAndConditionsDialog({
  isOpen,
  onClose,
}: Readonly<GiftCardTermsAndConditionsDialogProps>) {
  const titleId = useId();
  const { translate } = useLocalization('catalog');

  const generalTerms = GENERAL_TERM_KEYS.map((key) =>
    translate(`giftCardManagement.giftCardDetail.termsModal.${key}`),
  );
  const redemptionSteps = REDEMPTION_STEP_KEYS.map((key) =>
    translate(`giftCardManagement.giftCardDetail.termsModal.${key}`),
  );

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick
      role="dialog"
      aria-labelledby={titleId}
      className="w-[min(100%,44rem)] max-w-[calc(100vw-2rem)]"
    >
      <Popup.Header onClose={onClose} showDivider className="px-6 py-5 sm:px-8">
        <h2
          id={titleId}
          className="text-lg font-semibold tracking-tight text-mds-black-900 sm:text-xl"
        >
          {translate('giftCardManagement.giftCardDetail.termsModal.title')}
        </h2>
      </Popup.Header>

      <Popup.Content className="max-h-[min(70vh,36rem)] overflow-y-auto px-6 py-6 sm:px-8">
        <div className="space-y-6">
          <TermsList items={generalTerms} />

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-mds-black-900">
              {translate(
                'giftCardManagement.giftCardDetail.termsModal.redemptionProcessTitle',
              )}
            </h3>
            <TermsList items={redemptionSteps} />
          </div>
        </div>
      </Popup.Content>
    </Popup>
  );
}
