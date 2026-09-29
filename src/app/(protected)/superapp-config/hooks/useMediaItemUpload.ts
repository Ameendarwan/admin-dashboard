/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useRef, useEffect } from 'react';

import { createSignedUrl } from '@/services/superAppService';
import { ImageFileType, CreateSignedUrlRequest } from '@/types/superApp';
import { logError } from '@/utils/errorLogger';

interface UseMediaItemUploadProps {
  requiredWidth: number;
  requiredHeight: number;
  initialFile?: File | null;
  initialPreview?: string | null;
  initialDeepLink?: string;
  initialLabel?: string;
  initialIsUploaded?: boolean;
  itemId: string; // Media item ID for API key mapping
  mediaType: 'banner' | 'icon';
  currentVersion?: number | null;
  onFileUploadSuccess?: (file: File, preview: string, filePath: string) => void;
  onDeepLinkChange?: (deepLink: string) => void;
  onLabelChange?: (label: string) => void;
  onFileDelete?: () => void;
}

export function useMediaItemUpload({
  requiredWidth,
  requiredHeight,
  initialFile = null,
  initialPreview = null,
  initialDeepLink = '',
  initialLabel = '',
  initialIsUploaded = false,
  itemId,
  mediaType,
  currentVersion = null,
  onFileUploadSuccess,
  onDeepLinkChange,
  onLabelChange,
  onFileDelete,
}: UseMediaItemUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(initialFile);
  const [deepLink, setDeepLink] = useState(initialDeepLink);
  const [iconLabel, setIconLabel] = useState(initialLabel);
  const [uploadProgress, setUploadProgress] = useState(25);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCompleted, setUploadCompleted] = useState(initialIsUploaded);
  const [uploadFailed, setUploadFailed] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialPreview,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local state with props when they change (e.g., when revert updates parent state)
  useEffect(() => {
    setDeepLink(initialDeepLink);
  }, [initialDeepLink]);

  useEffect(() => {
    setIconLabel(initialLabel);
  }, [initialLabel]);

  useEffect(() => {
    if (initialPreview !== null) {
      setImagePreview(initialPreview);
    }
  }, [initialPreview]);

  // Validate image dimensions (currently disabled but kept for future use)

  const validateImageDimensions = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        if (width !== requiredWidth || height !== requiredHeight) {
          reject(
            new Error(
              `Invalid dimensions (${width} x ${height}). Required: ${requiredWidth} x ${requiredHeight}`,
            ),
          );
        } else {
          resolve();
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image'));
      };

      img.src = objectUrl;
    });
  };

  // Map UI IDs to API keys - Now itemId is already the API key
  const getApiKey = (id: string, _type: 'banner' | 'icon'): string => {
    // itemId is now the actual API key (e.g., 'header_promo_banner', 'icon_1')
    return id;
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setIsUploading(true);
    setUploadFailed(false);
    setValidationError('');
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setUploadProgress(0);

    try {
      await validateImageDimensions(file);

      // Get API key for this item
      const apiKey = getApiKey(itemId, mediaType);

      setUploadProgress(20);

      // Get signed URL from API to obtain filePath
      const signedUrlRequest: CreateSignedUrlRequest = {
        key: apiKey,
        fileName: file.name,
        fileType: file.type as ImageFileType,
      };

      if (currentVersion !== null && currentVersion !== undefined) {
        signedUrlRequest.version = currentVersion;
      }
      const { signedUrl, filePath } = await createSignedUrl(signedUrlRequest);

      setUploadProgress(40);

      // Upload file to GCS
      const { uploadFileToSignedUrl } =
        await import('@/services/superAppService');
      await uploadFileToSignedUrl(signedUrl, file, file.type);

      setUploadProgress(100);
      setIsUploading(false);
      setUploadCompleted(true);

      // Notify parent with filePath (will be used for batch operations)
      onFileUploadSuccess?.(file, preview, filePath);
    } catch (error) {
      setIsUploading(false);
      setUploadFailed(true);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to get signed URL';
      setValidationError(errorMessage);
      logError('Failed to get signed URL', error, {
        itemId,
        mediaType,
        fileName: file.name,
        fileType: file.type,
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const handleDeleteFile = () => {
    // Don't revoke URL if it's from backend (signed URL), only revoke blob URLs
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setUploadedFile(null);
    setImagePreview(null);
    setUploadProgress(25);
    setIsUploading(false);
    setUploadCompleted(false);
    setUploadFailed(false);
    setValidationError('');

    // Notify parent of file deletion
    onFileDelete?.();
  };

  // Wrapper for setDeepLink that notifies parent
  const handleDeepLinkChange = (value: string) => {
    setDeepLink(value);
    onDeepLinkChange?.(value);
  };

  // Wrapper for setIconLabel that notifies parent
  const handleIconLabelChange = (value: string) => {
    setIconLabel(value);
    onLabelChange?.(value);
  };

  return {
    // State
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
    // Setters
    setDeepLink: handleDeepLinkChange,
    setIconLabel: handleIconLabelChange,
    // Handlers
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDeleteFile,
  };
}
