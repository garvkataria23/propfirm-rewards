'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GoogleTranslate } from '@/components/ui/google-translate';
import {
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Coins,
  Gift,
  TrendingUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Wallet,
  Star,
  Users,
  Award,
  Zap,
  MessageSquare,
  Shield,
  Play,
  CandlestickChart,
  Crown,
  Scale,
  Globe,
  Watch,
  Laptop,
  Smartphone,
  ShoppingBag,
  CircleDollarSign,
  Trophy,
  Target,
  Timer,
  BadgeCheck,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────
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

// ─── Fallback Data ─────────────────────────────────────────────
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

// ─── Pricing Matrix ────────────────────────────────────────────
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

// ─── Success Stories ───────────────────────────────────────────
const SUCCESS_STORIES = [
  { amount: '$45,476.80', title: 'HOW RAHUL SCALED FROM $10K TO $100K WITH PROPNATION', firm: 'FundingPips', trader: 'Rahul K. (India)', badge: 'SUCCESS STORY' },
  { amount: '$27,153.00', title: 'DIDI REVEALS HIS EVALUATION STRATEGY & RAPID REWARDS', firm: 'FundedSquad', trader: 'Didi M. (France)', badge: 'SUCCESS STORY' },
  { amount: '$39,000.00', title: '28+ TRADES UNBEATABLE RECORD: $39K REWARDS CLAIMED', firm: 'FTMO & FundingPips', trader: 'Tariq A. (UAE)', badge: 'SUCCESS STORY' },
  { amount: '$36,500.00', title: 'ARMAN EARNS $36.5K — ZERO EMOTIONS ON 2-STEP', firm: 'Pipstone Capital', trader: 'Arman V. (Armenia)', badge: 'SUCCESS STORY' },
  { amount: '$139,900.00', title: 'SMART MONEY CONFLUENCE: WHEN TIMING MEETS CONFIDENCE', firm: 'FundedNext', trader: 'Jessica L. (UK)', badge: 'SUCCESS STORY' },
];

// ─── Live Feed Data ────────────────────────────────────────────
const LIVE_FEED = [
  { flag: '🇳🇱', text: 'Trader from Netherlands just claimed', reward: '$965.20 USDT', type: 'cash' },
  { flag: '🇩🇪', text: 'Trader from Germany just redeemed', reward: 'Apple Watch Ultra', type: 'product' },
  { flag: '🇺🇸', text: 'Trader from USA just earned', reward: '+3,990 Points', type: 'points' },
  { flag: '🇬🇧', text: 'Trader from UK just claimed', reward: 'MacBook Pro M3', type: 'product' },
  { flag: '🇮🇳', text: 'Trader from India just claimed', reward: '$540.00 USDT', type: 'cash' },
  { flag: '🇦🇪', text: 'Trader from UAE just earned', reward: '+5,500 Points', type: 'points' },
  { flag: '🇫🇷', text: 'Trader from France just redeemed', reward: 'Nike Dunk Low', type: 'product' },
  { flag: '🇯🇵', text: 'Trader from Japan just claimed', reward: '$1,250.00 USDT', type: 'cash' },
];

// ─── Component ─────────────────────────────────────────────────
export default function HomePage() {
  const [propFirms, setPropFirms] = useState<PropFirm[]>(DEFAULT_PROP_FIRMS);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('2step');
  const [selectedSize, setSelectedSize] = useState<string>('100k');
  const [pricingViewMode, setPricingViewMode] = useState<'plans' | 'compare'>('plans');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [storyScrollIdx, setStoryScrollIdx] = useState(0);

  useEffect(() => {
    api
      .get<PropFirm[]>('/prop-firms')
      .then((data) => {
        if (data && data.length > 0) setPropFirms(data);
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

  const currentMatrix = MATRIX_DATA[selectedType]?.[selectedSize] || MATRIX_DATA['2step']['100k'];

  const faqs = [
    { q: 'What is PropNation?', a: 'PropNation is the premier proprietary trading loyalty ecosystem and cashback partner for top-tier firms including FundedSquad, Pipstone Capital, FTMO, FundedNext, and FundingPips. When you purchase an evaluation account using universal code NATION, you receive exclusive discounts and earn 10 reward points per $1 spent to redeem for luxury physical tech, shoes, luxury watches, or instant USDT payouts.' },
    { q: 'Do I need to risk my own money?', a: 'No. When trading prop firm accounts, you trade in a fully simulated environment with virtual demo funds. The only cost is the challenge registration fee, which yields 10 reward points per $1 spent and is frequently 100% refunded with your first simulated profit split.' },
    { q: 'What challenge models does PropNation offer?', a: 'Through our official prop firm partners, you can access 1-Step (FLEX), Classic 2-Phase evaluations, and Instant (Zero-Evaluation) funding accounts ranging from $5,000 all the way to $200,000+ with scale-up capital reaching $2,000,000.' },
    { q: "I'm not a trader — what exactly is a prop firm?", a: 'A proprietary trading firm ("prop firm") provides qualified individuals with simulated capital to trade global financial markets. Once you demonstrate risk management and pass the evaluation objectives, you receive a funded account and keep up to 100% of generated profits.' },
    { q: 'How much can I earn with PropNation?', a: 'Traders earn in two major ways: first, up to 100% performance rewards on their funded challenge accounts; second, spendable reward points (1$ = 10 PTS) on every challenge purchase and reset, redeemable for authentic luxury products (Nike Dunks, Apple Watch Ultra, MacBook Pro) or direct crypto/wire payouts.' },
    { q: 'Is PropNation legitimate?', a: 'Yes. PropNation is an officially recognized partner operating directly with verified prop firms. Submissions are audited with automated AI OCR invoice verification, and physical rewards are dispatched in factory-sealed retail packaging with fully insured DHL/FedEx tracking.' },
    { q: 'When and how do I get paid?', a: 'Reward points are credited within minutes of AI receipt verification. You can redeem points at any time for physical luxury goods or instant USDT (TRC-20/ERC-20) and direct bank wire cashouts.' },
    { q: 'Does PropNation have a regulated broker?', a: 'Our partnered firms utilize institutional liquidity providers and tier-1 regulated broker feeds (such as cTrader, DXtrade, and Tradin) ensuring ultra-raw spreads, fast execution, and zero markup.' },
  ];

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#070913] text-slate-900 dark:text-slate-100 font-sans selection:bg-purple-600 selection:text-white transition-colors duration-200">

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 1. ANNOUNCEMENT BAR                                       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="w-full bg-[#0d0920] text-white py-2.5 px-4 text-center text-[13px] font-medium tracking-tight border-b border-purple-950">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 text-slate-200">
            <span>Use Code</span>
            <button
              type="button"
              onClick={() => handleCopyCode('NATION')}
              className="font-mono font-bold text-purple-300 bg-purple-950/90 hover:bg-purple-900 px-2.5 py-0.5 rounded border border-purple-500/40 cursor-pointer flex items-center gap-1 active:scale-95 transition-all text-xs"
              title="Click to copy NATION"
            >
              NATION
              {copiedCode === 'NATION' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-purple-400" />}
            </button>
            <span className="text-purple-200 font-semibold">: 10% OFF New</span>
            <span className="hidden sm:inline text-purple-300 font-semibold">| 5% OFF Existing</span>
          </span>
          <span className="hidden md:inline text-purple-400/50">•</span>
          <span className="hidden md:inline font-bold text-purple-300">
            Every $1 Spent = 100 Reward Points
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 2. HERO — Trade. Earn Points. Claim Luxury Rewards.       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative w-full pt-8 pb-16 sm:pt-20 sm:pb-28 overflow-hidden bg-white dark:bg-[#070913]">
        {/* Atmospheric glows */}
        <div className="absolute top-0 right-0 w-[55vw] h-[55vw] max-w-[800px] max-h-[800px] bg-gradient-to-bl from-purple-200/40 via-violet-100/30 to-transparent dark:from-purple-900/20 dark:via-violet-950/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-0 w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] bg-gradient-to-tr from-violet-100/40 via-purple-100/20 to-transparent dark:from-purple-950/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 z-10 text-center lg:text-left flex flex-col items-center lg:items-start">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 dark:bg-purple-950/60 px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-purple-200 dark:border-purple-800 shadow-xs">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {'★★★★★'.split('').map((_, i) => (
                    <span key={i} className="text-xs leading-none">★</span>
                  ))}
                </div>
                <span className="text-slate-600 dark:text-slate-300">69,611 reviews</span>
                <span className="text-purple-400">·</span>
                <span className="font-bold text-slate-800 dark:text-white">3M+ Traders</span>
                <span className="text-purple-400">·</span>
                <span className="font-bold text-slate-800 dark:text-white">195 Countries</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[4.25rem] font-[900] tracking-tight text-[#0c1024] dark:text-white leading-[1.08]">
                Trade. Earn Points.{' '}
                <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Claim Luxury Rewards.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Purchase prop firm evaluations from <strong className="text-slate-800 dark:text-white">FundedSquad, Pipstone, FTMO, FundedNext &amp; FundingPips</strong> with code <strong className="text-purple-600 font-mono">NATION</strong> → earn <strong>10 points per $1</strong> → redeem for luxury tech, sneakers, watches, or instant USDT cashout.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-1">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white px-8 py-3 rounded-full font-bold text-sm tracking-tight shadow-lg shadow-purple-600/25 transition-all h-12">
                    Start Earning Rewards
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/rewards" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 px-8 py-3 rounded-full font-semibold text-sm tracking-tight transition-all h-12 shadow-xs">
                    Browse Rewards
                  </Button>
                </Link>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Language:</span>
                <GoogleTranslate id="google_translate_landing" compact />
              </div>
            </div>

            {/* Right Visual — Reward Points Card */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-full max-w-[420px]">
                {/* Main dark card */}
                <div className="rounded-3xl bg-gradient-to-b from-[#130d2d] to-[#0a071a] border-2 border-purple-500/40 p-6 sm:p-8 shadow-2xl shadow-purple-950/40 space-y-6">
                  {/* Points counter */}
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 rounded-full px-4 py-1.5">
                      <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
                      <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Points Earned</span>
                    </div>
                    <div className="text-5xl sm:text-6xl font-[900] text-white tracking-tight font-mono">
                      +5,500
                    </div>
                    <div className="text-sm text-purple-300 font-medium">from a $550 evaluation purchase</div>
                  </div>

                  {/* Reward icons */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-purple-500/20 hover:border-purple-400/40 transition-colors">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center shadow-md">
                        <Watch className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 text-center">Watches</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-purple-500/20 hover:border-purple-400/40 transition-colors">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md">
                        <Laptop className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 text-center">Tech</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-purple-500/20 hover:border-purple-400/40 transition-colors">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
                        <CircleDollarSign className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 text-center">USDT Cash</span>
                    </div>
                  </div>

                  {/* Code copy */}
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Universal Code</div>
                      <div className="text-lg font-black font-mono text-white tracking-widest">NATION</div>
                    </div>
                    <button
                      onClick={() => handleCopyCode('NATION')}
                      className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                    >
                      {copiedCode === 'NATION' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedCode === 'NATION' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 border-2 border-purple-400 rounded-full px-5 py-2 shadow-xl flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-black text-purple-700 dark:text-purple-300">1$ = 100 Reward Points</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Stat Bar */}
          <div className="mt-16 pt-8 border-t border-purple-100 dark:border-purple-900/50">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-5 px-4 sm:px-8 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-[900] text-[#0c1024] dark:text-white">195+</div>
                <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Countries</div>
              </div>
              <div className="border-l border-purple-200 dark:border-purple-800/60">
                <div className="text-2xl sm:text-3xl font-[900] text-[#0c1024] dark:text-white">3M+</div>
                <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Traders</div>
              </div>
              <div className="border-l border-purple-200 dark:border-purple-800/60 hidden sm:block">
                <div className="text-2xl sm:text-3xl font-[900] text-[#0c1024] dark:text-white">$314M+</div>
                <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Rewards Paid</div>
              </div>
              <div className="border-l border-purple-200 dark:border-purple-800/60">
                <div className="text-2xl sm:text-3xl font-[900] text-[#0c1024] dark:text-white">5</div>
                <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Partner Firms</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 3. HOW IT WORKS — 3 Steps                                 */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="w-full bg-slate-50/50 dark:bg-[#060814] py-16 sm:py-24 border-t border-purple-100 dark:border-purple-950/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center">
          <div className="space-y-3 max-w-xl mx-auto">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block">How It Works</span>
            <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c1024] dark:text-white">
              3 Steps to Luxury Rewards
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Step 1 */}
            <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 p-7 sm:p-8 space-y-4 text-left shadow-md hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all group">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-600 text-white flex items-center justify-center font-[900] text-lg shadow-lg shadow-purple-600/30 group-hover:scale-110 transition-transform">
                  1
                </div>
                <div className="h-[2px] flex-1 bg-gradient-to-r from-purple-400 to-transparent hidden md:block" />
              </div>
              <h3 className="text-xl font-[900] text-[#0c1024] dark:text-white">Buy Evaluation</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Visit any of our <strong>5 partner prop firms</strong> and purchase your evaluation challenge using code <span className="font-mono font-bold text-purple-600">NATION</span> to unlock discounts.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                <ShoppingBag className="h-4 w-4" />
                <span>10% off for new users</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 p-7 sm:p-8 space-y-4 text-left shadow-md hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all group">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center font-[900] text-lg shadow-lg shadow-violet-600/30 group-hover:scale-110 transition-transform">
                  2
                </div>
                <div className="h-[2px] flex-1 bg-gradient-to-r from-violet-400 to-transparent hidden md:block" />
              </div>
              <h3 className="text-xl font-[900] text-[#0c1024] dark:text-white">Earn Points Instantly</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Submit your purchase receipt. Our <strong>AI verification</strong> confirms it in minutes and credits <strong>10 reward points per $1</strong> to your account.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                <Coins className="h-4 w-4" />
                <span>$550 purchase = 5,500 points</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-3xl bg-gradient-to-br from-[#130d2d] to-[#0a071a] border-2 border-purple-500/50 p-7 sm:p-8 space-y-4 text-left shadow-xl group">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center font-[900] text-lg shadow-lg shadow-purple-600/30 group-hover:scale-110 transition-transform">
                  3
                </div>
              </div>
              <h3 className="text-xl font-[900] text-white">Redeem Rewards</h3>
              <p className="text-sm text-purple-200/80 leading-relaxed">
                Choose from <strong className="text-white">37+ luxury items</strong> — Apple Watch Ultra, MacBook Pro, Nike Dunks, G-Shock watches — or cash out as <strong className="text-white">instant USDT</strong>.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                <Gift className="h-4 w-4" />
                <span>Physical delivery or instant crypto</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 4. LIVE REWARD FEED — Social Proof                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="w-full bg-[#0c0920] text-white py-14 sm:py-20 border-t border-purple-950 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Live Feed</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-[900] tracking-tight text-white">
              Traders Are Earning Right Now
            </h2>
            <p className="text-sm text-slate-400">Real-time reward claims from our global community</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
            {LIVE_FEED.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-purple-950/50 border border-purple-900/50 hover:border-purple-700/60 transition-colors"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <span className="text-xl shrink-0">{item.flag}</span>
                <div className="text-xs text-slate-300 min-w-0">
                  <span>{item.text} </span>
                  <strong className={`font-bold ${item.type === 'cash' ? 'text-emerald-400' : item.type === 'product' ? 'text-purple-300' : 'text-amber-400'}`}>
                    {item.reward}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 5. REWARDS SHOWCASE — The Star Section                    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-purple-100 dark:border-purple-950/60">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-10">
          <div className="space-y-2 text-left">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Rewards Catalog</span>
            <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c1024] dark:text-white">
              37+ Luxury Rewards Waiting For You
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg">
              Every purchase earns points. Every point gets you closer to these. Redeemable instantly with your verified reward points.
            </p>
          </div>
          <Link href="/rewards" className="shrink-0">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-11 px-6 rounded-xl shadow-md shadow-purple-600/25">
              View All Rewards <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
          {(rewards.length > 0 ? rewards.slice(0, 8) : Array.from({ length: 8 }).map((_, i) => ({
            id: `placeholder-${i}`,
            name: ['Apple Watch Ultra 2', 'MacBook Pro M3', 'Nike Dunk Low', 'G-Shock GA-2100', 'iPhone 15 Pro', 'AirPods Pro', 'Sony WH-1000XM5', 'USDT Cashout'][i],
            slug: 'reward',
            imageUrl: '',
            pointsRequired: [45000, 120000, 12000, 8500, 95000, 22000, 28000, 5000][i],
            stock: 10,
            isUnlimitedStock: true,
            category: { name: ['Watches', 'Tech', 'Sneakers', 'Watches', 'Tech', 'Audio', 'Audio', 'Crypto'][i], slug: 'category' },
          }))).map((reward) => (
            <div
              key={reward.id}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 p-4 space-y-3 hover:border-purple-300 dark:hover:border-purple-700 transition-all shadow-xs group"
            >
              <div className="aspect-square rounded-xl bg-purple-50/40 dark:bg-slate-950 overflow-hidden border border-purple-100 dark:border-purple-900/40 flex items-center justify-center">
                {reward.imageUrl ? (
                  <img src={reward.imageUrl} alt={reward.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <Gift className="h-10 w-10 text-purple-300" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-purple-500">{reward.category?.name || 'Luxury'}</span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-purple-600 transition-colors">
                  {reward.name}
                </h4>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-purple-50 dark:border-purple-900/40">
                <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                  {reward.pointsRequired.toLocaleString()} PTS
                </span>
                <Link href={`/rewards/${reward.slug}`}>
                  <span className="text-[11px] font-semibold text-slate-500 hover:text-purple-600 dark:hover:text-white transition-colors">
                    Claim &rarr;
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Full-width CTA */}
        <div className="mt-10 text-center">
          <Link href="/rewards">
            <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-sm h-12 px-10 rounded-full shadow-lg shadow-purple-600/25">
              Explore Full Rewards Catalog <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 6. PARTNER PROP FIRMS                                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-purple-100 dark:border-purple-950/60 text-center space-y-12">
        <div className="space-y-3 max-w-2xl mx-auto">
          <Badge variant="purple">5 Official Partner Prop Firms</Badge>
          <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c1024] dark:text-white">
            One Universal Code. Five Top Firms.
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Purchase from any partner below with code <strong className="font-mono text-purple-600 font-bold">NATION</strong> and earn rewards automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {propFirms.slice(0, 5).map((firm) => {
            const domain = firm.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
            return (
              <div key={firm.id} className="rounded-3xl bg-white dark:bg-[#070913] border border-purple-100 dark:border-purple-900/40 p-6 sm:p-7 space-y-5 shadow-sm hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-800 transition-all flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 overflow-hidden flex items-center justify-center shrink-0">
                      {firm.logoUrl ? (
                        <img src={firm.logoUrl} alt={firm.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-black text-purple-700">{firm.name[0]}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-lg font-[900] text-slate-900 dark:text-white truncate">{firm.name}</h4>
                      <a href={firm.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-purple-600 hover:text-purple-800 dark:text-purple-400 inline-flex items-center gap-1">
                        {domain} <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{firm.description}</p>

                  {/* Code box */}
                  <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950/30 p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-purple-600 block">Code</span>
                      <span className="font-mono text-base font-[900] text-purple-950 dark:text-white">NATION</span>
                    </div>
                    <button
                      onClick={() => handleCopyCode('NATION')}
                      className="bg-white dark:bg-slate-800 hover:bg-purple-50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedCode === 'NATION' ? <Check className="h-3 w-3 text-purple-600" /> : <Copy className="h-3 w-3" />}
                      {copiedCode === 'NATION' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-50 dark:border-purple-950/40">
                  <a href={firm.affiliateUrl || firm.websiteUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold border-purple-200 hover:bg-purple-50">
                      Visit &amp; Buy <ExternalLink className="h-3 w-3 ml-1" />
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

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 7. PRICING CALCULATOR                                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="w-full bg-slate-50/50 dark:bg-[#060814] py-16 sm:py-24 border-t border-purple-100 dark:border-purple-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-center">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block">Pricing</span>
            <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c1024] dark:text-white">
              Choose Your Challenge
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              1 Step, 2 Step, or Zero. Multiple routes to match your trading style.
            </p>
          </div>

          {/* Challenge Type Selector */}
          <div className="space-y-3 max-w-xl mx-auto text-left">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">1 Challenge type</div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {CHALLENGE_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-3 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between min-h-[72px] ${
                    selectedType === type.id
                      ? 'bg-[#0c1024] text-white shadow-md border-2 border-purple-500'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-purple-100 dark:border-purple-900/60 hover:border-purple-300'
                  }`}
                >
                  <span className="text-[10px] font-bold text-purple-400 truncate block">{type.subtitle}</span>
                  <span className="text-sm font-[900] tracking-tight mt-1">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Account Size Selector */}
          <div className="space-y-3 max-w-xl mx-auto text-left">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">2 Account size</div>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {ACCOUNT_SIZES.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size.id)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedSize === size.id
                      ? 'bg-[#0c1024] text-white shadow-md border-2 border-purple-500'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-purple-100 dark:border-purple-900/60 hover:bg-purple-50'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="inline-flex items-center p-1 rounded-full bg-purple-100/70 dark:bg-slate-900 border border-purple-200 dark:border-purple-800">
              <button onClick={() => setPricingViewMode('plans')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${pricingViewMode === 'plans' ? 'bg-[#0c1024] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}>Plans</button>
              <button onClick={() => setPricingViewMode('compare')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${pricingViewMode === 'compare' ? 'bg-[#0c1024] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}>Compare</button>
            </div>
          </div>

          {/* Plan Cards */}
          {pricingViewMode === 'plans' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
              {/* Standard */}
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 p-6 sm:p-7 space-y-5 shadow-md flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">Standard</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1.5"><span className="text-3xl font-[900] text-slate-900 dark:text-white">${currentMatrix.standard.price}</span><span className="text-xs text-slate-400 font-mono">USD</span></div>
                    <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400">+{currentMatrix.standard.points} PTS with Code NATION</div>
                  </div>
                  <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 border-t border-purple-100 dark:border-purple-900/40 pt-4">
                    <div className="flex justify-between"><span>Profit Target:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.standard.target}</strong></div>
                    <div className="flex justify-between"><span>Daily Loss:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.standard.dailyLoss}</strong></div>
                    <div className="flex justify-between"><span>Max Loss:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.standard.maxLoss}</strong></div>
                    <div className="flex justify-between"><span>Min Days:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.standard.minDays}</strong></div>
                    <div className="flex justify-between"><span>Split:</span><strong className="text-purple-600 dark:text-purple-400 font-bold">{currentMatrix.standard.split}</strong></div>
                  </div>
                </div>
                <Link href="/prop-firms" className="pt-2"><Button className="w-full bg-[#0c1024] hover:bg-[#1a223f] text-white font-bold text-xs h-11 rounded-xl">Buy ${currentMatrix.standard.price}</Button></Link>
              </div>

              {/* FLEX — Highlighted */}
              <div className="rounded-3xl bg-gradient-to-b from-purple-50/60 to-white dark:from-purple-950/40 dark:to-slate-900 border-2 border-purple-500 p-6 sm:p-7 space-y-5 shadow-xl relative flex flex-col justify-between">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-md">Most Popular</div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-purple-600 text-white shadow-xs">FLEX</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1.5"><span className="text-3xl font-[900] text-purple-600 dark:text-purple-400">${currentMatrix.flex.price}</span><span className="text-xs text-slate-400 font-mono">USD</span></div>
                    <div className="text-[11px] font-bold text-purple-600 dark:text-purple-300">+{currentMatrix.flex.points} PTS with Code NATION</div>
                  </div>
                  <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 border-t border-purple-200 dark:border-purple-800/40 pt-4">
                    <div className="flex justify-between"><span>Profit Target:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.flex.target}</strong></div>
                    <div className="flex justify-between"><span>Daily Loss:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.flex.dailyLoss}</strong></div>
                    <div className="flex justify-between"><span>Max Loss:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.flex.maxLoss}</strong></div>
                    <div className="flex justify-between"><span>Min Days:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.flex.minDays}</strong></div>
                    <div className="flex justify-between"><span>Split:</span><strong className="text-purple-600 dark:text-purple-400 font-bold">{currentMatrix.flex.split}</strong></div>
                  </div>
                </div>
                <Link href="/prop-firms" className="pt-2"><Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs h-11 rounded-xl shadow-md shadow-purple-600/25">Buy ${currentMatrix.flex.price}</Button></Link>
              </div>

              {/* Pro */}
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 p-6 sm:p-7 space-y-5 shadow-md flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">PRO</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1.5"><span className="text-3xl font-[900] text-slate-900 dark:text-white">${currentMatrix.pro.price}</span><span className="text-xs text-slate-400 font-mono">USD</span></div>
                    <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400">+{currentMatrix.pro.points} PTS with Code NATION</div>
                  </div>
                  <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 border-t border-purple-100 dark:border-purple-900/40 pt-4">
                    <div className="flex justify-between"><span>Profit Target:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.pro.target}</strong></div>
                    <div className="flex justify-between"><span>Daily Loss:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.pro.dailyLoss}</strong></div>
                    <div className="flex justify-between"><span>Max Loss:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.pro.maxLoss}</strong></div>
                    <div className="flex justify-between"><span>Min Days:</span><strong className="text-slate-900 dark:text-white">{currentMatrix.pro.minDays}</strong></div>
                    <div className="flex justify-between"><span>Split:</span><strong className="text-purple-600 dark:text-purple-400 font-bold">{currentMatrix.pro.split}</strong></div>
                  </div>
                </div>
                <Link href="/prop-firms" className="pt-2"><Button className="w-full bg-[#0c1024] hover:bg-[#1a223f] text-white font-bold text-xs h-11 rounded-xl">Buy ${currentMatrix.pro.price}</Button></Link>
              </div>
            </div>
          ) : (
            /* Compare Table */
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
                  <tr><td className="py-3 px-3 text-slate-500">Price (USD)</td><td className="py-3 px-3 font-bold text-slate-900 dark:text-white">${currentMatrix.standard.price}</td><td className="py-3 px-3 font-bold text-purple-600 dark:text-purple-400">${currentMatrix.flex.price}</td><td className="py-3 px-3 font-bold text-slate-900 dark:text-white">${currentMatrix.pro.price}</td></tr>
                  <tr><td className="py-3 px-3 text-slate-500">Cashback Points</td><td className="py-3 px-3 font-bold text-purple-600">+{currentMatrix.standard.points}</td><td className="py-3 px-3 font-bold text-purple-600">+{currentMatrix.flex.points}</td><td className="py-3 px-3 font-bold text-purple-600">+{currentMatrix.pro.points}</td></tr>
                  <tr><td className="py-3 px-3 text-slate-500">Profit Target</td><td className="py-3 px-3">{currentMatrix.standard.target}</td><td className="py-3 px-3 font-bold text-purple-600">{currentMatrix.flex.target}</td><td className="py-3 px-3">{currentMatrix.pro.target}</td></tr>
                  <tr><td className="py-3 px-3 text-slate-500">Daily Loss</td><td className="py-3 px-3">{currentMatrix.standard.dailyLoss}</td><td className="py-3 px-3">{currentMatrix.flex.dailyLoss}</td><td className="py-3 px-3">{currentMatrix.pro.dailyLoss}</td></tr>
                  <tr><td className="py-3 px-3 text-slate-500">Max Loss</td><td className="py-3 px-3">{currentMatrix.standard.maxLoss}</td><td className="py-3 px-3">{currentMatrix.flex.maxLoss}</td><td className="py-3 px-3">{currentMatrix.pro.maxLoss}</td></tr>
                  <tr><td className="py-3 px-3 text-slate-500">Min Days</td><td className="py-3 px-3">{currentMatrix.standard.minDays}</td><td className="py-3 px-3 font-bold text-purple-600">{currentMatrix.flex.minDays}</td><td className="py-3 px-3">{currentMatrix.pro.minDays}</td></tr>
                  <tr><td className="py-3 px-3 text-slate-500">Profit Split</td><td className="py-3 px-3 font-bold text-purple-600">{currentMatrix.standard.split}</td><td className="py-3 px-3 font-bold text-purple-600">{currentMatrix.flex.split}</td><td className="py-3 px-3 font-bold text-purple-600">{currentMatrix.pro.split}</td></tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 8. ROI CASE STUDY + SUCCESS STORIES                       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="w-full bg-[#0c0920] text-white py-16 sm:py-24 border-t border-purple-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* ROI Banner */}
          <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-[#170e3a] via-[#120a2e] to-[#0c0920] border-2 border-purple-500/50 p-8 sm:p-12 shadow-2xl text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 rounded-full px-4 py-1.5">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Real Results</span>
                </div>
                <div className="text-5xl sm:text-7xl font-[900] text-purple-300 tracking-tight font-mono">
                  ROI 5,531%
                </div>
                <div className="text-lg sm:text-xl font-bold text-white font-mono">
                  $466 → $26,242
                </div>
                <div className="text-sm text-purple-200/80 font-medium">
                  ★★★★★ &quot;Best of the best&quot; — Majed M.
                </div>
              </div>
              <Link href="/register" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm px-8 py-3.5 h-12 rounded-full shadow-lg shadow-purple-600/30">
                  Start Your Journey <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Success Stories */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1 text-left">
                <h3 className="text-2xl sm:text-4xl font-[900] text-white tracking-tight">
                  Real Traders. Real Rewards.
                </h3>
                <p className="text-sm text-slate-400">Hear it directly from traders who earned their rewards.</p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <button onClick={() => setStoryScrollIdx((p) => Math.max(0, p - 1))} className="p-2 rounded-full border border-purple-800 bg-slate-900 hover:bg-purple-900/60 transition-colors cursor-pointer"><ChevronLeft className="h-4 w-4" /></button>
                <button onClick={() => setStoryScrollIdx((p) => Math.min(SUCCESS_STORIES.length - 1, p + 1))} className="p-2 rounded-full border border-purple-800 bg-slate-900 hover:bg-purple-900/60 transition-colors cursor-pointer"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 text-left">
              {SUCCESS_STORIES.map((story, idx) => (
                <div key={idx} className="min-w-[280px] sm:min-w-[320px] max-w-[320px] snap-center rounded-2xl overflow-hidden border border-purple-900/60 bg-[#120a2e] text-white p-5 space-y-4 shadow-lg hover:shadow-xl transition-all shrink-0 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold text-purple-300">
                      <span className="uppercase tracking-widest">{story.badge}</span>
                      <span className="bg-purple-950/90 px-2 py-0.5 rounded border border-purple-500/30 text-white font-mono">{story.firm}</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-[900] text-purple-300 tracking-tight font-mono">{story.amount}</div>
                    <h4 className="text-xs font-bold text-slate-100 line-clamp-2 leading-snug">{story.title}</h4>
                  </div>
                  <div className="pt-3 border-t border-purple-950 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 truncate max-w-[140px]">{story.trader}</span>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-purple-400">
                      <Play className="h-3 w-3 fill-purple-400" />
                      <span>Watch</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 9. TRADE ON YOUR TERMS — 3 Feature Cards                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-12 border-t border-purple-100 dark:border-purple-950/60">
        <div className="space-y-3 max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-[#0c1024] dark:text-white">Trade On Your Terms</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Markets, platforms, and payouts — all on your schedule.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 text-left">
          {/* 5 Markets */}
          <div className="rounded-3xl bg-slate-50/70 dark:bg-slate-900/60 border border-purple-100 dark:border-purple-900/50 p-6 sm:p-8 space-y-5 hover:border-purple-300 transition-colors shadow-xs">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-600 text-white flex items-center justify-center shadow-lg">
              <CandlestickChart className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-[900] text-[#0c1024] dark:text-white">5 Markets</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Trade Forex, Metals, Energies, Crypto &amp; Global Indices — all from a single funded account.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['FX', 'Gold', 'Oil', 'BTC', 'US30'].map((m) => (
                <span key={m} className="text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* 3 Platforms */}
          <div className="rounded-3xl bg-slate-50/70 dark:bg-slate-900/60 border border-purple-100 dark:border-purple-900/50 p-6 sm:p-8 space-y-5 hover:border-purple-300 transition-colors shadow-xs">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg">
              <Smartphone className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-[900] text-[#0c1024] dark:text-white">3 Platforms</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              MetaTrader 5, cTrader, and Tradin — institutional-grade execution on any device.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['MT5', 'cTrader', 'Tradin'].map((p) => (
                <span key={p} className="text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Payouts */}
          <div className="rounded-3xl bg-slate-50/70 dark:bg-slate-900/60 border border-purple-100 dark:border-purple-900/50 p-6 sm:p-8 space-y-5 hover:border-purple-300 transition-colors shadow-xs">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg">
              <Wallet className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-[900] text-[#0c1024] dark:text-white">Flexible Payouts</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Choose weekly, bi-weekly, or monthly payouts. Up to 100% profit split with instant processing.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['Weekly', 'Bi-Weekly', 'Monthly'].map((f) => (
                <span key={f} className="text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 10. DISCORD COMMUNITY                                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-purple-100 dark:border-purple-950/60 text-center space-y-8">
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-[900] tracking-tight text-[#0c1024] dark:text-white">
            Join 220,000+ Traders Worldwide
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Connect, learn, and grow with traders from 195 countries in our Discord community.
          </p>
        </div>

        {/* Discord Mockup */}
        <div className="max-w-2xl mx-auto rounded-3xl border-2 border-slate-200 dark:border-purple-900/60 bg-[#0e0924] text-white p-5 sm:p-6 shadow-2xl space-y-4 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-purple-900/60">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-md">PN</div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  PropNation Community
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">8,435 Online • 220,057 Members</span>
              </div>
            </div>
            <Badge variant="purple" className="text-[10px]">#rewards-live</Badge>
          </div>

          <div className="space-y-2 font-mono text-[11px] sm:text-xs text-slate-300">
            {['An FP Trader from NL just secured a $965.20 reward! 🔥', 'An FS Trader from DE just claimed an Apple Watch Ultra! 🔥', 'A Pipstone Trader from US just secured a $1,250.00 reward! 🔥', 'An FTMO Trader from UK just claimed a MacBook Pro M3! 🔥'].map((msg, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-900/50 flex items-center gap-2">
                <span className="text-purple-300 font-bold shrink-0">🤖 Bot:</span>
                <span className="truncate" dangerouslySetInnerHTML={{ __html: msg.replace(/\$[\d,.]+\s*reward/g, (m) => `<strong class="text-purple-300 font-bold">${m}</strong>`).replace(/Apple Watch Ultra|MacBook Pro M3/g, (m) => `<strong class="text-purple-300 font-bold">${m}</strong>`) }} />
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-md mx-auto pt-2">
          <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="block">
            <Button className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-sm h-12 rounded-xl shadow-lg">
              <Users className="h-4 w-4 mr-2" /> Join Discord Community
            </Button>
          </a>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 11. FAQ                                                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="w-full bg-[#05091c] text-white py-20 sm:py-28 border-t border-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-10">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-400">Everything you need to know about PropNation.</p>
          </div>

          <div className="space-y-0 divide-y divide-slate-800">
            {faqs.map((faq, idx) => (
              <div key={idx} className="py-5">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-purple-300 transition-colors cursor-pointer text-left"
                >
                  <span className="pr-2">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${openFaq === idx ? 'rotate-180 text-purple-400' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="pt-3 text-sm text-slate-300 leading-relaxed max-w-2xl">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 12. FINAL CTA BANNER                                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="w-full bg-gradient-to-r from-[#120a2e] via-[#0c0920] to-[#0a071a] text-white py-20 sm:py-28 border-t border-purple-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 rounded-full px-4 py-1.5">
            <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Start Today</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight text-white leading-[1.1]">
            Ready to Turn Your Trades Into{' '}
            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Luxury Rewards?
            </span>
          </h2>

          <p className="text-base sm:text-lg text-purple-200/80 max-w-xl mx-auto">
            Join 3M+ traders worldwide. Use code <strong className="text-white font-mono">NATION</strong>. Start earning points with every purchase.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/register">
              <Button className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm px-8 h-12 rounded-full shadow-lg shadow-purple-600/30">
                Create Free Account <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/rewards">
              <Button variant="outline" className="border-purple-500/50 text-white hover:bg-purple-500/10 font-semibold text-sm px-8 h-12 rounded-full">
                View Rewards
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FLOATING LIVE CHAT BUBBLE                                 */}
      {/* ═══════════════════════════════════════════════════════════ */}
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
