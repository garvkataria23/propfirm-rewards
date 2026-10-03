'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeroDashboard } from './hero-dashboard';
import { TradingVisualBackground } from './motion-primitives';

/**
 * #4–#15, #48 · DARK ATMOSPHERIC HERO
 * 4 Visual Depth Layers (#13):
 * - Layer 1: Deep #030506 -> #07100F atmospheric background + soft emerald/cyan radial lighting
 * - Layer 2: Edge-masked trading grid
 * - Layer 3: Organic floating candlesticks (clear of headline text #14, #48) + slow price chart + particles
 * - Layer 4: Illuminated HeroDashboard + soft halo + subtle reflection
 */
export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 dark:from-[#030506] dark:via-[#05080B] dark:to-[#07100F] border-b border-slate-200 dark:border-white/[0.08] pt-8 pb-18 lg:pt-14 lg:pb-24 transition-colors duration-300">
      {/* Layers 1, 2 & 3: Atmospheric Lighting, Masked Grid, Floating Candlesticks & Price Line */}
      <TradingVisualBackground variant="hero" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-10 items-center">
          {/* Left Column: Brand Message, Value Proposition & CTAs */}
          <div className="lg:col-span-6 space-y-6 relative z-20">
            {/* 0.0-0.3s: PN Logo Badge */}
            <div
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#0B1015]/90 border border-emerald-500/30 text-xs font-mono text-slate-700 dark:text-slate-200 shadow-sm backdrop-blur-xs"
              style={{ animation: 'heroReveal 0.35s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both' }}
            >
              <img
                src="/pn-logo-hd.png?v=3"
                alt="PN"
                className="h-4 w-4 object-contain rounded-xs"
              />
              <span className="font-bold tracking-wider text-slate-900 dark:text-white">PROP NATION</span>
              <span className="text-slate-400 dark:text-slate-500">·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">AFFILIATE &amp; REWARDS</span>
            </div>

            {/* Staggered Headline: TRADE. (0.3s) / EARN. (0.5s) / GET REWARDED. (0.7s) */}
            <h1 className="text-5xl sm:text-6xl lg:text-[68px] font-extrabold tracking-tight leading-[1.03] text-slate-900 dark:text-white">
              <span
                className="block"
                style={{ animation: 'heroReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both' }}
              >
                TRADE.
              </span>
              <span
                className="block"
                style={{ animation: 'heroReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both' }}
              >
                EARN.
              </span>
              <span
                className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 dark:from-white dark:via-emerald-200 dark:to-emerald-400"
                style={{ animation: 'heroReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.7s both' }}
              >
                GET REWARDED.
              </span>
            </h1>

            {/* Supporting & Business Explanation Copy */}
            <div
              className="space-y-3 max-w-xl"
              style={{ animation: 'heroReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.85s both' }}
            >
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                Turn eligible prop-firm purchases into rewards.
              </p>
              <p className="text-base text-slate-600 dark:text-slate-200 leading-relaxed">
                Purchase eligible prop-firm accounts using our referral codes, submit your purchase for verification, earn reward points, and redeem them for real-world rewards.
              </p>
            </div>

            {/* Partner Referral Rewards Pill */}
            <div
              className="inline-flex flex-wrap items-center gap-3 p-1.5 pl-4 rounded-xl bg-white/95 dark:bg-[#0B1015]/90 border border-slate-200 dark:border-white/[0.1] shadow-xs"
              style={{ animation: 'heroReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.95s both' }}
            >
              <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium">
                Partner Referral Rewards:
              </span>
              <Link
                href="#prop-firms"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/35 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 transition-colors"
              >
                <span>Eligible Partner Offers</span>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </Link>
              <Link
                href="#video-academy"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 font-mono text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <span>▶ Watch Video Guides (12)</span>
              </Link>
            </div>

            {/* Primary & Secondary CTAs */}
            <div
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1"
              style={{ animation: 'heroReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) 1.05s both' }}
            >
              <Link
                href="/prop-firms"
                className="group h-13 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm tracking-wide shadow-[0_8px_20px_-6px_rgba(16,185,129,0.3)] hover:shadow-[0_0_32px_-4px_rgba(16,185,129,0.58)] transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2.5"
              >
                <span>START EARNING</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/rewards"
                className="group h-13 px-7 rounded-xl bg-white dark:bg-[#0B1015] hover:bg-slate-100 dark:hover:bg-[#111920] border border-slate-300 dark:border-white/[0.12] hover:border-emerald-500/40 text-slate-900 dark:text-white font-bold text-sm tracking-wide transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2 shadow-xs"
              >
                <span>EXPLORE REWARDS</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div
              className="pt-4 border-t border-slate-200 dark:border-white/[0.08] flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200"
              style={{ animation: 'heroReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) 1.15s both' }}
            >
              <span className="inline-flex items-center gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                <span>Secure Verification</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                <span>Transparent Points</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                <span>Real Rewards</span>
              </span>
            </div>
          </div>

          {/* Layer 4: Illuminated HeroDashboard (#12, #13) */}
          <div
            className="lg:col-span-6 relative z-20"
            style={{ animation: 'heroReveal 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.9s both' }}
          >
            <HeroDashboard />
          </div>
        </div>
      </div>
    </section>
  );
}
