'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Unlock,
  ArrowDown,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { Reveal, TradingVisualBackground, useInView } from './motion-primitives';

/**
 * #30 · REWARD UNLOCK ATMOSPHERE
 * Starts at 15,000 / 20,000 (████████████░░░░) -> 16,000 -> 17,500 -> 18,500 -> 20,000 (100% ████████████████)
 * When unlocked:
 * - Soft green radial pulse
 * - Product illumination
 * - Tiny ambient particles
 * - Border highlight
 */
export function RewardUnlock({
  points,
  onReplay,
}: {
  points: number;
  onReplay: () => void;
}) {
  const unlocked = points >= 20000;
  const remaining = Math.max(0, 20000 - points);
  const progressPercent = Math.min(100, Math.round((points / 20000) * 100));
  const totalSegments = 16;
  const filledSegments = Math.round((points / 20000) * totalSegments);

  return (
    <div
      className={`rounded-3xl bg-white dark:bg-[#0B1015] border p-6 sm:p-8 transition-all duration-500 relative overflow-hidden ${
        unlocked
          ? 'border-emerald-500/60 shadow-[0_0_55px_-12px_rgba(16,185,129,0.38)]'
          : 'border-slate-200 dark:border-white/[0.1] shadow-xl dark:shadow-2xl'
      }`}
    >
      {/* #30: Soft green radial pulse & tiny particles on unlock */}
      {unlocked && (
        <>
          <div
            className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/18 blur-3xl pointer-events-none transition-opacity duration-700"
            aria-hidden="true"
          />
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <span className="absolute top-10 right-24 h-1.5 w-1.5 rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="absolute top-28 right-12 h-1.5 w-1.5 rounded-full bg-cyan-400 opacity-70" />
            <span className="absolute bottom-20 left-16 h-1.5 w-1.5 rounded-full bg-emerald-300 opacity-65" />
          </div>
        </>
      )}

      {/* Top Bar: POINT BALANCE + Replay */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-5 mb-6">
        <div>
          <div className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-300">
            POINT BALANCE
          </div>
          <div className="text-3xl sm:text-4xl font-mono font-extrabold text-slate-900 dark:text-white mt-1">
            {points.toLocaleString('en-US')}{' '}
            <span className="text-base text-slate-500 dark:text-slate-300 font-normal">/ 20,000</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onReplay}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.09] border border-slate-200 dark:border-white/[0.1] text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          Replay Unlock
        </button>
      </div>

      {/* Product Row: Premium Headphones (20,000 Points) */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-[#06090C] border border-slate-200 dark:border-white/[0.09] mb-6">
        <div className="flex items-center gap-4">
          <div
            className={`h-20 w-20 rounded-xl overflow-hidden border transition-all duration-700 shrink-0 ${
              unlocked
                ? 'border-emerald-400/80 brightness-110 shadow-[0_0_28px_rgba(16,185,129,0.45)]'
                : 'border-slate-300 dark:border-white/15 brightness-95 dark:brightness-80'
            }`}
          >
            <img
              src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&auto=format&fit=crop&q=80"
              alt="Premium Headphones"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-300">
              TARGET REWARD
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Premium Headphones
            </h3>
            <div className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              20,000 Points
            </div>
          </div>
        </div>

        <div className="self-start sm:self-center">
          {unlocked ? (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-mono text-xs font-extrabold shadow-[0_0_20px_rgba(16,185,129,0.45)]">
              <CheckCircle2 className="h-4 w-4" />
              ✓ REWARD UNLOCKED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] text-slate-700 dark:text-slate-200 font-mono text-xs font-bold">
              {remaining.toLocaleString('en-US')} points away
            </span>
          )}
        </div>
      </div>

      {/* Segmented Progress Bar */}
      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-700 dark:text-slate-200 font-semibold">
            Current: {points.toLocaleString('en-US')} / 20,000
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{progressPercent}%</span>
        </div>

        <div className="grid grid-cols-16 gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-[#06090C] border border-slate-200 dark:border-white/[0.08]">
          {Array.from({ length: totalSegments }).map((_, idx) => {
            const filled = idx < filledSegments;
            return (
              <div
                key={idx}
                className={`h-3 rounded-xs transition-all duration-300 ${
                  filled
                    ? 'bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.45)]'
                    : 'bg-slate-300/80 dark:bg-white/[0.08]'
                }`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
          {unlocked ? (
            <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Unlock className="h-4 w-4" />
              ✓ REWARD UNLOCKED
            </span>
          ) : (
            <span className="text-slate-600 dark:text-slate-200 font-mono">
              {remaining.toLocaleString('en-US')} points away
            </span>
          )}

          <Link
            href="/rewards"
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-bold inline-flex items-center gap-1"
          >
            <span>Explore Vault</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function RewardProgress() {
  const { ref, inView } = useInView(0.25);
  const [points, setPoints] = useState(15000);
  const [selectedChallenge, setSelectedChallenge] = useState<number>(2);

  const runUnlockSequence = () => {
    setPoints(15000);
    const t1 = setTimeout(() => setPoints(16000), 550);
    const t2 = setTimeout(() => setPoints(17500), 1050);
    const t3 = setTimeout(() => setPoints(18500), 1550);
    const t4 = setTimeout(() => setPoints(20000), 2050);
    return [t1, t2, t3, t4];
  };

  useEffect(() => {
    if (!inView) return;
    const timers = runUnlockSequence();
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  const challenges = [
    { name: '$50 Challenge', points: '+1,000 Points' },
    { name: '$100 Challenge', points: '+2,500 Points' },
    { name: '$200 Challenge', points: '+5,000 Points' },
  ];

  const handleSelectChallenge = (idx: number) => {
    setSelectedChallenge(idx);
    runUnlockSequence();
  };

  return (
    <section
      ref={ref}
      className="w-full py-20 lg:py-24 bg-slate-50 dark:bg-[#07100F] border-b border-slate-200 dark:border-white/[0.08] relative overflow-hidden transition-colors duration-300"
    >
      {/* #31: Subtle trading environment behind challenge cards */}
      <TradingVisualBackground variant="challenge" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Reveal>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/12 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider">
              PURCHASE → POINTS → PROGRESS → REWARD
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              WATCH HOW FAST YOU UNLOCK REAL GEAR
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="text-slate-600 dark:text-slate-200 text-base">
              See how eligible challenge purchases move your point balance from 15,000 to 20,000 to unlock your reward.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left: Challenge Tiers + Visual Flow */}
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {challenges.map((ch, idx) => {
                const active = selectedChallenge === idx;
                return (
                  <button
                    key={ch.name}
                    type="button"
                    onClick={() => handleSelectChallenge(idx)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      active
                        ? 'bg-emerald-50/80 dark:bg-[#0F1C1A] border-emerald-500/55 shadow-[0_12px_30px_-10px_rgba(16,185,129,0.28)] -translate-y-0.5'
                        : 'bg-white dark:bg-[#0B1015] border-slate-200 dark:border-white/[0.09] hover:border-slate-300 dark:hover:border-white/[0.18]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold ${
                          active
                            ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                            : 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        0{idx + 1}
                      </div>
                      <div>
                        <div className="text-base font-extrabold text-slate-900 dark:text-white">{ch.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-300">Eligible Referral Purchase</div>
                      </div>
                    </div>

                    <span className="font-mono text-sm font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-500/12 border border-emerald-500/30 px-3 py-1 rounded-lg">
                      {ch.points}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* #31: Glowing Green Data Line Moving Toward 20,000 POINTS -> REWARD UNLOCKED */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1015] border border-slate-200 dark:border-white/[0.1] shadow-xs space-y-2.5 text-xs font-mono relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-200">
                <span>1. Purchase</span>
                <span className="text-slate-900 dark:text-white font-bold">{challenges[selectedChallenge].name}</span>
              </div>
              <div className="flex justify-center text-emerald-600 dark:text-emerald-400">
                <ArrowDown className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-200">
                <span>2. Points</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{challenges[selectedChallenge].points}</span>
              </div>
              {/* Animated Data Line */}
              <div className="h-1 w-full rounded-full bg-slate-200 dark:bg-white/[0.07] overflow-hidden my-1">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_10px_#10b981] transition-all duration-500"
                  style={{ width: `${Math.min(100, ((points - 14000) / 6000) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-200">
                <span>3. Progress</span>
                <span className="text-slate-900 dark:text-white font-bold">15,000 → {points.toLocaleString('en-US')} POINTS</span>
              </div>
              <div className="flex justify-center text-emerald-600 dark:text-emerald-400">
                <ArrowDown className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-200">4. Reward</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                  {points >= 20000 ? '✓ REWARD UNLOCKED' : 'UNLOCKING...'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Signature Reward Unlock Component */}
          <div className="lg:col-span-7">
            <RewardUnlock points={points} onReplay={runUnlockSequence} />
          </div>
        </div>
      </div>
    </section>
  );
}
