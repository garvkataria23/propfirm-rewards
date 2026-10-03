'use client';

import React from 'react';
import { Coins, TrendingUp, Unlock, Activity } from 'lucide-react';
import { Reveal, TradingVisualBackground } from './motion-primitives';

/**
 * §29 · BUILT FOR TRADERS
 * Heading: BUILT FOR TRADERS.
 * Four cards:
 * - EARN: Get rewarded for eligible verified purchases.
 * - PROGRESS: Watch your points grow.
 * - UNLOCK: Reach rewards you actually want.
 * - TRACK: Manage purchases, points and rewards in one place.
 */
export function TraderFeatures() {
  const features = [
    {
      label: 'EARN',
      description: 'Get rewarded for eligible verified purchases.',
      icon: <Coins className="h-5 w-5 text-emerald-400" />,
      metric: 'VERIFIED PURCHASES',
    },
    {
      label: 'PROGRESS',
      description: 'Watch your points grow.',
      icon: <TrendingUp className="h-5 w-5 text-emerald-400" />,
      metric: 'TRANSPARENT LEDGER',
    },
    {
      label: 'UNLOCK',
      description: 'Reach rewards you actually want.',
      icon: <Unlock className="h-5 w-5 text-emerald-400" />,
      metric: 'CURATED REWARD VAULT',
    },
    {
      label: 'TRACK',
      description: 'Manage purchases, points and rewards in one place.',
      icon: <Activity className="h-5 w-5 text-emerald-400" />,
      metric: 'UNIFIED DASHBOARD',
    },
  ];

  return (
    <section className="w-full py-20 lg:py-24 bg-gradient-to-b from-white via-emerald-50/30 to-white dark:from-[#05080B] dark:via-[#07100F] dark:to-[#05080B] border-b border-slate-200 dark:border-white/[0.08] relative overflow-hidden transition-colors duration-300">
      {/* #32: Strongest trading background after the hero (large faint candlestick chart + market grid + price line) */}
      <TradingVisualBackground variant="traders" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Reveal>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/12 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider">
              PLATFORM PILLARS
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              BUILT FOR TRADERS.
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feat, idx) => (
            <Reveal key={feat.label} delay={idx * 80}>
              <div className="h-full p-6 rounded-2xl bg-white/95 dark:bg-[#0B1015]/95 border border-slate-200 dark:border-white/[0.11] hover:border-emerald-500/45 shadow-xs hover:shadow-[0_20px_42px_-14px_rgba(16,185,129,0.22)] transition-all duration-250 hover:-translate-y-1 flex flex-col justify-between gap-6 group backdrop-blur-xs">
                <div className="flex items-center justify-between">
                  <div className="h-11 w-11 rounded-xl bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {feat.icon}
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 tracking-wider">
                    0{idx + 1}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                    {feat.label}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-200 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-white/[0.08] text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                  {feat.metric}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
