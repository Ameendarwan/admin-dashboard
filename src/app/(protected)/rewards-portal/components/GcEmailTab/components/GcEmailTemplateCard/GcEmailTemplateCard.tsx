'use client';

import { Badge, Button, ContentCard } from '@merit-incentives/ui';
import {
  Check,
  Download,
  Eye,
  ExternalLink,
  FileCode2,
  Link2,
  X,
} from 'lucide-react';

import { formatDateForDisplay } from '@/hooks';
import {
  GC_EMAIL_TEMPLATE_STATUS,
  type GcEmailTemplateMock,
} from '@/mock/rewardsPortalGcEmail';

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

interface GcEmailTemplateCardProps {
  template: GcEmailTemplateMock;
  isPending: boolean;
  translate: TranslateFn;
  onApprove: () => void;
  onReject: () => void;
  onPreviewTemplate: () => void;
  onDownload: () => void;
  onOpenPreviewLink: () => void;
}

function statusBadge(
  status: GcEmailTemplateMock['status'],
  translate: TranslateFn,
) {
  if (status === GC_EMAIL_TEMPLATE_STATUS.APPROVED) {
    return (
      <Badge color="success" leftIcon size="lg" className="whitespace-nowrap">
        {translate('gcEmail.status.approved')}
      </Badge>
    );
  }
  if (status === GC_EMAIL_TEMPLATE_STATUS.REJECTED) {
    return (
      <Badge color="error" leftIcon size="lg" className="whitespace-nowrap">
        {translate('gcEmail.status.rejected')}
      </Badge>
    );
  }
  return (
    <Badge color="warning" leftIcon size="lg" className="whitespace-nowrap">
      {translate('gcEmail.status.pending')}
    </Badge>
  );
}

export function GcEmailTemplateCard({
  template,
  isPending,
  translate,
  onApprove,
  onReject,
  onPreviewTemplate,
  onDownload,
  onOpenPreviewLink,
}: Readonly<GcEmailTemplateCardProps>) {
  return (
    <ContentCard className="overflow-visible rounded-mds-md border border-mds-black-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-medium leading-[1.2] text-mds-black-900">
          {translate('gcEmail.title')}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-mds-black-500">
              {translate('gcEmail.fields.templateName')}
            </span>
            <span className="text-base font-medium text-mds-black-900">
              {template.templateName}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-mds-black-500">
              {translate('gcEmail.fields.submittedOn')}
            </span>
            <span className="text-base font-medium text-mds-black-900">
              {formatDateForDisplay(template.submittedOn)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-mds-black-500">
              {translate('gcEmail.fields.submittedBy')}
            </span>
            <span className="text-base font-medium text-mds-black-900">
              {template.submittedBy}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-mds-black-500">
              {translate('gcEmail.fields.status')}
            </span>
            {statusBadge(template.status, translate)}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-mds-black-800">
              {translate('gcEmail.fields.emailTemplate')}
            </span>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-mds-black-100 bg-white px-3 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <FileCode2
                  className="h-6 w-6 shrink-0 text-mds-black-600"
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="truncate text-base font-medium text-mds-black-900">
                    {template.fileName}
                  </p>
                  <p className="text-sm text-mds-black-500">
                    {template.fileSizeLabel}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={onDownload}
                  className="rounded-lg p-2 text-mds-black-600 hover:bg-mds-black-50 hover:text-mds-black-900"
                  aria-label={translate('gcEmail.actions.download')}
                >
                  <Download className="h-5 w-5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={onPreviewTemplate}
                  className="rounded-lg p-2 text-mds-black-600 hover:bg-mds-black-50 hover:text-mds-black-900"
                  aria-label={translate('gcEmail.actions.preview')}
                >
                  <Eye className="h-5 w-5" aria-hidden />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-mds-black-800">
              {translate('gcEmail.fields.previewLink')}
            </span>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-mds-black-100 bg-white px-3 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <Link2
                  className="h-6 w-6 shrink-0 text-mds-black-600"
                  aria-hidden
                />
                <p className="truncate text-base font-medium text-mds-black-900">
                  {template.previewLink}
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenPreviewLink}
                className="rounded-lg p-2 text-mds-black-600 hover:bg-mds-black-50 hover:text-mds-black-900"
                aria-label={translate('gcEmail.actions.openLink')}
              >
                <ExternalLink className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        {isPending ? (
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="tertiary"
              size="sm"
              leftIcon={<X className="h-4 w-4" aria-hidden />}
              onClick={onReject}
              className="border border-mds-error-500 text-mds-error-500"
            >
              {translate('gcEmail.actions.reject')}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              leftIcon={<Check className="h-4 w-4" aria-hidden />}
              onClick={onApprove}
            >
              {translate('gcEmail.actions.approve')}
            </Button>
          </div>
        ) : null}
      </div>
    </ContentCard>
  );
}
