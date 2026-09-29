'use client';

import { Upload } from 'lucide-react';

import { FileUploadAreaProps } from '@/types/superApp';
import { useLocalization } from '@/hooks/useLocalization';

export default function FileUploadArea({
  fileInputRef,
  onFileChange,
  onDrop,
  onDragOver,
}: Readonly<FileUploadAreaProps>) {
  const { translate } = useLocalization('media-management');

  return (
    <label
      htmlFor="file-upload"
      onDrop={onDrop}
      onDragOver={onDragOver}
      className="bg-white border-mds-black-100 border-[1.5px] border-dashed flex gap-3 h-35 items-center overflow-clip p-[14px] rounded-xl w-full cursor-pointer hover:border-mds-primary-700 transition-colors"
    >
      <div className="flex flex-col gap-3 items-center justify-center flex-1">
        <Upload className="w-6 h-6 text-mds-primary-700" />
        <p className="text-sm text-center">
          <span className="font-semibold text-mds-primary-700">
            {translate('fileUpload.clickToUpload')}
          </span>
          <span className="font-normal text-mds-black-900">
            {' '}
            {translate('fileUpload.dragAndDrop')}
          </span>
        </p>
        <p className="font-medium text-xs text-mds-black-800 text-center">
          {translate('fileUpload.fileFormats')}
        </p>
      </div>
      <input
        ref={fileInputRef}
        id="file-upload"
        type="file"
        className="hidden"
        onChange={onFileChange}
        accept="image/jpeg,image/png,image/webp"
      />
    </label>
  );
}
