'use client';

import { Button, toast } from '@merit-incentives/ui';
import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { AntiClockIcon } from '@/components/icons';
import { PageHeader } from '@/components/PageHeader';
import { useLocalization } from '@/hooks/useLocalization';
import { ConfirmationPopup } from '@/components';
import { logError } from '@/utils/errorLogger';
import type { AuditLogEntry } from '@/types/superApp';
import { useBannerConfigLogs } from '@/api-queries/superApp';

import { ConfigurationPanel, LivePreview, AuditLogsDrawer } from './components';
import { useMediaManagement } from './hooks';
import { buildAuditLogs } from './utils/buildAuditLogs';

export default function MediaManagementPage() {
  const { translate } = useLocalization('media-management');
  const queryClient = useQueryClient();

  const [showPublishPopup, setShowPublishPopup] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<{
    start: string;
    end: string;
  }>({ start: '', end: '' });

  const mediaManagement = useMediaManagement();

  const { data: fetchedLogs } = useBannerConfigLogs(
    selectedDateRange.start || undefined,
    selectedDateRange.end || undefined,
    isDrawerOpen,
  );

  const auditLogs = useMemo(() => {
    if (!mediaManagement.apiConfigs.length) {
      return [];
    }

    return buildAuditLogs(
      mediaManagement.apiConfigs,
      fetchedLogs,
      selectedDateRange,
    );
  }, [fetchedLogs, mediaManagement.apiConfigs, selectedDateRange]);

  const handlePublishChanges = () => {
    setShowPublishPopup(true);
  };

  const handleAuditLog = () => {
    void queryClient.invalidateQueries({ queryKey: ['banner-configs'] });
    void queryClient.invalidateQueries({
      queryKey: ['banner-configs', 'logs'],
    });
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedDateRange({ start: '', end: '' });
  };

  const handleConfirmPublish = async () => {
    setShowPublishPopup(false);
    const result = await mediaManagement.publishChanges();
    if (result.success) {
      toast.success('Published Successfully!', {
        description: 'Your changes have been published.',
      });
    } else {
      toast.error('Failed to Publish', {
        description: 'Unable to publish your changes. Please try again.',
      });
    }
  };

  const handleRevertToVersion = (logEntry: AuditLogEntry) => {
    try {
      if (!logEntry.configKey || !logEntry.logId) {
        toast.error('Revert Failed', {
          description: 'Invalid log entry.',
        });
        return;
      }

      // Find the config ID from apiConfigs
      const config = mediaManagement.apiConfigs.find(
        (c) => c.key === logEntry.configKey,
      );

      if (!config) {
        toast.error('Revert Failed', {
          description: 'Could not find config.',
        });
        return;
      }

      // Find the log data from fetched logs
      const logData = fetchedLogs?.find(
        (log) => log.id === config.id && log.logId === logEntry.logId,
      );

      if (!logData) {
        toast.error('Revert Failed', {
          description: 'Could not find log data.',
        });
        return;
      }

      // Apply revert locally (preview mode)
      mediaManagement.applyRevertLocally(config.id, logData);

      setIsDrawerOpen(false);
      toast.success('Reverted Locally', {
        description: 'Previous version loaded. Click Publish to save changes.',
      });
    } catch (error) {
      logError('Failed to revert to previous version', error, {
        logEntry,
      });
      toast.error('Revert Failed', {
        description: 'Unable to revert to previous version.',
      });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-1">
        {/* Header */}
        <div className="space-y-6">
          <PageHeader title={translate('title')}>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleAuditLog}
                leftIcon={<AntiClockIcon width={19} height={18} />}
              >
                {translate('auditLog')}
              </Button>
              <Button
                variant="primary"
                onClick={handlePublishChanges}
                disabled={
                  !mediaManagement.hasChanges ||
                  mediaManagement.isPublishing ||
                  mediaManagement.isLoading
                }
              >
                {mediaManagement.isPublishing
                  ? translate('publishing')
                  : translate('publishChanges')}
              </Button>
            </div>
          </PageHeader>

          {/* Publish Confirmation Popup */}
          <ConfirmationPopup
            isOpen={showPublishPopup}
            onClose={() => setShowPublishPopup(false)}
            type="warning"
            title={translate('publishConfirmation.title')}
            description={translate('publishConfirmation.description')}
            primaryButton={{
              text: translate('publishConfirmation.confirmButton'),
              variant: 'primary',
            }}
            secondaryButton={{
              text: translate('publishConfirmation.cancelButton'),
              variant: 'secondary',
            }}
            onPrimaryAction={handleConfirmPublish}
          />

          {/* Content Panels */}
          <AuditLogsDrawer
            isOpen={isDrawerOpen}
            onClose={handleCloseDrawer}
            logs={auditLogs}
            selectedDateRange={selectedDateRange}
            onDateRangeChange={setSelectedDateRange}
            onRevert={handleRevertToVersion}
            isLoading={mediaManagement.isLoading}
          />
          <div className="flex gap-5 items-start w-full max-md:flex-col">
            {/* Left Panel - Configuration */}
            <ConfigurationPanel mediaManagement={mediaManagement} />

            {/* Right Panel - Live Preview */}
            <LivePreview mediaManagement={mediaManagement} />
          </div>
        </div>
      </div>
    </div>
  );
}
