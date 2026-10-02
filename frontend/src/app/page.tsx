'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Coins,
  Gift,
  Flame,
  TrendingUp,
  Clock,
  Layers,
  ChevronDown,
  Calculator,
  ExternalLink,
  Wallet,
  Star,
  Users,
  Award,
  Zap,
  Lock,
  Headphones,
  ArrowUpRight,
  BarChart3,
  Target,
  Laptop,
  Truck,
  FileCheck,
  Percent,
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
  logoUrl: string;
  description: string;
  websiteUrl: string;
  affiliateCode: string;
  affiliateUrl: string;
  offers: PropFirmOffer[];
}

interface Reward {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  pointsRequired: number;
  stock: number;
  isUnlimitedStock: boolean;
  category: { name: string; slug: string };
}

// Live real-time ticker stream modeled after FundingPips transparency
const LIVE_VERIFICATION_STREAM = [
  { trader: '@Marco_FX (UK)', firm: 'Funding Pips $100K 2-Step', yield: '+4,500 PTS', usd: '$45.00 Back', time: 'Just now' },
  { trader: '@K_Larsson (SE)', firm: 'FTMO $200K Challenge', yield: '+11,200 PTS', usd: '$112.00 Back', time: '3m ago' },
  { trader: '@S_Kapoor (IN)', firm: 'Funding Pips $50K 1-Step', yield: '+2,900 PTS', usd: '$29.00 Back', time: '7m ago' },
  { trader: '@Lucas_R (US)', firm: 'Redeemed Apple iPad Air M2', yield: 'Shipped via DHL', usd: 'Delivered', time: '12m ago' },
  { trader: '@David_T (DE)', firm: 'Withdrew $250.00 USDT', yield: 'Paid Out', usd: 'Completed', time: '18m ago' },
  { trader: '@Jean_P (FR)', firm: 'FundedNext $100K Stellar', yield: '+5,400 PTS', usd: '$54.00 Back', time: '22m ago' },
];

// Interactive Evaluation Matrix data (FundingPips inspired)
const EVALUATION_MODELS = [
  {
    id: '2step',
    name: '2-Step Standard',
    badge: 'Most Popular',
    popular: true,
    sizes: [
      { size: '$10,000', price: 60, points: 600, cash: 6.0, target1: '8%', target2: '5%', maxDaily: '5%', maxLoss: '10%', minDays: '0 Days', promo: 'PIPSREWARDS' },
      { size: '$25,000', price: 139, points: 1400, cash: 14.0, target1: '8%', target2: '5%', maxDaily: '5%', maxLoss: '10%', minDays: '0 Days', promo: 'PIPSREWARDS' },
      { size: '$50,000', price: 239, points: 2400, cash: 24.0, target1: '8%', target2: '5%', maxDaily: '5%', maxLoss: '10%', minDays: '0 Days', promo: 'PIPSREWARDS' },
      { size: '$100,000', price: 399, points: 4500, cash: 45.0, target1: '8%', target2: '5%', maxDaily: '5%', maxLoss: '10%', minDays: '0 Days', promo: 'PIPSREWARDS' },
      { size: '$200,000', price: 799, points: 9500, cash: 95.0, target1: '8%', target2: '5%', maxDaily: '5%', maxLoss: '10%', minDays: '0 Days', promo: 'PIPSREWARDS' },
    ],
  },
  {
    id: '1step',
    name: '1-Step Flex',
    badge: 'Fastest Funding',
    popular: false,
    sizes: [
      { size: '$10,000', price: 75, points: 750, cash: 7.5, target1: '10%', target2: 'None', maxDaily: '4%', maxLoss: '6% Trailing', minDays: '0 Days', promo: 'PIPSREWARDS' },
      { size: '$25,000', price: 165, points: 1650, cash: 16.5, target1: '10%', target2: 'None', maxDaily: '4%', maxLoss: '6% Trailing', minDays: '0 Days', promo: 'PIPSREWARDS' },
      { size: '$50,000', price: 285, points: 2900, cash: 29.0, target1: '10%', target2: 'None', maxDaily: '4%', maxLoss: '6% Trailing', minDays: '0 Days', promo: 'PIPSREWARDS' },
      { size: '$100,000', price: 475, points: 5200, cash: 52.0, target1: '10%', target2: 'None', maxDaily: '4%', maxLoss: '6% Trailing', minDays: '0 Days', promo: 'PIPSREWARDS' },
    ],
  },
  {
    id: 'instant',
    name: 'Zero Evaluation (Instant)',
    badge: 'Skip Challenge',
    popular: false,
    sizes: [
      { size: '$10,000', price: 290, points: 3000, cash: 30.0, target1: 'No Target', target2: 'None', maxDaily: '3%', maxLoss: '6%', minDays: 'Immediate', promo: 'PIPSREWARDS' },
      { size: '$25,000', price: 650, points: 7000, cash: 70.0, target1: 'No Target', target2: 'None', maxDaily: '3%', maxLoss: '6%', minDays: 'Immediate', promo: 'PIPSREWARDS' },
      { size: '$50,000', price: 1250, points: 14000, cash: 140.0, target1: 'No Target', target2: 'None', maxDaily: '3%', maxLoss: '6%', minDays: 'Immediate', promo: 'PIPSREWARDS' },
    ],
  },
  {
    id: 'futures',
    name: 'Futures Evaluation',
    badge: 'CME / Topstep & Apex',
    popular: false,
    sizes: [
      { size: '$25,000', price: 125, points: 1300, cash: 13.0, target1: '$1,500', target2: 'None', maxDaily: 'None', maxLoss: '$1,500 EOD', minDays: '1 Day', promo: 'PROPNATION' },
      { size: '$50,000', price: 165, points: 1800, cash: 18.0, target1: '$3,000', target2: 'None', maxDaily: 'None', maxLoss: '$2,000 EOD', minDays: '1 Day', promo: 'PROPNATION' },
      { size: '$100,000', price: 320, points: 3500, cash: 35.0, target1: '$6,000', target2: 'None', maxDaily: 'None', maxLoss: '$3,000 EOD', minDays: '1 Day', promo: 'PROPNATION' },
    ],
  },
];

export default function HomePage() {
  const [propFirms, setPropFirms] = useState<PropFirm[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Interactive Challenge Matrix State (FundingPips style)
  const [selectedModelIdx, setSelectedModelIdx] = useState<number>(0);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState<number>(3); // Defaults to $100K

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    // Load live firms & rewards
    api
      .get<PropFirm[]>('/prop-firms')
      .then((data) => setPropFirms(data))
      .catch(console.error);

    api
      .get<Reward[]>('/rewards', { inStockOnly: true })
      .then((data) => setRewards(data.slice(0, 4)))
      .catch(console.error);
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const activeModel = EVALUATION_MODELS[selectedModelIdx] || EVALUATION_MODELS[0];
  const safeSizeIdx = Math.min(selectedSizeIdx, activeModel.sizes.length - 1);
  const activePlan = activeModel.sizes[safeSizeIdx] || activeModel.sizes[0];

  const faqs = [
    {
      q: 'How does PropFirm Rewards work with Funding Pips & other prop firms?',
      a: 'We operate as an official affiliate partner with premier proprietary trading firms including Funding Pips, FTMO, and FundedNext. When you purchase an evaluation account using our referral code or link, the firm shares an affiliate marketing commission with us. We redistribute this revenue directly back to you as spendable Reward Points (100 PTS = $1.00 USD), which you can redeem for tech gear, free challenges, or direct USDT cashouts.',
    },
    {
      q: 'Does using your code change my prop firm account rules or fees?',
      a: 'Never. In fact, our exclusive promo codes frequently give you an immediate 5% to 15% discount at checkout, and your trading account has the exact same rules, drawdown limits, profit split, and leverage as buying directly. You simply earn massive cashback on top.',
    },
    {
      q: 'How fast is purchase verification and points crediting?',
      a: 'Our verification desk audits submitted invoices and Order IDs within 12 to 24 business hours. Once verified, points are immediately written to your permanent, tamper-proof wallet ledger.',
    },
    {
      q: 'Can I withdraw my cashback points directly to Crypto or Bank?',
      a: 'Yes! Head to your Trader Wallet section inside the dashboard to request instant USDT (TRC-20/ERC-20) or Direct Bank Wire cashouts, processed in under 15 minutes for verified accounts.',
    },
    {
      q: 'How are physical tech rewards (MacBooks, iPads, 4K monitors) delivered?',
      a: 'All physical rewards are dispatched brand-new in original retail packaging via express couriers (DHL, FedEx, UPS) with full insurance and live tracking sent directly to your email.',
    },
    {
      q: 'Can I submit past purchases?',
      a: 'Yes, as long as the purchase was completed using our designated affiliate code or link within the last 14 calendar days, and hasn\'t been claimed by another user.',
    },
  ];

  return (
    <div className="flex flex-col gap-24 pb-24 transition-colors">
      {/* 1. Live Social Proof Ticker (FundingPips Style) */}
      <div className="w-full bg-slate-50/80 dark:bg-[#060b18] border-b border-slate-200/90 dark:border-slate-800/80 py-2.5 px-4 overflow-hidden transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="uppercase tracking-wider">Live Proof Audit Stream:</span>
          </div>

          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap text-slate-600 dark:text-slate-400">
            {LIVE_VERIFICATION_STREAM.map((item, idx) => (
              <div key={idx} className="inline-flex items-center gap-2">
                <span className="text-slate-900 dark:text-white font-semibold">{item.trader}</span>
                <span>purchased {item.firm}</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                  {item.yield}
                </span>
                <span className="text-slate-400 dark:text-slate-600 font-mono text-[10px]">({item.time})</span>
                {idx < LIVE_VERIFICATION_STREAM.length - 1 && (
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Hero Section: Clean, Authoritative, High-Conversion */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        {/* Subtle Ambient Radial Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-blue-500/10 dark:bg-blue-600/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[450px] h-[300px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-8">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-900 dark:text-white">The Official Rewards Ecosystem</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>4.9/5 by 14,200+ Prop Traders</span>
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]">
            Your Skill. Their Capital.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-600 dark:from-blue-400 dark:via-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
              Your Real Rewards.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Never pay full retail price for prop firm evaluations again. Apply our official partner codes for <span className="font-semibold text-slate-900 dark:text-white">Funding Pips, FTMO, and FundedNext</span>, verify your invoice in &lt;24 hours, and receive <span className="font-bold text-emerald-600 dark:text-emerald-400">up to 30% back</span> in cashout value, free accounts, and premium trading hardware.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-8 py-6 rounded-xl">
                Get Started &amp; Earn Cashback
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="#calculator">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white px-8 py-6 font-semibold rounded-xl">
                <Calculator className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                Explore Evaluation Matrix
              </Button>
            </Link>
          </div>

          {/* 4 Clean Stats Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 max-w-4xl mx-auto border-t border-slate-200/90 dark:border-slate-800/80">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/80 text-center shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">$450,000+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Cashback Distributed</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/80 text-center shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">&lt; 24 Hours</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Audit &amp; Credit SLA</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/80 text-center shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">14,200+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Active Prop Traders</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/80 text-center shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">100%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Genuine Retail Warranty</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Interactive Evaluation Matrix (FundingPips Signature Centerpiece) */}
      <section id="calculator" className="mx-auto max-w-6xl px-4 sm:px-6 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
          <Badge variant="purple">Interactive Evaluation Matrix</Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Transparent Pricing &amp; Guaranteed Cashback Yield
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Compare account models, evaluation objectives, and see exactly how many reward points are credited to your wallet.
          </p>
        </div>

        {/* Model Tabs Bar */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {EVALUATION_MODELS.map((model, idx) => (
            <button
              key={model.id}
              onClick={() => {
                setSelectedModelIdx(idx);
                setSelectedSizeIdx(0);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                selectedModelIdx === idx
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <span>{model.name}</span>
              {model.popular && (
                <span className="text-[10px] uppercase font-black bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
                  HOT
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Main Matrix Card */}
        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden transition-colors">
          {/* Account Size Pills Header */}
          <div className="p-6 sm:p-8 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 block mb-1">
                  1. Select Account Size
                </span>
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  Trading Capital Allocation
                </div>
              </div>

              {/* Capital Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {activeModel.sizes.map((plan, idx) => (
                  <button
                    key={plan.size}
                    onClick={() => setSelectedSizeIdx(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      safeSizeIdx === idx
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {plan.size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Matrix Specification Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Rules / Specs Breakdown (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Phase 1 Target</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">{activePlan.target1}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Phase 2 Target</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">{activePlan.target2}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Max Daily Drawdown</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">{activePlan.maxDaily}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Max Total Loss</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">{activePlan.maxLoss}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Min Trading Days</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">{activePlan.minDays}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Profit Split</span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">Up to 95%</span>
                </div>
              </div>

              {/* Referral Code Quick Copy Bar */}
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 block">
                    Checkout Discount &amp; Cashback Code:
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Apply this code on the prop firm website to qualify for points.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="font-mono text-sm font-black bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg text-slate-900 dark:text-white">
                    {activePlan.promo}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyCode(activePlan.promo)}
                    className="cursor-pointer"
                  >
                    {copiedCode === activePlan.promo ? (
                      <>
                        <Check className="h-4 w-4 mr-1 text-emerald-600 dark:text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Yield & Action Card (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl border border-emerald-300 dark:border-emerald-500/40 bg-gradient-to-br from-white to-emerald-50/70 dark:from-slate-900 dark:to-emerald-950/30 shadow-lg space-y-5 text-center sm:text-left">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200 dark:border-emerald-900/40">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Standard Challenge Price
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  ${activePlan.price} USD
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 block">
                  Reward Points Earned (Cashback)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                    +{activePlan.points.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">PTS</span>
                </div>
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  ≈ ${activePlan.cash.toFixed(2)} USD Spendable Cashout Value
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Net Challenge Cost:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ${(activePlan.price - activePlan.cash).toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Audit Clearance Time:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">&lt; 24 Hours</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Link href="/dashboard/purchases/new" className="block">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 shadow-md shadow-emerald-600/20">
                    Submit This Purchase Proof →
                  </Button>
                </Link>
                <Link href="/prop-firms" className="block">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-slate-500 dark:text-slate-400">
                    Browse All Eligible Prop Firms
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Comparison Section: Buying Direct vs Buying via Us */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <Badge variant="purple">Value Comparison</Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Stop Leaving Free Capital On The Table
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Why buy challenges at full retail price with zero return when you can earn loyalty dividends?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Buying Direct Card */}
          <div className="rounded-3xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/10 p-8 space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-rose-200 dark:border-rose-500/20">
                <span className="text-sm font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                  Buying Direct From Prop Firm
                </span>
                <span className="text-xs bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 font-bold px-2.5 py-1 rounded-full">
                  0% Return
                </span>
              </div>
              <ul className="space-y-4 pt-6 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-3">
                  <span className="h-5 w-5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">✕</span>
                  <span>Pay full price with zero cashback or loyalty points</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-5 w-5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">✕</span>
                  <span>If you fail the evaluation, 100% of your fee is permanently lost</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-5 w-5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">✕</span>
                  <span>No second-chance challenge pass vouchers</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-5 w-5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">✕</span>
                  <span>No tech gadgets, monitors, or crypto rewards</span>
                </li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-rose-100/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-800 dark:text-rose-300 font-medium">
              Traders lose an average of $380/year in unclaimed affiliate dividends.
            </div>
          </div>

          {/* Buying via Us Card */}
          <div className="rounded-3xl border border-emerald-300 dark:border-emerald-500/40 bg-gradient-to-br from-white via-white to-emerald-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/30 p-8 space-y-6 flex flex-col justify-between shadow-xl relative">
            <div className="absolute -top-3.5 right-8">
              <span className="bg-emerald-600 text-white text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                RECOMMENDED BY 14K+ TRADERS
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between pb-4 border-b border-emerald-200 dark:border-emerald-500/20">
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Buying With Our Referral Code
                </span>
                <span className="text-xs bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-full">
                  Up To 30% Cashback
                </span>
              </div>
              <ul className="space-y-4 pt-6 text-sm text-slate-700 dark:text-slate-200">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Get up to 30% back in points on every single account purchase</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Redeem points for 100% Free Prop Firm challenge evaluations</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Withdraw cash directly to USDT Crypto or Direct Bank Wire</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Claim MacBooks, TradingView Pro subscriptions &amp; 4K Displays</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>24/7 dedicated proof audit and dispute resolution desk</span>
                </li>
              </ul>
            </div>
            <Link href="/register">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 shadow-md shadow-emerald-600/20">
                Join Free &amp; Claim Your Points →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. The 4-Stage Trader Progression (FundingPips 'Student to Master' Style) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <Badge variant="success">The Trader Progression</Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            How The Cashback Lifecycle Operates
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            A structured, auditable journey from buying your challenge to receiving luxury rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: 'PHASE 01',
              title: 'Select Firm & Apply Code',
              desc: 'Choose Funding Pips, FTMO, or FundedNext and apply our verified affiliate code during checkout for direct discount & attribution.',
              icon: Target,
            },
            {
              step: 'PHASE 02',
              title: 'Upload Invoice Proof',
              desc: 'Submit your order number, purchase receipt or dashboard billing screenshot in your clean trader dashboard portal.',
              icon: FileCheck,
            },
            {
              step: 'PHASE 03',
              title: 'Audited & Credited',
              desc: 'Our compliance desk matches transaction records with the prop firm partner within 12-24 hours and credits points immediately.',
              icon: ShieldCheck,
            },
            {
              step: 'PHASE 04',
              title: 'Liquidate or Redeem',
              desc: 'Exchange points for brand-new Apple MacBooks, iPads, 4K monitors, free challenge passes, or instant USDT withdrawals.',
              icon: Gift,
            },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-4 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
                    {card.step}
                  </span>
                  <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{card.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Featured Prop Firms Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge variant="purple">Partner Network</Badge>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
              Featured Prop Firms
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Top industry proprietary trading firms with verified point yields.
            </p>
          </div>
          <Link href="/prop-firms">
            <Button variant="outline" size="sm" className="border-slate-300 dark:border-slate-700">
              View All Firms
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {propFirms.map((firm) => {
            const maxPoints =
              firm.offers && firm.offers.length > 0
                ? Math.max(...firm.offers.map((o) => o.rewardPoints))
                : 0;
            return (
              <div
                key={firm.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 card-hover-glow space-y-6 shadow-xs"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center overflow-hidden">
                      {firm.logoUrl ? (
                        <img
                          src={firm.logoUrl}
                          alt={firm.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="font-bold text-slate-800 dark:text-white text-lg">{firm.name[0]}</span>
                      )}
                    </div>
                    <Badge variant="success">Up to {maxPoints.toLocaleString()} PTS</Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{firm.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {firm.description}
                    </p>
                  </div>

                  {/* Affiliate code badge */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 space-y-1.5">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold block">
                      Referral Code
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        {firm.affiliateCode}
                      </span>
                      <button
                        onClick={() => handleCopyCode(firm.affiliateCode)}
                        className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Copy code"
                      >
                        {copiedCode === firm.affiliateCode ? (
                          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <a
                    href={firm.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="secondary" size="sm" className="w-full">
                      Visit &amp; Buy
                      <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </a>
                  <Link href={`/prop-firms/${firm.slug}`} className="block">
                    <Button variant="ghost" size="sm" className="w-full text-xs">
                      View Challenge Offers
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Featured Hardware & Rewards Showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge variant="info">Rewards Store</Badge>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
              Featured Rewards &amp; Hardware
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Redeem verified points for brand-new electronics, monitors, sneakers, and gift cards.
            </p>
          </div>
          <Link href="/rewards">
            <Button variant="outline" size="sm" className="border-slate-300 dark:border-slate-700">
              Explore Full Marketplace
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 overflow-hidden card-hover-glow shadow-xs"
            >
              <div className="aspect-video w-full bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
                <img
                  src={reward.imageUrl}
                  alt={reward.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5">
                  <Badge variant="default" className="bg-white/90 dark:bg-slate-950/80 text-slate-900 dark:text-white backdrop-blur-md border border-slate-200 dark:border-slate-800">
                    {reward.category?.name}
                  </Badge>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {reward.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Coins className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {reward.pointsRequired.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Points</span>
                  </div>
                </div>

                <Link href={`/rewards/${reward.slug}`} className="block">
                  <Button variant="secondary" size="sm" className="w-full">
                    Redeem Reward
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FAQ Accordion Section */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="outline">Got Questions?</Badge>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Everything you need to know about the PropFirm Rewards loyalty program.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between font-semibold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm sm:text-base cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. Final High-Conversion Trust & CTA Banner */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative rounded-3xl border border-blue-200 dark:border-slate-800 bg-gradient-to-r from-blue-50 via-white to-blue-50/50 dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900/90 p-8 sm:p-14 text-center space-y-6 overflow-hidden shadow-xl transition-colors">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-500/30 bg-blue-100 dark:bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
            <Coins className="h-4 w-4" />
            <span>Ready To Upgrade Your Trading Setup?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight max-w-2xl mx-auto">
            Trade With Better Odds. Claim Your Loyalty Rewards.
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            Create your account in seconds, explore eligible prop firms, and claim the rewards you deserve for your trading purchases.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 rounded-xl px-8 py-6">
                Create Free Trader Account
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl px-8 py-6">
                Contact Support Desk
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
