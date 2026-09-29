'use client';

import { Button, Popup } from '@merit-incentives/ui/components';
import { AlertCircle, FileText } from 'lucide-react';

import { useLocalization } from '@/hooks/useLocalization';

interface RequestAwbConfirmPopupProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export function RequestAwbConfirmPopup({
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}: Readonly<RequestAwbConfirmPopupProps>) {
  const { translate } = useLocalization('order-details');

  const bullets = [
    translate('requestAwbPopup.bullet1'),
    translate('requestAwbPopup.bullet2'),
  ];

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      className="w-[612px] max-w-[calc(100%-2rem)]"
    >
      <Popup.Header onClose={onClose} className="px-6 pt-5 pb-2">
        <div className="flex flex-col gap-4">
          <div className="flex w-fit rounded-lg bg-[#FFF7E6] p-3">
            <FileText className="h-6 w-6 text-[#B45309]" aria-hidden />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-medium text-mds-black-900">
              {translate('requestAwbPopup.title')}
            </h2>
            <p className="text-sm font-medium text-mds-black-700">
              {translate('requestAwbPopup.description')}
            </p>
          </div>
        </div>
      </Popup.Header>
      <Popup.Content className="w-full px-6 pb-5 pt-0">
        <div className="space-y-5">
          <ul className="flex flex-col gap-2">
            {bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex gap-2 text-base font-medium text-mds-black-800"
              >
                <span aria-hidden>•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          <div className="flex gap-3 rounded-lg bg-[#FFF7E6] p-4">
            <AlertCircle
              className="h-5 w-5 shrink-0 text-[#B45309]"
              aria-hidden
            />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-mds-black-900">
                {translate('requestAwbPopup.important')}
              </p>
              <p className="text-sm font-medium text-mds-black-700">
                {translate('requestAwbPopup.infoText')}
              </p>
            </div>
          </div>
        </div>
      </Popup.Content>
      <Popup.Footer className="px-6 py-5">
        <div className="flex w-full gap-4">
          <Button
            type="button"
            onClick={onClose}
            variant="tertiary"
            disabled={isLoading}
            className="w-full border-2 border-mds-black-300 bg-transparent py-6 text-base font-medium text-mds-black-700 hover:bg-mds-black-50"
          >
            {translate('requestAwbPopup.cancel')}
          </Button>
          <Button
            type="button"
            onClick={() => {
              void onConfirm();
            }}
            loading={isLoading}
            disabled={isLoading}
            className="w-full bg-mds-primary-600 py-6 text-base font-medium text-white hover:bg-mds-primary-700"
          >
            {translate('requestAwbPopup.confirm')}
          </Button>
        </div>
      </Popup.Footer>
    </Popup>
  );
}
