'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Layers,
  Copy,
  Check,
  ExternalLink,
  Coins,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
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
  offers: PropFirmOffer[];
}

export default function PropFirmDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [firm, setFirm] = useState<PropFirm | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (slug) {
      api
        .get<PropFirm>(`/prop-firms/${slug}`)
        .then((data) => setFirm(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const handleCopyCode = () => {
    if (firm) {
      navigator.clipboard.writeText(firm.affiliateCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-slate-400">
        Loading prop firm details...
      </div>
    );
  }

  if (!firm) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Prop Firm Not Found</h2>
        <Link href="/prop-firms">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Prop Firms
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      {/* Back button */}
      <div>
        <Link
          href="/prop-firms"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Prop Firms</span>
        </Link>
      </div>

      {/* Hero Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 sm:p-10 card-hover-glow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
              {firm.logoUrl ? (
                <img src={firm.logoUrl} alt={firm.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-white">{firm.name[0]}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black text-white">{firm.name}</h1>
                <Badge variant="success">Verified Partner</Badge>
              </div>
              <a
                href={firm.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-400 hover:text-emerald-400 inline-flex items-center gap-1 mt-1"
              >
                <span>{firm.websiteUrl}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a href={firm.affiliateUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="shadow-lg shadow-emerald-500/20">
                Purchase on {firm.name}
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </a>
            <Link href={`/dashboard/purchases/new?propFirmId=${firm.id}`}>
              <Button variant="outline" size="lg">
                Submit Purchase Proof
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
          {firm.description}
        </p>

        {/* Affiliate / Referral Code Banner */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
              Exclusive Referral / Discount Code
            </span>
            <p className="text-xs text-slate-400">
              Apply this code during checkout on {firm.name} to become eligible for reward points.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="font-mono text-xl font-black text-white bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl">
              {firm.affiliateCode}
            </div>
            <Button
              variant={copiedCode ? 'primary' : 'secondary'}
              onClick={handleCopyCode}
            >
              {copiedCode ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
              {copiedCode ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
      </div>

      {/* Challenge Offers & Points Table */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Challenge Options & Reward Points Table
        </h2>
        <p className="text-sm text-slate-400">
          The table below indicates the points credited to your ledger for each approved account challenge tier.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Account / Challenge Tier</th>
                <th className="px-6 py-4">Purchase Price</th>
                <th className="px-6 py-4">Reward Points Earned</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {firm.offers?.map((offer) => (
                <tr key={offer.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white">
                    {offer.accountTierName}
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    ${offer.purchasePriceUsd.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                      <Coins className="h-4 w-4" />
                      <span>+{offer.rewardPoints.toLocaleString()} Points</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/purchases/new?propFirmId=${firm.id}&offerId=${offer.id}`}
                    >
                      <Button variant="outline" size="sm">
                        Submit Proof
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Eligibility Rules & Important Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              Eligibility Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm text-slate-300">
            <p className="leading-relaxed">
              {firm.eligibilityTerms ||
                'Purchases must be made via our direct referral link or with the designated code applied at checkout. Only one points allocation per unique order ID is permitted.'}
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400 pt-2 list-disc list-inside">
              <li>Challenge account must be purchased within the last 14 days.</li>
              <li>Order ID must be verified in our affiliate records.</li>
              <li>Duplicate submissions for the same order are strictly prohibited.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="space-y-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              Important Terms & Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-400 leading-relaxed">
            <p>
              PropFirm Rewards is an affiliate rewards platform and is not affiliated, sponsored, or endorsed by {firm.name} except as an independent affiliate partner.
            </p>
            <p>
              Trading proprietary challenges involves significant risk of loss. Please review {firm.name}&apos;s official trading rules, drawdown parameters, and terms before purchasing.
            </p>
            <p>
              Points are awarded upon verification and cannot be redeemed for fiat cash.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
