'use client';

import { toast } from '@merit-incentives/ui';
import React, { useState } from 'react';

import { AttachmentInlineActions } from '@/components/AttachmentInlineActions';
import { FileIcon } from '@/components/icons';
import { downloadAttachment, openFetchedUrlInNewTab } from '@/lib/utils';
import type { SellerStoreBrandingFile } from '@/types/seller';

import { resolveBrandingFile } from './storeBranding';

interface StoreDocumentSlotProps {
  readonly label: string;
  readonly emptyLabel: string;
  readonly viewLabel: string;
  readonly downloadLabel: string;
  readonly downloadFailedMessage: string;
  readonly viewOpenFailedMessage: string;
  readonly asset: SellerStoreBrandingFile | null | undefined;
}

export function StoreDocumentSlot({
  label,
  emptyLabel,
  viewLabel,
  downloadLabel,
  downloadFailedMessage,
  viewOpenFailedMessage,
  asset,
}: Readonly<StoreDocumentSlotProps>) {
  const { displayName, url } = resolveBrandingFile(asset);
  const hasFile = Boolean(url && displayName);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [isDownloadLoading, setIsDownloadLoading] = useState(false);

  const handleView = async () => {
    if (!url || isViewLoading) return;
    setIsViewLoading(true);
    try {
      await openFetchedUrlInNewTab(url);
    } catch {
      toast.error(viewOpenFailedMessage);
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!url || !displayName || isDownloadLoading) return;
    setIsDownloadLoading(true);
    try {
      await downloadAttachment(url, displayName);
    } catch {
      toast.error(downloadFailedMessage);
    } finally {
      setIsDownloadLoading(false);
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="text-sm font-medium text-mds-black-600">{label}</span>
      <div className="rounded-xl bg-mds-primary-50 p-3">
        <div className="flex items-center gap-3 rounded-lg border border-mds-black-100 bg-white px-3 py-3">
          <FileIcon
            className="h-5 w-5 shrink-0 text-mds-black-600"
            fill="currentColor"
            width={20}
            height={20}
          />
          <span className="min-w-0 flex-1 truncate text-sm text-mds-black-900">
            {hasFile ? displayName : emptyLabel}
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
