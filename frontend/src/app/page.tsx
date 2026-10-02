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
  Tag,
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

const DEFAULT_PROP_FIRMS: PropFirm[] = [
  {
    id: 'firm-1',
    name: 'FundedSquad',
    slug: 'fundedsquad',
    logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&auto=format&fit=crop&q=80',
    description: 'Elite proprietary firm with instant evaluation pass options, scaling plans up to $1,000,000, and weekly payouts.',
    websiteUrl: 'https://fundedsquad.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://fundedsquad.com/?ref=nation',
    offers: [
      { id: 'o-1', accountTierName: '$10K Evaluation Challenge', purchasePriceUsd: 100, rewardPoints: 1000 },
      { id: 'o-2', accountTierName: '$25K Evaluation Challenge', purchasePriceUsd: 200, rewardPoints: 2000 },
      { id: 'o-3', accountTierName: '$50K Evaluation Challenge', purchasePriceUsd: 350, rewardPoints: 3500 },
      { id: 'o-4', accountTierName: '$100K Evaluation Challenge', purchasePriceUsd: 550, rewardPoints: 5500 },
    ],
  },
  {
    id: 'firm-2',
    name: 'Pipstone Capital',
    slug: 'pipstone-capital',
    logoUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=120&auto=format&fit=crop&q=80',
    description: 'Premium prop trading firm offering raw ECN spreads, high drawdown limits, and bi-weekly revenue splits up to 90%.',
    websiteUrl: 'https://pipstonecapital.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://pipstonecapital.com/?ref=nation',
    offers: [
      { id: 'o-6', accountTierName: '$15K Pipstone Standard', purchasePriceUsd: 120, rewardPoints: 1200 },
      { id: 'o-7', accountTierName: '$30K Pipstone Standard', purchasePriceUsd: 220, rewardPoints: 2200 },
      { id: 'o-8', accountTierName: '$60K Pipstone Standard', purchasePriceUsd: 380, rewardPoints: 3800 },
      { id: 'o-9', accountTierName: '$100K Pipstone Standard', purchasePriceUsd: 520, rewardPoints: 5200 },
    ],
  },
  {
    id: 'firm-3',
    name: 'FTMO',
    slug: 'ftmo',
    logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&auto=format&fit=crop&q=80',
    description: 'The global benchmark for proprietary trading. Up to $200,000 initial balance, up to 90% profit split, and world-class trader education.',
    websiteUrl: 'https://ftmo.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://ftmo.com/?ref=nation',
    offers: [
      { id: 'o-11', accountTierName: '$10K Evaluation Challenge', purchasePriceUsd: 175, rewardPoints: 1750 },
      { id: 'o-12', accountTierName: '$25K Evaluation Challenge', purchasePriceUsd: 280, rewardPoints: 2800 },
      { id: 'o-13', accountTierName: '$50K Evaluation Challenge', purchasePriceUsd: 390, rewardPoints: 3900 },
      { id: 'o-14', accountTierName: '$100K Evaluation Challenge', purchasePriceUsd: 600, rewardPoints: 6000 },
    ],
  },
  {
    id: 'firm-4',
    name: 'FundedNext',
    slug: 'fundednext',
    logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&auto=format&fit=crop&q=80',
    description: '15% profit sharing during challenge phases, up to 95% profit split, and guaranteed 24-hour payout processing.',
    websiteUrl: 'https://fundednext.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://fundednext.com/?ref=nation',
    offers: [
      { id: 'o-16', accountTierName: '$15K Stellar 2-Step', purchasePriceUsd: 119, rewardPoints: 1190 },
      { id: 'o-17', accountTierName: '$25K Stellar 2-Step', purchasePriceUsd: 199, rewardPoints: 1990 },
      { id: 'o-18', accountTierName: '$50K Stellar 2-Step', purchasePriceUsd: 299, rewardPoints: 2990 },
      { id: 'o-19', accountTierName: '$100K Stellar 2-Step', purchasePriceUsd: 549, rewardPoints: 5490 },
    ],
  },
  {
    id: 'firm-5',
    name: 'Funding Pips',
    slug: 'funding-pips',
    logoUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=120&auto=format&fit=crop&q=80',
    description: 'Built by traders for traders. Tight spreads, fast weekly payouts, and zero time limit evaluation phases.',
    websiteUrl: 'https://fundingpips.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://fundingpips.com/?ref=nation',
    offers: [
      { id: 'o-21', accountTierName: '$5K Evaluation 2-Step', purchasePriceUsd: 32, rewardPoints: 320 },
      { id: 'o-22', accountTierName: '$25K Evaluation 2-Step', purchasePriceUsd: 139, rewardPoints: 1390 },
      { id: 'o-23', accountTierName: '$50K Evaluation 2-Step', purchasePriceUsd: 239, rewardPoints: 2390 },
      { id: 'o-24', accountTierName: '$100K Evaluation 2-Step', purchasePriceUsd: 399, rewardPoints: 3990 },
    ],
  },
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

// Video Success Stories Carousel Data
const SUCCESS_STORIES = [
  {
    amount: '$45,476.80',
    title: 'HOW RAHUL SCALED FROM $10K TO $100K WITH CODE NATION',
    coach: 'By Trading Psychology Coach Paulina',
    firm: 'FundingPips',
    trader: 'Rahul K. (India)',
    badge: 'SUCCESS STORY',
    accent: 'from-purple-900 to-indigo-950',
  },
  {
    amount: '$27,153.00',
    title: 'DIDI REVEALS HIS EVALUATION STRATEGY & RAPID REWARDS',
    coach: 'By Trading Psychology Coach Paulina',
    firm: 'FundedSquad',
    trader: 'Didi M. (France)',
    badge: 'SUCCESS STORY',
    accent: 'from-violet-900 to-purple-950',
  },
  {
    amount: '$39,000.00',
    title: '28+ TRADES UNBEATABLE RECORD: $39K REWARDS CLAIMED',
    coach: 'By Trading Psychology Coach Paulina',
    firm: 'FTMO & FundingPips',
    trader: 'Tariq A. (UAE)',
    badge: 'SUCCESS STORY',
    accent: 'from-indigo-950 to-purple-900',
  },
  {
    amount: '$36,500.00',
    title: 'ARMAN EARNS $36.5K — ZERO EMOTIONS ON 2-STEP',
    coach: 'By Trading Psychology Coach Paulina',
    firm: 'Pipstone Capital',
    trader: 'Arman V. (Armenia)',
    badge: 'SUCCESS STORY',
    accent: 'from-purple-950 to-indigo-900',
  },
  {
    amount: '$139,900.00',
    title: 'SMART MONEY CONFLUENCE: WHEN TIMING MEETS CONFIDENCE',
    coach: 'By Trading Psychology Coach Paulina',
    firm: 'FundedNext',
    trader: 'Jessica L. (UK)',
    badge: 'SUCCESS STORY',
    accent: 'from-violet-950 to-purple-900',
  },
];

// Masterclass Episode Hub Data
const MASTERCLASS_TABS = [
  {
    id: 'psychology',
    title: 'Trading Psychology Masterclass',
    subtitle: 'Overcome fear and greed in volatile markets',
    description: 'Learn institutional emotional regulation techniques from accredited trading performance coach Paulina.',
    instructor: 'Paulina S., Performance Coach',
    duration: '42 mins • Episode 12',
  },
  {
    id: 'risk',
    title: 'Risk Management 101',
    subtitle: 'Never blow an evaluation account again',
    description: 'Master fixed fractional position sizing, maximum daily loss mitigation, and portfolio risk distribution.',
    instructor: 'David M., Head of Risk Management',
    duration: '58 mins • Masterclass',
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
  const [propFirms, setPropFirms] = useState<PropFirm[]>(DEFAULT_PROP_FIRMS);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Pricing Matrix Selection
  const [selectedType, setSelectedType] = useState<string>('2step');
  const [selectedSize, setSelectedSize] = useState<string>('5k');

  // Masterclass Tab State
  const [activeMasterclassTab, setActiveMasterclassTab] = useState<string>('psychology');

  // Video Stories Carousel Scroll State
  const [storyScrollIdx, setStoryScrollIdx] = useState<number>(0);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    api
      .get<PropFirm[]>('/prop-firms')
      .then((data) => {
        if (data && data.length > 0) {
          setPropFirms(data);
        }
      })
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
    <div className="w-full min-h-screen bg-white dark:bg-[#070913] text-slate-900 dark:text-slate-100 font-sans selection:bg-purple-600 selection:text-white transition-colors duration-200">
      {/* ======================================================== */}
      {/* 1. TOP ANNOUNCEMENT NOTICE RIBBON (Purple Clean Light Theme) */}
      {/* ======================================================== */}
      <div className="w-full bg-[#0d0920] text-white py-2 sm:py-2.5 px-4 text-center text-xs sm:text-[13px] font-medium tracking-tight flex items-center justify-center gap-2 border-b border-purple-950">
        <span>
          Use Universal Code <strong className="font-mono font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/30">NATION</strong>: 10% OFF New Users | 5% OFF Existing Users
        </span>
        <span className="hidden md:inline text-purple-400/50">•</span>
        <span className="hidden md:inline font-bold text-purple-300">
          1$ = 10 Reward Points Across All 5 Prop Firms
        </span>
      </div>

      {/* ======================================================== */}
      {/* 2. HERO SECTION (Clean White, Classy Lighting & Crystal Art) */}
      {/* ======================================================== */}
      <section className="relative w-full pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-32 overflow-hidden bg-white dark:bg-[#070913]">
        {/* Soft Ethereal Atmospheric Glows (Light Purple & Violet) */}
        <div className="absolute top-0 right-0 w-[55vw] h-[55vw] max-w-[800px] max-h-[800px] bg-gradient-to-bl from-purple-200/40 via-violet-100/30 to-transparent dark:from-purple-900/20 dark:via-violet-950/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/4 left-0 w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] bg-gradient-to-tr from-violet-100/40 via-purple-100/20 to-transparent dark:from-purple-950/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 z-10 text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 dark:bg-purple-950/60 px-3.5 py-1 text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                <span>Universal Code: NATION (1$ = 10 PTS)</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-[4.25rem] font-[900] tracking-[-0.035em] text-[#0c1024] dark:text-white leading-[1.06]">
                Turn your trading skills into luxury rewards
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl font-normal">
                Join over 45,000+ traders in the world&apos;s leading prop firm reward ecosystem. Trade in a fully simulated environment with <strong>FundedSquad, Pipstone, FTMO, FundedNext &amp; FundingPips</strong> and earn 10 reward points per $1 spent.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/prop-firms">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white px-7 py-3.5 rounded-full font-bold text-sm tracking-tight shadow-lg shadow-purple-600/25 transition-all h-12">
                    Explore 5 Prop Firms
                  </Button>
                </Link>
                <Link href="/rewards">
                  <Button
                    variant="outline"
                    className="border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 px-7 py-3.5 rounded-full font-semibold text-sm tracking-tight transition-all h-12 shadow-xs"
                  >
                    Explore Rewards Catalog
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Visual: 3D Crystal Lightning Art */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-[460px] aspect-square rounded-3xl overflow-hidden border border-purple-100 dark:border-purple-900/60 shadow-2xl bg-gradient-to-b from-purple-50/50 to-white dark:from-slate-900 dark:to-slate-950 group">
                <img
                  src="/hero-lighting-crystal.jpg"
                  alt="3D Sapphire Lightning Crystal"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/40 dark:from-[#070913]/60 via-transparent to-transparent pointer-events-none" />

                {/* Floating pill badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 border border-purple-200/80 dark:border-purple-900/80 shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-sm">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Universal Partner Code</div>
                      <div className="text-[11px] text-purple-600 dark:text-purple-400 font-mono font-bold">NATION (1$ = 10 PTS)</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyCode('NATION')}
                    className="bg-purple-50 dark:bg-slate-800 hover:bg-purple-100 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 border border-purple-200 dark:border-purple-700"
                  >
                    {copiedCode === 'NATION' ? <Check className="h-3.5 w-3.5 text-purple-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCode === 'NATION' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof Stats Banner */}
          <div className="mt-16 sm:mt-24 pt-10 border-t border-purple-100 dark:border-purple-900/50 grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 items-center text-left">
            <div>
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-2xl sm:text-3xl font-[900] tracking-tight text-[#0c1024] dark:text-white">$314M+</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Rewards Distributed</p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-2xl sm:text-3xl font-[900] tracking-tight text-[#0c1024] dark:text-white">3M+</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Traders Worldwide</p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <GlobeIcon className="h-4 w-4 text-purple-600" />
                <span className="text-2xl sm:text-3xl font-[900] tracking-tight text-[#0c1024] dark:text-white">195+</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Countries Serviced</p>
            </div>

            {/* Trustpilot Review Badge */}
            <div className="border-l border-purple-100 dark:border-purple-900/50 pl-4 sm:pl-6">
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <span>Excellent</span>
              </div>
              <div className="flex items-center gap-1 text-purple-500 text-xs my-0.5">
                {'★★★★★'.split('').map((s, i) => (
                  <span key={i} className="text-purple-600 font-bold">★</span>
                ))}
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono ml-1">Trustpilot</span>
              </div>
              <p className="text-[10px] text-slate-400">69,806 reviews</p>
            </div>

            {/* Google Review Badge */}
            <div className="border-l border-purple-100 dark:border-purple-900/50 pl-4 sm:pl-6">
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
      {/* 3. SUCCESS STORIES VIDEO CAROUSEL */}
      {/* ======================================================== */}
      <section className="w-full bg-purple-50/30 dark:bg-[#060814] py-12 sm:py-16 border-y border-purple-100 dark:border-purple-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="purple">Verified Trader Interviews</Badge>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
                Real Payouts &amp; Challenge Pass Proof
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStoryScrollIdx((prev) => Math.max(0, prev - 1))}
                className="p-2 rounded-full border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 hover:bg-purple-50 transition-colors"
                title="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setStoryScrollIdx((prev) => Math.min(SUCCESS_STORIES.length - 1, prev + 1))}
                className="p-2 rounded-full border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 hover:bg-purple-50 transition-colors"
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
                className="group relative rounded-2xl overflow-hidden border border-purple-100 dark:border-purple-900/60 bg-[#0c1024] text-white p-5 space-y-4 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between text-[10px] font-bold text-purple-300">
                    <span className="uppercase tracking-widest">{story.badge}</span>
                    <span className="bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/30 text-white font-mono">
                      {story.firm}
                    </span>
                  </div>

                  <div className="text-2xl sm:text-3xl font-[900] text-purple-300 tracking-tight font-mono">
                    {story.amount}
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-purple-300 transition-colors">
                    {story.title}
                  </h4>
                </div>

                <div className="pt-3 border-t border-purple-950 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                    {story.trader}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-purple-400 group-hover:translate-x-0.5 transition-transform">
                    <Play className="h-3 w-3 fill-purple-400" />
                    <span>Watch</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. "TRADE ON YOUR TERMS" 3 CARDS */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-12">
        <div className="space-y-3 max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c1024] dark:text-white">
            Trade on your terms
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-normal">
            Markets, platforms, and payouts, all on your schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 text-left">
          {/* Card 1: 5 Markets */}
          <div className="rounded-3xl bg-purple-50/30 dark:bg-slate-900/60 border border-purple-100 dark:border-purple-900/50 p-8 space-y-6 flex flex-col justify-between hover:border-purple-300 transition-colors shadow-xs">
            <div className="space-y-6">
              <div className="h-36 rounded-2xl bg-white dark:bg-slate-950 border border-purple-100 dark:border-purple-900/60 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="flex items-center justify-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-purple-50 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-purple-700">FX</div>
                  <div className="h-7 w-7 rounded-lg bg-purple-50 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-purple-700">MET</div>
                  <div className="h-12 w-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md">
                    <CandlestickChart className="h-6 w-6 text-white" />
                  </div>
                  <div className="h-7 w-7 rounded-lg bg-purple-50 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-purple-700">ENG</div>
                  <div className="h-7 w-7 rounded-lg bg-purple-50 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-purple-700">BTC</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-[900] text-[#0c1024] dark:text-white">5 Markets.</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  The five core asset classes FX, Metals, Energies, Crypto and Indices in global financial markets.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: 5 Partner Prop Firms */}
          <div className="rounded-3xl bg-purple-50/30 dark:bg-slate-900/60 border border-purple-100 dark:border-purple-900/50 p-8 space-y-6 flex flex-col justify-between hover:border-purple-300 transition-colors shadow-xs">
            <div className="space-y-6">
              <div className="h-36 rounded-2xl bg-white dark:bg-slate-950 border border-purple-100 dark:border-purple-900/60 flex items-center justify-center p-4 gap-2">
                <div className="h-10 px-3 rounded-xl bg-purple-50 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  FundedSquad
                </div>
                <div className="h-11 px-3.5 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
                  FundingPips
                </div>
                <div className="h-10 px-3 rounded-xl bg-purple-50 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  FTMO
                </div>
              </div>

              <div>
                <h3 className="text-lg font-[900] text-[#0c1024] dark:text-white">5 Partner Prop Firms.</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Supported across FundedSquad, Pipstone, FTMO, FundedNext, and FundingPips with universal code NATION.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Get Paid Your Way */}
          <div className="rounded-3xl bg-purple-50/30 dark:bg-slate-900/60 border border-purple-100 dark:border-purple-900/50 p-8 space-y-6 flex flex-col justify-between hover:border-purple-300 transition-colors shadow-xs">
            <div className="space-y-6">
              <div className="h-36 rounded-2xl bg-white dark:bg-slate-950 border border-purple-100 dark:border-purple-900/60 flex flex-col items-center justify-center p-4 space-y-2">
                <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                  <span className="px-2 py-0.5 rounded">Weekly</span>
                  <span className="bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold border border-purple-300">Bi-Weekly</span>
                  <span className="px-2 py-0.5 rounded">Monthly</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-[900] text-[#0c1024] dark:text-white">Get Paid your way.</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Balancing quick access to capital with overall account growth and real luxury physical rewards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. OFFICIAL PARTNER PROP FIRMS DIRECTORY (All 5 Listed Firms) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-purple-100 dark:border-purple-950/60 text-center space-y-12">
        <div className="space-y-3 max-w-2xl mx-auto">
          <Badge variant="purple">5 Official Partner Prop Firms</Badge>
          <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c1024] dark:text-white">
            Where to purchase with code NATION
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-normal">
            Visit any of our 5 official prop firm websites below. Apply code <strong className="font-mono text-purple-600 font-bold">NATION</strong> at checkout and submit your receipt for instant 10 points per $1 rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {propFirms.slice(0, 5).map((firm) => {
            const domain = firm.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
            return (
              <div
                key={firm.id}
                className="rounded-3xl bg-white dark:bg-[#070913] border border-purple-100 dark:border-purple-900/40 p-6 sm:p-7 space-y-5 shadow-sm hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-800 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Logo + Name */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 overflow-hidden flex items-center justify-center shrink-0">
                        {firm.logoUrl ? (
                          <img src={firm.logoUrl} alt={firm.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="font-black text-purple-700">{firm.name[0]}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-[900] text-slate-900 dark:text-white">{firm.name}</h4>
                        <a
                          href={firm.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-purple-600 hover:text-purple-800 dark:text-purple-400 inline-flex items-center gap-1 underline underline-offset-2"
                        >
                          <span>{domain}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    <Badge variant="purple" className="text-[10px]">
                      1$ = 10 PTS
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {firm.description}
                  </p>

                  {/* Referral Code Mini Box */}
                  <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950/30 p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-purple-600 block">Referral Code</span>
                      <span className="font-mono text-base font-[900] text-purple-950 dark:text-white">NATION</span>
                    </div>
                    <button
                      onClick={() => handleCopyCode('NATION')}
                      className="bg-white dark:bg-slate-800 hover:bg-purple-50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      {copiedCode === 'NATION' ? <Check className="h-3 w-3 text-purple-600" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedCode === 'NATION' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-50 dark:border-purple-950/40">
                  <a
                    href={firm.affiliateUrl || firm.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold border-purple-200 hover:bg-purple-50">
                      Visit &amp; Buy
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </a>
                  <Link href={`/dashboard/purchases/new?propFirmId=${firm.id}`}>
                    <Button variant="primary" size="sm" className="w-full text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-600/20">
                      Submit Proof
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. INTERACTIVE CHALLENGE PRICING MATRIX & REWARDS ESTIMATOR */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-12">
        <div className="space-y-3 max-w-2xl mx-auto">
          <Badge variant="purple">Transparent Challenge Pricing</Badge>
          <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c1024] dark:text-white">
            Choose your challenge model
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-normal">
            Select your preferred evaluation model and account size. Apply code <strong className="font-mono text-purple-600 font-bold">NATION</strong> to claim discounts and earn 10 reward points per $1 spent.
          </p>
        </div>

        {/* Model Tabs (Zero, FLEX, 2-Step) */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {CHALLENGE_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all text-left flex flex-col ${
                selectedType === type.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 scale-105'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span className="font-[900] text-sm">{type.label}</span>
              <span className={`text-[10px] ${selectedType === type.id ? 'text-purple-100' : 'text-slate-400'}`}>
                {type.subtitle}
              </span>
            </button>
          ))}
        </div>

        {/* Account Size Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto">
          {ACCOUNT_SIZES.map((size) => (
            <button
              key={size.id}
              onClick={() => setSelectedSize(size.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedSize === size.id
                  ? 'bg-[#0c1024] text-white shadow-md'
                  : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100'
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>

        {/* Matrix Comparison Cards (Standard, FLEX, PRO) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
          {/* Card: Standard / Classic */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 p-6 sm:p-8 space-y-6 shadow-md hover:shadow-xl transition-all">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Standard Tier</span>
              <h3 className="text-xl font-[900] text-slate-900 dark:text-white">{selectedSize.toUpperCase()} Account</h3>
              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-3xl font-[900] text-slate-900 dark:text-white">${currentMatrix.standard.price}</span>
                <span className="text-xs text-slate-400 font-mono">USD</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800">
                <Coins className="h-3.5 w-3.5" />
                <span>+{currentMatrix.standard.points} Points Earned</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 border-t border-purple-100 dark:border-purple-900/40 pt-4">
              <div className="flex justify-between"><span>Profit Target:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.standard.target}</strong></div>
              <div className="flex justify-between"><span>Maximum Loss:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.standard.maxLoss}</strong></div>
              <div className="flex justify-between"><span>Daily Loss:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.standard.dailyLoss}</strong></div>
              <div className="flex justify-between"><span>Minimum Days:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.standard.minDays}</strong></div>
              <div className="flex justify-between"><span>Profit Split:</span><strong className="text-purple-600 dark:text-purple-400 font-bold">{currentMatrix.standard.split}</strong></div>
            </div>

            <Link href="/prop-firms" className="block pt-2">
              <Button className="w-full bg-[#0c1024] hover:bg-[#15253e] text-white font-bold text-xs h-11 rounded-xl">
                Choose Partner Firm
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>

          {/* Card: Flex (Highlighted) */}
          <div className="rounded-3xl bg-gradient-to-b from-purple-50/50 to-white dark:from-purple-950/40 dark:to-slate-900 border-2 border-purple-500 p-6 sm:p-8 space-y-6 shadow-xl relative hover:shadow-2xl transition-all">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-sm">
              Most Popular
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">FLEX Fast Pass</span>
              <h3 className="text-xl font-[900] text-slate-900 dark:text-white">{selectedSize.toUpperCase()} Account</h3>
              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-3xl font-[900] text-purple-600 dark:text-purple-400">${currentMatrix.flex.price}</span>
                <span className="text-xs text-slate-400 font-mono">USD</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 font-bold text-xs border border-purple-300">
                <Coins className="h-3.5 w-3.5 text-purple-600" />
                <span>+{currentMatrix.flex.points} Points Earned</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 border-t border-purple-200 dark:border-purple-800/40 pt-4">
              <div className="flex justify-between"><span>Profit Target:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.flex.target}</strong></div>
              <div className="flex justify-between"><span>Maximum Loss:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.flex.maxLoss}</strong></div>
              <div className="flex justify-between"><span>Daily Loss:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.flex.dailyLoss}</strong></div>
              <div className="flex justify-between"><span>Minimum Days:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.flex.minDays}</strong></div>
              <div className="flex justify-between"><span>Profit Split:</span><strong className="text-purple-600 dark:text-purple-400 font-bold">{currentMatrix.flex.split}</strong></div>
            </div>

            <Link href="/prop-firms" className="block pt-2">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-11 rounded-xl shadow-md shadow-purple-600/25">
                Apply Code NATION &amp; Buy
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>

          {/* Card: Pro */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 p-6 sm:p-8 space-y-6 shadow-md hover:shadow-xl transition-all">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">PRO Zero-Limit</span>
              <h3 className="text-xl font-[900] text-slate-900 dark:text-white">{selectedSize.toUpperCase()} Account</h3>
              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-3xl font-[900] text-slate-900 dark:text-white">${currentMatrix.pro.price}</span>
                <span className="text-xs text-slate-400 font-mono">USD</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800">
                <Coins className="h-3.5 w-3.5" />
                <span>+{currentMatrix.pro.points} Points Earned</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 border-t border-purple-100 dark:border-purple-900/40 pt-4">
              <div className="flex justify-between"><span>Profit Target:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.pro.target}</strong></div>
              <div className="flex justify-between"><span>Maximum Loss:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.pro.maxLoss}</strong></div>
              <div className="flex justify-between"><span>Daily Loss:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.pro.dailyLoss}</strong></div>
              <div className="flex justify-between"><span>Minimum Days:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.pro.minDays}</strong></div>
              <div className="flex justify-between"><span>Profit Split:</span><strong className="text-purple-600 dark:text-purple-400 font-bold">{currentMatrix.pro.split}</strong></div>
            </div>

            <Link href="/prop-firms" className="block pt-2">
              <Button className="w-full bg-[#0c182a] hover:bg-[#15253e] text-white font-bold text-xs h-11 rounded-xl">
                Choose Partner Firm
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. "YOUR SKILL IS OUR CAPITAL" 3-STAGE PATHWAY */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-12">
        <div className="space-y-3 max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c1024] dark:text-white">
            Your skill is our capital
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-normal">
            A structured path from proving your edge in sim to trading PRIME capital.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left relative max-w-5xl mx-auto">
          {/* Stage 1 */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 p-6 sm:p-8 space-y-3 shadow-md hover:-translate-y-1 transition-transform">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full">
              <Target className="h-3.5 w-3.5 text-purple-600" />
              Stage 1
            </span>
            <h4 className="text-xl font-[900] text-[#0c1024] dark:text-white">Prove your edge</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              On Sim &amp; grow with PRIME. Complete challenge objectives with zero hidden drawdown tricks.
            </p>
          </div>

          {/* Stage 2 */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 p-6 sm:p-8 space-y-3 shadow-md hover:-translate-y-1 transition-transform">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              Stage 2
            </span>
            <h4 className="text-xl font-[900] text-[#0c1024] dark:text-white">Scale PRIME capital</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Scale all the way to $2M allocation with compounding rewards and higher profit splits.
            </p>
          </div>

          {/* Stage 3: Midnight Card with Crown */}
          <div className="rounded-3xl bg-[#0c1024] text-white p-6 sm:p-8 space-y-3 shadow-2xl border border-purple-500/40 hover:-translate-y-1 transition-transform relative overflow-hidden">
            <div className="absolute top-2 right-2 text-2xl">👑</div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-purple-950 px-3 py-1 rounded-full border border-purple-500/40">
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
            <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/60 px-4 py-2 rounded-full text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span>80% Daily Rewards</span>
            </div>
            <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/60 px-4 py-2 rounded-full text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <Scale className="h-4 w-4 text-purple-600" />
              <span>Up to 1:2000 leverage</span>
            </div>
            <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/60 px-4 py-2 rounded-full text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <Coins className="h-4 w-4 text-purple-600" />
              <span>1$ = 10 PTS Cashback</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/prop-firms">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-11 px-7 rounded-full shadow-md shadow-purple-600/25">
                Get Started
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" className="border-purple-200 dark:border-purple-800 text-slate-800 dark:text-white font-bold text-xs h-11 px-7 rounded-full hover:bg-purple-50">
                See roadmap
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. MASTERCLASS HUB */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-10">
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c1024] dark:text-white">
            Built by traders, for traders. Your growth is our mission
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            At PropNation we don&apos;t just reward traders. We build them.
          </p>
        </div>

        <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden border border-purple-100 dark:border-purple-900/60 bg-[#0c1024] text-white shadow-2xl relative">
          <div className="aspect-[16/9] sm:aspect-[21/9] w-full relative flex items-center justify-center overflow-hidden">
            <img
              src="/fundingpips-masterclass.jpg"
              alt="Trading Masterclass"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1024] via-[#0c1024]/50 to-transparent" />

            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 z-10">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-widest bg-purple-950/80 px-3 py-1 rounded-full border border-purple-500/30">
                {activeMasterclass.title}
              </span>
              <h3 className="text-2xl sm:text-4xl font-[900] text-white tracking-tight max-w-2xl">
                {activeMasterclass.subtitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl hidden sm:block">
                {activeMasterclass.description}
              </p>
              <button className="bg-white hover:bg-slate-100 text-[#0c1024] font-bold text-xs px-6 py-3 rounded-full flex items-center gap-2 shadow-lg transition-transform hover:scale-105">
                <Play className="h-3.5 w-3.5 fill-[#0c1024]" />
                <span>Watch last episode</span>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-[#09071c] grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-purple-950">
            {MASTERCLASS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMasterclassTab(tab.id)}
                className={`p-4 rounded-2xl text-left transition-all space-y-1 ${
                  activeMasterclassTab === tab.id
                    ? 'bg-[#150d36] border-2 border-purple-400 shadow-md'
                    : 'bg-[#0e0924] hover:bg-[#150d36] border border-purple-900/50'
                }`}
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{tab.title}</span>
                  {activeMasterclassTab === tab.id && <span className="h-2 w-2 rounded-full bg-purple-400" />}
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
      {/* 9. DISCORD COMMUNITY & LIVE UPDATES */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-6 text-left">
            <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c1024] dark:text-white leading-[1.12]">
              Learn, grow and connect with traders worldwide
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Traders from 195 countries trust our platform and celebrate daily cashback payouts in our active community.
            </p>

            <div className="flex items-center gap-8 pt-2">
              <div>
                <span className="text-xs text-slate-400 block">Traders</span>
                <span className="text-2xl font-[900] text-[#0c1024] dark:text-white">3 million+</span>
              </div>
              <div className="border-l border-purple-100 dark:border-purple-900/50 pl-8">
                <span className="text-xs text-slate-400 block">Rewards Distributed</span>
                <span className="text-2xl font-[900] text-[#0c1024] dark:text-white">$314M+</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-12 px-7 rounded-full shadow-md shadow-purple-600/25">
                  Join Discord Community
                </Button>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-purple-100 dark:border-purple-900/50 bg-[#0c1024] text-white p-5 sm:p-7 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-purple-950">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    PN
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>PropNation Community</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      8,435 Online • 220,057 Members
                    </span>
                  </div>
                </div>
                <Badge variant="purple">#rewards-live-updates</Badge>
              </div>

              <div className="space-y-2.5 font-mono text-xs text-slate-300 pt-2">
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-900/50 flex items-center gap-2">
                  <span className="text-purple-300 font-bold shrink-0">🤖 Bot:</span>
                  <span className="truncate">An FP Trader from NL just secured a <strong className="text-purple-300 font-bold">$965.20 reward</strong>! 🔥</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-900/50 flex items-center gap-2">
                  <span className="text-purple-300 font-bold shrink-0">🤖 Bot:</span>
                  <span className="truncate">An FS Trader from DE just claimed an <strong className="text-purple-300 font-bold">Apple Watch Ultra</strong>! 🔥</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-900/50 flex items-center gap-2">
                  <span className="text-purple-300 font-bold shrink-0">🤖 Bot:</span>
                  <span className="truncate">A Pipstone Trader from US just secured a <strong className="text-purple-300 font-bold">$1,250.00 reward</strong>! 🔥</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-900/50 flex items-center gap-2">
                  <span className="text-purple-300 font-bold shrink-0">🤖 Bot:</span>
                  <span className="truncate">An FTMO Trader from UK just claimed a <strong className="text-purple-300 font-bold">MacBook Pro M3</strong>! 🔥</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 10. ECOSYSTEM ADVANTAGE */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-purple-100 dark:border-purple-950/60">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c1024] dark:text-white leading-[1.12]">
              Ecosystem advantage &amp; regulated execution
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Built for traders by traders. The trader-first experience you trust, now available with seamless cashback and automated payouts across all 5 firms.
            </p>

            <div className="space-y-3 pt-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-600 shrink-0" />
                <span>Multiple tier-1 regulatory licenses</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-600 shrink-0" />
                <span>Up to 1:2000 leverage across all 5 firms</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-600 shrink-0" />
                <span>24/5 dedicated human support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-600 shrink-0" />
                <span>Universal referral code: NATION (1$ = 10 PTS)</span>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/prop-firms">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-11 px-7 rounded-full shadow-md shadow-purple-600/25">
                  Start Trading
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-sm rounded-[2.5rem] bg-[#0c1024] text-white p-6 border-4 border-purple-200 dark:border-purple-900/60 shadow-2xl space-y-5 text-left relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-purple-950">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">ACCOUNT BALANCE</span>
                  <div className="text-2xl font-[900] text-white">$21,079.65</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-purple-300 block font-mono">TOTAL PROFIT</span>
                  <div className="text-base font-bold text-purple-300">+$10,931.70</div>
                </div>
              </div>

              <div className="h-24 bg-gradient-to-b from-purple-500/10 to-transparent rounded-xl border-b border-purple-400/40 relative flex items-end">
                <div className="w-full h-1 bg-purple-400 shadow-glow" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="bg-purple-950/40 p-2 rounded-xl border border-purple-900/50">
                  <span className="text-[9px] text-slate-400 block">Win Rate</span>
                  <span className="font-bold text-white">67.0%</span>
                </div>
                <div className="bg-purple-950/40 p-2 rounded-xl border border-purple-900/50">
                  <span className="text-[9px] text-slate-400 block">Avg Win</span>
                  <span className="font-bold text-white">$287.47</span>
                </div>
                <div className="bg-purple-950/40 p-2 rounded-xl border border-purple-900/50">
                  <span className="text-[9px] text-slate-400 block">Volume</span>
                  <span className="font-bold text-white">138.4</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 11. LUXURY REWARDS STORE PREVIEW (Nike, G-Shock, iPhone, Mac) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-purple-100 dark:border-purple-950/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-10">
          <div className="space-y-1 text-left">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Rewards Catalog</span>
            <h2 className="text-3xl sm:text-4xl font-[900] tracking-tight text-[#0c1024] dark:text-white">
              37+ Luxury Physical &amp; Cash Rewards
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Redeemable immediately with your verified reward points (1$ = 10 PTS).
            </p>
          </div>

          <Link href="/rewards">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-md shadow-purple-600/25">
              View All 37 Rewards <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
          {rewards.slice(0, 4).map((reward) => (
            <div
              key={reward.id}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 p-4 space-y-3 hover:border-purple-300 dark:hover:border-purple-700 transition-all shadow-xs group"
            >
              <div className="aspect-square rounded-xl bg-purple-50/40 dark:bg-slate-950 overflow-hidden border border-purple-100 dark:border-purple-900/40">
                <img
                  src={reward.imageUrl}
                  alt={reward.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-purple-500">
                  {reward.category?.name || 'Luxury Gear'}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-purple-600 transition-colors">
                  {reward.name}
                </h4>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-purple-50 dark:border-purple-900/40">
                <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                  {reward.pointsRequired.toLocaleString()} PTS
                </span>
                <Link href={`/rewards/${reward.slug}`}>
                  <span className="text-[11px] font-semibold text-slate-500 hover:text-purple-600 dark:hover:text-white">
                    Claim →
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 12. "BUILDING TRADERS GLOBALLY SINCE 2022" */}
      {/* ======================================================== */}
      <section className="w-full bg-[#080517] text-white py-20 sm:py-28 border-t border-purple-950">
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
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-[900] text-white">200+ employees</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                A global team with decades of market experience driving your trading performance.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center">
                <Globe className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-[900] text-white">5 global offices</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Strategically positioned to support traders across all regions around the world.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center">
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
      {/* 13. DEEP NAVY/PURPLE FAQS: "WHAT IS PROPNATION?" */}
      {/* ======================================================== */}
      <section className="w-full bg-[#050310] text-white py-20 sm:py-28 border-t border-purple-950/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-white">
              What is PropNation?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-normal">
              Learn more about PropNation
            </p>
          </div>

          <div className="space-y-1 text-left divide-y divide-purple-900/40">
            {faqs.map((faq, idx) => (
              <div key={idx} className="py-4 sm:py-5">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-purple-300 transition-colors cursor-pointer text-left"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-purple-400 transition-transform duration-200 shrink-0 ${
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
      {/* 14. FLOATING LIVE CHAT BUBBLE */}
      {/* ======================================================== */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href="/support/live"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white/20 group"
          title="Open Live Chat"
        >
          <MessageSquare className="h-6 w-6 text-white group-hover:scale-105 transition-transform" />
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-purple-300 border-2 border-white animate-pulse" />
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
