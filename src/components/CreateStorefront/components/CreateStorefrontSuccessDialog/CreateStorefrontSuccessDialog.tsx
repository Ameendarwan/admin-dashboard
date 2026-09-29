'use client';

import { Button, Popup } from '@merit-incentives/ui/components';
import { CircleCheck } from 'lucide-react';

import type { StorefrontSuccessSummary } from '@/types/createStorefrontForm';
import { formatStorefrontPublicHost } from '@/lib/storefrontUtils';

type CreateStorefrontSuccessDialogProps = Readonly<{
  isOpen: boolean;
  summary: StorefrontSuccessSummary | null;
  onClose: () => void;
  onGoToManagement: () => void;
  translate: (key: string, values?: Record<string, string | number>) => string;
}>;

function SummaryRow({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-mds-black-600">{label}</span>
      <span className="font-medium break-words text-mds-black-900 sm:text-end">
        {value}
      </span>
    </div>
  );
}

export function CreateStorefrontSuccessDialog({
  isOpen,
  summary,
  onClose,
  onGoToManagement,
  translate,
}: CreateStorefrontSuccessDialogProps) {
  if (!summary) {
    return null;
  }

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      className="w-[calc(100vw-2rem)] max-w-xl p-2 sm:w-full"
    >
      <Popup.Header onClose={onClose}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mds-success-100">
          <CircleCheck className="h-8 w-8 text-mds-success-500" />
        </div>
      </Popup.Header>
      <Popup.Content>
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-mds-black-900 sm:text-2xl">
            {translate('create.success.title')}
          </h2>

          <div className="space-y-3 rounded-xl bg-mds-primary-50 px-4 py-4 sm:px-5">
            <h3 className="text-sm font-semibold text-mds-black-900">
              {translate('create.success.storefrontDetails')}
            </h3>
            <SummaryRow
              label={translate('create.success.storefrontName')}
              value={summary.storefrontName}
            />
            <SummaryRow
              label={translate('create.success.subdomain')}
              value={formatStorefrontPublicHost(summary.urlSlug)}
            />
            <SummaryRow
              label={translate('create.success.tenant')}
              value={summary.tenantName}
            />
          </div>

          <div className="space-y-3 rounded-xl bg-mds-primary-50 px-4 py-4 sm:px-5">
            <SummaryRow
              label={translate('create.success.totalProducts')}
              value={summary.totalProducts.toLocaleString()}
            />
            {summary.categoryNames.length > 0 ? (
              <SummaryRow
                label={translate('create.steps.categoryBundles.label')}
                value={summary.categoryNames.join(', ')}
              />
            ) : null}
          </div>
        </div>
      </Popup.Content>
      <Popup.Footer>
        <Button
          type="button"
          variant="primary"
          size="md"
          className="w-full"
          onClick={onGoToManagement}
        >
          {translate('create.success.goToManagement')}
        </Button>
      </Popup.Footer>
    </Popup>
  );
}
