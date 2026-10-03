'use client';

import React, { useState } from 'react';
import {
  Calculator,
  ShieldCheck,
  TrendingUp,
  Percent,
  AlertTriangle,
  Gift,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sliders,
  DollarSign,
  Zap,
} from 'lucide-react';
import { AutoApplyModal, AutoApplyFirmData } from '@/components/prop-firms/auto-apply-modal';

interface PropFirmRuleData {
  id: string;
  name: string;
  slug: string;
  logo: string;
  websiteUrl: string;
  affiliateCode: string;
  affiliateUrl: string;
  drawdownType: 'Static (Balance-based)' | 'Trailing (Equity-based)';
  dailyLossPercent: number;
  maxLossPercent: number;
  profitTargetPhase1: number;
  profitTargetPhase2: number;
  weekendHolding: boolean;
  newsTrading: boolean;
  eaAllowed: boolean;
  payoutSpeed: string;
  profitSplit: string;
  pricing: Record<number, number>; // accountSize -> priceUsd
  pointsPerDollar: number;
}

const FIRMS_DATA: PropFirmRuleData[] = [
  {
    id: 'ftmo',
    name: 'FTMO',
    slug: 'ftmo',
    logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&auto=format&fit=crop&q=80',
    websiteUrl: 'https://ftmo.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://ftmo.com/?ref=nation',
    drawdownType: 'Static (Balance-based)',
    dailyLossPercent: 5,
    maxLossPercent: 10,
    profitTargetPhase1: 10,
    profitTargetPhase2: 5,
    weekendHolding: true,
    newsTrading: true,
    eaAllowed: true,
    payoutSpeed: 'Bi-weekly (Fast)',
    profitSplit: '80% – 90%',
    pricing: {
      10000: 175,
      25000: 280,
      50000: 390,
      100000: 600,
      200000: 1180,
    },
    pointsPerDollar: 10,
  },
  {
    id: 'fundednext',
    name: 'FundedNext',
    slug: 'fundednext',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&auto=format&fit=crop&q=80',
    websiteUrl: 'https://fundednext.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://fundednext.com/?ref=nation',
    drawdownType: 'Static (Balance-based)',
    dailyLossPercent: 5,
    maxLossPercent: 10,
    profitTargetPhase1: 8,
    profitTargetPhase2: 5,
    weekendHolding: true,
    newsTrading: true,
    eaAllowed: true,
    payoutSpeed: '24-Hour Guaranteed',
    profitSplit: 'Up to 95%',
    pricing: {
      10000: 99,
      25000: 199,
      50000: 299,
      100000: 549,
      200000: 1099,
    },
    pointsPerDollar: 10,
  },
  {
    id: 'funding-pips',
    name: 'Funding Pips',
    slug: 'funding-pips',
    logo: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=120&auto=format&fit=crop&q=80',
    websiteUrl: 'https://fundingpips.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://fundingpips.com/?ref=nation',
    drawdownType: 'Trailing (Equity-based)',
    dailyLossPercent: 5,
    maxLossPercent: 10,
    profitTargetPhase1: 8,
    profitTargetPhase2: 5,
    weekendHolding: true,
    newsTrading: true,
    eaAllowed: true,
    payoutSpeed: 'Weekly (Every 5 Days)',
    profitSplit: '80% – 90%',
    pricing: {
      10000: 60,
      25000: 139,
      50000: 239,
      100000: 399,
      200000: 799,
    },
    pointsPerDollar: 10,
  },
  {
    id: 'fundedsquad',
    name: 'FundedSquad',
    slug: 'fundedsquad',
    logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&auto=format&fit=crop&q=80',
    websiteUrl: 'https://fundedsquad.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://fundedsquad.com/?ref=nation',
    drawdownType: 'Static (Balance-based)',
    dailyLossPercent: 4,
    maxLossPercent: 8,
    profitTargetPhase1: 8,
    profitTargetPhase2: 4,
    weekendHolding: true,
    newsTrading: true,
    eaAllowed: true,
    payoutSpeed: 'Bi-weekly',
    profitSplit: '85% – 90%',
    pricing: {
      10000: 89,
      25000: 169,
      50000: 299,
      100000: 499,
      200000: 979,
    },
    pointsPerDollar: 10,
  },
];

const SIZES = [10000, 25000, 50000, 100000, 200000];

export function PropFirmCalculator() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'matrix'>('calculator');
  const [selectedFirmId, setSelectedFirmId] = useState<string>('ftmo');
  const [accountSize, setAccountSize] = useState<number>(100000);
  const [vipTier, setVipTier] = useState<number>(1.0); // 1.0 = Rookie, 1.25 = Funded, 1.5 = Master
  const [filterStyle, setFilterStyle] = useState<string>('all');

  // Modal State
  const [autoApplyModalOpen, setAutoApplyModalOpen] = useState(false);
  const [modalFirmData, setModalFirmData] = useState<AutoApplyFirmData | null>(null);

  const selectedFirm = FIRMS_DATA.find((f) => f.id === selectedFirmId) || FIRMS_DATA[0];

  // Calculations
  const price = selectedFirm.pricing[accountSize] || 500;
  const maxLossDollar = (accountSize * selectedFirm.maxLossPercent) / 100;
  const dailyLossDollar = (accountSize * selectedFirm.dailyLossPercent) / 100;
  const profitTargetP1Dollar = (accountSize * selectedFirm.profitTargetPhase1) / 100;
  const profitTargetP2Dollar = (accountSize * selectedFirm.profitTargetPhase2) / 100;

  const basePoints = Math.round(price * selectedFirm.pointsPerDollar);
  const finalPoints = Math.round(basePoints * vipTier);
  const bonusPoints = finalPoints - basePoints;

  // Filtered firms for matrix
  const filteredFirms = FIRMS_DATA.filter((firm) => {
    if (filterStyle === 'weekend') return firm.weekendHolding;
    if (filterStyle === 'static') return firm.drawdownType.includes('Static');
    if (filterStyle === 'fastpayout') return firm.payoutSpeed.includes('24-Hour') || firm.payoutSpeed.includes('Weekly');
    if (filterStyle === 'highsplit') return firm.profitSplit.includes('95%');
    return true;
  });

  const handleLaunchModal = (firm: PropFirmRuleData) => {
    setModalFirmData({
      id: firm.id,
      name: firm.name,
      slug: firm.slug,
      logoUrl: firm.logo,
      websiteUrl: firm.websiteUrl,
      affiliateCode: firm.affiliateCode,
      affiliateUrl: firm.affiliateUrl,
      tierName: `$${(accountSize / 1000).toFixed(0)}K Evaluation Challenge`,
      tierPrice: firm.pricing[accountSize] || 250,
    });
    setAutoApplyModalOpen(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Calculator className="w-3.5 h-3.5" />
          Interactive Trader Terminal
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Prop Firm Rules & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Drawdown Calculator</span>
        </h2>
        <p className="mt-3 text-slate-400 text-base">
          Know your exact dollar risk limits, profit targets, and guaranteed PropNation Reward Points before you buy.
        </p>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'calculator'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Risk & Reward Calculator
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'matrix'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Side-by-Side Comparison Matrix
          </button>
        </div>
      </div>

      {/* TAB 1: CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls (Left 5 Cols) */}
          <div className="lg:col-span-5 rounded-3xl bg-[#090e13]/90 border border-slate-800/80 p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              Configure Challenge Parameters
            </h3>

            {/* Firm Selector */}
            <div className="mb-6">
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                1. Select Target Prop Firm
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {FIRMS_DATA.map((firm) => (
                  <button
                    key={firm.id}
                    onClick={() => setSelectedFirmId(firm.id)}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-left transition-all ${
                      selectedFirmId === firm.id
                        ? 'bg-emerald-500/15 border-emerald-500/60 text-white shadow-md shadow-emerald-500/10'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <img src={firm.logo} alt={firm.name} className="w-6 h-6 rounded-md object-cover" />
                    <span className="text-xs font-bold truncate">{firm.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Account Size Selector */}
            <div className="mb-6">
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                2. Choose Challenge Account Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setAccountSize(size)}
                    className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                      accountSize === size
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    ${(size / 1000).toFixed(0)}K
                  </button>
                ))}
              </div>
            </div>

            {/* VIP Tier Boost Multiplier Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  3. Trader VIP Tier Boost
                </label>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {vipTier === 1.0 ? '1.0x (Standard)' : vipTier === 1.25 ? '1.25x (+25%)' : '1.50x (+50%)'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setVipTier(1.0)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                    vipTier === 1.0
                      ? 'bg-slate-800 text-white border-slate-600'
                      : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  🥉 Rookie (1.0x)
                </button>
                <button
                  onClick={() => setVipTier(1.25)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                    vipTier === 1.25
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                      : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  🥈 Funded (1.25x)
                </button>
                <button
                  onClick={() => setVipTier(1.5)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                    vipTier === 1.5
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                      : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  👑 Master (1.5x)
                </button>
              </div>
            </div>

            {/* Launch Modal CTA */}
            <button
              onClick={() => handleLaunchModal(selectedFirm)}
              className="w-full mt-4 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              1-Click Launch with Code {selectedFirm.affiliateCode}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Results Visualizer (Right 7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Max Overall Drawdown */}
              <div className="rounded-2xl bg-[#090e13]/90 border border-slate-800/80 p-5 backdrop-blur-xl relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                  <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    Max Overall Drawdown
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold">
                    {selectedFirm.maxLossPercent}% Limit
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-white font-mono">
                  ${maxLossDollar.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Type: <span className="text-slate-200 font-semibold">{selectedFirm.drawdownType}</span>
                </p>
              </div>

              {/* Max Daily Loss */}
              <div className="rounded-2xl bg-[#090e13]/90 border border-slate-800/80 p-5 backdrop-blur-xl relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                  <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    Max Daily Loss
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">
                    {selectedFirm.dailyLossPercent}% Limit
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-white font-mono">
                  ${dailyLossDollar.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Reset: <span className="text-slate-200 font-semibold">00:00 CE(S)T Daily</span>
                </p>
              </div>

              {/* Profit Target Phase 1 */}
              <div className="rounded-2xl bg-[#090e13]/90 border border-slate-800/80 p-5 backdrop-blur-xl relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    Profit Target (Phase 1)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                    {selectedFirm.profitTargetPhase1}%
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-white font-mono">
                  ${profitTargetP1Dollar.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Phase 2 Target: <span className="text-emerald-400 font-semibold">${profitTargetP2Dollar.toLocaleString()} ({selectedFirm.profitTargetPhase2}%)</span>
                </p>
              </div>

              {/* Payout & Profit Split */}
              <div className="rounded-2xl bg-[#090e13]/90 border border-slate-800/80 p-5 backdrop-blur-xl relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                  <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                    <Percent className="w-4 h-4" />
                    Payout & Split
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold">
                    {selectedFirm.profitSplit}
                  </span>
                </div>
                <div className="text-xl font-bold text-white">
                  {selectedFirm.payoutSpeed}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Weekend Holding: <span className="text-emerald-400 font-semibold">Allowed ✓</span>
                </p>
              </div>
            </div>

            {/* PropNation Reward Yield Card (Golden / Emerald Vault Card) */}
            <div className="rounded-3xl bg-gradient-to-br from-[#0c1613] via-[#08110f] to-[#040807] border-2 border-emerald-500/40 p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-6 mb-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    <Gift className="w-4 h-4" />
                    PropNation Cashback & Rewards
                  </span>
                  <h4 className="text-2xl font-extrabold text-white mt-1">
                    Your Reward Yield on this Purchase
                  </h4>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black font-mono text-emerald-400 flex items-center gap-1 sm:justify-end">
                    +{finalPoints.toLocaleString()} <span className="text-sm font-sans font-bold text-emerald-300">PTS</span>
                  </div>
                  {bonusPoints > 0 && (
                    <span className="text-[11px] font-mono text-amber-300 font-semibold">
                      Includes +{bonusPoints.toLocaleString()} VIP Bonus Points!
                    </span>
                  )}
                </div>
              </div>

              {/* What you can redeem */}
              <div>
                <p className="text-xs text-slate-400 font-medium mb-3">
                  Unlocked Reward Potential:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    <span className="text-emerald-400 font-bold block mb-1">🎁 Tech Gear</span>
                    <span className="text-slate-300">Apple AirPods, Sony XM5, Keyboards</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    <span className="text-emerald-400 font-bold block mb-1">💳 Instant Cash Cards</span>
                    <span className="text-slate-300">Amazon, Steam, Apple Gift Cards</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    <span className="text-emerald-400 font-bold block mb-1">⚡ Next Challenge Off</span>
                    <span className="text-slate-300">Use points for 50%-100% off challenges</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPARISON MATRIX */}
      {activeTab === 'matrix' && (
        <div className="rounded-3xl bg-[#090e13]/90 border border-slate-800/80 p-6 md:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-800 pb-4">
            <span className="text-xs font-mono text-slate-400 mr-2 uppercase tracking-wider">
              Filter By Trading Style:
            </span>
            {[
              { id: 'all', label: 'All Firms' },
              { id: 'weekend', label: 'Weekend Holding (Swing)' },
              { id: 'static', label: 'Static Drawdown Only' },
              { id: 'fastpayout', label: 'Fast Payouts (≤24h / Weekly)' },
              { id: 'highsplit', label: '90%+ Profit Split' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStyle(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStyle === f.id
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Prop Firm</th>
                  <th className="py-3 px-4">Drawdown Type</th>
                  <th className="py-3 px-4">Daily Loss</th>
                  <th className="py-3 px-4">Max Loss</th>
                  <th className="py-3 px-4">Profit Targets</th>
                  <th className="py-3 px-4">Profit Split</th>
                  <th className="py-3 px-4">Payout Cycle</th>
                  <th className="py-3 px-4">Weekend Holding</th>
                  <th className="py-3 px-4 text-emerald-400">Reward Yield</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs text-slate-300">
                {filteredFirms.map((firm) => (
                  <tr key={firm.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-4 font-sans font-bold text-white flex items-center gap-3">
                      <img src={firm.logo} alt={firm.name} className="w-7 h-7 rounded-lg object-cover" />
                      <span>{firm.name}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          firm.drawdownType.includes('Static')
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {firm.drawdownType}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-200">{firm.dailyLossPercent}%</td>
                    <td className="py-4 px-4 font-bold text-slate-200">{firm.maxLossPercent}%</td>
                    <td className="py-4 px-4 text-emerald-400 font-semibold">
                      {firm.profitTargetPhase1}% / {firm.profitTargetPhase2}%
                    </td>
                    <td className="py-4 px-4 font-bold text-white">{firm.profitSplit}</td>
                    <td className="py-4 px-4 font-sans text-slate-300">{firm.payoutSpeed}</td>
                    <td className="py-4 px-4">
                      {firm.weekendHolding ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Allowed
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Prohibited
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-emerald-400 font-bold">
                      10 PTS / $1
                    </td>
                    <td className="py-4 px-4 text-right font-sans">
                      <button
                        onClick={() => handleLaunchModal(firm)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold text-xs transition-all inline-flex items-center gap-1"
                      >
                        Apply Code {firm.affiliateCode}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Auto-Apply Modal instance */}
      <AutoApplyModal
        isOpen={autoApplyModalOpen}
        onClose={() => setAutoApplyModalOpen(false)}
        firm={modalFirmData}
      />
    </div>
  );
}
