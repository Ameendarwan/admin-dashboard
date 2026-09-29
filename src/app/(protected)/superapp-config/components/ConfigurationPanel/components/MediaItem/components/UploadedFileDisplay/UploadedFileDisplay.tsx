'use client';

import { CloudUpload, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Badge, Button } from '@merit-incentives/ui';

import { UploadedFileDisplayProps } from '@/types/superApp';
import { useLocalization } from '@/hooks/useLocalization';

export default function UploadedFileDisplay({
  uploadedFile,
  imagePreview,
  isUploading,
  uploadFailed,
  uploadProgress,
  validationError,
  onDelete,
}: Readonly<UploadedFileDisplayProps>) {
  const { translate } = useLocalization('media-management');

  const getUploadStatusBadge = () => {
    if (isUploading) {
      return (
        <div className="flex gap-1 items-center">
          <CloudUpload className="w-4 h-4 text-mds-black-800" />
          <p className="font-normal text-xs text-mds-black-800">
            {translate('fileUpload.uploading')}
          </p>
        </div>
      );
    }

    if (uploadFailed) {
      return (
        <Badge color="error" size="sm">
          {translate('fileUpload.failed')}
        </Badge>
      );
    }

    return (
      <Badge color="success" size="sm">
        {translate('fileUpload.complete')}
      </Badge>
    );
  };

  return (
    <div className="bg-white flex flex-col gap-3 items-start justify-center overflow-clip p-[14px] rounded-xl w-full">
      <div className="flex items-center w-full">
        <div className="flex flex-1 items-start justify-between">
          <div className="flex gap-2 items-center">
            {/* File Thumbnail */}
            <div className="relative rounded w-8 h-8 bg-white overflow-hidden shrink-0">
              {uploadedFile.type.startsWith('image/') && imagePreview && (
                <Image
                  src={imagePreview}
                  alt={uploadedFile.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>

            {/* File Info */}
            <div className="flex flex-col gap-1 items-start justify-center">
              <p className="font-semibold text-xs text-mds-black-800">
                {uploadedFile.name}
              </p>
              <div className="flex gap-2 items-center">
                <p className="font-normal text-xs text-mds-black-800">
                  {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <p className="font-normal text-xs text-mds-black-800">|</p>
                {getUploadStatusBadge()}
              </div>
            </div>
          </div>

          {/* Delete Button */}
          <Button
            onClick={onDelete}
            className="text-mds-black-900 hover:text-mds-primary-700 bg-transparent! border-none! p-0! hover:bg-transparent! min-w-0!"
          >
            <Trash2 className="w-4 h-4 hover:text-mds-error-500" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <div className="flex gap-2 items-center w-full">
          <div className="bg-mds-primary-100 flex flex-1 flex-col h-2 items-start rounded-mds-pill">
            <div
              className="bg-mds-primary-700 h-full rounded-mds-pill transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="font-medium text-xs text-mds-black-800 text-right w-7">
            {uploadProgress}%
          </p>
        </div>
      )}

      {/* Validation Error Message */}
      {uploadFailed && validationError && (
        <div className="flex gap-1 items-center justify-center rounded-mds-pill">
          <p className="font-medium leading-[1.2] text-xs text-mds-error-500 text-center">
            {validationError}
          </p>
        </div>
      )}
    </div>
  );
}
