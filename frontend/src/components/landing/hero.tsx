'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Copy, Check, Sparkles, Gift } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  const handleCopyNation = () => {
    navigator.clipboard?.writeText('NATION').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 dark:from-[#030506] dark:via-[#05080B] dark:to-[#07100F] border-b border-slate-200 dark:border-white/[0.08] pt-6 pb-18 lg:pt-10 lg:pb-24 transition-colors duration-300">
      {/* Layers 1, 2 & 3: Atmospheric Lighting, Masked Grid, Floating Candlesticks & Price Line */}
      <TradingVisualBackground variant="hero" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* TOP INSTANT REFERRAL CODE BANNER — Immediately visible when landing page opens */}
        <div
          className="mb-8 lg:mb-10 flex justify-center"
          style={{ animation: 'heroReveal 0.35s cubic-bezier(0.16, 1, 0.3, 1) 0.02s both' }}
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-5 px-4 py-2 sm:px-6 sm:py-2.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/60 border-2 border-emerald-500/40 dark:border-emerald-400/40 shadow-[0_8px_30px_-6px_rgba(16,185,129,0.28)] backdrop-blur-md">
            <span className="text-xs sm:text-sm font-black tracking-wide uppercase text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-base leading-none">🎁</span>
              <span>
                BUY WITH CODE{' '}
                <span className="font-mono font-black text-emerald-700 dark:text-emerald-300 underline decoration-emerald-500/60 underline-offset-4">
                  NATION
                </span>{' '}
                → EARN REWARD POINTS
              </span>
            </span>

            <button
              type="button"
              onClick={handleCopyNation}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl bg-white dark:bg-[#0B1015] hover:bg-emerald-50 dark:hover:bg-emerald-950 border border-emerald-500/50 font-mono text-xs font-black text-emerald-700 dark:text-emerald-300 shadow-2xs transition-all cursor-pointer active:scale-95"
              title="Click to copy referral code NATION"
            >
              <span className="tracking-widest">CODE: NATION</span>
              {copied ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                  [COPIED]
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-200">
                  <Copy className="h-3.5 w-3.5" />
                  [COPY]
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Brand Message, Value Proposition & CTAs */}
          <div className="lg:col-span-5 space-y-6 relative z-20">
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
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">USE CODE: NATION</span>
            </div>

            {/* Staggered Headline: TRADE. EARN. (single line) / GET REWARDED. */}
            <h1 className="text-5xl sm:text-6xl lg:text-[64px] font-extrabold tracking-tight leading-[1.05] text-slate-900 dark:text-white">
              <span className="block whitespace-nowrap">
                <span
                  className="inline-block"
                  style={{ animation: 'heroReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both' }}
                >
                  TRADE.
                </span>{' '}
                <span
                  className="inline-block"
                  style={{ animation: 'heroReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both' }}
                >
                  EARN.
                </span>
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
                Use Referral Code{' '}
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/40 font-mono text-emerald-700 dark:text-emerald-300">
                  NATION
                </span>{' '}
                to turn prop-firm purchases into real rewards.
              </p>
              <p className="text-base text-slate-600 dark:text-slate-200 leading-relaxed">
                Purchase eligible prop-firm accounts using our referral code <strong className="text-slate-900 dark:text-white font-mono">NATION</strong>, submit your purchase for verification, earn reward points, and redeem them for real-world rewards.
              </p>
            </div>

            {/* Prominent Referral Code NATION Box + Quick Links */}
            <div
              className="p-4 rounded-2xl bg-white/95 dark:bg-[#0B1015]/95 border-2 border-emerald-500/40 dark:border-emerald-500/35 shadow-[0_12px_32px_-8px_rgba(16,185,129,0.22)] space-y-3 max-w-xl"
              style={{ animation: 'heroReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.95s both' }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>OFFICIAL REFERRAL CODE</span>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    Use <span className="font-mono text-emerald-600 dark:text-emerald-400">NATION</span> to Get Rewards
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyNation}
                  className="group flex items-center justify-between sm:justify-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-500/12 hover:bg-emerald-500/20 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 border-2 border-dashed border-emerald-500/60 transition-all cursor-pointer active:scale-95"
                >
                  <div className="text-left">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      REFERRAL CODE
                    </div>
                    <div className="text-lg font-mono font-black tracking-widest text-emerald-700 dark:text-emerald-300">
                      NATION
                    </div>
                  </div>
                  <span className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-mono text-xs font-extrabold inline-flex items-center gap-1.5 shadow-xs">
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>COPY</span>
                      </>
                    )}
                  </span>
                </button>
              </div>

              <div className="pt-2.5 border-t border-slate-200/80 dark:border-white/[0.08] flex flex-wrap items-center gap-2.5">
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
            className="lg:col-span-7 relative z-20"
            style={{ animation: 'heroReveal 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.9s both' }}
          >
            <HeroDashboard />
          </div>
        </div>
      </div>
    </section>
  );
}
