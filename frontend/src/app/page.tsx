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
  ChevronLeft,
  ChevronRight,
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
  Play,
  Tv,
  Brain,
  CandlestickChart,
  Crown,
  Calendar,
  Scale,
  Smartphone,
  Globe,
  Radio,
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

// Video Success Stories Carousel Data (Continuation Image 1)
const SUCCESS_STORIES = [
  {
    amount: '$45,476.80',
    title: 'HOW RAHUL SCALED FROM $10K TO $100K WITH CODE NATION',
    coach: 'By Trading Psychology Coach Paulina',
    firm: 'FundingPips',
    trader: 'Rahul K. (India)',
    badge: 'SUCCESS STORY',
    accent: 'from-blue-900 to-sky-950',
  },
  {
    amount: '$27,153.00',
    title: 'DIDI REVEALS HIS EVALUATION STRATEGY & RAPID REWARDS',
    coach: 'By Trading Psychology Coach Paulina',
    firm: 'FundedSquad',
    trader: 'Didi M. (France)',
    badge: 'SUCCESS STORY',
    accent: 'from-sky-900 to-indigo-950',
  },
  {
    amount: '$39,000.00',
    title: '28+ TRADES UNBEATABLE RECORD: $39K REWARDS CLAIMED',
    coach: 'By Trading Psychology Coach Paulina',
    firm: 'FTMO & FundingPips',
    trader: 'Tariq A. (UAE)',
    badge: 'SUCCESS STORY',
    accent: 'from-blue-950 to-slate-900',
  },
  {
    amount: '$36,500.00',
    title: 'ARMAN EARNS $36.5K — ZERO EMOTIONS ON 2-STEP',
    coach: 'By Trading Psychology Coach Paulina',
    firm: 'Pipstone Capital',
    trader: 'Arman V. (Armenia)',
    badge: 'SUCCESS STORY',
    accent: 'from-indigo-950 to-blue-900',
  },
  {
    amount: '$139,900.00',
    title: 'SMART MONEY CONFLUENCE: WHEN TIMING MEETS CONFIDENCE',
    coach: 'By Trading Psychology Coach Paulina',
    firm: 'FundedNext',
    trader: 'Jessica L. (UK)',
    badge: 'SUCCESS STORY',
    accent: 'from-sky-950 to-blue-900',
  },
];

// Masterclass Media Hub Data (Continuation Image 3)
const MASTERCLASS_TABS = [
  {
    id: 'psychology',
    title: 'Trading Psychology',
    subtitle: 'Master the habits & mindset behind performance',
    description: 'Understand how top funded traders manage drawdowns, avoid revenge trading, and stay consistent during high-impact news releases.',
    instructor: 'Paulina S., Lead Trading Performance Coach',
    duration: '42 mins • Episode 14',
  },
  {
    id: 'beyond',
    title: 'Beyond the Charts',
    subtitle: 'Understand what truly moves the market',
    description: 'Deep dive into intermarket correlations, bond yields, institutional order flow, and liquidity pool sweeps.',
    instructor: 'David M., Chief Macro Strategist',
    duration: '55 mins • Episode 09',
  },
  {
    id: 'tradintv',
    title: 'TradinTV',
    subtitle: 'Watch real traders execute live in real time',
    description: 'Uncut, unfiltered live evaluation passing sessions with commentary on entry timing, stop-loss placement, and risk management.',
    instructor: 'Alex R., Head of Live Execution',
    duration: '1 hr 15 mins • Live Stream',
  },
];

export default function HomePage() {
  const [propFirms, setPropFirms] = useState<PropFirm[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Pricing Matrix Selection
  const [selectedType, setSelectedType] = useState<string>('2step');
  const [selectedSize, setSelectedSize] = useState<string>('5k');

  // Masterclass Tab State (Image 3)
  const [activeMasterclassTab, setActiveMasterclassTab] = useState<string>('psychology');

  // Video Stories Carousel Scroll State (Image 1)
  const [storyScrollIdx, setStoryScrollIdx] = useState<number>(0);

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
  const activeMasterclass = MASTERCLASS_TABS.find((t) => t.id === activeMasterclassTab) || MASTERCLASS_TABS[0];

  const faqs = [
    {
      q: 'What is PropNation?',
      a: 'PropNation is the premier proprietary trading loyalty ecosystem and cashback partner for top-tier firms including FundedSquad, Pipstone Capital, FTMO, FundedNext, and FundingPips. When you purchase an evaluation account using universal code NATION, you receive exclusive discounts and earn 10 reward points per $1 spent to redeem for luxury physical tech, shoes, luxury watches, or instant USDT payouts.',
    },
    {
      q: 'Do I need to risk my own money?',
      a: 'No. When trading prop firm accounts, you trade in a fully simulated environment with virtual demo funds. The only cost is the challenge registration fee, which yields 10 reward points per $1 spent and is frequently 100% refunded with your first simulated profit split.',
    },
    {
      q: 'What challenge models does PropNation offer?',
      a: 'Through our official prop firm partners, you can access 1-Step (FLEX), Classic 2-Phase evaluations, and Instant (Zero-Evaluation) funding accounts ranging from $5,000 all the way to $200,000+ with scale-up capital reaching $2,000,000.',
    },
    {
      q: "I'm not a trader — what exactly is a prop firm?",
      a: 'A proprietary trading firm ("prop firm") provides qualified individuals with simulated capital to trade global financial markets. Once you demonstrate risk management and pass the evaluation objectives, you receive a funded account and keep up to 100% of generated profits.',
    },
    {
      q: 'How much can I earn with PropNation?',
      a: 'Traders earn in two major ways: first, up to 100% performance rewards on their funded challenge accounts; second, spendable reward points (1$ = 10 PTS) on every challenge purchase and reset, redeemable for authentic luxury products (Nike Dunks, Apple Watch Ultra, MacBook Pro) or direct crypto/wire payouts.',
    },
    {
      q: 'Is PropNation legitimate?',
      a: 'Yes. PropNation is an officially recognized partner operating directly with verified prop firms. Submissions are audited with automated AI OCR invoice verification, and physical rewards are dispatched in factory-sealed retail packaging with fully insured DHL/FedEx tracking.',
    },
    {
      q: 'Can I try PropNation before paying?',
      a: 'Yes. You can explore our interactive challenge calculators, browse the rewards catalog, inspect verification proof demos, and register a free trader account before making any evaluation purchase.',
    },
    {
      q: 'When and how do I get paid?',
      a: 'Reward points are credited within minutes of AI receipt verification. You can redeem points at any time for physical luxury goods or instant USDT (TRC-20/ERC-20) and direct bank wire cashouts.',
    },
    {
      q: 'Does PropNation have a regulated broker?',
      a: 'Our partnered firms utilize institutional liquidity providers and tier-1 regulated broker feeds (such as cTrader, DXtrade, and Tradin) ensuring ultra-raw spreads, fast execution, and zero markup.',
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
      {/* 3. SUCCESS STORIES VIDEO CAROUSEL (Continuation Image 1 Top) */}
      {/* ======================================================== */}
      <section className="w-full bg-slate-50/60 dark:bg-[#060a15] py-12 sm:py-16 border-y border-slate-100 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="purple" className="bg-[#0c182a] text-white">Verified Trader Interviews</Badge>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
                Real Payouts &amp; Challenge Pass Proof
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStoryScrollIdx((prev) => Math.max(0, prev - 1))}
                className="p-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 transition-colors"
                title="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setStoryScrollIdx((prev) => Math.min(SUCCESS_STORIES.length - 1, prev + 1))}
                className="p-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 transition-colors"
                title="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Story Cards Track */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {SUCCESS_STORIES.slice(storyScrollIdx, storyScrollIdx + 4).map((story, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-[#0c182a] text-white p-5 space-y-4 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold text-sky-400">
                    <span className="uppercase tracking-widest">{story.badge}</span>
                    <span className="bg-sky-950/80 px-2 py-0.5 rounded border border-sky-500/30 text-white font-mono">
                      {story.firm}
                    </span>
                  </div>

                  <div className="text-2xl sm:text-3xl font-[900] text-emerald-400 tracking-tight font-mono">
                    {story.amount}
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-sky-300 transition-colors">
                    {story.title}
                  </h4>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                    {story.trader}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-sky-400 group-hover:translate-x-0.5 transition-transform">
                    <Play className="h-3 w-3 fill-sky-400" />
                    <span>Watch</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. "TRADE ON YOUR TERMS" SECTION (Continuation Image 1 Bottom) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-12">
        <div className="space-y-3 max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c182a] dark:text-white">
            Trade on your terms
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-normal">
            Markets, platforms, and payouts, all on your schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 text-left">
          {/* Card 1: 5 Markets */}
          <div className="rounded-3xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-8 space-y-6 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-xs">
            <div className="space-y-6">
              {/* Minimalist 5 Markets Diagram */}
              <div className="h-36 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800/80 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="flex items-center justify-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">FX</div>
                  <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">MET</div>
                  <div className="h-12 w-12 rounded-xl bg-[#0c182a] text-white flex items-center justify-center font-bold shadow-md">
                    <CandlestickChart className="h-6 w-6 text-sky-400" />
                  </div>
                  <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">ENG</div>
                  <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">BTC</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-[900] text-[#0c182a] dark:text-white">5 Markets.</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  The five core asset classes FX, Metals, Energies, Crypto and Indices in global financial markets.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: 5 Partner Prop Firms */}
          <div className="rounded-3xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-8 space-y-6 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-xs">
            <div className="space-y-6">
              {/* Clean Floating Prop Firm Logo Tiles */}
              <div className="h-36 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800/80 flex items-center justify-center p-4 gap-2">
                <div className="h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                  FundedSquad
                </div>
                <div className="h-11 px-3.5 rounded-xl bg-[#0c182a] text-white flex items-center justify-center text-xs font-bold shadow-md">
                  FundingPips
                </div>
                <div className="h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                  FTMO
                </div>
              </div>

              <div>
                <h3 className="text-lg font-[900] text-[#0c182a] dark:text-white">5 Partner Prop Firms.</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Supported across FundedSquad, Pipstone, FTMO, FundedNext, and FundingPips with universal code NATION.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Get Paid Your Way */}
          <div className="rounded-3xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-8 space-y-6 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-xs">
            <div className="space-y-6">
              {/* Payout Frequency Tabs & Wallet Diagram */}
              <div className="h-36 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800/80 flex flex-col items-center justify-center p-4 space-y-2">
                <div className="h-10 w-10 rounded-xl bg-[#0c182a] text-white flex items-center justify-center shadow-md">
                  <Wallet className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                  <span className="px-2 py-0.5 rounded">Weekly</span>
                  <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">Bi-Weekly</span>
                  <span className="px-2 py-0.5 rounded">Monthly</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-[900] text-[#0c182a] dark:text-white">Get Paid your way.</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Balancing quick access to capital with overall account growth and real luxury physical rewards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. "YOUR SKILL IS OUR CAPITAL" 3-STAGE PATHWAY (Continuation Image 2) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-12">
        <div className="space-y-3 max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c182a] dark:text-white">
            Your skill is our capital
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-normal">
            A structured path from proving your edge in sim to trading PRIME capital.
          </p>
        </div>

        {/* 3 Connected Stage Cards on Orbit */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left relative max-w-5xl mx-auto">
          {/* Stage 1 */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-3 shadow-md hover:-translate-y-1 transition-transform">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              <Target className="h-3.5 w-3.5 text-sky-500" />
              Stage 1
            </span>
            <h4 className="text-xl font-[900] text-[#0c182a] dark:text-white">Prove your edge</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              On Sim &amp; grow with PRIME. Complete challenge objectives with zero hidden drawdown tricks.
            </p>
          </div>

          {/* Stage 2 */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-3 shadow-md hover:-translate-y-1 transition-transform">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              Stage 2
            </span>
            <h4 className="text-xl font-[900] text-[#0c182a] dark:text-white">Scale PRIME capital</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Scale all the way to $2M allocation with compounding rewards and higher profit splits.
            </p>
          </div>

          {/* Stage 3: Midnight Navy Card with Crown */}
          <div className="rounded-3xl bg-[#0c182a] text-white p-6 sm:p-8 space-y-3 shadow-2xl border border-sky-500/30 hover:-translate-y-1 transition-transform relative overflow-hidden">
            <div className="absolute top-2 right-2 text-2xl">👑</div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-sky-950 px-3 py-1 rounded-full border border-sky-500/40">
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              Stage 3
            </span>
            <h4 className="text-xl font-[900] text-white">Become a fund manager</h4>
            <p className="text-xs text-slate-300">
              Earn directly from investor capital with lifetime VIP reward perks and instant cashouts.
            </p>
          </div>
        </div>

        {/* Feature Pills & Buttons */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">
              <Calendar className="h-4 w-4 text-emerald-500" />
              <span>80% Daily Rewards</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">
              <Scale className="h-4 w-4 text-blue-500" />
              <span>Up to 1:2000 leverage</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">
              <Coins className="h-4 w-4 text-amber-500" />
              <span>1$ = 10 PTS Cashback</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/prop-firms">
              <Button className="bg-[#0c182a] hover:bg-[#15253e] text-white font-bold text-xs h-11 px-7 rounded-full shadow-md">
                Get Started
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-xs h-11 px-7 rounded-full">
                See roadmap
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. "BUILT BY TRADERS, FOR TRADERS" MASTERCLASS HUB (Continuation Image 3) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-10">
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c182a] dark:text-white">
            Built by traders, for traders. Your growth is our mission
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            At PropNation we don&apos;t just reward traders. We build them.
          </p>
        </div>

        {/* Video Player Hero Frame (Continuation Image 3) */}
        <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#0c182a] text-white shadow-2xl relative">
          <div className="aspect-[16/9] sm:aspect-[21/9] w-full relative flex items-center justify-center overflow-hidden">
            <img
              src="/fundingpips-masterclass.jpg"
              alt="Trading Masterclass"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c182a] via-[#0c182a]/50 to-transparent" />

            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 z-10">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest bg-sky-950/80 px-3 py-1 rounded-full border border-sky-500/30">
                {activeMasterclass.title}
              </span>
              <h3 className="text-2xl sm:text-4xl font-[900] text-white tracking-tight max-w-2xl">
                {activeMasterclass.subtitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl hidden sm:block">
                {activeMasterclass.description}
              </p>
              <button className="bg-white hover:bg-slate-100 text-[#0c182a] font-bold text-xs px-6 py-3 rounded-full flex items-center gap-2 shadow-lg transition-transform hover:scale-105">
                <Play className="h-3.5 w-3.5 fill-[#0c182a]" />
                <span>Watch last episode</span>
              </button>
            </div>
          </div>

          {/* 3 Selectable Masterclass Episode Tabs Below */}
          <div className="p-4 sm:p-6 bg-[#08101d] grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-800">
            {MASTERCLASS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMasterclassTab(tab.id)}
                className={`p-4 rounded-2xl text-left transition-all space-y-1 ${
                  activeMasterclassTab === tab.id
                    ? 'bg-[#0f1d33] border-2 border-sky-400 shadow-md'
                    : 'bg-[#0a1424] hover:bg-[#0d192d] border border-slate-800'
                }`}
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{tab.title}</span>
                  {activeMasterclassTab === tab.id && <span className="h-2 w-2 rounded-full bg-sky-400" />}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {tab.subtitle}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. DISCORD COMMUNITY & LIVE BOT UPDATES (Continuation Image 4 Top) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c182a] dark:text-white leading-[1.12]">
              Learn, grow and connect with traders worldwide
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Traders from 195 countries trust our platform and celebrate daily cashback payouts in our active community.
            </p>

            <div className="flex items-center gap-8 pt-2">
              <div>
                <span className="text-xs text-slate-400 block">Traders</span>
                <span className="text-2xl font-[900] text-[#0c182a] dark:text-white">3 million+</span>
              </div>
              <div className="border-l border-slate-200 dark:border-slate-800 pl-8">
                <span className="text-xs text-slate-400 block">Rewards Distributed</span>
                <span className="text-2xl font-[900] text-[#0c182a] dark:text-white">$314M+</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-[#0c182a] hover:bg-[#15253e] text-white font-bold text-xs h-12 px-7 rounded-full shadow-md">
                  Join Discord Community
                </Button>
              </a>
            </div>
          </div>

          {/* Right Column: iPad / Tablet Mockup of Discord Server (Image 4 exact UI) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-[#0c182a] text-white p-5 sm:p-7 shadow-2xl space-y-4 text-left">
              {/* Discord Server Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    PN
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>PropNation Community</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      8,435 Online • 220,057 Members
                    </span>
                  </div>
                </div>
                <Badge variant="success">#rewards-live-updates</Badge>
              </div>

              {/* Live Discord Bot Notifications Stream */}
              <div className="space-y-2.5 font-mono text-xs text-slate-300 pt-2">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                  <span className="text-sky-400 font-bold shrink-0">🤖 Bot:</span>
                  <span className="truncate">An FP Trader from NL just secured a <strong className="text-emerald-400 font-bold">$965.20 reward</strong>! 🔥</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                  <span className="text-sky-400 font-bold shrink-0">🤖 Bot:</span>
                  <span className="truncate">An FS Trader from DE just claimed an <strong className="text-sky-400 font-bold">Apple Watch Ultra</strong>! 🔥</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                  <span className="text-sky-400 font-bold shrink-0">🤖 Bot:</span>
                  <span className="truncate">A Pipstone Trader from US just secured a <strong className="text-emerald-400 font-bold">$1,250.00 reward</strong>! 🔥</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                  <span className="text-sky-400 font-bold shrink-0">🤖 Bot:</span>
                  <span className="truncate">An FTMO Trader from UK just claimed a <strong className="text-purple-400 font-bold">MacBook Pro M3</strong>! 🔥</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. LIVE BROKER & ECOSYSTEM ADVANTAGE (Continuation Image 4 Bottom) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-slate-100 dark:border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c182a] dark:text-white leading-[1.12]">
              Ecosystem advantage &amp; regulated execution
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Built for traders by traders. The trader-first experience you trust, now available with seamless cashback and automated payouts across all 5 firms.
            </p>

            <div className="space-y-3 pt-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Multiple tier-1 regulatory licenses</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Up to 1:2000 leverage across all 5 firms</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>24/5 dedicated human support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Universal referral code: NATION (1$ = 10 PTS)</span>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/prop-firms">
                <Button className="bg-[#0c182a] hover:bg-[#15253e] text-white font-bold text-xs h-11 px-7 rounded-full shadow-md">
                  Start Trading
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Mobile App Analytics Mockup (Image 4 exact phone screen) */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-sm rounded-[2.5rem] bg-[#0c182a] text-white p-6 border-4 border-slate-300 dark:border-slate-800 shadow-2xl space-y-5 text-left relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">ACCOUNT BALANCE</span>
                  <div className="text-2xl font-[900] text-white">$21,079.65</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 block font-mono">TOTAL PROFIT</span>
                  <div className="text-base font-bold text-emerald-400">+$10,931.70</div>
                </div>
              </div>

              {/* Chart Line Simulation */}
              <div className="h-24 bg-gradient-to-b from-sky-500/10 to-transparent rounded-xl border-b border-sky-400/40 relative flex items-end">
                <div className="w-full h-1 bg-sky-400 shadow-glow" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">Win Rate</span>
                  <span className="font-bold text-white">67.0%</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">Avg Win</span>
                  <span className="font-bold text-white">$287.47</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">Volume</span>
                  <span className="font-bold text-white">138.4</span>
                </div>
              </div>
            </div>
          </div>
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
      {/* 10. "BUILDING TRADERS GLOBALLY SINCE 2022" (Continuation Image 5 & End Image 1) */}
      {/* ======================================================== */}
      <section className="w-full bg-[#060e1d] text-white py-20 sm:py-28 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-16">
          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-white">
              Building Traders Globally Since 2022
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              The gold standard for prop firm challenge cashback, live verification, and luxury rewards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 text-center max-w-5xl mx-auto">
            {/* Column 1 */}
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-sky-500/10 text-sky-400 mx-auto flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-[900] text-white">200+ employees</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                A global team with decades of market experience driving your trading performance.
              </p>
            </div>

            {/* Column 2 */}
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-sky-500/10 text-sky-400 mx-auto flex items-center justify-center">
                <Globe className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-[900] text-white">5 global offices</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Strategically positioned to support traders across all regions around the world.
              </p>
            </div>

            {/* Column 3 */}
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-sky-500/10 text-sky-400 mx-auto flex items-center justify-center">
                <Headphones className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-[900] text-white">24/7 Real Human Support</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Real support available whenever you need it via live chat and dedicated VIP desks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 11. DEEP NAVY FAQS: "WHAT IS PROPNATION?" (Continuation Image 2 & 3) */}
      {/* ======================================================== */}
      <section className="w-full bg-[#030c1f] text-white py-20 sm:py-28 border-t border-blue-950/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-white">
              What is PropNation?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-normal">
              Learn more about PropNation
            </p>
          </div>

          <div className="space-y-1 text-left divide-y divide-blue-900/40">
            {faqs.map((faq, idx) => (
              <div key={idx} className="py-4 sm:py-5">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-sky-300 transition-colors cursor-pointer text-left"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-sky-400 transition-transform duration-200 shrink-0 ${
                      openFaq === idx ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="pt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 12. FLOATING LIVE CHAT BUBBLE (Exact match to FundingPips bottom right) */}
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
