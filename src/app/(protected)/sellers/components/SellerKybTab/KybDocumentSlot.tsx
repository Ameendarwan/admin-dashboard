'use client';

import { toast } from '@merit-incentives/ui';
import React, { useState } from 'react';

import { AttachmentInlineActions } from '@/components/AttachmentInlineActions';
import { FileIcon } from '@/components/icons';
import { downloadAttachment, openFetchedUrlInNewTab } from '@/lib/utils';
import type { Attachment } from '@/types/tenantManagement';

interface KybDocumentSlotProps {
  readonly label: string;
  readonly attachment: Attachment;
  readonly notProvidedLabel: string;
  readonly viewLabel: string;
  readonly downloadLabel: string;
  readonly downloadFailedMessage: string;
  readonly viewOpenFailedMessage: string;
}

export function KybDocumentSlot({
  label,
  attachment,
  notProvidedLabel,
  viewLabel,
  downloadLabel,
  downloadFailedMessage,
  viewOpenFailedMessage,
}: Readonly<KybDocumentSlotProps>) {
  const displayFileName = attachment.fileName?.trim() || notProvidedLabel;
  const downloadUrl = attachment.downloadUrl?.trim() || '';
  const filePath = attachment.filePath?.trim() || '';
  const hasFile = Boolean(downloadUrl && filePath);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [isDownloadLoading, setIsDownloadLoading] = useState(false);

  const handleView = async () => {
    if (!downloadUrl || isViewLoading) return;
    setIsViewLoading(true);
    try {
      await openFetchedUrlInNewTab(downloadUrl);
    } catch {
      toast.error(viewOpenFailedMessage);
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl || isDownloadLoading) return;
    const nameForSave = attachment.fileName?.trim() || 'document';
    setIsDownloadLoading(true);
    try {
      await downloadAttachment(downloadUrl, nameForSave);
    } catch {
      toast.error(downloadFailedMessage);
    } finally {
      setIsDownloadLoading(false);
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="text-sm font-medium text-mds-black-600">{label}</span>
      <div className="rounded-lg border border-mds-black-100 bg-mds-black-50/60 p-3">
        <div className="flex items-center gap-3 rounded-lg border border-mds-black-100 bg-white px-3 py-3">
          <FileIcon
            className="h-5 w-5 shrink-0 text-mds-black-600"
            fill="currentColor"
            width={20}
            height={20}
          />
          <span className="min-w-0 flex-1 truncate text-sm text-mds-black-700">
            {displayFileName}
          </span>
          <AttachmentInlineActions
            viewAriaLabel={viewLabel}
            downloadAriaLabel={downloadLabel}
            hasFile={hasFile}
            isViewLoading={isViewLoading}
            isDownloadLoading={isDownloadLoading}
            onView={handleView}
            onDownload={handleDownload}
            eyeIconStyle="lucide"
          />
        </div>
      </div>
    </div>
  );
}
