'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { Reveal, useInView, useAnimatedNumber } from './motion-primitives';

/**
 * TransactionCard reusable component (#55)
 */
export function TransactionCard({
  title,
  points,
  isPositive = true,
  highlighted = false,
  dotColor = 'bg-emerald-400',
}: {
  title: string;
  points: string;
  isPositive?: boolean;
  highlighted?: boolean;
  dotColor?: string;
}) {
  return (
    <div
      className={`px-5 py-3.5 flex items-center justify-between text-sm transition-colors duration-500 ${
        highlighted ? 'bg-emerald-500/[0.09]' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`h-2 w-2 rounded-full ${dotColor}`} />
        <span className="font-semibold text-slate-900 dark:text-white">{title}</span>
      </div>
      <span
        className={`font-mono font-bold ${
          isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
        }`}
      >
        {points}
      </span>
    </div>
  );
}

export function PointsWallet() {
  const { ref, inView } = useInView(0.25);
  const [txStage, setTxStage] = useState<'idle' | 'verified' | 'flying' | 'credited'>('idle');

  const runTransactionAnimation = () => {
    setTxStage('idle');
    setTimeout(() => setTxStage('verified'), 300);
    setTimeout(() => setTxStage('flying'), 1050);
    setTimeout(() => setTxStage('credited'), 1850);
  };

  useEffect(() => {
    if (!inView) return;
    runTransactionAnimation();
  }, [inView]);

  const balance = useAnimatedNumber(
    10000,
    txStage === 'credited' ? 12500 : 10000,
    1400,
    txStage === 'credited'
  );

  return (
    <section
      ref={ref}
      className="w-full py-20 lg:py-24 bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-50 dark:from-[#05080B] dark:via-[#07100F] dark:to-[#05080B] border-b border-slate-200 dark:border-white/[0.08] relative overflow-hidden transition-colors duration-300"
    >
      {/* #25: Very subtle upward points curve in background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]" aria-hidden="true">
        <svg className="w-full h-full" viewBox="0 0 1440 500" fill="none" preserveAspectRatio="none">
          <path
            d="M0 430 C 320 400, 620 330, 960 220 C 1180 150, 1320 110, 1440 80"
            stroke="#10b981"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Heading + Point Transaction Fly-In */}
          <div className="lg:col-span-5 space-y-6">
            <Reveal>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/12 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider">
                TRADER POINTS WALLET
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
                EVERY ELIGIBLE PURCHASE GETS YOU CLOSER.
              </h2>
            </Reveal>

            <Reveal delay={140}>
              <p className="text-slate-600 dark:text-slate-200 text-base leading-relaxed">
                Every verified prop-firm purchase credits points directly to your balance. Watch your points accumulate toward your chosen reward.
              </p>
            </Reveal>

            {/* Point Transaction Fly-In Card */}
            <Reveal delay={200}>
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1015] border border-slate-200 dark:border-white/[0.1] shadow-sm space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-300">
                  <span>VERIFICATION EVENT</span>
                  <button
                    type="button"
                    onClick={runTransactionAnimation}
                    className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-semibold cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Replay
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#06090C] border border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        txStage !== 'idle'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-200 dark:bg-white/[0.06] text-slate-500 dark:text-slate-300'
                      }`}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">✓ Purchase Verified</div>
                      <div className="text-xs text-slate-600 dark:text-slate-300">Eligible Challenge Account</div>
                    </div>
                  </div>

                  {/* Visually moving +2,500 Points badge */}
                  <div
                    className={`px-3.5 py-1.5 rounded-lg font-mono text-xs sm:text-sm font-extrabold transition-all duration-700 inline-flex items-center gap-1.5 ${
                      txStage === 'flying'
                        ? 'bg-emerald-400 text-slate-950 translate-x-2 -translate-y-0.5 scale-105 shadow-[0_0_24px_rgba(16,185,129,0.5)]'
                        : txStage === 'credited'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/35'
                        : 'bg-slate-200 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span>+2,500 Points</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-200 px-1">
                  <span>10,000</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">→ 11,000 →</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">12,500 PTS</span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Large Fintech Wallet Card */}
          <div className="lg:col-span-7">
            <Reveal direction="right">
              <div className="rounded-3xl bg-white dark:bg-[#0B1015] border border-slate-200 dark:border-white/[0.12] p-6 sm:p-8 shadow-xl dark:shadow-[0_28px_65px_-15px_rgba(0,0,0,0.88)] space-y-6 relative overflow-hidden">
                {/* Soft Emerald Wallet Illumination */}
                <div
                  className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-emerald-500/12 blur-3xl pointer-events-none"
                  aria-hidden="true"
                />

                {/* Wallet Header & Balance */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-white/[0.08] pb-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                      <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>TOTAL REWARD BALANCE</span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-3">
                      <span className="text-4xl sm:text-5xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
                        {balance.toLocaleString()}
                      </span>
                      <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                        POINTS
                      </span>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold self-start sm:self-auto">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>+2,500 this week</span>
                  </div>
                </div>

                {/* Smooth Line Chart Clearly Labeled REWARD POINTS (10,000 -> 11,000 -> 12,500) */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#06090C] border border-slate-200 dark:border-white/[0.08] space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-700 dark:text-slate-200 font-bold tracking-wider">REWARD POINTS</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      10,000 → 11,000 → 12,500
                    </span>
                  </div>
                  <svg className="w-full h-24 overflow-visible" viewBox="0 0 500 90" fill="none">
                    <defs>
                      <linearGradient id="walletChartFill2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.24" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 78 C 80 74, 140 62, 230 50 C 310 42, 360 36, 420 22 C 455 14, 480 10, 500 8 L 500 90 L 0 90 Z"
                      fill="url(#walletChartFill2)"
                    />
                    <path
                      d="M0 78 C 80 74, 140 62, 230 50 C 310 42, 360 36, 420 22 C 455 14, 480 10, 500 8"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="600"
                      strokeDashoffset={inView ? '0' : '600'}
                      className="transition-all duration-1500 ease-out"
                    />
                    <circle cx="15" cy="76" r="3.5" fill="#64748b" />
                    <circle cx="230" cy="50" r="4" fill="#06b6d4" />
                    <circle cx="500" cy="8" r="5" fill="#10b981" />
                  </svg>
                </div>

                {/* Transaction List (#21) */}
                <div className="space-y-2.5">
                  <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Recent Transactions
                  </div>

                  <div className="divide-y divide-slate-200 dark:divide-white/[0.08] rounded-2xl bg-slate-50 dark:bg-[#080c0b] border border-slate-200 dark:border-white/[0.08] overflow-hidden">
                    <TransactionCard
                      title="Purchase Verified"
                      points="+2,500"
                      isPositive
                      highlighted={txStage === 'credited'}
                      dotColor="bg-emerald-400"
                    />
                    <TransactionCard
                      title="Bonus Earned"
                      points="+1,000"
                      isPositive
                      dotColor="bg-cyan-400"
                    />
                    <TransactionCard
                      title="Reward Redeemed"
                      points="-5,000"
                      isPositive={false}
                      dotColor="bg-slate-400"
                    />
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
