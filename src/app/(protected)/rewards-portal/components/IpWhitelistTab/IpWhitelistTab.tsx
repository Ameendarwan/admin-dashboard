'use client';

import { Button, ContentCard, Table } from '@merit-incentives/ui';

import type { PendingProductionIpRowApi } from '@/types/rewards-portal/certificationApi';

import { useIpWhitelistTab } from '../../hooks/useIpWhitelistTab';
import { IpWhitelistApproveModal, IpWhitelistRejectDialog } from './components';

interface IpWhitelistTabProps {
  tenantId: string;
}

export function IpWhitelistTab({ tenantId }: Readonly<IpWhitelistTabProps>) {
  const {
    translate,
    columns,
    rows,
    loading,
    error,
    retrying,
    onRetry,
    safelistColumns,
    safelistRows,
    safelistLoading,
    safelistError,
    safelistRetrying,
    onSafelistRetry,
    activeDialog,
    selectedRow,
    rejectionReason,
    setRejectionReason,
    closeDialog,
    confirmApprove,
    confirmReject,
    isDeciding,
  } = useIpWhitelistTab({ tenantId });

  return (
    <>
      <div className="flex flex-col gap-6">
        <ContentCard className="overflow-visible rounded-mds-md border border-mds-black-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-5">
            <h2 className="text-xl font-medium leading-[1.2] text-mds-black-900">
              {translate('ipWhitelist.pending.title')}
            </h2>

            <div
              className="relative -mx-4 overflow-visible"
              style={{ zIndex: 10 }}
            >
              <Table
                className="w-full [&_tbody_tr]:border-mds-black-100 [&_td]:px-3 [&_td]:py-3 sm:[&_td]:px-4 sm:[&_td]:py-3.5 [&_th]:whitespace-nowrap [&_th]:px-3 [&_th]:py-3 sm:[&_th]:px-4 [&_th]:text-sm [&_th]:font-semibold [&_th]:text-mds-black-600 [&_thead_tr]:bg-mds-black-50"
                columns={columns}
                data={rows}
                showSearch={false}
                showPagination={false}
                size="md"
                background="white"
                rounded={false}
                shadow={false}
                showCheckboxes={false}
                getRowId={(row: PendingProductionIpRowApi) => row.id}
                showRowMenu={false}
                emptyText={
                  error
                    ? translate('ipWhitelist.pending.loadError')
                    : translate('ipWhitelist.pending.empty')
                }
                loading={loading}
              />
            </div>

            {error ? (
              <div className="px-4 flex justify-center">
                <Button
                  variant="secondary"
                  type="button"
                  loading={retrying}
                  disabled={retrying}
                  onClick={() => {
                    onRetry();
                  }}
                >
                  {translate('ipWhitelist.pending.retry')}
                </Button>
              </div>
            ) : null}
          </div>
        </ContentCard>

        <ContentCard className="overflow-visible rounded-mds-md border border-mds-black-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-5">
            <h2 className="text-xl font-medium leading-[1.2] text-mds-black-900">
              {translate('ipWhitelist.safelist.title')}
            </h2>

            <div
              className="relative -mx-4 overflow-visible"
              style={{ zIndex: 10 }}
            >
              <Table
                className="w-full [&_tbody_tr]:border-mds-black-100 [&_td]:px-3 [&_td]:py-3 sm:[&_td]:px-4 sm:[&_td]:py-3.5 [&_th]:whitespace-nowrap [&_th]:px-3 [&_th]:py-3 sm:[&_th]:px-4 [&_th]:text-sm [&_th]:font-semibold [&_th]:text-mds-black-600 [&_thead_tr]:bg-mds-black-50"
                columns={safelistColumns}
                data={safelistRows}
                showSearch={false}
                showPagination={false}
                size="md"
                background="white"
                rounded={false}
                shadow={false}
                showCheckboxes={false}
                getRowId={(row: PendingProductionIpRowApi) => row.id}
                showRowMenu={false}
                emptyText={
                  safelistError
                    ? translate('ipWhitelist.safelist.loadError')
                    : translate('ipWhitelist.safelist.empty')
                }
                loading={safelistLoading}
              />
            </div>

            {safelistError ? (
              <div className="px-4 flex justify-center">
                <Button
                  variant="secondary"
                  type="button"
                  loading={safelistRetrying}
                  disabled={safelistRetrying}
                  onClick={() => {
                    onSafelistRetry();
                  }}
                >
                  {translate('ipWhitelist.safelist.retry')}
                </Button>
              </div>
            ) : null}
          </div>
        </ContentCard>
      </div>

      <IpWhitelistApproveModal
        open={activeDialog === 'approve'}
        ipAddress={selectedRow?.ipAddress ?? null}
        isLoading={isDeciding}
        onClose={closeDialog}
        onConfirm={confirmApprove}
      />

      <IpWhitelistRejectDialog
        isOpen={activeDialog === 'reject'}
        row={selectedRow}
        reason={rejectionReason}
        onReasonChange={setRejectionReason}
        onClose={closeDialog}
        onConfirm={confirmReject}
        isSubmitting={isDeciding}
      />
    </>
  );
}
