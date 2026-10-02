'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InteractiveEvaluationMatrix } from '@/components/prop-firms/interactive-evaluation-matrix';
import {
  Layers,
  Copy,
  Check,
  ExternalLink,
  Coins,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Tag,
  Globe,
  Sparkles,
  ChevronDown,
  Gift,
  Zap,
  TrendingUp,
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
  eligibilityTerms: string;
  category?: 'CFD' | 'FUTURES';
  offers: PropFirmOffer[];
}

const FALLBACK_FIRMS: Record<string, PropFirm> = {
  'fundedsquad': {
    id: 'firm-1',
    name: 'FundedSquad',
    slug: 'fundedsquad',
    logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&auto=format&fit=crop&q=80',
    description: 'Elite proprietary firm with instant evaluation pass options, scaling plans up to $1,000,000, and weekly payouts.',
    websiteUrl: 'https://fundedsquad.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://fundedsquad.com/?ref=nation',
    eligibilityTerms: 'Apply referral code NATION at checkout. 1$ purchase equals 10 Reward Points.',
    category: 'CFD',
    offers: [
      { id: 'o-1', accountTierName: '$10K Evaluation Challenge', purchasePriceUsd: 100, rewardPoints: 1000 },
      { id: 'o-2', accountTierName: '$25K Evaluation Challenge', purchasePriceUsd: 200, rewardPoints: 2000 },
      { id: 'o-3', accountTierName: '$50K Evaluation Challenge', purchasePriceUsd: 350, rewardPoints: 3500 },
      { id: 'o-4', accountTierName: '$100K Evaluation Challenge', purchasePriceUsd: 550, rewardPoints: 5500 },
      { id: 'o-5', accountTierName: '$200K Evaluation Challenge', purchasePriceUsd: 1000, rewardPoints: 10000 },
    ],
  },
  'pipstone-capital': {
    id: 'firm-2',
    name: 'Pipstone Capital',
    slug: 'pipstone-capital',
    logoUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=120&auto=format&fit=crop&q=80',
    description: 'Premium prop trading firm offering raw ECN spreads, high drawdown limits, and bi-weekly revenue splits up to 90%.',
    websiteUrl: 'https://pipstonecapital.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://pipstonecapital.com/?ref=nation',
    eligibilityTerms: 'Apply referral code NATION at checkout. 1$ purchase equals 10 Reward Points.',
    category: 'CFD',
    offers: [
      { id: 'o-6', accountTierName: '$15K Pipstone Standard', purchasePriceUsd: 120, rewardPoints: 1200 },
      { id: 'o-7', accountTierName: '$30K Pipstone Standard', purchasePriceUsd: 220, rewardPoints: 2200 },
      { id: 'o-8', accountTierName: '$60K Pipstone Standard', purchasePriceUsd: 380, rewardPoints: 3800 },
      { id: 'o-9', accountTierName: '$100K Pipstone Standard', purchasePriceUsd: 520, rewardPoints: 5200 },
      { id: 'o-10', accountTierName: '$200K Pipstone Standard', purchasePriceUsd: 980, rewardPoints: 9800 },
    ],
  },
  'ftmo': {
    id: 'firm-3',
    name: 'FTMO',
    slug: 'ftmo',
    logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&auto=format&fit=crop&q=80',
    description: 'The global benchmark for proprietary trading. Up to $200,000 initial balance, up to 90% profit split, and world-class trader education.',
    websiteUrl: 'https://ftmo.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://ftmo.com/?ref=nation',
    eligibilityTerms: 'Apply referral code NATION at checkout. 1$ purchase equals 10 Reward Points.',
    category: 'CFD',
    offers: [
      { id: 'o-11', accountTierName: '$10K Evaluation Challenge', purchasePriceUsd: 175, rewardPoints: 1750 },
      { id: 'o-12', accountTierName: '$25K Evaluation Challenge', purchasePriceUsd: 280, rewardPoints: 2800 },
      { id: 'o-13', accountTierName: '$50K Evaluation Challenge', purchasePriceUsd: 390, rewardPoints: 3900 },
      { id: 'o-14', accountTierName: '$100K Evaluation Challenge', purchasePriceUsd: 600, rewardPoints: 6000 },
      { id: 'o-15', accountTierName: '$200K Evaluation Challenge', purchasePriceUsd: 1180, rewardPoints: 11800 },
    ],
  },
  'fundednext': {
    id: 'firm-4',
    name: 'FundedNext',
    slug: 'fundednext',
    logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&auto=format&fit=crop&q=80',
    description: '15% profit sharing during challenge phases, up to 95% profit split, and guaranteed 24-hour payout processing.',
    websiteUrl: 'https://fundednext.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://fundednext.com/?ref=nation',
    eligibilityTerms: 'Apply referral code NATION at checkout. 1$ purchase equals 10 Reward Points.',
    category: 'CFD',
    offers: [
      { id: 'o-16', accountTierName: '$15K Stellar 2-Step', purchasePriceUsd: 119, rewardPoints: 1190 },
      { id: 'o-17', accountTierName: '$25K Stellar 2-Step', purchasePriceUsd: 199, rewardPoints: 1990 },
      { id: 'o-18', accountTierName: '$50K Stellar 2-Step', purchasePriceUsd: 299, rewardPoints: 2990 },
      { id: 'o-19', accountTierName: '$100K Stellar 2-Step', purchasePriceUsd: 549, rewardPoints: 5490 },
      { id: 'o-20', accountTierName: '$200K Stellar 2-Step', purchasePriceUsd: 1099, rewardPoints: 10990 },
    ],
  },
  'funding-pips': {
    id: 'firm-5',
    name: 'Funding Pips',
    slug: 'funding-pips',
    logoUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=120&auto=format&fit=crop&q=80',
    description: 'Built by traders for traders. Tight spreads, fast weekly payouts, and zero time limit evaluation phases.',
    websiteUrl: 'https://fundingpips.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://fundingpips.com/?ref=nation',
    eligibilityTerms: 'Apply referral code NATION at checkout. 1$ purchase equals 10 Reward Points.',
    category: 'CFD',
    offers: [
      { id: 'o-21', accountTierName: '$5K Evaluation 2-Step', purchasePriceUsd: 32, rewardPoints: 320 },
      { id: 'o-22', accountTierName: '$25K Evaluation 2-Step', purchasePriceUsd: 139, rewardPoints: 1390 },
      { id: 'o-23', accountTierName: '$50K Evaluation 2-Step', purchasePriceUsd: 239, rewardPoints: 2390 },
      { id: 'o-24', accountTierName: '$100K Evaluation 2-Step', purchasePriceUsd: 399, rewardPoints: 3990 },
    ],
  },
};

const FAQS = [
  {
    q: 'How is the cashback calculated and credited?',
    a: 'For every $1 USD you spend on the prop firm using code NATION, 10 PropNation Reward Points are credited to your wallet (100 PTS = $1.00 USD cashout). That provides a guaranteed 10% cashback yield on every challenge tier.',
  },
  {
    q: 'How fast do my reward points arrive after purchase?',
    a: 'Audit clearance typically takes less than 24 hours. Once you submit your order ID or invoice receipt, our automated reconciliation engine verifies your order and unlocks your points.',
  },
  {
    q: 'Can I combine this cashback with prop firm seasonal discounts?',
    a: 'Yes! When you checkout with promo code NATION, you receive both the prop firm partner discount rate and your 10% PropNation cashback points simultaneously.',
  },
  {
    q: 'What can I redeem my reward points for?',
    a: 'You can withdraw spendable cashout directly to your crypto wallet (USDT/USDC), request bank wire transfer, or redeem for luxury watches, Apple MacBooks, iPhones, or free prop firm challenge passes in the Rewards Store.',
  },
];

export default function PropFirmDetailPage() {
  const params = useParams();
  const rawSlug = (params?.slug as string) || '';
  const normalizedSlug = rawSlug.toLowerCase();

  const [firm, setFirm] = useState<PropFirm | null>(FALLBACK_FIRMS[normalizedSlug] || null);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    if (normalizedSlug) {
      api
        .get<PropFirm>(`/prop-firms/${normalizedSlug}`)
        .then((data) => {
          if (data && data.name) {
            setFirm(data);
          }
        })
        .catch((err) => {
          console.warn('Using verified fallback for slug:', normalizedSlug, err);
          if (FALLBACK_FIRMS[normalizedSlug]) {
            setFirm(FALLBACK_FIRMS[normalizedSlug]);
          }
        });
    }
  }, [normalizedSlug]);

  const handleCopyCode = () => {
    if (firm) {
      navigator.clipboard.writeText(firm.affiliateCode || 'NATION');
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2200);
    }
  };

  const handleCopyAndVisit = () => {
    if (firm) {
      navigator.clipboard.writeText(firm.affiliateCode || 'NATION');
      setCopiedCode(true);
      window.open(firm.affiliateUrl || firm.websiteUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => setCopiedCode(false), 2200);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center text-purple-600 font-semibold">
        Loading prop firm details...
      </div>
    );
  }

  if (!firm) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Prop Firm Not Found</h2>
        <p className="text-sm text-slate-500">The requested prop firm could not be located in our partner catalog.</p>
        <Link href="/prop-firms">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Prop Firms
          </Button>
        </Link>
      </div>
    );
  }

  const domain = firm.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12 w-full overflow-hidden">
      {/* Back button */}
      <div>
        <Link
          href="/prop-firms"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Partner Prop Firms</span>
        </Link>
      </div>

      {/* Hero Header Card - Mobile-First Layout */}
      <div className="rounded-3xl border border-purple-100 dark:border-purple-950/60 bg-white dark:bg-[#070913] p-5 sm:p-9 shadow-xl shadow-purple-500/5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr from-purple-100 to-violet-50 dark:from-purple-950 dark:to-slate-900 border border-purple-200 dark:border-purple-800/80 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
              {firm.logoUrl ? (
                <img src={firm.logoUrl} alt={firm.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-purple-700 dark:text-purple-300">
                  {firm.name[0]}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-[900] text-slate-900 dark:text-white tracking-tight truncate">
                  {firm.name}
                </h1>
                <Badge
                  variant="purple"
                  className="bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-[10px] sm:text-xs"
                >
                  Verified Partner
                </Badge>
              </div>

              {/* Real Official Website Link */}
              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-400">Official Website:</span>
                <a
                  href={firm.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 inline-flex items-center gap-1 underline underline-offset-2"
                >
                  <span className="truncate max-w-[200px]">{domain}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <Button
              size="lg"
              onClick={handleCopyAndVisit}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/25 h-11"
            >
              <span>Purchase on {firm.name}</span>
              <ExternalLink className="h-4 w-4 ml-2 shrink-0" />
            </Button>
            <Link href={`/dashboard/purchases/new?propFirmId=${firm.id}`} className="w-full xs:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full font-bold text-xs sm:text-sm border-purple-200 dark:border-purple-800 hover:bg-purple-50 h-11"
              >
                Submit Proof
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {firm.description}
        </p>

        {/* 4 Quick Stat Highlights (2 columns on mobile, 4 on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-800/60 text-center space-y-0.5">
            <span className="text-sm sm:text-base font-black text-purple-700 dark:text-purple-300">10% Yield</span>
            <div className="text-[10px] text-slate-500 font-medium">Guaranteed Cashback</div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-800/60 text-center space-y-0.5">
            <span className="text-sm sm:text-base font-black text-purple-700 dark:text-purple-300">10 PTS</span>
            <div className="text-[10px] text-slate-500 font-medium">Per $1 Spent</div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-800/60 text-center space-y-0.5">
            <span className="text-sm sm:text-base font-black text-purple-700 dark:text-purple-300">&lt; 24 Hours</span>
            <div className="text-[10px] text-slate-500 font-medium">Audit Clearance</div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-800/60 text-center space-y-0.5">
            <span className="text-sm sm:text-base font-black text-purple-700 dark:text-purple-300">100% Guaranteed</span>
            <div className="text-[10px] text-slate-500 font-medium">Wallet Payouts</div>
          </div>
        </div>

        {/* Universal Referral Code Card */}
        <div className="rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 bg-purple-50/70 dark:bg-purple-950/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-purple-600" />
              <span className="text-xs uppercase tracking-wider font-extrabold text-purple-700 dark:text-purple-300">
                Universal Referral &amp; Discount Code
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Apply code <strong className="text-purple-700 dark:text-purple-300 font-mono font-bold">{firm.affiliateCode || 'NATION'}</strong> during checkout on {firm.name} to earn 10 Reward Points per $1 spent.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <div className="flex-1 sm:flex-none font-mono text-lg sm:text-xl font-[900] text-purple-950 dark:text-white bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 px-4 py-2 rounded-xl tracking-wider text-center shadow-xs">
              {firm.affiliateCode || 'NATION'}
            </div>
            <Button
              variant={copiedCode ? 'primary' : 'outline'}
              className="text-xs font-bold border-purple-300 dark:border-purple-700 shrink-0"
              onClick={handleCopyCode}
            >
              {copiedCode ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copiedCode ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
      </div>

      {/* CORE FEATURE: Interactive Evaluation Matrix (Mobile-First Engineered) */}
      <InteractiveEvaluationMatrix
        firmName={firm.name}
        affiliateCode={firm.affiliateCode || 'NATION'}
        affiliateUrl={firm.affiliateUrl}
        websiteUrl={firm.websiteUrl}
        firmId={firm.id}
      />

      {/* Step-by-Step Guide: How to Claim Capital & Cashback */}
      <div className="space-y-5 text-left">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80">
            <Zap className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span>Fast &amp; Automated</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-[900] text-slate-900 dark:text-white tracking-tight">
            How to Claim Your Capital &amp; Cashback On {firm.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Three simple steps to guarantee maximum cashback reward yield into your wallet.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Step 1 */}
          <div className="p-4 sm:p-5 rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#070913] space-y-2.5 shadow-sm">
            <div className="h-9 w-9 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-purple-600/25">
              1
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Purchase with Code NATION
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Visit {firm.name} using our verified link and apply promo code{' '}
              <strong className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                {firm.affiliateCode || 'NATION'}
              </strong>{' '}
              at checkout.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 sm:p-5 rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#070913] space-y-2.5 shadow-sm">
            <div className="h-9 w-9 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-purple-600/25">
              2
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Upload Order ID / Invoice Proof
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Go to your Trader Dashboard, enter your invoice number or account receipt, and submit for automated audit verification.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 sm:p-5 rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#070913] space-y-2.5 shadow-sm">
            <div className="h-9 w-9 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-purple-600/25">
              3
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Redeem Spendable Points
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Get credited 10 PTS per $1 spent within 24 hours. Cash out directly to Crypto (USDT), Bank Wire, or luxury gadgets.
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (Accordion) */}
      <div className="space-y-4 text-left">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-[900] text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Everything you need to know about {firm.name} challenges, points, and redemptions.
          </p>
        </div>

        <div className="space-y-2.5">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-purple-100 dark:border-purple-950/60 bg-white dark:bg-[#070913] overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Eligibility Rules & Important Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-left">
        <Card className="rounded-3xl border-purple-100 dark:border-purple-950/60 p-5 sm:p-6 space-y-3 sm:space-y-4 bg-white dark:bg-[#070913] shadow-xs">
          <CardHeader className="p-0">
            <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <ShieldCheck className="h-5 w-5 text-purple-600" />
              Eligibility Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <p className="leading-relaxed">
              {firm.eligibilityTerms ||
                'Purchases must be made via our direct referral link or with the designated code applied at checkout. Only one points allocation per unique order ID is permitted.'}
            </p>
            <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1 list-disc list-inside">
              <li>Challenge account must be purchased using referral code NATION.</li>
              <li>Order ID must be verified in our affiliate records.</li>
              <li>Duplicate submissions for the same order are strictly prohibited.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-purple-100 dark:border-purple-950/60 p-5 sm:p-6 space-y-3 sm:space-y-4 bg-white dark:bg-[#070913] shadow-xs">
          <CardHeader className="p-0">
            <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Important Terms &amp; Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <p>
              PropNation is an independent affiliate rewards ecosystem and is not affiliated, sponsored, or endorsed by {firm.name} except as an independent affiliate partner.
            </p>
            <p>
              Trading proprietary challenges involves significant risk of loss. Please review {firm.name}&apos;s official trading rules, drawdown parameters, and terms before purchasing.
            </p>
            <p>
              Points are awarded upon verification and can be redeemed for luxury items or crypto/wire payouts.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Final Conversion Bottom Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-950 p-6 sm:p-10 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 max-w-xl">
          <h3 className="text-xl sm:text-2xl font-[900] tracking-tight">
            Ready to Trade With {firm.name}?
          </h3>
          <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
            Apply code <strong className="text-white font-mono">{firm.affiliateCode || 'NATION'}</strong> at checkout to claim guaranteed 10% cashback points and cash out anytime.
          </p>
        </div>

        <div className="flex flex-col xs:flex-row items-center gap-3 w-full sm:w-auto">
          <Button
            size="lg"
            onClick={handleCopyAndVisit}
            className="w-full sm:w-auto bg-white hover:bg-slate-100 text-purple-950 font-black text-xs sm:text-sm h-12 px-6 rounded-2xl shadow-lg"
          >
            <span>Visit {firm.name} Checkout</span>
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
