'use client';

import React from 'react';

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

const CANDLES_DATA: FloatingCandleProps[] = [
  { left: '4%', top: '12%', height: 58, wickTop: 24, wickBottom: 18, type: 'bull', delay: '0s', duration: '7s', scale: 0.9, label: '+2,500 PTS' },
  { left: '12%', top: '35%', height: 42, wickTop: 16, wickBottom: 22, type: 'bear', delay: '1.2s', duration: '8.5s', scale: 0.8 },
  { left: '20%', top: '65%', height: 74, wickTop: 30, wickBottom: 26, type: 'bull', delay: '2.5s', duration: '9s', scale: 1.1, label: 'BREAKOUT ↑' },
  { left: '28%', top: '22%', height: 36, wickTop: 20, wickBottom: 14, type: 'bear', delay: '0.8s', duration: '7.5s', scale: 0.75 },
  { left: '72%', top: '15%', height: 64, wickTop: 28, wickBottom: 20, type: 'bull', delay: '1.8s', duration: '8s', scale: 1.05, label: '10% YIELD' },
  { left: '82%', top: '48%', height: 48, wickTop: 18, wickBottom: 25, type: 'bear', delay: '3.1s', duration: '9.5s', scale: 0.85 },
  { left: '91%', top: '28%', height: 80, wickTop: 32, wickBottom: 28, type: 'bull', delay: '0.4s', duration: '6.8s', scale: 1.15, label: '+4,990 PTS' },
  { left: '88%', top: '75%', height: 40, wickTop: 14, wickBottom: 18, type: 'bull', delay: '2.2s', duration: '8.2s', scale: 0.8 },
  { left: '8%', top: '82%', height: 52, wickTop: 22, wickBottom: 16, type: 'bull', delay: '1.5s', duration: '7.8s', scale: 0.9 },
  { left: '65%', top: '80%', height: 60, wickTop: 26, wickBottom: 22, type: 'bear', delay: '2.8s', duration: '8.7s', scale: 0.95 },
];

export function FloatingCandlesticks() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0" aria-hidden="true">
      {/* Background trading grid lines — clearly visible in both Light & Dark Mode */}
      <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.11] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Subtle ambient radial glow so candlesticks pop in both Light & Dark mode */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[420px] rounded-full bg-emerald-500/[0.045] dark:bg-emerald-500/[0.07] blur-[120px]" />

      {/* Floating Candlestick Elements */}
      {CANDLES_DATA.map((candle, idx) => {
        const isBull = candle.type === 'bull';
        return (
          <div
            key={idx}
            style={{
              left: candle.left,
              top: candle.top,
              animation: `floatSlow ${candle.duration} ease-in-out infinite`,
              animationDelay: candle.delay,
              transform: `scale(${candle.scale || 1})`,
            }}
            className="absolute flex flex-col items-center opacity-35 dark:opacity-55 transition-opacity"
          >
            {/* Optional Floating Trade Metric Badge */}
            {candle.label && (
              <span
                className={`mb-2 font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs tracking-wider border backdrop-blur-xs ${
                  isBull
                    ? 'text-emerald-700 bg-emerald-100/95 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-950/90 dark:border-emerald-500/50'
                    : 'text-rose-700 bg-rose-100/95 border-rose-300 dark:text-rose-300 dark:bg-rose-950/90 dark:border-rose-500/50'
                }`}
              >
                {candle.label}
              </span>
            )}

            {/* Upper Wick */}
            <div
              style={{ height: `${candle.wickTop}px` }}
              className={`w-[1.5px] rounded-full ${
                isBull
                  ? 'bg-emerald-600 dark:bg-emerald-400 dark:shadow-[0_0_8px_rgba(16,185,129,0.75)]'
                  : 'bg-rose-500 dark:bg-rose-400 dark:shadow-[0_0_8px_rgba(244,63,94,0.75)]'
              }`}
            />

            {/* Candle Real Body */}
            <div
              style={{ height: `${candle.height}px` }}
              className={`w-3.5 rounded-[3px] border transition-all ${
                isBull
                  ? 'bg-emerald-500/75 border-emerald-600 dark:bg-emerald-500/75 dark:border-emerald-400 dark:shadow-[0_0_14px_rgba(16,185,129,0.4)]'
                  : 'bg-rose-500/75 border-rose-600 dark:bg-rose-500/75 dark:border-rose-400 dark:shadow-[0_0_14px_rgba(244,63,94,0.4)]'
              }`}
            />

            {/* Lower Wick */}
            <div
              style={{ height: `${candle.wickBottom}px` }}
              className={`w-[1.5px] rounded-full ${
                isBull
                  ? 'bg-emerald-600 dark:bg-emerald-400 dark:shadow-[0_0_8px_rgba(16,185,129,0.75)]'
                  : 'bg-rose-500 dark:bg-rose-400 dark:shadow-[0_0_8px_rgba(244,63,94,0.75)]'
              }`}
            />
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
