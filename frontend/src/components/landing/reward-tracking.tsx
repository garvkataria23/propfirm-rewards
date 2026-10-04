'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Truck,
  Headphones,
  Package,
  ArrowRight,
  Coins,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Reveal, TradingVisualBackground, useInView } from './motion-primitives';

/**
 * #24 · REAL REDEMPTION TRACKING
 * Reuses the actual `/dashboard/redemptions` card layout and status badges:
 * - Reward: Premium Headphones
 * - Points: 20,000
 * - Status: ✓ Confirmed -> ✓ Processing -> ✓ Shipped -> ○ Delivered
 * - Clearly marked as Product Preview / Demo Order so no fabricated tracking data is claimed.
 */
export function RewardTracking() {
  const { ref, inView } = useInView(0.25);
  const [activeStage, setActiveStage] = useState(1);

  useEffect(() => {
    if (!inView) return;
    const t1 = setTimeout(() => setActiveStage(2), 500);
    const t2 = setTimeout(() => setActiveStage(3), 1100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [inView]);

  const stages = [
    { label: 'Confirmed', completed: activeStage >= 1, sub: 'Order Verified' },
    { label: 'Processing', completed: activeStage >= 2, sub: 'Packaging & QC' },
    { label: 'Shipped', completed: activeStage >= 3, sub: 'In Transit' },
    { label: 'Delivered', completed: false, sub: 'Destination' },
  ];

  return (
    <section
      ref={ref}
      className="w-full py-20 lg:py-24 bg-[#f8fafc] dark:bg-[#0B1015] border-b border-slate-200 dark:border-white/[0.07] relative overflow-hidden transition-colors duration-300"
    >
      <TradingVisualBackground variant="section" />

      {/* Subtle ambient glow */}
      <div
        className="absolute top-1/2 right-[15%] -translate-y-1/2 w-[520px] h-[340px] rounded-full opacity-[0.07] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, #10b981 0%, transparent 72%)',
          filter: 'blur(95px)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Text */}
          <div className="lg:col-span-5 space-y-4">
            <Reveal>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                REAL REDEMPTION TRACKING
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                YOUR REWARD, TRACKED.
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="text-slate-600 dark:text-slate-200 text-base sm:text-lg leading-relaxed">
                Every physical and digital reward redemption is tracked directly inside your{' '}
                <span className="text-slate-900 dark:text-white font-semibold">Redemptions</span> portal — from confirmation and processing to shipment and delivery.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div className="pt-2">
                <Link href="/dashboard/redemptions">
                  <Button variant="outline" className="gap-2">
                    <span>View Redemptions Portal</span>
                    <ArrowRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Actual `/dashboard/redemptions` Card Component Structure (#24) */}
          <div className="lg:col-span-7">
            <Reveal direction="right">
              <div className="rounded-3xl bg-[#060b18] border border-white/[0.12] overflow-hidden shadow-2xl">
                {/* Browser / Route Bar */}
                <div className="px-5 py-3 bg-[#050914] border-b border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 px-3 py-0.5 rounded-md bg-[#070e20] border border-slate-800 font-mono text-xs text-slate-200">
                      propnation.app/dashboard/redemptions
                    </span>
                  </div>
                  <Badge variant="default" className="font-mono text-[10px]">
                    DEMO PREVIEW
                  </Badge>
                </div>

                {/* Actual Redemption Order Card Body */}
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Top Order Summary matching `/dashboard/redemptions/page.tsx` */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-emerald-500/12 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80"
                          alt="Premium Headphones"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            Reward:
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-emerald-400 font-bold">
                            Audio &amp; Studio Sound
                          </span>
                        </div>
                        <h3 className="text-xl font-extrabold text-white mt-0.5">
                          Premium Headphones
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 mt-1">
                          <Coins className="h-3.5 w-3.5" />
                          <span>Points: 20,000</span>
                        </div>
                      </div>
                    </div>

                    {/* Actual Status Badge from `/dashboard/redemptions` */}
                    <div className="flex flex-col sm:items-end gap-1.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-950/60 text-purple-300 border border-purple-500/30 self-start sm:self-end">
                        <Truck className="h-3.5 w-3.5" />
                        IN TRANSIT (SHIPPED)
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Status Preview · Updated Automatically
                      </span>
                    </div>
                  </div>

                  {/* #24: Status Pipeline (✓ Confirmed -> ✓ Processing -> ✓ Shipped -> ○ Delivered) */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      Status:
                    </div>

                    <div className="relative pt-2">
                      {/* Connecting Progress Bar (Desktop) */}
                      <div
                        className="hidden sm:block absolute top-7 left-8 right-8 h-[2px] bg-slate-800"
                        aria-hidden="true"
                      >
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_10px_#10b981] transition-all duration-700 ease-out"
                          style={{
                            width:
                              activeStage === 1
                                ? '25%'
                                : activeStage === 2
                                ? '55%'
                                : '75%',
                          }}
                        />
                      </div>

                      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                        {stages.map((stage, idx) => {
                          const isCurrentActive = idx === activeStage - 1;
                          return (
                            <div
                              key={stage.label}
                              className={`p-3.5 sm:p-3 rounded-2xl border sm:text-center flex sm:flex-col items-center gap-3 sm:gap-2 transition-all duration-500 ${
                                isCurrentActive
                                  ? 'bg-[#0b1c1a] border-emerald-500/55 shadow-[0_0_24px_-6px_rgba(16,185,129,0.3)]'
                                  : stage.completed
                                  ? 'bg-[#08151f] border-emerald-500/35'
                                  : 'bg-[#080f1e] border-slate-800 opacity-85'
                              }`}
                            >
                              <div className="relative">
                                {isCurrentActive && (
                                  <span
                                    className="absolute -inset-1 rounded-full bg-emerald-400/35 animate-ping"
                                    aria-hidden="true"
                                  />
                                )}
                                <div
                                  className={`relative h-8 w-8 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                                    stage.completed
                                      ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                      : 'bg-slate-900 text-slate-400 border border-slate-700'
                                  }`}
                                >
                                  {stage.completed ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                  ) : (
                                    <Circle className="h-3.5 w-3.5" />
                                  )}
                                </div>
                              </div>

                              <div className="text-left sm:text-center">
                                <div
                                  className={`text-xs font-bold font-mono ${
                                    stage.completed ? 'text-white' : 'text-slate-300'
                                  }`}
                                >
                                  {stage.completed ? `✓ ${stage.label}` : `○ ${stage.label}`}
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  {stage.sub}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-300">
                    <span className="inline-flex items-center gap-2 text-emerald-400 font-semibold">
                      <Package className="h-4 w-4" />
                      Redemption History &amp; Shipment Radar
                    </span>
                    <span className="text-slate-400">
                      Courier tracking reference provided upon dispatch
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
