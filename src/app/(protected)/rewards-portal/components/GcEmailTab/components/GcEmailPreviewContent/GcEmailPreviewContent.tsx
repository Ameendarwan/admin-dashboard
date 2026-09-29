'use client';

import type { GcEmailTemplateMock } from '@/mock/rewardsPortalGcEmail';
import { useLocalization } from '@/hooks/useLocalization';

interface GcEmailPreviewContentProps {
  template: GcEmailTemplateMock;
}

export function GcEmailPreviewContent({
  template,
}: Readonly<GcEmailPreviewContentProps>) {
  const { translate } = useLocalization('rewards-portal');

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6 rounded-2xl border border-mds-black-100 bg-white p-6 shadow-sm">
      <div className="flex justify-center">
        <span className="text-2xl font-bold tracking-[0.2em] text-mds-primary-950">
          MERIT
        </span>
      </div>

      <div className="flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-mds-primary-100 via-mds-casablanca-100 to-mds-primary-200">
        <p className="px-4 text-center text-lg font-semibold text-mds-primary-900">
          {translate('gcEmail.preview.heroLabel')}
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <span className="rounded-full bg-mds-black-50 px-3 py-1 text-sm font-medium text-mds-black-700">
          {translate('gcEmail.preview.rewardBadge')}
        </span>
        <h3 className="text-2xl font-semibold text-mds-black-900">
          {template.previewHeadline}
        </h3>
        <p className="text-base leading-[1.4] text-mds-black-700">
          {template.previewMessage}
        </p>
      </div>

      <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-mds-black-100 bg-mds-black-50">
        <div className="flex h-36 items-center justify-center bg-mds-black-100 text-sm font-medium text-mds-black-500">
          {translate('gcEmail.preview.cardImage')}
        </div>
        <div className="space-y-2 p-4">
          <p className="text-sm font-semibold text-mds-black-900">
            {'{{Discount}}'}
          </p>
          <p className="text-xs font-medium uppercase tracking-wide text-mds-black-500">
            {translate('gcEmail.preview.giftCardLabel')}
          </p>
          <p className="font-mono text-sm text-mds-black-700">
            •••• •••• •••• ••••
          </p>
          <p className="font-mono text-sm text-mds-black-700">••••</p>
        </div>
      </div>

      <button
        type="button"
        className="w-full rounded-2xl bg-mds-primary-700 px-4 py-3 text-base font-semibold text-white"
      >
        {translate('gcEmail.preview.revealCta')}
      </button>

      <div className="rounded-xl border border-mds-black-100 p-4">
        <p className="mb-2 text-sm font-semibold text-mds-black-900">
          {translate('gcEmail.preview.termsTitle')}
        </p>
        <p className="text-sm leading-[1.4] text-mds-black-600">
          {translate('gcEmail.preview.termsBody')}
        </p>
      </div>

      <div className="rounded-xl bg-mds-black-50 p-4">
        <p className="mb-3 text-sm text-mds-black-600">
          {translate('gcEmail.preview.supportNote')}
        </p>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-mds-black-800">
              {translate('gcEmail.preview.cardReference')}
            </span>
            <span className="font-mono text-mds-black-900">
              {template.previewCardReference}
            </span>
            <span className="rounded-full bg-mds-casablanca-100 px-2 py-0.5 text-xs font-medium text-mds-casablanca-700">
              {translate('gcEmail.preview.notForRedemption')}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-mds-black-800">
              {translate('gcEmail.preview.orderReference')}
            </span>
            <span className="font-mono text-mds-black-900">
              {template.previewOrderReference}
            </span>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-mds-black-500">
        {translate('gcEmail.preview.copyright')}
      </p>
    </div>
  );
}
