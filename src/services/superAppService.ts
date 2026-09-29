import { adminApiClient } from '@/lib/apiClient';
import {
  BannerConfigListItem,
  BatchRequest,
  CreateSignedUrlRequest,
  SignedUrlResponse,
  ImageFileType,
} from '@/types/superApp';
import { logError } from '@/utils/errorLogger';

const API_KEY = process.env.NEXT_PUBLIC_B2C_API_KEY || '';

/**
 * Get all banner configs with their current published log data
 * Authentication: Bearer token OR API key
 * @returns Array of BannerConfigListItem objects
 */
export const fetchBannerConfigs = async (): Promise<BannerConfigListItem[]> => {
  try {
    const response = await adminApiClient.get('/banner-configs');
    return response.data;
  } catch (error) {
    logError('Error fetching banner configs', error);
    throw error;
  }
};

/**
 * Get configs with their one-version-older log (for revert functionality)
 * Authentication: Bearer token OR API key
 * @param startDate - Optional start date filter (YYYY-MM-DD)
 * @param endDate - Optional end date filter (YYYY-MM-DD)
 * @returns Array of BannerConfigListItem objects with previous version
 */
export const fetchBannerConfigLogs = async (
  startDate?: string,
  endDate?: string,
): Promise<BannerConfigListItem[]> => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const url = queryString
      ? `/banner-configs/logs?${queryString}`
      : '/banner-configs/logs';
    const response = await adminApiClient.get(url);
    return response.data;
  } catch (error) {
    logError('Error fetching banner config logs', error);
    throw error;
  }
};

/**
 * Batch create, update, revert, or delete banner configs
 * Authentication: API key REQUIRED
 * @param batchRequest - Batch request with configs array
 * @returns Array of BannerConfigListItem objects (created/updated/reverted only)
 */
export const batchBannerConfigs = async (
  batchRequest: BatchRequest,
): Promise<BannerConfigListItem[]> => {
  try {
    const response = await adminApiClient.post(
      '/banner-configs/batch',
      batchRequest,
      {
        headers: {
          'x-api-key': API_KEY,
        },
      },
    );
    return response.data;
  } catch (error) {
    logError('Error in batch banner configs operation', error);
    throw error;
  }
};

/**
 * Get a signed URL for uploading an image file to GCS
 * Authentication: API key REQUIRED
 * @param request - Signed URL request with key, fileName, fileType, and optional version
 * @returns SignedUrlResponse with signedUrl and filePath
 */
export const createSignedUrl = async (
  request: CreateSignedUrlRequest,
): Promise<SignedUrlResponse> => {
  try {
    const response = await adminApiClient.post(
      '/banner-configs/signed-url',
      request,
      {
        headers: {
          'x-api-key': API_KEY,
        },
      },
    );
    return response.data;
  } catch (error) {
    logError('Error creating signed URL', error);
    throw error;
  }
};

/**
 * Upload file to signed URL (direct to GCS)
 * @param signedUrl - Pre-signed URL from createSignedUrl
 * @param file - File to upload
 * @param fileType - MIME type of the file
 */
export const uploadFileToSignedUrl = async (
  signedUrl: string,
  file: File,
  fileType: string,
): Promise<void> => {
  try {
    const response = await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': fileType,
      },
      body: file,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(
        `Upload failed with status ${response.status}: ${errorText}`,
      );
    }
  } catch (error) {
    logError('Error uploading file to signed URL', error, {
      signedUrlHost: new URL(signedUrl).hostname,
      fileType,
      fileName: file.name,
      fileSize: file.size,
    });
    throw error;
  }
};

/**
 * Complete workflow: Upload image and create banner config
 * @param key - Config key
 * @param position - Sort order
 * @param type - 'banner' or 'icon'
 * @param label - Label for the config
 * @param imageFile - Image file to upload
 * @param deepLink - Optional deep link URL
 * @returns Created BannerConfigListItem
 */
export const createBannerConfigWithImage = async (
  key: string,
  position: number,
  type: 'banner' | 'icon',
  label: string,
  imageFile: File,
  deepLink?: string,
): Promise<BannerConfigListItem> => {
  // 1. Get signed URL
  const { signedUrl, filePath } = await createSignedUrl({
    key,
    fileName: imageFile.name,
    fileType: imageFile.type as ImageFileType,
  });

  // 2. Upload file
  await uploadFileToSignedUrl(signedUrl, imageFile, imageFile.type);

  // 3. Create config
  const result = await batchBannerConfigs({
    configs: [
      {
        action: 'create',
        data: {
          key,
          position,
          type,
          label,
          filePath,
          deepLink,
          status: 'published',
        },
      },
    ],
  });

  return result[0];
};

/**
 * Complete workflow: Upload image and update existing banner config
 * @param configId - Config ID to update
 * @param configKey - Config key
 * @param currentVersion - Current version number
 * @param imageFile - New image file to upload
 * @param updates - Optional updates for label, deepLink, position
 * @returns Updated BannerConfigListItem
 */
export const updateBannerConfigWithImage = async (
  configId: string,
  configKey: string,
  currentVersion: number,
  imageFile: File,
  updates?: {
    label?: string;
    deepLink?: string;
    position?: number;
  },
): Promise<BannerConfigListItem> => {
  // 1. Get signed URL with current version
  const { signedUrl, filePath } = await createSignedUrl({
    key: configKey,
    fileName: imageFile.name,
    fileType: imageFile.type as ImageFileType,
    version: currentVersion,
  });

  // 2. Upload file
  await uploadFileToSignedUrl(signedUrl, imageFile, imageFile.type);

  // 3. Update config
  const result = await batchBannerConfigs({
    configs: [
      {
        action: 'update',
        id: configId,
        data: {
          filePath,
          ...updates,
        },
      },
    ],
  });

  return result[0];
};
