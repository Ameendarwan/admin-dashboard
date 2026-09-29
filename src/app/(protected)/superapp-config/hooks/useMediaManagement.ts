import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import {
  MediaItemData,
  PublishPayload,
  BannerConfigListItem,
  BatchItem,
  BatchItemData,
} from '@/types/superApp';
import { batchBannerConfigs } from '@/services/superAppService';
import { useBannerConfigs } from '@/api-queries/superApp';
import { logError } from '@/utils/errorLogger';
import { formatConfigKey } from '@/utils/formatConfigKey';

import { getPromoBannerPosition, isPromoBannerKey } from '../constants';

// Re-export types for external use
export type { MediaItemData, PublishPayload } from '@/types/superApp';
export type MediaManagementState = ReturnType<typeof useMediaManagement>;

/**
 * Central hook for managing all media management state
 * Fully dynamic based on API responses - no hardcoded configs
 */
export function useMediaManagement() {
  const queryClient = useQueryClient();

  // Core state - fully dynamic based on API
  const [configs, setConfigs] = useState<Record<string, MediaItemData>>({});
  const [apiConfigs, setApiConfigs] = useState<BannerConfigListItem[]>([]);
  const [originalConfigs, setOriginalConfigs] = useState<
    Record<string, MediaItemData>
  >({});

  const [hasChanges, setHasChanges] = useState(false);
  const [lastPublished, setLastPublished] = useState<Date | undefined>(
    undefined,
  );
  const [isPublishing, setIsPublishing] = useState(false);
  // Track pending revert actions: configId -> revertToLogId
  const [pendingReverts, setPendingReverts] = useState<Record<string, string>>(
    {},
  );

  // Fetch configs using React Query (handles caching and deduplication)
  const { data: fetchedConfigs, isLoading } = useBannerConfigs();

  // UI state for expanded/hovered config items in the configuration panel
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Derived state: separate banners and icons
  const banners = useMemo(() => {
    return Object.entries(configs)
      .filter(([, data]) => data.type === 'banner')
      .reduce(
        (acc, [key, data]) => {
          acc[key] = data;
          return acc;
        },
        {} as Record<string, MediaItemData>,
      );
  }, [configs]);

  const icons = useMemo(() => {
    return Object.entries(configs)
      .filter(([, data]) => data.type === 'icon')
      .reduce(
        (acc, [key, data]) => {
          acc[key] = data;
          return acc;
        },
        {} as Record<string, MediaItemData>,
      );
  }, [configs]);

  // Convert API config to MediaItemData
  const apiConfigToMediaItem = useCallback(
    (config: BannerConfigListItem): MediaItemData => {
      const formattedKey = formatConfigKey(config.key);
      const displayLabel =
        config.type === 'icon' && config.label ? config.label : formattedKey;

      return {
        id: config.key,
        configId: config.id,
        title: displayLabel,
        file: null,
        imagePreview: config.signedUrl,
        deepLink: config.deepLink || '',
        label: config.label || '',
        isUploaded: !!config.signedUrl,
        filePath: config.filePath || undefined,
        lastModified: config.updatedAt ? new Date(config.updatedAt) : undefined,
        type: config.type,
        position:
          config.type === 'banner'
            ? (getPromoBannerPosition(config.key) ?? config.position)
            : config.position,
        version: config.version,
        status: config.status,
        fileModified: false,
      };
    },
    [],
  );

  // Load configs from React Query data
  useEffect(() => {
    if (!fetchedConfigs) return;

    setApiConfigs(fetchedConfigs);

    // Convert to MediaItemData
    const configsMap: Record<string, MediaItemData> = {};
    fetchedConfigs.forEach((config) => {
      configsMap[config.key] = apiConfigToMediaItem(config);
    });

    setConfigs(configsMap);
    setOriginalConfigs(structuredClone(configsMap)); // Deep clone

    // Find latest update date
    const latestUpdate = fetchedConfigs
      .filter((c) => c.updatedAt)
      .sort(
        (a, b) =>
          new Date(b.updatedAt ?? 0).getTime() -
          new Date(a.updatedAt ?? 0).getTime(),
      )[0];

    if (latestUpdate?.updatedAt) {
      setLastPublished(new Date(latestUpdate.updatedAt));
    }
  }, [fetchedConfigs, apiConfigToMediaItem]);

  // Track changes by comparing with original configs
  useEffect(() => {
    if (isLoading) {
      setHasChanges(false);
      return;
    }

    // Check for deletions: keys in originalConfigs that are missing from configs
    const hasDeletions = Object.keys(originalConfigs).some((key) => {
      return !configs[key];
    });

    // Check for new or modified configs
    const hasNewOrModified = Object.keys(configs).some((key) => {
      const current = configs[key];
      const original = originalConfigs[key];

      if (!original) {
        // New config (icon_7+)
        // Only count as changed if label is filled (required field)
        if (key.startsWith('icon_') && current.type === 'icon') {
          return current.label && current.label.trim() !== '';
        }
        return true; // Other new configs count as changed
      }

      // Check for changes
      return (
        current.filePath !== original.filePath ||
        current.deepLink !== original.deepLink ||
        current.label !== original.label ||
        current.position !== original.position
      );
    });

    setHasChanges(hasDeletions || hasNewOrModified);
  }, [configs, originalConfigs, isLoading]);

  // Warn about unsaved changes before leaving page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasChanges]);

  // Update file and preview for any config
  const updateFile = useCallback(
    (key: string, file: File, imagePreview: string, filePath: string) => {
      setConfigs((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          file,
          imagePreview,
          filePath,
          isUploaded: true,
          lastModified: new Date(),
          fileModified: true, // Mark as modified when file changes
        },
      }));
    },
    [],
  );

  // Update deep link for any config
  const updateDeepLink = useCallback((key: string, deepLink: string) => {
    setConfigs((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        deepLink,
        lastModified: new Date(),
      },
    }));
  }, []);

  // Update label for icons
  const updateLabel = useCallback((key: string, label: string) => {
    setConfigs((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        label,
        title: label.trim() === '' ? formatConfigKey(key) : label, // Use formatted key when label is empty
        lastModified: new Date(),
      },
    }));
  }, []);

  // Delete file from any config
  const deleteFile = useCallback((key: string) => {
    setConfigs((prev) => {
      const config = prev[key];
      if (config?.imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(config.imagePreview);
      }
      return {
        ...prev,
        [key]: {
          ...prev[key],
          file: null,
          imagePreview: null,
          filePath: undefined,
          isUploaded: false,
          lastModified: new Date(),
        },
      };
    });
  }, []);

  // Get media item by key
  const getMediaItem = useCallback(
    (key: string): MediaItemData | undefined => {
      return configs[key];
    },
    [configs],
  );

  // Add new icon slot (icon_7 onwards)
  const addIconSlot = useCallback(() => {
    // Find the highest icon number
    const iconKeys = Object.keys(icons).filter((key) =>
      key.startsWith('icon_'),
    );
    const iconNumbers = iconKeys.map((key) => {
      const match = /icon_(\d+)/.exec(key);
      return match ? Number.parseInt(match[1], 10) : 0;
    });
    const maxIconNumber = iconNumbers.length > 0 ? Math.max(...iconNumbers) : 6;
    const newIconNumber = maxIconNumber + 1;
    const newIconKey = `icon_${newIconNumber}`;

    // Create new icon config
    const newIcon: MediaItemData = {
      id: newIconKey,
      title: `Icon ${newIconNumber}`,
      file: null,
      imagePreview: null,
      deepLink: '',
      label: '',
      isUploaded: false,
      type: 'icon',
      position: newIconNumber,
      lastModified: new Date(),
    };

    setConfigs((prev) => ({
      ...prev,
      [newIconKey]: newIcon,
    }));

    // Auto-expand the new icon
    setExpandedItem(newIconKey);

    return newIconKey;
  }, [icons]);

  // Delete icon slot (only for icon_7+)
  const deleteIconSlot = useCallback((key: string) => {
    setConfigs((prev) => {
      const config = prev[key];
      if (config?.imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(config.imagePreview);
      }
      const newConfigs = { ...prev };
      delete newConfigs[key];
      return newConfigs;
    });

    // Close expanded item if it was the deleted one
    setExpandedItem((prev) => (prev === key ? null : prev));
  }, []);

  // Update icon positions after drag and drop
  const updateIconPositions = useCallback((iconKeys: string[]) => {
    setConfigs((prev) => {
      const newConfigs = { ...prev };
      // Update positions for all icons based on new order
      iconKeys.forEach((key, index) => {
        if (newConfigs[key]?.type === 'icon') {
          newConfigs[key] = {
            ...newConfigs[key],
            position: index + 1, // Position is 1-indexed
            lastModified: new Date(),
          };
        }
      });
      return newConfigs;
    });
  }, []);

  // Prepare payload for API publish (legacy compatibility)
  const preparePublishPayload = useCallback((): PublishPayload => {
    const bannerArray = Object.entries(banners)
      .sort(([keyA], [keyB]) => {
        if (isPromoBannerKey(keyA) && isPromoBannerKey(keyB)) {
          return (
            (getPromoBannerPosition(keyA) ?? 0) -
            (getPromoBannerPosition(keyB) ?? 0)
          );
        }
        return 0;
      })
      .map(([key, data], index) => ({
        id: key,
        file: data.file ?? undefined,
        deepLink: data.deepLink,
        order: index,
      }));

    const iconArray = Object.entries(icons).map(([key, data], index) => ({
      id: key,
      file: data.file ?? undefined,
      deepLink: data.deepLink,
      label: data.label || '',
      order: index,
    }));

    return {
      banners: bannerArray,
      carouselIcons: iconArray,
      timestamp: new Date().toISOString(),
    };
  }, [banners, icons]);

  // Helper: Create data for new icon
  const createNewIconData = useCallback(
    (key: string, current: MediaItemData): BatchItem | null => {
      if (!current.label || current.label.trim() === '') {
        return null; // Don't create without label
      }

      const data: BatchItemData = {
        key,
        position: current.position,
        type: 'icon',
        status: 'published',
        label: current.label,
      };

      if (current.filePath) data.filePath = current.filePath;
      if (current.deepLink) data.deepLink = current.deepLink;

      return { action: 'create', data };
    },
    [],
  );

  // Helper: Build update data with changes
  const buildUpdateData = useCallback(
    (
      apiConfig: BannerConfigListItem,
      current: MediaItemData,
      original: MediaItemData | undefined,
    ): { data: BatchItemData; hasChanges: boolean } => {
      const data: BatchItemData = {
        key: apiConfig.key,
        position:
          apiConfig.type === 'banner'
            ? (getPromoBannerPosition(apiConfig.key) ??
              current.position ??
              apiConfig.position)
            : (current.position ?? apiConfig.position),
        type: apiConfig.type,
      };
      let hasChanges = false;

      // Check if position changed
      if (
        current.position !== undefined &&
        current.position !== original?.position
      ) {
        data.position = current.position;
        hasChanges = true;
      }

      if (current.filePath && current.filePath !== original?.filePath) {
        data.filePath = current.filePath;
        hasChanges = true;
      }

      if (current.deepLink !== original?.deepLink) {
        data.deepLink = current.deepLink || undefined;
        hasChanges = true;
      }

      if (current.type === 'icon' && current.label !== original?.label) {
        data.label = current.label || undefined;
        hasChanges = true;
      }

      return { data, hasChanges };
    },
    [],
  );

  // Create batch item for a changed config - ONLY include modified fields
  const createBatchItem = useCallback(
    (
      key: string,
      current: MediaItemData,
      original: MediaItemData | undefined,
    ): BatchItem | null => {
      const apiConfig = apiConfigs.find((c) => c.key === key);

      if (!apiConfig) {
        // New icon slot (icon_7+) that doesn't exist in API yet
        const isNewIcon = key.startsWith('icon_') && current.type === 'icon';
        return isNewIcon ? createNewIconData(key, current) : null;
      }

      // Check if there's a pending revert for this config
      if (pendingReverts[apiConfig.id]) {
        return {
          action: 'revert',
          id: apiConfig.id,
          revertToLogId: pendingReverts[apiConfig.id],
        };
      }

      const { data, hasChanges } = buildUpdateData(
        apiConfig,
        current,
        original,
      );

      return hasChanges ? { action: 'update', id: apiConfig.id, data } : null;
    },
    [apiConfigs, createNewIconData, buildUpdateData, pendingReverts],
  );

  // Publish changes - ONLY send modified configs
  const publishChanges = useCallback(async () => {
    setIsPublishing(true);
    try {
      const batchItems: BatchItem[] = [];

      // Process all configs and only include modified ones
      for (const [key, current] of Object.entries(configs)) {
        const original = originalConfigs[key];
        const item = createBatchItem(key, current, original);
        if (item) {
          batchItems.push(item);
        }
      }

      // Process deletions: keys in originalConfigs that are missing from configs
      for (const key of Object.keys(originalConfigs)) {
        if (!configs[key]) {
          // Find the API config to get the ID
          const apiConfig = apiConfigs.find((c) => c.key === key);
          if (apiConfig) {
            batchItems.push({
              action: 'delete',
              id: apiConfig.id,
            });
          }
        }
      }

      // Execute batch operation if there are changes
      if (batchItems.length > 0) {
        await batchBannerConfigs({ configs: batchItems });
      }

      // Invalidate and refetch from React Query cache
      await queryClient.invalidateQueries({ queryKey: ['banner-configs'] });
      await queryClient.invalidateQueries({
        queryKey: ['banner-configs', 'logs'],
      });

      // The useEffect will automatically update configs when React Query refetches
      // Just update the state flags here
      setLastPublished(new Date());
      setHasChanges(false);
      setPendingReverts({}); // Clear pending reverts after successful publish

      return { success: true, data: batchItems };
    } catch (error) {
      logError('Failed to publish changes', error);
      return { success: false, error };
    } finally {
      setIsPublishing(false);
    }
  }, [queryClient, configs, originalConfigs, createBatchItem, apiConfigs]);

  // Reset all changes
  const resetChanges = useCallback(() => {
    // Cleanup blob URLs
    Object.values(configs).forEach((config) => {
      if (config.imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(config.imagePreview);
      }
    });

    // Reset to original state
    setConfigs(structuredClone(originalConfigs));
    setHasChanges(false);
    setPendingReverts({}); // Clear pending reverts
  }, [configs, originalConfigs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(configs).forEach((config) => {
        if (config.imagePreview?.startsWith('blob:')) {
          URL.revokeObjectURL(config.imagePreview);
        }
      });
    };
  }, [configs]);

  // Apply revert locally (preview mode)
  const applyRevertLocally = useCallback(
    (configId: string, logData: BannerConfigListItem) => {
      const config = apiConfigs.find((c) => c.id === configId);
      if (!config) return;

      // Store the revert action
      setPendingReverts((prev) => ({
        ...prev,
        [configId]: logData.logId!,
      }));

      // Apply the log data to local state
      if (logData.filePath) {
        updateFile(
          config.key,
          null as unknown as File,
          logData.signedUrl || '',
          logData.filePath,
        );
      }

      updateDeepLink(config.key, logData.deepLink || '');

      if (logData.type === 'icon') {
        updateLabel(config.key, logData.label || '');
      }
    },
    [apiConfigs, updateFile, updateDeepLink, updateLabel],
  );

  return {
    // State
    configs,
    banners,
    icons,
    hasChanges,
    lastPublished,
    isPublishing,
    isLoading,
    apiConfigs,

    // UI state
    expandedItem,
    setExpandedItem,
    hoveredItem,
    setHoveredItem,

    // Operations
    updateFile,
    updateDeepLink,
    updateLabel,
    deleteFile,
    addIconSlot,
    deleteIconSlot,
    updateIconPositions,

    // Utility
    getMediaItem,
    preparePublishPayload,

    // Actions
    publishChanges,
    resetChanges,
    applyRevertLocally,
  };
}
