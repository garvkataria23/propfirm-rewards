'use client';

import React, { useState, useEffect } from 'react';
import { CountrySelect } from './country-select';
import { SearchableCombobox, ComboboxOption } from './searchable-combobox';
import { COUNTRIES_DATA, findCountry, PRESET_ADDRESSES } from '@/lib/geo-data';
import { Sparkles, MapPin, Building, User, Phone, Check } from 'lucide-react';

export interface AddressData {
  fullName: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface AddressFormProps {
  value: AddressData;
  onChange: (address: AddressData) => void;
  showPresets?: boolean;
}

export function AddressForm({ value, onChange, showPresets = true }: AddressFormProps) {
  const currentCountry = findCountry(value.country) || COUNTRIES_DATA[0];

  // States available for selected country
  const stateOptions: ComboboxOption[] = (currentCountry?.states || []).map((s) => ({
    value: s.name,
    label: s.name,
    subtitle: s.code,
  }));

  // Find currently selected state
  const selectedStateObj = currentCountry?.states?.find(
    (s) => s.name.toLowerCase() === value.state?.toLowerCase()
  );

  // Cities available for selected state or general country
  const cityOptions: ComboboxOption[] = selectedStateObj
    ? selectedStateObj.cities.map((city) => ({
        value: city,
        label: city,
        subtitle: selectedStateObj.name,
      }))
    : (currentCountry?.states?.flatMap((s) => s.cities) || []).map((city) => ({
        value: city,
        label: city,
      }));

  const handleCountryChange = (countryName: string) => {
    const newCountry = findCountry(countryName);
    const defaultState = newCountry?.states?.[0]?.name || '';
    const defaultCity = newCountry?.states?.[0]?.cities?.[0] || '';
    
    onChange({
      ...value,
      country: countryName,
      state: defaultState,
      city: defaultCity,
      phone: value.phone?.startsWith('+') ? value.phone : `${newCountry?.dialCode || '+91'} ${value.phone || ''}`.trim(),
    });
  };

  const handleStateChange = (stateName: string) => {
    const stateObj = currentCountry?.states?.find((s) => s.name.toLowerCase() === stateName.toLowerCase());
    const defaultCity = stateObj?.cities?.[0] || '';
    onChange({
      ...value,
      state: stateName,
      city: defaultCity,
    });
  };

  const handleCityChange = (cityName: string) => {
    onChange({
      ...value,
      city: cityName,
    });
  };

  const handleApplyPreset = (preset: (typeof PRESET_ADDRESSES)[0]) => {
    onChange({
      fullName: preset.fullName,
      phone: preset.phone,
      addressLine1: preset.addressLine1,
      city: preset.city,
      state: preset.state,
      postalCode: preset.postalCode,
      country: preset.country,
    });
  };

  return (
    <div className="space-y-4 text-left">
      {/* 1-Tap Preset Auto-fill Bar */}
      {showPresets && (
        <div className="space-y-2 p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/40">
          <div className="flex items-center justify-between text-[11px] font-bold text-purple-700 dark:text-purple-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              1-Tap Address Auto-Fill
            </span>
            <span className="text-[10px] text-slate-500 font-normal">Zero Typing Needed</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {PRESET_ADDRESSES.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-purple-400 hover:text-purple-600 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recipient Name & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span>Recipient Full Name *</span>
          </label>
          <input
            type="text"
            required
            value={value.fullName}
            onChange={(e) => onChange({ ...value, fullName: e.target.value })}
            placeholder="e.g. Garv Gautam Kataria"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            <span>Contact Phone (For Courier Tracking) *</span>
          </label>
          <input
            type="tel"
            required
            value={value.phone}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
            placeholder="+91 98765 43210"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Country Dropdown (Searchable Combobox) */}
      <CountrySelect
        label="Country / Destination"
        required
        value={value.country}
        onChange={handleCountryChange}
      />

      {/* State / Province & City (Both Searchable Dropdowns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* State Dropdown */}
        <SearchableCombobox
          label="State / Province"
          required
          options={stateOptions}
          value={value.state}
          onChange={handleStateChange}
          placeholder="Select state..."
          searchPlaceholder="Search or type state name..."
          allowCustom={true}
        />

        {/* City Dropdown */}
        <SearchableCombobox
          label="City / District"
          required
          options={cityOptions}
          value={value.city}
          onChange={handleCityChange}
          placeholder="Select city..."
          searchPlaceholder="Search or type city name..."
          allowCustom={true}
        />
      </div>

      {/* Street Address & Postal Code */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Building className="h-3.5 w-3.5 text-slate-400" />
            <span>Street Address &amp; Suite / Apt *</span>
          </label>
          <input
            type="text"
            required
            value={value.addressLine1}
            onChange={(e) => onChange({ ...value, addressLine1: e.target.value })}
            placeholder="e.g. B-402, High Street Heights, Bandra West"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span>Postal / ZIP Code *</span>
          </label>
          <input
            type="text"
            required
            value={value.postalCode}
            onChange={(e) => onChange({ ...value, postalCode: e.target.value })}
            placeholder="e.g. 400050"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>
    </div>
  );
}
