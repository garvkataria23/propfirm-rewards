'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal, TradingVisualBackground } from './motion-primitives';

/**
 * #36 · FINAL CTA
 * Headline: YOUR NEXT REWARD STARTS HERE.
 * Supporting: "Join PROP NATION, explore eligible prop-firm offers, and start earning rewards."
 * Primary: START EARNING →
 * Secondary: EXPLORE REWARDS →
 */
export function FinalCTA() {
  return (
    <section className="w-full py-24 lg:py-32 bg-gradient-to-b from-white via-emerald-50/40 to-slate-100 dark:from-[#030506] dark:via-[#030506] dark:to-[#030506] relative overflow-hidden transition-colors duration-300">
      {/* #37: Deep black / light surface + soft emerald glow + faint upward chart + distant candlesticks + subtle particles */}
      <TradingVisualBackground variant="final-cta" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0B1015] border border-slate-200 dark:border-white/[0.1] shadow-2xs text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            PROP NATION REWARDS
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.05]">
            YOUR NEXT REWARD STARTS HERE.
          </h2>
        </Reveal>

        <Reveal delay={140}>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Join PROP NATION, explore eligible prop-firm offers, and start earning rewards.
          </p>
        </Reveal>

        <Reveal delay={200}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 pt-2">
            <Link
              href="/prop-firms"
              className="group h-14 px-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm tracking-wide shadow-[0_0_32px_-6px_rgba(16,185,129,0.5)] transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2.5"
            >
              <span>START EARNING</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/rewards"
              className="group h-14 px-8 rounded-xl bg-white dark:bg-[#101614] hover:bg-slate-50 dark:hover:bg-[#151d1a] border border-slate-200 dark:border-white/[0.12] hover:border-slate-300 dark:hover:border-white/[0.22] text-slate-900 dark:text-white font-bold text-sm tracking-wide shadow-xs transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2.5"
            >
              <span>EXPLORE REWARDS</span>
              <ArrowRight className="h-4 w-4 text-slate-500 dark:text-slate-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-slate-900 dark:group-hover:text-white" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
