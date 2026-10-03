'use client';

import React from 'react';
import { PropFirmCalculator } from '@/components/calculator/prop-firm-calculator';
import { LiveActivityTicker } from '@/components/social-proof/live-activity-ticker';
import { FloatingCandlesticks } from '@/components/trading/floating-candlesticks';

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#05070a] text-slate-900 dark:text-slate-100 flex flex-col relative overflow-hidden transition-colors">
      {/* Background Ambience */}
      <FloatingCandlesticks />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      <LiveActivityTicker />

      <main className="flex-1 relative z-10 py-8">
        <PropFirmCalculator />
      </main>
    </div>
  );
}

