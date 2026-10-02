'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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

function PropFirmsContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type')?.toLowerCase();

  const [propFirms, setPropFirms] = useState<PropFirm[]>([]);
  const [selectedType, setSelectedType] = useState<string>(
    typeParam === 'cfd' ? 'CFD' : typeParam === 'futures' ? 'FUTURES' : 'ALL'
  );
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        // Tag prop firms as CFD or FUTURES
        const enhanced = data.map((firm) => {
          const nameLower = firm.name.toLowerCase();
          const descLower = firm.description.toLowerCase();
          const isFutures =
            nameLower.includes('topstep') ||
            nameLower.includes('apex') ||
            descLower.includes('futures') ||
            nameLower.includes('futures');

          return {
            ...firm,
            category: (isFutures ? 'FUTURES' : 'CFD') as 'CFD' | 'FUTURES',
          };
        });
        setPropFirms(enhanced);
      })
      .catch((err) => {
        console.warn('Backend unavailable, using catalog fallback:', err);
        setPropFirms([
          {
            id: 'firm-1',
            name: 'FundedSquad',
            slug: 'fundedsquad',
            logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&auto=format&fit=crop&q=80',
            description: 'Elite proprietary firm with instant evaluation pass options, scaling plans up to $1,000,000, and weekly payouts.',
            websiteUrl: 'https://fundedsquad.com',
            affiliateCode: 'PROPNATION',
            affiliateUrl: 'https://fundedsquad.com?ref=PROPNATION',
            eligibilityTerms: 'Valid on all 1-Step and 2-Step evaluation challenges.',
            category: 'CFD',
            offers: [
              { id: 'o-1', accountTierName: '$25K Evaluation Challenge', purchasePriceUsd: 200, rewardPoints: 2000 },
              { id: 'o-2', accountTierName: '$50K Evaluation Challenge', purchasePriceUsd: 350, rewardPoints: 3500 },
              { id: 'o-3', accountTierName: '$100K Evaluation Challenge', purchasePriceUsd: 550, rewardPoints: 5500 },
            ],
          },
          {
            id: 'firm-2',
            name: 'Pipstone Capital',
            slug: 'pipstone-capital',
            logoUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=120&auto=format&fit=crop&q=80',
            description: 'Premium prop trading firm offering raw ECN spreads, high drawdown limits, and bi-weekly revenue splits up to 90%.',
            websiteUrl: 'https://pipstonecapital.com',
            affiliateCode: 'PROPNATION',
            affiliateUrl: 'https://pipstonecapital.com?ref=PROPNATION',
            eligibilityTerms: 'Applies to Standard and Aggressive evaluations.',
            category: 'CFD',
            offers: [
              { id: 'o-4', accountTierName: '$30K Pipstone Standard', purchasePriceUsd: 220, rewardPoints: 2200 },
              { id: 'o-5', accountTierName: '$60K Pipstone Standard', purchasePriceUsd: 380, rewardPoints: 3800 },
              { id: 'o-6', accountTierName: '$100K Pipstone Standard', purchasePriceUsd: 520, rewardPoints: 5200 },
            ],
          },
          {
            id: 'firm-3',
            name: 'FTMO',
            slug: 'ftmo',
            logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&auto=format&fit=crop&q=80',
            description: 'The industry-standard prop trading firm established in 2015. Institutional liquidity, MetaTrader 4/5, and cTrader.',
            websiteUrl: 'https://ftmo.com',
            affiliateCode: 'PROPNATION',
            affiliateUrl: 'https://ftmo.com?ref=PROPNATION',
            eligibilityTerms: 'Eligible for all 2-Step Normal and Aggressive evaluations.',
            category: 'CFD',
            offers: [
              { id: 'o-7', accountTierName: '$50K Evaluation', purchasePriceUsd: 390, rewardPoints: 3900 },
              { id: 'o-8', accountTierName: '$100K Evaluation', purchasePriceUsd: 600, rewardPoints: 6000 },
              { id: 'o-9', accountTierName: '$200K Evaluation', purchasePriceUsd: 1180, rewardPoints: 11800 },
            ],
          },
          {
            id: 'firm-4',
            name: 'FundedNext',
            slug: 'fundednext',
            logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&auto=format&fit=crop&q=80',
            description: 'Premier prop firm offering up to 95% profit splits, 15% reward during challenges, and fast payouts.',
            websiteUrl: 'https://fundednext.com',
            affiliateCode: 'PROPNATION',
            affiliateUrl: 'https://fundednext.com?ref=PROPNATION',
            eligibilityTerms: 'Valid on all Stellar 1-Step, 2-Step, and Express challenges.',
            category: 'CFD',
            offers: [
              { id: 'o-10', accountTierName: '$25K Stellar Challenge', purchasePriceUsd: 199, rewardPoints: 1990 },
              { id: 'o-11', accountTierName: '$50K Stellar Challenge', purchasePriceUsd: 299, rewardPoints: 2990 },
              { id: 'o-12', accountTierName: '$100K Stellar Challenge', purchasePriceUsd: 549, rewardPoints: 5490 },
            ],
          },
          {
            id: 'firm-5',
            name: 'Funding Pips',
            slug: 'funding-pips',
            logoUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=120&auto=format&fit=crop&q=80',
            description: 'Built by traders for traders. Tight spreads, fast weekly payouts, and zero time limit evaluation phases.',
            websiteUrl: 'https://fundingpips.com',
            affiliateCode: 'PROPNATION',
            affiliateUrl: 'https://fundingpips.com?ref=PROPNATION',
            eligibilityTerms: 'Valid on all 1-Step and 2-Step evaluations.',
            category: 'CFD',
            offers: [
              { id: 'o-13', accountTierName: '$25K Evaluation 2-Step', purchasePriceUsd: 139, rewardPoints: 1390 },
              { id: 'o-14', accountTierName: '$50K Evaluation 2-Step', purchasePriceUsd: 239, rewardPoints: 2390 },
              { id: 'o-15', accountTierName: '$100K Evaluation 2-Step', purchasePriceUsd: 399, rewardPoints: 3990 },
            ],
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filteredFirms = propFirms.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase()) ||
      f.affiliateCode.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      selectedType === 'ALL' ? true : f.category === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <Badge variant="purple">Verified Partner Catalog</Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
            Eligible Prop Firms & Offers
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Choose an eligible prop firm below, apply our exclusive referral code at checkout, and submit your purchase to earn verified reward points.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search prop firm or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Type Filter Buttons (ALL, CFD, FUTURES) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3">
        {[
          { key: 'ALL', label: 'All Prop Firms', icon: Layers },
          { key: 'CFD', label: 'CFD Firms', icon: Landmark },
          { key: 'FUTURES', label: 'Futures Firms', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedType(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedType === tab.key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-slate-200/60 dark:bg-slate-900/50 animate-pulse border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      ) : filteredFirms.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Layers className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto" />
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

            return (
              <Card
                key={firm.id}
                className="flex flex-col justify-between p-6 sm:p-7 card-hover-glow space-y-6 bg-white dark:bg-[#070e20] border-slate-200 dark:border-[#14234b]/60 shadow-xs"
              >
                <div className="space-y-5">
                  {/* Header info */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                        {firm.logoUrl ? (
                          <img src={firm.logoUrl} alt={firm.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xl font-black text-slate-900 dark:text-white">{firm.name[0]}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{firm.name}</h2>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              firm.category === 'FUTURES'
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                                : 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                            }`}
                          >
                            {firm.category}
                          </span>
                        </div>
                        <a
                          href={firm.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-1 mt-0.5"
                        >
                          <span>{firm.websiteUrl.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    <Badge variant="success">Up to {maxPoints.toLocaleString()} PTS</Badge>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{firm.description}</p>

                  {/* Referral Code Box */}
                  <div className="rounded-xl border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-950/20 p-3.5 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider font-bold text-blue-700 dark:text-blue-400">
                        Referral / Affiliate Code
                      </div>
                      <div className="font-mono text-base font-black text-slate-900 dark:text-white mt-0.5">
                        {firm.affiliateCode}
                      </div>
                    </div>
                    <Button
                      variant={copiedCode === firm.affiliateCode ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleCopyCode(firm.affiliateCode)}
                    >
                      {copiedCode === firm.affiliateCode ? (
                        <>
                          <Check className="h-4 w-4 mr-1.5 text-slate-950" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1.5" />
                          Get Code
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Available Challenge Tiers Preview */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Available Challenge Offers & Points
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {firm.offers?.slice(0, 6).map((offer) => (
                        <div
                          key={offer.id}
                          className="rounded-lg bg-slate-50 dark:bg-[#060b18] border border-slate-200 dark:border-[#14234b]/60 p-2.5 text-center space-y-1"
                        >
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                            {offer.accountTierName}
                          </div>
                          <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            +{offer.rewardPoints.toLocaleString()} PTS
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {firm.eligibilityTerms && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/50">
                      <strong className="text-slate-800 dark:text-slate-300">Eligibility Terms:</strong> {firm.eligibilityTerms}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                  <a
                    href={firm.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="secondary" size="sm" className="w-full">
                      Visit & Buy
                      <ExternalLink className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </a>
                  <Link href={`/prop-firms/${firm.slug}`} className="block">
                    <Button variant="outline" size="sm" className="w-full">
                      Full Offer Details
                    </Button>
                  </Link>
                  <Link
                    href={`/dashboard/purchases/new?propFirmId=${firm.id}`}
                    className="block sm:col-span-1"
                  >
                    <Button variant="primary" size="sm" className="w-full bg-blue-600 hover:bg-blue-500">
                      Submit Purchase
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PropFirmsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading catalog...</div>}>
      <PropFirmsContent />
    </Suspense>
  );
}
