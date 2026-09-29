'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, InputDropdown, InputField, Popup } from '@merit-incentives/ui';

import { useLocalization } from '@/hooks';

interface DateRangeValue {
  start: string;
  end: string;
}

interface DateRangeFilterProps {
  start: string;
  end: string;
  placeholder: string;
  onChange: (dateRange: DateRangeValue) => void;
}

export function DateRangeFilter({
  start,
  end,
  placeholder,
  onChange,
}: Readonly<DateRangeFilterProps>) {
  const { translate } = useLocalization('calendar');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(start);
  const [selectedEndDate, setSelectedEndDate] = useState(end);

  useEffect(() => {
    if (isOpen) {
      setSelectedStartDate(start);
      setSelectedEndDate(end);
    }
  }, [end, isOpen, start]);

  const displayValue = useMemo(() => {
    if (start && end) {
      return `${start} - ${end}`;
    }
    return start || end || '';
  }, [end, start]);

  const maxDate = useMemo(() => new Date().toLocaleDateString('en-CA'), []);

  const options = useMemo(
    () => [
      {
        label: displayValue || placeholder,
        value: displayValue || '',
      },
    ],
    [displayValue, placeholder],
  );

  const handleApply = useCallback(() => {
    onChange({
      start: selectedStartDate,
      end: selectedEndDate,
    });
    setIsOpen(false);
  }, [onChange, selectedEndDate, selectedStartDate]);

  const handleCancel = useCallback(() => {
    onChange({ start: '', end: '' });
    setSelectedStartDate('');
    setSelectedEndDate('');
    setIsOpen(false);
  }, [onChange]);

  const handleStartDateChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextStart = event.target.value;
      setSelectedStartDate(nextStart);
      if (selectedEndDate && nextStart && selectedEndDate < nextStart) {
        setSelectedEndDate('');
      }
    },
    [selectedEndDate],
  );

  const handleEndDateChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextEnd = event.target.value;
      setSelectedEndDate(nextEnd);
      if (selectedStartDate && nextEnd && selectedStartDate > nextEnd) {
        setSelectedStartDate('');
      }
    },
    [selectedStartDate],
  );

  const isApplyDisabled =
    !selectedStartDate ||
    !selectedEndDate ||
    selectedEndDate < selectedStartDate;

  return (
    <>
      <InputDropdown
        className="min-w-50"
        options={options}
        value={displayValue}
        placeholder={placeholder}
        onChange={() => undefined}
        onClick={() => setIsOpen(true)}
      />

      <Popup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="w-[min(100%,28rem)] max-w-[calc(100vw-2rem)]"
      >
        <Popup.Header
          onClose={() => setIsOpen(false)}
          showDivider
          className="px-6 py-5"
        >
          <h2 className="text-xl font-semibold text-mds-black-900">
            {translate('selectDateRange')}
          </h2>
        </Popup.Header>

        <Popup.Content className="px-6 py-5">
          <div className="flex flex-col gap-4">
            <InputField
              id="topup-date-range-start"
              label={translate('startDate')}
              type="date"
              value={selectedStartDate}
              onChange={handleStartDateChange}
              max={selectedEndDate || maxDate}
            />
            <InputField
              id="topup-date-range-end"
              label={translate('endDate')}
              type="date"
              value={selectedEndDate}
              onChange={handleEndDateChange}
              min={selectedStartDate || undefined}
              max={maxDate}
            />
          </div>
        </Popup.Content>

        <Popup.Footer className="border-t border-mds-black-100 px-6 py-5">
          <div className="flex w-full items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={handleCancel}>
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
        </Popup.Footer>
      </Popup>
    </>
  );
}
