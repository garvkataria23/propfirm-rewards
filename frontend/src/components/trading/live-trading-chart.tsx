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
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Coins,
  ChevronDown,
} from 'lucide-react';

interface CandleData {
  open: number;
  close: number;
  high: number;
  low: number;
}

interface AssetInfo {
  symbol: string;
  name: string;
  price: string;
  change: string;
  isPositive: boolean;
  basePoints: number;
  spread: string;
}

const ASSETS: AssetInfo[] = [
  {
    symbol: 'PROP / REWARDS',
    name: 'PropNation Yield Index',
    price: '12,500 PTS',
    change: '+18.4%',
    isPositive: true,
    basePoints: 12500,
    spread: '0.0 RAW',
  },
  {
    symbol: 'XAU / USD',
    name: 'Spot Gold vs US Dollar',
    price: '$2,654.80',
    change: '+1.42%',
    isPositive: true,
    basePoints: 2654,
    spread: '0.8 pips',
  },
  {
    symbol: 'EUR / USD',
    name: 'Euro vs US Dollar',
    price: '1.08425',
    change: '+0.34%',
    isPositive: true,
    basePoints: 1084,
    spread: '0.1 pips',
  },
  {
    symbol: 'BTC / USD',
    name: 'Bitcoin Perpetual',
    price: '$67,420',
    change: '+3.85%',
    isPositive: true,
    basePoints: 6742,
    spread: '$1.00',
  },
];

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
  const [selectedAssetIdx, setSelectedAssetIdx] = useState(0);
  const [activeTf, setActiveTf] = useState('15M');
  const [liveClose, setLiveClose] = useState(185);
  const [isLivePump, setIsLivePump] = useState(true);
  const [lastExecutedTrade, setLastExecutedTrade] = useState('BUY 5.0 Lots FTMO $100K • +6,000 PTS Accrued');
  const [showAssetMenu, setShowAssetMenu] = useState(false);

  const asset = ASSETS[selectedAssetIdx];

  // Dynamic live price & trade execution simulator
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setLiveClose((prev) => {
        const delta = Math.floor(Math.random() * 9) - 3;
        const next = Math.max(165, Math.min(205, prev + delta));
        setIsLivePump(next >= prev);
        return next;
      });
    }, 1500);

    const tradeInterval = setInterval(() => {
      const trades = [
        '⚡ BUY 10.0 Lots FTMO $200K • +11,800 PTS Credited',
        '⚡ BUY 5.0 Lots FundedNext $100K • +5,490 PTS Credited',
        '⚡ BUY 2.0 Lots Funding Pips $50K • +2,390 PTS Credited',
        '⚡ VIP BOOST 1.5x Activated • +3,500 Bonus PTS Credited',
      ];
      setLastExecutedTrade(trades[Math.floor(Math.random() * trades.length)]);
    }, 6000);

    return () => {
      clearInterval(tickInterval);
      clearInterval(tradeInterval);
    };
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
    <div className="w-full rounded-2xl bg-white/95 dark:bg-[#090e13]/95 border-2 border-slate-200 dark:border-emerald-500/30 p-4 sm:p-5 shadow-xl dark:shadow-2xl shadow-slate-300/40 dark:shadow-emerald-950/40 relative overflow-hidden backdrop-blur-xl transition-all">
      {/* Background trading grid texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Top Header Controls with Asset Dropdown & Timeframes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-200 dark:border-slate-800 relative z-20">
        {/* Asset Selector */}
        <div className="relative">
          <button
            onClick={() => setShowAssetMenu(!showAssetMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
          >
            <div className="h-9 w-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400 font-bold">
              <BarChart2 className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  {asset.symbol}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  {asset.change}
                </span>
              </div>
              <div className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {asset.price} <span className="text-slate-500 dark:text-slate-400 font-normal">({asset.name})</span>
              </div>
            </div>
          </button>

          {/* Asset Dropdown Menu */}
          {showAssetMenu && (
            <div className="absolute top-full left-0 mt-2 w-64 rounded-xl bg-white dark:bg-[#0b1116] border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-50">
              <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 px-2 py-1">
                Select Active Asset
              </div>
              {ASSETS.map((item, idx) => (
                <button
                  key={item.symbol}
                  onClick={() => {
                    setSelectedAssetIdx(idx);
                    setShowAssetMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all text-left cursor-pointer ${
                    selectedAssetIdx === idx
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold border border-emerald-500/30'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <div>
                    <span className="font-bold block">{item.symbol}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{item.price}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTf(tf)}
              className={`px-2 py-1 text-[11px] font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                activeTf === tf
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Candlestick SVG Chart Area */}
      <div className="relative h-[220px] w-full my-4 select-none">
        {/* Horizontal price grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="border-b border-dashed border-emerald-500/40 w-full" />
          <div className="border-b border-dashed border-emerald-500/40 w-full" />
          <div className="border-b border-dashed border-emerald-500/40 w-full" />
          <div className="border-b border-dashed border-emerald-500/40 w-full" />
        </div>

        {/* EMA 20 & EMA 50 Overlay Indicator Curves (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible opacity-70">
          {/* EMA 20 (Cyan) */}
          <path
            d="M 10 160 Q 120 130, 240 100 T 460 65"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          {/* EMA 50 (Emerald) */}
          <path
            d="M 10 180 Q 150 155, 280 120 T 460 85"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
          />
        </svg>

        {/* Candlestick bars rendering */}
        <div className="relative h-full w-full flex items-end justify-between px-2 sm:px-4 z-20">
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
                  className={isBull ? 'bg-emerald-400' : 'bg-rose-400'}
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
                      ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.35)]'
                      : 'bg-rose-500 border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.35)]'
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
              className={isLivePump ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400 animate-pulse'}
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
                  ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.7)]'
                  : 'bg-rose-500 border-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.7)]'
              }`}
            />

            {/* Current Price Crosshair Ping Tag */}
            <div
              style={{
                position: 'absolute',
                top: `${getY(liveClose) - 10}px`,
                left: '100%',
              }}
              className="ml-1 z-30 flex items-center"
            >
              <span className="font-mono text-[9px] font-black px-1.5 py-0.5 rounded text-slate-950 bg-emerald-400 shadow-lg shadow-emerald-500/40 animate-pulse whitespace-nowrap">
                {liveClose} PTS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Trade Execution Feed Bar */}
      <div className="mb-3 py-1.5 px-3 rounded-lg bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <Zap className="w-3.5 h-3.5 fill-emerald-500 dark:fill-emerald-400 animate-pulse" />
          <span className="font-semibold truncate">{lastExecutedTrade}</span>
        </div>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0 font-bold">100% REAL-TIME</span>
      </div>

      {/* Bottom Trading Orderbook & Sentiment Status Bar */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span>ORDERBOOK:</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">+10 PTS / $1.00</strong>
          </div>
          <div className="hidden sm:block text-slate-300 dark:text-slate-700">|</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            SPREAD: <strong className="text-slate-900 dark:text-white">{asset.spread}</strong>
          </div>
        </div>

        {/* Sentiment Bar */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">MARKET DEPTH:</span>
          <div className="h-2 w-28 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-500 w-[86%]" title="86% Buy Volume" />
            <div className="h-full bg-rose-500 w-[14%]" title="14% Sell Volume" />
          </div>
          <span className="font-mono text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
            86% BULLS
          </span>
        </div>
      </div>
    </div>
  );
}
