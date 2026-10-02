'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Cookie, X } from 'lucide-react';
import { Button } from './button';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('propnation_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('propnation_cookie_consent', 'all');
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('propnation_cookie_consent', 'essential');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-purple-200/80 dark:border-purple-900/60 shadow-2xl shadow-purple-950/20 text-xs space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-600 dark:text-purple-400">
              <Cookie className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Cookie &amp; Privacy Preferences</h4>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">GDPR &amp; ePrivacy Compliant</span>
            </div>
          </div>
          <button
            onClick={handleEssentialOnly}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
          We use strictly necessary cookies to keep you securely signed in, remember your dashboard settings, and ensure accurate referral tracking for prop firm reward crediting.
        </p>

        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            onClick={handleAcceptAll}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-9 shadow-sm"
          >
            Accept All
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEssentialOnly}
            className="flex-1 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs h-9"
          >
            Essential Only
          </Button>
        </div>
      </div>
    </div>
  );
}
