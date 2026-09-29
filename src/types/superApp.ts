import { RefObject } from 'react';

export type BannerConfigType = 'banner' | 'icon';
export type BannerConfigStatus = 'published' | 'expired';
export type BatchAction = 'create' | 'update' | 'revert' | 'delete';
export type ImageFileType =
  | 'image/jpeg'
  | 'image/jpg'
  | 'image/png'
  | 'image/webp';

export interface BannerConfigListItem {
  id: string;
  key: string;
  position: number;
  type: BannerConfigType;
  createdAt: string;
  versionCount: number;
  logId: string | null;
  label: string | null;
  status: BannerConfigStatus | null;
  filePath: string | null;
  signedUrl: string | null;
  deepLink: string | null;
  version: number | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface BatchItemData {
  key?: string;
  position?: number;
  type?: BannerConfigType;
  label?: string;
  status?: BannerConfigStatus;
  filePath?: string;
  deepLink?: string;
}

export interface BatchItem {
  action: BatchAction;
  id?: string;
  revertToLogId?: string;
  data?: BatchItemData;
}

export interface BatchRequest {
  updatedBy?: string;
  configs: BatchItem[];
}

export interface CreateSignedUrlRequest {
  key: string;
  fileName: string;
  fileType: ImageFileType;
  version?: number;
}

export interface SignedUrlResponse {
  signedUrl: string;
  filePath: string;
}

export type MediaType = 'promo-banners' | 'carousel-icons';

export type BannerId = 'header' | 'vertical' | 'horizontal1' | 'horizontal2';
export type CarouselIconId =
  | 'icon1'
  | 'icon2'
  | 'icon3'
  | 'icon4'
  | 'icon5'
  | 'icon6'
  | 'icon7';

export interface MediaItemData {
  id: string;
  configId?: string;
  title: string;
  file: File | null;
  imagePreview: string | null;
  filePath?: string;
  deepLink: string;
  label?: string;
  isUploaded: boolean;
  lastModified?: Date;
  type?: 'banner' | 'icon';
  position?: number;
  version?: number | null;
  status?: BannerConfigStatus | null;
  fileModified?: boolean;
}

export interface MediaManagementState {
  banners: Record<BannerId, MediaItemData>;
  carouselIcons: Record<CarouselIconId, MediaItemData>;
  hasChanges: boolean;
  lastPublished?: Date;
}

export interface PublishPayload {
  banners: Array<{
    id: string;
    file?: File;
    deepLink: string;
    order: number;
  }>;
  carouselIcons: Array<{
    id: string;
    file?: File;
    deepLink: string;
    label: string;
    order: number;
  }>;
  timestamp: string;
}

export interface MediaItemProps {
  title: string;
  dimensions: string;
  requiredWidth: number;
  requiredHeight: number;
  isExpanded: boolean;
  onToggle: () => void;
  mediaType?: MediaType;
}

export interface MediaItemHeaderProps {
  title: string;
  dimensions: string;
  isExpanded: boolean;
  uploadCompleted: boolean;
  mediaType?: MediaType;
  onToggle: () => void;
}

export interface FileUploadAreaProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLLabelElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLLabelElement>) => void;
}

export interface UploadedFileDisplayProps {
  uploadedFile: File;
  imagePreview: string | null;
  isUploading: boolean;
  uploadFailed: boolean;
  uploadProgress: number;
  validationError: string;
  onDelete: () => void;
}

export interface DeepLinkInputProps {
  value: string;
  onChange: (value: string) => void;
}

export interface IconLabelInputProps {
  value: string;
  onChange: (value: string) => void;
}

export interface AuditLogEntry {
  id: string;
  logId?: string;
  configKey?: string;
  title: string;
  type: string;
  updatedBy: string;
  updatedOn: string;
  imageUrl?: string;
  status: 'published' | 'draft' | 'archived';
}

export interface AuditLogsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs?: AuditLogEntry[];
  selectedDateRange?: { start: string; end: string };
  onDateRangeChange?: (dateRange: { start: string; end: string }) => void;
  onRevert?: (logEntry: AuditLogEntry) => void;
  isLoading?: boolean;
}
