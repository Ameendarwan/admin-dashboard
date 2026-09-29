'use client';

import { Badge, Button, Popup } from '@merit-incentives/ui';

import { useLocalization } from '@/hooks';
import {
  TOP_UP_DETAILS_EMPTY_VALUE,
  topUpStatusBadgeColor,
  type TopUpDetailsViewModel,
} from '@/utils/walletTopUp';

import { TopUpDetailsProofFile } from '../TopUpDetailsProofFile';

interface TopUpDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: TopUpDetailsViewModel | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function TopUpDetailsModal({
  isOpen,
  onClose,
  details,
  isLoading,
  isError,
  onRetry,
}: Readonly<TopUpDetailsModalProps>) {
  const { translate } = useLocalization('tenant-details.walletTopUp');

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      className="w-[min(100%,42rem)] max-w-[calc(100vw-2rem)]"
    >
      <Popup.Header onClose={onClose} showDivider className="px-6 py-5">
        <h2 className="text-2xl font-semibold text-mds-black-900">
          {translate('detailsModal.title')}
        </h2>
      </Popup.Header>

      <Popup.Content className="max-h-[min(80vh,40rem)] overflow-y-auto p-6">
        <div className="flex flex-col gap-6">
          {isError ? (
            <div
              className="flex flex-col items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3"
              role="alert"
            >
              <p className="text-sm text-red-700">
                {translate('history.actions.detailError')}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onRetry}
              >
                {translate('retry')}
              </Button>
            </div>
          ) : null}

          {isLoading && !details ? (
            <p className="text-sm text-mds-black-600" aria-live="polite">
              {translate('reviewModals.detail.loading')}
            </p>
          ) : null}

          {details ? (
            <>
              <section className="flex w-full flex-col gap-4 rounded-mds-md bg-mds-bg-light-50 p-5">
                <h3 className="text-lg font-medium text-mds-black-900">
                  {translate('detailsModal.sectionTitle')}
                </h3>
                <dl className="flex flex-col gap-4">
                  {details.fields.map((field) => (
                    <div
                      key={field.key}
                      className="flex items-start justify-between gap-4"
                    >
                      <dt className="text-base font-normal text-mds-black-900">
                        {field.label}
                      </dt>
                      <dd className="text-right">
                        {field.kind === 'status' ? (
                          <Badge
                            color={topUpStatusBadgeColor(field.status)}
                            size="sm"
                          >
                            {field.value}
                          </Badge>
                        ) : field.kind === 'badge' ? (
                          <Badge color="primary" size="lg">
                            {field.value}
                          </Badge>
                        ) : (
                          <span className="text-base font-medium text-mds-black-900">
                            {field.value || TOP_UP_DETAILS_EMPTY_VALUE}
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="flex w-full flex-col gap-5 rounded-mds-md bg-mds-bg-light-50 p-5">
                <h3 className="text-lg font-medium text-mds-black-900">
                  {translate('detailsModal.proofTitle')}
                </h3>
                <TopUpDetailsProofFile proofFile={details.proofFile} />
              </section>
            </>
          ) : null}
        </div>
      </Popup.Content>
    </Popup>
  );
}
