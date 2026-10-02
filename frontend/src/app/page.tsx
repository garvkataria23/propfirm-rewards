'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GoogleTranslate } from '@/components/ui/google-translate';
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

  // "How it works?" Stepper & Fanned Cards State
  const [howItWorksStep, setHowItWorksStep] = useState<'account' | 'pass' | 'paid'>('account');
  const [fannedCard, setFannedCard] = useState<'zero' | '1step' | '2step'>('1step');

  // Trade on your terms interactive state
  const [selectedMarket, setSelectedMarket] = useState<'FX' | 'MET' | 'ENG' | 'CRYPTO' | 'IND'>('MET');
  const [selectedPayoutFreq, setSelectedPayoutFreq] = useState<'Weekly' | 'Bi-Weekly' | 'Monthly'>('Bi-Weekly');

  // Pricing Matrix Selection & View Mode
  const [selectedType, setSelectedType] = useState<string>('2step');
  const [selectedSize, setSelectedSize] = useState<string>('5k');
  const [pricingViewMode, setPricingViewMode] = useState<'plans' | 'compare'>('plans');

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
      <div className="w-full bg-[#0d0920] text-white py-2 sm:py-2.5 px-3 sm:px-4 text-center text-xs sm:text-[13px] font-medium tracking-tight border-b border-purple-950">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap sm:flex-nowrap">
          <span className="flex items-center gap-1.5 flex-wrap justify-center text-slate-200">
            <span>Use Code</span>
            <button
              type="button"
              onClick={() => handleCopyCode('NATION')}
              className="font-mono font-bold text-purple-300 bg-purple-950/90 hover:bg-purple-900 px-2 py-0.5 rounded border border-purple-500/40 cursor-pointer flex items-center gap-1 active:scale-95 transition-all text-xs"
              title="Click to copy NATION"
            >
              <span>NATION</span>
              {copiedCode === 'NATION' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-purple-400" />}
            </button>
            <span className="text-purple-200 font-semibold">: 10% OFF New</span>
            <span className="hidden sm:inline text-purple-300 font-semibold">| 5% OFF Existing</span>
          </span>
          <span className="hidden md:inline text-purple-400/50">•</span>
          <span className="hidden md:inline font-bold text-purple-300">
            1$ = 100 Reward Points Across All 5 Prop Firms
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. HERO SECTION (Matching Mobile Reference Screenshot 5) */}
      {/* ======================================================== */}
      <section className="relative w-full pt-6 pb-12 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28 overflow-hidden bg-white dark:bg-[#070913]">
        {/* Soft Ethereal Atmospheric Glows (Light Purple & Violet) */}
        <div className="absolute top-0 right-0 w-[55vw] h-[55vw] max-w-[800px] max-h-[800px] bg-gradient-to-bl from-purple-200/40 via-violet-100/30 to-transparent dark:from-purple-900/20 dark:via-violet-950/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/4 left-0 w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] bg-gradient-to-tr from-violet-100/40 via-purple-100/20 to-transparent dark:from-purple-950/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left / Main Content */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-7 z-10 text-center lg:text-left flex flex-col items-center lg:items-start">
              {/* Trustpilot & Google Review Pill */}
              <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-purple-50 dark:bg-purple-950/60 px-3 py-1 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 border border-purple-200 dark:border-purple-800 shadow-xs max-w-full">
                <div className="flex items-center gap-0.5 text-purple-600 font-bold shrink-0">
                  {'★★★★★'.split('').map((_, i) => (
                    <span key={i} className="text-xs leading-none">★</span>
                  ))}
                </div>
                <span className="font-bold text-[10px] sm:text-[11px] text-slate-900 dark:text-slate-100 truncate">69,611 reviews Trustpilot</span>
                <span className="text-purple-400 font-bold shrink-0">•</span>
                <span className="font-bold text-[10px] sm:text-[11px] text-amber-500 shrink-0">4.8 Google</span>
              </div>

              {/* Headline */}
              <h1 className="text-2xl sm:text-5xl lg:text-[4.25rem] font-[900] tracking-tight text-[#0c1024] dark:text-white leading-[1.12]">
                Turn your trading skills into luxury rewards
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl font-normal">
                Join over 3,000,000 traders in the world&apos;s leading prop firm reward ecosystem. Trade simulated accounts with <strong>FundedSquad, Pipstone, FTMO, FundedNext &amp; FundingPips</strong> and earn 10 reward points per $1 spent.
              </p>

              {/* Universal Code Badge */}
              <div className="inline-flex items-center gap-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 px-3 py-1.5 text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Universal Code:</span>
                <span className="font-mono font-black text-purple-900 dark:text-purple-200 bg-white dark:bg-purple-900/80 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-700">
                  NATION
                </span>
                <span className="font-bold text-purple-700 dark:text-purple-300">1$ = 100 Points Cashback</span>
              </div>

              {/* Dual Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full pt-1">
                <Link href="/prop-firms" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-[#0c1024] hover:bg-[#15253e] text-white px-7 py-3 rounded-full font-bold text-xs sm:text-sm tracking-tight shadow-lg shadow-purple-950/20 transition-all h-11 sm:h-12">
                    Buy Evaluation
                  </Button>
                </Link>
                <Link href="/rewards" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 px-7 py-3 rounded-full font-semibold text-xs sm:text-sm tracking-tight transition-all h-11 sm:h-12 shadow-xs"
                  >
                    Explore Rewards
                  </Button>
                </Link>
              </div>

              {/* Landing Page Language Selector */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Language:</span>
                <GoogleTranslate id="google_translate_landing" compact />
              </div>
            </div>

            {/* Right Visual: 3D Crystal Lightning Art */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-[420px] aspect-square rounded-3xl overflow-hidden border border-purple-100 dark:border-purple-900/60 shadow-2xl bg-gradient-to-b from-purple-50/50 to-white dark:from-slate-900 dark:to-slate-950 group">
                <img
                  src="/propfirm.png"
                  alt="PropFirm Loyalty Rewards"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/40 dark:from-[#070913]/60 via-transparent to-transparent pointer-events-none" />

                {/* Floating prominent badge on hero card */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl rounded-2xl p-3 sm:p-3.5 border-2 border-purple-300/80 dark:border-purple-700/80 shadow-2xl space-y-2">
                  {/* Top row: Partner Code & Copy Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-600/30 shrink-0">
                        <Sparkles className="h-4 w-4 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                          Partner Code
                        </div>
                        <div className="text-base font-black font-mono text-purple-950 dark:text-white tracking-wider leading-none">
                          NATION
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyCode('NATION')}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
                    >
                      {copiedCode === 'NATION' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedCode === 'NATION' ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* High-visibility prominent 1$ = 100 Points text */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500/15 via-violet-500/20 to-indigo-500/15 border border-purple-400/40 dark:border-purple-500/40">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Reward Rate:
                    </span>
                    <span className="text-sm sm:text-base font-black text-purple-700 dark:text-purple-300 font-mono tracking-tight flex items-center gap-1.5">
                      <span className="bg-purple-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs">YIELD</span>
                      <span>1 $ = 100 Points</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal 3-Stat Counter Bar (Exact match of Screenshot 5) */}
          <div className="mt-10 sm:mt-16 pt-6 border-t border-purple-100 dark:border-purple-900/50">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 py-4 px-3 sm:px-6 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-center">
              <div>
                <div className="text-xl sm:text-3xl font-[900] text-[#0c1024] dark:text-white">195+</div>
                <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Countries</div>
              </div>
              <div className="border-x border-purple-200 dark:border-purple-800/60">
                <div className="text-xl sm:text-3xl font-[900] text-[#0c1024] dark:text-white">3M+</div>
                <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Traders</div>
              </div>
              <div>
                <div className="text-xl sm:text-3xl font-[900] text-[#0c1024] dark:text-white">$314M+</div>
                <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Total Rewards</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. HOW IT WORKS & 3 OVERLAPPING FANNED CARDS (Screenshot 1) */}
      {/* ======================================================== */}
      <section className="w-full bg-white dark:bg-[#070913] py-14 sm:py-20 border-t border-purple-100 dark:border-purple-950/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-center">
          {/* Header */}
          <div className="space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block">How it works?</span>
            <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c1024] dark:text-white">
              Every reward paid. Never denied.
            </h2>
          </div>

          {/* Stepper Tabs (Pick your account -> Pass & get funded -> Get Paid) */}
          <div className="flex items-center justify-center gap-3 sm:gap-8 border-b border-purple-100 dark:border-purple-900/60 pb-3 max-w-md mx-auto text-xs sm:text-sm font-bold">
            <button
              onClick={() => setHowItWorksStep('account')}
              className={`pb-2 relative transition-colors cursor-pointer ${
                howItWorksStep === 'account'
                  ? 'text-purple-600 dark:text-purple-400 font-[900]'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              Pick your account
              {howItWorksStep === 'account' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400 rounded-full" />
              )}
            </button>
            <span className="text-slate-300 dark:text-slate-700">→</span>
            <button
              onClick={() => setHowItWorksStep('pass')}
              className={`pb-2 relative transition-colors cursor-pointer ${
                howItWorksStep === 'pass'
                  ? 'text-purple-600 dark:text-purple-400 font-[900]'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              Pass &amp; get funded
              {howItWorksStep === 'pass' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400 rounded-full" />
              )}
            </button>
            <span className="text-slate-300 dark:text-slate-700">→</span>
            <button
              onClick={() => setHowItWorksStep('paid')}
              className={`pb-2 relative transition-colors cursor-pointer ${
                howItWorksStep === 'paid'
                  ? 'text-purple-600 dark:text-purple-400 font-[900]'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              Get Paid
              {howItWorksStep === 'paid' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400 rounded-full" />
              )}
            </button>
          </div>

          {/* 3 Overlapping Fanned Cards Deck (Exact Match of Screenshot 1) */}
          <div className="relative py-8 sm:py-12 max-w-lg mx-auto flex items-center justify-center min-h-[320px]">
            {/* Left Card: Zero (Tilted Left) */}
            <div
              onClick={() => {
                setFannedCard('zero');
                setSelectedType('zero');
              }}
              className={`absolute left-2 sm:left-6 w-44 sm:w-52 rounded-2xl p-4 sm:p-5 border transition-all duration-300 cursor-pointer text-left select-none ${
                fannedCard === 'zero'
                  ? 'z-20 scale-105 bg-[#0c1024] text-white border-purple-500 shadow-2xl -rotate-1'
                  : 'z-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-purple-100 dark:border-purple-900/60 shadow-lg -rotate-6 hover:-rotate-3'
              }`}
            >
              <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Instant funding
              </span>
              <div className="text-2xl sm:text-3xl font-[900] mt-3">Zero</div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">No evaluation phase</p>
              <div className="mt-4 pt-3 border-t border-purple-100 dark:border-purple-900/40 text-xs font-bold text-purple-600 dark:text-purple-400">
                from $60
              </div>
            </div>

            {/* Center Card: One Step FLEX (Active / Lifted Forward) */}
            <div
              onClick={() => {
                setFannedCard('1step');
                setSelectedType('1step');
              }}
              className={`relative z-20 w-48 sm:w-56 rounded-2xl p-5 sm:p-6 border-2 transition-all duration-300 cursor-pointer text-left select-none shadow-2xl ${
                fannedCard === '1step'
                  ? 'scale-105 bg-gradient-to-b from-[#130d2d] to-[#0a071a] text-white border-purple-500 shadow-purple-950/40'
                  : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-purple-200 dark:border-purple-800'
              }`}
            >
              <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-600 text-white shadow-xs">
                1 Day Pass
              </span>
              <div className="text-2xl sm:text-3xl font-[900] mt-3">One Step</div>
              <div className="text-xs font-black tracking-widest text-purple-400 mt-0.5">F L E X</div>
              <p className="text-[10px] text-slate-400 mt-1">Fast single-phase evaluation</p>
              <div className="mt-4 pt-3 border-t border-purple-900/50 flex items-baseline justify-between">
                <span className="text-xs font-bold text-purple-300">from $52</span>
                <span className="text-[9px] font-mono text-purple-400">+520 PTS</span>
              </div>
            </div>

            {/* Right Card: 2 Step (Tilted Right) */}
            <div
              onClick={() => {
                setFannedCard('2step');
                setSelectedType('2step');
              }}
              className={`absolute right-2 sm:right-6 w-44 sm:w-52 rounded-2xl p-4 sm:p-5 border transition-all duration-300 cursor-pointer text-left select-none ${
                fannedCard === '2step'
                  ? 'z-20 scale-105 bg-[#0c1024] text-white border-purple-500 shadow-2xl rotate-1'
                  : 'z-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-purple-100 dark:border-purple-900/60 shadow-lg rotate-6 hover:rotate-3'
              }`}
            >
              <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Classic 2 phases
              </span>
              <div className="text-2xl sm:text-3xl font-[900] mt-3">2 Step</div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Industry standard model</p>
              <div className="mt-4 pt-3 border-t border-purple-100 dark:border-purple-900/40 text-xs font-bold text-purple-600 dark:text-purple-400">
                from $33
              </div>
            </div>
          </div>

          {/* CFD's Glory Days Are Back! & 3 Check Pills (Screenshot 1) */}
          <div className="space-y-4 pt-4 max-w-xl mx-auto">
            <h3 className="text-lg sm:text-xl font-[900] text-[#0c1024] dark:text-white">
              CFD&apos;s Glory Days Are Back!
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-3 py-1.5 rounded-full">
                <Check className="h-3.5 w-3.5 text-purple-600 font-bold" />
                No Striking System
              </span>
              <span className="inline-flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-3 py-1.5 rounded-full">
                <Check className="h-3.5 w-3.5 text-purple-600 font-bold" />
                No Risk Per Trade Idea
              </span>
              <span className="inline-flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-3 py-1.5 rounded-full">
                <Check className="h-3.5 w-3.5 text-purple-600 font-bold" />
                No Profit Concentration
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. PRICING: CHOOSE YOUR CHALLENGE (Screenshots 2 & 3) */}
      {/* ======================================================== */}
      <section className="w-full bg-slate-50/50 dark:bg-[#060814] py-14 sm:py-20 border-t border-purple-100 dark:border-purple-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-center">
          {/* Section Heading */}
          <div className="space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block">Pricing</span>
            <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c1024] dark:text-white">
              Choose your challenge
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal">
              1 Step, 2 Step, or Zero. Multiple routes to match your trading style and budget.
            </p>
          </div>

          {/* Section 1: 1 Challenge Type (3 Selector Cards) */}
          <div className="space-y-3 max-w-xl mx-auto text-left">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              1 Challenge type
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {CHALLENGE_TYPES.map((type) => {
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id);
                      setFannedCard(type.id as 'zero' | '1step' | '2step');
                    }}
                    className={`p-3 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between min-h-[72px] ${
                      isSelected
                        ? 'bg-[#0c1024] text-white shadow-md border-2 border-purple-500'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-purple-100 dark:border-purple-900/60 hover:border-purple-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-purple-400 truncate block">
                      {type.subtitle}
                    </span>
                    <span className="text-sm font-[900] tracking-tight mt-1">
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: 2 Account Size (5 Pills) */}
          <div className="space-y-3 max-w-xl mx-auto text-left">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              2 Account size
            </div>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {ACCOUNT_SIZES.map((size) => {
                const isSelected = selectedSize === size.id;
                return (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.id)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-black transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0c1024] text-white shadow-md border-2 border-purple-500'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-purple-100 dark:border-purple-900/60 hover:bg-purple-50'
                    }`}
                  >
                    {size.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* View Mode Switcher: [Plans] vs [Compare] */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="inline-flex items-center p-1 rounded-full bg-purple-100/70 dark:bg-slate-900 border border-purple-200 dark:border-purple-800">
              <button
                onClick={() => setPricingViewMode('plans')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  pricingViewMode === 'plans'
                    ? 'bg-[#0c1024] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Plans
              </button>
              <button
                onClick={() => setPricingViewMode('compare')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  pricingViewMode === 'compare'
                    ? 'bg-[#0c1024] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Compare
              </button>
            </div>
          </div>

          {/* Plan Cards or Compare Matrix */}
          {pricingViewMode === 'plans' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
              {/* Card 1: Standard */}
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 p-6 sm:p-7 space-y-5 shadow-md flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      Biggest Daily Loss
                    </span>
                    <span className="text-xs font-bold text-slate-400">Standard</span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-2xl font-[900] text-[#0c1024] dark:text-white">
                      Standard {selectedSize.toUpperCase()}
                    </div>
                    <div className="flex items-baseline gap-1.5 pt-1">
                      <span className="text-3xl font-[900] text-slate-900 dark:text-white">${currentMatrix.standard.price}</span>
                      <span className="text-xs text-slate-400 font-mono">USD</span>
                    </div>
                    <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                      +{currentMatrix.standard.points} PTS Earned with Code NATION
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 border-t border-purple-100 dark:border-purple-900/40 pt-4">
                    <div className="flex justify-between"><span>Profit Target:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.standard.target}</strong></div>
                    <div className="flex justify-between"><span>Daily Loss:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.standard.dailyLoss}</strong></div>
                    <div className="flex justify-between"><span>Max Loss:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.standard.maxLoss}</strong></div>
                    <div className="flex justify-between"><span>Min Days:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.standard.minDays}</strong></div>
                    <div className="flex justify-between"><span>Split:</span><strong className="text-purple-600 dark:text-purple-400 font-bold">{currentMatrix.standard.split}</strong></div>
                  </div>
                </div>

                <Link href="/prop-firms" className="pt-2">
                  <Button className="w-full bg-[#0c1024] hover:bg-[#1a223f] text-white font-bold text-xs h-11 rounded-xl">
                    Buy ${currentMatrix.standard.price}
                  </Button>
                </Link>
              </div>

              {/* Card 2: FLEX (Highlighted / Lowest Profit Target) */}
              <div className="rounded-3xl bg-gradient-to-b from-purple-50/60 to-white dark:from-purple-950/40 dark:to-slate-900 border-2 border-purple-500 p-6 sm:p-7 space-y-5 shadow-xl relative flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-purple-600 text-white shadow-xs">
                      Lowest Profit Target
                    </span>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">FLEX</span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-2xl font-[900] text-[#0c1024] dark:text-white">
                      F L E X {selectedSize.toUpperCase()}
                    </div>
                    <div className="flex items-baseline gap-1.5 pt-1">
                      <span className="text-3xl font-[900] text-purple-600 dark:text-purple-400">${currentMatrix.flex.price}</span>
                      <span className="text-xs text-slate-400 font-mono">USD</span>
                    </div>
                    <div className="text-[11px] font-bold text-purple-600 dark:text-purple-300">
                      +{currentMatrix.flex.points} PTS Earned with Code NATION
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 border-t border-purple-200 dark:border-purple-800/40 pt-4">
                    <div className="flex justify-between"><span>Profit Target:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.flex.target}</strong></div>
                    <div className="flex justify-between"><span>Daily Loss:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.flex.dailyLoss}</strong></div>
                    <div className="flex justify-between"><span>Max Loss:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.flex.maxLoss}</strong></div>
                    <div className="flex justify-between"><span>Min Days:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.flex.minDays}</strong></div>
                    <div className="flex justify-between"><span>Split:</span><strong className="text-purple-600 dark:text-purple-400 font-bold">{currentMatrix.flex.split}</strong></div>
                  </div>
                </div>

                <Link href="/prop-firms" className="pt-2">
                  <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs h-11 rounded-xl shadow-md shadow-purple-600/25">
                    Buy ${currentMatrix.flex.price}
                  </Button>
                </Link>
              </div>

              {/* Card 3: Pro (Biggest Max Loss) */}
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 p-6 sm:p-7 space-y-5 shadow-md flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      Biggest Max Loss
                    </span>
                    <span className="text-xs font-bold text-slate-400 font-mono">PRO</span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-2xl font-[900] text-[#0c1024] dark:text-white">
                      PRO {selectedSize.toUpperCase()}
                    </div>
                    <div className="flex items-baseline gap-1.5 pt-1">
                      <span className="text-3xl font-[900] text-slate-900 dark:text-white">${currentMatrix.pro.price}</span>
                      <span className="text-xs text-slate-400 font-mono">USD</span>
                    </div>
                    <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                      +{currentMatrix.pro.points} PTS Earned with Code NATION
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 border-t border-purple-100 dark:border-purple-900/40 pt-4">
                    <div className="flex justify-between"><span>Profit Target:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.pro.target}</strong></div>
                    <div className="flex justify-between"><span>Daily Loss:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.pro.dailyLoss}</strong></div>
                    <div className="flex justify-between"><span>Max Loss:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.pro.maxLoss}</strong></div>
                    <div className="flex justify-between"><span>Min Days:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.pro.minDays}</strong></div>
                    <div className="flex justify-between"><span>Split:</span><strong className="text-purple-600 dark:text-purple-400 font-bold">{currentMatrix.pro.split}</strong></div>
                  </div>
                </div>

                <Link href="/prop-firms" className="pt-2">
                  <Button className="w-full bg-[#0c1024] hover:bg-[#1a223f] text-white font-bold text-xs h-11 rounded-xl">
                    Buy ${currentMatrix.pro.price}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Comparison Table View */
            <div className="max-w-4xl mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 p-5 sm:p-6 overflow-x-auto shadow-lg text-left">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-purple-100 dark:border-purple-900/60 text-slate-400">
                    <th className="py-3 px-3 text-left font-bold">Metric</th>
                    <th className="py-3 px-3 text-left font-bold text-slate-900 dark:text-white">Standard</th>
                    <th className="py-3 px-3 text-left font-bold text-purple-600 dark:text-purple-400">FLEX</th>
                    <th className="py-3 px-3 text-left font-bold text-slate-900 dark:text-white">PRO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50 dark:divide-purple-950/60 font-medium">
                  <tr>
                    <td className="py-3 px-3 text-slate-500">Price (USD)</td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">${currentMatrix.standard.price}</td>
                    <td className="py-3 px-3 font-bold text-purple-600 dark:text-purple-400">${currentMatrix.flex.price}</td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">${currentMatrix.pro.price}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 text-slate-500">Cashback Points</td>
                    <td className="py-3 px-3 font-bold text-purple-600">+{currentMatrix.standard.points} PTS</td>
                    <td className="py-3 px-3 font-bold text-purple-600">+{currentMatrix.flex.points} PTS</td>
                    <td className="py-3 px-3 font-bold text-purple-600">+{currentMatrix.pro.points} PTS</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 text-slate-500">Profit Target</td>
                    <td className="py-3 px-3">{currentMatrix.standard.target}</td>
                    <td className="py-3 px-3 font-bold text-purple-600">{currentMatrix.flex.target}</td>
                    <td className="py-3 px-3">{currentMatrix.pro.target}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 text-slate-500">Daily Loss</td>
                    <td className="py-3 px-3">{currentMatrix.standard.dailyLoss}</td>
                    <td className="py-3 px-3">{currentMatrix.flex.dailyLoss}</td>
                    <td className="py-3 px-3">{currentMatrix.pro.dailyLoss}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 text-slate-500">Max Loss</td>
                    <td className="py-3 px-3">{currentMatrix.standard.maxLoss}</td>
                    <td className="py-3 px-3">{currentMatrix.flex.maxLoss}</td>
                    <td className="py-3 px-3">{currentMatrix.pro.maxLoss}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 text-slate-500">Min Trading Days</td>
                    <td className="py-3 px-3">{currentMatrix.standard.minDays}</td>
                    <td className="py-3 px-3 font-bold text-purple-600">{currentMatrix.flex.minDays}</td>
                    <td className="py-3 px-3">{currentMatrix.pro.minDays}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 text-slate-500">Profit Split</td>
                    <td className="py-3 px-3 font-bold text-purple-600">{currentMatrix.standard.split}</td>
                    <td className="py-3 px-3 font-bold text-purple-600">{currentMatrix.flex.split}</td>
                    <td className="py-3 px-3 font-bold text-purple-600">{currentMatrix.pro.split}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. TRADER'S JOURNEY CASE STUDY (Screenshot 3) */}
      {/* ======================================================== */}
      <section className="w-full bg-white dark:bg-[#070913] py-14 sm:py-20 border-t border-purple-100 dark:border-purple-950/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-2xl sm:text-4xl font-[900] tracking-tight text-[#0c1024] dark:text-white">
              Trader&apos;s Journey
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Case study • 4 Jul → 21 Jul • $100K 2 Step Pro
            </p>
          </div>

          {/* Timeline Card */}
          <div className="rounded-3xl border border-purple-100 dark:border-purple-900/60 bg-purple-50/30 dark:bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-md text-left">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6 relative">
              {/* Step 1 */}
              <div className="space-y-2 relative pb-4 sm:pb-0 border-b sm:border-b-0 sm:border-r border-purple-100 dark:border-purple-900/40 pr-2">
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 block font-mono">Jul 4</span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">Evaluation Purchased</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">$100K 2 Step Pro</p>
                <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">$466</div>
              </div>

              {/* Step 2 */}
              <div className="space-y-2 relative pb-4 sm:pb-0 border-b sm:border-b-0 sm:border-r border-purple-100 dark:border-purple-900/40 pr-2">
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 block font-mono">Jul 4</span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">Phase 1 Passed</h4>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600">
                  <Check className="h-3 w-3" /> Clear
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Same day</div>
              </div>

              {/* Step 3 */}
              <div className="space-y-2 relative pb-4 sm:pb-0 border-b sm:border-b-0 sm:border-r border-purple-100 dark:border-purple-900/40 pr-2">
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 block font-mono">Jul 9</span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">Phase 2 Passed</h4>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600">
                  <Check className="h-3 w-3" /> Funded
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">5 days after Phase 1</div>
              </div>

              {/* Step 4 */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 block font-mono">Jul 21</span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">First Reward</h4>
                <div className="text-base font-black text-purple-600 dark:text-purple-400 font-mono">
                  $4,050.90
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Via Rise in 9 hrs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. TRADER ROI BANNER & VIDEO SUCCESS STORIES (Screenshot 4) */}
      {/* ======================================================== */}
      <section className="w-full bg-[#0c0920] text-white py-14 sm:py-20 border-t border-purple-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Big ROI Card (Exact Match of Screenshot 4) */}
          <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-[#170e3a] via-[#120a2e] to-[#0c0920] border-2 border-purple-500/50 p-6 sm:p-10 shadow-2xl space-y-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="text-4xl sm:text-6xl font-[900] text-purple-300 tracking-tight font-mono">
                  ROI 5,531%
                </div>
                <div className="text-base sm:text-lg font-bold text-white font-mono">
                  $466 → $26,242
                </div>
                <div className="text-xs sm:text-sm text-purple-200/80 font-medium">
                  ★★★★★ &quot;Best of the best&quot; — Majed M.
                </div>
              </div>

              <Link href="/prop-firms" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm px-8 py-3.5 h-12 rounded-full shadow-lg shadow-purple-600/30">
                  Buy Challenge
                </Button>
              </Link>
            </div>
          </div>

          {/* Real Traders, Real Rewards, Real Impact Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1 text-left">
              <h3 className="text-2xl sm:text-4xl font-[900] text-white tracking-tight">
                Real traders, real rewards, real impact
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Hear it directly from traders who passed their challenge and received their reward...
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setStoryScrollIdx((prev) => Math.max(0, prev - 1))}
                className="p-2 rounded-full border border-purple-800 bg-slate-900 hover:bg-purple-900/60 transition-colors"
                title="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setStoryScrollIdx((prev) => Math.min(SUCCESS_STORIES.length - 1, prev + 1))}
                className="p-2 rounded-full border border-purple-800 bg-slate-900 hover:bg-purple-900/60 transition-colors"
                title="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Swipeable Track (Mobile Snap Scroll) */}
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 text-left">
            {SUCCESS_STORIES.map((story, idx) => (
              <div
                key={idx}
                className="min-w-[280px] sm:min-w-[320px] max-w-[320px] snap-center rounded-2xl overflow-hidden border border-purple-900/60 bg-[#120a2e] text-white p-5 space-y-4 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between shrink-0"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold text-purple-300">
                    <span className="uppercase tracking-widest">{story.badge}</span>
                    <span className="bg-purple-950/90 px-2 py-0.5 rounded border border-purple-500/30 text-white font-mono">
                      {story.firm}
                    </span>
                  </div>

                  <div className="text-2xl sm:text-3xl font-[900] text-purple-300 tracking-tight font-mono">
                    {story.amount}
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 line-clamp-2 leading-snug">
                    {story.title}
                  </h4>
                  <p className="text-[10px] text-slate-400">{story.coach}</p>
                </div>

                <div className="pt-3 border-t border-purple-950 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                    {story.trader}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-purple-400">
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
      {/* 7. OFFICIAL PARTNER PROP FIRMS DIRECTORY (All 5 Listed Firms) */}
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
      {/* ======================================================== */}
      {/* 8. "TRADE ON YOUR TERMS" (Screenshots 1, 2, 3) */}
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
          {/* Card 1: 5 Markets (Screenshot 1) */}
          <div className="rounded-3xl bg-slate-50/70 dark:bg-slate-900/60 border border-purple-100 dark:border-purple-900/50 p-6 sm:p-8 space-y-6 flex flex-col justify-between hover:border-purple-300 transition-colors shadow-xs">
            <div className="space-y-6">
              {/* Radar Graphic */}
              <div className="h-44 rounded-2xl bg-gradient-to-b from-purple-50/40 to-white dark:from-slate-950 dark:to-slate-900 border border-purple-100 dark:border-purple-900/60 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Subtle blueprint grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_14px]" />

                {/* Radar circular rings & connecting lines */}
                <div className="relative flex items-center justify-center w-full">
                  <div className="absolute w-28 h-28 rounded-full border border-purple-200/60 dark:border-purple-800/40 pointer-events-none animate-pulse" />
                  <div className="absolute w-36 h-36 rounded-full border border-purple-100/40 dark:border-purple-900/20 pointer-events-none" />

                  {/* Peripheral market icons */}
                  <div className="flex items-center justify-center gap-3 sm:gap-4 z-10">
                    <button
                      onClick={() => setSelectedMarket('FX')}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                        selectedMarket === 'FX'
                          ? 'bg-purple-600 text-white shadow-md scale-105'
                          : 'bg-white dark:bg-slate-800 text-slate-500 border border-purple-100 dark:border-purple-900/60'
                      }`}
                    >
                      FX
                    </button>
                    <button
                      onClick={() => setSelectedMarket('MET')}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                        selectedMarket === 'MET'
                          ? 'bg-purple-600 text-white shadow-md scale-105'
                          : 'bg-white dark:bg-slate-800 text-slate-500 border border-purple-100 dark:border-purple-900/60'
                      }`}
                    >
                      MET
                    </button>

                    {/* Center Active Navy Square with Chart */}
                    <div className="h-14 w-14 rounded-2xl bg-[#0c1024] dark:bg-purple-600 text-white flex items-center justify-center font-bold shadow-xl border-2 border-purple-400/40 relative z-20">
                      <CandlestickChart className="h-7 w-7 text-purple-300" />
                    </div>

                    <button
                      onClick={() => setSelectedMarket('CRYPTO')}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                        selectedMarket === 'CRYPTO'
                          ? 'bg-purple-600 text-white shadow-md scale-105'
                          : 'bg-white dark:bg-slate-800 text-slate-500 border border-purple-100 dark:border-purple-900/60'
                      }`}
                    >
                      BTC
                    </button>
                    <button
                      onClick={() => setSelectedMarket('IND')}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                        selectedMarket === 'IND'
                          ? 'bg-purple-600 text-white shadow-md scale-105'
                          : 'bg-white dark:bg-slate-800 text-slate-500 border border-purple-100 dark:border-purple-900/60'
                      }`}
                    >
                      US30
                    </button>
                  </div>
                </div>

                {/* Market Name Pill below radar */}
                <div className="mt-3 z-10">
                  <span className="px-3 py-0.5 rounded-full bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 text-[11px] font-bold border border-purple-200 dark:border-purple-800 shadow-2xs">
                    {selectedMarket === 'MET' && 'Metals'}
                    {selectedMarket === 'FX' && 'Forex Currencies'}
                    {selectedMarket === 'ENG' && 'Energies & Oil'}
                    {selectedMarket === 'CRYPTO' && 'Crypto & Bitcoin'}
                    {selectedMarket === 'IND' && 'Global Indices'}
                  </span>
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

          {/* Card 2: 3 Platforms (Screenshot 3) */}
          <div className="rounded-3xl bg-slate-50/70 dark:bg-slate-900/60 border border-purple-100 dark:border-purple-900/50 p-6 sm:p-8 space-y-6 flex flex-col justify-between hover:border-purple-300 transition-colors shadow-xs">
            <div className="space-y-6">
              {/* 3 Platform Logos */}
              <div className="h-44 rounded-2xl bg-gradient-to-b from-purple-50/40 to-white dark:from-slate-950 dark:to-slate-900 border border-purple-100 dark:border-purple-900/60 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_14px]" />

                <div className="flex items-center justify-center gap-3 sm:gap-4 z-10">
                  {/* MetaTrader 5 */}
                  <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-800/60 flex flex-col items-center justify-center p-1.5 shadow-md hover:scale-105 transition-transform">
                    <div className="flex items-center gap-0.5 mb-0.5">
                      <span className="h-2 w-2 rounded-full bg-purple-600" />
                      <span className="h-2 w-2 rounded-full bg-indigo-500" />
                      <span className="h-2 w-2 rounded-full bg-violet-600" />
                    </div>
                    <span className="text-[10px] font-black text-slate-800 dark:text-white">MT5</span>
                  </div>

                  {/* cTrader */}
                  <div className="h-16 w-16 rounded-2xl bg-[#0c1024] text-white border-2 border-purple-400/50 flex flex-col items-center justify-center p-2 shadow-xl scale-105">
                    <div className="h-6 w-6 rounded-full border-2 border-purple-300 border-t-transparent animate-spin-slow flex items-center justify-center mb-0.5">
                      <span className="text-[10px] font-black text-white">c</span>
                    </div>
                    <span className="text-[9px] font-bold tracking-tight text-purple-200">cTrader</span>
                  </div>

                  {/* DXtrade / Tradin */}
                  <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-800/60 flex flex-col items-center justify-center p-1.5 shadow-md hover:scale-105 transition-transform">
                    <Sparkles className="h-4 w-4 text-purple-600 mb-0.5" />
                    <span className="text-[9px] font-black text-slate-800 dark:text-white">Tradin</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-[900] text-[#0c1024] dark:text-white">3 Platforms.</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Used by retail brokers, proprietary trading firms, and individual investors.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Get Paid Your Way (Screenshot 2) */}
          <div className="rounded-3xl bg-slate-50/70 dark:bg-slate-900/60 border border-purple-100 dark:border-purple-900/50 p-6 sm:p-8 space-y-6 flex flex-col justify-between hover:border-purple-300 transition-colors shadow-xs">
            <div className="space-y-6">
              {/* Circuit & Payout Pills Graphic */}
              <div className="h-44 rounded-2xl bg-gradient-to-b from-purple-50/40 to-white dark:from-slate-950 dark:to-slate-900 border border-purple-100 dark:border-purple-900/60 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_14px]" />

                {/* Circuit line leading to dark navy vault/wallet */}
                <div className="h-6 w-0.5 bg-gradient-to-b from-transparent to-purple-400 mb-1" />
                <div className="h-12 w-12 rounded-2xl bg-[#0c1024] text-white flex items-center justify-center shadow-lg border border-purple-500/40 z-10 mb-3">
                  <Wallet className="h-5 w-5 text-purple-300" />
                </div>

                {/* Payout Options: Weekly, Bi-Weekly, Monthly */}
                <div className="flex items-center gap-1.5 z-10">
                  <button
                    onClick={() => setSelectedPayoutFreq('Weekly')}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                      selectedPayoutFreq === 'Weekly'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-500 border border-purple-100 dark:border-purple-900/60'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setSelectedPayoutFreq('Bi-Weekly')}
                    className={`px-3.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                      selectedPayoutFreq === 'Bi-Weekly'
                        ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-300 dark:ring-purple-700'
                        : 'bg-white dark:bg-slate-800 text-slate-500 border border-purple-100 dark:border-purple-900/60'
                    }`}
                  >
                    Bi-Weekly
                  </button>
                  <button
                    onClick={() => setSelectedPayoutFreq('Monthly')}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                      selectedPayoutFreq === 'Monthly'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-500 border border-purple-100 dark:border-purple-900/60'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-[900] text-[#0c1024] dark:text-white">Get Paid your way.</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Balancing quick access to capital with overall account growth strategy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. "YOUR SKILL IS OUR CAPITAL" (Screenshot 2) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-12 border-t border-purple-100 dark:border-purple-950/60">
        <div className="space-y-3 max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c1024] dark:text-white">
            Your skill is our capital
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-normal">
            A structured path from proving your edge in sim to trading PRIME capital.
          </p>
        </div>

        {/* 01, 02, 03 Numbered Cards (Screenshot 2) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left max-w-5xl mx-auto">
          {/* Card 01 */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 p-6 sm:p-7 space-y-3 shadow-md hover:border-purple-300 transition-all flex items-start gap-4">
            <span className="text-3xl sm:text-4xl font-[900] text-purple-600 dark:text-purple-400 font-mono shrink-0">
              01
            </span>
            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-[900] text-[#0c1024] dark:text-white">Prove your edge</h4>
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                On Sim &amp; grow with PRIME
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                Complete evaluation objectives with zero hidden drawdown tricks.
              </p>
            </div>
          </div>

          {/* Card 02 */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 p-6 sm:p-7 space-y-3 shadow-md hover:border-purple-300 transition-all flex items-start gap-4">
            <span className="text-3xl sm:text-4xl font-[900] text-purple-600 dark:text-purple-400 font-mono shrink-0">
              02
            </span>
            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-[900] text-[#0c1024] dark:text-white">Scale PRIME capital</h4>
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                Scale all the way to $2M allocation
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                Compounding simulated rewards and higher profit splits up to 95%.
              </p>
            </div>
          </div>

          {/* Card 03 */}
          <div className="rounded-3xl bg-gradient-to-br from-[#120a2e] to-[#0c0920] text-white border-2 border-purple-500/50 p-6 sm:p-7 space-y-3 shadow-xl flex items-start gap-4">
            <span className="text-3xl sm:text-4xl font-[900] text-purple-300 font-mono shrink-0">
              03
            </span>
            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-[900] text-white flex items-center gap-1.5">
                <span>Become a fund manager</span>
                <Crown className="h-4 w-4 text-amber-400" />
              </h4>
              <p className="text-xs font-semibold text-purple-300">
                Earn performance fees with VIP perks
              </p>
              <p className="text-xs text-slate-300 pt-1">
                Earn directly from investor capital with lifetime VIP rewards.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Pills & Buttons */}
        <div className="space-y-6 pt-2">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
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
              <Button className="bg-[#0c1024] hover:bg-[#15253e] dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-bold text-xs h-11 px-7 rounded-full shadow-md">
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
      {/* 10. "BUILT BY TRADERS FOR TRADERS" (Screenshot 5) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-10 border-t border-purple-100 dark:border-purple-950/60">
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c1024] dark:text-white">
            Built by traders for traders
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            At PropNation we don&apos;t just elevate traders. We build them.
          </p>
        </div>

        {/* 2-Stat Row: Active Traders 3M+ | Paid Out $314M+ (Screenshot 5) */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-center py-2">
          <div>
            <div className="text-xs text-slate-400 font-medium">Active traders</div>
            <div className="text-3xl sm:text-4xl font-[900] text-[#0c1024] dark:text-white mt-1">3M+</div>
          </div>
          <div className="border-l border-purple-200 dark:border-purple-800">
            <div className="text-xs text-slate-400 font-medium">Paid out</div>
            <div className="text-3xl sm:text-4xl font-[900] text-[#0c1024] dark:text-white mt-1">$314M+</div>
          </div>
        </div>

        {/* 3 Content Cards Grid (Screenshot 5: TradinTV Top, 2 Bottom) */}
        <div className="max-w-5xl mx-auto space-y-4 text-left">
          {/* Top Full-Width Card: TradinTV */}
          <div className="relative rounded-3xl overflow-hidden aspect-[16/9] sm:aspect-[21/9] border border-purple-100 dark:border-purple-900/60 shadow-xl group cursor-pointer bg-slate-900">
            <img
              src="/fundingpips-masterclass.jpg"
              alt="TradinTV"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09071c] via-[#09071c]/40 to-transparent pointer-events-none" />

            {/* Bottom-left text overlay */}
            <div className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8 z-10 space-y-1">
              <h3 className="text-2xl sm:text-4xl font-[900] text-white tracking-tight">
                TradinTV
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Watch real traders execute live
              </p>
            </div>

            {/* Top right play icon */}
            <div className="absolute top-5 right-5 sm:top-8 sm:right-8 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-lg group-hover:scale-110 transition-transform">
              <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-white text-white ml-0.5" />
            </div>
          </div>

          {/* Bottom 2 Cards (Side-by-side on mobile & desktop) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Left: Trading Psychology */}
            <div className="relative rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-[16/10] border border-purple-100 dark:border-purple-900/60 shadow-lg group cursor-pointer bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80"
                alt="Trading Psychology Coach Paulina"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09071c] via-[#09071c]/50 to-transparent pointer-events-none" />

              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-10 space-y-0.5">
                <h4 className="text-sm sm:text-lg font-[900] text-white">
                  Trading Psychology
                </h4>
                <p className="text-[10px] sm:text-xs text-slate-300 font-medium line-clamp-2">
                  Master the habits &amp; mindset behind performance
                </p>
              </div>
            </div>

            {/* Right: Beyond the Charts */}
            <div className="relative rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-[16/10] border border-purple-100 dark:border-purple-900/60 shadow-lg group cursor-pointer bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80"
                alt="Beyond the Charts"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09071c] via-[#09071c]/50 to-transparent pointer-events-none" />

              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-10 space-y-0.5">
                <h4 className="text-sm sm:text-lg font-[900] text-white">
                  Beyond the Charts
                </h4>
                <p className="text-[10px] sm:text-xs text-slate-300 font-medium line-clamp-2">
                  Understand what truly moves the market
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 11. DISCORD COMMUNITY & LIVE FEED (Screenshot 4) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-purple-100 dark:border-purple-950/60 text-center space-y-8">
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-[900] tracking-tight text-[#0c1024] dark:text-white leading-[1.14]">
            Learn, grow and connect with traders worldwide, traders from 195 countries trust our platform
          </h2>
        </div>

        {/* Discord Tablet Mockup (Screenshot 4) */}
        <div className="max-w-2xl mx-auto rounded-3xl border-4 border-slate-200 dark:border-purple-900/60 bg-[#0e0924] text-white p-4 sm:p-6 shadow-2xl space-y-4 text-left relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-purple-900/60">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
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
            <Badge variant="purple" className="text-[10px]">#rewards-live-updates</Badge>
          </div>

          {/* Live Rewards Bot Feed */}
          <div className="space-y-2 font-mono text-[11px] sm:text-xs text-slate-300">
            <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-900/50 flex items-center gap-2">
              <span className="text-purple-300 font-bold shrink-0">🤖 Bot:</span>
              <span className="truncate">An FP Trader from NL just secured a <strong className="text-purple-300 font-bold">$965.20 reward</strong>! 🔥</span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-900/50 flex items-center gap-2">
              <span className="text-purple-300 font-bold shrink-0">🤖 Bot:</span>
              <span className="truncate">An FS Trader from DE just claimed an <strong className="text-purple-300 font-bold">Apple Watch Ultra</strong>! 🔥</span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-900/50 flex items-center gap-2">
              <span className="text-purple-300 font-bold shrink-0">🤖 Bot:</span>
              <span className="truncate">A Pipstone Trader from US just secured a <strong className="text-purple-300 font-bold">$1,250.00 reward</strong>! 🔥</span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-900/50 flex items-center gap-2">
              <span className="text-purple-300 font-bold shrink-0">🤖 Bot:</span>
              <span className="truncate">An FTMO Trader from UK just claimed a <strong className="text-purple-300 font-bold">MacBook Pro M3</strong>! 🔥</span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-900/50 flex items-center gap-2">
              <span className="text-purple-300 font-bold shrink-0">🤖 Bot:</span>
              <span className="truncate">An FP Trader from IN just secured a <strong className="text-purple-300 font-bold">$540.00 reward</strong>! 🔥</span>
            </div>
          </div>
        </div>

        {/* Join Discord Full-Width Button (Screenshot 4) */}
        <div className="max-w-md mx-auto pt-2">
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button className="w-full bg-[#0c1024] hover:bg-[#15253e] dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-bold text-sm h-12 rounded-xl shadow-lg">
              Join Discord
            </Button>
          </a>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 12. LUXURY REWARDS STORE PREVIEW (Nike, G-Shock, iPhone, Mac) */}
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
                    Claim &rarr;
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 13. "MEET TRADIN®, OUR REGULATED BROKER" (Screenshot 1 Replicated) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-purple-100 dark:border-purple-950/60">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c1024] dark:text-white leading-[1.12]">
              Meet Tradin&reg;, our regulated broker
            </h2>

            {/* Checklist with circular light blue checkmarks (Screenshot 1) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0c1024] dark:text-white">Swap-Free</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Trade without overnight fees or interest.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0c1024] dark:text-white">Raw Account</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Trading account with raw spreads.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0c1024] dark:text-white">Standard Account</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">For traders starting with standard conditions.</p>
                </div>
              </div>
            </div>

            {/* Desktop feature pills */}
            <div className="hidden sm:grid grid-cols-2 gap-3 text-left pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Shield className="h-4 w-4 text-blue-500 shrink-0" />
                <span>Multiple regulatory licences</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <TrendingUp className="h-4 w-4 text-blue-500 shrink-0" />
                <span>Tight spreads</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <MessageSquare className="h-4 w-4 text-blue-500 shrink-0" />
                <span>24/5 human support</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Scale className="h-4 w-4 text-blue-500 shrink-0" />
                <span>Up to 1:2000 leverage</span>
              </div>
            </div>

            <div className="hidden sm:block pt-2">
              <Link href="/prop-firms">
                <Button className="bg-[#0c1024] hover:bg-[#182346] text-white font-bold text-xs h-11 px-7 rounded-xl shadow-md">
                  Explore Tradin&reg;
                </Button>
              </Link>
            </div>
          </div>

          {/* Smartphone Frame (Screenshot 1 Exact Replicating) */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="w-full max-w-[340px] rounded-[2.8rem] bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 p-2.5 shadow-2xl border-4 border-slate-300 dark:border-slate-700">
              <div className="rounded-[2.2rem] bg-[#0c1024] text-white p-5 pt-3 overflow-hidden relative shadow-inner">
                {/* Dynamic Island / Status Bar */}
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 pb-2">
                  <span>16:50</span>
                  <div className="h-3.5 w-16 rounded-full bg-black mx-auto" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px]">5G</span>
                    <div className="h-2.5 w-5 border border-slate-400 rounded-xs p-0.5 flex items-center">
                      <div className="h-full w-full bg-slate-300 rounded-2xs" />
                    </div>
                  </div>
                </div>

                {/* App Header */}
                <div className="flex items-center justify-between pt-2 pb-4 text-xs">
                  <div className="flex items-center gap-1 text-slate-300 font-semibold">
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Standard</span>
                    <span className="text-[10px] text-slate-500 font-mono">#20010831</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Live
                    </span>
                    <span className="text-slate-400 font-bold">+</span>
                    <span className="h-3.5 w-3.5 rounded-full border border-slate-500 text-[9px] flex items-center justify-center text-slate-400">
                      i
                    </span>
                  </div>
                </div>

                {/* Balance & Performance */}
                <div className="space-y-0.5 text-left">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">BALANCE</span>
                  <div className="text-3xl font-[900] text-white tracking-tight">$14,920.00</div>
                  <span className="text-xs font-bold text-emerald-400 block">+49.20% all time</span>
                </div>

                {/* Smooth Chart Line Wave */}
                <div className="h-28 mt-4 relative flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" fill="none">
                    <defs>
                      <linearGradient id="phoneChartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,85 Q60,80 120,65 T240,30 T300,10"
                      stroke="#38bdf8"
                      strokeWidth="3"
                      fill="none"
                    />
                    <path
                      d="M0,85 Q60,80 120,65 T240,30 T300,10 L300,100 L0,100 Z"
                      fill="url(#phoneChartGradient)"
                    />
                    <circle cx="120" cy="65" r="3.5" fill="#38bdf8" />
                  </svg>
                </div>

                {/* Tradin Logo at bottom */}
                <div className="pt-3 pb-1 flex items-center justify-center gap-1.5 text-center">
                  <span className="font-serif text-lg font-black italic text-sky-400">T</span>
                  <span className="text-sm font-black tracking-tight text-white">
                    Tradin<span className="text-[9px] font-normal align-super ml-0.5">&reg;</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile-only feature badges below phone (Screenshot 1) */}
            <div className="sm:hidden w-full max-w-[340px] pt-5 space-y-4">
              <div className="grid grid-cols-2 gap-2 text-left">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  <Shield className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span>Multiple regulatory licences</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span>Tight spreads</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  <MessageSquare className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span>24/5 human support</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  <Scale className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span>Up to 1:2000 leverage</span>
                </div>
              </div>

              <Link href="/prop-firms" className="block">
                <Button className="w-full bg-[#0c1024] hover:bg-[#182346] text-white font-bold text-xs h-11 rounded-xl shadow-md">
                  Explore Tradin&reg;
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 14. "BUILDING TRADERS GLOBALLY SINCE 2022" (Screenshot 2 Replicated) */}
      {/* ======================================================== */}
      <section className="w-full bg-[#060a17] text-white py-16 sm:py-24 border-t border-slate-900 text-center space-y-10">
        <div className="space-y-1.5 max-w-xl mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-white">
            Building Traders Globally
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-semibold tracking-wider">
            Since 2022
          </p>
        </div>

        {/* 3 Stats with Dividers: 200+ Employees | 5 Global Offices | 24/7 Human Support */}
        <div className="grid grid-cols-3 divide-x divide-slate-800 max-w-lg mx-auto text-center px-4">
          <div className="px-2">
            <div className="text-2xl sm:text-4xl font-[900] text-white">200+</div>
            <div className="text-[11px] sm:text-xs text-slate-400 mt-1">Employees</div>
          </div>
          <div className="px-2">
            <div className="text-2xl sm:text-4xl font-[900] text-white">5</div>
            <div className="text-[11px] sm:text-xs text-slate-400 mt-1">Global Offices</div>
          </div>
          <div className="px-2">
            <div className="text-2xl sm:text-4xl font-[900] text-white">24/7</div>
            <div className="text-[11px] sm:text-xs text-slate-400 mt-1">Human Support</div>
          </div>
        </div>

        <div className="pt-2">
          <Link href="/announcements">
            <Button className="bg-white hover:bg-slate-100 text-[#0c1024] font-bold text-xs h-11 px-8 rounded-xl shadow-md">
              Our stories
            </Button>
          </Link>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 15. DEEP NAVY FAQS: "WHAT IS PROPNATION?" (Screenshots 3 & 4 Replicated) */}
      {/* ======================================================== */}
      <section className="w-full bg-[#05091c] text-white py-20 sm:py-28 border-t border-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-10">
          <div className="space-y-1.5">
            <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-white">
              What is PropNation?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-normal">
              Learn more about PropNation
            </p>
          </div>

          <div className="space-y-0 text-left divide-y divide-slate-800">
            {faqs.map((faq, idx) => (
              <div key={idx} className="py-4 sm:py-5">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-sky-300 transition-colors cursor-pointer text-left"
                >
                  <span className="pr-2">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      openFaq === idx ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="pt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 16. FLOATING LIVE CHAT BUBBLE (Screenshots Blue Floating Bubble) */}
      {/* ======================================================== */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href="/support/live"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#113264] hover:bg-[#1a478b] text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white/20 group"
          title="Open Live Chat"
        >
          <MessageSquare className="h-6 w-6 text-white group-hover:scale-105 transition-transform" />
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-sky-400 border-2 border-white animate-pulse" />
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
