'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Globe2, Search, Sparkles, X } from 'lucide-react';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: {
          new (options: Record<string, unknown>, element: string): unknown;
          InlineLayout: { SIMPLE: string };
        };
      };
    };
  }
}

const SCRIPT_ID = 'google-translate-script';
const ENGINE_ID = 'google_translate_engine';

export interface LanguageItem {
  code: string;
  label: string;
  nativeName: string;
  flag?: string;
  popular?: boolean;
}

const RTL_LANGUAGES = ['ar', 'ur', 'iw', 'fa', 'ps', 'sd'];

export const ALL_LANGUAGES: LanguageItem[] = [
  // Most Popular / Major Prop Trading Markets
  { code: 'en', label: 'English', nativeName: 'English', popular: true },
  { code: 'hi', label: 'Hindi', nativeName: 'हिंदी', popular: true },
  { code: 'es', label: 'Spanish', nativeName: 'Español', popular: true },
  { code: 'fr', label: 'French', nativeName: 'Français', popular: true },
  { code: 'de', label: 'German', nativeName: 'Deutsch', popular: true },
  { code: 'ar', label: 'Arabic', nativeName: 'العربية', popular: true },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', popular: true },
  { code: 'pt', label: 'Portuguese', nativeName: 'Português', popular: true },
  { code: 'ru', label: 'Russian', nativeName: 'Русский', popular: true },
  { code: 'ja', label: 'Japanese', nativeName: '日本語', popular: true },
  { code: 'ko', label: 'Korean', nativeName: '한국어', popular: true },
  { code: 'zh-CN', label: 'Chinese (Simplified)', nativeName: '简体中文', popular: true },
  { code: 'zh-TW', label: 'Chinese (Traditional)', nativeName: '繁體中文', popular: true },
  { code: 'it', label: 'Italian', nativeName: 'Italiano', popular: true },
  { code: 'id', label: 'Indonesian', nativeName: 'Bahasa Indonesia', popular: true },
  { code: 'tr', label: 'Turkish', nativeName: 'Türkçe', popular: true },
  { code: 'vi', label: 'Vietnamese', nativeName: 'Tiếng Việt', popular: true },
  { code: 'th', label: 'Thai', nativeName: 'ไทย', popular: true },
  { code: 'ur', label: 'Urdu', nativeName: 'اردو', popular: true },
  { code: 'fa', label: 'Persian', nativeName: 'فارسی', popular: true },

  // Indian Regional Languages
  { code: 'pa', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം' },

  // European & Global Languages (100+ Total)
  { code: 'af', label: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'sq', label: 'Albanian', nativeName: 'Shqip' },
  { code: 'am', label: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'hy', label: 'Armenian', nativeName: 'Հայերեն' },
  { code: 'az', label: 'Azerbaijani', nativeName: 'Azərbaycanca' },
  { code: 'eu', label: 'Basque', nativeName: 'Euskara' },
  { code: 'be', label: 'Belarusian', nativeName: 'Беларуская' },
  { code: 'bs', label: 'Bosnian', nativeName: 'Bosanski' },
  { code: 'bg', label: 'Bulgarian', nativeName: 'Български' },
  { code: 'ca', label: 'Catalan', nativeName: 'Català' },
  { code: 'ceb', label: 'Cebuano', nativeName: 'Cebuano' },
  { code: 'ny', label: 'Chichewa', nativeName: 'Chichewa' },
  { code: 'co', label: 'Corsican', nativeName: 'Corsu' },
  { code: 'hr', label: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'cs', label: 'Czech', nativeName: 'Čeština' },
  { code: 'da', label: 'Danish', nativeName: 'Dansk' },
  { code: 'nl', label: 'Dutch', nativeName: 'Nederlands' },
  { code: 'eo', label: 'Esperanto', nativeName: 'Esperanto' },
  { code: 'et', label: 'Estonian', nativeName: 'Eesti' },
  { code: 'tl', label: 'Filipino (Tagalog)', nativeName: 'Filipino' },
  { code: 'fi', label: 'Finnish', nativeName: 'Suomi' },
  { code: 'fy', label: 'Frisian', nativeName: 'Frysk' },
  { code: 'gl', label: 'Galician', nativeName: 'Galego' },
  { code: 'ka', label: 'Georgian', nativeName: 'ქართული' },
  { code: 'el', label: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'ht', label: 'Haitian Creole', nativeName: 'Kreyòl ayisyen' },
  { code: 'ha', label: 'Hausa', nativeName: 'Hausa' },
  { code: 'haw', label: 'Hawaiian', nativeName: 'ʻŌlelo Hawaiʻi' },
  { code: 'iw', label: 'Hebrew', nativeName: 'עברית' },
  { code: 'hmn', label: 'Hmong', nativeName: 'Hmong' },
  { code: 'hu', label: 'Hungarian', nativeName: 'Magyar' },
  { code: 'is', label: 'Icelandic', nativeName: 'Íslenska' },
  { code: 'ig', label: 'Igbo', nativeName: 'Igbo' },
  { code: 'ga', label: 'Irish', nativeName: 'Gaeilge' },
  { code: 'jw', label: 'Javanese', nativeName: 'Jawa' },
  { code: 'kk', label: 'Kazakh', nativeName: 'Қазақша' },
  { code: 'km', label: 'Khmer', nativeName: 'ខ្មែរ' },
  { code: 'ku', label: 'Kurdish', nativeName: 'Kurdî' },
  { code: 'ky', label: 'Kyrgyz', nativeName: 'Кыргызча' },
  { code: 'lo', label: 'Lao', nativeName: 'ລາວ' },
  { code: 'la', label: 'Latin', nativeName: 'Latina' },
  { code: 'lv', label: 'Latvian', nativeName: 'Latviešu' },
  { code: 'lt', label: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'lb', label: 'Luxembourgish', nativeName: 'Lëtzebuergesch' },
  { code: 'mk', label: 'Macedonian', nativeName: 'Македонски' },
  { code: 'mg', label: 'Malagasy', nativeName: 'Malagasy' },
  { code: 'ms', label: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'mt', label: 'Maltese', nativeName: 'Malti' },
  { code: 'mi', label: 'Maori', nativeName: 'Māori' },
  { code: 'mn', label: 'Mongolian', nativeName: 'Монгол' },
  { code: 'my', label: 'Myanmar (Burmese)', nativeName: 'မြန်မာ' },
  { code: 'ne', label: 'Nepali', nativeName: 'नेपाली' },
  { code: 'no', label: 'Norwegian', nativeName: 'Norsk' },
  { code: 'ps', label: 'Pashto', nativeName: 'پښتو' },
  { code: 'pl', label: 'Polish', nativeName: 'Polski' },
  { code: 'ro', label: 'Romanian', nativeName: 'Română' },
  { code: 'sm', label: 'Samoan', nativeName: 'Samoan' },
  { code: 'gd', label: 'Scots Gaelic', nativeName: 'Gàidhlig' },
  { code: 'sr', label: 'Serbian', nativeName: 'Српски' },
  { code: 'st', label: 'Sesotho', nativeName: 'Sesotho' },
  { code: 'sn', label: 'Shona', nativeName: 'Shona' },
  { code: 'sd', label: 'Sindhi', nativeName: 'سنڌي' },
  { code: 'si', label: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'sk', label: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'sl', label: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'so', label: 'Somali', nativeName: 'Soomaali' },
  { code: 'su', label: 'Sundanese', nativeName: 'Sunda' },
  { code: 'sw', label: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'sv', label: 'Swedish', nativeName: 'Svenska' },
  { code: 'tg', label: 'Tajik', nativeName: 'Тоҷикӣ' },
  { code: 'uk', label: 'Ukrainian', nativeName: 'Українська' },
  { code: 'uz', label: 'Uzbek', nativeName: 'Oʻzbek' },
  { code: 'cy', label: 'Welsh', nativeName: 'Cymraeg' },
  { code: 'xh', label: 'Xhosa', nativeName: 'isiXhosa' },
  { code: 'yi', label: 'Yiddish', nativeName: 'ייִדיש' },
  { code: 'yo', label: 'Yoruba', nativeName: 'Yorùbá' },
  { code: 'zu', label: 'Zulu', nativeName: 'isiZulu' },
];

const INCLUDED_LANG_CODES = ALL_LANGUAGES.map((l) => l.code).join(',');

function getGoogleCombo(): HTMLSelectElement | null {
  if (typeof document === 'undefined') return null;
  return document.querySelector<HTMLSelectElement>('.goog-te-combo');
}

function setGoogleTranslateCookie(langCode: string) {
  if (typeof document === 'undefined') return;
  const cookieVal = langCode && langCode !== 'en' ? `/en/${langCode}` : '/en/en';
  document.cookie = `googtrans=${cookieVal}; path=/`;

  // Set host domain cookie if applicable
  const host = window.location.hostname;
  if (host.includes('.')) {
    document.cookie = `googtrans=${cookieVal}; domain=.${host}; path=/`;
  }
}

function getCurrentGoogleLanguage(): string {
  if (typeof document === 'undefined') return 'en';
  const match = document.cookie.match(/(?:^|; )googtrans=([^;]+)/);
  if (!match || !match[1]) return 'en';

  const decoded = decodeURIComponent(match[1]);
  const parts = decoded.split('/').filter(Boolean);
  const target = parts.at(-1);

  if (target && ALL_LANGUAGES.some((item) => item.code === target)) {
    return target;
  }
  return 'en';
}

function applyHtmlDirection(langCode: string) {
  if (typeof document === 'undefined') return;
  const isRtl = RTL_LANGUAGES.includes(langCode);
  document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  document.documentElement.lang = langCode;
}

export function GoogleTranslate({
  id = 'google_translate_widget',
  className = '',
  compact = false,
  pill = false,
}: {
  id?: string;
  className?: string;
  compact?: boolean;
  pill?: boolean;
}) {
  const [currentLang, setCurrentLang] = useState('en');
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  // Active language details
  const selectedLang = useMemo(() => {
    return ALL_LANGUAGES.find((item) => item.code === currentLang) || ALL_LANGUAGES[0];
  }, [currentLang]);

  // Real-time instant search filter (native name + English label + code)
  const filteredLanguages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Put popular languages and currently selected first
      return [...ALL_LANGUAGES].sort((a, b) => {
        if (a.code === currentLang) return -1;
        if (b.code === currentLang) return 1;
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return 0;
      });
    }

    return ALL_LANGUAGES.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.nativeName.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q)
    );
  }, [query, currentLang]);

  // Read cookie on mount & apply direction
  useEffect(() => {
    const saved = getCurrentGoogleLanguage();
    setCurrentLang(saved);
    applyHtmlDirection(saved);
  }, []);

  // Pre-boot Google Translate Engine immediately in the background BEFORE user taps
  useEffect(() => {
    // 1. Create hidden engine container
    if (!document.getElementById(ENGINE_ID)) {
      const engineDiv = document.createElement('div');
      engineDiv.id = ENGINE_ID;
      engineDiv.className = 'google-translate-engine';
      engineDiv.setAttribute('aria-hidden', 'true');
      document.body.appendChild(engineDiv);
    }

    // 2. Define global callback
    const initEngine = () => {
      if (!window.google?.translate) return;
      const engineEl = document.getElementById(ENGINE_ID);
      if (!engineEl || engineEl.childNodes.length > 0) return;

      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: INCLUDED_LANG_CODES,
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          ENGINE_ID
        );
      } catch (e) {
        console.warn('Google Translate init note:', e);
      }
    };

    window.googleTranslateElementInit = initEngine;

    // 3. If already loaded, initialize directly
    if (window.google?.translate) {
      initEngine();
    } else if (!document.getElementById(SCRIPT_ID)) {
      // Inject Google Translate script immediately
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }

    // 4. Pre-poll to verify ready state before user ever taps
    const pollInterval = window.setInterval(() => {
      const combo = getGoogleCombo();
      if (combo) {
        setReady(true);
        window.clearInterval(pollInterval);
      }
    }, 200);

    return () => {
      window.clearInterval(pollInterval);
    };
  }, []);

  // Handle outside click & escape key
  useEffect(() => {
    if (!open) return;

    // Prevent background scrolling while mobile bottom sheet is active
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      document.body.style.overflow = 'hidden';
    }

    const handlePointerDown = (e: PointerEvent) => {
      // For desktop popover, close when clicking outside rootRef
      if (window.innerWidth >= 640 && !rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    // Auto-focus search input when opened
    const t = window.setTimeout(() => {
      if (window.innerWidth < 640) {
        mobileSearchRef.current?.focus();
      } else {
        searchInputRef.current?.focus();
      }
    }, 60);

    return () => {
      if (typeof window !== 'undefined') {
        document.body.style.overflow = '';
      }
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(t);
    };
  }, [open]);

  // Instant language change trigger
  const handleSelectLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    applyHtmlDirection(langCode);
    setGoogleTranslateCookie(langCode);
    setOpen(false);
    setQuery('');

    const combo = getGoogleCombo();
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      window.location.reload();
    }
  };

  return (
    <div id={id} ref={rootRef} className={`relative inline-block ${open ? 'z-[9999]' : ''} ${className}`}>
      {/* Globe Language Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select Language (100+ Available)"
        title="Select Language (100+ Available)"
        className={`group flex items-center justify-between gap-1 rounded-xl border transition-all cursor-pointer font-bold select-none ${
          pill
            ? 'h-9 px-2.5 bg-white/95 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-purple-400 text-xs shadow-2xs'
            : compact
            ? 'h-9 px-2.5 bg-white/90 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-purple-400 text-xs'
            : 'h-9.5 px-3 bg-white/95 dark:bg-slate-900/90 border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-purple-400 hover:shadow-xs text-xs'
        }`}
      >
        <span className="flex items-center gap-1.5 truncate">
          <Globe2 className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0 group-hover:rotate-45 transition-transform duration-300" />
          <span className="truncate max-w-[85px] sm:max-w-[110px] font-bold text-xs uppercase tracking-tight">
            {pill ? selectedLang.code.toUpperCase() : (selectedLang.nativeName || selectedLang.label)}
          </span>
        </span>
        <ChevronDown
          className={`h-3 w-3 text-slate-400 transition-transform duration-200 shrink-0 ${
            open ? 'rotate-180 text-purple-600' : ''
          }`}
        />
      </button>

      {/* 100+ Languages Searchable Selector */}
      {open && (
        <>
          {/* ======================================================== */}
          {/* 1. Mobile Bottom Sheet Modal (Screens < 640px) */}
          {/* ======================================================== */}
          <div
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs sm:hidden flex items-end justify-center animate-in fade-in-0 duration-200"
            onClick={() => setOpen(false)}
          >
            <div
              className="w-full max-h-[85vh] bg-white dark:bg-slate-950 rounded-t-3xl border-t border-purple-200 dark:border-purple-900/60 p-4 pb-6 shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-250"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Grab Drag Bar */}
              <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 shrink-0" />

              {/* Sheet Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-8.5 w-8.5 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <Globe2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Select Language</span>
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300 px-1.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                        100+ AI
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Instant translation across entire platform
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Mobile Search Input */}
              <div className="py-3 shrink-0">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    ref={mobileSearchRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search language (Hindi, Spanish, Arabic, Russian)..."
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 pl-9 pr-8 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-purple-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-colors"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Scrollable Language List */}
              <div
                className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800/60 overscroll-contain pr-1"
                role="listbox"
              >
                {filteredLanguages.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No language found matching &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  filteredLanguages.map((item) => {
                    const isActive = item.code === currentLang;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => handleSelectLanguage(item.code)}
                        className={`w-full flex items-center justify-between py-3 px-3 rounded-xl text-left transition-colors text-xs ${
                          isActive
                            ? 'bg-purple-100/80 dark:bg-purple-950/70 text-purple-900 dark:text-purple-200 font-bold border border-purple-200 dark:border-purple-800'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{item.nativeName}</span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            {item.label} • {item.code.toUpperCase()}
                          </span>
                        </div>
                        {isActive && (
                          <div className="h-6 w-6 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. Desktop Floating Dropdown (Screens >= 640px) */}
          {/* ======================================================== */}
          <div className="hidden sm:block absolute right-0 rtl:right-auto rtl:left-0 top-full mt-2 w-80 z-[9999] rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 shadow-2xl ring-1 ring-black/10 animate-in fade-in-0 zoom-in-95 duration-150">
            {/* Header & Instant Search Box */}
            <div className="space-y-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <Globe2 className="h-3 w-3" />
                  <span>100+ Languages</span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Instant AI Translation</span>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search language (Hindi, Spanish, Arabic)..."
                  className="h-9 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-8.5 pr-3 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-purple-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Languages Scrollable List */}
            <div
              className="max-h-72 overflow-y-auto pt-1 space-y-1 overscroll-contain scrollbar-thin"
              role="listbox"
            >
              {filteredLanguages.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No language found matching &ldquo;{query}&rdquo;
                </div>
              ) : (
                filteredLanguages.map((item) => {
                  const isActive = item.code === currentLang;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => handleSelectLanguage(item.code)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-purple-100/90 dark:bg-purple-950/80 text-purple-950 dark:text-purple-100 font-bold border border-purple-300 dark:border-purple-700 shadow-xs'
                          : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-purple-700 dark:hover:text-purple-300'
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-extrabold truncate text-sm text-slate-900 dark:text-white leading-tight">
                          {item.nativeName}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.label} ({item.code.toUpperCase()})
                        </span>
                      </div>

                      {isActive && (
                        <Check className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
