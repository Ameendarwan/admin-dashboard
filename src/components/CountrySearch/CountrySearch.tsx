'use client';

import { Search } from '@merit-incentives/ui/components';
import { Country } from 'country-state-city';
import React, { useEffect, useState } from 'react';

interface CountrySearchProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange: (countryCode: string) => void;
  error?: string;
  required?: boolean;
  autoComplete?: string;
}

export function CountrySearch({
  label,
  placeholder = '',
  value = '',
  onChange,
  error,
  required = false,
  autoComplete = 'off',
}: Readonly<CountrySearchProps>) {
  const [countrySearchValue, setCountrySearchValue] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const allCountries = Country.getAllCountries();

  // Sync display value with selected country code
  useEffect(() => {
    if (value) {
      const country = allCountries.find((c) => c.isoCode === value);
      if (country) {
        setCountrySearchValue(country.name);
      }
    } else {
      setCountrySearchValue('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="flex-1">
      <Search
        autoComplete={autoComplete}
        label={label}
        onChange={(searchValue) => {
          setCountrySearchValue(searchValue);
          setShowCountryDropdown(true);
          // If search value is cleared, notify parent
          if (!searchValue && value) {
            onChange('');
          }
        }}
        onSelect={(option) => {
          if (option && typeof option === 'object' && 'value' in option) {
            onChange(option.value);
            const country = allCountries.find(
              (c) => c.isoCode === option.value,
            );
            setCountrySearchValue(country?.name || '');
          }
          setShowCountryDropdown(false);
        }}
        options={allCountries.map((c) => ({
          value: c.isoCode,
          label: c.name,
          image: `https://flagcdn.com/w40/${c.isoCode.toLowerCase()}.png`,
        }))}
        placeholder={placeholder}
        selectedValue={value}
        showDropdown={showCountryDropdown}
        value={countrySearchValue}
        error={error}
        required={required}
      />
    </div>
  );
}
