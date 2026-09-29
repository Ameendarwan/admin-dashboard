'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useId } from 'react';

export type DaysStepperFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  daysLabel?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
};

function clampValue(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function DaysStepperField({
  label,
  value,
  onChange,
  min = 1,
  max = 365,
  daysLabel = 'Days',
  hint,
  error,
  required = false,
  disabled = false,
}: Readonly<DaysStepperFieldProps>) {
  const inputId = useId();
  const canIncrement = value < max;
  const canDecrement = value > min;

  const handleInputChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      onChange(min);
      return;
    }
    onChange(clampValue(Number.parseInt(digits, 10), min, max));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-mds-black-800"
      >
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>

      <div
        className={`flex h-11 overflow-hidden rounded-lg border bg-white ${
          error ? 'border-mds-error-300' : 'border-mds-black-200'
        } ${disabled ? 'opacity-60' : ''}`}
      >
        <div className="flex min-w-0 flex-1 items-center">
          <button
            type="button"
            className="flex h-full shrink-0 items-center justify-center border-e border-mds-black-200 px-3 text-mds-black-700 enabled:hover:bg-mds-black-50 disabled:cursor-not-allowed disabled:text-mds-black-300"
            aria-label={`Increase ${label}`}
            disabled={disabled || !canIncrement}
            onClick={() => onChange(clampValue(value + 1, min, max))}
          >
            <ChevronUp className="h-4 w-4" aria-hidden />
          </button>

          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={String(value)}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            className="min-w-0 flex-1 border-0 bg-transparent px-3 text-start text-sm text-mds-black-900 outline-none focus:ring-0 disabled:cursor-not-allowed"
            onChange={(e) => handleInputChange(e.target.value)}
          />

          <button
            type="button"
            className="ms-auto flex h-full shrink-0 items-center justify-center border-s border-mds-black-200 px-3 text-mds-black-700 enabled:hover:bg-mds-black-50 disabled:cursor-not-allowed disabled:text-mds-black-300"
            aria-label={`Decrease ${label}`}
            disabled={disabled || !canDecrement}
            onClick={() => onChange(clampValue(value - 1, min, max))}
          >
            <ChevronDown className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="flex shrink-0 items-center border-l border-mds-black-200 px-4">
          <span className="text-sm text-mds-black-600">{daysLabel}</span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-mds-error-500" role="alert">
          {error}
        </p>
      )}
      {!error && hint && <p className="text-sm text-mds-black-500">{hint}</p>}
    </div>
  );
}
