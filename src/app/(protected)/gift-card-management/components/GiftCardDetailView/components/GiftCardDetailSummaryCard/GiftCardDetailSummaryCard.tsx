'use client';

import { Badge } from '@merit-incentives/ui';

import { CopyClipboardButton } from '@/components/CopyClipboardButton';
import type { GiftCardDetail } from '@/types/catalog';

import { GiftCardDetailHeroImage } from '../../../GiftCardDetailHeroImage';
import { GiftCardManagementStatusBadge } from '../../../GiftCardManagementStatusBadge';
import { GiftCardDetailField } from '../GiftCardDetailField';

interface GiftCardDetailSummaryCardProps {
  detail: GiftCardDetail;
  translate: (key: string, values?: Record<string, string | number>) => string;
  onTermsClick: () => void;
}

function parsePreferredDenominations(value: string): string[] {
  if (!value.trim() || value.trim() === '-') {
    return [];
  }
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function GiftCardDetailSummaryCard({
  detail,
  translate,
  // onTermsClick,
}: Readonly<GiftCardDetailSummaryCardProps>) {
  const redemptionLabel =
    detail.redemption === '-'
      ? translate('giftCardManagement.giftCardDetail.redemptionOnline')
      : detail.redemption;

  const preferredDenominationParts = parsePreferredDenominations(
    detail.preferredDenominations,
  );

  const preferredDenominationValue =
    preferredDenominationParts.length === 0 ? (
      <span>-</span>
    ) : (
      <div className="flex max-w-full flex-wrap gap-1.5">
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

  const cardIdValue =
    !detail.cardId || detail.cardId === '-' ? (
      <span>-</span>
    ) : (
      <div className="flex min-w-0 items-center gap-1">
        <span className="min-w-0 truncate" title={detail.cardId}>
          {detail.cardId}
        </span>
        <CopyClipboardButton
          textToCopy={detail.cardId}
          ariaLabel={translate('giftCardManagement.giftCardDetail.copyCardId')}
          title={translate('giftCardManagement.giftCardDetail.copyCardId')}
          copiedTitle={translate('giftCardManagement.giftCardDetail.copied')}
        />
      </div>
    );

  return (
    <section className="rounded-mds-md bg-white px-6 py-7.75">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-6">
        <GiftCardDetailHeroImage
          name={detail.name}
          imageUrl={detail.imageUrl}
          imageInitials={detail.imageInitials}
          imageColor={detail.imageColor}
        />

        <div className="min-w-0 flex-1 space-y-4.5 overflow-hidden">
          <div className="flex min-w-0 items-center gap-3 overflow-hidden">
            <h2
              className="min-w-0 truncate text-2xl font-medium leading-[1.2] text-mds-black-900"
              title={detail.name}
            >
              {detail.name}
            </h2>
            <div className="flex shrink-0 items-center gap-2">
              <GiftCardManagementStatusBadge
                kind="gift-card"
                status={detail.status}
              />
              {detail.isThirdParty ? (
                <Badge color="gray" size="lg" className="whitespace-nowrap">
                  {translate('giftCardManagement.giftCardDetail.thirdParty')}
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap content-center gap-x-5 gap-y-4">
            <GiftCardDetailField
              label={translate('giftCardManagement.giftCardDetail.cardId')}
              value={cardIdValue}
              className="min-w-50 w-auto max-w-full"
            />
            <GiftCardDetailField
              label={translate('giftCardManagement.giftCardDetail.category')}
              value={detail.category}
            />
            <GiftCardDetailField
              label={translate(
                'giftCardManagement.giftCardDetail.denominationType',
              )}
              value={translate(
                `giftCardManagement.denominationType.${detail.denominationType}`,
              )}
            />
            <GiftCardDetailField
              label={translate(
                'giftCardManagement.giftCardDetail.preferredDenomination',
              )}
              value={preferredDenominationValue}
              className="w-75 max-w-full"
              truncateValue={false}
            />
            <GiftCardDetailField
              label={translate('giftCardManagement.giftCardDetail.validity')}
              value={detail.validity}
            />
            <GiftCardDetailField
              label={translate('giftCardManagement.giftCardDetail.country')}
              value={detail.country}
            />
            {/* <GiftCardDetailField
              label={translate(
                'giftCardManagement.giftCardDetail.usageLimitations',
              )}
              value={detail.usageLimitations}
            />
            <GiftCardDetailField
              label={translate(
                'giftCardManagement.giftCardDetail.deliveryMode',
              )}
              value={detail.deliveryMode}
            /> */}
            <GiftCardDetailField
              label={translate('giftCardManagement.giftCardDetail.redemption')}
              value={
                <Badge
                  color="primary"
                  size="sm"
                  className="max-w-full truncate"
                  title={redemptionLabel}
                >
                  {redemptionLabel}
                </Badge>
              }
            />
            {/* <GiftCardDetailField
              label={translate(
                'giftCardManagement.giftCardDetail.termsAndConditions',
              )}
              value={
                <button
                  type="button"
                  className="text-sm font-semibold text-mds-primary-700 hover:underline"
                  onClick={onTermsClick}
                >
                  {translate('giftCardManagement.giftCardDetail.view')}
                </button>
              }
            /> */}
          </div>
        </div>
      </div>
    </section>
  );
}
