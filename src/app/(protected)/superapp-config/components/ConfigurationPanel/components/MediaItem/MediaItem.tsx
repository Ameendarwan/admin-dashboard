'use client';

import Image from 'next/image';
import { Upload } from 'lucide-react';
import { LinkButton, InputField, Badge } from '@merit-incentives/ui';
import { DraggableSyntheticListeners } from '@dnd-kit/core';

import { MediaItemProps, MediaType } from '@/types/superApp';
import { MEDIA_TYPES } from '@/app/(protected)/superapp-config/constants';
import { useMediaItemUpload } from '@/app/(protected)/superapp-config/hooks';
import { useLocalization } from '@/hooks/useLocalization';

import {
  MediaItemHeader,
  FileUploadArea,
  UploadedFileDisplay,
  DeepLinkInput,
  IconLabelInput,
} from './components';

interface ExtendedMediaItemProps extends Omit<
  MediaItemProps,
  'title' | 'mediaType'
> {
  itemId: string; // Now accepts any config key
  title: string;
  mediaType: MediaType;
  mediaManagement: ReturnType<
    typeof import('../../../../hooks').useMediaManagement
  >;
  dragListeners?: DraggableSyntheticListeners;
  isDeletable?: boolean;
  onDelete?: () => void;
}

export default function MediaItem({
  itemId,
  title,
  dimensions,
  requiredWidth,
  requiredHeight,
  isExpanded,
  onToggle,
  mediaType,
  mediaManagement,
  dragListeners,
  isDeletable = false,
  onDelete,
}: Readonly<ExtendedMediaItemProps>) {
  const { translate } = useLocalization('media-management');

  // Get existing data from centralized state using the config key directly
  const currentData = mediaManagement.getMediaItem(itemId);

  // Get API config for version info
  const currentConfig = mediaManagement.apiConfigs.find(
    (c) => c.key === itemId,
  );
  const currentVersion = currentConfig?.version ?? null;

  const {
    uploadedFile,
    deepLink,
    iconLabel,
    uploadProgress,
    isUploading,
    uploadCompleted,
    uploadFailed,
    validationError,
    imagePreview,
    fileInputRef,
    setDeepLink,
    setIconLabel,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDeleteFile,
  } = useMediaItemUpload({
    requiredWidth,
    requiredHeight,
    initialFile: currentData?.file ?? null,
    initialPreview: currentData?.imagePreview ?? null,
    initialDeepLink: currentData?.deepLink ?? '',
    initialLabel: currentData?.label ?? '',
    initialIsUploaded: currentData?.isUploaded ?? false,
    itemId,
    mediaType: currentData?.type || 'banner',
    currentVersion,
    onFileUploadSuccess: (file, preview, filePath) => {
      // Update centralized state using config key
      mediaManagement.updateFile(itemId, file, preview, filePath);
    },
    onDeepLinkChange: (link) => {
      // Update centralized state using config key
      mediaManagement.updateDeepLink(itemId, link);
    },
    onLabelChange: (label) => {
      // Update centralized state for icons
      if (currentData?.type === 'icon') {
        mediaManagement.updateLabel(itemId, label);
      }
    },
    onFileDelete: () => {
      // Update centralized state using config key
      mediaManagement.deleteFile(itemId);
    },
  });

  const handleMouseEnter = () => {
    mediaManagement.setHoveredItem(itemId);
  };

  const handleMouseLeave = () => {
    mediaManagement.setHoveredItem(null);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${
        isExpanded
          ? 'bg-mds-bg-light-50 border border-mds-primary-200'
          : 'bg-mds-bg-light-50 border border-transparent'
      } flex flex-col gap-5 items-start justify-center overflow-clip px-6 py-6 rounded-mds-md w-full`}
    >
      {/* Header */}
      <MediaItemHeader
        title={title}
        dimensions={dimensions}
        isExpanded={isExpanded}
        uploadCompleted={uploadCompleted}
        onToggle={onToggle}
        mediaType={mediaType}
        dragListeners={dragListeners}
        isDeletable={isDeletable}
        onDelete={onDelete}
        hasExistingImage={
          !!(currentData?.imagePreview && currentData?.filePath)
        }
        status={currentData?.status}
        fileModified={currentData?.fileModified}
      />

      {/* Expanded Content */}
      {isExpanded && (
        <div className="flex flex-col gap-0 items-start w-full">
          {/* File Upload Section */}
          <div className="flex flex-col gap-2 items-start w-full">
            {/* Hidden file input - Always present for ref access */}
            <InputField
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Upload Area - Hide when file is uploaded or data exists from API */}
            {!uploadCompleted && !currentData?.imagePreview && (
              <FileUploadArea
                fileInputRef={fileInputRef}
                onFileChange={handleFileChange}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              />
            )}

            {/* Uploaded File Display - Show for new uploads */}
            {uploadedFile && (
              <UploadedFileDisplay
                uploadedFile={uploadedFile}
                imagePreview={imagePreview}
                isUploading={isUploading}
                uploadFailed={uploadFailed}
                uploadProgress={uploadProgress}
                validationError={validationError}
                onDelete={handleDeleteFile}
              />
            )}

            {/* Existing Image Preview from API - Show gray box if no local file */}
            {!uploadedFile && currentData?.imagePreview && (
              <div className="bg-white flex flex-col gap-3 items-start justify-center overflow-clip p-[14px] rounded-xl w-full">
                <div className="flex items-center w-full">
                  <div className="flex flex-1 items-start justify-between">
                    <div className="flex gap-2 items-center">
                      {/* Image Preview Thumbnail */}
                      <div className="relative rounded w-8 h-8 overflow-hidden shrink-0 bg-mds-gray-200">
                        {currentData.imagePreview && (
                          <Image
                            src={currentData.imagePreview}
                            alt={translate('fileUpload.imagePreviewAlt')}
                            width={32}
                            height={32}
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex flex-col gap-1 items-start justify-center">
                        <p className="font-semibold text-xs text-mds-black-800">
                          {currentData.filePath?.split('/').pop() ||
                            translate('fileUpload.uploadedImage')}
                        </p>
                        <div className="flex gap-2 items-center">
                          <Badge color="success" size="sm">
                            {translate('fileUpload.complete')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Replace Image Button - Show when upload is complete, failed, or has existing image from API */}
            {(uploadCompleted || uploadFailed || currentData?.imagePreview) && (
              <LinkButton
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<Upload className="w-4 h-4 " />}
              >
                {translate('fileUpload.replaceImage')}
              </LinkButton>
            )}
          </div>

          {/* Destination Deep Link Input */}
          {mediaType === MEDIA_TYPES['carousel-icons'] && (
            <IconLabelInput value={iconLabel} onChange={setIconLabel} />
          )}
          <DeepLinkInput value={deepLink} onChange={setDeepLink} />
        </div>
      )}
    </div>
  );
}
