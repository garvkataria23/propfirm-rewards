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
            name: 'FundedNext',
            slug: 'fundednext',
            logoUrl: '',
            description: 'Premier CFD prop firm offering up to 95% profit splits, no time limit challenges, and reliable bi-weekly payouts.',
            websiteUrl: 'https://fundednext.com',
            affiliateCode: 'PROPNATION',
            affiliateUrl: 'https://fundednext.com?ref=PROPNATION',
            eligibilityTerms: 'Valid on all Stellar 1-Step, 2-Step, and Express challenges.',
            category: 'CFD',
            offers: [
              { id: 'o-1', accountTierName: '$25K Stellar Challenge', purchasePriceUsd: 199, rewardPoints: 1250 },
              { id: 'o-2', accountTierName: '$50K Stellar Challenge', purchasePriceUsd: 299, rewardPoints: 2500 },
              { id: 'o-3', accountTierName: '$100K Stellar Challenge', purchasePriceUsd: 549, rewardPoints: 5000 },
            ],
          },
          {
            id: 'firm-2',
            name: 'FTMO',
            slug: 'ftmo',
            logoUrl: '',
            description: 'The industry-standard prop trading firm established in 2015. Institutional liquidity, MetaTrader 4/5, and cTrader.',
            websiteUrl: 'https://ftmo.com',
            affiliateCode: 'PROPNATION',
            affiliateUrl: 'https://ftmo.com?ref=PROPNATION',
            eligibilityTerms: 'Eligible for all 2-Step Normal and Aggressive evaluations.',
            category: 'CFD',
            offers: [
              { id: 'o-4', accountTierName: '$50K Evaluation', purchasePriceUsd: 380, rewardPoints: 2000 },
              { id: 'o-5', accountTierName: '$100K Evaluation', purchasePriceUsd: 590, rewardPoints: 4500 },
              { id: 'o-6', accountTierName: '$200K Evaluation', purchasePriceUsd: 1150, rewardPoints: 9000 },
            ],
          },
          {
            id: 'firm-3',
            name: 'The5ers',
            slug: 'the5ers',
            logoUrl: '',
            description: 'Growth and scaling programs designed for serious traders, scaling up to $4,000,000 in funded capital.',
            websiteUrl: 'https://the5ers.com',
            affiliateCode: 'PROPNATION',
            affiliateUrl: 'https://the5ers.com?ref=PROPNATION',
            eligibilityTerms: 'Applies to High Stakes, Hyper Growth, and Bootcamp programs.',
            category: 'CFD',
            offers: [
              { id: 'o-7', accountTierName: '$20K High Stakes', purchasePriceUsd: 175, rewardPoints: 1000 },
              { id: 'o-8', accountTierName: '$60K High Stakes', purchasePriceUsd: 395, rewardPoints: 3000 },
              { id: 'o-9', accountTierName: '$100K High Stakes', purchasePriceUsd: 495, rewardPoints: 4000 },
            ],
          },
          {
            id: 'firm-4',
            name: 'Topstep',
            slug: 'topstep',
            logoUrl: '',
            description: 'The premier Futures prop firm trading CME, CBOT, NYMEX, and COMEX contracts with TradingView & NinjaTrader.',
            websiteUrl: 'https://topstep.com',
            affiliateCode: 'PROPNATION',
            affiliateUrl: 'https://topstep.com?ref=PROPNATION',
            eligibilityTerms: 'Valid on 50K, 100K, and 150K Trading Combine evaluations.',
            category: 'FUTURES',
            offers: [
              { id: 'o-10', accountTierName: '50K Trading Combine', purchasePriceUsd: 49, rewardPoints: 500 },
              { id: 'o-11', accountTierName: '100K Trading Combine', purchasePriceUsd: 99, rewardPoints: 1200 },
              { id: 'o-12', accountTierName: '150K Trading Combine', purchasePriceUsd: 149, rewardPoints: 2000 },
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
