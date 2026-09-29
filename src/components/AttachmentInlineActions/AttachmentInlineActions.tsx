'use client';

import { EyeIcon as MeritEyeIcon } from '@merit-incentives/ui';
import { EyeIcon as LucideEyeIcon, Loader2 } from 'lucide-react';
import React from 'react';

import { DownloadIcon } from '@/components/icons';

const buttonClassName =
  'cursor-pointer rounded p-1 text-mds-black-600 transition-colors hover:text-mds-primary-600 disabled:cursor-not-allowed disabled:opacity-40';

export type AttachmentEyeIconStyle = 'lucide' | 'merit';

export type AttachmentInlineActionsProps = {
  viewAriaLabel: string;
  downloadAriaLabel: string;
  hasFile: boolean;
  isViewLoading: boolean;
  isDownloadLoading: boolean;
  onView: () => void;
  onDownload: () => void;
  /** Seller flows use Lucide; tenant review uses the design-system merit icon. */
  eyeIconStyle?: AttachmentEyeIconStyle;
};

export function AttachmentInlineActions({
  viewAriaLabel,
  downloadAriaLabel,
  hasFile,
  isViewLoading,
  isDownloadLoading,
  onView,
  onDownload,
  eyeIconStyle = 'lucide',
}: Readonly<AttachmentInlineActionsProps>) {
  const viewDisabled = !hasFile || isViewLoading || isDownloadLoading;
  const downloadDisabled = !hasFile || isDownloadLoading || isViewLoading;
  const ViewGlyph = eyeIconStyle === 'merit' ? MeritEyeIcon : LucideEyeIcon;

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        className={buttonClassName}
        onClick={() => {
          onView();
        }}
        disabled={viewDisabled}
        aria-label={viewAriaLabel}
        aria-busy={isViewLoading}
      >
        {isViewLoading ? (
          <Loader2
            className="h-5 w-5 animate-spin text-mds-primary-600"
            aria-hidden
          />
        ) : (
          <ViewGlyph className="h-5 w-5" aria-hidden />
        )}
      </button>
      <button
        type="button"
        className={buttonClassName}
        onClick={() => {
          onDownload();
        }}
        disabled={downloadDisabled}
        aria-label={downloadAriaLabel}
        aria-busy={isDownloadLoading}
      >
        {isDownloadLoading ? (
          <Loader2
            className="h-5 w-5 animate-spin text-mds-primary-600"
            aria-hidden
          />
        ) : (
          <DownloadIcon
            className="h-5 w-5"
            fill="currentColor"
            width={20}
            height={20}
          />
        )}
      </button>
    </div>
  );
}
