'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { InputDropdown } from '@merit-incentives/ui';
import { Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { CalendarFilter } from '@/types/calendar';

import { DateRangeSelectionDialog } from '../DateRangeSelectionDialog';

interface CalendarFilterSelectorProps {
  value: CalendarFilter;
  onChange: (
    filter: CalendarFilter,
    dateRange?: { start: string; end: string },
  ) => void;
  placeholder?: string;
  className?: string;
}

export function CalendarFilterSelector({
  onChange,
  placeholder,
  className = 'w-48',
}: Readonly<CalendarFilterSelectorProps>) {
  const t = useTranslations('calendar');
  const [showDateDialog, setShowDateDialog] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{
    start: string;
    end: string;
  } | null>(null);

  const handleCustomDateRangeChange = useCallback(
    (dateRange: { start: string; end: string }) => {
      // If both dates are empty, clear the custom date range
      if (!dateRange.start && !dateRange.end) {
        setCustomDateRange(null);
        onChange(CalendarFilter.TODAY, { start: '', end: '' });
      } else {
        setCustomDateRange(dateRange);
        onChange(CalendarFilter.CUSTOM, dateRange);
      }
    },
    [onChange],
  );

  const displayValue = useMemo(() => {
    if (customDateRange?.start && customDateRange?.end) {
      return `${customDateRange.start} - ${customDateRange.end}`;
    }
    if (customDateRange?.start) {
      return customDateRange.start;
    }
    if (customDateRange?.end) {
      return customDateRange.end;
    }
    return '';
  }, [customDateRange]);

  const options = useMemo(
    () => [
      {
        label: displayValue || placeholder || t('selectDate'),
        value: '',
      },
    ],
    [displayValue, placeholder, t],
  );

  return (
    <div>
      <div className={className}>
        <InputDropdown
          leftIcon={<Calendar />}
          onChange={() => {}}
          options={options}
          placeholder={placeholder || t('selectDate')}
          value=""
          onClick={() => setShowDateDialog(true)}
        />
      </div>
      <DateRangeSelectionDialog
        open={showDateDialog}
        onOpenChange={setShowDateDialog}
        initialDateRange={customDateRange || undefined}
        bothRequired={false}
        onDateRangeChange={handleCustomDateRangeChange}
      />
    </div>
  );
}
