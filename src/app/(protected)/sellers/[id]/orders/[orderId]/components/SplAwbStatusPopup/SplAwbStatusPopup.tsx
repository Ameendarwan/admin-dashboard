'use client';

import { Button, Popup } from '@merit-incentives/ui/components';
import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useSplAwbStatusLogic, type ShippingStatus } from './useSplAwbStatusLogic';

export type SplAwbPopupStatus = Extract<
  ShippingStatus,
  'generating' | 'delay' | 'ready-download'
>;

interface SplAwbStatusPopupProps {
  isOpen: boolean;
  onClose: () => void;
  status: SplAwbPopupStatus;
  onStatusChange: (status: SplAwbPopupStatus) => void;
  awbRequestedAt?: string;
  orderId: string;
  awbNumber?: string;
  onDownload: () => void;
}

export function SplAwbStatusPopup({
  isOpen,
  onClose,
  status,
  onStatusChange,
  awbRequestedAt,
  orderId,
  awbNumber,
  onDownload,
}: Readonly<SplAwbStatusPopupProps>) {
  const t = useTranslations('shippingStatusPopup');

  const { currentRemainingTime, getIconConfig, getContent } = useSplAwbStatusLogic({
    open: isOpen,
    shippingType: 'awb',
    status: status as ShippingStatus,
    awbRequestedAt,
    onStatusChange: (next) => {
      if (next === 'delay' || next === 'generating') {
        onStatusChange(next);
      }
    },
  });

  const { Icon, bgColor, iconColor } = getIconConfig();
  const content = getContent();

  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      <Popup.Content className="max-w-[calc(100%-2rem)] rounded-xl p-8 sm:max-w-[560px]">
        <div className="flex flex-col gap-6">
          <div
            className={`flex h-24 w-24 items-center justify-center rounded-full ${bgColor}`}
          >
            <Icon className={`h-12 w-12 stroke-[2.5] ${iconColor}`} aria-hidden />
          </div>

          <div className="gap-4 text-left">
            <h2 className="text-2xl font-medium text-mds-black-900">{content.title}</h2>
            {content.description ? (
              <p className="mt-4 text-base font-medium text-mds-black-800">
                {content.description}
              </p>
            ) : null}
          </div>

          {content.bullets && content.bullets.length > 0 ? (
            <ul className="flex flex-col gap-2 text-base text-mds-black-700">
              {content.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <span className="text-base font-medium text-mds-black-800">•</span>
                  <span className="text-base font-medium text-mds-black-800">{bullet}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {Boolean(content.showTimer) && currentRemainingTime ? (
            <div className="flex items-center gap-3 rounded-lg bg-mds-secondary-50 px-4 py-3">
              <Clock className="h-6 w-6 shrink-0 text-mds-secondary-600" aria-hidden />
              <p className="text-base font-medium text-mds-black-900">
                {t('remainingTime')}: {currentRemainingTime}
              </p>
            </div>
          ) : null}

          {status === 'ready-download' && orderId && awbNumber ? (
            <div className="flex flex-col gap-2 rounded-lg bg-mds-success-50 p-4">
              <p className="text-base font-medium text-mds-black-900">
                {t('orderId')}: {orderId}
              </p>
              <p className="text-base font-medium text-mds-black-900">
                {t('awbNumber')}: {awbNumber}
              </p>
            </div>
          ) : null}

          {status === 'ready-download' ? (
            <Button
              type="button"
              onClick={onDownload}
              className="w-full bg-mds-primary-100 py-6 text-base font-medium text-mds-primary-700 hover:bg-mds-primary-200"
            >
              {t('downloadAndPrint')}
            </Button>
          ) : null}

          <div className="flex flex-col gap-3">
            {status === 'delay' || status === 'generating' ? (
              <Button
                type="button"
                onClick={onClose}
                variant="tertiary"
                className="ml-auto border-2 border-mds-black-300 px-8 py-6 text-base font-medium text-mds-black-700 hover:bg-mds-black-50"
              >
                {t('buttons.checkBackLater')}
              </Button>
            ) : null}

            {status === 'ready-download' ? (
              <Button
                type="button"
                onClick={onClose}
                variant="tertiary"
                className="ml-auto border-2 border-mds-black-300 px-8 py-6 text-base font-medium text-mds-black-700 hover:bg-mds-black-50"
              >
                {t('buttons.close')}
              </Button>
            ) : null}
          </div>
        </div>
      </Popup.Content>
    </Popup>
  );
}
