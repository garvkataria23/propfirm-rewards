'use client';

import React from 'react';

interface FloatingCandleProps {
  left: string;
  top: string;
  height: number;
  wickTop: number;
  wickBottom: number;
  type: 'bull' | 'bear';
  scale?: number;
  label?: string;
}

// Ordered left-to-right so the sequential light-up wave moves naturally one-by-one across the screen
const CANDLES_DATA: FloatingCandleProps[] = [
  { left: '4%', top: '12%', height: 58, wickTop: 24, wickBottom: 18, type: 'bull', scale: 0.9, label: '+2,500 PTS' },
  { left: '8%', top: '76%', height: 52, wickTop: 22, wickBottom: 16, type: 'bull', scale: 0.9, label: '+1,200 PTS' },
  { left: '14%', top: '36%', height: 42, wickTop: 16, wickBottom: 22, type: 'bear', scale: 0.85, label: 'STOP SAFE' },
  { left: '21%', top: '62%', height: 74, wickTop: 30, wickBottom: 26, type: 'bull', scale: 1.1, label: 'BREAKOUT ↑' },
  { left: '29%', top: '22%', height: 38, wickTop: 20, wickBottom: 14, type: 'bear', scale: 0.8 },
  { left: '64%', top: '78%', height: 60, wickTop: 26, wickBottom: 22, type: 'bear', scale: 0.95, label: 'RETEST' },
  { left: '72%', top: '16%', height: 64, wickTop: 28, wickBottom: 20, type: 'bull', scale: 1.05, label: '10% YIELD' },
  { left: '81%', top: '48%', height: 48, wickTop: 18, wickBottom: 25, type: 'bear', scale: 0.85 },
  { left: '88%', top: '74%', height: 44, wickTop: 16, wickBottom: 18, type: 'bull', scale: 0.9, label: 'VERIFIED ✓' },
  { left: '92%', top: '26%', height: 80, wickTop: 32, wickBottom: 28, type: 'bull', scale: 1.15, label: '+4,990 PTS' },
];

export function FloatingCandlesticks() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0" aria-hidden="true">
      {/* Background trading grid lines — clearly visible in both Light & Dark Mode */}
      <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.11] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Floating Candlestick Elements — Pure GPU-accelerated sequential one-by-one illumination */}
      {CANDLES_DATA.map((candle, idx) => {
        const isBull = candle.type === 'bull';
        const animName = isBull ? 'candleSequentialBull' : 'candleSequentialBear';
        const stepDelay = `${(idx * 0.65).toFixed(2)}s`;

        return (
          <div
            key={idx}
            style={{
              left: candle.left,
              top: candle.top,
              transform: `scale(${candle.scale || 1})`,
            }}
            className="absolute flex flex-col items-center"
          >
            <div
              style={{
                animation: `${animName} 6.5s ease-in-out ${stepDelay} infinite`,
                willChange: 'transform, opacity',
              }}
              className="relative flex flex-col items-center"
            >
              {/* Optional Floating Trade Metric Badge */}
              {candle.label && (
                <span
                  className={`relative z-10 mb-2 font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider border ${
                    isBull
                      ? 'text-emerald-800 bg-emerald-200/95 border-emerald-400 dark:text-emerald-200 dark:bg-emerald-950/95 dark:border-emerald-400/70'
                      : 'text-rose-800 bg-rose-200/95 border-rose-400 dark:text-rose-200 dark:bg-rose-950/95 dark:border-rose-400/70'
                  }`}
                >
                  {candle.label}
                </span>
              )}

              {/* Upper Wick */}
              <div
                style={{ height: `${candle.wickTop}px` }}
                className={`relative z-10 w-[2px] rounded-full ${
                  isBull
                    ? 'bg-emerald-500 dark:bg-emerald-300'
                    : 'bg-rose-500 dark:bg-rose-300'
                }`}
              />

              {/* Candle Real Body */}
              <div
                style={{ height: `${candle.height}px` }}
                className={`relative z-10 w-3.5 rounded-[3px] border overflow-hidden ${
                  isBull
                    ? 'bg-emerald-500 border-emerald-600 dark:bg-emerald-400 dark:border-emerald-200'
                    : 'bg-rose-500 border-rose-600 dark:bg-rose-400 dark:border-rose-200'
                }`}
              >
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/45 to-transparent" />
              </div>

              {/* Lower Wick */}
              <div
                style={{ height: `${candle.wickBottom}px` }}
                className={`relative z-10 w-[2px] rounded-full ${
                  isBull
                    ? 'bg-emerald-500 dark:bg-emerald-300'
                    : 'bg-rose-500 dark:bg-rose-300'
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
