'use client';

import { ContentCard, Table } from '@merit-incentives/ui';

import type { DeveloperApiKeyRow } from '@/mock/rewardsPortalDeveloperApi';

import { useDeveloperApiTab } from '../../hooks/useDeveloperApiTab';
import { DeveloperApiKeyConfirmModal } from './components';

export function DeveloperApiTab() {
  const {
    translate,
    columns,
    rows,
    confirmOpen,
    confirmActionType,
    closeConfirm,
    confirmAction,
  } = useDeveloperApiTab();

  return (
    <>
      <ContentCard className="overflow-visible rounded-mds-md border border-mds-black-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-5">
          <h2 className="text-xl font-medium leading-[1.2] text-mds-black-900">
            {translate('developerApi.title')}
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
              getRowId={(row: DeveloperApiKeyRow) => row.id}
              showRowMenu={false}
              emptyText={translate('developerApi.empty')}
            />
          </div>
        </div>
      </ContentCard>

      <DeveloperApiKeyConfirmModal
        open={confirmOpen}
        action={confirmActionType}
        onClose={closeConfirm}
        onConfirm={confirmAction}
      />
    </>
  );
}
