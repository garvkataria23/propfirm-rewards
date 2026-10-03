'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Zap,
  BarChart2,
  Maximize2,
} from 'lucide-react';

interface CandleData {
  open: number;
  close: number;
  high: number;
  low: number;
}

const INITIAL_CANDLES: CandleData[] = [
  { open: 70, close: 82, high: 90, low: 65 },
  { open: 82, close: 76, high: 88, low: 72 },
  { open: 76, close: 92, high: 96, low: 74 },
  { open: 92, close: 88, high: 98, low: 85 },
  { open: 88, close: 104, high: 110, low: 84 },
  { open: 104, close: 118, high: 122, low: 100 },
  { open: 118, close: 110, high: 124, low: 106 },
  { open: 110, close: 126, high: 132, low: 108 },
  { open: 126, close: 140, high: 145, low: 122 },
  { open: 140, close: 134, high: 144, low: 130 },
  { open: 134, close: 148, high: 154, low: 132 },
  { open: 148, close: 160, high: 168, low: 145 },
  { open: 160, close: 155, high: 166, low: 150 },
  { open: 155, close: 172, high: 178, low: 152 },
];

export function LiveTradingChart() {
  const [activeTf, setActiveTf] = useState('15M');
  const [liveClose, setLiveClose] = useState(185);
  const [isLivePump, setIsLivePump] = useState(true);
  const [pointsRate, setPointsRate] = useState(12500);

  // Live price tick simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveClose((prev) => {
        const delta = Math.floor(Math.random() * 9) - 3;
        const next = Math.max(165, Math.min(205, prev + delta));
        setIsLivePump(next >= prev);
        return next;
      });
      setPointsRate((prev) => {
        const delta = (Math.random() > 0.4 ? 1 : -1) * 10;
        return Math.max(12400, Math.min(12650, prev + delta));
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const chartHeight = 220;
  const maxPrice = 210;
  const minPrice = 60;
  const priceRange = maxPrice - minPrice;

  const getY = (val: number) => {
    return chartHeight - ((val - minPrice) / priceRange) * chartHeight;
  };

  const timeframes = ['1M', '5M', '15M', '1H', '4H', '1D'];

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-[#0c1313] border border-slate-200/90 dark:border-emerald-500/25 p-4 sm:p-5 shadow-xl shadow-slate-200/60 dark:shadow-black/60 relative overflow-hidden transition-colors">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <BarChart2 className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  PROP / REWARDS
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                  LIVE YIELD 10%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {pointsRate.toLocaleString()} PTS
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  ≈ ${(pointsRate * 0.01).toFixed(2)} USD Cashout
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTf(tf)}
              className={`px-2 py-1 text-[11px] font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                activeTf === tf
                  ? 'bg-white dark:bg-emerald-500 text-slate-900 dark:text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Candlestick SVG Chart Area */}
      <div className="relative h-[220px] w-full my-4 select-none">
        {/* Horizontal grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40 dark:opacity-20">
          <div className="border-b border-dashed border-slate-300 dark:border-emerald-500/30 w-full" />
          <div className="border-b border-dashed border-slate-300 dark:border-emerald-500/30 w-full" />
          <div className="border-b border-dashed border-slate-300 dark:border-emerald-500/30 w-full" />
          <div className="border-b border-dashed border-slate-300 dark:border-emerald-500/30 w-full" />
        </div>

        {/* Candlestick bars rendering */}
        <div className="relative h-full w-full flex items-end justify-between px-2 sm:px-4">
          {INITIAL_CANDLES.map((candle, idx) => {
            const isBull = candle.close >= candle.open;
            const topPrice = Math.max(candle.open, candle.close);
            const botPrice = Math.min(candle.open, candle.close);

            const topY = getY(topPrice);
            const botY = getY(botPrice);
            const highY = getY(candle.high);
            const lowY = getY(candle.low);

            const bodyHeight = Math.max(4, botY - topY);
            const wickHeight = lowY - highY;

            return (
              <div
                key={idx}
                className="relative flex flex-col items-center group cursor-crosshair"
                style={{ height: `${chartHeight}px`, width: '4%' }}
              >
                {/* Upper to Lower Wick */}
                <div
                  style={{
                    position: 'absolute',
                    top: `${highY}px`,
                    height: `${wickHeight}px`,
                    width: '1.5px',
                  }}
                  className={
                    isBull
                      ? 'bg-emerald-600 dark:bg-emerald-400'
                      : 'bg-rose-500 dark:bg-rose-400'
                  }
                />

                {/* Real Candle Body */}
                <div
                  style={{
                    position: 'absolute',
                    top: `${topY}px`,
                    height: `${bodyHeight}px`,
                    width: '100%',
                    minWidth: '8px',
                    maxWidth: '14px',
                  }}
                  className={`rounded-[2px] border transition-all ${
                    isBull
                      ? 'bg-emerald-500/90 border-emerald-600 dark:bg-emerald-500 dark:border-emerald-400 dark:shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      : 'bg-rose-500/90 border-rose-600 dark:bg-rose-500 dark:border-rose-400'
                  }`}
                />
              </div>
            );
          })}

          {/* Rightmost LIVE forming candle */}
          <div
            className="relative flex flex-col items-center"
            style={{ height: `${chartHeight}px`, width: '5%' }}
          >
            {/* Live Wick */}
            <div
              style={{
                position: 'absolute',
                top: `${getY(Math.max(172, liveClose) + 6)}px`,
                height: `${Math.max(10, getY(Math.min(172, liveClose) - 6) - getY(Math.max(172, liveClose) + 6))}px`,
                width: '2px',
              }}
              className={
                isLivePump
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-rose-500 animate-pulse'
              }
            />

            {/* Live Candle Body */}
            <div
              style={{
                position: 'absolute',
                top: `${getY(Math.max(172, liveClose))}px`,
                height: `${Math.max(6, getY(Math.min(172, liveClose)) - getY(Math.max(172, liveClose)))}px`,
                width: '100%',
                minWidth: '10px',
                maxWidth: '16px',
              }}
              className={`rounded-[2px] border transition-all duration-300 ${
                isLivePump
                  ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                  : 'bg-rose-500 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
              }`}
            />

            {/* Current Price Crosshair Ping Tag */}
            <div
              style={{
                position: 'absolute',
                top: `${getY(liveClose) - 10}px`,
                left: '100%',
              }}
              className="ml-1 z-10 flex items-center"
            >
              <span className="font-mono text-[9px] font-black px-1.5 py-0.5 rounded text-white bg-emerald-600 shadow-md animate-pulse whitespace-nowrap">
                {liveClose} PTS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Trading Orderbook & Sentiment Status Bar */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span>ORDERBOOK ACCRUAL:</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">+10 PTS / $1.00</strong>
          </div>
          <div className="hidden sm:block text-slate-300 dark:text-slate-700">|</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            SPREAD: <strong className="text-slate-900 dark:text-white">0.0 (ZERO MARKUP)</strong>
          </div>
        </div>

        {/* Sentiment Bar */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400">MARKET BIAS:</span>
          <div className="h-2 w-28 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-500 w-[84%]" title="84% Bullish Purchases" />
            <div className="h-full bg-rose-500 w-[16%]" title="16% Redemptions" />
          </div>
          <span className="font-mono text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
            84% BULLS
          </span>
        </div>
      </div>
    </div>
  );
}
