'use client';

import React, { useState, useEffect } from 'react';
import {
  Calculator,
  ShieldAlert,
  TrendingUp,
  Sliders,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Coins,
  Layers,
} from 'lucide-react';
import { AutoApplyModal, AutoApplyFirmData } from '@/components/prop-firms/auto-apply-modal';
import { buildAutoApplyUrl } from '@/lib/referral-system';

interface PropFirmRuleData {
  id: string;
  name: string;
  slug: string;
  code: string;
  websiteUrl: string;
  affiliateCode: string;
  affiliateUrl: string;
  drawdownType: 'Static (Balance-based)' | 'Trailing (Equity-based)';
  dailyLossPercent: number;
  maxLossPercent: number;
  profitTargetPhase1: number;
  profitTargetPhase2: number;
  weekendHolding: boolean;
  payoutSpeed: string;
  profitSplit: string;
  pricing: Record<number, number>;
  pointsPerDollar: number;
}

const FIRMS_DATA: PropFirmRuleData[] = [
  {
    id: 'custom-preset',
    name: 'Standard 2-Step Rules',
    slug: 'standard-rules',
    code: '2S',
    websiteUrl: '/prop-firms',
    affiliateCode: '',
    affiliateUrl: '/prop-firms',
    drawdownType: 'Static (Balance-based)',
    dailyLossPercent: 5,
    maxLossPercent: 10,
    profitTargetPhase1: 8,
    profitTargetPhase2: 5,
    weekendHolding: true,
    payoutSpeed: 'Bi-weekly',
    profitSplit: 'Standard',
    pricing: { 10000: 89, 25000: 189, 50000: 299, 100000: 499, 200000: 949 },
    pointsPerDollar: 10,
  },
  {
    id: 'conservative-preset',
    name: 'Conservative 2-Step Model',
    slug: 'conservative-rules',
    code: 'C2',
    websiteUrl: '/prop-firms',
    affiliateCode: '',
    affiliateUrl: '/prop-firms',
    drawdownType: 'Static (Balance-based)',
    dailyLossPercent: 4,
    maxLossPercent: 8,
    profitTargetPhase1: 8,
    profitTargetPhase2: 4,
    weekendHolding: true,
    payoutSpeed: 'Bi-weekly',
    profitSplit: 'Standard',
    pricing: { 10000: 89, 25000: 169, 50000: 299, 100000: 499, 200000: 979 },
    pointsPerDollar: 10,
  },
  {
    id: 'one-step-preset',
    name: '1-Step Trailing Model',
    slug: 'one-step-rules',
    code: '1S',
    websiteUrl: '/prop-firms',
    affiliateCode: '',
    affiliateUrl: '/prop-firms',
    drawdownType: 'Trailing (Equity-based)',
    dailyLossPercent: 3,
    maxLossPercent: 6,
    profitTargetPhase1: 10,
    profitTargetPhase2: 0,
    weekendHolding: false,
    payoutSpeed: 'Weekly',
    profitSplit: 'Standard',
    pricing: { 10000: 99, 25000: 199, 50000: 319, 100000: 529, 200000: 999 },
    pointsPerDollar: 10,
  },
  {
    id: 'swing-preset',
    name: 'Swing Evaluation Model',
    slug: 'swing-rules',
    code: 'SW',
    websiteUrl: '/prop-firms',
    affiliateCode: '',
    affiliateUrl: '/prop-firms',
    drawdownType: 'Static (Balance-based)',
    dailyLossPercent: 5,
    maxLossPercent: 10,
    profitTargetPhase1: 10,
    profitTargetPhase2: 5,
    weekendHolding: true,
    payoutSpeed: 'Weekly',
    profitSplit: 'Standard',
    pricing: { 10000: 95, 25000: 195, 50000: 309, 100000: 519, 200000: 969 },
    pointsPerDollar: 10,
  },
];

const ACCOUNT_SIZES = [10000, 25000, 50000, 100000, 200000];

function useSmoothValue(target: number, duration = 260) {
  const [display, setDisplay] = useState(target);
  useEffect(() => {
    const startVal = display;
    const diff = target - startVal;
    if (diff === 0) return;
    const startTime = performance.now();
    let rafId: number;
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startVal + diff * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);
  return display;
}

export function PropFirmCalculator() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'matrix'>('calculator');
  const [accountSize, setAccountSize] = useState<number>(100000);
  const [maxDrawdown, setMaxDrawdown] = useState<number>(10);
  const [dailyDrawdown, setDailyDrawdown] = useState<number>(5);
  const [selectedFirmId, setSelectedFirmId] = useState<string>('custom-preset');
  const [filterStyle, setFilterStyle] = useState<string>('all');

  const [autoApplyModalOpen, setAutoApplyModalOpen] = useState(false);
  const [modalFirmData, setModalFirmData] = useState<AutoApplyFirmData | null>(null);

  const maxLossRaw = Math.round((accountSize * maxDrawdown) / 100);
  const dailyLossRaw = Math.round((accountSize * dailyDrawdown) / 100);
  const maxBreachEquityRaw = accountSize - maxLossRaw;
  const dailyBreachEquityRaw = accountSize - dailyLossRaw;

  const animatedAccountSize = useSmoothValue(accountSize);
  const animatedMaxLoss = useSmoothValue(maxLossRaw);
  const animatedDailyLoss = useSmoothValue(dailyLossRaw);
  const animatedMaxBreach = useSmoothValue(maxBreachEquityRaw);
  const animatedDailyBreach = useSmoothValue(dailyBreachEquityRaw);

  const handleSelectFirmPreset = (firm: PropFirmRuleData) => {
    setSelectedFirmId(firm.id);
    setMaxDrawdown(firm.maxLossPercent);
    setDailyDrawdown(firm.dailyLossPercent);
  };

  const handleLaunchModal = (firm: PropFirmRuleData) => {
    if (firm.id === 'custom-preset') return;
    const code = firm.affiliateCode || 'NATION';
    navigator.clipboard?.writeText(code).catch(() => {});
    const directUrl = buildAutoApplyUrl(firm.affiliateUrl || firm.websiteUrl || firm.slug, code);
    window.open(directUrl, '_blank', 'noopener,noreferrer');
    setModalFirmData({
      id: firm.id,
      name: firm.name,
      slug: firm.slug,
      websiteUrl: firm.websiteUrl,
      affiliateCode: firm.affiliateCode,
      affiliateUrl: directUrl,
      tierName: `$${(accountSize / 1000).toFixed(0)}K Evaluation`,
      tierPrice: firm.pricing[accountSize] || 299,
    });
    setAutoApplyModalOpen(true);
  };

  const filteredFirms = FIRMS_DATA.filter((f) => f.id !== 'custom-preset').filter((firm) => {
    if (filterStyle === 'weekend') return firm.weekendHolding;
    if (filterStyle === 'static') return firm.drawdownType.includes('Static');
    if (filterStyle === 'fastpayout') return firm.payoutSpeed.includes('Weekly');
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5" />
            Trader Utility · Drawdown Calculator
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            KNOW YOUR LIMITS.
          </h2>
          <p className="text-slate-200 text-base sm:text-lg max-w-xl leading-relaxed">
            Calculate your maximum loss and daily loss limits across account sizes.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-[#101614] border border-white/[0.1] self-start md:self-auto">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-200 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Drawdown Calculator
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-200 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Rule Comparison
          </button>
        </div>
      </div>

      {activeTab === 'calculator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Calculator Inputs */}
          <div className="lg:col-span-6 rounded-2xl bg-[#101614] border border-white/[0.09] p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* Input 1: Account Size */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="calc-account-size"
                    className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200"
                  >
                    Account Size
                  </label>
                  <span className="text-lg font-mono font-extrabold text-white">
                    ${accountSize.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {ACCOUNT_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setAccountSize(size)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                        accountSize === size
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-xs'
                          : 'bg-[#080c0b] border-white/[0.09] text-slate-200 hover:border-emerald-500/40'
                      }`}
                    >
                      ${size / 1000}K
                    </button>
                  ))}
                </div>

                <input
                  id="calc-account-size"
                  type="range"
                  min={5000}
                  max={300000}
                  step={5000}
                  value={accountSize}
                  onChange={(e) => setAccountSize(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              {/* Input 2: Max Drawdown (%) */}
              <div className="space-y-2.5 pt-2 border-t border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="calc-max-dd"
                    className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200"
                  >
                    Max Drawdown (%)
                  </label>
                  <span className="px-2.5 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono text-sm font-bold">
                    {maxDrawdown}%
                  </span>
                </div>
                <input
                  id="calc-max-dd"
                  type="range"
                  min={3}
                  max={15}
                  step={0.5}
                  value={maxDrawdown}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMaxDrawdown(val);
                    if (dailyDrawdown > val) setDailyDrawdown(val);
                  }}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-300">
                  <span>3% Strict</span>
                  <span>8% – 10% Standard</span>
                  <span>15% Flex</span>
                </div>
              </div>

              {/* Input 3: Daily Drawdown (%) */}
              <div className="space-y-2.5 pt-2 border-t border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="calc-daily-dd"
                    className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200"
                  >
                    Daily Drawdown (%)
                  </label>
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-sm font-bold">
                    {dailyDrawdown}%
                  </span>
                </div>
                <input
                  id="calc-daily-dd"
                  type="range"
                  min={1}
                  max={10}
                  step={0.5}
                  value={dailyDrawdown}
                  onChange={(e) => setDailyDrawdown(Math.min(Number(e.target.value), maxDrawdown))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-300">
                  <span>1% Tight</span>
                  <span>4% – 5% Standard</span>
                  <span>10% Wide</span>
                </div>
              </div>
            </div>

            {/* Optional Quick Rule Presets */}
            <div className="pt-4 border-t border-white/[0.08]">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-2.5">
                Quick Rule Presets
              </div>
              <div className="flex flex-wrap gap-2">
                {FIRMS_DATA.map((firm) => (
                  <button
                    key={firm.id}
                    type="button"
                    onClick={() => handleSelectFirmPreset(firm)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      selectedFirmId === firm.id
                        ? 'bg-emerald-500/15 border-emerald-500/45 text-emerald-300'
                        : 'bg-[#080c0b] border-white/[0.08] text-slate-300 hover:border-white/20'
                    }`}
                  >
                    {firm.name} ({firm.maxLossPercent}% / {firm.dailyLossPercent}%)
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Calculated Risk Output */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-6">
            {/* Primary Output Card */}
            <div className="rounded-2xl bg-[#101614] text-white border border-white/[0.09] p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden flex-1 flex flex-col justify-between">
              {/* Subtle top-right ambient glow */}
              <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-slate-300">
                    Calculated Risk Parameters
                  </span>
                  <div className="text-xl font-bold text-white mt-0.5 font-mono">
                    Account: ${animatedAccountSize.toLocaleString()}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                  LIVE OUTPUT
                </span>
              </div>

              {/* Output Grid: Maximum Loss & Daily Loss Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Maximum Loss */}
                <div className="p-5 rounded-xl bg-[#080c0b] border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                    <span>MAXIMUM LOSS</span>
                    <span className="text-rose-400 font-bold">{maxDrawdown}%</span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                    ${animatedMaxLoss.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-300 font-mono pt-1 border-t border-white/[0.07]">
                    Min Equity Floor: <span className="text-white font-semibold">${animatedMaxBreach.toLocaleString()}</span>
                  </div>
                </div>

                {/* Daily Loss Limit */}
                <div className="p-5 rounded-xl bg-[#080c0b] border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                    <span>DAILY LOSS LIMIT</span>
                    <span className="text-amber-400 font-bold">{dailyDrawdown}%</span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                    ${animatedDailyLoss.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-300 font-mono pt-1 border-t border-white/[0.07]">
                    Daily Stop Floor: <span className="text-white font-semibold">${animatedDailyBreach.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Visual Risk Buffer Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">DAILY LOSS VS. TOTAL DRAWDOWN BUFFER</span>
                  <span className="text-emerald-400 font-bold">
                    {maxDrawdown > 0 ? Math.round((dailyDrawdown / maxDrawdown) * 100) : 0}% of Max Limit per Day
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-[#080c0b] border border-white/[0.08] overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(10, (dailyDrawdown / Math.max(maxDrawdown, 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Educational Disclaimer */}
              <div className="pt-3 border-t border-white/[0.08] flex items-start gap-2.5 text-xs text-slate-300">
                <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  Educational tool only. Always verify current rules with the relevant prop firm.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: COMPARISON MATRIX */
        <div className="rounded-2xl bg-[#101614] border border-white/[0.09] p-6 sm:p-8 shadow-xl overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-white/[0.08] pb-4">
            <span className="text-xs font-mono text-slate-300 mr-2 uppercase tracking-wider">
              Filter Rules:
            </span>
            {[
              { id: 'all', label: 'All Participating Firms' },
              { id: 'static', label: 'Static Drawdown' },
              { id: 'weekend', label: 'Weekend Holding Allowed' },
              { id: 'fastpayout', label: 'Weekly Payouts' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStyle(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterStyle === f.id
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-[#080c0b] text-slate-200 hover:text-white border border-white/[0.08]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-[11px] font-mono text-slate-300 uppercase tracking-wider">
                  <th className="py-3 px-4">Prop Firm</th>
                  <th className="py-3 px-4">Drawdown Type</th>
                  <th className="py-3 px-4">Daily Drawdown</th>
                  <th className="py-3 px-4">Max Drawdown</th>
                  <th className="py-3 px-4">Targets (P1 / P2)</th>
                  <th className="py-3 px-4">Weekend Holding</th>
                  <th className="py-3 px-4 text-right">Offer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.07] font-mono text-xs text-slate-200">
                {filteredFirms.map((firm) => (
                  <tr key={firm.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-4 px-4 font-sans font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center font-mono text-xs font-bold text-emerald-400">
                        {firm.code}
                      </div>
                      <span>{firm.name}</span>
                    </td>
                    <td className="py-4 px-4">{firm.drawdownType}</td>
                    <td className="py-4 px-4 font-bold text-amber-400">{firm.dailyLossPercent}%</td>
                    <td className="py-4 px-4 font-bold text-rose-400">{firm.maxLossPercent}%</td>
                    <td className="py-4 px-4 text-emerald-400 font-semibold">
                      {firm.profitTargetPhase1}% / {firm.profitTargetPhase2}%
                    </td>
                    <td className="py-4 px-4">
                      {firm.weekendHolding ? (
                        <span className="text-emerald-400 inline-flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Allowed
                        </span>
                      ) : (
                        <span className="text-rose-400 inline-flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> No
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right font-sans">
                      <button
                        onClick={() => handleLaunchModal(firm)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold text-xs transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        View Offer <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-slate-300 font-sans">
            Educational tool only. Always verify current rules with the relevant prop firm.
          </p>
        </div>
      )}

      <AutoApplyModal
        isOpen={autoApplyModalOpen}
        onClose={() => setAutoApplyModalOpen(false)}
        firm={modalFirmData}
      />
    </div>
  );
}
