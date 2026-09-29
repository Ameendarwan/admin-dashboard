'use client';

import type { ActivationRequestCardItem } from '@/types/catalog';

import { RequestedCardPanel } from '../RequestedCardPanel';

interface ActivationRequestCardsSectionProps {
  cards: ActivationRequestCardItem[];
  translate: (key: string, values?: Record<string, string | number>) => string;
  approvingItemId: string | undefined;
  rejectingItemId: string | undefined;
  isCardActionsDisabled: (card: ActivationRequestCardItem) => boolean;
  onApprove: (card: ActivationRequestCardItem) => void;
  onReject: (card: ActivationRequestCardItem) => void;
  // onSendForBrandApproval: (card: ActivationRequestCardItem) => void;
}

export function ActivationRequestCardsSection({
  cards,
  translate,
  approvingItemId,
  rejectingItemId,
  isCardActionsDisabled,
  onApprove,
  onReject,
  // onSendForBrandApproval,
}: Readonly<ActivationRequestCardsSectionProps>) {
  return (
    <section className="space-y-4">
      <h2 className="text-[24px] font-semibold leading-[1.2] text-mds-black-900">
        {translate('giftCardManagement.detail.requestedCards')}
      </h2>
      {cards.length === 0 ? (
        <div className="rounded-xl bg-white px-5 py-10 text-center">
          <p className="text-sm font-medium text-mds-black-900">
            {translate('giftCardManagement.detail.requestedCardsEmptyTitle')}
          </p>
          <p className="mt-2 text-sm text-mds-black-600">
            {translate('giftCardManagement.detail.requestedCardsEmptyBody')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => (
            <RequestedCardPanel
              key={card.id}
              card={card}
              translate={translate}
              onApprove={() => onApprove(card)}
              onReject={() => onReject(card)}
              // onSendForBrandApproval={() => onSendForBrandApproval(card)}
              approveLoading={approvingItemId === card.id}
              rejectLoading={rejectingItemId === card.id}
              actionsDisabled={isCardActionsDisabled(card)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
