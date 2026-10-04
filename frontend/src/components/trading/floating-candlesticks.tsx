'use client';

import React, { useState, useEffect } from 'react';

interface FloatingCandleProps {
  left: string;
  top: string;
  height: number;
  wickTop: number;
  wickBottom: number;
  type: 'bull' | 'bear';
  delay: string;
  duration: string;
  scale?: number;
  opacity?: string;
  label?: string;
}

// Ordered left-to-right so the sequential light-up wave moves naturally one-by-one across the screen
const CANDLES_DATA: FloatingCandleProps[] = [
  { left: '4%', top: '12%', height: 58, wickTop: 24, wickBottom: 18, type: 'bull', delay: '0s', duration: '7s', scale: 0.9, label: '+2,500 PTS' },
  { left: '8%', top: '76%', height: 52, wickTop: 22, wickBottom: 16, type: 'bull', delay: '1.5s', duration: '7.8s', scale: 0.9, label: '+1,200 PTS' },
  { left: '14%', top: '36%', height: 42, wickTop: 16, wickBottom: 22, type: 'bear', delay: '1.2s', duration: '8.5s', scale: 0.85, label: 'STOP SAFE' },
  { left: '21%', top: '62%', height: 74, wickTop: 30, wickBottom: 26, type: 'bull', delay: '2.5s', duration: '9s', scale: 1.1, label: 'BREAKOUT ↑' },
  { left: '29%', top: '22%', height: 38, wickTop: 20, wickBottom: 14, type: 'bear', delay: '0.8s', duration: '7.5s', scale: 0.8 },
  { left: '64%', top: '78%', height: 60, wickTop: 26, wickBottom: 22, type: 'bear', delay: '2.8s', duration: '8.7s', scale: 0.95, label: 'RETEST' },
  { left: '72%', top: '16%', height: 64, wickTop: 28, wickBottom: 20, type: 'bull', delay: '1.8s', duration: '8s', scale: 1.05, label: '10% YIELD' },
  { left: '81%', top: '48%', height: 48, wickTop: 18, wickBottom: 25, type: 'bear', delay: '3.1s', duration: '9.5s', scale: 0.85 },
  { left: '88%', top: '74%', height: 44, wickTop: 16, wickBottom: 18, type: 'bull', delay: '2.2s', duration: '8.2s', scale: 0.9, label: 'VERIFIED ✓' },
  { left: '92%', top: '26%', height: 80, wickTop: 32, wickBottom: 28, type: 'bull', delay: '0.4s', duration: '6.8s', scale: 1.15, label: '+4,990 PTS' },
];

export function FloatingCandlesticks() {
  const [activeIdx, setActiveIdx] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % CANDLES_DATA.length);
    }, 650);
    return () => clearInterval(timer);
  }, []);

  const prevIdx = (activeIdx - 1 + CANDLES_DATA.length) % CANDLES_DATA.length;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0" aria-hidden="true">
      {/* Background trading grid lines — clearly visible in both Light & Dark Mode */}
      <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.11] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Subtle ambient radial glow so candlesticks pop in both Light & Dark mode */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[420px] rounded-full bg-emerald-500/[0.045] dark:bg-emerald-500/[0.07] blur-[120px]" />

      {/* Floating Candlestick Elements — Lighting up ONE-BY-ONE sequentially */}
      {CANDLES_DATA.map((candle, idx) => {
        const isBull = candle.type === 'bull';
        const isLit = idx === activeIdx;
        const isTrailing = idx === prevIdx;
        const baseScale = candle.scale || 1;
        const currentScale = isLit ? baseScale * 1.16 : isTrailing ? baseScale * 1.05 : baseScale;

        return (
          <div
            key={idx}
            style={{
              left: candle.left,
              top: candle.top,
              animation: `floatSlow ${candle.duration} ease-in-out infinite`,
              animationDelay: candle.delay,
            }}
            className="absolute flex flex-col items-center"
          >
            <div
              style={{
                transform: `scale(${currentScale})`,
              }}
              className={`relative flex flex-col items-center transition-all duration-500 ease-out ${
                isLit
                  ? 'opacity-95 dark:opacity-100 z-10'
                  : isTrailing
                  ? 'opacity-55 dark:opacity-70'
                  : 'opacity-25 dark:opacity-35'
              }`}
            >
              {/* Soft Radial Glow Halo when this candlestick lights up */}
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-28 rounded-full blur-xl transition-opacity duration-500 ${
                  isLit ? 'opacity-90 dark:opacity-100' : isTrailing ? 'opacity-35' : 'opacity-0'
                } ${
                  isBull
                    ? 'bg-emerald-400/45 dark:bg-emerald-400/55'
                    : 'bg-rose-400/45 dark:bg-rose-500/55'
                }`}
              />

              {/* Optional Floating Trade Metric Badge */}
              {candle.label && (
                <span
                  className={`relative z-10 mb-2 font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider border backdrop-blur-xs transition-all duration-500 ${
                    isBull
                      ? isLit
                        ? 'text-emerald-950 bg-emerald-400 border-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.8)] dark:text-slate-950 dark:bg-emerald-400 dark:border-emerald-200 scale-105'
                        : 'text-emerald-700 bg-emerald-100/95 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-950/90 dark:border-emerald-500/50'
                      : isLit
                      ? 'text-white bg-rose-500 border-rose-300 shadow-[0_0_16px_rgba(244,63,94,0.8)] dark:text-white dark:bg-rose-500 dark:border-rose-300 scale-105'
                      : 'text-rose-700 bg-rose-100/95 border-rose-300 dark:text-rose-300 dark:bg-rose-950/90 dark:border-rose-500/50'
                  }`}
                >
                  {candle.label}
                </span>
              )}

              {/* Upper Wick */}
              <div
                style={{ height: `${candle.wickTop}px` }}
                className={`relative z-10 w-[2px] rounded-full transition-all duration-500 ${
                  isBull
                    ? isLit
                      ? 'bg-emerald-500 dark:bg-emerald-300 shadow-[0_0_12px_rgba(16,185,129,1)]'
                      : 'bg-emerald-600 dark:bg-emerald-400 dark:shadow-[0_0_8px_rgba(16,185,129,0.75)]'
                    : isLit
                    ? 'bg-rose-500 dark:bg-rose-300 shadow-[0_0_12px_rgba(244,63,94,1)]'
                    : 'bg-rose-500 dark:bg-rose-400 dark:shadow-[0_0_8px_rgba(244,63,94,0.75)]'
                }`}
              />

              {/* Candle Real Body */}
              <div
                style={{ height: `${candle.height}px` }}
                className={`relative z-10 w-3.5 rounded-[3px] border transition-all duration-500 overflow-hidden ${
                  isBull
                    ? isLit
                      ? 'bg-emerald-400 border-emerald-500 shadow-[0_0_22px_rgba(16,185,129,0.9),0_0_40px_rgba(16,185,129,0.45)] dark:bg-emerald-400 dark:border-emerald-200 dark:shadow-[0_0_26px_rgba(16,185,129,0.95),0_0_48px_rgba(16,185,129,0.55)]'
                      : 'bg-emerald-500/75 border-emerald-600 dark:bg-emerald-500/75 dark:border-emerald-400 dark:shadow-[0_0_14px_rgba(16,185,129,0.4)]'
                    : isLit
                    ? 'bg-rose-500 border-rose-600 shadow-[0_0_22px_rgba(244,63,94,0.9),0_0_40px_rgba(244,63,94,0.45)] dark:bg-rose-400 dark:border-rose-200 dark:shadow-[0_0_26px_rgba(244,63,94,0.95),0_0_48px_rgba(244,63,94,0.55)]'
                    : 'bg-rose-500/75 border-rose-600 dark:bg-rose-500/75 dark:border-rose-400 dark:shadow-[0_0_14px_rgba(244,63,94,0.4)]'
                }`}
              >
                {/* Inner core light reflection when lit */}
                {isLit && (
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent" />
                )}
              </div>

              {/* Lower Wick */}
              <div
                style={{ height: `${candle.wickBottom}px` }}
                className={`relative z-10 w-[2px] rounded-full transition-all duration-500 ${
                  isBull
                    ? isLit
                      ? 'bg-emerald-500 dark:bg-emerald-300 shadow-[0_0_12px_rgba(16,185,129,1)]'
                      : 'bg-emerald-600 dark:bg-emerald-400 dark:shadow-[0_0_8px_rgba(16,185,129,0.75)]'
                    : isLit
                    ? 'bg-rose-500 dark:bg-rose-300 shadow-[0_0_12px_rgba(244,63,94,1)]'
                    : 'bg-rose-500 dark:bg-rose-400 dark:shadow-[0_0_8px_rgba(244,63,94,0.75)]'
                }`}
              />
            </div>
          </div>
        );
      })}

      {/* Subtle Horizontal Resistance & Support Price Levels */}
      <div className="absolute top-[28%] left-0 right-0 border-b border-dashed border-emerald-500/25 dark:border-emerald-500/30 flex items-center justify-end px-4">
        <span className="font-mono text-[9px] font-bold text-emerald-700/70 dark:text-emerald-400/75 tracking-wider">
          TARGET: 20,000 PTS (AIRPODS MAX)
        </span>
      </div>

      <div className="absolute top-[68%] left-0 right-0 border-b border-dashed border-slate-300/90 dark:border-slate-700/80 flex items-center justify-between px-4">
        <span className="font-mono text-[9px] font-bold text-slate-500/75 dark:text-slate-400/75 tracking-wider">
          FLOOR SUPPORT: $0.01 / 1 PT (GUARANTEED LIQUIDITY)
        </span>
        <span className="font-mono text-[9px] font-bold text-slate-500/75 dark:text-slate-400/75">
          CHALLENGE CASHBACK YIELD: 10%
        </span>
      </div>
    </div>
  );
}
