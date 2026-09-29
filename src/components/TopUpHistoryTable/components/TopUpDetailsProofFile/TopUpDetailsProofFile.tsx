'use client';

import { useState } from 'react';
import { LoadingSpinner, toast } from '@merit-incentives/ui';

import { DownloadIcon, FileIcon } from '@/components/icons';
import { useLocalization } from '@/hooks';
import { downloadAttachment } from '@/lib/utils';
import {
  TOP_UP_DETAILS_EMPTY_VALUE,
  type TopUpProofFile,
} from '@/utils/walletTopUp';

interface TopUpDetailsProofFileProps {
  proofFile: TopUpProofFile | null;
}

export function TopUpDetailsProofFile({
  proofFile,
}: Readonly<TopUpDetailsProofFileProps>) {
  const { translate } = useLocalization('tenant-details.walletTopUp');
  const [isDownloading, setIsDownloading] = useState(false);

  if (!proofFile) {
    return (
      <p className="text-base font-medium text-mds-black-900">
        {TOP_UP_DETAILS_EMPTY_VALUE}
      </p>
    );
  }

  const handleDownload = async () => {
    if (!proofFile.downloadUrl || isDownloading) {
      return;
    }
    setIsDownloading(true);
    try {
      await downloadAttachment(proofFile.downloadUrl, proofFile.fileName);
    } catch {
      toast.error(translate('detailsModal.downloadError'));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-between gap-3 rounded-xl bg-white p-3.5">
      <div className="flex min-w-0 items-center gap-2">
        <span className="relative size-6 shrink-0 overflow-clip">
          <FileIcon
            className="size-full"
            width={24}
            height={24}
            fill="#201FCE"
          />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <p
            className="truncate text-xs font-semibold text-mds-black-800"
            title={proofFile.fileName}
          >
            {proofFile.fileName}
          </p>
          {proofFile.fileSizeLabel ? (
            <p className="text-xs font-normal text-mds-black-800">
              {proofFile.fileSizeLabel}
            </p>
          ) : null}
        </div>
      </div>
      {proofFile.downloadUrl ? (
        <button
          type="button"
          onClick={() => {
            void handleDownload();
          }}
          disabled={isDownloading}
          className="relative flex size-5 shrink-0 cursor-pointer items-center justify-center overflow-clip disabled:cursor-not-allowed"
          aria-label={translate('detailsModal.download')}
          aria-busy={isDownloading}
        >
          {isDownloading ? (
            <LoadingSpinner
              size="md"
              aria-label={translate('detailsModal.download')}
            />
          ) : (
            <DownloadIcon
              className="size-full"
              width={20}
              height={20}
              fill="#201FCE"
            />
          )}
        </button>
      ) : null}
    </div>
  );
}
