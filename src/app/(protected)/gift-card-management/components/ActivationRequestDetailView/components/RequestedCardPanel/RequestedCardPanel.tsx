'use client';

import { Badge, Button } from '@merit-incentives/ui';
import { Check, X } from 'lucide-react';
import type { ReactNode } from 'react';

import { CopyClipboardButton } from '@/components/CopyClipboardButton';
import type { ActivationRequestCardItem } from '@/types/catalog';

import { GiftCardCoverImage } from '../../../GiftCardCoverImage';
import { GiftCardManagementStatusBadge } from '../../../GiftCardManagementStatusBadge';
import { TenantDetailField } from '../TenantDetailField';

interface RequestedCardPanelProps {
  card: ActivationRequestCardItem;
  translate: (key: string, values?: Record<string, string | number>) => string;
  onApprove: () => void;
  onReject: () => void;
  // onSendForBrandApproval: () => void;
  actionsDisabled: boolean;
  approveLoading: boolean;
  rejectLoading: boolean;
}

function parsePreferredDenominations(value: string | undefined): string[] {
  if (!value?.trim() || value.trim() === '-') {
    return [];
  }
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function RequestedCardPanel({
  card,
  translate,
  onApprove,
  onReject,
  // onSendForBrandApproval,
  actionsDisabled,
  approveLoading,
  rejectLoading,
}: Readonly<RequestedCardPanelProps>) {
  const cardIdValue: ReactNode =
    !card.productId || card.productId === '-' ? (
      '-'
    ) : (
      <div className="flex min-w-0 items-center gap-1">
        <span className="min-w-0 truncate" title={card.productId}>
          {card.productId}
        </span>
        <CopyClipboardButton
          textToCopy={card.productId}
          ariaLabel={translate('giftCardManagement.detail.copyCardId')}
          title={translate('giftCardManagement.detail.copyCardId')}
          copiedTitle={translate('giftCardManagement.detail.copied')}
        />
      </div>
    );

  const preferredDenominationParts = parsePreferredDenominations(
    card.preferredDenominations,
  );

  const preferredDenominationsValue: ReactNode =
    preferredDenominationParts.length === 0 ? (
      '-'
    ) : (
      <div className="flex flex-wrap gap-1.5">
        {preferredDenominationParts.map((denomination) => (
          <Badge
            key={denomination}
            color="gray"
            size="sm"
            className="shrink-0 border border-mds-black-100 bg-white"
          >
            {denomination}
          </Badge>
        ))}
      </div>
    );

  const fields: { label: string; value: ReactNode }[] = [
    {
      label: translate('giftCardManagement.detail.cardId'),
      value: cardIdValue,
    },
    {
      label: translate('giftCardManagement.detail.category'),
      value: card.category,
    },
    {
      label: translate('giftCardManagement.detail.minDenomination'),
      value: card.minDenomination,
    },
    {
      label: translate('giftCardManagement.detail.maxDenomination'),
      value: card.maxDenomination,
    },
    {
      label: translate('giftCardManagement.detail.denominationType'),
      value: card.denominationType,
    },
    {
      label: translate('giftCardManagement.detail.validity'),
      value: card.validity,
    },
    // {
    //   label: translate('giftCardManagement.detail.deliveryMode'),
    //   value: card.deliveryMode,
    // },
    {
      label: translate('giftCardManagement.detail.redemption'),
      value: card.redemption,
    },
    {
      label: translate('giftCardManagement.detail.country'),
      value: card.country,
    },
    // {
    //   label: translate('giftCardManagement.detail.usageLimitation'),
    //   value: card.usageLimitation,
    // },
  ];

  const highlightFields: { label: string; value: ReactNode }[] = [
    {
      label: translate('giftCardManagement.detail.expectedSpend'),
      value: card.expectedSpend?.trim() || '-',
    },
    {
      label: translate('giftCardManagement.detail.preferredDenominations'),
      value: preferredDenominationsValue,
    },
  ];

  return (
    <article className="flex flex-col gap-6 overflow-hidden rounded-xl border-0 border-b border-mds-black-100 bg-white px-5 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <GiftCardCoverImage
            name={card.name}
            imageUrl={card.imageUrl}
            imageInitials={card.imageInitials}
            imageColor={card.imageColor}
          />
          <div className="flex min-w-0 flex-col gap-2">
            <h3
              className="truncate text-2xl font-medium leading-[1.2] text-mds-black-900"
              title={card.name}
            >
              {card.name}
            </h3>
            <GiftCardManagementStatusBadge
              kind="activation-item"
              status={card.status}
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-4 sm:justify-end">
          <Button
            variant="tertiary"
            type="button"
            size="sm"
            onClick={onReject}
            loading={rejectLoading}
            disabled={actionsDisabled}
            leftIcon={<X className="h-5 w-5 text-mds-error-600" aria-hidden />}
            className="rounded-2xl border-[1.5px] border-mds-error-500 bg-white px-2.5 text-mds-error-500 hover:bg-mds-error-50"
          >
            {translate('giftCardManagement.detail.rejectRequest')}
          </Button>
          {/* Brand approval temporarily disabled
          <Button
            variant="tertiary"
            type="button"
            size="sm"
            onClick={onSendForBrandApproval}
            disabled={actionsDisabled}
            leftIcon={<Send className="h-5 w-5" aria-hidden />}
            className="rounded-2xl border-[1.5px] border-mds-black-300 bg-white px-2.5 text-mds-black-900 hover:bg-mds-black-50"
          >
            {translate('giftCardManagement.detail.sendForBrandApproval')}
          </Button>
          */}
          <Button
            variant="primary"
            type="button"
            size="sm"
            onClick={onApprove}
            loading={approveLoading}
            disabled={actionsDisabled}
            leftIcon={<Check className="h-5 w-5" aria-hidden />}
            className="rounded-2xl px-2.5"
          >
            {translate('giftCardManagement.detail.approveRequest')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {highlightFields.map((field) => {
          const isPlainText =
            typeof field.value === 'string' || typeof field.value === 'number';

          return (
            <div
              key={field.label}
              className="flex min-w-0 flex-col gap-2.5 rounded-xl bg-[#F4F7FE] p-3"
            >
              <p className="truncate text-sm font-medium leading-[1.2] text-mds-black-500">
                {field.label}
              </p>
              <div
                className={`min-w-0 text-base font-medium leading-[1.4] text-mds-black-900 ${
                  isPlainText ? 'truncate' : ''
                }`}
                title={isPlainText ? String(field.value) : undefined}
              >
                {field.value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-x-2.5 gap-y-6 sm:grid-cols-2 lg:grid-cols-5">
        {fields.map((field) => (
          <TenantDetailField
            key={field.label}
            label={field.label}
            value={field.value}
            truncateValue={typeof field.value === 'string'}
          />
        ))}
      </div>
    </article>
  );
}
