import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { InputField, Button } from '@merit-incentives/ui';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

import { useLocalization } from '@/hooks/useLocalization';

export interface DateRangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bothRequired?: boolean;
  initialDateRange?: { start: string; end: string };
  onDateRangeChange: (dateRange: { start: string; end: string }) => void;
}

export const DateRangeSelectionDialog: React.FC<DateRangeDialogProps> = ({
  open,
  onOpenChange,
  bothRequired = false,
  initialDateRange,
  onDateRangeChange,
}) => {
  const { translate } = useLocalization('calendar');
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');

  useEffect(() => {
    if (open) {
      setSelectedStartDate(initialDateRange?.start || '');
      setSelectedEndDate(initialDateRange?.end || '');
    }
  }, [open, initialDateRange]);

  const handleApply = useCallback(() => {
    onDateRangeChange({
      start: selectedStartDate,
      end: selectedEndDate,
    });
    onOpenChange(false);
  }, [selectedStartDate, selectedEndDate, onDateRangeChange, onOpenChange]);

  const handleCancel = useCallback(() => {
    onDateRangeChange({
      start: '',
      end: '',
    });
    setSelectedStartDate('');
    setSelectedEndDate('');
    onOpenChange(false);
  }, [onDateRangeChange, onOpenChange]);

  const maxDate = useMemo(() => new Date().toLocaleDateString('en-CA'), []);

  const handleStartDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedStartDate(e.target.value);
      if (
        selectedEndDate &&
        e.target.value &&
        selectedEndDate < e.target.value
      ) {
        setSelectedEndDate('');
      }
    },
    [selectedEndDate],
  );

  const handleEndDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedEndDate(e.target.value);
      if (
        selectedStartDate &&
        e.target.value &&
        selectedStartDate > e.target.value
      ) {
        setSelectedStartDate('');
      }
    },
    [selectedStartDate],
  );

  const isApplyDisabled = useMemo(() => {
    if (bothRequired) {
      return !(selectedStartDate && selectedEndDate);
    }
    return (
      (!selectedStartDate && !selectedEndDate) ||
      (Boolean(selectedStartDate) &&
        Boolean(selectedEndDate) &&
        selectedEndDate < selectedStartDate)
    );
  }, [bothRequired, selectedStartDate, selectedEndDate]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-mds-black-900/50 z-50 m-0!" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-mds-white rounded-lg shadow-lg z-50 max-w-125 w-full">
          <div className="flex flex-row items-center justify-between px-6 py-4 border-b border-mds-gray-300">
            <Dialog.Title className="font-medium text-[24px] text-mds-black-900">
              {translate('selectDateRange')}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button
                variant="secondary"
                className="text-mds-gray-600 justify-end bg-transparent hover:bg-transparent"
                aria-label="Close"
              >
                <X size={24} />
              </Button>
            </Dialog.Close>
          </div>

          <div className="space-y-4 p-6">
            <div>
              <InputField
                id="date-range-start"
                label={translate('startDate')}
                type="date"
                value={selectedStartDate}
                onChange={handleStartDateChange}
                max={selectedEndDate || maxDate}
              />
            </div>

            <div>
              <InputField
                id="date-range-end"
                label={translate('endDate')}
                type="date"
                value={selectedEndDate}
                onChange={handleEndDateChange}
                min={selectedStartDate || undefined}
                max={maxDate}
              />
            </div>
            <div className="flex items-center justify-end gap-4">
              <Button type="button" onClick={handleCancel} variant="secondary">
                {translate('cancel')}
              </Button>
              <Button
                type="button"
                onClick={handleApply}
                disabled={isApplyDisabled}
              >
                {translate('apply')}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
