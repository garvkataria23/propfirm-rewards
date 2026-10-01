'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  Calculator,
  ExternalLink,
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

export default function HomePage() {
  const [propFirms, setPropFirms] = useState<PropFirm[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Calculator state
  const [calcSelectedFirmId, setCalcSelectedFirmId] = useState<string>('');
  const [calcSelectedOfferId, setCalcSelectedOfferId] = useState<string>('');

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    // Load active prop firms and rewards
    api.get<PropFirm[]>('/prop-firms').then((data) => {
      setPropFirms(data);
      if (data.length > 0) {
        setCalcSelectedFirmId(data[0].id);
        if (data[0].offers.length > 0) {
          setCalcSelectedOfferId(data[0].offers[0].id);
        }
      }
    }).catch(console.error);

    api.get<Reward[]>('/rewards', { inStockOnly: true }).then((data) => {
      setRewards(data.slice(0, 4));
    }).catch(console.error);
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const selectedFirm = propFirms.find((p) => p.id === calcSelectedFirmId);
  const selectedOffer = selectedFirm?.offers.find((o) => o.id === calcSelectedOfferId);

  const steps = [
    { num: '01', title: 'Buy with Code', desc: 'Choose a partner prop firm and apply our referral code at checkout.' },
    { num: '02', title: 'Submit Proof', desc: 'Upload your invoice, receipt screenshot, and order ID to your portal.' },
    { num: '03', title: 'Get Verified', desc: 'Our team verifies your purchase against affiliate records within 24h.' },
    { num: '04', title: 'Earn Points', desc: 'Points are immediately and automatically credited to your secure ledger.' },
    { num: '05', title: 'Redeem Rewards', desc: 'Exchange accumulated points for smartphones, monitors, or gift cards.' },
    { num: '06', title: 'Track Delivery', desc: 'Receive real-time courier tracking until the reward arrives at your door.' },
  ];

  const faqs = [
    {
      q: 'How does PropFirm Rewards work?',
      a: 'We partner with leading proprietary trading firms. When you purchase an evaluation or challenge account using our affiliate links or referral discount codes, the prop firm credits us an affiliate commission. Rather than keeping it all, we share this value with you as reward points that you can redeem for tech gear, trading hardware, and gift cards.',
    },
    {
      q: 'Is PropFirm Rewards a prop firm or broker?',
      a: 'No, absolutely not. We do not provide trading capital, financial advice, or brokerage services. We are solely an affiliate loyalty rewards platform.',
    },
    {
      q: 'How long does purchase verification take?',
      a: 'Most purchases are verified and credited with reward points within 12 to 24 hours. Once verified, points are immediately available in your wallet.',
    },
    {
      q: 'Can I submit proof if I forgot to use your code?',
      a: 'Points can only be awarded when our referral code or link was applied during the original purchase, as prop firms only attribute eligible purchases recorded under our affiliate tag.',
    },
    {
      q: 'How are rewards shipped?',
      a: 'Physical electronics and hardware are dispatched brand-new via express couriers (FedEx, UPS, DHL) with signature confirmation and tracking. Digital gift cards are delivered directly to your registered email.',
    },
    {
      q: 'Are points transferable or do they expire?',
      a: 'Your points remain securely stored in your personal points ledger for as long as your account is active. They do not expire.',
    },
  ];

  return (
    <div className="flex flex-col gap-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden bg-grid-pattern">
        {/* Glow gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[300px] bg-blue-500/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The #1 Prop Firm Loyalty & Rewards Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
            Trade. Earn. <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Get Rewarded.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Purchase eligible prop-firm accounts using our referral codes, submit your purchase for verification, earn reward points, and redeem them for real-world rewards.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/prop-firms">
              <Button size="lg" className="w-full sm:w-auto shadow-xl shadow-emerald-500/25">
                Start Earning
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/rewards">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Gift className="h-4 w-4 mr-2 text-emerald-400" />
                Explore Rewards
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 max-w-4xl mx-auto border-t border-slate-800/80">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="text-2xl font-black text-emerald-400">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Verified Payouts</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="text-2xl font-black text-white">&lt; 24h</div>
              <div className="text-xs text-slate-400 mt-0.5">Verification Time</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="text-2xl font-black text-emerald-400">18,000+</div>
              <div className="text-xs text-slate-400 mt-0.5">Max Points / Challenge</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="text-2xl font-black text-white">Express</div>
              <div className="text-xs text-slate-400 mt-0.5">Worldwide Tech Shipping</div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Journey Flow Section (Section 2 from Prompt) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <Badge variant="success">Simple 6-Step Journey</Badge>
          <h2 className="text-3xl font-black text-white tracking-tight">
            How The Rewards System Works
          </h2>
          <p className="text-sm text-slate-400">
            A transparent and seamless process designed to maximize value from every challenge purchase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="relative p-6 rounded-2xl border border-slate-800/80 bg-slate-900/50 card-hover-glow space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  STEP {s.num}
                </span>
                <CheckCircle2 className="h-5 w-5 text-slate-700" />
              </div>
              <h3 className="text-lg font-bold text-white">{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Points Calculator */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-md">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Calculator className="h-4 w-4" />
                <span>Rewards Calculator</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Calculate Your Challenge Reward Points
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Select any prop firm and account challenge tier to see exactly how many points you will earn upon verification.
              </p>

              {/* Form Selectors */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Select Prop Firm</label>
                  <select
                    value={calcSelectedFirmId}
                    onChange={(e) => {
                      setCalcSelectedFirmId(e.target.value);
                      const firm = propFirms.find((p) => p.id === e.target.value);
                      if (firm && firm.offers.length > 0) {
                        setCalcSelectedOfferId(firm.offers[0].id);
                      }
                    }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {propFirms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Select Challenge Size</label>
                  <select
                    value={calcSelectedOfferId}
                    onChange={(e) => setCalcSelectedOfferId(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {selectedFirm?.offers.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.accountTierName} (${o.purchasePriceUsd})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Result Box */}
            <div className="w-full md:w-80 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-6 text-center space-y-4 shadow-xl">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                You Will Earn
              </div>
              <div className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight">
                {selectedOffer ? selectedOffer.rewardPoints.toLocaleString() : '0'}
              </div>
              <div className="text-xs text-slate-400">
                Reward Points credited upon purchase approval
              </div>

              {selectedFirm && (
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="text-xs text-slate-400 mb-2">Referral Code to use:</div>
                  <div className="flex items-center justify-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg">
                    <span className="font-mono font-bold text-sm text-emerald-300">
                      {selectedFirm.affiliateCode}
                    </span>
                    <button
                      onClick={() => handleCopyCode(selectedFirm.affiliateCode)}
                      className="text-slate-400 hover:text-white"
                      title="Copy Code"
                    >
                      {copiedCode === selectedFirm.affiliateCode ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <Link href="/dashboard/purchases/new" className="block pt-2">
                <Button className="w-full" size="sm">
                  Submit This Purchase
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Prop Firms Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge variant="purple">Partner Network</Badge>
            <h2 className="text-3xl font-black text-white tracking-tight mt-2">
              Featured Prop Firms
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Top industry proprietary trading firms with verified point yields.
            </p>
          </div>
          <Link href="/prop-firms">
            <Button variant="outline" size="sm">
              View All Firms
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {propFirms.map((firm) => {
            const maxPoints = firm.offers?.length > 0 ? Math.max(...firm.offers.map((o) => o.rewardPoints)) : 0;
            return (
              <div
                key={firm.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 card-hover-glow space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center overflow-hidden">
                      {firm.logoUrl ? (
                        <img src={firm.logoUrl} alt={firm.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-bold text-white text-lg">{firm.name[0]}</span>
                      )}
                    </div>
                    <Badge variant="success">Up to {maxPoints.toLocaleString()} PTS</Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{firm.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {firm.description}
                    </p>
                  </div>

                  {/* Affiliate code badge */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1.5">
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">
                      Referral Code
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-emerald-400">
                        {firm.affiliateCode}
                      </span>
                      <button
                        onClick={() => handleCopyCode(firm.affiliateCode)}
                        className="rounded p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Copy code"
                      >
                        {copiedCode === firm.affiliateCode ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <a
                    href={firm.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="secondary" size="sm" className="w-full">
                      Visit & Buy
                      <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </a>
                  <Link href={`/prop-firms/${firm.slug}`} className="block">
                    <Button variant="ghost" size="sm" className="w-full text-xs">
                      View Challenge Offers
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Rewards Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge variant="info">Marketplace</Badge>
            <h2 className="text-3xl font-black text-white tracking-tight mt-2">
              Featured Rewards
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Redeem verified points for brand-new electronics, monitors, and gift cards.
            </p>
          </div>
          <Link href="/rewards">
            <Button variant="outline" size="sm">
              Explore Full Catalog
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden card-hover-glow"
            >
              <div className="aspect-video w-full bg-slate-950 overflow-hidden relative">
                <img
                  src={reward.imageUrl}
                  alt={reward.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5">
                  <Badge variant="default" className="bg-slate-950/80 backdrop-blur-md">
                    {reward.category?.name}
                  </Badge>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {reward.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Coins className="h-4 w-4 text-emerald-400" />
                    <span className="text-lg font-black text-emerald-400">
                      {reward.pointsRequired.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400">Points</span>
                  </div>
                </div>

                <Link href={`/rewards/${reward.slug}`} className="block">
                  <Button variant="secondary" size="sm" className="w-full">
                    Redeem Reward
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="outline">Got Questions?</Badge>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-400">
            Everything you need to know about the PropFirm Rewards loyalty program.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-800/80 bg-slate-900/60 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between font-semibold text-white hover:text-emerald-400 transition-colors text-sm sm:text-base"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-slate-400 leading-relaxed border-t border-slate-800/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust & CTA Banner */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900/90 p-8 sm:p-14 text-center space-y-6 overflow-hidden">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
            <Coins className="h-4 w-4" />
            <span>Ready To Upgrade Your Setup?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-2xl mx-auto">
            Turn Every Prop Challenge Into Real-World Rewards
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Create your account in seconds, explore eligible prop firms, and claim the rewards you deserve for your trading purchases.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/register">
              <Button size="lg" className="shadow-lg shadow-emerald-500/20">
                Create Free Trader Account
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/prop-firms">
              <Button variant="outline" size="lg">
                Browse Prop Firms
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
