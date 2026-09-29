'use client';

import type { ReactNode } from 'react';
import { Button, Popup } from '@merit-incentives/ui';

import { useLocalization } from '@/hooks';

import type { FloatTopUpDetailRow } from '../FloatTopUpDetailRows';
import { FloatTopUpDetailRows } from '../FloatTopUpDetailRows';
import { FloatTopUpDetailStatus } from '../FloatTopUpDetailStatus';

interface FloatTopUpReviewModalLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  subtitle?: string;
  rows: FloatTopUpDetailRow[];
  detailStatus?: {
    isLoading: boolean;
    isError: boolean;
    isReady?: boolean;
    showIncomplete?: boolean;
    onRetry: () => void;
  };
  children?: ReactNode;
  actions: ReactNode;
  isCancelDisabled?: boolean;
  contentClassName?: string;
}

export function FloatTopUpReviewModalLayout({
  isOpen,
  onClose,
  title,
  description,
  subtitle,
  rows,
  detailStatus,
  children,
  actions,
  isCancelDisabled = false,
  contentClassName = 'px-6 py-5',
}: Readonly<FloatTopUpReviewModalLayoutProps>) {
  const { translate } = useLocalization('tenant-details.walletTopUp');

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      className="w-[min(100%,40rem)] max-w-[calc(100vw-2rem)]"
    >
      <Popup.Header onClose={onClose} showDivider className="px-6 py-5">
        <h2 className="text-xl font-semibold text-mds-black-900">{title}</h2>
      </Popup.Header>

      <Popup.Content className={contentClassName}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-mds-black-700">{description}</p>
            {subtitle ? (
              <p className="text-sm text-mds-black-500">{subtitle}</p>
            ) : null}
          </div>

          <FloatTopUpDetailRows rows={rows} />

          {detailStatus ? <FloatTopUpDetailStatus {...detailStatus} /> : null}

          {children}
        </div>
      </Popup.Content>

      <Popup.Footer className="border-t border-mds-black-100 px-6 py-5">
        <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isCancelDisabled}
            className="w-full border-0 bg-mds-primary-100 font-medium text-mds-primary-700 hover:bg-mds-primary-200 sm:w-auto sm:min-w-28"
          >
            {translate('reviewModals.actions.cancel')}
          </Button>
          {actions}
        </div>
      </Popup.Footer>
    </Popup>
  );
}
