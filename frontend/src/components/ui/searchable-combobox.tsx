'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

export interface ComboboxOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  flag?: string;
  subtitle?: string;
  badge?: string;
}

interface SearchableComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string, option?: ComboboxOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  allowCustom?: boolean;
  emptyMessage?: string;
  label?: string;
  required?: boolean;
}

export function SearchableCombobox({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Type to search...',
  disabled = false,
  className = '',
  allowCustom = true,
  emptyMessage = 'No matching options found',
  label,
  required = false,
}: SearchableComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find currently selected option
  const selectedOption = options.find((opt) => opt.value.toLowerCase() === value?.toLowerCase()) || (
    value ? { value, label: value } : null
  );

  // Filter options based on typed letters (substring search)
  const filteredOptions = options.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      opt.label.toLowerCase().includes(query) ||
      opt.value.toLowerCase().includes(query) ||
      (opt.subtitle && opt.subtitle.toLowerCase().includes(query))
    );
  });

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSelect = (opt: ComboboxOption) => {
    onChange(opt.value, opt);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
      } else if (allowCustom && searchQuery.trim()) {
        handleSelect({ value: searchQuery.trim(), label: searchQuery.trim() });
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`space-y-1 relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
          {value && (
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">
              Auto-Selected
            </span>
          )}
        </label>
      )}

      {/* Main trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-left flex items-center justify-between gap-2 transition-all ${
          isOpen
            ? 'border-purple-500 ring-2 ring-purple-500/20 bg-white dark:bg-slate-900'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-slate-400 dark:hover:border-slate-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption ? (
            <>
              {selectedOption.flag && <span className="text-base leading-none">{selectedOption.flag}</span>}
              {selectedOption.icon}
              <span className="font-semibold text-slate-900 dark:text-white truncate">
                {selectedOption.label}
              </span>
              {selectedOption.subtitle && (
                <span className="text-[11px] text-slate-400 font-normal">
                  ({selectedOption.subtitle})
                </span>
              )}
            </>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 font-normal">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-purple-600' : ''}`} />
        </div>
      </button>

      {/* Dropdown Menu with Search */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl border border-slate-200 dark:border-purple-900/60 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 max-h-72 flex flex-col">
          {/* Search Header */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 sticky top-0 z-10 flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Options list */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value.toLowerCase() === value?.toLowerCase();
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full px-3 py-2 rounded-xl text-xs text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {opt.flag && <span className="text-base leading-none">{opt.flag}</span>}
                      {opt.icon}
                      <span className="truncate">{opt.label}</span>
                      {opt.subtitle && (
                        <span className="text-[10px] text-slate-400 font-normal font-mono">
                          {opt.subtitle}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center space-y-2">
                <p className="text-xs text-slate-400">{emptyMessage}</p>
                {allowCustom && searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => handleSelect({ value: searchQuery.trim(), label: searchQuery.trim() })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-200"
                  >
                    <span>Use &ldquo;{searchQuery}&rdquo;</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
