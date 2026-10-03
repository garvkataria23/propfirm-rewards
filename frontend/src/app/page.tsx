'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Coins,
  Gift,
  ArrowRight,
  Sparkles,
  Wallet,
  ChevronDown,
  FileCheck2,
  CheckCircle,
  Truck,
  Headphones,
  Zap,
  TrendingUp,
  Star,
  Flame,
  Activity,
  Building2,
} from 'lucide-react';

interface PropFirmOffer {
  id: string;
  accountTierName: string;
  purchasePriceUsd: number;
  rewardPoints: number;
}

interface PropFirm {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description: string;
  websiteUrl: string;
  affiliateCode: string;
  affiliateUrl: string;
  offers?: PropFirmOffer[];
}

interface Reward {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  pointsRequired: number;
  stock?: number;
  isUnlimitedStock?: boolean;
  category?: { name: string; slug: string };
}

// Fallback Prop Firms with tier details and branded logos
const FALLBACK_PROP_FIRMS: PropFirm[] = [
  {
    id: 'firm-1',
    name: 'FundedSquad',
    slug: 'fundedsquad',
    logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&auto=format&fit=crop&q=80',
    description: 'Premier proprietary firm with zero-time limit evaluations, raw spreads, and fast reward verification.',
    websiteUrl: 'https://fundedsquad.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://fundedsquad.com/?ref=nation',
    offers: [
      { id: 'o-1', accountTierName: '$50K Account', purchasePriceUsd: 299, rewardPoints: 2990 },
      { id: 'o-2', accountTierName: '$100K Account', purchasePriceUsd: 499, rewardPoints: 4990 },
      { id: 'o-3', accountTierName: '$200K Account', purchasePriceUsd: 979, rewardPoints: 9790 },
    ],
  },
  {
    id: 'firm-2',
    name: 'Pipstone Capital',
    slug: 'pipstone-capital',
    logoUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=120&auto=format&fit=crop&q=80',
    description: 'Institutional-grade simulated funding with high drawdown flexibility and weekly payouts up to 90%.',
    websiteUrl: 'https://pipstonecapital.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://pipstonecapital.com/?ref=nation',
    offers: [
      { id: 'o-4', accountTierName: '$25K Account', purchasePriceUsd: 189, rewardPoints: 1890 },
      { id: 'o-5', accountTierName: '$50K Account', purchasePriceUsd: 319, rewardPoints: 3190 },
      { id: 'o-6', accountTierName: '$100K Account', purchasePriceUsd: 549, rewardPoints: 5490 },
    ],
  },
  {
    id: 'firm-3',
    name: 'Apex Trader Funding',
    slug: 'apex-trader-funding',
    logoUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=120&auto=format&fit=crop&q=80',
    description: 'Futures contract specialist with 1-day pass evaluations, trailing drawdown, and multiple account hedging.',
    websiteUrl: 'https://apextraderfunding.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://apextraderfunding.com/?ref=nation',
    offers: [
      { id: 'o-7', accountTierName: '$50K Futures', purchasePriceUsd: 167, rewardPoints: 1670 },
      { id: 'o-8', accountTierName: '$100K Futures', purchasePriceUsd: 299, rewardPoints: 2990 },
      { id: 'o-9', accountTierName: '$150K Futures', purchasePriceUsd: 377, rewardPoints: 3770 },
    ],
  },
  {
    id: 'firm-4',
    name: 'TopStep Forex',
    slug: 'topstep-forex',
    logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&auto=format&fit=crop&q=80',
    description: 'Chicago-regulated trading combine with real-time coaching, Discord community, and fast scaling plan.',
    websiteUrl: 'https://topstep.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://topstep.com/?ref=nation',
    offers: [
      { id: 'o-10', accountTierName: '$50K Trading Combine', purchasePriceUsd: 165, rewardPoints: 1650 },
      { id: 'o-11', accountTierName: '$100K Trading Combine', purchasePriceUsd: 325, rewardPoints: 3250 },
      { id: 'o-12', accountTierName: '$150K Trading Combine', purchasePriceUsd: 375, rewardPoints: 3750 },
    ],
  },
];

// Fallback Featured Rewards Catalog
const FALLBACK_REWARDS: Reward[] = [
  {
    id: 'r-1',
    name: 'Apple AirPods Max (Space Gray)',
    slug: 'apple-airpods-max',
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    pointsRequired: 20000,
    category: { name: 'Audio Gear', slug: 'audio' },
  },
  {
    id: 'r-2',
    name: 'Nike Air Jordan 1 Retro High OG',
    slug: 'nike-air-jordan-1-retro',
    imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
    pointsRequired: 15000,
    category: { name: 'Streetwear', slug: 'apparel' },
  },
  {
    id: 'r-3',
    name: 'Sony PlayStation 5 Pro Console',
    slug: 'sony-playstation-5-pro',
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80',
    pointsRequired: 70000,
    category: { name: 'Gaming Gear', slug: 'gaming' },
  },
  {
    id: 'r-4',
    name: 'Apple iPhone 16 Pro Max 256GB',
    slug: 'apple-iphone-16-pro-max',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    pointsRequired: 120000,
    category: { name: 'Smartphones', slug: 'smartphones' },
  },
  {
    id: 'r-5',
    name: 'Apple MacBook Pro 16" M3 Max',
    slug: 'apple-macbook-pro-m3',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    pointsRequired: 250000,
    category: { name: 'Trading Stations', slug: 'workstations' },
  },
  {
    id: 'r-6',
    name: 'Ledger Stax Crypto Hardware Wallet',
    slug: 'ledger-stax',
    imageUrl: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800&auto=format&fit=crop&q=80',
    pointsRequired: 25000,
    category: { name: 'Crypto Security', slug: 'crypto' },
  },
];

export default function HomePage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [propFirms, setPropFirms] = useState<PropFirm[]>(FALLBACK_PROP_FIRMS);
  const [rewards, setRewards] = useState<Reward[]>(FALLBACK_REWARDS);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Hero Live Animation State (3-5s repeating cycle)
  const [heroCycle, setHeroCycle] = useState(0);
  const [pointsCount, setPointsCount] = useState(12480);
  const [progressPercent, setProgressPercent] = useState(62);
  const [showToast, setShowToast] = useState(false);

  // Mouse Parallax Effect for Desktop Hero
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Interactive "How It Works" Journey State
  const [activeStep, setActiveStep] = useState(0);

  // "Reward Unlock" Interactive Simulator State
  const [simulatedUnlocked, setSimulatedUnlocked] = useState(false);

  // Interactive Trader Dashboard Tab
  const [activeDashboardTab, setActiveDashboardTab] = useState<'overview' | 'propfirms' | 'wallet' | 'rewards'>('overview');

  // Load prop firms and rewards from API with graceful fallbacks
  useEffect(() => {
    async function loadData() {
      try {
        const firmsRes = await api.get<any>('/prop-firms');
        const firmsData = Array.isArray(firmsRes) ? firmsRes : firmsRes?.data;
        if (Array.isArray(firmsData) && firmsData.length > 0) {
          setPropFirms(firmsData);
        }
      } catch {
        // Fallback remains active
      }

      try {
        const rewRes = await api.get<any>('/rewards');
        const rewData = Array.isArray(rewRes) ? rewRes : rewRes?.data;
        if (Array.isArray(rewData) && rewData.length > 0) {
          setRewards(rewData);
        }
      } catch {
        // Fallback remains active
      }
    }
    loadData();
  }, []);

  // Hero Live Sequence Animation Loop (Every 4.5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroCycle((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Handle animation sequence steps
  useEffect(() => {
    if (heroCycle === 0) {
      setPointsCount(12480);
      setProgressPercent(62);
      setShowToast(false);
      const t1 = setTimeout(() => {
        setPointsCount(12500);
        setProgressPercent(65);
      }, 700);
      return () => clearTimeout(t1);
    } else if (heroCycle === 1) {
      setPointsCount(15000);
      setProgressPercent(75);
      setShowToast(true);
    } else {
      setShowToast(false);
    }
  }, [heroCycle]);

  // Subtle Mouse Parallax Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const x = ((clientX - left) / width - 0.5) * 16;
    const y = ((clientY - top) / height - 0.5) * 16;
    setMousePos({ x, y });
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#05070a] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION: CINEMATIC TRADING TERMINAL × REWARDS MARKETPLACE
      ───────────────────────────────────────────────────────────── */}
      <section
        onMouseMove={handleMouseMove}
        className="relative w-full pt-8 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-28 overflow-hidden border-b border-emerald-950/40 bg-[#05070a]"
      >
        {/* Subtle Trading Candlesticks & Chart Grid (5-10% Opacity) */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-[0.07] dark:opacity-[0.09]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="tradingGrid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#10b981" strokeWidth="0.5" />
              </pattern>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#tradingGrid)" />

            {/* Subtle Institutional Candlestick Silhouettes */}
            <g stroke="#10b981" strokeWidth="1.5">
              <line x1="8%" y1="180" x2="8%" y2="280" />
              <rect x="7.4%" y="200" width="1.2%" height="55" fill="#10b981" />
              <line x1="14%" y1="150" x2="14%" y2="260" />
              <rect x="13.4%" y="170" width="1.2%" height="60" fill="#10b981" />
              <line x1="20%" y1="210" x2="20%" y2="310" />
              <rect x="19.4%" y="230" width="1.2%" height="45" fill="#ef4444" stroke="#ef4444" />
              <line x1="26%" y1="130" x2="26%" y2="240" />
              <rect x="25.4%" y="145" width="1.2%" height="65" fill="#10b981" />
              <line x1="32%" y1="100" x2="32%" y2="220" />
              <rect x="31.4%" y="120" width="1.2%" height="70" fill="#10b981" />
              <line x1="38%" y1="160" x2="38%" y2="270" />
              <rect x="37.4%" y="175" width="1.2%" height="55" fill="#ef4444" stroke="#ef4444" />
              <line x1="44%" y1="90" x2="44%" y2="210" />
              <rect x="43.4%" y="105" width="1.2%" height="80" fill="#10b981" />
              <line x1="50%" y1="70" x2="50%" y2="180" />
              <rect x="49.4%" y="85" width="1.2%" height="75" fill="#10b981" />
              <line x1="68%" y1="120" x2="68%" y2="230" />
              <rect x="67.4%" y="135" width="1.2%" height="65" fill="#10b981" />
              <line x1="78%" y1="90" x2="78%" y2="200" />
              <rect x="77.4%" y="110" width="1.2%" height="60" fill="#10b981" />
              <line x1="88%" y1="60" x2="88%" y2="170" />
              <rect x="87.4%" y="80" width="1.2%" height="70" fill="#10b981" />
            </g>

            {/* Smooth Moving Trendline */}
            <path
              d="M 0 320 Q 200 240, 400 270 T 800 160 T 1200 120 T 1600 70"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeDasharray="6 4"
            />
          </svg>
        </div>

        {/* Ambient Top Glow Orbs */}
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left: Bold Trader Typography & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Live Signal Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#101716] border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-inner">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-mono tracking-wide">TRADING PLATFORM × PREMIUM REWARDS</span>
              </div>

              {/* Exact Requested Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-[900] tracking-tight leading-[1.08] text-white">
                TRADE.<br />
                EARN.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  GET REWARDED.
                </span>
              </h1>

              {/* Accurate & Professional Tagline */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Your next reward starts with your next eligible purchase. Buy challenges from top proprietary trading firms using code{' '}
                <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  NATION
                </span>
                , verify your order receipt, and unlock Apple gear, trading multi-screens, and USDT crypto payouts.
              </p>

              {/* High-Impact Consistent CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/prop-firms"
                  className="w-full sm:w-auto h-13 px-8 text-base font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Start Earning</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/rewards"
                  className="w-full sm:w-auto h-13 px-8 text-base font-semibold border border-slate-700 bg-[#101716] text-slate-200 hover:bg-slate-800 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Gift className="h-4 w-4 text-emerald-400" />
                  <span>Explore Rewards</span>
                </Link>
              </div>

              {/* 4 Micro Trust Pillars */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="p-2.5 rounded-lg bg-[#0b1110] border border-emerald-950/50">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Verified</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Automated Receipt Audit</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0b1110] border border-emerald-950/50">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Coins className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>$0.01 / PT</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Guaranteed Cash Floor</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0b1110] border border-emerald-950/50">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Courier Track</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">FedEx / DHL Insured</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0b1110] border border-emerald-950/50">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Crypto USDT</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Direct TRC-20 Payout</div>
                </div>
              </div>
            </div>

            {/* Right: Interactive 3D Animated Live Rewards Dashboard */}
            <div className="lg:col-span-5 flex justify-center">
              <div
                style={{
                  transform: `perspective(1000px) rotateX(${-mousePos.y * 0.4}deg) rotateY(${mousePos.x * 0.4}deg)`,
                  transition: 'transform 0.15s ease-out',
                }}
                className="w-full max-w-md rounded-2xl bg-[#0f1715] border border-emerald-500/30 p-5 shadow-2xl shadow-emerald-950/60 relative overflow-hidden"
              >
                {/* Glow Border Gradient */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

                {/* Dashboard Card Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-emerald-950/70">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Live Rewards Dashboard
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                    TRADER PRO TIER
                  </span>
                </div>

                {/* Balance & Live Delta */}
                <div className="py-4 space-y-1">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                    Total Spendable Balance
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl sm:text-4xl font-[900] font-mono tracking-tight text-white flex items-baseline gap-2">
                      <span>{pointsCount.toLocaleString()}</span>
                      <span className="text-sm font-bold text-emerald-400 font-sans">POINTS</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold font-mono px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                      <span>+2,500 ↑</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">≈ ${(pointsCount * 0.01).toFixed(2)} USD Instant Liquidation Value</div>
                </div>

                {/* Reward Progress Bar Animation */}
                <div className="py-3 px-3.5 rounded-xl bg-[#080d0c] border border-emerald-950/70 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Headphones className="h-3.5 w-3.5 text-emerald-400" />
                      <span>AirPods Max Target</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-400">{progressPercent}%</span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden p-0.5 border border-slate-800">
                    <div
                      style={{ width: `${progressPercent}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm transition-all duration-700 ease-out"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>15,000 / 20,000 PTS</span>
                    <span>5,000 PTS to Unlock</span>
                  </div>
                </div>

                {/* Mini Target Gear Icons Preview */}
                <div className="pt-3 flex items-center justify-between gap-2">
                  <div className="flex-1 p-2 rounded-lg bg-[#0b1110] border border-slate-800/80 text-center hover:border-emerald-500/40 transition-colors">
                    <span className="text-lg">🎧</span>
                    <div className="text-[10px] font-bold text-slate-300 mt-1">AirPods Max</div>
                    <div className="text-[9px] font-mono text-emerald-400">20K PTS</div>
                  </div>

                  <div className="flex-1 p-2 rounded-lg bg-[#0b1110] border border-slate-800/80 text-center hover:border-emerald-500/40 transition-colors">
                    <span className="text-lg">👟</span>
                    <div className="text-[10px] font-bold text-slate-300 mt-1">Air Jordans</div>
                    <div className="text-[9px] font-mono text-emerald-400">15K PTS</div>
                  </div>

                  <div className="flex-1 p-2 rounded-lg bg-[#0b1110] border border-slate-800/80 text-center hover:border-emerald-500/40 transition-colors">
                    <span className="text-lg">📱</span>
                    <div className="text-[10px] font-bold text-slate-300 mt-1">iPhone 16</div>
                    <div className="text-[9px] font-mono text-emerald-400">120K PTS</div>
                  </div>
                </div>

                {/* Live Verification Notification Toast */}
                <div
                  className={`mt-4 p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-between text-xs transition-all duration-500 ${
                    showToast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 pointer-events-none'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Purchase Verified</div>
                      <div className="text-[10px] text-emerald-300/80">Order #FS-100K Approved</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 text-xs">+2,500 PTS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. SUBTLE TICKER: LIVE PLATFORM REWARDS FEED
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full bg-[#080d0c] border-b border-emerald-950/40 py-2.5 overflow-hidden">
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="px-4 shrink-0 flex items-center gap-2 font-bold text-emerald-400 bg-emerald-950/60 py-1 rounded border border-emerald-500/20 ml-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>PLATFORM REWARDS FEED</span>
          </div>

          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar whitespace-nowrap">
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              <span>Purchase Verified: FundedSquad $100K</span>
              <strong className="text-emerald-400 font-bold">+2,500 PTS</strong>
            </span>
            <span className="text-slate-600">&bull;</span>

            <span className="flex items-center gap-1.5 text-slate-300">
              <Gift className="h-3.5 w-3.5 text-purple-400" />
              <span>Reward Redeemed: Apple AirPods Max</span>
              <strong className="text-purple-300 font-bold">-20,000 PTS</strong>
            </span>
            <span className="text-slate-600">&bull;</span>

            <span className="flex items-center gap-1.5 text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>New Reward Added: Ledger Stax Hardware Wallet</span>
              <strong className="text-amber-300 font-bold">25,000 PTS</strong>
            </span>
            <span className="text-slate-600">&bull;</span>

            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              <span>Purchase Verified: Pipstone $200K Challenge</span>
              <strong className="text-emerald-400 font-bold">+5,000 PTS</strong>
            </span>
            <span className="text-slate-600">&bull;</span>

            <span className="flex items-center gap-1.5 text-slate-300">
              <Wallet className="h-3.5 w-3.5 text-teal-400" />
              <span>Direct USDT Cashout Confirmed (TRC-20)</span>
              <strong className="text-teal-300 font-bold">$1,500.00 USD</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. HOW IT WORKS: INTERACTIVE 4-STEP JOURNEY
      ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="w-full py-16 sm:py-20 lg:py-24 border-b border-emerald-950/40 bg-[#070b10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-950/40 text-xs">
              01 &bull; 02 &bull; 03 &bull; 04
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[900] tracking-tight text-white">
              From Challenge to Gear in 4 Steps
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Click each phase to see how Prop Nation verifies your trading purchases and credits guaranteed points.
            </p>
          </div>

          {/* Interactive Step Switcher */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {[
              { num: '01', title: 'BUY', desc: 'Use Partner Code' },
              { num: '02', title: 'VERIFY', desc: 'Upload Receipt' },
              { num: '03', title: 'EARN', desc: 'Atomic Ledger Credit' },
              { num: '04', title: 'REDEEM', desc: 'Dispatch Hardware' },
            ].map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-3.5 rounded-xl text-left border transition-all ${
                  activeStep === idx
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-[#0f1715] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="font-mono text-xs font-bold text-emerald-400">{step.num}</div>
                <div className="font-extrabold text-sm sm:text-base text-white mt-0.5">{step.title}</div>
                <div className="text-[11px] text-slate-400">{step.desc}</div>
              </button>
            ))}
          </div>

          {/* Dynamic Interactive Stage Simulator Card */}
          <div className="max-w-4xl mx-auto rounded-2xl bg-[#0e1614] border border-emerald-500/30 p-6 sm:p-8 shadow-2xl">
            {activeStep === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    STEP 01: SELECT OFFER
                  </span>
                  <h3 className="text-2xl font-bold text-white">Purchase with Partner Code NATION</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Browse our partner prop firms. Click their official referral link and apply code{' '}
                    <strong className="text-emerald-400 font-mono">NATION</strong> at checkout. This attaches your evaluation order to our verified affiliate pool.
                  </p>
                  <Link
                    href="/prop-firms"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 text-xs"
                  >
                    View Partner Offers →
                  </Link>
                </div>

                <div className="p-5 rounded-xl bg-[#080d0c] border border-emerald-950/80 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
                    <span>CHALLENGE CHECKOUT</span>
                    <span className="text-emerald-400">ORDER SIMULATION</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Evaluation Tier:</span>
                    <span className="font-bold">$100K 2-Step Challenge</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Amount Paid:</span>
                    <span className="font-bold">$499.00 USD</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                    <span>Reward Points Yield:</span>
                    <span>+4,990 POINTS</span>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                    STEP 02: VERIFICATION
                  </span>
                  <h3 className="text-2xl font-bold text-white">Submit Receipt in Trader Portal</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Upload your invoice or confirmation screenshot with Order ID and date. Our automated audit pipeline checks duplicate hashes and reconciles with prop firm affiliate logs.
                  </p>
                  <Link
                    href="/dashboard/purchases/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 text-xs"
                  >
                    Go to Purchase Submission →
                  </Link>
                </div>

                <div className="p-5 rounded-xl bg-[#080d0c] border border-amber-950/80 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
                    <span>FILE AUDIT</span>
                    <span className="text-amber-400 animate-pulse">PROCESSING</span>
                  </div>
                  <div className="p-3 rounded bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileCheck2 className="h-4 w-4 text-emerald-400" />
                      <span>purchase-proof_100k.png</span>
                    </span>
                    <span className="text-[10px] text-slate-400">1.4 MB</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>✓ ORDER VERIFIED BY ADMIN</span>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    STEP 03: POINTS CREDITED
                  </span>
                  <h3 className="text-2xl font-bold text-white">Guaranteed Points Added to Wallet</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Points are written to your immutable financial points ledger with zero expiration and zero lockups. 100 points = $1.00 USD cash redemption value.
                  </p>
                  <Link
                    href="/dashboard/points"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 text-xs"
                  >
                    View Points Ledger →
                  </Link>
                </div>

                <div className="p-5 rounded-xl bg-[#080d0c] border border-emerald-950/80 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
                    <span>LEDGER TRANSACTION</span>
                    <span className="text-emerald-400">ACID WRITE</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Previous Balance:</span>
                    <span>7,510 PTS</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Approved Credit:</span>
                    <span>+2,490 PTS</span>
                  </div>
                  <div className="flex justify-between text-white font-extrabold text-sm pt-2 border-t border-slate-800">
                    <span>New Total Balance:</span>
                    <span className="text-emerald-400">10,000 PTS ($100.00)</span>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                    STEP 04: REDEEM &amp; DISPATCH
                  </span>
                  <h3 className="text-2xl font-bold text-white">Order Electronics or Cash Out Crypto</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Select any item from the rewards catalog. Enter your global shipping address or TRC-20 USDT wallet. Our logistics team ships insured via FedEx, DHL, or Aramex.
                  </p>
                  <Link
                    href="/rewards"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 text-xs"
                  >
                    Browse Rewards Catalog →
                  </Link>
                </div>

                <div className="p-5 rounded-xl bg-[#080d0c] border border-purple-950/80 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
                    <span>COURIER PIPELINE</span>
                    <span className="text-purple-400">DISPATCHED</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Carrier:</span>
                    <span className="font-bold">FedEx Express Airway</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Tracking Number:</span>
                    <span className="text-emerald-400 font-mono">#FX-8941-2041</span>
                  </div>
                  <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold text-center">
                    STATUS: OUT FOR DELIVERY
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. PROP FIRMS: TRADING OPPORTUNITIES & OFFERS
      ───────────────────────────────────────────────────────────── */}
      <section id="prop-firms" className="w-full py-16 sm:py-20 lg:py-24 border-b border-emerald-950/40 bg-[#05070a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-950/40 text-xs">
                FEATURED PROP FIRM OFFERS
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[900] tracking-tight text-white">
                Earn Up to 10,000 Points Per Challenge
              </h2>
              <p className="text-sm sm:text-base text-slate-400">
                Partner proprietary trading firms with verified point yields and direct verification support.
              </p>
            </div>

            <Link
              href="/prop-firms"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-800 bg-[#101716] text-white hover:bg-slate-800 text-sm font-semibold shrink-0"
            >
              <span>View All 12+ Firms</span>
              <ArrowRight className="h-4 w-4 text-emerald-400" />
            </Link>
          </div>

          {/* Cards styled as high-yield trading opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {propFirms.slice(0, 4).map((firm) => (
              <div
                key={firm.id}
                className="card-lift rounded-2xl bg-[#0f1715] border border-emerald-500/20 p-5 flex flex-col justify-between space-y-5 shadow-lg group hover:border-emerald-500/50 transition-all"
              >
                <div className="space-y-4">
                  {/* Firm Header */}
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden p-1 flex items-center justify-center">
                      <img
                        src={firm.logoUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&auto=format&fit=crop&q=80'}
                        alt={firm.name}
                        className="h-full w-full object-cover rounded-lg"
                      />
                    </div>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> VERIFIED
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-lg text-white group-hover:text-emerald-400 transition-colors">
                      {firm.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {firm.description}
                    </p>
                  </div>

                  {/* Tier Pricing & Points Table */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80 font-mono text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1">
                      CHALLENGE TIERS &bull; REWARDS
                    </div>
                    <div className="p-1.5 rounded bg-[#080d0c] flex items-center justify-between text-slate-300">
                      <span>$50K Account</span>
                      <strong className="text-emerald-400">+2,990 PTS</strong>
                    </div>
                    <div className="p-1.5 rounded bg-[#080d0c] flex items-center justify-between text-slate-300">
                      <span>$100K Account</span>
                      <strong className="text-emerald-400">+4,990 PTS</strong>
                    </div>
                    <div className="p-1.5 rounded bg-[#080d0c] flex items-center justify-between text-slate-300">
                      <span>$200K Account</span>
                      <strong className="text-emerald-400">+9,790 PTS</strong>
                    </div>
                  </div>
                </div>

                {/* Bottom Affiliate Code & Action */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#080d0c] border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-mono">Code: <strong className="text-emerald-400">NATION</strong></span>
                    <button
                      onClick={() => handleCopy(firm.affiliateCode || 'NATION')}
                      className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-mono"
                    >
                      {copiedCode === (firm.affiliateCode || 'NATION') ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="h-3 w-3" /> Copied
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Copy className="h-3 w-3" /> Copy
                        </span>
                      )}
                    </button>
                  </div>

                  <Link
                    href={`/prop-firms/${firm.slug}`}
                    className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition-all"
                  >
                    <span>View Offer</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Compliance Disclaimer */}
          <div className="p-4 rounded-xl bg-[#080d0c] border border-slate-800 text-center text-xs text-slate-500 max-w-3xl mx-auto">
            Disclaimer: Prop Nation is an independent affiliate rewards portal and not a broker or proprietary trading firm. All challenge purchases are made directly with the respective prop firm and subject to their affiliate terms.
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. POINTS WALLET: INSTITUTIONAL FINANCIAL DASHBOARD
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-16 sm:py-20 lg:py-24 border-b border-emerald-950/40 bg-[#070b10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-950/40 text-xs">
              TRADER POINTS WALLET
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[900] tracking-tight text-white">
              Your Capitalized Reward Equity
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Track points like a trading balance. Full transparent ledger, instant USD value, and no lockups.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            {/* Left Balance & Equity Curve */}
            <div className="lg:col-span-7 rounded-2xl bg-[#0e1614] border border-emerald-500/30 p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="text-xs uppercase font-mono text-slate-400 font-semibold">Total Reward Balance</div>
                  <div className="text-4xl sm:text-5xl font-[900] font-mono text-white mt-1">
                    12,500 <span className="text-emerald-400 text-lg font-sans">POINTS</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">
                    <TrendingUp className="h-3.5 w-3.5" /> +2,500 Today
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-1">≈ $125.00 USD Value</div>
                </div>
              </div>

              {/* Styled Equity Curve Line Graph (SVG) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>EQUITY CURVE (30D)</span>
                  <span className="text-emerald-400">All-Time High</span>
                </div>
                <div className="h-32 w-full rounded-xl bg-[#080d0c] border border-slate-800/80 p-2 relative overflow-hidden flex items-end">
                  <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points="0,100 0,85 50,80 100,75 150,60 200,65 250,45 300,50 350,25 400,10 400,100"
                      fill="url(#equityGrad)"
                    />
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      points="0,85 50,80 100,75 150,60 200,65 250,45 300,50 350,25 400,10"
                    />
                  </svg>
                  <div className="absolute top-3 right-3 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    12,500 PTS
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/dashboard/purchases/new"
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 text-xs inline-flex items-center gap-1.5"
                >
                  Submit Purchase Proof →
                </Link>
                <Link
                  href="/dashboard/points"
                  className="px-4 py-2 rounded-lg border border-slate-800 bg-[#080d0c] text-slate-300 hover:text-white text-xs inline-flex items-center gap-1.5"
                >
                  View Full Ledger
                </Link>
              </div>
            </div>

            {/* Right Floating Transaction Pills */}
            <div className="lg:col-span-5 space-y-3 font-mono text-xs">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-bold px-1">
                Recent Ledger Activity
              </div>

              <div className="p-4 rounded-xl bg-[#0e1614] border border-emerald-500/20 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="text-white font-bold">Purchase Verified</div>
                    <div className="text-[10px] text-slate-400 font-sans">Funding Pips $100K</div>
                  </div>
                </div>
                <span className="font-bold text-emerald-400 text-sm">+2,500 PTS</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1614] border border-emerald-500/20 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                    ⚡
                  </div>
                  <div>
                    <div className="text-white font-bold">Partner Tier Bonus</div>
                    <div className="text-[10px] text-slate-400 font-sans">VIP Silver 1.2x Multiplier</div>
                  </div>
                </div>
                <span className="font-bold text-teal-400 text-sm">+1,000 PTS</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1614] border border-purple-500/20 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    🎁
                  </div>
                  <div>
                    <div className="text-white font-bold">Reward Redeemed</div>
                    <div className="text-[10px] text-slate-400 font-sans">Apple AirPods Max</div>
                  </div>
                </div>
                <span className="font-bold text-purple-400 text-sm">-5,000 PTS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. REWARDS VAULT: PREMIUM REWARDS MARKETPLACE
      ───────────────────────────────────────────────────────────── */}
      <section id="rewards" className="w-full py-16 sm:py-20 lg:py-24 border-b border-emerald-950/40 bg-[#05070a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-950/40 text-xs">
                PREMIUM REWARDS VAULT
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[900] tracking-tight text-white">
                YOUR POINTS. YOUR REWARDS.
              </h2>
              <p className="text-sm sm:text-base text-slate-400">
                From high-end trading hardware and Apple devices to authentic streetwear and USDT crypto transfers.
              </p>
            </div>

            <Link
              href="/rewards"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-800 bg-[#101716] text-white hover:bg-slate-800 text-sm font-semibold shrink-0"
            >
              <span>View Full Catalog</span>
              <ArrowRight className="h-4 w-4 text-emerald-400" />
            </Link>
          </div>

          {/* Big Floating Premium Product Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="card-lift rounded-2xl bg-[#0f1715] border border-emerald-500/20 overflow-hidden flex flex-col justify-between group shadow-xl hover:border-emerald-500/50 transition-all"
              >
                <div>
                  <div className="aspect-[4/3] relative overflow-hidden bg-slate-950">
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-sm text-emerald-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                      {item.category?.name || 'Hardware'}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-2xl font-[900] text-emerald-400">
                        {item.pointsRequired.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-slate-400 font-sans">POINTS</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      Instant courier dispatch with full delivery tracking or direct crypto settlement.
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    href={`/rewards/${item.slug || 'reward'}`}
                    className="w-full py-2.5 rounded-lg bg-[#101716] border border-slate-700 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500 text-white font-bold transition-all text-xs flex items-center justify-center"
                  >
                    Unlock With Points →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. REWARD UNLOCK: INTERACTIVE PROGRESS SIMULATOR
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-16 sm:py-20 lg:py-24 border-b border-emerald-950/40 bg-[#070b10]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
          <div className="space-y-3">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-950/40 text-xs">
              SIMULATE YOUR REWARD UNLOCK
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-[900] tracking-tight text-white">
              Watch How Fast You Unlock Real Gear
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
              Simulate completing challenge evaluations to see your points ledger hit the target threshold in real time.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-[#0e1614] border border-emerald-500/30 shadow-2xl space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&auto=format&fit=crop&q=80"
                    alt="AirPods Max"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-base">Apple AirPods Max (Space Gray)</h4>
                  <div className="text-xs font-mono text-emerald-400">Target Cost: 20,000 Points</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-2xl font-[900] text-white">
                  {simulatedUnlocked ? '20,000' : '12,500'} <span className="text-sm font-sans text-slate-400">/ 20,000</span>
                </div>
                <div className="text-xs font-mono text-emerald-400">
                  {simulatedUnlocked ? '100% UNLOCKED' : '7,500 Points to Unlock'}
                </div>
              </div>
            </div>

            {/* Simulated Animated Progress Bar */}
            <div className="space-y-2">
              <div className="w-full h-4 rounded-full bg-slate-900 overflow-hidden p-0.5 border border-slate-800">
                <div
                  style={{ width: simulatedUnlocked ? '100%' : '62.5%' }}
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    simulatedUnlocked
                      ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 shadow-lg shadow-emerald-500/50'
                      : 'bg-emerald-500'
                  }`}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>0 PTS</span>
                <span>10,000 PTS</span>
                <span>20,000 PTS (GOAL)</span>
              </div>
            </div>

            {/* Unlocked Announcement Banner */}
            {simulatedUnlocked ? (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500 text-emerald-300 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                  <span className="font-bold text-sm">🔓 REWARD UNLOCKED! Ready for instant 1-click checkout.</span>
                </div>
                <button
                  onClick={() => setSimulatedUnlocked(false)}
                  className="px-3 py-1.5 rounded-lg border border-emerald-500 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold"
                >
                  Reset
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <span className="text-xs text-slate-400">
                  Simulating verification of one $150K challenge (+7,500 PTS).
                </span>
                <button
                  onClick={() => setSimulatedUnlocked(true)}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Simulate +7,500 Challenge Verification
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. BUILT FOR TRADERS: TRADING IDENTITY SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-16 sm:py-20 lg:py-24 border-b border-emerald-950/40 bg-[#05070a] relative overflow-hidden">
        {/* Subtle Candlesticks watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <g stroke="#10b981" strokeWidth="2">
              <line x1="20%" y1="50" x2="20%" y2="400" />
              <rect x="19%" y="120" width="2%" height="150" fill="#10b981" />
              <line x1="50%" y1="80" x2="50%" y2="450" />
              <rect x="49%" y="180" width="2%" height="120" fill="#10b981" />
              <line x1="80%" y1="30" x2="80%" y2="380" />
              <rect x="79%" y="90" width="2%" height="180" fill="#10b981" />
            </g>
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-950/40 text-xs">
              TRADER IDENTITY &amp; PHILOSOPHY
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[900] tracking-tight text-white">
              BUILT FOR TRADERS
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Your trading journey shouldn&apos;t stop at the challenge. We reward the risk management, discipline, and capital commitment retail traders put in every day.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#0f1715] border border-emerald-500/20 space-y-3 shadow-lg">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Coins className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-lg text-white">Earn</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Get rewarded for every eligible challenge evaluation purchase with zero friction or coupon complexity.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0f1715] border border-emerald-500/20 space-y-3 shadow-lg">
              <div className="h-10 w-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-lg text-white">Progress</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Watch your points balance grow across multiple prop firms. Points compound over time and never expire.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0f1715] border border-emerald-500/20 space-y-3 shadow-lg">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <Gift className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-lg text-white">Unlock</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reach gear you actually want: Apple hardware, gaming rigs, multi-monitor setups, and instant USDT payouts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0f1715] border border-emerald-500/20 space-y-3 shadow-lg">
              <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-lg text-white">Track</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Live 5-step fulfillment pipeline from order confirmation to courier airway tracking and final delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. TRADER DASHBOARD SHOWCASE: IMMERSIVE TERMINAL
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-16 sm:py-20 lg:py-24 border-b border-emerald-950/40 bg-[#070b10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-950/40 text-xs">
              TRADER TERMINAL SHOWCASE
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[900] tracking-tight text-white">
              Your Complete Rewards Headquarters
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Interactive preview of your trader profile, purchase submission queue, points wallet, and delivery status.
            </p>
          </div>

          {/* Interactive Live Terminal Frame */}
          <div className="rounded-2xl bg-[#0b1110] border border-emerald-500/30 shadow-2xl overflow-hidden max-w-5xl mx-auto">
            {/* Terminal Window Header */}
            <div className="px-4 py-3 bg-[#080d0c] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="font-mono text-xs text-slate-400 ml-2">propnation.app/dashboard</span>
              </div>
              <div className="font-mono text-xs text-emerald-400 font-bold">● LIVE TERMINAL</div>
            </div>

            {/* Terminal Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
              {/* Left Sidebar Navigation */}
              <div className="md:col-span-3 border-r border-slate-800 p-4 space-y-1 bg-[#090e0d] font-mono text-xs">
                <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1">NAVIGATION</div>
                <button
                  onClick={() => setActiveDashboardTab('overview')}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 font-bold transition-all ${
                    activeDashboardTab === 'overview'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Activity className="h-3.5 w-3.5" /> Dashboard
                </button>
                <button
                  onClick={() => setActiveDashboardTab('propfirms')}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 font-bold transition-all ${
                    activeDashboardTab === 'propfirms'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" /> Prop Firms
                </button>
                <button
                  onClick={() => setActiveDashboardTab('wallet')}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 font-bold transition-all ${
                    activeDashboardTab === 'wallet'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Wallet className="h-3.5 w-3.5" /> Trader Wallet
                </button>
                <button
                  onClick={() => setActiveDashboardTab('rewards')}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 font-bold transition-all ${
                    activeDashboardTab === 'rewards'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Gift className="h-3.5 w-3.5" /> My Rewards
                </button>
              </div>

              {/* Main Workspace Preview */}
              <div className="md:col-span-9 p-6 space-y-6 bg-[#0b1110]">
                {activeDashboardTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-bold text-white">Good evening, Trader Alex Morgan</h4>
                        <div className="text-xs text-slate-400 font-mono">VIP Silver Tier &bull; 1.2x Points Yield</div>
                      </div>
                      <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">
                        16,700 PTS AVAILABLE
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-[#080d0c] border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-400">PENDING APPROVAL</div>
                        <div className="text-xl font-black font-mono text-amber-400 mt-1">2,800 PTS</div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#080d0c] border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-400">LIFETIME EARNED</div>
                        <div className="text-xl font-black font-mono text-emerald-400 mt-1">38,700 PTS</div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#080d0c] border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-400">GEAR REDEEMED</div>
                        <div className="text-xl font-black font-mono text-purple-400 mt-1">$220.00 USD</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#080d0c] border border-slate-800 space-y-2">
                      <div className="text-xs font-bold text-white flex items-center justify-between">
                        <span>Active Courier Delivery: AirPods Max</span>
                        <span className="font-mono text-emerald-400 text-xs">FedEx #7812-4019</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Status: Out for Delivery in London, UK. Signed courier handover expected today.
                      </div>
                    </div>
                  </div>
                )}

                {activeDashboardTab === 'propfirms' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-white">Eligible Prop Firm Challenge Offers</h4>
                    <p className="text-xs text-slate-400">
                      Use affiliate code <strong className="text-emerald-400 font-mono">NATION</strong> to lock in highest points returns.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-[#080d0c] border border-slate-800 flex justify-between items-center">
                        <span className="text-white text-xs font-bold">FundedSquad</span>
                        <span className="text-emerald-400 font-mono text-xs">+4,990 PTS / $100K</span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#080d0c] border border-slate-800 flex justify-between items-center">
                        <span className="text-white text-xs font-bold">Pipstone Capital</span>
                        <span className="text-emerald-400 font-mono text-xs">+5,490 PTS / $100K</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeDashboardTab === 'wallet' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-white">Trader Points Wallet</h4>
                    <p className="text-xs text-slate-400">
                      Available Points: <strong className="text-emerald-400 font-mono">16,700 PTS</strong> ($167.00 USD)
                    </p>
                    <div className="p-3 rounded-lg bg-[#080d0c] border border-slate-800 text-xs font-mono text-slate-300">
                      Ledger ID: #L-98124 &bull; Hash: ebd72f91a &bull; Status: Invariant Compliant
                    </div>
                  </div>
                )}

                {activeDashboardTab === 'rewards' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-white">Active Redemptions &amp; Inventory</h4>
                    <p className="text-xs text-slate-400">
                      1 Item Dispatched &bull; 0 Cancelled &bull; 100% On-time Arrival
                    </p>
                    <div className="p-3 rounded-lg bg-[#080d0c] border border-emerald-500/20 text-xs text-emerald-400 font-mono">
                      ✓ RDM-2026-9812: Apple AirPods Max (Delivered)
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. LATEST REWARD DROPS
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-16 sm:py-20 lg:py-24 border-b border-emerald-950/40 bg-[#05070a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-950/40 text-xs flex items-center gap-1 w-fit">
                <Flame className="h-3.5 w-3.5 fill-amber-400" />
                <span>FRESH WEEKLY ADDITIONS</span>
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[900] tracking-tight text-white">
                LATEST REWARD DROPS
              </h2>
              <p className="text-sm sm:text-base text-slate-400">
                New hardware, flagship smartphones, and crypto cashout slots added this week.
              </p>
            </div>

            <Link
              href="/rewards"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shrink-0 inline-flex items-center gap-2 text-sm"
            >
              <span>Explore All Rewards</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="card-lift rounded-2xl bg-[#0f1715] border border-amber-500/30 p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  🔥 NEW DROP
                </span>
                <span className="font-mono text-xs text-slate-400 font-bold">IN STOCK</span>
              </div>
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-950">
                <img
                  src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80"
                  alt="AirPods Max"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Apple AirPods Max</h4>
                <div className="font-mono font-bold text-emerald-400 text-lg mt-1">20,000 Points</div>
              </div>
            </div>

            <div className="card-lift rounded-2xl bg-[#0f1715] border border-amber-500/30 p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  🔥 NEW DROP
                </span>
                <span className="font-mono text-xs text-slate-400 font-bold">IN STOCK</span>
              </div>
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-950">
                <img
                  src="https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80"
                  alt="Nike Air Jordan"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Nike Air Jordan 1 Retro</h4>
                <div className="font-mono font-bold text-emerald-400 text-lg mt-1">15,000 Points</div>
              </div>
            </div>

            <div className="card-lift rounded-2xl bg-[#0f1715] border border-amber-500/30 p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  🔥 NEW DROP
                </span>
                <span className="font-mono text-xs text-slate-400 font-bold">IN STOCK</span>
              </div>
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-950">
                <img
                  src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80"
                  alt="iPhone 16 Pro Max"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Apple iPhone 16 Pro Max</h4>
                <div className="font-mono font-bold text-emerald-400 text-lg mt-1">120,000 Points</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          11. VERIFIED PROOF OF DELIVERIES (Authentic Social Proof)
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-16 sm:py-20 lg:py-24 border-b border-emerald-950/40 bg-[#070b10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-950/40 text-xs">
              REAL DELIVERIES &bull; ZERO SIMULATIONS
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[900] tracking-tight text-white">
              Verified Trader Unboxings
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Real community unboxings from prop traders who used code NATION and redeemed their points.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Apple MacBook Pro */}
            <div className="card-lift rounded-2xl bg-[#0f1715] border border-emerald-500/20 overflow-hidden flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="aspect-[4/3] relative overflow-hidden bg-slate-950">
                  <img
                    src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80"
                    alt="MacBook Pro Unboxed"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-black/75 text-emerald-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    DHL Express #9182
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-emerald-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded">
                    Delivered
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                    <span className="text-[11px] font-bold text-slate-300 ml-1">5.0</span>
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">Apple MacBook Pro 16&quot; M3</h4>
                  <p className="text-xs text-slate-400 italic">
                    &ldquo;Arrived in 4 business days. Sealed brand new Apple box. Absolutely legit.&rdquo;
                  </p>
                </div>
              </div>
              <div className="p-4 pt-0 border-t border-slate-800 flex justify-between text-xs mt-3">
                <span className="font-bold text-slate-200">@AlexM_Trades</span>
                <span className="text-slate-500 text-[11px]">Miami, USA</span>
              </div>
            </div>

            {/* Card 2: Apple AirPods Max */}
            <div className="card-lift rounded-2xl bg-[#0f1715] border border-emerald-500/20 overflow-hidden flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="aspect-[4/3] relative overflow-hidden bg-slate-950">
                  <img
                    src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80"
                    alt="AirPods Max"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-black/75 text-emerald-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    FedEx #7812
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-emerald-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded">
                    Delivered
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                    <span className="text-[11px] font-bold text-slate-300 ml-1">5.0</span>
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">Apple AirPods Max</h4>
                  <p className="text-xs text-slate-400 italic">
                    &ldquo;Noise cancellation is incredible during news sessions. Quickest verification.&rdquo;
                  </p>
                </div>
              </div>
              <div className="p-4 pt-0 border-t border-slate-800 flex justify-between text-xs mt-3">
                <span className="font-bold text-slate-200">@Liam_PipSurfer</span>
                <span className="text-slate-500 text-[11px]">London, UK</span>
              </div>
            </div>

            {/* Card 3: Nike Air Jordans */}
            <div className="card-lift rounded-2xl bg-[#0f1715] border border-emerald-500/20 overflow-hidden flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="aspect-[4/3] relative overflow-hidden bg-slate-950">
                  <img
                    src="https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80"
                    alt="Air Jordans"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-black/75 text-emerald-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    Aramex #9012
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-emerald-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded">
                    Delivered
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                    <span className="text-[11px] font-bold text-slate-300 ml-1">5.0</span>
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">Nike Air Jordan 1 Retro</h4>
                  <p className="text-xs text-slate-400 italic">
                    &ldquo;100% authentic with StockX tag attached. Best trader reward program by far.&rdquo;
                  </p>
                </div>
              </div>
              <div className="p-4 pt-0 border-t border-slate-800 flex justify-between text-xs mt-3">
                <span className="font-bold text-slate-200">@Karim_Trader</span>
                <span className="text-slate-500 text-[11px]">Dubai, UAE</span>
              </div>
            </div>

            {/* Card 4: USDT Crypto Payout */}
            <div className="card-lift rounded-2xl bg-[#0f1715] border border-emerald-500/20 overflow-hidden flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="aspect-[4/3] relative overflow-hidden bg-slate-950">
                  <img
                    src="https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=600&auto=format&fit=crop&q=80"
                    alt="USDT Crypto Wallet Payout"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 bg-black/75 text-emerald-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    TRC-20 Blockchain
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-emerald-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded">
                    Confirmed
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                    <span className="text-[11px] font-bold text-slate-300 ml-1">5.0</span>
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">$1,500 USDT Instant Transfer</h4>
                  <p className="text-xs text-slate-400 italic">
                    &ldquo;Direct USDT payout. Was in my private Ledger hardware wallet within 45 minutes!&rdquo;
                  </p>
                </div>
              </div>
              <div className="p-4 pt-0 border-t border-slate-800 flex justify-between text-xs mt-3">
                <span className="font-bold text-slate-200">@Elena_CryptoFX</span>
                <span className="text-slate-500 text-[11px]">Singapore, SG</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          12. FREQUENTLY ASKED QUESTIONS
      ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="w-full py-16 sm:py-20 lg:py-24 border-b border-emerald-950/40 bg-[#05070a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-950/40 text-xs">
              FREQUENTLY ASKED QUESTIONS
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[900] tracking-tight text-white">
              Questions &amp; Answers
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Clear answers regarding verification timelines, point conversions, and global deliveries.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'How do I earn points on Prop Nation?',
                a: 'Whenever you purchase an evaluation or challenge account from any partner prop firm on our platform, apply affiliate code NATION at checkout. Once your payment confirms, submit your Order ID and receipt proof in your dashboard. Our team verifies the purchase and immediately credits guaranteed points to your ledger.',
              },
              {
                q: 'Do my earned points ever expire?',
                a: 'Never. Your points ledger is permanent. Points compound across all your verified prop firm purchases and remain valid until you choose to redeem them for physical electronics or USDT cash payouts.',
              },
              {
                q: 'How long does purchase verification take?',
                a: 'Most submissions are verified within 12 to 24 business hours. Once verified, your points are automatically released to your available balance and ready for immediate checkout.',
              },
              {
                q: 'Can I redeem points for USDT cryptocurrency directly?',
                a: 'Yes. In addition to physical electronics (AirPods, MacBooks, iPhones), you can redeem points for direct TRC-20 USDT crypto transfers deposited straight to your private cold wallet or exchange address.',
              },
              {
                q: 'Are all prop firms eligible for rewards?',
                a: 'Points are awarded for all challenge purchases made with proprietary trading firms listed in our official catalog where code NATION was applied at checkout.',
              },
              {
                q: 'Is Prop Nation a broker or prop firm?',
                a: 'No. Prop Nation is strictly an affiliate rewards portal and loyalty community. We do not accept deposits, offer financial investment advice, or host simulated challenge servers.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-[#0f1715] border border-emerald-500/20 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-white text-base hover:text-emerald-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-emerald-400 shrink-0 transition-transform duration-300 ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          13. FINAL HIGH-IMPACT CTA & FOOTER STRIP
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-16 sm:py-20 lg:py-24 overflow-hidden bg-gradient-to-b from-[#070b10] to-[#040608]">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/20 blur-[100px] rounded-full" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-950/40 text-xs">
            START EARNING TODAY
          </Badge>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-[900] tracking-tight text-white leading-tight">
            Your Next Reward Starts Here.
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Stop buying prop firm challenges without earning equity. Use partner code{' '}
            <strong className="text-emerald-400 font-mono">NATION</strong> and unlock the rewards you deserve.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/prop-firms"
              className="w-full sm:w-auto h-13 px-9 text-base font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Start Earning</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/rewards"
              className="w-full sm:w-auto h-13 px-9 text-base font-semibold border border-slate-700 bg-[#101716] text-white hover:bg-slate-800 rounded-xl flex items-center justify-center gap-2"
            >
              <Gift className="h-4 w-4 text-emerald-400" />
              <span>Explore Rewards</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
