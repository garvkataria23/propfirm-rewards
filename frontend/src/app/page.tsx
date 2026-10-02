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
  MessageSquare,
  Shield,
  CreditCard,
  Building2,
  Sliders,
  DollarSign,
  RefreshCw,
  Eye,
  CheckCircle,
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
  { trader: '@Marco_FX (UK)', firm: 'Funding Pips $100K 2-Step', yield: '+3,990 PTS', usd: '$399.00 Challenge', time: 'Just now' },
  { trader: '@K_Larsson (SE)', firm: 'FTMO $200K Challenge', yield: '+11,800 PTS', usd: '$1,180.00 Challenge', time: '3m ago' },
  { trader: '@S_Kapoor (IN)', firm: 'FundedSquad $50K Challenge', yield: '+3,500 PTS', usd: '$350.00 Challenge', time: '7m ago' },
  { trader: '@Lucas_R (US)', firm: 'Pipstone Capital $100K Standard', yield: '+5,200 PTS', usd: '$520.00 Challenge', time: '12m ago' },
  { trader: '@David_T (DE)', firm: 'Redeemed iPhone 18 Pro Max', yield: 'Dispatched', usd: 'Via DHL Express', time: '18m ago' },
  { trader: '@Jean_P (FR)', firm: 'FundedNext $100K Stellar', yield: '+5,490 PTS', usd: '$549.00 Challenge', time: '22m ago' },
];

// Interactive Pricing Matrix based on FundingPips' exact challenge matrix
const CHALLENGE_TYPES = [
  { id: 'zero', label: 'Zero', subtitle: 'Instant funding' },
  { id: '1step', label: 'FLEX', subtitle: '1 Day Pass / One step' },
  { id: '2step', label: '2 Step', subtitle: 'Classic 2 Phase' },
];

const ACCOUNT_SIZES = [
  { id: '5k', label: '$5K', value: 5000 },
  { id: '10k', label: '$10K', value: 10000 },
  { id: '25k', label: '$25K', value: 25000 },
  { id: '50k', label: '$50K', value: 50000 },
  { id: '100k', label: '$100K', value: 100000 },
];

const MATRIX_DATA: Record<string, Record<string, {
  standard: { target: string; maxLoss: string; dailyLoss: string; minDays: string; split: string; price: number; points: number };
  flex: { target: string; maxLoss: string; dailyLoss: string; minDays: string; split: string; price: number; points: number };
  pro: { target: string; maxLoss: string; dailyLoss: string; minDays: string; split: string; price: number; points: number };
}>> = {
  '2step': {
    '5k': {
      standard: { target: '8% / 5%', maxLoss: '10%', dailyLoss: '5%', minDays: '3 Days', split: 'Up to 100%', price: 44, points: 440 },
      flex: { target: '10%', maxLoss: '12%', dailyLoss: '6%', minDays: '1 Day', split: 'Up to 100%', price: 39, points: 390 },
      pro: { target: '6%', maxLoss: '6%', dailyLoss: '4%', minDays: '0 Days', split: 'Up to 100%', price: 33, points: 330 },
    },
    '10k': {
      standard: { target: '8% / 5%', maxLoss: '10%', dailyLoss: '5%', minDays: '3 Days', split: 'Up to 100%', price: 69, points: 690 },
      flex: { target: '10%', maxLoss: '12%', dailyLoss: '6%', minDays: '1 Day', split: 'Up to 100%', price: 60, points: 600 },
      pro: { target: '6%', maxLoss: '6%', dailyLoss: '4%', minDays: '0 Days', split: 'Up to 100%', price: 54, points: 540 },
    },
    '25k': {
      standard: { target: '8% / 5%', maxLoss: '10%', dailyLoss: '5%', minDays: '3 Days', split: 'Up to 100%', price: 159, points: 1590 },
      flex: { target: '10%', maxLoss: '12%', dailyLoss: '6%', minDays: '1 Day', split: 'Up to 100%', price: 139, points: 1390 },
      pro: { target: '6%', maxLoss: '6%', dailyLoss: '4%', minDays: '0 Days', split: 'Up to 100%', price: 125, points: 1250 },
    },
    '50k': {
      standard: { target: '8% / 5%', maxLoss: '10%', dailyLoss: '5%', minDays: '3 Days', split: 'Up to 100%', price: 269, points: 2690 },
      flex: { target: '10%', maxLoss: '12%', dailyLoss: '6%', minDays: '1 Day', split: 'Up to 100%', price: 239, points: 2390 },
      pro: { target: '6%', maxLoss: '6%', dailyLoss: '4%', minDays: '0 Days', split: 'Up to 100%', price: 219, points: 2190 },
    },
    '100k': {
      standard: { target: '8% / 5%', maxLoss: '10%', dailyLoss: '5%', minDays: '3 Days', split: 'Up to 100%', price: 449, points: 4490 },
      flex: { target: '10%', maxLoss: '12%', dailyLoss: '6%', minDays: '1 Day', split: 'Up to 100%', price: 399, points: 3990 },
      pro: { target: '6%', maxLoss: '6%', dailyLoss: '4%', minDays: '0 Days', split: 'Up to 100%', price: 369, points: 3690 },
    },
  },
  '1step': {
    '5k': {
      standard: { target: '9%', maxLoss: '6%', dailyLoss: '3%', minDays: '1 Day', split: 'Up to 90%', price: 49, points: 490 },
      flex: { target: '10%', maxLoss: '7%', dailyLoss: '4%', minDays: '1 Day', split: 'Up to 95%', price: 42, points: 420 },
      pro: { target: '8%', maxLoss: '5%', dailyLoss: '3%', minDays: '0 Days', split: 'Up to 100%', price: 37, points: 370 },
    },
    '10k': {
      standard: { target: '9%', maxLoss: '6%', dailyLoss: '3%', minDays: '1 Day', split: 'Up to 90%', price: 79, points: 790 },
      flex: { target: '10%', maxLoss: '7%', dailyLoss: '4%', minDays: '1 Day', split: 'Up to 95%', price: 70, points: 700 },
      pro: { target: '8%', maxLoss: '5%', dailyLoss: '3%', minDays: '0 Days', split: 'Up to 100%', price: 62, points: 620 },
    },
    '25k': {
      standard: { target: '9%', maxLoss: '6%', dailyLoss: '3%', minDays: '1 Day', split: 'Up to 90%', price: 179, points: 1790 },
      flex: { target: '10%', maxLoss: '7%', dailyLoss: '4%', minDays: '1 Day', split: 'Up to 95%', price: 155, points: 1550 },
      pro: { target: '8%', maxLoss: '5%', dailyLoss: '3%', minDays: '0 Days', split: 'Up to 100%', price: 140, points: 1400 },
    },
    '50k': {
      standard: { target: '9%', maxLoss: '6%', dailyLoss: '3%', minDays: '1 Day', split: 'Up to 90%', price: 299, points: 2990 },
      flex: { target: '10%', maxLoss: '7%', dailyLoss: '4%', minDays: '1 Day', split: 'Up to 95%', price: 265, points: 2650 },
      pro: { target: '8%', maxLoss: '5%', dailyLoss: '3%', minDays: '0 Days', split: 'Up to 100%', price: 240, points: 2400 },
    },
    '100k': {
      standard: { target: '9%', maxLoss: '6%', dailyLoss: '3%', minDays: '1 Day', split: 'Up to 90%', price: 499, points: 4990 },
      flex: { target: '10%', maxLoss: '7%', dailyLoss: '4%', minDays: '1 Day', split: 'Up to 95%', price: 449, points: 4490 },
      pro: { target: '8%', maxLoss: '5%', dailyLoss: '3%', minDays: '0 Days', split: 'Up to 100%', price: 410, points: 4100 },
    },
  },
  'zero': {
    '5k': {
      standard: { target: 'No Target', maxLoss: '5%', dailyLoss: '2.5%', minDays: 'Instant', split: 'Up to 80%', price: 120, points: 1200 },
      flex: { target: 'No Target', maxLoss: '6%', dailyLoss: '3%', minDays: 'Instant', split: 'Up to 85%', price: 145, points: 1450 },
      pro: { target: 'No Target', maxLoss: '8%', dailyLoss: '4%', minDays: 'Instant', split: 'Up to 90%', price: 180, points: 1800 },
    },
    '10k': {
      standard: { target: 'No Target', maxLoss: '5%', dailyLoss: '2.5%', minDays: 'Instant', split: 'Up to 80%', price: 240, points: 2400 },
      flex: { target: 'No Target', maxLoss: '6%', dailyLoss: '3%', minDays: 'Instant', split: 'Up to 85%', price: 285, points: 2850 },
      pro: { target: 'No Target', maxLoss: '8%', dailyLoss: '4%', minDays: 'Instant', split: 'Up to 90%', price: 340, points: 3400 },
    },
    '25k': {
      standard: { target: 'No Target', maxLoss: '5%', dailyLoss: '2.5%', minDays: 'Instant', split: 'Up to 80%', price: 550, points: 5500 },
      flex: { target: 'No Target', maxLoss: '6%', dailyLoss: '3%', minDays: 'Instant', split: 'Up to 85%', price: 640, points: 6400 },
      pro: { target: 'No Target', maxLoss: '8%', dailyLoss: '4%', minDays: 'Instant', split: 'Up to 90%', price: 780, points: 7800 },
    },
    '50k': {
      standard: { target: 'No Target', maxLoss: '5%', dailyLoss: '2.5%', minDays: 'Instant', split: 'Up to 80%', price: 1050, points: 10500 },
      flex: { target: 'No Target', maxLoss: '6%', dailyLoss: '3%', minDays: 'Instant', split: 'Up to 85%', price: 1190, points: 11900 },
      pro: { target: 'No Target', maxLoss: '8%', dailyLoss: '4%', minDays: 'Instant', split: 'Up to 90%', price: 1450, points: 14500 },
    },
    '100k': {
      standard: { target: 'No Target', maxLoss: '5%', dailyLoss: '2.5%', minDays: 'Instant', split: 'Up to 80%', price: 1950, points: 19500 },
      flex: { target: 'No Target', maxLoss: '6%', dailyLoss: '3%', minDays: 'Instant', split: 'Up to 85%', price: 2250, points: 22500 },
      pro: { target: 'No Target', maxLoss: '8%', dailyLoss: '4%', minDays: 'Instant', split: 'Up to 90%', price: 2750, points: 27500 },
    },
  },
};

export default function HomePage() {
  const [propFirms, setPropFirms] = useState<PropFirm[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Pricing Matrix Selection
  const [selectedType, setSelectedType] = useState<string>('2step');
  const [selectedSize, setSelectedSize] = useState<string>('5k');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    api
      .get<PropFirm[]>('/prop-firms')
      .then((data) => setPropFirms(data))
      .catch(console.error);

    api
      .get<Reward[]>('/rewards', { inStockOnly: true })
      .then((data) => setRewards(data.slice(0, 8)))
      .catch(console.error);
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const currentMatrix = MATRIX_DATA[selectedType]?.[selectedSize] || MATRIX_DATA['2step']['5k'];

  const faqs = [
    {
      q: 'How does PropNation Rewards work with partnered prop firms?',
      a: 'We are an official global affiliate partner with premier proprietary trading firms: FundedSquad, Pipstone Capital, FTMO, FundedNext, and Funding Pips. When you purchase an evaluation account using our referral code NATION, the firm grants an exclusive discount and credits our team with marketing yield, which we pass directly back to you as spendable reward points (1$ = 10 Reward Points) to claim tech gear, shoes, luxury watches, or cash payouts.',
    },
    {
      q: 'Does using code NATION change my prop firm trading rules?',
      a: 'Never. Your account maintains 100% identical rules, leverage, drawdown limits, and payout schedules as buying directly from the firm. In fact, code NATION often activates a 10% to 20% discount on your evaluation purchase.',
    },
    {
      q: 'How fast is purchase verification and points crediting?',
      a: 'Our automated AI OCR verification engine instantly scans and verifies your invoice screenshot, PDF receipt, or video screen recording. Verified points are written to your ledger immediately.',
    },
    {
      q: 'How are physical luxury rewards (Nike, G-Shock, Apple, MacBook) delivered?',
      a: 'All physical rewards are brand new, sealed in original manufacturer packaging, and dispatched worldwide via insured express couriers (DHL, FedEx, UPS) with live door-to-door tracking provided.',
    },
    {
      q: 'Can I redeem points for direct Crypto or USDT cash payouts?',
      a: 'Yes. Head to your dashboard wallet to redeem points for USDT (TRC-20 / ERC-20) or Direct Bank Transfers, processed rapidly with zero hidden deduction fees.',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#070b14] text-slate-900 dark:text-slate-100 font-sans selection:bg-sky-500 selection:text-white transition-colors duration-200">
      {/* ======================================================== */}
      {/* 1. TOP ANNOUNCEMENT NOTICE RIBBON (FundingPips Exact Style) */}
      {/* ======================================================== */}
      <div className="w-full bg-[#061224] text-white py-2 sm:py-2.5 px-4 text-center text-xs sm:text-[13px] font-medium tracking-tight flex items-center justify-center gap-2 border-b border-blue-950">
        <span>
          Use Code <strong className="font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-500/30">NATION</strong>: 10% OFF New Users | 5% OFF Existing Users
        </span>
        <span className="hidden md:inline text-slate-500">•</span>
        <span className="hidden md:inline font-semibold text-emerald-400">
          1$ = 10 Reward Points Across All 5 Prop Firms
        </span>
      </div>

      {/* ======================================================== */}
      {/* 2. HERO SECTION (Clean White, Classy Lighting & Crystal Art) */}
      {/* ======================================================== */}
      <section className="relative w-full pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-32 overflow-hidden bg-white dark:bg-[#070b14]">
        {/* Soft Ethereal Atmospheric Glows (Cyan & Sky Blue) */}
        <div className="absolute top-0 right-0 w-[55vw] h-[55vw] max-w-[800px] max-h-[800px] bg-gradient-to-bl from-sky-200/50 via-blue-100/30 to-transparent dark:from-sky-900/20 dark:via-blue-950/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/4 left-0 w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] bg-gradient-to-tr from-cyan-100/40 via-emerald-100/20 to-transparent dark:from-cyan-950/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 z-10 text-left">
              <h1 className="text-4xl sm:text-6xl lg:text-[4.25rem] font-[900] tracking-[-0.035em] text-[#0c182a] dark:text-white leading-[1.06]">
                Turn your trading skills into luxury rewards
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl font-normal">
                Join over 45,000+ traders in the world&apos;s leading prop firm reward ecosystem. Trade in a fully simulated environment with <strong>FundedSquad, Pipstone, FTMO, FundedNext &amp; FundingPips</strong> and earn 10 reward points per $1 spent.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/prop-firms">
                  <Button className="bg-[#0c182a] hover:bg-[#15253e] text-white px-7 py-3.5 rounded-full font-bold text-sm tracking-tight shadow-md hover:shadow-lg transition-all h-12">
                    Buy Evaluation
                  </Button>
                </Link>
                <Link href="/rewards">
                  <Button
                    variant="outline"
                    className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 px-7 py-3.5 rounded-full font-semibold text-sm tracking-tight transition-all h-12 shadow-xs"
                  >
                    Explore Rewards Catalog
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Visual: 3D Crystal Lightning Art (FundingPips Exact Aesthetic) */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-[460px] aspect-square rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/80 shadow-2xl bg-gradient-to-b from-sky-50/50 to-white dark:from-slate-900 dark:to-slate-950 group">
                <img
                  src="/hero-lighting-crystal.jpg"
                  alt="3D Sapphire Lightning Crystal"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/40 dark:from-[#070b14]/60 via-transparent to-transparent pointer-events-none" />

                {/* Floating pill badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-[#0c182a] text-sky-400 flex items-center justify-center font-bold">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Universal Partner Code</div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">NATION (1$ = 10 PTS)</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyCode('NATION')}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    {copiedCode === 'NATION' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCode === 'NATION' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof Stats Banner (Image 1 Exact Layout) */}
          <div className="mt-16 sm:mt-24 pt-10 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 items-center text-left">
            <div>
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <TrendingUp className="h-4 w-4 text-sky-600" />
                <span className="text-2xl sm:text-3xl font-[900] tracking-tight text-[#0c182a] dark:text-white">$314M+</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Rewards Distributed</p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <Users className="h-4 w-4 text-emerald-600" />
                <span className="text-2xl sm:text-3xl font-[900] tracking-tight text-[#0c182a] dark:text-white">3M+</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Traders Worldwide</p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <GlobeIcon className="h-4 w-4 text-blue-600" />
                <span className="text-2xl sm:text-3xl font-[900] tracking-tight text-[#0c182a] dark:text-white">195+</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Countries Serviced</p>
            </div>

            {/* Trustpilot Review Badge */}
            <div className="border-l border-slate-200 dark:border-slate-800 pl-4 sm:pl-6">
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <span>Excellent</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-500 text-xs my-0.5">
                {'★★★★★'.split('').map((s, i) => (
                  <span key={i} className="text-emerald-500 font-bold">★</span>
                ))}
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono ml-1">Trustpilot</span>
              </div>
              <p className="text-[10px] text-slate-400">69,806 reviews</p>
            </div>

            {/* Google Review Badge */}
            <div className="border-l border-slate-200 dark:border-slate-800 pl-4 sm:pl-6">
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <span>Excellent</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400 text-xs my-0.5">
                {'★★★★★'.split('').map((s, i) => (
                  <span key={i} className="text-amber-400 font-bold">★</span>
                ))}
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono ml-1">Google</span>
              </div>
              <p className="text-[10px] text-slate-400">4.8 rated</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. "TRADE WITH PEACE OF MIND" SECTION (FundingPips Image 2) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="rounded-[2.5rem] bg-gradient-to-r from-emerald-50/70 via-cyan-50/50 to-blue-50/70 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-950/90 border border-slate-200/80 dark:border-slate-800 p-8 sm:p-14 lg:p-16 relative overflow-hidden shadow-sm">
          {/* Subtle radial decorative glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-200/30 dark:bg-cyan-900/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c182a] dark:text-white leading-[1.12]">
                Trade with peace of mind
              </h2>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
                No complicated processes. No hidden requirements. A clear path to trading and earning real luxury physical rewards.
              </p>

              {/* Pill feature tags (Image 2 exact pills) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 px-3.5 py-2.5 rounded-full border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
                  <RefreshCw className="h-4 w-4 text-emerald-500" />
                  <span>Flexible Rewards Cycles</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 px-3.5 py-2.5 rounded-full border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
                  <ShieldCheck className="h-4 w-4 text-blue-500" />
                  <span>1$ = 10 Points Guaranteed</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 px-3.5 py-2.5 rounded-full border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
                  <Award className="h-4 w-4 text-purple-500" />
                  <span>Zero Reward Denial</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 px-3.5 py-2.5 rounded-full border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
                  <TagIcon className="h-4 w-4 text-amber-500" />
                  <span>Universal Code: NATION</span>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/prop-firms">
                  <Button
                    variant="outline"
                    className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-7 py-3 rounded-full font-bold text-xs shadow-xs hover:bg-slate-50 h-11"
                  >
                    Pricing &amp; Catalog
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Simulated App Window & Floating 3D Sapphire Gem Card (Image 2) */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl overflow-hidden text-left p-4 sm:p-6 space-y-4">
                {/* Browser Titlebar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">app.propnation.com/rewards</span>
                  <div className="w-8" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Ready to request your reward?</h4>
                  <p className="text-[11px] text-slate-500">
                    Please click on the request button then proceed to fill out the required information.
                  </p>
                </div>

                {/* Table Simulation */}
                <div className="space-y-2 pt-2 text-[11px] text-slate-500">
                  <div className="grid grid-cols-4 font-semibold text-slate-400 text-[10px] pb-1 border-b border-slate-100 dark:border-slate-800">
                    <span>Account Type</span>
                    <span>Request On</span>
                    <span>Payment Method</span>
                    <span className="text-right">ID</span>
                  </div>
                  <div className="grid grid-cols-4 py-1 border-b border-slate-100/60 dark:border-slate-800/40">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Master Account</span>
                    <span>Feb 14, 2026</span>
                    <span>Card / Wire</span>
                    <span className="text-right font-mono">5552468012</span>
                  </div>
                  <div className="grid grid-cols-4 py-1 border-b border-slate-100/60 dark:border-slate-800/40">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Master Account</span>
                    <span>Mar 21, 2026</span>
                    <span>Rise</span>
                    <span className="text-right font-mono">5558000800</span>
                  </div>
                </div>

                {/* Floating Midnight Blue Glossy 3D Card (Image 2 Exact Asset) */}
                <div className="relative rounded-2xl bg-[#0c182a] text-white p-5 sm:p-6 shadow-2xl border border-sky-500/20 overflow-hidden flex items-center justify-between">
                  <div className="space-y-1 z-10">
                    <span className="text-xs text-sky-300/80 font-medium">Total Rewards Dispatched</span>
                    <div className="text-2xl sm:text-3xl font-[900] tracking-tight text-white">
                      $125,721
                    </div>
                    <span className="text-[11px] text-slate-400 block pt-2">
                      Rewards count: <strong>48</strong>
                    </span>
                  </div>

                  {/* 3D Sapphire Blue Diamond Art */}
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0">
                    <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="h-full w-full rounded-2xl bg-gradient-to-tr from-blue-700 via-sky-400 to-indigo-500 flex items-center justify-center shadow-lg rotate-12 transform hover:rotate-0 transition-transform duration-500">
                      <Sparkles className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. "HOW IT WORKS" 3-CARD ARCHITECTURE (FundingPips Image 3) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-12">
        <div className="space-y-3 max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c182a] dark:text-white">
            How it works
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-normal">
            No fluff, no fine print. Here&apos;s exactly how it works.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 text-left">
          {/* Card 01: Challenge Phase */}
          <div className="rounded-3xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-7 sm:p-8 flex flex-col justify-between space-y-8 hover:border-slate-300 transition-colors">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">01 Challenge Phase</span>
                <h3 className="text-2xl font-[900] text-[#0c182a] dark:text-white tracking-tight">
                  Pass the Challenge
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Prove your skills in a clear, fair challenge. Use partner code <strong>NATION</strong> across FundedSquad, Pipstone, FTMO, FundedNext, or FundingPips.
                </p>
              </div>

              {/* Checklist Graphic (Image 3 exact UI) */}
              <div className="space-y-2.5 bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-xs">
                {[
                  'Profit target reached',
                  'Max. daily loss adhered',
                  'Max. loss static rule',
                  'Min. trading days achieved',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <span>{item}</span>
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800">
              <p className="text-xs text-slate-500 italic">
                &ldquo;The platform is smooth, execution is fast, and the rules are clear and fair.&rdquo;
              </p>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block mt-1">
                Alaa Smaisem, Turkey
              </span>
            </div>
          </div>

          {/* Card 02: Rewards */}
          <div className="rounded-3xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-7 sm:p-8 flex flex-col justify-between space-y-8 hover:border-slate-300 transition-colors">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">02 Rewards</span>
                <h3 className="text-2xl font-[900] text-[#0c182a] dark:text-white tracking-tight">
                  Real Cash &amp; Tech. Fast.
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Submit your purchase invoice or screen recording. Our automated OCR parser awards 10 reward points per $1 spent within minutes.
                </p>
              </div>

              {/* Floating Navy 3D Card (Image 3 exact UI) */}
              <div className="rounded-2xl bg-[#0c182a] text-white p-6 shadow-xl border border-sky-500/20 text-center space-y-2">
                <span className="text-[10px] font-bold tracking-widest text-sky-400 uppercase">
                  PropNation Rewards
                </span>
                <div className="text-3xl font-[900] text-white tracking-tight">
                  $314M+
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Total rewarded to traders
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800">
              <p className="text-xs text-slate-500 italic">
                &ldquo;The rewards arriving in my wallet within minutes. Easiest cashback system in the industry.&rdquo;
              </p>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block mt-1">
                Rinaldi Relagus, Indonesia
              </span>
            </div>
          </div>

          {/* Card 03: Scaling Plan */}
          <div className="rounded-3xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-7 sm:p-8 flex flex-col justify-between space-y-8 hover:border-slate-300 transition-colors">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">03 Scaling Plan</span>
                <h3 className="text-2xl font-[900] text-[#0c182a] dark:text-white tracking-tight">
                  Scale PRIME Capital
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Trade your way from challenge to $2M PRIME capital, with daily rewards and luxury physical rewards (Nike, Apple, Rolex).
                </p>
              </div>

              {/* Rising Bar Chart Graphic (Image 3 exact UI) */}
              <div className="h-32 bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-xs flex items-end justify-between gap-2">
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t h-10" />
                  <span className="text-[9px] text-slate-400 font-semibold">$10k</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t h-14" />
                  <span className="text-[9px] text-slate-400 font-semibold">$25k</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-t h-20" />
                  <span className="text-[9px] text-slate-400 font-semibold">$50k</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-sky-200 dark:bg-sky-900/40 rounded-t h-24" />
                  <span className="text-[9px] text-slate-400 font-semibold">$165k</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-[#0c182a] dark:bg-sky-500 rounded-t h-28 relative">
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-sky-600 dark:text-sky-300">$2M</span>
                  </div>
                  <span className="text-[9px] text-slate-900 dark:text-white font-bold">PRIME</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800">
              <p className="text-xs text-slate-500 italic">
                &ldquo;What began with a humble $10K account has now grown into an impressive $165K with luxury tech rewards.&rdquo;
              </p>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block mt-1">
                Vipul Gupta, India
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. "CFD'S GLORY DAYS ARE BACK!" BANNER (Image 4 Top) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 text-center space-y-6">
        <h2 className="text-2xl sm:text-4xl font-[900] text-[#0c182a] dark:text-white tracking-tight">
          CFD&apos;s Glory Days Are Back!
        </h2>

        {/* 3 Green Pill Checkmarks */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 px-4 py-2 rounded-full text-xs font-bold">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span>No Striking System</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 px-4 py-2 rounded-full text-xs font-bold">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span>No Risk Per Trade Idea</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 px-4 py-2 rounded-full text-xs font-bold">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span>No Profit Concentration</span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. INTERACTIVE PRICING & CHALLENGE MATRIX (Image 4 Exact UI) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-center space-y-10" id="pricing">
        <div className="space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pricing</span>
          <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c182a] dark:text-white">
            Choose your challenge
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal">
            1 Step, 2 Step, or Zero. Multiple routes to match your trading style and budget.
          </p>
        </div>

        {/* Step 1: Challenge Type Toggle Pills */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400">1 Challenge type</span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {CHALLENGE_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  selectedType === type.id
                    ? 'bg-[#0c182a] text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <div className="text-[10px] opacity-70 font-normal">{type.subtitle}</div>
                <div className="text-sm font-extrabold">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Account Size Toggle Pills */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400">2 Account size</span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {ACCOUNT_SIZES.map((size) => (
              <button
                key={size.id}
                onClick={() => setSelectedSize(size.id)}
                className={`px-5 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                  selectedSize === size.id
                    ? 'bg-[#0c182a] text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Comparison Cards (Standard / FLEX / Pro) - Image 4 exact columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-6">
          {/* Card: Standard */}
          <div className="rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Standard</span>
                <h4 className="text-lg font-[900] text-[#0c182a] dark:text-white mt-0.5">Biggest Daily Loss</h4>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Target</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentMatrix.standard.target}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Max Loss (Static)</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentMatrix.standard.maxLoss}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Min Days</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentMatrix.standard.minDays}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Split</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{currentMatrix.standard.split}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-[900] text-[#0c182a] dark:text-white">${currentMatrix.standard.price}</span>
                  <span className="text-[11px] text-slate-400 ml-1">USD</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  +{currentMatrix.standard.points} PTS
                </span>
              </div>
              <Link href="/prop-firms">
                <Button className="w-full bg-[#0c182a] hover:bg-[#15253e] text-white font-bold text-xs h-11 rounded-xl">
                  Buy for ${currentMatrix.standard.price}
                </Button>
              </Link>
            </div>
          </div>

          {/* Card: FLEX (Featured in Center with Navy Badge) */}
          <div className="rounded-3xl bg-white dark:bg-slate-950 border-2 border-[#0c182a] dark:border-sky-500 p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-lg relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0c182a] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/20">
              FLEX • Most Popular
            </div>

            <div className="space-y-4 pt-1">
              <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400 tracking-wider">FLEX Model</span>
                <h4 className="text-lg font-[900] text-[#0c182a] dark:text-white mt-0.5">Biggest Max Loss</h4>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Target</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentMatrix.flex.target}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Max Loss (Static)</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentMatrix.flex.maxLoss}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Min Days</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentMatrix.flex.minDays}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Split</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{currentMatrix.flex.split}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-[900] text-[#0c182a] dark:text-white">${currentMatrix.flex.price}</span>
                  <span className="text-[11px] text-slate-400 ml-1">USD</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  +{currentMatrix.flex.points} PTS
                </span>
              </div>
              <Link href="/prop-firms">
                <Button className="w-full bg-[#0c182a] hover:bg-[#15253e] text-white font-bold text-xs h-11 rounded-xl shadow-md">
                  Buy for ${currentMatrix.flex.price}
                </Button>
              </Link>
            </div>
          </div>

          {/* Card: Pro */}
          <div className="rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Pro</span>
                <h4 className="text-lg font-[900] text-[#0c182a] dark:text-white mt-0.5">Lowest Profit Target</h4>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Target</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentMatrix.pro.target}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Max Loss (Static)</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentMatrix.pro.maxLoss}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Min Days</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentMatrix.pro.minDays}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Split</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{currentMatrix.pro.split}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-[900] text-[#0c182a] dark:text-white">${currentMatrix.pro.price}</span>
                  <span className="text-[11px] text-slate-400 ml-1">USD</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  +{currentMatrix.pro.points} PTS
                </span>
              </div>
              <Link href="/prop-firms">
                <Button className="w-full bg-[#0c182a] hover:bg-[#15253e] text-white font-bold text-xs h-11 rounded-xl">
                  Buy for ${currentMatrix.pro.price}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 5 Prop Firms Switcher Ribbon */}
        <div className="pt-6">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-3">
            Supported Partner Prop Firms (Code: NATION)
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {['FundedSquad', 'Pipstone Capital', 'FTMO', 'FundedNext', 'FundingPips'].map((firm, idx) => (
              <Link
                key={idx}
                href="/prop-firms"
                className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
              >
                {firm} • 1$ = 10 PTS
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. "TRADER'S JOURNEY" CASE STUDY SECTION (FundingPips Image 5) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="space-y-10">
          <div className="text-left space-y-1">
            <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c182a] dark:text-white">
              Trader&apos;s Journey
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Case study • 4 Jul → 21 Jul • $100K 2 Step Pro
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Timeline Milestones (Image 5 exact UI) */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              {/* Step 1 */}
              <div className="space-y-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400">Jul 4</span>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Evaluation Purchased</div>
                  <div className="text-2xl font-[900] text-[#0c182a] dark:text-white">$466</div>
                  <span className="text-[10px] text-slate-400 block">$100K 2 Step Pro</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400">Jul 4</span>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Phase 1 Passed</div>
                  <div className="text-xl font-[900] text-emerald-600 dark:text-emerald-400">Same day</div>
                  <span className="text-[10px] text-slate-400 block">Status: ✓ Clear</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400">Jul 9</span>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Phase 2 Passed</div>
                  <div className="text-xl font-[900] text-emerald-600 dark:text-emerald-400">✓ Funded</div>
                  <span className="text-[10px] text-slate-400 block">5 days after Phase 1</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400">Jul 21</span>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">First Reward In</div>
                  <div className="text-xl font-[900] text-emerald-600 dark:text-emerald-400">$4,050<span className="text-xs font-normal">.90</span></div>
                  <span className="text-[10px] text-slate-400 block">Via Rise in 9 hrs</span>
                </div>
              </div>
            </div>

            {/* Right Side Navy Highlight Box (Image 5 exact UI) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="rounded-xl bg-slate-100/80 dark:bg-slate-900/80 p-3 text-left text-xs border border-slate-200 dark:border-slate-800">
                <div className="text-amber-400 font-bold mb-1">★★★★★</div>
                <p className="text-slate-600 dark:text-slate-300 italic">
                  &ldquo;Best of the best, I&apos;ve been with them for 2 years now&rdquo;
                </p>
                <span className="text-[10px] font-bold text-slate-400 block mt-1">— Majed M.</span>
              </div>

              <div className="rounded-2xl bg-[#0c182a] text-white p-6 shadow-2xl border border-sky-500/20 text-center space-y-4">
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                    9 Total Rewards
                  </span>
                  <div className="text-4xl font-[900] text-white tracking-tight">
                    5,531%
                  </div>
                  <span className="text-xs text-sky-300/80 font-mono block">
                    $466 → $26,242
                  </span>
                </div>

                <Link href="/prop-firms">
                  <Button className="w-full bg-white hover:bg-slate-100 text-[#0c182a] font-bold text-xs h-10 rounded-xl">
                    Buy Challenge
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. "REAL TRADERS, REAL REWARDS, REAL IMPACT" TESTIMONIALS (Image 5 Bottom) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-slate-100 dark:border-slate-800 text-center space-y-12">
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c182a] dark:text-white">
            Real traders, real rewards, real impact
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
            Hear it directly from traders who passed their challenge and received their reward. These are real stories from traders whose lives changed with each dollar they received.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
            {
              trader: 'Marcus Lindholm',
              country: 'Sweden 🇸🇪',
              firm: 'FTMO & Funding Pips',
              payout: '$18,400 Payout + MacBook Pro M3',
              quote: 'Code NATION gave me 10% off my $200K evaluation and I got 11,800 points credited in 24 hours. The MacBook arrived in Stockholm 3 days later!',
            },
            {
              trader: 'Tariq Al-Mansoor',
              country: 'UAE 🇦🇪',
              firm: 'FundedSquad $100K',
              payout: '$9,250 Payout + iPhone 18 Pro',
              quote: 'Submitted my FundedSquad billing PDF using the new upload form. Instant AI OCR verification, zero hassle. PropNation is hands down the best reward ecosystem.',
            },
            {
              trader: 'Elena Rostova',
              country: 'Germany 🇩🇪',
              firm: 'Pipstone Capital',
              payout: '$12,100 Payout + G-Shock Watch',
              quote: '1$ = 10 points guaranteed. I redeemed a G-Shock Mudmaster and $500 USDT payout. Everything is authentic and customer support is live 24/7.',
            },
          ].map((item, idx) => (
            <div key={idx} className="rounded-3xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.trader}</h4>
                  <span className="text-[11px] text-slate-400">{item.country} • {item.firm}</span>
                </div>
                <div className="text-amber-400 text-xs">★★★★★</div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20 inline-block">
                {item.payout}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                &ldquo;{item.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. LUXURY REWARDS STORE PREVIEW (Nike, G-Shock, iPhone, Mac) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-10">
          <div className="space-y-1 text-left">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rewards Catalog</span>
            <h2 className="text-3xl sm:text-4xl font-[900] tracking-tight text-[#0c182a] dark:text-white">
              37+ Luxury Physical &amp; Cash Rewards
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Redeemable immediately with your verified reward points (1$ = 10 PTS).
            </p>
          </div>

          <Link href="/rewards">
            <Button className="bg-[#0c182a] hover:bg-[#15253e] text-white font-bold text-xs h-10 px-5 rounded-xl">
              View All 37 Rewards <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
          {rewards.slice(0, 4).map((reward) => (
            <div
              key={reward.id}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs group"
            >
              <div className="aspect-square rounded-xl bg-slate-50 dark:bg-slate-950 overflow-hidden border border-slate-100 dark:border-slate-800">
                <img
                  src={reward.imageUrl}
                  alt={reward.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  {reward.category?.name || 'Luxury Gear'}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-sky-600 transition-colors">
                  {reward.name}
                </h4>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {reward.pointsRequired.toLocaleString()} PTS
                </span>
                <Link href={`/rewards/${reward.slug}`}>
                  <span className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white">
                    Claim →
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 10. CLEAN ACCORDION FAQS */}
      {/* ======================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-slate-100 dark:border-slate-800 text-left space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Help &amp; Answers</span>
          <h2 className="text-3xl sm:text-4xl font-[900] tracking-tight text-[#0c182a] dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#0c182a] dark:text-white"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 11. FLOATING LIVE CHAT BUBBLE (Exact match to FundingPips bottom right) */}
      {/* ======================================================== */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href="/support/live"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0c182a] text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white/20 group"
          title="Open Live Chat"
        >
          <MessageSquare className="h-6 w-6 text-white group-hover:text-sky-300 transition-colors" />
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
        </Link>
      </div>
    </div>
  );
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function TagIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}
