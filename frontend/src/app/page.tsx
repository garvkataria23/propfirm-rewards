'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
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
  ExternalLink,
  Wallet,
  ChevronDown,
  FileCheck2,
  CheckCircle,
  Truck,
  Headphones,
  Laptop,
  Smartphone,
  Gamepad2,
  Tag,
  Search,
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

// Fallback Prop Firms with tier details
const FALLBACK_PROP_FIRMS: PropFirm[] = [
  {
    id: 'firm-1',
    name: 'FundedSquad',
    slug: 'fundedsquad',
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
    name: 'FTMO',
    slug: 'ftmo',
    description: 'The global benchmark for prop trading evaluations. Industry standard rules and world-class trader education.',
    websiteUrl: 'https://ftmo.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://ftmo.com/?ref=nation',
    offers: [
      { id: 'o-7', accountTierName: '$50K Account', purchasePriceUsd: 380, rewardPoints: 3800 },
      { id: 'o-8', accountTierName: '$100K Account', purchasePriceUsd: 590, rewardPoints: 5900 },
      { id: 'o-9', accountTierName: '$200K Account', purchasePriceUsd: 1150, rewardPoints: 11500 },
    ],
  },
  {
    id: 'firm-4',
    name: 'Funding Pips',
    slug: 'funding-pips',
    description: 'Built by traders for traders with competitive challenge pricing, 1-step and 2-step evaluations.',
    websiteUrl: 'https://fundingpips.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://fundingpips.com/?ref=nation',
    offers: [
      { id: 'o-10', accountTierName: '$25K Account', purchasePriceUsd: 139, rewardPoints: 1390 },
      { id: 'o-11', accountTierName: '$50K Account', purchasePriceUsd: 239, rewardPoints: 2390 },
      { id: 'o-12', accountTierName: '$100K Account', purchasePriceUsd: 399, rewardPoints: 3990 },
    ],
  },
  {
    id: 'firm-5',
    name: 'FundedNext',
    slug: 'fundednext',
    description: 'Guaranteed 24h payout processing with profit split options up to 95% and scale-up plans.',
    websiteUrl: 'https://fundednext.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://fundednext.com/?ref=nation',
    offers: [
      { id: 'o-13', accountTierName: '$25K Account', purchasePriceUsd: 199, rewardPoints: 1990 },
      { id: 'o-14', accountTierName: '$50K Account', purchasePriceUsd: 299, rewardPoints: 2990 },
      { id: 'o-15', accountTierName: '$100K Account', purchasePriceUsd: 549, rewardPoints: 5490 },
    ],
  },
];

// Fallback curated rewards matching the master prompt with realistic product photography
const FALLBACK_REWARDS: Reward[] = [
  {
    id: 'r-1',
    name: 'Wireless Noise-Canceling Headphones',
    slug: 'wireless-headphones',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    pointsRequired: 20000,
    category: { name: 'Audio Gear', slug: 'audio' },
  },
  {
    id: 'r-2',
    name: 'Limited Edition Streetwear Sneakers',
    slug: 'premium-sneakers',
    imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
    pointsRequired: 15000,
    category: { name: 'Apparel', slug: 'apparel' },
  },
  {
    id: 'r-3',
    name: 'Pro Mechanical Gaming Accessory',
    slug: 'gaming-accessory',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    pointsRequired: 10000,
    category: { name: 'Gaming', slug: 'gaming' },
  },
  {
    id: 'r-4',
    name: 'Flagship 5G Smartphone',
    slug: 'flagship-smartphone',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    pointsRequired: 100000,
    category: { name: 'Mobile Tech', slug: 'mobile' },
  },
  {
    id: 'r-5',
    name: 'Ultra Retina 11-inch Tablet',
    slug: 'ultra-tablet',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
    pointsRequired: 60000,
    category: { name: 'Workstations', slug: 'workstations' },
  },
  {
    id: 'r-6',
    name: '$50 Global Digital Gift Card',
    slug: 'digital-gift-card',
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
    pointsRequired: 5000,
    category: { name: 'Vouchers', slug: 'vouchers' },
  },
];

export default function HomePage() {
  const [propFirms, setPropFirms] = useState<PropFirm[]>(FALLBACK_PROP_FIRMS);
  const [rewards, setRewards] = useState<Reward[]>(FALLBACK_REWARDS);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [counterPoints, setCounterPoints] = useState<number>(10000);

  useEffect(() => {
    api
      .get<PropFirm[]>('/prop-firms')
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setPropFirms(data);
        }
      })
      .catch(() => {});

    api
      .get<Reward[]>('/rewards', { inStockOnly: true })
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const merged = data.slice(0, 6).map((item, idx) => ({
            ...item,
            imageUrl: item.imageUrl || FALLBACK_REWARDS[idx % FALLBACK_REWARDS.length].imageUrl,
          }));
          setRewards(merged);
        }
      })
      .catch(() => {});
  }, []);

  // Subtle points increment animation for the hero dashboard visual
  useEffect(() => {
    const timer = setInterval(() => {
      setCounterPoints((prev) => (prev >= 12500 ? 10000 : prev + 250));
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const faqs = [
    {
      q: 'What is a prop firm?',
      a: 'A proprietary trading firm ("prop firm") provides qualified traders with simulated or allocated capital to trade global financial markets. Traders take an evaluation challenge, and once objective targets and risk limits are met, they receive access to funded capital while retaining a substantial portion of profits.',
    },
    {
      q: 'How do I earn points?',
      a: 'When you purchase an eligible prop-firm challenge using our referral code or link, you simply submit your order details and invoice. Once verified by our automated team, reward points are credited to your account based on the purchase price (e.g. 10 points per $1 spent).',
    },
    {
      q: 'How do I use the referral code?',
      a: 'During checkout on any partner prop firm website, paste our universal referral code NATION into the affiliate/promo code field. Complete your purchase, then come back to your PropFirm Rewards dashboard to upload your order confirmation.',
    },
    {
      q: 'How long does verification take?',
      a: 'Most submissions are verified within 2 to 24 hours. Our automated invoice processing checks the transaction details against partner confirmation to guarantee rapid point allocations.',
    },
    {
      q: 'What proof do I need to submit?',
      a: 'You simply upload a screenshot or PDF of your order confirmation invoice showing the order number, prop-firm name, purchase amount, and date.',
    },
    {
      q: 'When will I receive my points?',
      a: 'As soon as your submitted purchase proof status changes to "Verified", points are immediately added to your available balance in your wallet.',
    },
    {
      q: 'What rewards can I redeem?',
      a: 'You can redeem points for premium physical electronics (Apple, Sony, Samsung), authentic streetwear sneakers, trading desk hardware, digital gift vouchers, or direct cryptocurrency (USDT) cash payouts.',
    },
    {
      q: 'Can I track my reward?',
      a: 'Yes. Once you confirm a physical reward redemption, your dashboard provides an end-to-end tracking timeline from "Redemption Confirmed" to "Processing", "Shipped" with DHL/FedEx tracking number, and "Delivered".',
    },
    {
      q: 'Can I redeem points for cash?',
      a: 'Yes, our rewards catalog includes direct USDT (TRC-20 and ERC-20) transfers credited straight to your crypto wallet address upon approval.',
    },
    {
      q: 'What happens if my purchase is rejected?',
      a: 'If a receipt is unreadable or lacks the required details, our team leaves a specific note allowing you to re-upload clear proof, or you can contact our 24/7 support team to resolve it.',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#fafafc] dark:bg-[#05070a] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500/20 selection:text-emerald-800 dark:selection:text-emerald-200 transition-colors">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION
          Full-screen premium fintech hero with interactive dashboard visual
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full pt-8 pb-20 sm:pt-16 sm:pb-28 overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80">
        {/* Subtle glows for light/dark */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/[0.06] dark:bg-emerald-500/[0.04] rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-10 w-[400px] h-[400px] bg-blue-600/[0.05] dark:bg-blue-600/[0.03] rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Core Message */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 px-4 py-1.5 text-xs font-semibold tracking-wider text-slate-700 dark:text-slate-300 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="uppercase text-[11px] font-bold tracking-widest text-slate-800 dark:text-slate-200">
                  THE TRADER REWARDS PLATFORM
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-[4.5rem] font-[900] tracking-tight text-slate-900 dark:text-white leading-[1.04]">
                TRADE.<br />
                EARN.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 dark:from-emerald-400 dark:via-teal-300 dark:to-sky-400">
                  GET REWARDED.
                </span>
              </h1>

              {/* Sub-headline & Description */}
              <div className="space-y-2 max-w-xl">
                <p className="text-base sm:text-xl font-bold text-slate-800 dark:text-slate-200">
                  Turn eligible prop-firm purchases into rewards.
                </p>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  Purchase eligible prop-firm accounts using our referral codes, submit your purchase for verification, earn reward points, and redeem them for real-world rewards.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto pt-2">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-[0.98]">
                    Start Earning
                    <ArrowRight className="h-4 w-4 ml-2 stroke-[2.5]" />
                  </Button>
                </Link>
                <Link href="#rewards" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-xs"
                  >
                    Explore Rewards
                  </Button>
                </Link>
              </div>

              {/* Trust statement below CTA */}
              <p className="text-xs text-slate-500 font-medium tracking-wide pt-1">
                Free to join • Secure verification • Real rewards
              </p>
            </div>

            {/* Right Column: Premium Dashboard Preview Mockup */}
            <div className="lg:col-span-5 w-full flex justify-center">
              <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gradient-to-b dark:from-slate-900/95 dark:to-[#0b0f17] border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xl shadow-slate-200/50 dark:shadow-black/80 space-y-5 backdrop-blur-xl relative">
                {/* Header Row: Balance */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Available Points
                    </div>
                    <div className="text-3xl font-[900] text-slate-900 dark:text-white tracking-tight font-mono flex items-baseline gap-2 mt-0.5">
                      <span>{counterPoints.toLocaleString()}</span>
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-md">
                        +2,500 Points
                      </span>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Wallet className="h-5 w-5" />
                  </div>
                </div>

                {/* Reward Progress Card */}
                <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800/80 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                      <Smartphone className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                      iPhone Flagship
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">75% unlocked</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[75%]" />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>12,500 PTS</span>
                    <span>16,600 PTS Goal</span>
                  </div>
                </div>

                {/* Recent Activity List */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Recent Activity
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">Purchase Verified</div>
                          <div className="text-[10px] text-slate-500">Order #PS-88412 • Pipstone</div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+2,500 PTS</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">Bonus Earned</div>
                          <div className="text-[10px] text-slate-500">First Purchase Boost</div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">+1,000 PTS</span>
                    </div>
                  </div>
                </div>

                {/* Referral Code Quick Copy Box */}
                <div className="pt-1">
                  <div className="rounded-xl bg-slate-100/90 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block tracking-wider">
                        Universal Referral Code
                      </span>
                      <span className="font-mono font-black text-slate-900 dark:text-white text-base tracking-wider">
                        NATION
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode('NATION')}
                      className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      {copiedCode === 'NATION' ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-slate-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. TRUST STRIP
          Immediately below hero with clean indicators
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full bg-slate-100/70 dark:bg-[#080c14] border-b border-slate-200/80 dark:border-slate-800/80 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Built for traders
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 w-full md:w-auto">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Secure Platform</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Verified Purchases</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Coins className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Transparent Points</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Gift className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Real Rewards</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. HOW IT WORKS
          From Purchase to Reward in 5 Simple Steps
      ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="w-full py-16 sm:py-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#05070a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Heading */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="outline" className="border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 text-xs">
              Simple Workflow
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[900] tracking-tight text-slate-900 dark:text-white">
              From Purchase to Reward in 5 Simple Steps
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              A straightforward process with automated tracking and transparent point accreditation.
            </p>
          </div>

          {/* Desktop Horizontal / Mobile Vertical 5-Step Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-5 relative">
            {/* Step 1 */}
            <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 p-5 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs">
              <div className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                STEP 01
              </div>
              <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-transparent flex items-center justify-center text-slate-800 dark:text-slate-200 shadow-2xs">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Choose a Prop Firm</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Browse eligible prop firms and explore available evaluation offers.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 p-5 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs">
              <div className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                STEP 02
              </div>
              <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-transparent flex items-center justify-center text-slate-800 dark:text-slate-200 shadow-2xs">
                <Tag className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Buy Using Our Code</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Purchase your eligible account using referral code <strong className="text-slate-900 dark:text-white font-mono">NATION</strong>.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 p-5 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs">
              <div className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                STEP 03
              </div>
              <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-transparent flex items-center justify-center text-slate-800 dark:text-slate-200 shadow-2xs">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Submit Your Proof</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Upload your order details and invoice receipt to your user dashboard.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 p-5 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs">
              <div className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                STEP 04
              </div>
              <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-transparent flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
                <CheckCircle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Get Verified</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Our verification team audits and approves your order confirmation.
              </p>
            </div>

            {/* Step 5 */}
            <div className="rounded-2xl bg-emerald-50/80 dark:bg-emerald-500/[0.04] border border-emerald-300 dark:border-emerald-500/30 p-5 space-y-3 shadow-2xs">
              <div className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">
                STEP 05
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <Gift className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Earn &amp; Redeem</h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Receive points instantly and redeem them for real-world rewards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. PROP FIRMS SECTION
          Dynamic / placeholder cards with tiers and point yield
      ───────────────────────────────────────────────────────────── */}
      <section id="prop-firms" className="w-full py-16 sm:py-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#080c14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <Badge variant="outline" className="border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/60 text-xs">
                Eligible Platforms
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[900] tracking-tight text-slate-900 dark:text-white">
                Choose Your Prop Firm
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl">
                Explore participating prop firms and see how many points you can earn on each evaluation tier.
              </p>
            </div>
            <Link href="/prop-firms">
              <Button variant="outline" className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-2xs">
                View All Partners <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propFirms.slice(0, 6).map((firm) => (
              <div
                key={firm.id}
                className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/90 dark:border-slate-800 p-6 flex flex-col justify-between space-y-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
              >
                <div className="space-y-4">
                  {/* Top: Logo + Name */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-900 dark:text-white font-black text-sm">
                        {firm.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug">{firm.name}</h4>
                        <span className="text-[11px] text-slate-500 font-mono">Code: NATION</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {firm.description}
                  </p>

                  {/* Tier Examples List */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Tier Points Yield
                    </div>
                    {firm.offers && firm.offers.length > 0 ? (
                      firm.offers.slice(0, 3).map((offer) => (
                        <div
                          key={offer.id}
                          className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800/60"
                        >
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{offer.accountTierName}</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            +{offer.rewardPoints.toLocaleString()} PTS
                          </span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800/60">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">$50 Account</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+1,000 PTS</span>
                        </div>
                        <div className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800/60">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">$100 Account</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+2,500 PTS</span>
                        </div>
                        <div className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800/60">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">$200 Account</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+5,000 PTS</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <a
                    href={firm.affiliateUrl || firm.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold h-10 rounded-xl transition-colors">
                      View Offer <ExternalLink className="h-3.5 w-3.5 ml-1.5 text-slate-500" />
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. REWARD SHOWCASE
          Your Trading. Your Rewards.
      ───────────────────────────────────────────────────────────── */}
      <section id="rewards" className="w-full py-16 sm:py-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#05070a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="outline" className="border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 text-xs">
              Rewards Catalog
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[900] tracking-tight text-slate-900 dark:text-white">
              Your Trading. Your Rewards.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Turn your verified purchases into points and redeem them for rewards you actually want.
            </p>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.slice(0, 6).map((item, idx) => {
              const icons = [Headphones, Tag, Gamepad2, Smartphone, Laptop, Gift];
              const ItemIcon = icons[idx % icons.length];

              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/90 dark:border-slate-800 p-6 flex flex-col justify-between space-y-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all group shadow-xs"
                >
                  <div className="space-y-4">
                    {/* Visual image box */}
                    <div className="aspect-[16/10] rounded-xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 overflow-hidden flex items-center justify-center p-4 relative shadow-2xs group/img">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover rounded-lg group-hover/img:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <ItemIcon className="h-12 w-12 stroke-[1.5] text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                      )}
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {item.category?.name || 'Exclusive Reward'}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                        {item.name}
                      </h4>
                    </div>

                    <div className="flex items-baseline gap-1.5 pt-1">
                      <span className="text-2xl font-[900] text-emerald-600 dark:text-emerald-400 font-mono">
                        {item.pointsRequired.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Points</span>
                    </div>
                  </div>

                  <Link href="/rewards">
                    <Button variant="outline" className="w-full border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold h-10 rounded-xl shadow-2xs">
                      View Reward
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Disclaimer note */}
          <p className="text-center text-xs text-slate-500 max-w-xl mx-auto">
            Reward items are subject to stock availability and regional fulfillment. Configured in real time via our secure redemption backend.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. POINTS SYSTEM VISUAL & REWARD PROGRESS (2-Column)
          Every Eligible Purchase Gets You Closer
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-16 sm:py-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#080c14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Heading */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="outline" className="border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/60 text-xs">
              Transparent Accounting
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[900] tracking-tight text-slate-900 dark:text-white">
              Every Eligible Purchase Gets You Closer.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Clear credit allocation, instant tracking, and goal progress visualization.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left: Fintech Wallet Card */}
            <div className="lg:col-span-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs flex flex-col justify-between h-full">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Wallet Ledger Preview
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Synchronized
                  </span>
                </div>

                {/* Large points balance display */}
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total Points Accumulated
                  </div>
                  <div className="text-4xl sm:text-5xl font-[900] text-slate-900 dark:text-white tracking-tight font-mono">
                    12,500 <span className="text-lg text-emerald-600 dark:text-emerald-400 font-sans font-bold">POINTS</span>
                  </div>
                </div>

                {/* Transaction list */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/70 dark:border-slate-800/80 text-xs">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">Purchase Verified</div>
                      <div className="text-[10px] text-slate-500">FundedNext $50K Challenge</div>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">+2,500</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/70 dark:border-slate-800/80 text-xs">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">Account Onboarding Bonus</div>
                      <div className="text-[10px] text-slate-500">Early Member Tier</div>
                    </div>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">+1,000</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/70 dark:border-slate-800/80 text-xs">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">Reward Redemption</div>
                      <div className="text-[10px] text-slate-500">Global Digital Gift Card</div>
                    </div>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">-5,000</span>
                  </div>
                </div>
              </div>

              {/* Bottom aligned balance bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100/90 dark:bg-slate-950 border border-slate-300/80 dark:border-slate-700/80 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Current Available Balance</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Ready to redeem</div>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-base">8,500</span>
                </div>
              </div>
            </div>

            {/* Right: Reward Progress Card */}
            <div className="lg:col-span-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 space-y-6 flex flex-col justify-between h-full shadow-xs">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Goal Tracking
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Item</span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-2xl sm:text-3xl font-[900] text-slate-900 dark:text-white">You&apos;re getting closer.</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Set personal reward goals and monitor your progress across all challenge purchases.
                  </p>
                </div>

                {/* Progress Box */}
                <div className="rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 p-5 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-transparent flex items-center justify-center text-slate-800 dark:text-slate-200 shadow-2xs">
                        <Headphones className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Wireless Headphones</div>
                        <div className="text-xs text-slate-500">20,000 Points Goal</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Your Points</div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white text-sm sm:text-base">12,500</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[62.5%]" />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span>62.5% Completed</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">7,500 more points to unlock</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom aligned CTA button */}
              <div className="pt-2">
                <Link href="/rewards" className="block">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-sm h-12 rounded-xl shadow-md shadow-emerald-600/10 transition-all">
                    Explore Rewards Catalog
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. WHY JOIN SECTION
          More Than Just a Referral Code
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-16 sm:py-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#05070a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="outline" className="border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 text-xs">
              Platform Benefits
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[900] tracking-tight text-slate-900 dark:text-white">
              More Than Just a Referral Code.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              An ecosystem built for retail traders who want tangible value from their prop-firm journey.
            </p>
          </div>

          {/* 4 Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/90 dark:border-slate-800 p-6 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <Coins className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Earn Points</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Get rewarded for eligible verified purchases across top-tier participating prop firms.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/90 dark:border-slate-800 p-6 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs">
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Simple Verification</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Submit your purchase proof through a simple, friction-free portal in under two minutes.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/90 dark:border-slate-800 p-6 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs">
              <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                <Gift className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Real Rewards</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Redeem accumulated points for physical luxury tech, gaming gear, or instant crypto payouts.
              </p>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/90 dark:border-slate-800 p-6 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs">
              <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Track Everything</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                See purchases, points and redemptions in one clean, unified trader dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. DASHBOARD PREVIEW & REDEMPTION PROCESS
          Realistic SaaS product mockup
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-16 sm:py-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#080c14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="outline" className="border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/60 text-xs">
              Portal Overview
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[900] tracking-tight text-slate-900 dark:text-white">
              Professional Trader Dashboard
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Manage your challenges, point logs, and shipping timelines with full transparency.
            </p>
          </div>

          {/* Large Dashboard Mockup */}
          <div className="rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-2xl">
            {/* Browser / App Header bar */}
            <div className="h-10 bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="ml-2 font-mono text-[11px] text-slate-600 dark:text-slate-500">app.propfirmrewards.com/dashboard</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Connected
              </div>
            </div>

            {/* Dashboard Inner Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px]">
              {/* Sidebar */}
              <div className="md:col-span-3 border-r border-slate-200 dark:border-slate-800 p-4 space-y-4 bg-slate-50/70 dark:bg-slate-950/60 hidden md:block">
                <div className="space-y-1 text-xs">
                  <div className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white flex items-center gap-2 border border-slate-200/80 dark:border-transparent shadow-2xs">
                    <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Dashboard
                  </div>
                  <div className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> Prop Firms
                  </div>
                  <div className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4" /> My Purchases
                  </div>
                  <div className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2">
                    <Coins className="h-4 w-4" /> Points Wallet
                  </div>
                  <div className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2">
                    <Gift className="h-4 w-4" /> Rewards Store
                  </div>
                  <div className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2">
                    <Truck className="h-4 w-4" /> Redemptions
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="md:col-span-9 p-5 sm:p-7 space-y-6 bg-white dark:bg-slate-950">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Available Points</div>
                    <div className="text-2xl font-[900] text-slate-900 dark:text-white font-mono">12,500</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Verified Orders</div>
                    <div className="text-2xl font-[900] text-emerald-600 dark:text-emerald-400 font-mono">4 Orders</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Redeemed Value</div>
                    <div className="text-2xl font-[900] text-blue-600 dark:text-blue-400 font-mono">$150.00</div>
                  </div>
                </div>

                {/* Realistic Order Tracking component */}
                <div className="rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase font-bold">Reward #RW-10294</span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Premium Wireless Headphones</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">20,000 Points</span>
                  </div>

                  {/* Tracking 4-Step Journey */}
                  <div className="grid grid-cols-4 gap-2 text-center pt-2">
                    <div className="space-y-1.5">
                      <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto text-xs font-bold">
                        ✓
                      </div>
                      <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Confirmed</div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto text-xs font-bold">
                        ✓
                      </div>
                      <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Processing</div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto text-xs font-bold">
                        ✓
                      </div>
                      <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Shipped</div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto text-xs font-bold">
                        ○
                      </div>
                      <div className="text-[11px] font-medium text-slate-500">Delivered</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center pt-1 font-mono">
                    Tracking carrier: DHL Express • Waybill #9400 1000 8421
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. FREQUENTLY ASKED QUESTIONS
          Full 10-Question Comprehensive Accordion
      ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="w-full py-16 sm:py-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#05070a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 text-xs">
              Got Questions?
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[900] tracking-tight text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Clear answers regarding verification, point yields, and reward delivery.
            </p>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={index} className="py-4">
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left py-2 gap-4 cursor-pointer group"
                  >
                    <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="pt-2 pb-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. FINAL CTA BANNER
          Your Next Reward Starts With Your Next Trade.
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-20 sm:py-28 overflow-hidden bg-gradient-to-b from-slate-100 to-white dark:from-[#080c14] dark:to-[#05070a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <Badge variant="outline" className="border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 text-xs">
            Start Today
          </Badge>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-[900] tracking-tight text-slate-900 dark:text-white leading-tight">
            Your Next Reward Starts With{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 dark:from-emerald-400 dark:via-teal-300 dark:to-sky-400">
              Your Next Trade.
            </span>
          </h2>

          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Join the platform, discover eligible prop-firm offers and start earning rewards on every challenge account.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20">
                Get Started Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="#rewards" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-2xs"
              >
                Explore Rewards
              </Button>
            </Link>
          </div>

          <p className="text-xs text-slate-500 pt-2">
            No subscription fees • Simple receipt upload • Global shipping
          </p>
        </div>
      </section>
    </div>
  );
}
