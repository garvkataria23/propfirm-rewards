'use client';

import React from 'react';
import { COUNTRIES_DATA, CountryData } from '@/lib/geo-data';
import { SearchableCombobox, ComboboxOption } from './searchable-combobox';

interface CountrySelectProps {
  value: string; // Country name
  onChange: (countryName: string, countryData?: CountryData) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export function CountrySelect({
  value,
  onChange,
  label = 'Country / Region',
  required = false,
  className = '',
}: CountrySelectProps) {
  const options: ComboboxOption[] = COUNTRIES_DATA.map((c) => ({
    value: c.name,
    label: c.name,
    flag: c.flag,
    subtitle: `${c.dialCode} • (${c.code})`,
  }));

  const handleChange = (selectedCountryName: string) => {
    const found = COUNTRIES_DATA.find((c) => c.name.toLowerCase() === selectedCountryName.toLowerCase());
    onChange(selectedCountryName, found);
  };

  return (
    <SearchableCombobox
      label={label}
      required={required}
      options={options}
      value={value}
      onChange={handleChange}
      placeholder="Select your country..."
      searchPlaceholder="Search country, dial code (+91, +1)..."
      className={className}
      allowCustom={true}
    />
  );
}
