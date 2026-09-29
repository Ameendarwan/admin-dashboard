'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Badge, BadgeColor, Button, LinkButton } from '@merit-incentives/ui';

import { cn } from '@/lib/utils';
import { AuditLogsDrawerProps, AuditLogEntry } from '@/types/superApp';
import { ConfirmationPopup } from '@/components/ConfirmationPopup';
import { CalendarFilterSelector } from '@/components/CalendarFilterSelector';
import { useLocalization } from '@/hooks/useLocalization';
import { CalendarFilter } from '@/types/calendar';
import { Spinner } from '@/components/Spinner';

export const AuditLogsDrawer: React.FC<AuditLogsDrawerProps> = ({
  isOpen,
  onClose,
  logs = [],
  onDateRangeChange,
  onRevert,
  isLoading = false,
}) => {
  const { translate } = useLocalization('media-management');
  const [showRevertPopup, setShowRevertPopup] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [calendarFilter, setCalendarFilter] = useState<CalendarFilter>(
    CalendarFilter.TODAY,
  );

  // Reset calendar filter when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setCalendarFilter(CalendarFilter.TODAY);
    }
  }, [isOpen]);

  const handleRevertClick = (log: AuditLogEntry) => {
    setSelectedLog(log);
    setShowRevertPopup(true);
  };

  const handleConfirmRevert = () => {
    if (selectedLog && onRevert) {
      onRevert(selectedLog);
      setShowRevertPopup(false);
      setSelectedLog(null);
    }
  };

  const getStatusColor = (status: string): BadgeColor => {
    switch (status) {
      case 'published':
        return 'success';
      case 'expired':
        return 'error';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'gray';
      default:
        return 'primary';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <>
      {/* Backdrop */}
      <Button
        type="button"
        className={cn(
          'fixed inset-0 bg-mds-black-900/20 transition-opacity z-40 m-0!',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        aria-label="Close drawer"
        tabIndex={isOpen ? 0 : -1}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-132 bg-mds-white shadow-[-4px_0px_32px_2px_rgba(0,0,0,0.06)] transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex flex-col gap-8 p-6">
          {/* Header */}
          <div className="flex gap-8 items-center">
            <div className="flex flex-1 gap-3 items-center">
              <Button
                onClick={onClose}
                className="flex items-center justify-center w-7! h-7! hover:bg-mds-black-50 rounded-lg transition-colors bg-transparent! m-0! p-0! min-w-0!"
                aria-label="Close drawer"
              >
                <ArrowLeft className="w-5 h-5 text-mds-black-900" />
              </Button>
              <h2 className="flex-1 font-manrope font-medium text-2xl leading-[1.2] text-mds-black-900">
                {translate('auditLogsDrawer.title')}
              </h2>
            </div>

            {/* Date Filter */}
            <CalendarFilterSelector
              key={isOpen ? 'open' : 'closed'} // Force remount when drawer opens/closes to reset state
              value={calendarFilter}
              onChange={(filter, dateRange) => {
                setCalendarFilter(filter);
                // Always pass the date range, even if empty (to clear filters)
                onDateRangeChange?.({
                  start: dateRange?.start || '',
                  end: dateRange?.end || '',
                });
              }}
              className="w-52"
            />
          </div>

          {/* Logs List */}
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" fullHeight={false} />
              </div>
            ) : logs.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-mds-black-500">
                {translate('auditLogsDrawer.noLogsFound')}
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col gap-3 p-4 bg-mds-white border border-mds-black-100 rounded-mds-md"
                >
                  {/* Log Header */}
                  <div className="flex items-start justify-between w-full">
                    <div className="flex gap-2 items-center">
                      {/* Image/Icon */}
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                        {log.imageUrl ? (
                          <Image
                            src={log.imageUrl}
                            alt={log.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-mds-black-100 flex items-center justify-center">
                            <span className="text-mds-black-400 font-medium text-xs">
                              No Image
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Title and Type */}
                      <div className="flex flex-col gap-1">
                        <p className="font-manrope font-medium text-lg leading-[1.2] text-mds-black-900">
                          {log.title}
                        </p>
                        <p className="font-manrope font-medium text-sm leading-[1.4] text-mds-black-500">
                          {log.type}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-start">
                      <Badge color={getStatusColor(log.status)} size="sm">
                        {getStatusLabel(log.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-mds-black-100" />

                  {/* Log Footer */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1 items-start">
                        <p className="font-manrope font-medium text-xs leading-[1.2] text-mds-black-500">
                          {translate('auditLogsDrawer.updatedBy')}
                        </p>
                        <p className="font-manrope font-medium text-xs leading-[1.2] text-mds-black-900">
                          {log.updatedBy}
                        </p>
                      </div>
                      <div className="flex gap-1 items-start">
                        <p className="font-manrope font-medium text-xs leading-[1.2] text-mds-black-500">
                          {translate('auditLogsDrawer.updatedOn')}
                        </p>
                        <p className="font-manrope font-medium text-xs leading-[1.2] text-mds-black-900">
                          {log.updatedOn}
                        </p>
                      </div>
                    </div>

                    {log.logId ? (
                      <LinkButton
                        variant="tertiary"
                        size="sm"
                        leftIcon={<RotateCcw className="w-5 h-5" />}
                        onClick={() => handleRevertClick(log)}
                        className="text-mds-primary-700 hover:bg-mds-black-50"
                      >
                        {translate('auditLogsDrawer.revert')}
                      </LinkButton>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Revert Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showRevertPopup}
        onClose={() => setShowRevertPopup(false)}
        type="warning"
        title={translate('auditLogsDrawer.revertConfirmation.title')}
        description={translate(
          'auditLogsDrawer.revertConfirmation.description',
          { date: selectedLog?.updatedOn || 'the selected date' },
        )}
        primaryButton={{
          text: translate('auditLogsDrawer.revertConfirmation.confirmButton'),
          variant: 'primary',
        }}
        secondaryButton={{
          text: translate('auditLogsDrawer.revertConfirmation.cancelButton'),
          variant: 'secondary',
        }}
        onPrimaryAction={handleConfirmRevert}
      />
    </>
  );
};
