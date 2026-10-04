'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Coins,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Clock,
  ArrowRight,
  Zap,
  Flame,
  Award,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AutoApplyModal, AutoApplyFirmData } from '@/components/prop-firms/auto-apply-modal';
import { buildAutoApplyUrl } from '@/lib/referral-system';

export interface EvaluationModel {
  id: string;
  name: string;
  shortName: string;
  badge?: string;
  badgeVariant?: 'hot' | 'fast' | 'instant' | 'futures';
  description: string;
  targets: {
    phase1: string;
    phase2: string;
    maxDailyLoss: string;
    maxTotalLoss: string;
    minTradingDays: string;
    profitSplit: string;
  };
  tiers: {
    size: number;
    label: string;
    price: number;
    popular?: boolean;
  }[];
}

interface InteractiveEvaluationMatrixProps {
  firmName: string;
  affiliateCode?: string;
  affiliateUrl?: string;
  websiteUrl?: string;
  firmId?: string;
}

const DEFAULT_MODELS: EvaluationModel[] = [
  {
    id: '2-step',
    name: '2-Step Standard',
    shortName: '2-Step',
    badge: 'HOT',
    badgeVariant: 'hot',
    description: 'The industry-standard 2-phase evaluation. Maximum drawdown buffer with highest profit share up to 95%.',
    targets: {
      phase1: '8% Target',
      phase2: '5% Target',
      maxDailyLoss: '5% Daily',
      maxTotalLoss: '10% Max Drawdown',
      minTradingDays: '5 Days',
      profitSplit: 'Up to 95%',
    },
    tiers: [
      { size: 10000, label: '$10,000', price: 99 },
      { size: 25000, label: '$25,000', price: 189 },
      { size: 50000, label: '$50,000', price: 290, popular: true },
      { size: 100000, label: '$100,000', price: 499 },
      { size: 200000, label: '$200,000', price: 979 },
    ],
  },
  {
    id: '1-step',
    name: '1-Step Flex',
    shortName: '1-Step',
    badge: 'FAST PASS',
    badgeVariant: 'fast',
    description: 'Pass in a single phase and get funded fast. Trailing drawdown with zero minimum trading day requirement.',
    targets: {
      phase1: '10% Target',
      phase2: 'None (1-Step)',
      maxDailyLoss: '4% Daily',
      maxTotalLoss: '6% Trailing',
      minTradingDays: '2 Days',
      profitSplit: 'Up to 90%',
    },
    tiers: [
      { size: 10000, label: '$10,000', price: 110 },
      { size: 25000, label: '$25,000', price: 219 },
      { size: 50000, label: '$50,000', price: 330, popular: true },
      { size: 100000, label: '$100,000', price: 580 },
    ],
  },
  {
    id: 'instant',
    name: 'Zero Evaluation (Instant)',
    shortName: 'Instant Funding',
    badge: 'NO EVAL',
    badgeVariant: 'instant',
    description: 'Skip the challenge entirely. Trade live capital from day one with bi-weekly payout cycles and instant scaling.',
    targets: {
      phase1: 'No Target',
      phase2: 'None',
      maxDailyLoss: '3% Daily',
      maxTotalLoss: '6% Max Drawdown',
      minTradingDays: 'Immediate',
      profitSplit: 'Up to 85%',
    },
    tiers: [
      { size: 10000, label: '$10,000', price: 249 },
      { size: 25000, label: '$25,000', price: 489, popular: true },
      { size: 50000, label: '$50,000', price: 899 },
    ],
  },
  {
    id: 'futures',
    name: 'Futures Evaluation',
    shortName: 'Futures CME',
    badge: 'FUTURES',
    badgeVariant: 'futures',
    description: 'Trade E-mini and Micro contracts on CME, CBOT, NYMEX and COMEX with raw Level 2 orderbook execution.',
    targets: {
      phase1: '$1,500 Target',
      phase2: 'None',
      maxDailyLoss: 'EOD Trailing',
      maxTotalLoss: '$2,500 Max',
      minTradingDays: '1 Day',
      profitSplit: 'Up to 90%',
    },
    tiers: [
      { size: 25000, label: '$25,000', price: 145 },
      { size: 50000, label: '$50,000', price: 195, popular: true },
      { size: 100000, label: '$100,000', price: 330 },
      { size: 150000, label: '$150,000', price: 420 },
    ],
  },
];

export function InteractiveEvaluationMatrix({
  firmName,
  affiliateCode = 'NATION',
  affiliateUrl,
  websiteUrl,
  firmId,
}: InteractiveEvaluationMatrixProps) {
  const [selectedModelId, setSelectedModelId] = useState<string>('2-step');
  const [copiedCode, setCopiedCode] = useState(false);

  const currentModel = useMemo(() => {
    return DEFAULT_MODELS.find((m) => m.id === selectedModelId) || DEFAULT_MODELS[0];
  }, [selectedModelId]);

  const [selectedTierIndex, setSelectedTierIndex] = useState<number>(() => {
    const popIdx = currentModel.tiers.findIndex((t) => t.popular);
    return popIdx !== -1 ? popIdx : 0;
  });

  // Keep tier index valid when switching models
  const safeTierIndex = Math.min(selectedTierIndex, currentModel.tiers.length - 1);
  const activeTier = currentModel.tiers[safeTierIndex] || currentModel.tiers[0];

  // Cashback Calculation: 1$ = 10 PTS (100 PTS = $1.00 USD cashout => 10% net cashback yield)
  const challengeCost = activeTier.price;
  const cashbackPoints = challengeCost * 10;
  const spendableCashoutUsd = (cashbackPoints / 100).toFixed(2);
  const effectiveNetCostUsd = (challengeCost - cashbackPoints / 100).toFixed(2);

  const destinationUrl = affiliateUrl || websiteUrl || '#';
  const [isAutoApplyOpen, setIsAutoApplyOpen] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(affiliateCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  };

  const handleTriggerAutoApply = () => {
    const code = affiliateCode || 'NATION';
    navigator.clipboard?.writeText(code).catch(() => {});
    const directUrl = buildAutoApplyUrl(affiliateUrl || websiteUrl || firmName, code);
    window.open(directUrl, '_blank', 'noopener,noreferrer');
    setIsAutoApplyOpen(true);
  };

  return (
    <section className="space-y-6 text-left w-full">
      {/* Section Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80">
          <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          <span>Interactive Evaluation Matrix</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-[900] text-slate-900 dark:text-white tracking-tight">
          Transparent Pricing &amp; Guaranteed Cashback Yield
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Compare account models, evaluation objectives, and see exactly how many reward points are credited to your wallet.
        </p>
      </div>

      {/* Main Matrix Box */}
      <div className="rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#070913] p-4 sm:p-7 shadow-xl shadow-purple-500/5 space-y-6">
        {/* Model Tabs - Fully Mobile-Responsive Horizontal Scroll Carousel */}
        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 px-0.5">
            Select Evaluation Model
          </div>
          <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar sm:grid sm:grid-cols-4 sm:gap-2.5">
              {DEFAULT_MODELS.map((model) => {
                const isSelected = model.id === currentModel.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      setSelectedModelId(model.id);
                      setSelectedTierIndex(0);
                    }}
                    className={`relative shrink-0 flex-1 min-w-[150px] sm:min-w-0 p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/60 dark:to-slate-900 border-purple-400 dark:border-purple-500 shadow-md shadow-purple-500/10'
                        : 'bg-slate-50/70 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 border-slate-200/80 dark:border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <span
                        className={`text-xs sm:text-sm font-extrabold truncate ${
                          isSelected
                            ? 'text-purple-900 dark:text-purple-100'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {model.shortName}
                      </span>
                      {model.badge && (
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md shrink-0 ${
                            model.badgeVariant === 'hot'
                              ? 'bg-rose-500 text-white animate-pulse'
                              : model.badgeVariant === 'fast'
                              ? 'bg-amber-500 text-white'
                              : model.badgeVariant === 'instant'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-purple-600 text-white'
                          }`}
                        >
                          {model.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {model.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 1: Account Size Selection (Mobile 2/3 cols, Desktop 5 cols) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-extrabold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
              <span className="h-4 w-4 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-black">
                1
              </span>
              <span>Select Account Size</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Trading Capital Allocation</span>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-2.5">
            {currentModel.tiers.map((tier, idx) => {
              const isSelected = idx === safeTierIndex;
              return (
                <button
                  key={tier.size}
                  type="button"
                  onClick={() => setSelectedTierIndex(idx)}
                  className={`relative p-3 sm:p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 min-h-[56px] sm:min-h-[64px] ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-600/30 scale-[1.02]'
                      : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-purple-300 dark:hover:border-purple-700'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-black tracking-tight">{tier.label}</span>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold ${
                      isSelected ? 'text-purple-100' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    ${tier.price} USD
                  </span>
                  {tier.popular && !isSelected && (
                    <span className="absolute -top-1.5 right-1.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[8px] font-extrabold px-1 rounded border border-purple-300 dark:border-purple-700">
                      Popular
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Evaluation Objectives & Rules Grid (Mobile 2-col, Desktop 3-col) */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="text-xs uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="h-4 w-4 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] flex items-center justify-center font-black">
              2
            </span>
            <span>Evaluation Objectives &amp; Rules</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {/* Phase 1 Target */}
            <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-0.5">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Phase 1 Target
              </span>
              <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                {currentModel.targets.phase1}
              </div>
            </div>

            {/* Phase 2 Target */}
            <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-0.5">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Phase 2 Target
              </span>
              <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                {currentModel.targets.phase2}
              </div>
            </div>

            {/* Max Daily Loss */}
            <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-0.5">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Max Daily Loss
              </span>
              <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                {currentModel.targets.maxDailyLoss}
              </div>
            </div>

            {/* Max Total Loss */}
            <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-0.5">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Max Total Loss
              </span>
              <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                {currentModel.targets.maxTotalLoss}
              </div>
            </div>

            {/* Min Trading Days */}
            <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-0.5">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Min Trading Days
              </span>
              <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                {currentModel.targets.minTradingDays}
              </div>
            </div>

            {/* Profit Split */}
            <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 space-y-0.5">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Profit Split
              </span>
              <div className="text-xs sm:text-sm font-black text-purple-900 dark:text-purple-100 flex items-center gap-1">
                <span>{currentModel.targets.profitSplit}</span>
                <Sparkles className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Universal Cashback Code Banner */}
        <div className="rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-700/80 bg-purple-50/50 dark:bg-purple-950/20 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[11px] uppercase tracking-wider font-black text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
              <span>Cashback &amp; Discount Promo Code</span>
              <Badge variant="purple" className="text-[9px] py-0 px-1.5">
                Required
              </Badge>
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Apply code at {firmName} checkout to guarantee wallet reward points.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <div className="flex-1 sm:flex-none font-mono text-base sm:text-lg font-black text-purple-950 dark:text-white bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 px-3.5 py-1.5 rounded-xl tracking-wider text-center shadow-xs">
              {affiliateCode}
            </div>
            <Button
              type="button"
              variant={copiedCode ? 'primary' : 'outline'}
              size="sm"
              onClick={handleCopyCode}
              className="text-xs font-bold shrink-0 border-purple-300 dark:border-purple-700"
            >
              {copiedCode ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              {copiedCode ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Step 3: Transparent Pricing & Cashback Yield Card (Mobile-Optimized) */}
        <div className="rounded-3xl border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/90 via-violet-50/50 to-indigo-50/80 dark:from-[#0f1124] dark:via-[#090b17] dark:to-[#0c1024] p-4 sm:p-6 space-y-5 shadow-lg">
          {/* Top Row: Challenge Cost & Cashback Reward Yield */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-purple-200/70 dark:divide-purple-800/60">
            {/* Challenge Cost */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Official Challenge Cost
              </span>
              <div className="text-2xl sm:text-3xl font-[900] text-slate-900 dark:text-white tracking-tight">
                ${challengeCost.toLocaleString('en-US')} <span className="text-xs font-bold text-slate-400">USD</span>
              </div>
              <div className="text-[11px] text-slate-500">
                For {activeTier.label} {currentModel.name}
              </div>
            </div>

            {/* Cashback Reward Yield */}
            <div className="pt-3 sm:pt-0 sm:pl-6 space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <Coins className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                <span>Cashback Reward Yield</span>
              </span>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-purple-700 dark:text-purple-300 tracking-tight">
                  +{cashbackPoints.toLocaleString('en-US')}
                </span>
                <span className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  PTS
                </span>
                <span className="bg-purple-200/80 dark:bg-purple-900/80 text-purple-900 dark:text-purple-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  ≈ ${spendableCashoutUsd} USD Cashout
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Credited directly to your PropNation wallet.
              </div>
            </div>
          </div>

          {/* Middle Row: Effective Net Cost & Clearance Time */}
          <div className="pt-4 border-t border-purple-200/70 dark:border-purple-800/60 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-purple-200/60 dark:border-purple-800/60 space-y-0.5">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Effective Net Cost
              </span>
              <div className="text-base sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                ${effectiveNetCostUsd} USD
              </div>
              <div className="text-[10px] text-slate-400">
                After ${spendableCashoutUsd} cashback yield
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-purple-200/60 dark:border-purple-800/60 space-y-0.5">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Audit Clearance
              </span>
              <div className="text-base sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span>&lt; 24 Hours</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Automated order confirmation
              </div>
            </div>
          </div>

          {/* Action Button: Purchase on Firm & Submit Proof */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              size="lg"
              onClick={handleTriggerAutoApply}
              className="w-full sm:flex-1 h-12 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-purple-600/30 rounded-2xl cursor-pointer"
            >
              <Sparkles className="h-4 w-4 mr-2 text-yellow-300" />
              <span>Buy {activeTier.label} Challenge &amp; Auto-Apply Code</span>
              <ExternalLink className="h-4 w-4 ml-2 shrink-0" />
            </Button>

            <a
              href={`/dashboard/purchases/new?propFirmId=${firmId || ''}&tier=${encodeURIComponent(
                activeTier.label
              )}`}
              className="w-full sm:w-auto"
            >
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full h-12 rounded-2xl font-bold text-xs sm:text-sm border-purple-300 dark:border-purple-700 hover:bg-purple-100/60 dark:hover:bg-purple-950/60 text-purple-900 dark:text-purple-200"
              >
                Submit Receipt Proof
              </Button>
            </a>
          </div>

          <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
            Clicking &ldquo;Buy Challenge&rdquo; auto-applies code{' '}
            <strong className="font-mono text-purple-600 dark:text-purple-400">{affiliateCode}</strong> to checkout and syncs to your clipboard.
          </p>
        </div>
      </div>

      {/* 1-Click Referral Auto-Apply Modal */}
      <AutoApplyModal
        isOpen={isAutoApplyOpen}
        onClose={() => setIsAutoApplyOpen(false)}
        firm={{
          id: firmId || 'custom-firm',
          name: firmName,
          slug: firmName.toLowerCase().replace(/\s+/g, '-'),
          affiliateCode: affiliateCode || 'NATION',
          affiliateUrl,
          websiteUrl,
          tierName: activeTier.label,
          tierPrice: challengeCost,
        }}
      />
    </section>
  );
}
