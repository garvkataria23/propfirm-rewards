'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  Reveal,
  TradingVisualBackground,
  useInView,
  useMouseParallax,
} from './motion-primitives';
import { DashboardPreview } from './dashboard-preview';

/**
 * #2–#6, #26–#31, #35–#36 · REAL DASHBOARD SHOWCASE
 * Heading (#30): SEE YOUR REWARDS. TRACK YOUR PROGRESS.
 * Supporting (#30): "Everything you need to manage verified purchases, reward points and redemptions in one place."
 * CTA (#30): EXPLORE DASHBOARD →
 * Renders the reusable <DashboardPreview mode="full" /> with subtle desktop mouse parallax (#29):
 * - Background: ±8px
 * - Trading chart: ±5px
 * - Dashboard: ±2.5px
 * - Foreground: ±5px
 */
export function DashboardShowcase() {
  const { ref, inView } = useInView(0.2);
  const parallax = useMouseParallax();

  return (
    <section
      id="dashboard-showcase"
      ref={ref}
      className="w-full py-20 lg:py-26 bg-slate-50 dark:bg-[#081118] border-b border-slate-200 dark:border-white/[0.08] relative overflow-hidden transition-colors duration-300"
    >
      {/* #26, #29: Background Layer (±8px parallax on desktop) */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-200 ease-out"
        style={{
          transform: `translate3d(${parallax.x * -8}px, ${parallax.y * -6}px, 0)`,
        }}
        aria-hidden="true"
      >
        <TradingVisualBackground variant="section" />
      </div>

      {/* #29: Foreground Parallax Particles (±5px on desktop) */}
      <div
        className="hidden lg:block absolute inset-0 pointer-events-none z-10 transition-transform duration-200 ease-out"
        style={{
          transform: `translate3d(${parallax.x * 5}px, ${parallax.y * 5}px, 0)`,
        }}
        aria-hidden="true"
      >
        <span className="absolute top-24 left-[12%] h-1.5 w-1.5 rounded-full bg-emerald-400/35" />
        <span className="absolute top-40 right-[10%] h-2 w-2 rounded-full bg-cyan-400/30" />
        <span className="absolute bottom-24 left-[18%] h-1.5 w-1.5 rounded-full bg-emerald-400/30" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* #30: Dashboard Section Title & CTA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <Reveal>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                REAL PRODUCT DASHBOARD
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                SEE YOUR REWARDS. TRACK YOUR PROGRESS.
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="text-slate-600 dark:text-slate-200 text-base sm:text-lg max-w-2xl leading-relaxed">
                Everything you need to manage verified purchases, reward points and redemptions in one place.
              </p>
            </Reveal>
          </div>

          <Reveal direction="right">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-all"
            >
              <span>EXPLORE DASHBOARD</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        {/* #2, #3, #5, #28, #29: Actual Prop Nation Dashboard inside Browser Frame (±2.5px parallax) */}
        <Reveal delay={160}>
          <div
            className="relative transition-transform duration-200 ease-out"
            style={{
              transform: `translate3d(${parallax.x * -2.5}px, ${parallax.y * -2.5}px, 0)`,
            }}
          >
            {/* Soft Green Atmospheric Glow Behind Real Dashboard (#26, #28) */}
            <div
              className="absolute -inset-6 rounded-[36px] opacity-30 pointer-events-none blur-3xl"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 40%, rgba(16, 185, 129, 0.32), rgba(6, 182, 212, 0.14) 55%, transparent 78%)',
              }}
              aria-hidden="true"
            />

            <DashboardPreview mode="full" active={inView} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
