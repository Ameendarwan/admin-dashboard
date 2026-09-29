'use client';

import { Badge, InputField } from '@merit-incentives/ui';
import { File, Trash2, Upload } from 'lucide-react';
import React, { useRef } from 'react';

interface FileUploadProps {
  label: string;
  file: File | null | undefined;
  onFileChange: (file: File | null) => void;
  error?: string;
  accept?: string;
  required?: boolean;
  maxSizeInMB?: number;
  uploadText?: string;
  dragDropText?: string;
  requirementsText?: string;
  fileCompleteText?: string;
}

export function FileUpload({
  label,
  file,
  onFileChange,
  error,
  accept = '.pdf,image/*',
  required = false,
  maxSizeInMB = 5,
  uploadText = 'Click to upload',
  dragDropText = 'or drag and drop',
  requirementsText = 'PDF or Image (max. 5MB)',
  fileCompleteText = 'Complete',
}: Readonly<FileUploadProps>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileSizeError, setFileSizeError] = React.useState<string | null>(null);

  const validateFileSize = (selectedFile: File): boolean => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (selectedFile.size > maxSizeInBytes) {
      setFileSizeError(
        `File size exceeds the maximum limit of ${maxSizeInMB}MB. Please select a smaller file.`,
      );
      return false;
    }
    setFileSizeError(null);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      if (validateFileSize(selectedFile)) {
        onFileChange(selectedFile);
      } else if (fileInputRef.current) {
        // Clear the input value so the same file can be selected again
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (validateFileSize(selectedFile)) {
        onFileChange(selectedFile);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const handleDeleteFile = () => {
    onFileChange(null);
    setFileSizeError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor="file-upload"
        className="block text-sm font-medium text-mds-black-400"
      >
        {label} {required && <span className="text-mds-error-500">*</span>}
      </label>

      <div className="border-[1.5px] border-dashed border-mds-black-100 rounded-lg p-6 bg-mds-white">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-transparent">
            <Upload className="w-5 h-5 text-mds-primary-700" />
          </div>
          <p className="text-sm text-mds-black-900 mb-1">
            <span className="text-mds-primary-700 font-medium">
              {uploadText}
            </span>{' '}
            {dragDropText}
          </p>
          <p className="text-xs text-mds-black-800 font-medium">
            {requirementsText}
          </p>
          <InputField
            ref={fileInputRef}
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept={accept}
          />
        </label>
      </div>

      {(error || fileSizeError) && (
        <p className="text-sm text-mds-error-500">{error || fileSizeError}</p>
      )}

      {file && (
        <div className="mt-4 rounded-lg p-4 bg-mds-bg-light-50 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <File className="w-5 h-5 text-mds-black-900" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-mds-black-800 truncate">
                {file.name}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-mds-black-800">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <span className="text-xs text-mds-black-800">|</span>
                <Badge color="success" size="sm">
                  {fileCompleteText}
                </Badge>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDeleteFile}
            className="p-2 hover:bg-mds-black-50 rounded-lg transition-colors"
            aria-label="Delete file"
          >
            <Trash2 className="w-4 h-4 text-mds-black-600 cursor-pointer" />
          </button>
        </div>
      )}
    </div>
  );
}
