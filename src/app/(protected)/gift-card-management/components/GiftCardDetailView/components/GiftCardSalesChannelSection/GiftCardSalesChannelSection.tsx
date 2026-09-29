'use client';

import { Button, LoadingSpinner, Toggle } from '@merit-incentives/ui';

import type { GiftCardDetail } from '@/types/catalog';

interface GiftCardSalesChannelSectionProps {
  detail: GiftCardDetail;
  translate: (key: string, values?: Record<string, string | number>) => string;
  loading: boolean;
  error: boolean;
  retrying: boolean;
  togglingSalesChannelId: string | null;
  togglingSalesChannelActive: boolean | null;
  onToggle: (salesChannelId: string, active: boolean) => void;
  onRetry: () => void;
}

export function GiftCardSalesChannelSection({
  detail,
  translate,
  loading,
  error,
  retrying,
  togglingSalesChannelId,
  togglingSalesChannelActive = null,
  onToggle,
  onRetry,
}: Readonly<GiftCardSalesChannelSectionProps>) {
  let body: React.ReactNode;

  if (loading) {
    body = (
      <div className="flex justify-center px-6 py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  } else if (error) {
    body = (
      <div className="px-6 py-8 text-center">
        <p className="text-base font-medium text-mds-black-900">
          {translate(
            'giftCardManagement.giftCardDetail.salesChannel.errorTitle',
          )}
        </p>
        <Button
          type="button"
          variant="tertiary"
          size="sm"
          className="mt-3 text-mds-primary-700 hover:underline"
          loading={retrying}
          disabled={retrying}
          onClick={onRetry}
        >
          {translate('giftCardManagement.giftCardDetail.salesChannel.retry')}
        </Button>
      </div>
    );
  } else if (detail.salesChannels.length === 0) {
    body = (
      <p className="px-6 py-8 text-center text-base font-medium text-mds-black-900">
        {translate('giftCardManagement.giftCardDetail.salesChannel.emptyTitle')}
      </p>
    );
  } else {
    body = (
      <div className="w-full overflow-hidden rounded-xl bg-white">
        <div className="grid grid-cols-[minmax(0,338px)_1fr]">
          <div className="bg-mds-bg-light-50 px-6 py-2 text-sm font-semibold leading-[1.2] text-mds-black-600">
            {translate(
              'giftCardManagement.giftCardDetail.salesChannel.product',
            )}
          </div>
          <div className="bg-mds-bg-light-50 px-6 py-2 text-sm font-semibold leading-[1.2] text-mds-black-600">
            {translate('giftCardManagement.giftCardDetail.salesChannel.status')}
          </div>

          {detail.salesChannels.map((row) => {
            const isToggling = togglingSalesChannelId === row.id;
            const checked =
              isToggling && togglingSalesChannelActive != null
                ? togglingSalesChannelActive
                : row.active;

            return (
              <div key={row.id} className="contents">
                <div className="flex items-center px-6 py-6">
                  <span className="text-base font-medium leading-[1.4] text-mds-black-900">
                    {row.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 px-6 py-6">
                  <div className="relative inline-flex shrink-0">
                    <Toggle
                      checked={checked}
                      disabled={isToggling}
                      size="md"
                      aria-label={translate(
                        'giftCardManagement.giftCardDetail.salesChannel.toggleAria',
                        { channel: row.name },
                      )}
                      onCheckedChange={(nextChecked) => {
                        onToggle(row.id, nextChecked === true);
                      }}
                    />
                    {isToggling ? (
                      <div
                        className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70"
                        aria-hidden
                      >
                        <LoadingSpinner size="sm" />
                      </div>
                    ) : null}
                  </div>
                  <span className="text-base font-medium leading-[1.4] text-mds-black-700">
                    {translate(
                      'giftCardManagement.giftCardDetail.salesChannel.active',
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6 overflow-hidden rounded-xl bg-white">
      <div className="border-b border-mds-black-100 px-6 pt-6">
        <div className="relative">
          <div
            className="absolute inset-x-0 bottom-0 h-0.5 bg-mds-primary-100"
            aria-hidden
          />
          <div className="relative inline-flex h-10 items-center border-b-2 border-mds-primary-700">
            <span className="px-2 text-base font-medium leading-[1.4] text-mds-primary-700">
              {translate('giftCardManagement.giftCardDetail.tabs.salesChannel')}
            </span>
          </div>
        </div>
      </div>
      <div className="pb-6">{body}</div>
    </section>
  );
}
