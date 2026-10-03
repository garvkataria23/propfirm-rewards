'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Layers,
  Search,
  Copy,
  Check,
  ExternalLink,
  Coins,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Landmark,
  Sparkles,
  CheckCircle2,
  Globe,
  Tag,
} from 'lucide-react';
import { AutoApplyModal, AutoApplyFirmData } from '@/components/prop-firms/auto-apply-modal';

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

const FALLBACK_FIRMS: PropFirm[] = [
  {
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
  {
    id: 'firm-2',
    name: 'Pipstone Capital',
    slug: 'pipstone-capital',
    logoUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=120&auto=format&fit=crop&q=80',
    description: 'Premium prop trading firm offering raw ECN spreads, high drawdown limits, and bi-weekly revenue splits up to 90%.',
    websiteUrl: 'https://trader.pipstonecapital.com/guest-checkout',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://trader.pipstonecapital.com/guest-checkout?model=2-step&balance=100000&type=standard&coupon=NATION&affId=NATION',
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
  {
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
  {
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
  {
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
];

function PropFirmsContent() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type')?.toLowerCase();

  // Redirect signed-in users to in-dashboard prop-firms
  useEffect(() => {
    if (!isLoading && user && pathname === '/prop-firms') {
      const q = typeof window !== 'undefined' ? window.location.search : '';
      router.replace(`/dashboard/prop-firms${q}`);
    }
  }, [user, isLoading, pathname, router]);

  const [propFirms, setPropFirms] = useState<PropFirm[]>(FALLBACK_FIRMS);
  const [selectedType, setSelectedType] = useState<string>(
    typeParam === 'cfd' ? 'CFD' : typeParam === 'futures' ? 'FUTURES' : 'ALL'
  );
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeParam === 'cfd') {
      setSelectedType('CFD');
    } else if (typeParam === 'futures') {
      setSelectedType('FUTURES');
    }
  }, [typeParam]);

  useEffect(() => {
    api
      .get<PropFirm[]>('/prop-firms')
      .then((data) => {
        if (data && data.length > 0) {
          const enhanced = data.map((firm) => {
            const nameLower = firm.name.toLowerCase();
            const descLower = firm.description.toLowerCase();
            const isFutures =
              nameLower.includes('topstep') ||
              nameLower.includes('apex') ||
              descLower.includes('futures');

            return {
              ...firm,
              affiliateCode: firm.affiliateCode || 'NATION',
              category: (isFutures ? 'FUTURES' : 'CFD') as 'CFD' | 'FUTURES',
            };
          });
          setPropFirms(enhanced);
        }
      })
      .catch((err) => {
        console.warn('Using verified catalog fallback:', err);
      });
  }, []);

  const [activeAutoApplyFirm, setActiveAutoApplyFirm] = useState<AutoApplyFirmData | null>(null);
  const [isAutoApplyModalOpen, setIsAutoApplyModalOpen] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleTriggerAutoApply = (firm: PropFirm) => {
    setActiveAutoApplyFirm({
      id: firm.id,
      name: firm.name,
      slug: firm.slug,
      logoUrl: firm.logoUrl,
      affiliateCode: firm.affiliateCode || 'NATION',
      affiliateUrl: firm.affiliateUrl,
      websiteUrl: firm.websiteUrl,
    });
    setIsAutoApplyModalOpen(true);
  };

  const filteredFirms = propFirms.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase()) ||
      f.websiteUrl.toLowerCase().includes(search.toLowerCase()) ||
      f.affiliateCode.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      selectedType === 'ALL' ? true : f.category === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* ======================================================== */}
      {/* 1. UNIVERSAL CODE NATION HERO BANNER (Clean White & Light Purple) */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-8 sm:p-10 text-white shadow-xl shadow-purple-500/15">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-purple-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-white border border-white/20">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              <span>Universal Partner Referral Code</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-[900] tracking-tight leading-tight">
              Eligible Prop Firms &amp; Cash Rewards
            </h1>
            <p className="text-sm sm:text-base text-purple-100 font-normal leading-relaxed">
              Use code <strong className="font-mono bg-white/20 px-2 py-0.5 rounded text-white font-bold">NATION</strong> on any of our 5 partner prop firms. Get exclusive checkout discounts and earn <strong>10 Reward Points per $1 spent</strong> redeemable for luxury gadgets or instant USDT.
            </p>
          </div>

          {/* Quick Copy Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/25 rounded-2xl p-5 shrink-0 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200 block">
                Official Universal Code
              </span>
              <span className="font-mono text-3xl font-[900] text-white tracking-widest block">
                NATION
              </span>
              <span className="text-[11px] text-purple-200 block mt-0.5">
                1$ = 10 Reward Points
              </span>
            </div>
            <button
              onClick={() => handleCopyCode('NATION')}
              className="w-full sm:w-auto bg-white text-purple-700 hover:bg-purple-50 font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              {copiedCode === 'NATION' ? (
                <>
                  <Check className="h-4 w-4 text-purple-700" />
                  <span>Code Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-purple-700" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SEARCH & FILTER TOOLBAR */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-100 dark:border-purple-950/40">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-2">
          {[
            { key: 'ALL', label: 'All 5 Prop Firms', icon: Layers },
            { key: 'CFD', label: 'CFD Challenges', icon: Landmark },
            { key: 'FUTURES', label: 'Futures Challenges', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedType(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedType === tab.key
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
          <input
            type="text"
            placeholder="Search prop firm, URL or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-purple-200 dark:border-purple-900/50 bg-white dark:bg-slate-900/90 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/40 focus:outline-none transition-all shadow-xs"
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. PROP FIRMS CATALOG GRID */}
      {/* ======================================================== */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-96 rounded-3xl bg-purple-50/40 dark:bg-slate-900/50 animate-pulse border border-purple-100 dark:border-purple-900/30"
            />
          ))}
        </div>
      ) : filteredFirms.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-purple-50/30 dark:bg-slate-900/40 rounded-3xl border border-purple-100 dark:border-purple-900/40">
          <Layers className="h-12 w-12 text-purple-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No prop firms found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your search criteria or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredFirms.map((firm) => {
            const maxPoints =
              firm.offers && firm.offers.length > 0
                ? Math.max(...firm.offers.map((o) => o.rewardPoints))
                : 0;

            const domain = firm.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

            return (
              <Card
                key={firm.id}
                className="flex flex-col justify-between p-6 sm:p-8 rounded-3xl space-y-6 bg-white dark:bg-[#070913] border-purple-100 dark:border-purple-950/60 shadow-sm hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-800 transition-all duration-300"
              >
                <div className="space-y-5 text-left">
                  {/* Header: Logo, Name, Category & Verified Badge */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-purple-100 to-violet-50 dark:from-purple-950 dark:to-slate-900 border border-purple-200 dark:border-purple-800/80 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                        {firm.logoUrl ? (
                          <img src={firm.logoUrl} alt={firm.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-2xl font-black text-purple-700 dark:text-purple-300">{firm.name[0]}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-[900] text-slate-900 dark:text-white tracking-tight">{firm.name}</h2>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            {firm.category || 'CFD'}
                          </span>
                        </div>

                        {/* Real Official Site Link Prominently Displayed */}
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-xs text-slate-400">Official Site:</span>
                          <a
                            href={firm.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 inline-flex items-center gap-1 underline underline-offset-2"
                            title={`Open official ${firm.name} website`}
                          >
                            <span>{domain}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>

                    <Badge variant="purple" className="shrink-0 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                      Up to {maxPoints.toLocaleString()} PTS
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {firm.description}
                  </p>

                  {/* Referral Code Main Banner (Front and Center) */}
                  <div className="rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 bg-purple-50/70 dark:bg-purple-950/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <Tag className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wider font-extrabold text-purple-700 dark:text-purple-300">
                          Universal Referral Code
                        </div>
                        <div className="font-mono text-xl font-[900] text-purple-950 dark:text-white tracking-wider">
                          {firm.affiliateCode || 'NATION'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        variant={copiedCode === firm.affiliateCode ? 'primary' : 'outline'}
                        size="sm"
                        className="w-full sm:w-auto text-xs font-bold border-purple-300 dark:border-purple-700"
                        onClick={() => handleCopyCode(firm.affiliateCode || 'NATION')}
                      >
                        {copiedCode === firm.affiliateCode ? (
                          <>
                            <Check className="h-3.5 w-3.5 mr-1 text-white" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 mr-1" />
                            Copy Code
                          </>
                        )}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full sm:w-auto text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex items-center justify-center gap-1.5"
                        onClick={() => handleTriggerAutoApply(firm)}
                      >
                        <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                        <span>Auto-Apply &amp; Open</span>
                        <ExternalLink className="h-3.5 w-3.5 ml-0.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Available Challenge Tiers Preview */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Coins className="h-3.5 w-3.5 text-purple-500" />
                      <span>Challenge Pricing &amp; Reward Points</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {firm.offers?.slice(0, 6).map((offer) => (
                        <div
                          key={offer.id}
                          className="rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 p-2.5 text-center space-y-0.5"
                        >
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {offer.accountTierName}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            ${offer.purchasePriceUsd.toLocaleString()} USD
                          </div>
                          <div className="text-xs font-black text-purple-600 dark:text-purple-400">
                            +{offer.rewardPoints.toLocaleString()} PTS
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {firm.eligibilityTerms && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 dark:text-slate-200">Eligibility Terms:</strong> {firm.eligibilityTerms}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 border-t border-purple-100 dark:border-purple-950/50">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-bold border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                    onClick={() => handleTriggerAutoApply(firm)}
                  >
                    <span>Visit &amp; Auto-Apply</span>
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </Button>
                  <Link href={`/prop-firms/${firm.slug}`} className="block">
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold border-slate-200 dark:border-slate-800">
                      Offer Details
                    </Button>
                  </Link>
                  <Link
                    href={`/dashboard/purchases/new?propFirmId=${firm.id}`}
                    className="block"
                  >
                    <Button variant="primary" size="sm" className="w-full text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-600/20">
                      Submit Proof
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 1-Click Referral Code Auto-Apply Modal */}
      <AutoApplyModal
        isOpen={isAutoApplyModalOpen}
        onClose={() => setIsAutoApplyModalOpen(false)}
        firm={activeAutoApplyFirm}
      />
    </div>
  );
}

export default function PropFirmsPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-purple-600 font-semibold">Loading verified prop firm catalog...</div>}>
      <PropFirmsContent />
    </Suspense>
  );
}
