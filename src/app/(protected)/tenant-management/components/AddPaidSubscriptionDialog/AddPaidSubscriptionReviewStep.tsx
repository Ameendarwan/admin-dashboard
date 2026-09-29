'use client';

import type { ReactNode } from 'react';
import { Pencil } from 'lucide-react';

import { TenantSummaryField } from '../TenantSummaryCard/TenantSummaryField';
import {
  buildSubscriptionAccessTimeline,
  formatAgreedPriceWithCurrency,
  formatBillingFrequencyLabel,
  formatSubscriptionDisplayDate,
  isFreeTrialSubscriptionValues,
  type AddPaidSubscriptionFormValues,
} from './addPaidSubscriptionForm';

type AddPaidSubscriptionReviewStepProps = {
  values: AddPaidSubscriptionFormValues;
  productLabel: string;
  onEditDetails: () => void;
  onEditBilling: () => void;
  translate: (key: string, params?: Record<string, string | number>) => string;
};

type ReviewSectionProps = {
  title: string;
  onEdit: () => void;
  editAriaLabel: string;
  children: ReactNode;
};

function ReviewEditButton({
  onEdit,
  editAriaLabel,
}: Readonly<{ onEdit: () => void; editAriaLabel: string }>) {
  return (
    <button
      type="button"
      onClick={onEdit}
      aria-label={editAriaLabel}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-mds-primary-200 bg-white text-mds-primary-600 transition-colors hover:border-mds-primary-300 hover:bg-mds-primary-50"
    >
      <Pencil className="h-4 w-4" strokeWidth={1.75} aria-hidden />
    </button>
  );
}

const REVIEW_FIELDS_GRID_CLASS =
  'grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-6 [&>*:last-child:nth-child(odd)]:lg:col-span-2';

function ReviewSection({
  title,
  onEdit,
  editAriaLabel,
  children,
}: Readonly<ReviewSectionProps>) {
  return (
    <section className="min-w-0 space-y-3">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 text-base font-semibold text-mds-black-900">
          {title}
        </h3>
        <ReviewEditButton onEdit={onEdit} editAriaLabel={editAriaLabel} />
      </div>
      <div className="min-w-0 rounded-xl bg-mds-primary-50 px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <div className={REVIEW_FIELDS_GRID_CLASS}>{children}</div>
      </div>
    </section>
  );
}

export function AddPaidSubscriptionReviewStep({
  values,
  productLabel,
  onEditDetails,
  onEditBilling,
  translate,
}: Readonly<AddPaidSubscriptionReviewStepProps>) {
  const isFreeTrial = isFreeTrialSubscriptionValues(values);
  const periodLabel = `${formatSubscriptionDisplayDate(values.startDate)} - ${formatSubscriptionDisplayDate(values.endDate)}`;
  const accessTimeline = buildSubscriptionAccessTimeline(values);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <ReviewSection
        title={translate('review.subscriptionDetailsTitle')}
        onEdit={onEditDetails}
        editAriaLabel={translate('review.editDetails')}
      >
        <TenantSummaryField
          label={translate('review.subscriptionType')}
          value={
            isFreeTrial
              ? translate('review.freeTrialSubscription')
              : translate('review.paidSubscription')
          }
        />
        {isFreeTrial ? (
          <TenantSummaryField
            label={translate('review.trialDays')}
            value={translate('review.trialDaysValue', {
              days: values.trialDays,
            })}
          />
        ) : null}
        <TenantSummaryField
          label={translate('review.product')}
          value={productLabel}
        />
        <TenantSummaryField
          label={translate('review.subscriptionPeriod')}
          value={periodLabel}
        />
        <TenantSummaryField
          label={translate('review.gracePeriod')}
          value={translate('review.gracePeriodValue', {
            days: values.gracePeriodDays,
          })}
        />
        {accessTimeline ? (
          <div className="min-w-0 space-y-3 lg:col-span-2">
            <p className="text-sm font-medium text-mds-black-900">
              {translate('review.accessTimelineTitle')}
            </p>
            <ul className="space-y-2 rounded-lg border border-mds-primary-100 bg-white/80 px-4 py-3 text-sm text-mds-black-800">
              {accessTimeline.trialEndsAt ? (
                <li>
                  <span className="font-medium text-mds-black-900">
                    {translate('review.trialEndsAt')}:
                  </span>{' '}
                  {formatSubscriptionDisplayDate(accessTimeline.trialEndsAt)}
                </li>
              ) : null}
              <li>
                <span className="font-medium text-mds-black-900">
                  {translate('review.graceStartsAt')}:
                </span>{' '}
                {formatSubscriptionDisplayDate(accessTimeline.graceStartsAt)}
              </li>
              <li>
                <span className="font-medium text-mds-black-900">
                  {translate('review.subscriptionEndsAt')}:
                </span>{' '}
                {formatSubscriptionDisplayDate(
                  accessTimeline.subscriptionEndsAt,
                )}
              </li>
            </ul>
          </div>
        ) : null}
      </ReviewSection>

      <ReviewSection
        title={translate('review.billingTitle')}
        onEdit={onEditBilling}
        editAriaLabel={translate('review.editBilling')}
      >
        {isFreeTrial ? (
          <>
            <TenantSummaryField
              label={translate('review.initialPayment')}
              value={translate('review.noInitialPayment')}
            />
            <TenantSummaryField
              label={translate('review.agreedPrice')}
              value={
                values.agreedPrice.trim()
                  ? formatAgreedPriceWithCurrency(
                      values.agreedPrice,
                      values.currency,
                    )
                  : translate('review.agreedPriceNotSet')
              }
            />
          </>
        ) : (
          <>
            <TenantSummaryField
              label={translate('review.invoiceType')}
              value={translate('review.invoiceTypeValue')}
            />
            <TenantSummaryField
              label={translate('review.agreedPrice')}
              value={formatAgreedPriceWithCurrency(
                values.agreedPrice,
                values.currency,
              )}
            />
          </>
        )}
        <TenantSummaryField
          label={translate('review.billingFrequency')}
          value={formatBillingFrequencyLabel(values, translate)}
        />
      </ReviewSection>
    </div>
  );
}
