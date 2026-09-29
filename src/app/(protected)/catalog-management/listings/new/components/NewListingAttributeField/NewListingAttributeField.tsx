'use client';

import { InputDropdown, InputField } from '@merit-incentives/ui';

import { newListingKeepSpaceInTextControl } from '@/app/(protected)/catalog-management/utils/newListingKeepSpaceInTextControl';
import type { AttributeFieldDefinition } from '@/types/catalog';

type SelectOption = { value: string; label: string };

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export function renderNewListingAttributeField(
  field: AttributeFieldDefinition,
  rawValue: string,
  setValue: (v: string) => void,
  fieldError: string | undefined,
  translate: TranslateFn,
  options?: {
    readonly selectPlaceholderKey?: string;
    readonly textPlaceholderKey?: string;
    readonly requiredErrorKey?: string;
  },
) {
  const selectPlaceholderKey =
    options?.selectPlaceholderKey ?? 'attributes.selectPlaceholder';
  const textPlaceholderKey =
    options?.textPlaceholderKey ?? 'attributes.textPlaceholder';
  const requiredErrorKey = options?.requiredErrorKey ?? 'errors.required';
  const err = fieldError ? translate(requiredErrorKey) : undefined;
  const label = field.displayName ?? translate(field.labelKey);
  const suffix = field.suffixKey ? translate(field.suffixKey) : undefined;

  if (field.type === 'select' && field.options?.length) {
    const opts: SelectOption[] = field.options.map((o) => ({
      value: o.value,
      label: o.label,
    }));
    return (
      <InputDropdown
        key={field.id}
        label={label}
        placeholder={translate(selectPlaceholderKey)}
        options={opts}
        value={rawValue}
        onChange={setValue}
        error={err}
        required={field.required}
      />
    );
  }

  if (suffix) {
    return (
      <div key={field.id} className="flex w-full flex-col gap-1.5">
        <span className="text-sm font-medium text-mds-black-800">
          {label}
          {field.required ? <span className="text-red-500"> *</span> : null}
        </span>
        <div className="relative w-full">
          <InputField
            placeholder={translate(textPlaceholderKey)}
            value={rawValue}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={newListingKeepSpaceInTextControl}
            error={err}
            className="w-full [&_input]:pe-[4.25rem]"
          />
          <div className="pointer-events-none absolute start-0 end-0 top-0 flex h-11 items-center justify-end pe-3">
            <span className="text-sm text-mds-black-500">{suffix}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <InputField
      key={field.id}
      label={label}
      placeholder={translate(textPlaceholderKey)}
      value={rawValue}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={newListingKeepSpaceInTextControl}
      error={err}
      required={field.required}
    />
  );
}
