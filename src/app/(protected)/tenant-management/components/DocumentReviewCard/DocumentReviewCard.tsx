'use client';

import React, { useState } from 'react';
import { toast } from '@merit-incentives/ui';

import { AttachmentInlineActions } from '@/components/AttachmentInlineActions';
import { ReviewMode } from '@/lib/enums';
import { useLocalization } from '@/hooks/useLocalization';
import { FileIcon } from '@/components/icons';
import { downloadAttachment, openFetchedUrlInNewTab } from '@/lib/utils';
import type { RevisionFieldCallbacks } from '@/types/review';

import { RevisionRequestSection } from '../RevisionRequestSection';
import { useRevisionRequest } from '../../hooks/useRevisionRequest';

type DocumentReviewCardProps = {
  label: string;
  fileName: string;
  fieldPath: string;
  filePath: string;
  downloadUrl: string;
  mode: ReviewMode;
  onRevisionRequest: RevisionFieldCallbacks['onRevisionRequest'];
  onRevisionClear: RevisionFieldCallbacks['onRevisionClear'];
};

export function DocumentReviewCard({
  label,
  fileName,
  fieldPath,
  filePath,
  downloadUrl,
  mode,
  onRevisionRequest,
  onRevisionClear,
}: Readonly<DocumentReviewCardProps>) {
  const { translate } = useLocalization('document-review-card');
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [isDownloadLoading, setIsDownloadLoading] = useState(false);
  const {
    isRevisionRequested,
    revisionReason,
    handleRevisionChange,
    handleReasonChange,
  } = useRevisionRequest({
    fieldPath,
    mode,
    onRevisionRequest,
    onRevisionClear,
  });

  const handleViewFile = async () => {
    if (!filePath || !downloadUrl || isViewLoading) return;
    setIsViewLoading(true);
    try {
      await openFetchedUrlInNewTab(downloadUrl);
    } catch {
      toast.error(translate('viewOpenFailed'));
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleDownloadFile = async () => {
    if (!filePath || !downloadUrl || isDownloadLoading) return;
    setIsDownloadLoading(true);
    try {
      await downloadAttachment(downloadUrl, fileName);
    } catch {
      toast.error(translate('downloadFailed'));
    } finally {
      setIsDownloadLoading(false);
    }
  };

  const isRevisionMode = mode === ReviewMode.REVISION;
  const hasFile = Boolean(filePath);

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
            {fileName}
          </span>
          <AttachmentInlineActions
            viewAriaLabel={translate('viewFile')}
            downloadAriaLabel={translate('downloadFile')}
            hasFile={hasFile}
            isViewLoading={isViewLoading}
            isDownloadLoading={isDownloadLoading}
            onView={handleViewFile}
            onDownload={handleDownloadFile}
            eyeIconStyle="merit"
          />
        </div>
      </div>

      {isRevisionMode && (
        <div className="mt-3">
          <RevisionRequestSection
            isRevisionRequested={isRevisionRequested}
            revisionReason={revisionReason}
            onRevisionChange={handleRevisionChange}
            onReasonChange={handleReasonChange}
            requestRevisionLabel={translate('requestRevision')}
            reasonPlaceholder={translate('placeholder')}
          />
        </div>
      )}
    </div>
  );
}
