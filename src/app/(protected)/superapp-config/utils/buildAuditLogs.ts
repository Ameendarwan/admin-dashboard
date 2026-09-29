import { AuditLogEntry, BannerConfigListItem } from '@/types/superApp';
import { formatConfigKey } from '@/utils/formatConfigKey';

function toDateOnlyString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getActivityTimestamp(config: BannerConfigListItem): string | null {
  return config.updatedAt ?? config.createdAt ?? null;
}

export function isUpdatedWithinDateRange(
  activityAt: string | null,
  startDate?: string,
  endDate?: string,
): boolean {
  if (!activityAt) {
    return false;
  }

  if (!startDate && !endDate) {
    return true;
  }

  const updatedDate = toDateOnlyString(new Date(activityAt));

  if (startDate && updatedDate < startDate) {
    return false;
  }

  if (endDate && updatedDate > endDate) {
    return false;
  }

  return true;
}

function formatAuditTimestamp(updatedAt: string): string {
  return new Date(updatedAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
}

function toAuditLogEntry(
  config: BannerConfigListItem,
  activityAt: string,
  revertLogId?: string,
): AuditLogEntry {
  return {
    id: config.id,
    logId: revertLogId,
    configKey: config.key,
    title:
      config.type === 'icon' && config.label
        ? config.label
        : formatConfigKey(config.key),
    type:
      config.type === 'banner'
        ? 'Promo Banner'
        : `Carousel ${formatConfigKey(config.key)}`,
    updatedBy: config.updatedBy || 'Unknown',
    updatedOn: formatAuditTimestamp(activityAt),
    imageUrl: config.signedUrl || undefined,
    status: 'published',
  };
}

export function buildAuditLogs(
  apiConfigs: BannerConfigListItem[],
  fetchedLogs: BannerConfigListItem[] | undefined,
  dateRange?: { start: string; end: string },
): AuditLogEntry[] {
  const startDate = dateRange?.start || undefined;
  const endDate = dateRange?.end || undefined;

  const fetchedLogsById = new Map(
    (fetchedLogs ?? []).map((log) => [log.id, log]),
  );

  return apiConfigs
    .filter((config) => {
      const activityAt = getActivityTimestamp(config);
      return (
        config.status !== 'expired' &&
        activityAt != null &&
        isUpdatedWithinDateRange(activityAt, startDate, endDate)
      );
    })
    .map((config) => {
      const activityAt = getActivityTimestamp(config)!;
      const previousLog = fetchedLogsById.get(config.id);
      const revertLogId = previousLog?.logId ?? config.logId ?? undefined;

      return {
        entry: toAuditLogEntry(config, activityAt, revertLogId),
        sortTimestamp: new Date(activityAt).getTime(),
      };
    })
    .sort((a, b) => b.sortTimestamp - a.sortTimestamp)
    .map(({ entry }) => entry);
}
